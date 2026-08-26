import type { CalendarEvent, MaintenanceCalendarData } from '../types';
import { statusLabels, priorityLabels } from '@/features/work-orders/utils/workOrderFormatters';

export function toCalendarData(
  data: Omit<MaintenanceCalendarData, 'events'>,
): MaintenanceCalendarData {
  const now = new Date();
  const events: CalendarEvent[] = [
    ...data.plans.map((plan) => ({
      id: `plan-${plan.id}`,
      date: plan.nextDueAt,
      title: plan.name,
      kind: 'PLAN' as const,
      status: 'Preventivo',
      machineName: plan.machine.name,
      href: `/machines/${plan.machineId}`,
      overdue: plan.isOverdue,
    })),
    ...data.orders
      .filter((order) => order.scheduledAt || order.dueAt)
      .map((order) => ({
        id: `order-${order.id}`,
        date: order.scheduledAt ?? order.dueAt!,
        title: order.title,
        kind: 'WORK_ORDER' as const,
        status: statusLabels[order.status],
        priority: order.priority,
        machineName: order.machine.name,
        technicianName: order.assignedTo?.name,
        href: `/work-orders/${order.id}`,
        overdue: Boolean(
          order.dueAt &&
          new Date(order.dueAt) < now &&
          !['COMPLETED', 'CANCELLED'].includes(order.status),
        ),
      })),
  ];
  return { ...data, events };
}

export function eventLabel(event: CalendarEvent) {
  return event.kind === 'PLAN'
    ? 'Preventivo'
    : `${statusLabels[event.status as keyof typeof statusLabels] ?? event.status} · ${priorityLabels[event.priority!]}`;
}
export function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function startOfWeek(date: Date) {
  const result = new Date(date);
  result.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  result.setHours(0, 0, 0, 0);
  return result;
}
export function calendarDays(anchor: Date, mode: 'month' | 'week') {
  if (mode === 'week')
    return Array.from({ length: 7 }, (_, index) => {
      const date = startOfWeek(anchor);
      date.setDate(date.getDate() + index);
      return date;
    });
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}
export function periodLabel(anchor: Date, mode: 'month' | 'week') {
  if (mode === 'week') {
    const start = startOfWeek(anchor);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }
  return anchor.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
}
