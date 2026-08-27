import type {
  CriticalNotification,
  LogMachine,
  LogPlan,
  MaintenanceLog,
  MaintenanceLogFormValues,
  MaintenanceLogFilters,
  MaintenanceLogsResponse,
} from '../types';
import { apiRequest } from '@/lib/api/client';

export function fetchMaintenanceLogs(filters: MaintenanceLogFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(filters.page), limit: '20' });
  if (filters.machineId) params.set('machineId', filters.machineId);
  if (filters.type) params.set('type', filters.type);
  if (filters.result) params.set('result', filters.result);
  if (filters.performedFrom) params.set('performedFrom', filters.performedFrom);
  if (filters.performedTo) params.set('performedTo', filters.performedTo);
  return apiRequest<MaintenanceLogsResponse>(`/api/maintenance-logs?${params}`, {
    signal,
  });
}

export function fetchLogMachines(signal?: AbortSignal) {
  return apiRequest<{ data: LogMachine[] }>('/api/machines?page=1&limit=100', { signal });
}

export function fetchLogPlans(signal?: AbortSignal) {
  return apiRequest<{ data: LogPlan[] }>('/api/maintenance-plans?page=1&limit=100', {
    signal,
  });
}

export function createMaintenanceLog(values: MaintenanceLogFormValues) {
  return apiRequest<MaintenanceLog & { criticalNotification: CriticalNotification | null }>(
    '/api/maintenance-logs',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        machineId: values.machineId,
        maintenancePlanId: values.maintenancePlanId || undefined,
        performedAt: new Date(values.performedAt).toISOString(),
        type: values.type,
        result: values.result,
        notes: values.notes.trim() || undefined,
        performedBy: values.performedBy.trim(),
      }),
    },
  );
}
