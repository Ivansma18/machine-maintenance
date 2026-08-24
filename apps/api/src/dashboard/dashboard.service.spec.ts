import { MachineStatus } from '../generated/prisma/client';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  const prisma: Record<string, any> = {
    machine: { count: jest.fn() },
    maintenancePlan: { findMany: jest.fn() },
    notification: { count: jest.fn() },
    maintenanceLog: { findMany: jest.fn() },
    $transaction: jest.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
  };
  const service = new DashboardService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns operational counts and preventive workload', async () => {
    prisma.machine.count
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1);
    prisma.maintenancePlan.findMany.mockResolvedValue([
      {
        startsAt: new Date('2026-01-01T00:00:00.000Z'),
        frequencyDays: 30,
        warningDaysBefore: 7,
        machine: { id: 'machine-id', name: 'Oven 01' },
        maintenanceLogs: [],
      },
    ]);
    prisma.notification.count.mockResolvedValue(3);
    prisma.maintenanceLog.findMany.mockResolvedValue([]);

    const summary = await service.getSummary(new Date('2026-01-25T00:00:00.000Z'));

    expect(summary.machines).toEqual({ total: 12, active: 8, underMaintenance: 2, inactive: 1, retired: 1 });
    expect(summary.maintenance).toEqual({ dueSoon: 1, overdue: 0 });
    expect(summary.openUrgentNotifications).toBe(3);
    expect(summary.recentLogs).toEqual([]);
  });

  it('counts overdue plans at the exact due date', async () => {
    prisma.machine.count.mockResolvedValue(0);
    prisma.maintenancePlan.findMany.mockResolvedValue([
      {
        startsAt: new Date('2026-01-01T00:00:00.000Z'),
        frequencyDays: 30,
        warningDaysBefore: 7,
        machine: { id: 'machine-id', name: 'Oven 01' },
        maintenanceLogs: [],
      },
    ]);
    prisma.notification.count.mockResolvedValue(0);
    prisma.maintenanceLog.findMany.mockResolvedValue([]);

    const summary = await service.getSummary(new Date('2026-01-31T00:00:00.000Z'));

    expect(summary.maintenance).toEqual({ dueSoon: 0, overdue: 1 });
    expect(prisma.machine.count).toHaveBeenCalledWith({ where: { status: MachineStatus.ACTIVE } });
  });
});
