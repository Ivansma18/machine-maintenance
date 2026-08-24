-- CreateEnum
CREATE TYPE "MachineStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'RETIRED');

-- CreateEnum
CREATE TYPE "MachineCriticality" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PREVENTIVE', 'CORRECTIVE', 'INSPECTION');

-- CreateEnum
CREATE TYPE "MaintenanceResult" AS ENUM ('OK', 'NEEDS_FOLLOW_UP', 'FAILED', 'CRITICAL_FAILURE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PREVENTIVE_DUE_SOON', 'PREVENTIVE_OVERDUE', 'URGENT_CRITICAL_FAILURE');

-- CreateEnum
CREATE TYPE "NotificationSeverity" AS ENUM ('INFO', 'WARNING', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "MachineCategory" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MachineCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Machine" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "serialNumber" VARCHAR(100),
    "location" VARCHAR(150) NOT NULL,
    "manufacturer" VARCHAR(100),
    "model" VARCHAR(100),
    "status" "MachineStatus" NOT NULL DEFAULT 'ACTIVE',
    "criticality" "MachineCriticality" NOT NULL DEFAULT 'MEDIUM',
    "installedAt" DATE,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenancePlan" (
    "id" UUID NOT NULL,
    "machineId" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "frequencyDays" INTEGER NOT NULL,
    "warningDaysBefore" INTEGER NOT NULL DEFAULT 7,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" DATE NOT NULL,
    "lastComputedDueAt" DATE,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MaintenancePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceLog" (
    "id" UUID NOT NULL,
    "machineId" UUID NOT NULL,
    "maintenancePlanId" UUID,
    "performedAt" TIMESTAMPTZ(3) NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "result" "MaintenanceResult" NOT NULL,
    "notes" TEXT,
    "performedBy" VARCHAR(150) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MaintenanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "machineId" UUID NOT NULL,
    "maintenancePlanId" UUID,
    "type" "NotificationType" NOT NULL,
    "severity" "NotificationSeverity" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'OPEN',
    "title" VARCHAR(180) NOT NULL,
    "message" TEXT NOT NULL,
    "dueAt" TIMESTAMPTZ(3),
    "resolvedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MachineCategory_name_key" ON "MachineCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Machine_serialNumber_key" ON "Machine"("serialNumber");

-- CreateIndex
CREATE INDEX "Machine_categoryId_idx" ON "Machine"("categoryId");

-- CreateIndex
CREATE INDEX "Machine_status_idx" ON "Machine"("status");

-- CreateIndex
CREATE INDEX "Machine_criticality_idx" ON "Machine"("criticality");

-- CreateIndex
CREATE INDEX "Machine_location_idx" ON "Machine"("location");

-- CreateIndex
CREATE INDEX "MaintenancePlan_machineId_idx" ON "MaintenancePlan"("machineId");

-- CreateIndex
CREATE INDEX "MaintenancePlan_isActive_lastComputedDueAt_idx" ON "MaintenancePlan"("isActive", "lastComputedDueAt");

-- CreateIndex
CREATE INDEX "MaintenancePlan_startsAt_idx" ON "MaintenancePlan"("startsAt");

-- CreateIndex
CREATE INDEX "MaintenanceLog_machineId_performedAt_idx" ON "MaintenanceLog"("machineId", "performedAt");

-- CreateIndex
CREATE INDEX "MaintenanceLog_maintenancePlanId_performedAt_idx" ON "MaintenanceLog"("maintenancePlanId", "performedAt");

-- CreateIndex
CREATE INDEX "MaintenanceLog_type_result_idx" ON "MaintenanceLog"("type", "result");

-- CreateIndex
CREATE INDEX "Notification_machineId_status_idx" ON "Notification"("machineId", "status");

-- CreateIndex
CREATE INDEX "Notification_maintenancePlanId_type_status_idx" ON "Notification"("maintenancePlanId", "type", "status");

-- CreateIndex
CREATE INDEX "Notification_status_severity_idx" ON "Notification"("status", "severity");

-- CreateIndex
CREATE INDEX "Notification_dueAt_idx" ON "Notification"("dueAt");

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MachineCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenancePlan" ADD CONSTRAINT "MaintenancePlan_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_maintenancePlanId_fkey" FOREIGN KEY ("maintenancePlanId") REFERENCES "MaintenancePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_maintenancePlanId_fkey" FOREIGN KEY ("maintenancePlanId") REFERENCES "MaintenancePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
