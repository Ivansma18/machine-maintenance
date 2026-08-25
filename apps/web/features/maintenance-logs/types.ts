export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION';
export type MaintenanceResult = 'OK' | 'NEEDS_FOLLOW_UP' | 'FAILED' | 'CRITICAL_FAILURE';

export type LogMachine = {
  id: string;
  name: string;
  location: string;
  status: string;
};

export type LogPlan = {
  id: string;
  machineId: string;
  name: string;
  isActive: boolean;
};

export type MaintenanceLog = {
  id: string;
  machineId: string;
  maintenancePlanId: string | null;
  machine: LogMachine & { category: { name: string } };
  maintenancePlan: { id: string; name: string } | null;
  performedAt: string;
  type: MaintenanceType;
  result: MaintenanceResult;
  notes: string | null;
  performedBy: string;
};

export type MaintenanceLogFilters = {
  machineId?: string;
  type?: MaintenanceType;
  result?: MaintenanceResult;
  performedFrom?: string;
  performedTo?: string;
  page: number;
};

export type MaintenanceLogFormValues = {
  machineId: string;
  maintenancePlanId: string;
  performedAt: string;
  type: MaintenanceType;
  result: MaintenanceResult;
  notes: string;
  performedBy: string;
};

export type MaintenanceLogsResponse = {
  data: MaintenanceLog[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type CriticalNotification = {
  id: string;
  title: string;
  status: string;
};
