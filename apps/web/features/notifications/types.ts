export type NotificationType =
  'PREVENTIVE_DUE_SOON' | 'PREVENTIVE_OVERDUE' | 'URGENT_CRITICAL_FAILURE';
export type NotificationSeverity = 'INFO' | 'WARNING' | 'URGENT' | 'CRITICAL';
export type NotificationStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';

export type NotificationMachine = {
  id: string;
  name: string;
  location: string;
  category: { name: string };
};

export type Notification = {
  id: string;
  machineId: string;
  maintenancePlanId: string | null;
  machine: NotificationMachine;
  maintenancePlan: { id: string; name: string } | null;
  type: NotificationType;
  severity: NotificationSeverity;
  status: NotificationStatus;
  title: string;
  message: string;
  dueAt: string | null;
  createdAt: string;
  resolvedAt: string | null;
};

export type NotificationFilters = {
  machineId?: string;
  type?: NotificationType;
  severity?: NotificationSeverity;
  status?: NotificationStatus;
  page: number;
};

export type NotificationsResponse = {
  data: Notification[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type NotificationMachineOption = {
  id: string;
  name: string;
  location: string;
};

export type PreventiveProcessResult = {
  processedPlans: number;
  created: number;
  updated: number;
  resolved: number;
};
