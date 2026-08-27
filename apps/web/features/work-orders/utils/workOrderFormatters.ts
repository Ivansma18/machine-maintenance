import type { WorkOrderPriority, WorkOrderStatus, WorkOrderType } from '../types';

export const statusLabels: Record<WorkOrderStatus, string> = {
  OPEN: 'Abierta',
  SCHEDULED: 'Programada',
  IN_PROGRESS: 'En ejecución',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};
export const priorityLabels: Record<WorkOrderPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};
export const typeLabels: Record<WorkOrderType, string> = {
  PREVENTIVE: 'Preventiva',
  CORRECTIVE: 'Correctiva',
  INSPECTION: 'Inspección',
};

export function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(value),
      )
    : 'Sin fecha';
}
export function isOverdue(value: string | null, status: WorkOrderStatus) {
  return Boolean(
    value && new Date(value) < new Date() && !['COMPLETED', 'CANCELLED'].includes(status),
  );
}
