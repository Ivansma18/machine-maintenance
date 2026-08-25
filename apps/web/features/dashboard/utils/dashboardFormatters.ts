import type { DashboardMachineDistribution, DashboardResult, DashboardSummary } from '../types';

export function getResultTone(result: DashboardResult) {
  if (result === 'CRITICAL_FAILURE') return 'critical' as const;
  if (result === 'FAILED') return 'warning' as const;
  if (result === 'OK') return 'success' as const;
  return 'neutral' as const;
}

export function getResultLabel(result: DashboardResult) {
  const labels: Record<DashboardResult, string> = {
    OK: 'Correcto',
    NEEDS_FOLLOW_UP: 'Requiere seguimiento',
    FAILED: 'Fallido',
    CRITICAL_FAILURE: 'Fallo critico',
  };
  return labels[result];
}

export function getMaintenanceTypeLabel(type: string) {
  const labels: Record<string, string> = {
    PREVENTIVE: 'mantenimiento preventivo',
    CORRECTIVE: 'mantenimiento correctivo',
    INSPECTION: 'inspeccion',
  };
  return labels[type] ?? 'mantenimiento';
}

export function getMachineDistribution(
  machines: DashboardSummary['machines'],
): DashboardMachineDistribution[] {
  return [
    { label: 'Activas', count: machines.active, color: '#668875' },
    { label: 'En mantenimiento', count: machines.underMaintenance, color: '#d95b4f' },
    { label: 'Inactivas', count: machines.inactive, color: '#9da7a2' },
    { label: 'Retiradas', count: machines.retired, color: '#c8cfca' },
  ];
}
