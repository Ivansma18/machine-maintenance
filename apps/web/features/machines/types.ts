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
