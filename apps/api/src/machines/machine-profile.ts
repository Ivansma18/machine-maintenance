import { NotificationStatus, Prisma } from '../generated/prisma/client';
import {
  calculatePlanSchedule,
  VALID_PREVENTIVE_RESULTS,
} from '../maintenance-plans/maintenance-plan-dates';

export const machineInclude = { category: true } as const;
const profileNotificationStatuses: NotificationStatus[] = [
  NotificationStatus.OPEN,
  NotificationStatus.ACKNOWLEDGED,
];

export const profileMachineInclude = {
  category: true,
  maintenancePlans: {
    orderBy: [{ isActive: 'desc' }, { startsAt: 'asc' }],
    include: {
      machine: { select: { id: true, name: true, location: true, status: true, category: true } },
      maintenanceLogs: {
        where: { type: 'PREVENTIVE', result: { in: VALID_PREVENTIVE_RESULTS } },
        orderBy: [{ performedAt: 'desc' }, { createdAt: 'desc' }],
        take: 1,
        select: { performedAt: true },
      },
    },
  },
  maintenanceLogs: {
    orderBy: [{ performedAt: 'desc' }, { createdAt: 'desc' }],
    take: 10,
    include: {
      machine: { select: { id: true, name: true, location: true, status: true, category: true } },
      maintenancePlan: { select: { id: true, name: true } },
    },
  },
  notifications: {
    where: { status: { in: profileNotificationStatuses } },
    orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    take: 20,
    select: {
      id: true,
      machineId: true,
      maintenancePlanId: true,
      type: true,
      severity: true,
      status: true,
      title: true,
      message: true,
      dueAt: true,
      createdAt: true,
      resolvedAt: true,
      machine: { select: { id: true, name: true, location: true, category: true } },
      maintenancePlan: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.MachineInclude;

type ProfileMachine = Prisma.MachineGetPayload<{ include: typeof profileMachineInclude }>;

export function buildMachineProfile(
  machine: ProfileMachine,
  now: Date,
  recentCriticalFailureCount: number,
  openNotificationCount: number,
) {
  const schedules = machine.maintenancePlans.map((plan) => ({
    plan,
    schedule: calculatePlanSchedule(plan, now),
  }));
  const activeSchedules = schedules.filter(({ plan }) => plan.isActive);
  const nextSchedule = [...activeSchedules].sort(
    (left, right) => left.schedule.nextDueAt.getTime() - right.schedule.nextDueAt.getTime(),
  )[0];
  const lastMaintenance = machine.maintenanceLogs[0]?.performedAt ?? null;

  return {
    machine: {
      id: machine.id,
      categoryId: machine.categoryId,
      category: machine.category,
      name: machine.name,
      serialNumber: machine.serialNumber,
      location: machine.location,
      manufacturer: machine.manufacturer,
      model: machine.model,
      status: machine.status,
      criticality: machine.criticality,
      installedAt: machine.installedAt,
      createdAt: machine.createdAt,
      updatedAt: machine.updatedAt,
    },
    health: {
      lastMaintenanceAt: lastMaintenance,
      daysSinceLastMaintenance: lastMaintenance
        ? Math.max(0, Math.floor((now.getTime() - lastMaintenance.getTime()) / 86_400_000))
        : null,
      nextMaintenanceAt: nextSchedule?.schedule.nextDueAt ?? null,
      overduePreventiveCount: activeSchedules.filter(({ schedule }) => schedule.isOverdue).length,
      openNotificationCount,
      recentCriticalFailureCount,
    },
    maintenancePlans: machine.maintenancePlans.map((plan) => ({
      ...plan,
      ...calculatePlanSchedule(plan, now),
    })),
    recentMaintenanceLogs: machine.maintenanceLogs,
    openNotifications: machine.notifications,
    activity: buildProfileActivity(machine),
  };
}

function buildProfileActivity(machine: ProfileMachine) {
  return [
    ...machine.maintenanceLogs.map((log) => ({
      id: `maintenance-${log.id}`,
      kind: 'MAINTENANCE' as const,
      occurredAt: log.performedAt,
      title: `${log.type} maintenance`,
      description: log.notes,
    })),
    ...machine.notifications.map((notification) => ({
      id: `notification-${notification.id}`,
      kind: 'NOTIFICATION' as const,
      occurredAt: notification.createdAt,
      title: notification.title,
      description: notification.message,
    })),
    {
      id: `machine-${machine.id}`,
      kind: 'MACHINE' as const,
      occurredAt: machine.createdAt,
      title: 'Machine added to registry',
      description: null,
    },
  ]
    .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime())
    .slice(0, 10);
}
