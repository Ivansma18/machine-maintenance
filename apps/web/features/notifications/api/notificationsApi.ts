import type {
  Notification,
  NotificationFilters,
  NotificationMachineOption,
  NotificationsResponse,
  PreventiveProcessResult,
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
      localizeNotificationError(message) ?? `La solicitud fallo con el estado ${response.status}`,
    );
  }
  return response.json() as Promise<T>;
}

function localizeNotificationError(message?: string) {
  if (!message) return undefined;
  if (message.includes('cannot transition'))
    return 'La alerta ya no permite esa transicion de estado.';
  if (message.includes('not found')) return 'La alerta no fue encontrada.';
  return message;
}

export function fetchNotifications(filters: NotificationFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(filters.page), limit: '20' });
  if (filters.machineId) params.set('machineId', filters.machineId);
  if (filters.type) params.set('type', filters.type);
  if (filters.severity) params.set('severity', filters.severity);
  if (filters.status) params.set('status', filters.status);
  return request<NotificationsResponse>(`${apiBaseUrl}/api/notifications?${params}`, { signal });
}

export function fetchNotificationMachines(signal?: AbortSignal) {
  return request<{ data: NotificationMachineOption[] }>(
    `${apiBaseUrl}/api/machines?page=1&limit=100`,
    { signal },
  );
}

export function acknowledgeNotification(id: string) {
  return request<Notification>(`${apiBaseUrl}/api/notifications/${id}/acknowledge`, {
    method: 'PATCH',
  });
}

export function resolveNotification(id: string) {
  return request<Notification>(`${apiBaseUrl}/api/notifications/${id}/resolve`, {
    method: 'PATCH',
  });
}

export function dismissNotification(id: string) {
  return request<Notification>(`${apiBaseUrl}/api/notifications/${id}/dismiss`, {
    method: 'PATCH',
  });
}

export function processPreventiveNotifications() {
  return request<PreventiveProcessResult>(`${apiBaseUrl}/api/notifications/process-preventive`, {
    method: 'POST',
  });
}
