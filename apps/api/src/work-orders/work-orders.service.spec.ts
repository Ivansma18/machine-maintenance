import { WorkOrderStatus, WorkOrderType } from '../generated/prisma/client';
import { WorkOrdersService } from './work-orders.service';

describe('WorkOrdersService', () => {
  const prisma: any = {
    machine: { findUnique: jest.fn() },
    maintenancePlan: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    workOrder: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(
      (operations: Promise<unknown>[] | ((tx: never) => Promise<unknown>)): Promise<unknown> =>
        typeof operations === 'function' ? operations(prisma as never) : Promise.all(operations),
    ),
  };
  const audit = { record: jest.fn() };
  const maintenanceLogs = { createInTransaction: jest.fn() };
  const service = new WorkOrdersService(prisma as never, audit as never, maintenanceLogs as never);
  const context = { actorType: 'USER' as const, actorId: 'user-id', requestId: 'request-id' };

  beforeEach(() => jest.clearAllMocks());

  it('creates an open work order for an available machine and audits it', async () => {
    const created = { id: 'order-id', status: WorkOrderStatus.OPEN };
    prisma.machine.findUnique.mockResolvedValue({ id: 'machine-id', status: 'ACTIVE' });
    prisma.workOrder.create.mockResolvedValue(created);

    await expect(
      service.create(
        { machineId: 'machine-id', title: 'Inspect belt', type: WorkOrderType.INSPECTION },
        context,
      ),
    ).resolves.toEqual(created);

    expect(prisma.workOrder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Inspect belt',
          createdBy: { connect: { id: 'user-id' } },
        }),
      }),
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'work-order.created', entityId: 'order-id' }),
      prisma,
    );
  });

  it('rejects cancellation from a terminal state', async () => {
    prisma.workOrder.findUnique.mockResolvedValue({
      id: 'order-id',
      status: WorkOrderStatus.COMPLETED,
    });

    await expect(
      service.cancel('order-id', { reason: 'Duplicate order' }, context),
    ).rejects.toThrow('cannot be cancelled');
    expect(prisma.workOrder.update).not.toHaveBeenCalled();
  });

  it('starts an open work order and audits the transition', async () => {
    prisma.workOrder.findUnique.mockResolvedValue({ id: 'order-id', status: WorkOrderStatus.OPEN });
    prisma.workOrder.update.mockResolvedValue({
      id: 'order-id',
      status: WorkOrderStatus.IN_PROGRESS,
    });

    await service.start('order-id', context);

    expect(prisma.workOrder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: WorkOrderStatus.IN_PROGRESS, completedAt: undefined },
      }),
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'work-order.started' }),
      prisma,
    );
  });

  it('creates a maintenance log and closes the work order atomically', async () => {
    const current = {
      id: 'order-id',
      machineId: 'machine-id',
      type: WorkOrderType.CORRECTIVE,
      status: WorkOrderStatus.IN_PROGRESS,
      maintenancePlan: null,
    };
    prisma.workOrder.findUnique.mockResolvedValue(current);
    prisma.user.findUnique.mockResolvedValue({ name: 'Ada Technician' });
    maintenanceLogs.createInTransaction.mockResolvedValue({ id: 'log-id', result: 'OK' });
    prisma.workOrder.update.mockResolvedValue({
      id: 'order-id',
      status: WorkOrderStatus.COMPLETED,
    });

    const result = await service.complete(
      'order-id',
      { result: 'OK', notes: 'Belt adjusted', performedAt: '2026-08-26T10:00:00.000Z' },
      context,
    );

    expect(maintenanceLogs.createInTransaction).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({ machineId: 'machine-id', performedBy: 'Ada Technician' }),
      context,
    );
    expect(prisma.workOrder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: WorkOrderStatus.COMPLETED }),
      }),
    );
    expect(result.maintenanceLog).toEqual({ id: 'log-id', result: 'OK' });
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'work-order.completed' }),
      prisma,
    );
  });
});
