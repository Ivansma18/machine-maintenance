import type { DashboardSummary } from '../types';
import { apiRequest } from '@/lib/api/client';

export async function fetchDashboardSummary(signal?: AbortSignal): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>('/api/dashboard/summary', { signal });
}

export async function processPreventiveNotifications() {
  return apiRequest('/api/notifications/process-preventive', { method: 'POST' });
}
