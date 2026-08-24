import {
  MachineCriticality,
  NotificationStatus,
  NotificationType,
} from '../generated/prisma/client';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  const prisma: Record<string, any> = {
    maintenancePlan: {
      findMany: jest.fn(),
    },
    notification: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((operation: unknown) => {
      if (Array.isArray(operation)) {
        return Promise.all(operation as Promise<unknown>[]);
      }

      return (operation as (tx: unknown) => unknown)(prisma);
    }),
  };
  const service = new NotificationsService(prisma as never);

  const plan = {
    id: 'plan-id',
    startsAt: new Date('2026-01-01T00:00:00.000Z'),
    frequencyDays: 30,
    warningDaysBefore: 7,
    machine: { id: 'machine-id', name: 'Oven 01', criticality: MachineCriticality.MEDIUM },
    maintenanceLogs: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a due-soon notification inside the warning window', async () => {
    prisma.maintenancePlan.findMany.mockResolvedValue([plan]);
    prisma.notification.findMany.mockResolvedValue([]);
    prisma.notification.create.mockResolvedValue({ id: 'notification-id' });

    const result = await service.processPreventiveNotifications(
      new Date('2026-01-25T00:00:00.000Z'),
    );

    expect(result).toEqual({ processedPlans: 1, created: 1, updated: 0, resolved: 0 });
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: NotificationType.PREVENTIVE_DUE_SOON,
          severity: 'WARNING',
          status: NotificationStatus.OPEN,
        }),
      }),
    );
  });

  it('updates an existing overdue notification instead of duplicating it', async () => {
    prisma.maintenancePlan.findMany.mockResolvedValue([
      { ...plan, machine: { ...plan.machine, criticality: MachineCriticality.CRITICAL } },
    ]);
    prisma.notification.findMany.mockResolvedValue([
      { id: 'notification-id', type: NotificationType.PREVENTIVE_OVERDUE },
    ]);

    const result = await service.processPreventiveNotifications(
      new Date('2026-02-01T00:00:00.000Z'),
    );

    expect(result).toEqual({ processedPlans: 1, created: 0, updated: 1, resolved: 0 });
    expect(prisma.notification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'notification-id' },
        data: expect.objectContaining({ severity: 'CRITICAL' }),
      }),
    );
    expect(prisma.notification.create).not.toHaveBeenCalled();
  });

  it('does not update an unchanged notification on a repeated run', async () => {
    prisma.maintenancePlan.findMany.mockResolvedValue([plan]);
    prisma.notification.findMany.mockResolvedValue([
      {
        id: 'notification-id',
        type: NotificationType.PREVENTIVE_OVERDUE,
        severity: 'URGENT',
        title: 'Preventive maintenance overdue',
        message: 'The preventive maintenance plan has exceeded its due date.',
        dueAt: new Date('2026-01-31T00:00:00.000Z'),
      },
    ]);

    const result = await service.processPreventiveNotifications(
      new Date('2026-02-01T00:00:00.000Z'),
    );

    expect(result.updated).toBe(0);
    expect(prisma.notification.update).not.toHaveBeenCalled();
  });

  it('resolves open preventive notifications before the warning window', async () => {
    prisma.maintenancePlan.findMany.mockResolvedValue([plan]);
    prisma.notification.findMany.mockResolvedValue([
      { id: 'notification-id', type: NotificationType.PREVENTIVE_DUE_SOON },
    ]);
    prisma.notification.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.processPreventiveNotifications(
      new Date('2026-01-10T00:00:00.000Z'),
    );

    expect(result.resolved).toBe(1);
    expect(prisma.notification.updateMany).toHaveBeenCalled();
  });

  it('allows acknowledging an open notification', async () => {
    prisma.notification.findUnique.mockResolvedValue({
      id: 'notification-id',
      status: NotificationStatus.OPEN,
    });
    prisma.notification.update.mockResolvedValue({
      id: 'notification-id',
      status: NotificationStatus.ACKNOWLEDGED,
    });

    await service.acknowledge('notification-id');

    expect(prisma.notification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'notification-id' },
        data: expect.objectContaining({ status: NotificationStatus.ACKNOWLEDGED }),
      }),
    );
  });
});
