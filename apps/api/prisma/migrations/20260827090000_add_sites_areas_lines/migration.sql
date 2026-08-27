CREATE TABLE "Site" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Site_name_key" ON "Site"("name");
CREATE INDEX "Site_isActive_idx" ON "Site"("isActive");
CREATE TABLE "Area" (
    "id" UUID NOT NULL,
    "siteId" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Area_siteId_name_key" ON "Area"("siteId", "name");
CREATE INDEX "Area_siteId_idx" ON "Area"("siteId");
ALTER TABLE "Area" ADD CONSTRAINT "Area_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "ProductionLine" (
    "id" UUID NOT NULL,
    "areaId" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "ProductionLine_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProductionLine_areaId_name_key" ON "ProductionLine"("areaId", "name");
CREATE INDEX "ProductionLine_areaId_idx" ON "ProductionLine"("areaId");
ALTER TABLE "ProductionLine" ADD CONSTRAINT "ProductionLine_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Machine" ADD COLUMN "productionLineId" UUID;
CREATE INDEX "Machine_productionLineId_idx" ON "Machine"("productionLineId");
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_productionLineId_fkey" FOREIGN KEY ("productionLineId") REFERENCES "ProductionLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
