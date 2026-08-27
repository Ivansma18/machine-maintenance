import type { RecurrenceMachine } from '../types';

export const maintenanceTypeLabels: Record<string, string> = {
  PREVENTIVE: 'Preventivo',
  CORRECTIVE: 'Correctivo',
  INSPECTION: 'Inspeccion',
};

export function formatCost(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value);
}

export function metricState(machine: RecurrenceMachine) {
  if (machine.failureCount >= 3 || machine.overduePreventiveCount >= 2) return 'critical';
  if (machine.failureCount >= 2 || machine.repeatedPart || machine.overduePreventiveCount)
    return 'warning';
  return 'healthy';
}
