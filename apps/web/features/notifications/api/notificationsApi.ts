import type {
  Notification,
  NotificationFilters,
  NotificationMachineOption,
  NotificationsResponse,
  PreventiveProcessResult,
} from '../types';
import { apiRequest } from '@/lib/api/client';

export function fetchNotifications(filters: NotificationFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(filters.page), limit: '20' });
  if (filters.machineId) params.set('machineId', filters.machineId);
  if (filters.type) params.set('type', filters.type);
  if (filters.severity) params.set('severity', filters.severity);
  if (filters.status) params.set('status', filters.status);
  return apiRequest<NotificationsResponse>(`/api/notifications?${params}`, { signal });
}

export function fetchNotificationMachines(signal?: AbortSignal) {
  return apiRequest<{ data: NotificationMachineOption[] }>('/api/machines?page=1&limit=100', {
    signal,
  });
}

export function acknowledgeNotification(id: string) {
  return apiRequest<Notification>(`/api/notifications/${id}/acknowledge`, {
    method: 'PATCH',
  });
}

export function resolveNotification(id: string) {
  return apiRequest<Notification>(`/api/notifications/${id}/resolve`, {
    method: 'PATCH',
  });
}

export function dismissNotification(id: string) {
  return apiRequest<Notification>(`/api/notifications/${id}/dismiss`, {
    method: 'PATCH',
  });
}

export function processPreventiveNotifications() {
  return apiRequest<PreventiveProcessResult>('/api/notifications/process-preventive', {
    method: 'POST',
  });
}
