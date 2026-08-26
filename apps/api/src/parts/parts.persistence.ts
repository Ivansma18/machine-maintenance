import { Prisma } from '../generated/prisma/client';

export const partInclude = { inventory: true } satisfies Prisma.PartInclude;
export const logPartInclude = {
  part: { include: { inventory: true } },
} satisfies Prisma.MaintenanceLogPartInclude;

export function withStockState<
  T extends { inventory: { quantityOnHand: number; minimumQuantity: number } | null },
>(part: T) {
  const inventory = part.inventory;
  return {
    ...part,
    inventory: inventory
      ? {
          ...inventory,
          stockState:
            inventory.quantityOnHand === 0
              ? 'OUT'
              : inventory.quantityOnHand <= inventory.minimumQuantity
                ? 'LOW'
                : 'AVAILABLE',
        }
      : null,
  };
}
