import type { WorkOrder } from '@/features/work-orders/types';
import type { MaintenancePlan } from '@/features/maintenance-plans/types';

export type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  kind: 'PLAN' | 'WORK_ORDER';
  status: string;
  priority?: WorkOrder['priority'];
  machineName: string;
  technicianName?: string;
  href: string;
  overdue: boolean;
};

export type MaintenanceCalendarData = {
  events: CalendarEvent[];
  orders: WorkOrder[];
  plans: MaintenancePlan[];
};
