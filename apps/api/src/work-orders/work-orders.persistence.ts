import { Prisma } from '../generated/prisma/client';
import { CancelWorkOrderDto } from './dto/cancel-work-order.dto';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';

export const workOrderInclude = {
  machine: { include: { category: true } },
  maintenancePlan: { select: { id: true, name: true } },
  assignedTo: { select: { id: true, name: true, username: true } },
  createdBy: { select: { id: true, name: true, username: true } },
} satisfies Prisma.WorkOrderInclude;

export function toWorkOrderCreateData(
  dto: CreateWorkOrderDto,
  dates: { scheduledAt: Date | null; dueAt: Date | null },
): Omit<Prisma.WorkOrderCreateInput, 'createdBy'> {
  return {
    machine: { connect: { id: dto.machineId } },
    maintenancePlan: dto.maintenancePlanId ? { connect: { id: dto.maintenancePlanId } } : undefined,
    title: dto.title,
    description: dto.description,
    type: dto.type,
    priority: dto.priority,
    status: dto.scheduledAt ? 'SCHEDULED' : 'OPEN',
    scheduledAt: dates.scheduledAt,
    dueAt: dates.dueAt,
    assignedTo: dto.assignedToUserId ? { connect: { id: dto.assignedToUserId } } : undefined,
  };
}

export function toWorkOrderUpdateData(
  dto: UpdateWorkOrderDto,
  dates: { scheduledAt: Date | null; dueAt: Date | null },
): Prisma.WorkOrderUpdateInput {
  return {
    maintenancePlan:
      dto.maintenancePlanId === null
        ? { disconnect: true }
        : dto.maintenancePlanId
          ? { connect: { id: dto.maintenancePlanId } }
          : undefined,
    title: dto.title,
    description: dto.description,
    type: dto.type,
    priority: dto.priority,
    scheduledAt: dto.scheduledAt === null ? null : dates.scheduledAt,
    dueAt: dto.dueAt === null ? null : dates.dueAt,
  };
}

export function toWorkOrderCancelData(dto: CancelWorkOrderDto) {
  return { status: 'CANCELLED' as const, cancelledAt: new Date(), cancellationReason: dto.reason };
}
