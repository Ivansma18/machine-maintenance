CREATE TYPE "PartUnit" AS ENUM ('UNIT', 'SET', 'METER', 'LITER', 'KILOGRAM');

CREATE TABLE "Part" (
    "id" UUID NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "description" TEXT,
    "unit" "PartUnit" NOT NULL,
    "manufacturer" VARCHAR(100),
    "manufacturerPartNumber" VARCHAR(100),
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InventoryItem" (
    "id" UUID NOT NULL,
    "partId" UUID NOT NULL,
    "quantityOnHand" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minimumQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reorderQuantity" DOUBLE PRECISION,
    "unitCost" DOUBLE PRECISION,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MaintenanceLogPart" (
    "id" UUID NOT NULL,
    "maintenanceLogId" UUID NOT NULL,
    "partId" UUID NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitCostSnapshot" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MaintenanceLogPart_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Part_sku_key" ON "Part"("sku");
CREATE UNIQUE INDEX "InventoryItem_partId_key" ON "InventoryItem"("partId");
CREATE UNIQUE INDEX "MaintenanceLogPart_maintenanceLogId_partId_key" ON "MaintenanceLogPart"("maintenanceLogId", "partId");
CREATE INDEX "MaintenanceLogPart_partId_createdAt_idx" ON "MaintenanceLogPart"("partId", "createdAt");

ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MaintenanceLogPart" ADD CONSTRAINT "MaintenanceLogPart_maintenanceLogId_fkey" FOREIGN KEY ("maintenanceLogId") REFERENCES "MaintenanceLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MaintenanceLogPart" ADD CONSTRAINT "MaintenanceLogPart_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
