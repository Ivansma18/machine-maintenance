import type {
  MaintenancePlan,
  MaintenancePlanFormValues,
  MaintenancePlansResponse,
  PlanMachine,
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
      localizePlanError(message) ?? `La solicitud fallo con el estado ${response.status}`,
    );
  }
  return response.json() as Promise<T>;
}

function localizePlanError(message?: string) {
  if (!message) return undefined;
  if (message.includes('equivalent active maintenance plan'))
    return 'Ya existe un plan preventivo equivalente y activo para esta maquina.';
  if (message.includes('does not exist')) return 'La maquina seleccionada no existe.';
  if (message.includes('not found')) return 'El plan preventivo no fue encontrado.';
  if (message.includes('startsAt')) return 'La fecha de inicio no es valida.';
  return message;
}

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
  return request<MaintenancePlansResponse>(`${apiBaseUrl}/api/maintenance-plans?${params}`, {
    signal,
  });
}

export function fetchPlanMachines(signal?: AbortSignal) {
  return request<{ data: PlanMachine[] }>(`${apiBaseUrl}/api/machines?page=1&limit=100`, {
    signal,
  });
}

export function createMaintenancePlan(values: MaintenancePlanFormValues) {
  return request<MaintenancePlan>(`${apiBaseUrl}/api/maintenance-plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toPayload(values)),
  });
}

export function updateMaintenancePlan(id: string, values: MaintenancePlanFormValues) {
  return request<MaintenancePlan>(`${apiBaseUrl}/api/maintenance-plans/${id}`, {
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
  return request<MaintenancePlan>(`${apiBaseUrl}/api/maintenance-plans/${id}/activate`, {
    method: 'PATCH',
  });
}

export function deactivateMaintenancePlan(id: string) {
  return request<MaintenancePlan>(`${apiBaseUrl}/api/maintenance-plans/${id}/deactivate`, {
    method: 'PATCH',
  });
}
