import type {
  MaintenancePlan,
  MaintenancePlanFormValues,
  MaintenancePlansResponse,
  PlanMachine,
} from '../types';
import { apiRequest } from '@/lib/api/client';

function toPayload(values: MaintenancePlanFormValues) {
  return {
    machineId: values.machineId,
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    frequencyDays: values.frequencyDays,
    warningDaysBefore: values.warningDaysBefore,
    startsAt: values.startsAt,
    isActive: values.isActive,
  };
}

export function fetchMaintenancePlans(
  machineId?: string,
  isActive?: boolean,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({ page: '1', limit: '100' });
  if (machineId) params.set('machineId', machineId);
  if (isActive !== undefined) params.set('isActive', String(isActive));
  return apiRequest<MaintenancePlansResponse>(`/api/maintenance-plans?${params}`, {
    signal,
  });
}

export function fetchPlanMachines(signal?: AbortSignal) {
  return apiRequest<{ data: PlanMachine[] }>('/api/machines?page=1&limit=100', {
    signal,
  });
}

export function createMaintenancePlan(values: MaintenancePlanFormValues) {
  return apiRequest<MaintenancePlan>('/api/maintenance-plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toPayload(values)),
  });
}

export function updateMaintenancePlan(id: string, values: MaintenancePlanFormValues) {
  return apiRequest<MaintenancePlan>(`/api/maintenance-plans/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      frequencyDays: values.frequencyDays,
      warningDaysBefore: values.warningDaysBefore,
      startsAt: values.startsAt,
      isActive: values.isActive,
    }),
  });
}

export function activateMaintenancePlan(id: string) {
  return apiRequest<MaintenancePlan>(`/api/maintenance-plans/${id}/activate`, {
    method: 'PATCH',
  });
}

export function deactivateMaintenancePlan(id: string) {
  return apiRequest<MaintenancePlan>(`/api/maintenance-plans/${id}/deactivate`, {
    method: 'PATCH',
  });
}
