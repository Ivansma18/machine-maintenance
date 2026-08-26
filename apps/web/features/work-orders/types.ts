export type WorkOrderStatus = 'OPEN' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type WorkOrderType = 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION';
export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type WorkOrder = {
  id: string;
  machineId: string;
  machine: { id: string; name: string; location: string; category: { name: string } };
  maintenancePlan: { id: string; name: string } | null;
  title: string;
  description: string | null;
  type: WorkOrderType;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  scheduledAt: string | null;
  dueAt: string | null;
  assignedTo: { id: string; name: string; username: string } | null;
  createdBy: { id: string; name: string; username: string };
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkOrdersResponse = {
  data: WorkOrder[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type WorkOrderFilters = {
  status?: WorkOrderStatus;
  priority?: WorkOrderPriority;
  type?: WorkOrderType;
  machineId?: string;
  assignedToUserId?: string;
  dueFrom?: string;
  dueTo?: string;
  page: number;
};

export type WorkOrderFormValues = {
  machineId: string;
  maintenancePlanId?: string;
  title: string;
  description: string;
  type: WorkOrderType;
  priority: WorkOrderPriority;
  scheduledAt?: string;
  dueAt?: string;
  assignedToUserId?: string;
};

export type WorkOrderMachine = { id: string; name: string; location: string };
