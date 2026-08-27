import { MachineStatus } from '../generated/prisma/client';
import { MachinesService } from './machines.service';

describe('MachinesService', () => {
  const prisma = {
    machineCategory: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    machine: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    maintenanceLog: { count: jest.fn(), findMany: jest.fn() },
    maintenancePlan: { findMany: jest.fn() },
    auditEvent: { findMany: jest.fn() },
    notification: { count: jest.fn(), findMany: jest.fn() },
    $transaction: jest.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
  };
  const service = new MachinesService(prisma as never, { record: jest.fn() } as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a machine connected to an existing category', async () => {
    prisma.machineCategory.findUnique.mockResolvedValue({ id: 'category-id' });
    prisma.machine.create.mockResolvedValue({ id: 'machine-id' });

    await service.create({
      categoryId: 'category-id',
      name: 'Deck Oven 01',
      location: 'Production floor',
      installedAt: '2026-01-15',
    });

    expect(prisma.machine.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Deck Oven 01',
          installedAt: new Date('2026-01-15T00:00:00.000Z'),
          category: { connect: { id: 'category-id' } },
        }),
      }),
    );
  });

  it('returns filtered machines with pagination metadata', async () => {
    prisma.machine.findMany.mockResolvedValue([{ id: 'machine-id' }]);
    prisma.machine.count.mockResolvedValue(21);

    const result = await service.findAll({
      page: 2,
      limit: 10,
      location: 'Production',
      status: MachineStatus.ACTIVE,
    });

    expect(result.meta).toEqual({ page: 2, limit: 10, total: 21, totalPages: 3 });
    expect(prisma.machine.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
        where: expect.objectContaining({
          location: { contains: 'Production', mode: 'insensitive' },
          status: MachineStatus.ACTIVE,
        }),
      }),
    );
  });

  it('builds a machine profile with health metrics and recent activity', async () => {
    const now = new Date('2026-08-25T00:00:00.000Z');
    const machine = {
      id: 'machine-id',
      categoryId: 'category-id',
      category: { id: 'category-id', name: 'Oven', description: null },
      name: 'Deck Oven 01',
      serialNumber: 'OV-01',
      location: 'Production floor',
      manufacturer: 'Bakery Systems',
      model: 'D-100',
      status: MachineStatus.ACTIVE,
      criticality: 'HIGH',
      installedAt: new Date('2025-01-01T00:00:00.000Z'),
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-08-20T00:00:00.000Z'),
      maintenancePlans: [
        {
          id: 'plan-id',
          machineId: 'machine-id',
          machine: { id: 'machine-id', name: 'Deck Oven 01' },
          name: 'Monthly inspection',
          description: null,
          frequencyDays: 30,
          warningDaysBefore: 7,
          isActive: true,
          startsAt: new Date('2026-08-01T00:00:00.000Z'),
          lastComputedDueAt: null,
          createdAt: new Date('2026-08-01T00:00:00.000Z'),
          updatedAt: new Date('2026-08-01T00:00:00.000Z'),
          maintenanceLogs: [],
        },
      ],
      maintenanceLogs: [
        {
          id: 'log-id',
          performedAt: new Date('2026-08-20T00:00:00.000Z'),
          type: 'CORRECTIVE',
          result: 'OK',
          notes: 'Adjusted the door sensor.',
          maintenancePlan: null,
        },
      ],
      notifications: [
        {
          id: 'notification-id',
          machineId: 'machine-id',
          maintenancePlanId: 'plan-id',
          type: 'PREVENTIVE_DUE_SOON',
          severity: 'WARNING',
          status: 'OPEN',
          title: 'Inspection due soon',
          message: 'The inspection is approaching.',
          dueAt: new Date('2026-08-31T00:00:00.000Z'),
          createdAt: new Date('2026-08-24T00:00:00.000Z'),
          resolvedAt: null,
          maintenancePlan: { id: 'plan-id', name: 'Monthly inspection' },
        },
      ],
    };
    prisma.machine.findUnique.mockResolvedValue(machine);
    prisma.maintenanceLog.count.mockResolvedValue(0);
    prisma.notification.count.mockResolvedValue(1);

    const result = await service.findProfile('machine-id', now);

    expect(result.health).toEqual({
      lastMaintenanceAt: new Date('2026-08-20T00:00:00.000Z'),
      daysSinceLastMaintenance: 5,
      nextMaintenanceAt: new Date('2026-08-31T00:00:00.000Z'),
      overduePreventiveCount: 0,
      openNotificationCount: 1,
      recentCriticalFailureCount: 0,
    });
    expect(result.maintenancePlans[0]).toEqual(
      expect.objectContaining({ isDueSoon: true, isOverdue: false }),
    );
    expect(result.activity[0]).toEqual(
      expect.objectContaining({ id: 'notification-notification-id', kind: 'NOTIFICATION' }),
    );
  });

  it('returns not found for a missing machine profile', async () => {
    prisma.machine.findUnique.mockResolvedValue(null);
    prisma.maintenanceLog.count.mockResolvedValue(0);
    prisma.notification.count.mockResolvedValue(0);

    await expect(service.findProfile('missing-machine')).rejects.toThrow(
      'Machine missing-machine not found',
    );
  });

  it('returns a unified machine timeline with operational and audit events', async () => {
    const createdAt = new Date('2026-08-01T10:00:00.000Z');
    prisma.machine.findUnique.mockResolvedValue({
      id: 'machine-id',
      name: 'Deck Oven 01',
      createdAt,
    });
    prisma.maintenancePlan.findMany.mockResolvedValue([
      {
        id: 'plan-id',
        name: 'Monthly inspection',
        isActive: true,
        createdAt: new Date('2026-08-01T09:00:00.000Z'),
        updatedAt: new Date('2026-08-01T09:00:00.000Z'),
      },
    ]);
    prisma.maintenanceLog.findMany.mockResolvedValue([
      {
        id: 'log-id',
        performedAt: new Date('2026-08-03T10:00:00.000Z'),
        type: 'PREVENTIVE',
        result: 'OK',
        notes: 'Completed.',
        performedBy: 'Technician',
        createdAt,
        maintenancePlan: { id: 'plan-id', name: 'Monthly inspection' },
      },
    ]);
    prisma.notification.findMany.mockResolvedValue([]);
    prisma.auditEvent.findMany.mockResolvedValue([
      {
        id: 'audit-id',
        actorType: 'USER',
        actorId: 'user-id',
        action: 'machine.updated',
        entityType: 'Machine',
        entityId: 'machine-id',
        reason: 'Updated location.',
        createdAt: new Date('2026-08-04T10:00:00.000Z'),
      },
    ]);

    const result = await service.findTimeline('machine-id');

    expect(result.meta).toEqual({ total: 4, limit: 4, hasMore: false });
    expect(result.data.map((event) => event.kind)).toEqual([
      'AUDIT',
      'MAINTENANCE',
      'MACHINE',
      'PLAN',
    ]);
    expect(prisma.auditEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { entityId: { in: ['machine-id', 'plan-id', 'log-id'] } } }),
    );
  });

  it('returns machine categories ordered by name', async () => {
    prisma.machineCategory.findMany.mockResolvedValue([{ id: 'category-id', name: 'Mixer' }]);

    await expect(service.findCategories()).resolves.toEqual([{ id: 'category-id', name: 'Mixer' }]);
    expect(prisma.machineCategory.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true },
    });
  });

  it('deactivates a machine by moving it to RETIRED', async () => {
    prisma.machine.findUnique.mockResolvedValue({ id: 'machine-id' });
    prisma.machine.update.mockResolvedValue({ id: 'machine-id', status: MachineStatus.RETIRED });

    await service.deactivate('machine-id');

    expect(prisma.machine.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'machine-id' },
        data: { status: MachineStatus.RETIRED },
      }),
    );
  });

  it('rejects creation when the category does not exist', async () => {
    prisma.machineCategory.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        categoryId: 'missing-category',
        name: 'Mixer 01',
        location: 'Production floor',
      }),
    ).rejects.toThrow('does not exist');

    expect(prisma.machine.create).not.toHaveBeenCalled();
  });
});
