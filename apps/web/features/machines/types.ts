export type MachineStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE' | 'RETIRED';
export type MachineCriticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type MachineCategory = {
  id: string;
  name: string;
  description: string | null;
};

export type Machine = {
  id: string;
  categoryId: string;
  category: MachineCategory;
  name: string;
  serialNumber: string | null;
  location: string;
  productionLineId: string | null;
  productionLine: {
    id: string;
    name: string;
    area: { id: string; name: string; site: { id: string; name: string } };
  } | null;
  manufacturer: string | null;
  model: string | null;
  status: MachineStatus;
  criticality: MachineCriticality;
  installedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MachineFilters = {
  search: string;
  categoryId?: string;
  location?: string;
  status?: MachineStatus;
  criticality?: MachineCriticality;
  page: number;
};

export type MachineFormValues = {
  categoryId: string;
  name: string;
  serialNumber: string;
  location: string;
  productionLineId: string;
  manufacturer: string;
  model: string;
  status: MachineStatus;
  criticality: MachineCriticality;
  installedAt: string;
};

export type MachinesResponse = {
  data: Machine[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type ProfileMaintenancePlan = {
  id: string;
  machineId: string;
  machine: {
    id: string;
    name: string;
    location: string;
    status: MachineStatus;
    category: MachineCategory;
  };
  name: string;
  description: string | null;
  frequencyDays: number;
  warningDaysBefore: number;
  isActive: boolean;
  startsAt: string;
  nextDueAt: string;
  warningStartsAt: string;
  isDueSoon: boolean;
  isOverdue: boolean;
};

export type ProfileMaintenanceLog = {
  id: string;
  machineId: string;
  maintenancePlanId: string | null;
  machine: { id: string; name: string; location: string; status: MachineStatus };
  maintenancePlan: { id: string; name: string } | null;
  performedAt: string;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION';
  result: 'OK' | 'NEEDS_FOLLOW_UP' | 'FAILED' | 'CRITICAL_FAILURE';
  notes: string | null;
  performedBy: string;
};

export type ProfileNotification = {
  id: string;
  machineId: string;
  maintenancePlanId: string | null;
  machine: { id: string; name: string; location: string; category: MachineCategory };
  maintenancePlan: { id: string; name: string } | null;
  type: 'PREVENTIVE_DUE_SOON' | 'PREVENTIVE_OVERDUE' | 'URGENT_CRITICAL_FAILURE';
  severity: 'INFO' | 'WARNING' | 'URGENT' | 'CRITICAL';
  status: 'OPEN' | 'ACKNOWLEDGED';
  title: string;
  message: string;
  dueAt: string | null;
  createdAt: string;
  resolvedAt: string | null;
};

export type MachineActivity = {
  id: string;
  kind: 'MAINTENANCE' | 'NOTIFICATION' | 'MACHINE';
  occurredAt: string;
  title: string;
  description: string | null;
};

export type MachineProfile = {
  machine: Machine;
  health: {
    lastMaintenanceAt: string | null;
    daysSinceLastMaintenance: number | null;
    nextMaintenanceAt: string | null;
    overduePreventiveCount: number;
    openNotificationCount: number;
    recentCriticalFailureCount: number;
  };
  maintenancePlans: ProfileMaintenancePlan[];
  recentMaintenanceLogs: ProfileMaintenanceLog[];
  openNotifications: ProfileNotification[];
  activity: MachineActivity[];
};

export type MachinePart = {
  id: string;
  sku: string;
  name: string;
  unit: 'UNIT' | 'SET' | 'METER' | 'LITER' | 'KILOGRAM';
  isCritical: boolean;
  inventory: {
    quantityOnHand: number;
    minimumQuantity: number;
    stockState: 'AVAILABLE' | 'LOW' | 'OUT';
  } | null;
};

export type MachinePartsResponse = {
  recent: Array<{
    id: string;
    maintenanceLogId: string;
    performedAt: string;
    quantity: number;
    notes: string | null;
    part: MachinePart;
  }>;
  summary: Array<{ part: MachinePart; totalQuantity: number; usageCount: number }>;
};

export type MachineTimelineEvent = {
  id: string;
  kind: 'PLAN' | 'MAINTENANCE' | 'NOTIFICATION' | 'AUDIT';
  occurredAt: string;
  entityType: string;
  entityId: string | null;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
};

export type MachineTimelineResponse = {
  machine: { id: string; name: string };
  data: MachineTimelineEvent[];
  meta: { total: number; limit: number; hasMore: boolean };
};
