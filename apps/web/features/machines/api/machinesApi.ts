import type {
  MachineCategory,
  MachineFilters,
  MachineFormValues,
  MachinesResponse,
} from '../types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store' });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new Error(message ?? `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function toPayload(values: MachineFormValues) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ''));
}

export function fetchMachines(filters: MachineFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(filters.page), limit: '10' });
  if (filters.search) params.set('search', filters.search);
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.location) params.set('location', filters.location);
  if (filters.status) params.set('status', filters.status);
  if (filters.criticality) params.set('criticality', filters.criticality);

  return request<MachinesResponse>(`${apiBaseUrl}/api/machines?${params}`, { signal });
}

export function fetchMachineCategories(signal?: AbortSignal) {
  return request<MachineCategory[]>(`${apiBaseUrl}/api/machines/categories`, { signal });
}

export function createMachine(values: MachineFormValues) {
  return request(`${apiBaseUrl}/api/machines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toPayload(values)),
  });
}

export function updateMachine(id: string, values: MachineFormValues) {
  return request(`${apiBaseUrl}/api/machines/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toPayload(values)),
  });
}

export function deactivateMachine(id: string) {
  return request(`${apiBaseUrl}/api/machines/${id}/deactivate`, { method: 'PATCH' });
}
