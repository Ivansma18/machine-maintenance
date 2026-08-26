-- CreateEnum
CREATE TYPE "WorkOrderType" AS ENUM ('PREVENTIVE', 'CORRECTIVE', 'INSPECTION');

-- CreateEnum
CREATE TYPE "WorkOrderPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('OPEN', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" UUID NOT NULL,
    "machineId" UUID NOT NULL,
    "maintenancePlanId" UUID,
    "title" VARCHAR(180) NOT NULL,
    "description" TEXT,
    "type" "WorkOrderType" NOT NULL,
    "priority" "WorkOrderPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'OPEN',
    "scheduledAt" TIMESTAMPTZ(3),
    "dueAt" TIMESTAMPTZ(3),
    "assignedToUserId" UUID,
    "completedAt" TIMESTAMPTZ(3),
    "cancelledAt" TIMESTAMPTZ(3),
    "cancellationReason" TEXT,
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkOrder_machineId_status_idx" ON "WorkOrder"("machineId", "status");
CREATE INDEX "WorkOrder_maintenancePlanId_idx" ON "WorkOrder"("maintenancePlanId");
CREATE INDEX "WorkOrder_assignedToUserId_status_idx" ON "WorkOrder"("assignedToUserId", "status");
CREATE INDEX "WorkOrder_status_dueAt_idx" ON "WorkOrder"("status", "dueAt");
CREATE INDEX "WorkOrder_priority_status_idx" ON "WorkOrder"("priority", "status");

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_maintenancePlanId_fkey" FOREIGN KEY ("maintenancePlanId") REFERENCES "MaintenancePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
