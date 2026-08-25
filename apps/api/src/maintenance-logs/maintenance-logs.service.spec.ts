import { MaintenanceResult, MaintenanceType } from '../generated/prisma/client';
import { MaintenanceLogsService } from './maintenance-logs.service';

describe('MaintenanceLogsService', () => {
  const prisma: Record<string, any> = {
    machine: { findUnique: jest.fn() },
    maintenancePlan: { findUnique: jest.fn() },
    maintenanceLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    notification: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((operation: unknown) => {
      if (Array.isArray(operation)) {
        return Promise.all(operation as Promise<unknown>[]);
      }

      return (operation as (tx: unknown) => unknown)(prisma);
    }),
  };
  const service = new MaintenanceLogsService(prisma as never, { record: jest.fn() } as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a log associated with a machine and plan', async () => {
    prisma.machine.findUnique.mockResolvedValue({ id: 'machine-id', name: 'Oven 01' });
    prisma.maintenancePlan.findUnique.mockResolvedValue({
      id: 'plan-id',
      machineId: 'machine-id',
    });
    prisma.maintenanceLog.create.mockResolvedValue({ id: 'log-id' });

    await service.create({
      machineId: 'machine-id',
      maintenancePlanId: 'plan-id',
      performedAt: '2026-08-24T10:30:00.000Z',
      type: MaintenanceType.PREVENTIVE,
      result: MaintenanceResult.OK,
      performedBy: 'Technician One',
    });

    expect(prisma.maintenanceLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          maintenancePlan: { connect: { id: 'plan-id' } },
          result: MaintenanceResult.OK,
        }),
      }),
    );
    expect(prisma.notification.create).not.toHaveBeenCalled();
  });

  it('rejects a plan that belongs to another machine', async () => {
    prisma.machine.findUnique.mockResolvedValue({ id: 'machine-id', name: 'Oven 01' });
    prisma.maintenancePlan.findUnique.mockResolvedValue({
      id: 'plan-id',
      machineId: 'another-machine-id',
    });

    await expect(
      service.create({
        machineId: 'machine-id',
        maintenancePlanId: 'plan-id',
        performedAt: '2026-08-24T10:30:00.000Z',
        type: MaintenanceType.CORRECTIVE,
        result: MaintenanceResult.FAILED,
        performedBy: 'Technician One',
      }),
    ).rejects.toThrow('does not belong');

    expect(prisma.maintenanceLog.create).not.toHaveBeenCalled();
  });

  it('creates an urgent critical notification for a critical failure', async () => {
    prisma.machine.findUnique.mockResolvedValue({ id: 'machine-id', name: 'Oven 01' });
    prisma.maintenanceLog.create.mockResolvedValue({ id: 'log-id' });
    prisma.notification.findFirst.mockResolvedValue(null);
    prisma.notification.create.mockResolvedValue({ id: 'notification-id' });

    const result = await service.create({
      machineId: 'machine-id',
      performedAt: '2026-08-24T10:30:00.000Z',
      type: MaintenanceType.CORRECTIVE,
      result: MaintenanceResult.CRITICAL_FAILURE,
      notes: 'Heating chamber exposed a critical fault.',
      performedBy: 'Technician One',
    });

    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'URGENT_CRITICAL_FAILURE',
          severity: 'CRITICAL',
          status: 'OPEN',
        }),
      }),
    );
    expect(result.criticalNotification).toEqual({ id: 'notification-id' });
  });

  it('lists logs with pagination metadata', async () => {
    prisma.maintenanceLog.findMany.mockResolvedValue([{ id: 'log-id' }]);
    prisma.maintenanceLog.count.mockResolvedValue(12);

    const result = await service.findAll({ page: 2, limit: 10, machineId: 'machine-id' });

    expect(result.meta).toEqual({ page: 2, limit: 10, total: 12, totalPages: 2 });
    expect(prisma.maintenanceLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
        where: expect.objectContaining({ machineId: 'machine-id' }),
      }),
    );
  });
});
