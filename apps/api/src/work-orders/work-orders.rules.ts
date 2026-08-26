import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { WorkOrderStatus } from '../generated/prisma/client';

export function validateWorkOrderDates(scheduledAt?: string | null, dueAt?: string | null) {
  const scheduled = scheduledAt ? new Date(scheduledAt) : null;
  const due = dueAt ? new Date(dueAt) : null;
  if (scheduled && Number.isNaN(scheduled.getTime()))
    throw new BadRequestException('scheduledAt must be a valid date');
  if (due && Number.isNaN(due.getTime()))
    throw new BadRequestException('dueAt must be a valid date');
  if (scheduled && due && scheduled > due)
    throw new BadRequestException('scheduledAt cannot be later than dueAt');
  return { scheduledAt: scheduled, dueAt: due };
}

export function assertWorkOrderEditable(status: WorkOrderStatus) {
  const closedStatuses: WorkOrderStatus[] = [WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED];
  if (closedStatuses.includes(status)) {
    throw new ConflictException(`Work order cannot be edited from ${status}`);
  }
}

export function assertTransitionAllowed(
  current: WorkOrderStatus,
  target: WorkOrderStatus,
  id: string,
) {
  const allowed: WorkOrderStatus[] =
    target === WorkOrderStatus.IN_PROGRESS
      ? [WorkOrderStatus.OPEN, WorkOrderStatus.SCHEDULED]
      : [WorkOrderStatus.IN_PROGRESS];
  if (!allowed.includes(current))
    throw new ConflictException(`Work order ${id} cannot transition from ${current} to ${target}`);
}

export function assertCancellationAllowed(status: WorkOrderStatus, id: string) {
  const cancellable: WorkOrderStatus[] = [
    WorkOrderStatus.OPEN,
    WorkOrderStatus.SCHEDULED,
    WorkOrderStatus.IN_PROGRESS,
  ];
  if (!cancellable.includes(status))
    throw new ConflictException(`Work order ${id} cannot be cancelled from ${status}`);
}

export function handleWorkOrderPersistenceError(error: unknown): never {
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
    throw new NotFoundException('Work order not found');
  }
  throw error;
}
