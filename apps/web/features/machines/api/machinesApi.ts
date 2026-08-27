import type {
  MachineCategory,
  MachineFilters,
  MachineFormValues,
  MachinesResponse,
} from '../types';
import { apiRequest } from '@/lib/api/client';

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

  return apiRequest<MachinesResponse>(`/api/machines?${params}`, { signal });
}

export function fetchMachineCategories(signal?: AbortSignal) {
  return apiRequest<MachineCategory[]>('/api/machines/categories', { signal });
}

export function createMachine(values: MachineFormValues) {
  return apiRequest('/api/machines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toPayload(values)),
  });
}

export function updateMachine(id: string, values: MachineFormValues) {
  return apiRequest(`/api/machines/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toPayload(values)),
  });
}

export function deactivateMachine(id: string) {
  return apiRequest(`/api/machines/${id}/deactivate`, { method: 'PATCH' });
}
