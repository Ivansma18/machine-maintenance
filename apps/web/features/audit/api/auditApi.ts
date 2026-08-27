import { apiRequest } from '@/lib/api/client';
import type { AuditFilters, AuditResponse } from '../types';

export function fetchAuditEvents(filters: AuditFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(filters.page), limit: '25' });
  for (const [key, value] of Object.entries(filters)) {
    if (key !== 'page' && value) params.set(key, String(value));
  }
  return apiRequest<AuditResponse>(`/api/audit?${params}`, { signal });
}
