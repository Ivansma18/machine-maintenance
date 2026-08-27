import { MaintenancePlansService } from './maintenance-plans.service';

describe('MaintenancePlansService', () => {
  const prisma = {
    machine: { findUnique: jest.fn() },
    maintenancePlan: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
  };
  const service = new MaintenancePlansService(prisma as never, { record: jest.fn() } as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an active plan and returns its calculated schedule', async () => {
    prisma.machine.findUnique.mockResolvedValue({ id: 'machine-id' });
    prisma.maintenancePlan.findFirst.mockResolvedValue(null);
    prisma.maintenancePlan.create.mockResolvedValue({
      id: 'plan-id',
      startsAt: new Date('2026-01-01T00:00:00.000Z'),
      frequencyDays: 30,
      warningDaysBefore: 7,
      maintenanceLogs: [],
    });

    const result = await service.create({
      machineId: 'machine-id',
      name: 'Monthly inspection',
      frequencyDays: 30,
      warningDaysBefore: 7,
      startsAt: '2026-01-01',
    });

    expect(result.nextDueAt).toEqual(new Date('2026-01-31T00:00:00.000Z'));
    expect(prisma.maintenancePlan.create).toHaveBeenCalled();
  });

  it('rejects equivalent active rules for the same machine', async () => {
    prisma.machine.findUnique.mockResolvedValue({ id: 'machine-id' });
    prisma.maintenancePlan.findFirst.mockResolvedValue({ id: 'existing-plan' });

    await expect(
      service.create({
        machineId: 'machine-id',
        name: 'Duplicate monthly inspection',
        frequencyDays: 30,
        warningDaysBefore: 7,
        startsAt: '2026-01-01',
      }),
    ).rejects.toThrow('equivalent active');

    expect(prisma.maintenancePlan.create).not.toHaveBeenCalled();
  });

  it('deactivates a plan without deleting it', async () => {
    prisma.maintenancePlan.findUnique.mockResolvedValue({
      id: 'plan-id',
      machineId: 'machine-id',
      startsAt: new Date('2026-01-01T00:00:00.000Z'),
      frequencyDays: 30,
      warningDaysBefore: 7,
      isActive: true,
    });
    prisma.maintenancePlan.update.mockResolvedValue({
      id: 'plan-id',
      startsAt: new Date('2026-01-01T00:00:00.000Z'),
      frequencyDays: 30,
      warningDaysBefore: 7,
      isActive: false,
      maintenanceLogs: [],
    });

    await service.deactivate('plan-id');

    expect(prisma.maintenancePlan.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'plan-id' },
        data: { isActive: false },
      }),
    );
  });
});
