import { apiRequest } from '@/lib/api/client';
import type { MaintenancePlansResponse, MaintenancePlan } from '@/features/maintenance-plans/types';
import type { WorkOrdersResponse } from '@/features/work-orders/types';

export async function fetchMaintenanceCalendar(signal?: AbortSignal) {
  const [plans, orders] = await Promise.all([
    apiRequest<MaintenancePlansResponse>('/api/maintenance-plans?page=1&limit=100&isActive=true', {
      signal,
    }),
    apiRequest<WorkOrdersResponse>('/api/work-orders?page=1&limit=100', { signal }),
  ]);
  return { plans: plans.data, orders: orders.data };
}
