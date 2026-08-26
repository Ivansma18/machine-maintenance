import { WorkOrderStatus, WorkOrderType } from '../generated/prisma/client';
import { WorkOrdersService } from './work-orders.service';

describe('WorkOrdersService', () => {
  const prisma = {
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
    $transaction: jest.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
  };
  const audit = { record: jest.fn() };
  const service = new WorkOrdersService(prisma as never, audit as never);
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
});
