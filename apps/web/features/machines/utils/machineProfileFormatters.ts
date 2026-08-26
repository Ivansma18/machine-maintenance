import { formatDateOnly } from '@/lib/formatters/dateFormatters';

import type { MachineActivity, MachineProfile } from '../types';

export function getMachineProfileNextAction({ health }: MachineProfile) {
  if (health.overduePreventiveCount)
    return `Hay ${health.overduePreventiveCount} mantenimiento${health.overduePreventiveCount > 1 ? 's' : ''} preventivo${health.overduePreventiveCount > 1 ? 's' : ''} vencido${health.overduePreventiveCount > 1 ? 's' : ''}.`;
  if (health.openNotificationCount)
    return `Hay ${health.openNotificationCount} alerta${health.openNotificationCount > 1 ? 's' : ''} abierta${health.openNotificationCount > 1 ? 's' : ''}.`;
  if (health.nextMaintenanceAt)
    return `El siguiente mantenimiento vence el ${formatDateOnly(health.nextMaintenanceAt)}.`;
  return 'No hay pendientes inmediatos.';
}

export function getActivityTitle(event: MachineActivity) {
  if (event.kind === 'MACHINE') return 'Maquina agregada al registro';
  if (event.kind === 'MAINTENANCE')
    return (
      (
        {
          PREVENTIVE: 'Mantenimiento preventivo',
          CORRECTIVE: 'Mantenimiento correctivo',
          INSPECTION: 'Inspeccion',
        } as Record<string, string>
      )[event.title.split(' ')[0]] ?? 'Mantenimiento registrado'
    );
  return event.title;
}
