import type { DashboardMachineDistribution, DashboardResult, DashboardSummary } from '../types';

export function formatDashboardDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function getResultTone(result: DashboardResult) {
  if (result === 'CRITICAL_FAILURE') return 'critical' as const;
  if (result === 'FAILED') return 'warning' as const;
  if (result === 'OK') return 'success' as const;
  return 'neutral' as const;
}

export function getResultLabel(result: DashboardResult) {
  return result.replaceAll('_', ' ').toLowerCase();
}

export function getMachineDistribution(
  machines: DashboardSummary['machines'],
): DashboardMachineDistribution[] {
  return [
    { label: 'Active', count: machines.active, color: '#668875' },
    { label: 'Under maintenance', count: machines.underMaintenance, color: '#d95b4f' },
    { label: 'Inactive', count: machines.inactive, color: '#9da7a2' },
    { label: 'Retired', count: machines.retired, color: '#c8cfca' },
  ];
}
