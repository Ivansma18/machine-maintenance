import { apiRequest } from '@/lib/api/client';
import type {
  WorkOrder,
  WorkOrderCompletionValues,
  WorkOrderFilters,
  WorkOrderFormValues,
  WorkOrdersResponse,
} from '../types';

export function fetchWorkOrders(filters: WorkOrderFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(filters.page), limit: '10' });
  for (const [key, value] of Object.entries(filters)) {
    if (key !== 'page' && value) params.set(key, String(value));
  }
  return apiRequest<WorkOrdersResponse>(`/api/work-orders?${params}`, { signal });
}

export function fetchWorkOrder(id: string, signal?: AbortSignal) {
  return apiRequest<WorkOrder>(`/api/work-orders/${id}`, { signal });
}

export function createWorkOrder(values: WorkOrderFormValues) {
  return apiRequest<WorkOrder>('/api/work-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clean(values)),
  });
}

export function assignWorkOrder(id: string, assignedToUserId: string) {
  return mutate<WorkOrder>(`/api/work-orders/${id}/assign`, { assignedToUserId });
}

export function startWorkOrder(id: string) {
  return mutate<WorkOrder>(`/api/work-orders/${id}/start`);
}
export function completeWorkOrder(id: string, values: WorkOrderCompletionValues) {
  return mutate<WorkOrder>(`/api/work-orders/${id}/complete`, values);
}
export function cancelWorkOrder(id: string, reason: string) {
  return mutate<WorkOrder>(`/api/work-orders/${id}/cancel`, { reason });
}

function mutate<T>(path: string, body?: unknown) {
  return apiRequest<T>(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function clean(values: WorkOrderFormValues) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== '' && value !== undefined),
  );
}
