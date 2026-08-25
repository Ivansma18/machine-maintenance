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
