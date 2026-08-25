import { apiRequest } from '@/lib/api/client';

import type { AuthIdentity, LoginPayload } from '../types';

export function fetchCurrentIdentity() {
  return apiRequest<AuthIdentity>('/api/auth/me');
}

export function login(payload: LoginPayload) {
  return apiRequest<AuthIdentity>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function logout() {
  return apiRequest<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
}
