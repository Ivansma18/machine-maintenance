import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MachineStatus, Prisma, WorkOrderStatus } from '../generated/prisma/client';
import { AuditService } from '../audit/audit.service';
import type { AuditContext } from '../audit/audit.types';
import { PrismaService } from '../prisma/prisma.service';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';
import { CancelWorkOrderDto } from './dto/cancel-work-order.dto';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { ListWorkOrdersDto } from './dto/list-work-orders.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import {
  toWorkOrderCancelData,
  toWorkOrderCreateData,
  toWorkOrderUpdateData,
  workOrderInclude,
} from './work-orders.persistence';
import {
  assertCancellationAllowed,
  assertTransitionAllowed,
  assertWorkOrderEditable,
  handleWorkOrderPersistenceError,
  validateWorkOrderDates,
} from './work-orders.rules';

@Injectable()
export class WorkOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateWorkOrderDto, context: AuditContext) {
    const machine = await this.findAvailableMachine(dto.machineId);
    const dates = validateWorkOrderDates(dto.scheduledAt, dto.dueAt);
    await this.ensurePlanBelongsToMachine(dto.maintenancePlanId, dto.machineId);
    await this.ensureActiveUser(dto.assignedToUserId);

    try {
      const workOrder = await this.prisma.workOrder.create({
        data: {
          ...toWorkOrderCreateData(dto, dates),
          createdBy: { connect: { id: context.actorId } },
        },
        include: workOrderInclude,
      });

      await this.audit.record(
        {
          ...context,
          action: 'work-order.created',
          entityType: 'WorkOrder',
          entityId: workOrder.id,
          after: workOrder,
        },
        this.prisma,
      );
      return workOrder;
    } catch (error) {
      handleWorkOrderPersistenceError(error);
    }
  }

  async findAll(query: ListWorkOrdersDto) {
    const where: Prisma.WorkOrderWhereInput = {
      machineId: query.machineId,
      maintenancePlanId: query.maintenancePlanId,
      assignedToUserId: query.assignedToUserId,
      type: query.type,
      priority: query.priority,
      status: query.status,
      dueAt:
        query.dueFrom || query.dueTo
          ? {
              gte: query.dueFrom ? new Date(query.dueFrom) : undefined,
              lte: query.dueTo ? new Date(query.dueTo) : undefined,
            }
          : undefined,
    };
    const skip = (query.page - 1) * query.limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.workOrder.findMany({
        where,
        include: workOrderInclude,
        orderBy: [{ status: 'asc' }, { priority: 'desc' }, { dueAt: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: query.limit,
      }),
      this.prisma.workOrder.count({ where }),
    ]);

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(id: string) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id },
      include: workOrderInclude,
    });
    if (!workOrder) throw new NotFoundException(`Work order ${id} not found`);
    return workOrder;
  }

  async update(id: string, dto: UpdateWorkOrderDto, context: AuditContext) {
    const current = await this.findOne(id);
    assertWorkOrderEditable(current.status);
    const dates = validateWorkOrderDates(
      dto.scheduledAt ?? current.scheduledAt?.toISOString(),
      dto.dueAt ?? current.dueAt?.toISOString(),
    );
    await this.ensurePlanBelongsToMachine(dto.maintenancePlanId, current.machineId);

    const workOrder = await this.prisma.workOrder.update({
      where: { id },
      data: toWorkOrderUpdateData(dto, dates),
      include: workOrderInclude,
    });
    await this.audit.record(
      {
        ...context,
        action: 'work-order.updated',
        entityType: 'WorkOrder',
        entityId: id,
        before: current,
        after: workOrder,
      },
      this.prisma,
    );
    return workOrder;
  }

  async assign(id: string, dto: AssignWorkOrderDto, context: AuditContext) {
    const current = await this.findOne(id);
    assertWorkOrderEditable(current.status);
    await this.ensureActiveUser(dto.assignedToUserId);
    const workOrder = await this.prisma.workOrder.update({
      where: { id },
      data: { assignedTo: { connect: { id: dto.assignedToUserId } } },
      include: workOrderInclude,
    });
    await this.audit.record(
      {
        ...context,
        action: 'work-order.assigned',
        entityType: 'WorkOrder',
        entityId: id,
        before: current,
        after: workOrder,
      },
      this.prisma,
    );
    return workOrder;
  }

  async start(id: string, context: AuditContext) {
    return this.transition(id, WorkOrderStatus.IN_PROGRESS, 'work-order.started', context);
  }

  async complete(id: string, context: AuditContext) {
    return this.transition(id, WorkOrderStatus.COMPLETED, 'work-order.completed', context);
  }

  async cancel(id: string, dto: CancelWorkOrderDto, context: AuditContext) {
    const current = await this.findOne(id);
    assertCancellationAllowed(current.status, id);
    const workOrder = await this.prisma.workOrder.update({
      where: { id },
      data: {
        ...toWorkOrderCancelData(dto),
      },
      include: workOrderInclude,
    });
    await this.audit.record(
      {
        ...context,
        action: 'work-order.cancelled',
        entityType: 'WorkOrder',
        entityId: id,
        reason: dto.reason,
        before: current,
        after: workOrder,
      },
      this.prisma,
    );
    return workOrder;
  }

  private async transition(
    id: string,
    status: WorkOrderStatus,
    action: string,
    context: AuditContext,
  ) {
    const current = await this.findOne(id);
    assertTransitionAllowed(current.status, status, id);
    const workOrder = await this.prisma.workOrder.update({
      where: { id },
      data: { status, completedAt: status === WorkOrderStatus.COMPLETED ? new Date() : undefined },
      include: workOrderInclude,
    });
    await this.audit.record(
      {
        ...context,
        action,
        entityType: 'WorkOrder',
        entityId: id,
        before: current,
        after: workOrder,
      },
      this.prisma,
    );
    return workOrder;
  }

  private async findAvailableMachine(id: string) {
    const machine = await this.prisma.machine.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!machine) throw new BadRequestException(`Machine ${id} does not exist`);
    if (machine.status === MachineStatus.RETIRED)
      throw new BadRequestException('Work orders cannot be created for retired machines');
    return machine;
  }

  private async ensurePlanBelongsToMachine(planId: string | null | undefined, machineId: string) {
    if (!planId) return;
    const plan = await this.prisma.maintenancePlan.findUnique({
      where: { id: planId },
      select: { id: true, machineId: true },
    });
    if (!plan) throw new BadRequestException(`Maintenance plan ${planId} does not exist`);
    if (plan.machineId !== machineId)
      throw new BadRequestException('The maintenance plan does not belong to the selected machine');
  }

  private async ensureActiveUser(userId: string | undefined) {
    if (!userId) return;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true },
    });
    if (!user || !user.isActive) throw new BadRequestException(`User ${userId} is not active`);
  }
}
