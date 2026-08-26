import { PartUnit } from '../generated/prisma/client';
import { AuditService } from '../audit/audit.service';
import { InventoryService } from './inventory.service';
import { MaintenanceLogPartsService } from './maintenance-log-parts.service';
import { PartsCatalogService } from './parts-catalog.service';

describe('Parts services', () => {
  const prisma: any = {
    part: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    inventoryItem: { findUnique: jest.fn(), updateMany: jest.fn() },
    maintenanceLog: { findUnique: jest.fn(), findMany: jest.fn() },
    maintenanceLogPart: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    $transaction: jest.fn((operation: unknown) =>
      typeof operation === 'function'
        ? operation(prisma)
        : Promise.all(operation as Promise<unknown>[]),
    ),
  };
  const audit = { record: jest.fn() } as unknown as AuditService;
  const catalog = new PartsCatalogService(prisma as never, audit);
  const inventory = new InventoryService(prisma as never, audit);
  const logParts = new MaintenanceLogPartsService(prisma as never, audit);
  const context = { actorType: 'USER' as const, actorId: 'user-id', requestId: 'request-id' };

  beforeEach(() => jest.clearAllMocks());

  it('creates a catalog part with initial inventory', async () => {
    const created = {
      id: 'part-id',
      sku: 'BELT-01',
      inventory: { quantityOnHand: 4, minimumQuantity: 1 },
    };
    prisma.part.create.mockResolvedValue(created);
    await expect(
      catalog.create(
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
        data: expect.objectContaining({ sku: 'BELT-01', inventory: expect.anything() }),
      }),
    );
  });

  it('rejects an inventory adjustment that would create negative stock', async () => {
    prisma.inventoryItem.findUnique.mockResolvedValue({
      id: 'inventory-id',
      quantityOnHand: 2,
      part: { id: 'part-id' },
    });
    await expect(
      inventory.adjust('part-id', { delta: -3, reason: 'Count correction' }, context),
    ).rejects.toThrow('cannot become negative');
    expect(prisma.inventoryItem.updateMany).not.toHaveBeenCalled();
  });

  it('consumes stock and records a maintenance log part', async () => {
    prisma.maintenanceLog.findUnique.mockResolvedValue({ id: 'log-id', machineId: 'machine-id' });
    prisma.part.findUnique.mockResolvedValue({
      id: 'part-id',
      isActive: true,
      inventory: { id: 'inventory-id', quantityOnHand: 5, unitCost: 12 },
    });
    prisma.inventoryItem.updateMany.mockResolvedValue({ count: 1 });
    prisma.maintenanceLogPart.create.mockResolvedValue({ id: 'line-id', quantity: 2 });
    await expect(
      logParts.add('log-id', { partId: 'part-id', quantity: 2, notes: 'Replaced belt' }, context),
    ).resolves.toEqual({ id: 'line-id', quantity: 2 });
    expect(prisma.inventoryItem.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { quantityOnHand: { decrement: 2 } } }),
    );
    expect(prisma.maintenanceLogPart.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ quantity: 2, unitCostSnapshot: 12 }),
      }),
    );
  });
});
