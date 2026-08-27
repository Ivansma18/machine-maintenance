import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MachineStatus, NotificationStatus, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AuditContext } from '../audit/audit.types';
import { CreateMachineDto } from './dto/create-machine.dto';
import { ListMachinesDto } from './dto/list-machines.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { buildMachineProfile, machineInclude, profileMachineInclude } from './machine-profile';
import { buildMachineTimeline } from './machine-timeline';
import {
  handleMachinePersistenceError,
  toMachineCreateData,
  toMachineUpdateData,
} from './machine-mappers';
import type { AuthenticatedIdentity } from '../auth/types/auth.types';
import { mergeMachineScope } from '../authorization/scope-filter';

@Injectable()
export class MachinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateMachineDto, context?: AuditContext) {
    await this.ensureCategoryExists(dto.categoryId);
    if (dto.productionLineId) await this.ensureProductionLineExists(dto.productionLineId);

    try {
      const machine = await this.prisma.machine.create({
        data: toMachineCreateData(dto),
        include: machineInclude,
      });

      if (context) {
        await this.audit.record(
          {
            ...context,
            action: 'machine.created',
            entityType: 'Machine',
            entityId: machine.id,
            after: machine,
          },
          this.prisma,
        );
      }

      return machine;
    } catch (error) {
      handleMachinePersistenceError(error);
    }
  }

  async findAll(query: ListMachinesDto, identity?: AuthenticatedIdentity) {
    const where: Prisma.MachineWhereInput = {
      categoryId: query.categoryId,
      status: query.status,
      criticality: query.criticality,
      location: query.location ? { contains: query.location, mode: 'insensitive' } : undefined,
      OR: query.search
        ? [
            { name: { contains: query.search, mode: 'insensitive' } },
            { serialNumber: { contains: query.search, mode: 'insensitive' } },
            { manufacturer: { contains: query.search, mode: 'insensitive' } },
            { model: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
    };
    const scopedWhere = identity ? mergeMachineScope(where, identity) : where;
    const skip = (query.page - 1) * query.limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.machine.findMany({
        where: scopedWhere,
        include: machineInclude,
        orderBy: [{ status: 'asc' }, { name: 'asc' }],
        skip,
        take: query.limit,
      }),
      this.prisma.machine.count({ where: scopedWhere }),
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

  findCategories() {
    return this.prisma.machineCategory.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true },
    });
  }

  async findProfile(id: string, now = new Date(), identity?: AuthenticatedIdentity) {
    const [machine, recentCriticalFailureCount, openNotificationCount] =
      await this.prisma.$transaction([
        identity
          ? this.prisma.machine.findFirst({
              where: { AND: [{ id }, mergeMachineScope({}, identity)] },
              include: profileMachineInclude,
            })
          : this.prisma.machine.findUnique({ where: { id }, include: profileMachineInclude }),
        this.prisma.maintenanceLog.count({
          where: {
            machineId: id,
            result: 'CRITICAL_FAILURE',
            performedAt: { gte: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) },
          },
        }),
        this.prisma.notification.count({
          where: { machineId: id, status: NotificationStatus.OPEN },
        }),
      ]);

    if (!machine) {
      throw new NotFoundException(`Machine ${id} not found`);
    }

    return buildMachineProfile(machine, now, recentCriticalFailureCount, openNotificationCount);
  }

  async findTimeline(id: string, identity?: AuthenticatedIdentity) {
    const machine = identity
      ? await this.prisma.machine.findFirst({
          where: { AND: [{ id }, mergeMachineScope({}, identity)] },
          select: { id: true, name: true, createdAt: true },
        })
      : await this.prisma.machine.findUnique({
          where: { id },
          select: { id: true, name: true, createdAt: true },
        });

    if (!machine) {
      throw new NotFoundException(`Machine ${id} not found`);
    }

    const [plans, logs, notifications] = await Promise.all([
      this.prisma.maintenancePlan.findMany({
        where: { machineId: id },
        select: { id: true, name: true, isActive: true, createdAt: true, updatedAt: true },
      }),
      this.prisma.maintenanceLog.findMany({
        where: { machineId: id },
        orderBy: [{ performedAt: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          performedAt: true,
          type: true,
          result: true,
          notes: true,
          performedBy: true,
          createdAt: true,
          maintenancePlan: { select: { id: true, name: true } },
        },
      }),
      this.prisma.notification.findMany({
        where: { machineId: id },
        orderBy: [{ createdAt: 'desc' }],
        select: {
          id: true,
          type: true,
          severity: true,
          status: true,
          title: true,
          message: true,
          dueAt: true,
          createdAt: true,
          resolvedAt: true,
          maintenancePlan: { select: { id: true, name: true } },
        },
      }),
    ]);

    const relatedEntityIds = [
      id,
      ...plans.map((plan) => plan.id),
      ...logs.map((log) => log.id),
      ...notifications.map((notification) => notification.id),
    ];
    const audits = await this.prisma.auditEvent.findMany({
      where: { entityId: { in: relatedEntityIds } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        actorType: true,
        actorId: true,
        action: true,
        entityType: true,
        entityId: true,
        reason: true,
        createdAt: true,
      },
    });

    return buildMachineTimeline(machine, plans, logs, notifications, audits);
  }

  async findOne(id: string, identity?: AuthenticatedIdentity) {
    const machine = identity
      ? await this.prisma.machine.findFirst({
          where: { AND: [{ id }, mergeMachineScope({}, identity)] },
          include: machineInclude,
        })
      : await this.prisma.machine.findUnique({ where: { id }, include: machineInclude });

    if (!machine) {
      throw new NotFoundException(`Machine ${id} not found`);
    }

    return machine;
  }

  async update(id: string, dto: UpdateMachineDto, context?: AuditContext) {
    const before = await this.findOne(id);

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }
    if (dto.productionLineId) {
      await this.ensureProductionLineExists(dto.productionLineId);
    }

    try {
      const machine = await this.prisma.machine.update({
        where: { id },
        data: toMachineUpdateData(dto),
        include: machineInclude,
      });

      if (context) {
        await this.audit.record(
          {
            ...context,
            action: 'machine.updated',
            entityType: 'Machine',
            entityId: machine.id,
            before,
            after: machine,
          },
          this.prisma,
        );
      }

      return machine;
    } catch (error) {
      handleMachinePersistenceError(error);
    }
  }

  async deactivate(id: string, context?: AuditContext) {
    const before = await this.findOne(id);

    const machine = await this.prisma.machine.update({
      where: { id },
      data: { status: MachineStatus.RETIRED },
      include: machineInclude,
    });

    if (context) {
      await this.audit.record(
        {
          ...context,
          action: 'machine.retired',
          entityType: 'Machine',
          entityId: machine.id,
          before,
          after: machine,
        },
        this.prisma,
      );
    }

    return machine;
  }

  private async ensureCategoryExists(categoryId: string) {
    const category = await this.prisma.machineCategory.findUnique({ where: { id: categoryId } });

    if (!category) {
      throw new BadRequestException(`Machine category ${categoryId} does not exist`);
    }
  }

  private async ensureProductionLineExists(productionLineId: string) {
    const line = await this.prisma.productionLine.findUnique({
      where: { id: productionLineId },
      select: { id: true },
    });
    if (!line) throw new BadRequestException(`Production line ${productionLineId} does not exist`);
  }
}
