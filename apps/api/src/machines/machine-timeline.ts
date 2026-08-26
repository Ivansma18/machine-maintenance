type TimelinePlan = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
type TimelineLog = {
  id: string;
  performedAt: Date;
  type: string;
  result: string;
  notes: string | null;
  performedBy: string;
  maintenancePlan: { id: string; name: string } | null;
};
type TimelineNotification = {
  id: string;
  type: string;
  severity: string;
  status: string;
  title: string;
  message: string;
  dueAt: Date | null;
  createdAt: Date;
  maintenancePlan: { id: string; name: string } | null;
};
type TimelineAudit = {
  id: string;
  actorType: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  reason: string | null;
  createdAt: Date;
};

export function buildMachineTimeline(
  machine: { id: string; name: string; createdAt: Date },
  plans: TimelinePlan[],
  logs: TimelineLog[],
  notifications: TimelineNotification[],
  audits: TimelineAudit[],
) {
  const events = [
    {
      id: `machine-created-${machine.id}`,
      kind: 'MACHINE' as const,
      occurredAt: machine.createdAt,
      entityType: 'Machine',
      entityId: machine.id,
      title: 'Machine added to registry',
      description: machine.name,
      metadata: {},
    },
    ...plans.flatMap((plan) => [
      {
        id: `plan-created-${plan.id}`,
        kind: 'PLAN' as const,
        occurredAt: plan.createdAt,
        entityType: 'MaintenancePlan',
        entityId: plan.id,
        title: 'Maintenance plan created',
        description: plan.name,
        metadata: { isActive: plan.isActive },
      },
      ...(plan.updatedAt.getTime() !== plan.createdAt.getTime()
        ? [
            {
              id: `plan-updated-${plan.id}`,
              kind: 'PLAN' as const,
              occurredAt: plan.updatedAt,
              entityType: 'MaintenancePlan',
              entityId: plan.id,
              title: 'Maintenance plan updated',
              description: plan.name,
              metadata: { isActive: plan.isActive },
            },
          ]
        : []),
    ]),
    ...logs.map((log) => ({
      id: `maintenance-${log.id}`,
      kind: 'MAINTENANCE' as const,
      occurredAt: log.performedAt,
      entityType: 'MaintenanceLog',
      entityId: log.id,
      title: `${log.type} maintenance recorded`,
      description: log.notes,
      metadata: {
        result: log.result,
        performedBy: log.performedBy,
        maintenancePlan: log.maintenancePlan,
      },
    })),
    ...notifications.map((notification) => ({
      id: `notification-created-${notification.id}`,
      kind: 'NOTIFICATION' as const,
      occurredAt: notification.createdAt,
      entityType: 'Notification',
      entityId: notification.id,
      title: notification.title,
      description: notification.message,
      metadata: {
        type: notification.type,
        severity: notification.severity,
        status: notification.status,
        dueAt: notification.dueAt,
        maintenancePlan: notification.maintenancePlan,
      },
    })),
    ...audits.map((audit) => ({
      id: `audit-${audit.id}`,
      kind: 'AUDIT' as const,
      occurredAt: audit.createdAt,
      entityType: audit.entityType,
      entityId: audit.entityId,
      title: audit.action,
      description: audit.reason,
      metadata: { actorType: audit.actorType, actorId: audit.actorId },
    })),
  ].sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime());

  return {
    machine: { id: machine.id, name: machine.name },
    data: events,
    meta: { total: events.length, limit: events.length, hasMore: false },
  };
}
