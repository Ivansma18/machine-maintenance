import { Injectable } from '@nestjs/common';
import {
  MachineStatus,
  MaintenanceType,
  NotificationSeverity,
  NotificationStatus,
  Prisma,
} from '../generated/prisma/client';
import { calculatePlanSchedule, VALID_PREVENTIVE_RESULTS } from '../maintenance-plans/maintenance-plan-dates';
import { PrismaService } from '../prisma/prisma.service';

const planInclude = {
  machine: { select: { id: true, name: true } },
  maintenanceLogs: {
    where: {
      type: MaintenanceType.PREVENTIVE,
      result: { in: VALID_PREVENTIVE_RESULTS },
    },
    orderBy: [{ performedAt: 'desc' }, { createdAt: 'desc' }],
    take: 1,
    select: { performedAt: true },
  },
} satisfies Prisma.MaintenancePlanInclude;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(now = new Date()) {
    const [totalMachines, activeMachines, underMaintenanceMachines, inactiveMachines, retiredMachines, activePlans, urgentNotifications, recentLogs] = await this.prisma.$transaction([
      this.prisma.machine.count(),
      this.prisma.machine.count({ where: { status: MachineStatus.ACTIVE } }),
      this.prisma.machine.count({ where: { status: MachineStatus.UNDER_MAINTENANCE } }),
      this.prisma.machine.count({ where: { status: MachineStatus.INACTIVE } }),
      this.prisma.machine.count({ where: { status: MachineStatus.RETIRED } }),
      this.prisma.maintenancePlan.findMany({
        where: { isActive: true },
        include: planInclude,
      }),
      this.prisma.notification.count({
        where: {
          status: NotificationStatus.OPEN,
          severity: { in: [NotificationSeverity.URGENT, NotificationSeverity.CRITICAL] },
        },
      }),
      this.prisma.maintenanceLog.findMany({
        take: 5,
        orderBy: [{ performedAt: 'desc' }, { createdAt: 'desc' }],
        include: {
          machine: { select: { id: true, name: true } },
          maintenancePlan: { select: { id: true, name: true } },
        },
      }),
    ]);

    const upcoming = activePlans.filter((plan) => calculatePlanSchedule(plan, now).isDueSoon).length;
    const overdue = activePlans.filter((plan) => calculatePlanSchedule(plan, now).isOverdue).length;

    return {
      generatedAt: now.toISOString(),
      machines: {
        total: totalMachines,
        active: activeMachines,
        underMaintenance: underMaintenanceMachines,
        inactive: inactiveMachines,
        retired: retiredMachines,
      },
      maintenance: {
        dueSoon: upcoming,
        overdue,
      },
      openUrgentNotifications: urgentNotifications,
      recentLogs: recentLogs.map((log) => ({
        id: log.id,
        machine: log.machine,
        maintenancePlan: log.maintenancePlan,
        performedAt: log.performedAt,
        type: log.type,
        result: log.result,
        performedBy: log.performedBy,
      })),
    };
  }
}
