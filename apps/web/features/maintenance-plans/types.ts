export type MaintenancePlan = {
  id: string;
  machineId: string;
  machine: {
    id: string;
    name: string;
    location: string;
    category: { name: string };
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

export type MaintenancePlanFilters = {
  machineId?: string;
  activeState: 'ALL' | 'ACTIVE' | 'INACTIVE';
  situation: 'ALL' | 'DUE_SOON' | 'OVERDUE' | 'ON_TRACK';
  page: number;
};

export type MaintenancePlanFormValues = {
  machineId: string;
  name: string;
  description: string;
  frequencyDays: number;
  warningDaysBefore: number;
  startsAt: string;
  isActive: boolean;
};

export type PlanMachine = {
  id: string;
  name: string;
  location: string;
  status: string;
};

export type MaintenancePlansResponse = {
  data: MaintenancePlan[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};
