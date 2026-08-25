import type {
  Notification,
  NotificationSeverity,
  NotificationStatus,
  NotificationType,
} from '../types';

const typeLabels: Record<NotificationType, string> = {
  PREVENTIVE_DUE_SOON: 'Preventivo proximo',
  PREVENTIVE_OVERDUE: 'Preventivo vencido',
  URGENT_CRITICAL_FAILURE: 'Fallo critico',
};

const severityLabels: Record<NotificationSeverity, string> = {
  INFO: 'Informativa',
  WARNING: 'Advertencia',
  URGENT: 'Urgente',
  CRITICAL: 'Critica',
};

const statusLabels: Record<NotificationStatus, string> = {
  OPEN: 'Abierta',
  ACKNOWLEDGED: 'Reconocida',
  RESOLVED: 'Resuelta',
  DISMISSED: 'Descartada',
};

export function getNotificationTypeLabel(type: NotificationType) {
  return typeLabels[type];
}

export function getNotificationSeverityLabel(severity: NotificationSeverity) {
  return severityLabels[severity];
}

export function getNotificationStatusLabel(status: NotificationStatus) {
  return statusLabels[status];
}

export function getNotificationTone(severity: NotificationSeverity) {
  if (severity === 'CRITICAL') return 'critical' as const;
  if (severity === 'URGENT' || severity === 'WARNING') return 'warning' as const;
  return 'neutral' as const;
}

export function getNotificationStatusTone(status: NotificationStatus) {
  if (status === 'RESOLVED' || status === 'DISMISSED') return 'success' as const;
  if (status === 'ACKNOWLEDGED') return 'neutral' as const;
  return 'warning' as const;
}
