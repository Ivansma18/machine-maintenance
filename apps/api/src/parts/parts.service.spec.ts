import { PartUnit } from '../generated/prisma/client';
import { PartsService } from './parts.service';

describe('PartsService', () => {
  const prisma: any = {
    part: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    inventoryItem: { findUnique: jest.fn(), updateMany: jest.fn() },
    maintenanceLog: { findUnique: jest.fn() },
    maintenanceLogPart: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    $transaction: jest.fn((operation: unknown) =>
      typeof operation === 'function'
        ? operation(prisma)
        : Promise.all(operation as Promise<unknown>[]),
    ),
  };
  const audit = { record: jest.fn() };
  const service = new PartsService(prisma as never, audit as never);
  const context = { actorType: 'USER' as const, actorId: 'user-id', requestId: 'request-id' };

  beforeEach(() => jest.clearAllMocks());

  it('creates a part with its initial inventory and audits it', async () => {
    const created = {
      id: 'part-id',
      sku: 'BELT-01',
      inventory: { quantityOnHand: 4, minimumQuantity: 1 },
    };
    prisma.part.create.mockResolvedValue(created);

    await expect(
      service.create(
        {
          sku: ' BELT-01 ',
          name: 'Drive belt',
          unit: PartUnit.UNIT,
          initialQuantity: 4,
          minimumQuantity: 1,
        },
        context,
      ),
    ).resolves.toEqual({
      ...created,
      inventory: { ...created.inventory, stockState: 'AVAILABLE' },
    });
    expect(prisma.part.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sku: 'BELT-01',
          inventory: expect.objectContaining({
            create: expect.objectContaining({ quantityOnHand: 4 }),
          }),
        }),
      }),
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'part.created', entityId: 'part-id' }),
      prisma,
    );
  });

  it('rejects inventory adjustments that would create negative stock', async () => {
    prisma.inventoryItem.findUnique.mockResolvedValue({
      id: 'inventory-id',
      quantityOnHand: 2,
      part: { id: 'part-id' },
    });
    await expect(
      service.adjustInventory('part-id', { delta: -3, reason: 'Count correction' }, context),
    ).rejects.toThrow('cannot become negative');
    expect(prisma.inventoryItem.updateMany).not.toHaveBeenCalled();
  });

  it('consumes stock and records the maintenance log part in one transaction', async () => {
    prisma.maintenanceLog.findUnique.mockResolvedValue({ id: 'log-id', machineId: 'machine-id' });
    prisma.part.findUnique.mockResolvedValue({
      id: 'part-id',
      isActive: true,
      inventory: { id: 'inventory-id', quantityOnHand: 5, unitCost: 12 },
    });
    prisma.inventoryItem.updateMany.mockResolvedValue({ count: 1 });
    prisma.maintenanceLogPart.create.mockResolvedValue({ id: 'line-id', quantity: 2 });

    await expect(
      service.addToMaintenanceLog(
        'log-id',
        { partId: 'part-id', quantity: 2, notes: 'Replaced belt' },
        context,
      ),
    ).resolves.toEqual({ id: 'line-id', quantity: 2 });
    expect(prisma.inventoryItem.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { quantityOnHand: { decrement: 2 } } }),
    );
    expect(prisma.maintenanceLogPart.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ quantity: 2, unitCostSnapshot: 12 }),
      }),
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'maintenance-log-part.created' }),
      prisma,
    );
  });
});
