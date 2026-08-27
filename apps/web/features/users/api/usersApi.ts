import { apiRequest } from '@/lib/api/client';
import type { CreateUserValues, ManagedUser, UserRole } from '../types';

export function fetchUsers(signal?: AbortSignal) {
  return apiRequest<ManagedUser[]>('/api/users', { signal });
}
export function fetchRoles(signal?: AbortSignal) {
  return apiRequest<UserRole[]>('/api/users/roles', { signal });
}
export function createUser(values: CreateUserValues) {
  return mutate<ManagedUser>('/api/users', 'POST', values);
}
export function updateUserStatus(id: string, isActive: boolean) {
  return mutate<ManagedUser>(`/api/users/${id}/status`, 'PATCH', { isActive });
}
export function assignUserRoles(id: string, roleIds: string[]) {
  return mutate<ManagedUser>(`/api/users/${id}/roles`, 'PATCH', { roleIds });
}
export function assignUserScopes(
  id: string,
  scopes: { level: 'SITE' | 'AREA'; siteId?: string; areaId?: string }[],
) {
  return mutate<ManagedUser>(`/api/users/${id}/scopes`, 'PATCH', { scopes });
}
export function resetUserPassword(id: string) {
  return mutate<{ temporaryPassword: string }>(`/api/users/${id}/reset-password`, 'POST');
}
function mutate<T>(path: string, method: 'POST' | 'PATCH', body?: unknown) {
  return apiRequest<T>(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}
