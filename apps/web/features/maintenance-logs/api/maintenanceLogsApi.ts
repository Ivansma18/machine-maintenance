import type {
  CriticalNotification,
  LogMachine,
  LogPlan,
  MaintenanceLog,
  MaintenanceLogFormValues,
  MaintenanceLogFilters,
  MaintenanceLogsResponse,
} from '../types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store' });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new Error(
      localizeLogError(message) ?? `La solicitud fallo con el estado ${response.status}`,
    );
  }
  return response.json() as Promise<T>;
}

function localizeLogError(message?: string) {
  if (!message) return undefined;
  if (message.includes('does not exist')) return 'La maquina o el plan seleccionado no existe.';
  if (message.includes('does not belong'))
    return 'El plan seleccionado no pertenece a esa maquina.';
  if (message.includes('performedAt')) return 'La fecha y hora del mantenimiento no son validas.';
  return message;
}

export function fetchMaintenanceLogs(filters: MaintenanceLogFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(filters.page), limit: '20' });
  if (filters.machineId) params.set('machineId', filters.machineId);
  if (filters.type) params.set('type', filters.type);
  if (filters.result) params.set('result', filters.result);
  if (filters.performedFrom) params.set('performedFrom', filters.performedFrom);
  if (filters.performedTo) params.set('performedTo', filters.performedTo);
  return request<MaintenanceLogsResponse>(`${apiBaseUrl}/api/maintenance-logs?${params}`, {
    signal,
  });
}

export function fetchLogMachines(signal?: AbortSignal) {
  return request<{ data: LogMachine[] }>(`${apiBaseUrl}/api/machines?page=1&limit=100`, { signal });
}

export function fetchLogPlans(signal?: AbortSignal) {
  return request<{ data: LogPlan[] }>(`${apiBaseUrl}/api/maintenance-plans?page=1&limit=100`, {
    signal,
  });
}

export function createMaintenanceLog(values: MaintenanceLogFormValues) {
  return request<MaintenanceLog & { criticalNotification: CriticalNotification | null }>(
    `${apiBaseUrl}/api/maintenance-logs`,
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
