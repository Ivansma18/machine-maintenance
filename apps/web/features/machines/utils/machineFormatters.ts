import type { MachineCriticality, MachineStatus } from '../types';

const statusLabels: Record<MachineStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  UNDER_MAINTENANCE: 'Under maintenance',
  RETIRED: 'Retired',
};

const criticalityLabels: Record<MachineCriticality, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export function getMachineStatusLabel(status: MachineStatus) {
  return statusLabels[status];
}

export function getMachineCriticalityLabel(criticality: MachineCriticality) {
  return criticalityLabels[criticality];
}

export function getMachineStatusTone(status: MachineStatus) {
  if (status === 'ACTIVE') return 'success' as const;
  if (status === 'UNDER_MAINTENANCE') return 'warning' as const;
  if (status === 'RETIRED') return 'critical' as const;
  return 'neutral' as const;
}

export function getMachineCriticalityTone(criticality: MachineCriticality) {
  if (criticality === 'CRITICAL') return 'critical' as const;
  if (criticality === 'HIGH') return 'warning' as const;
  if (criticality === 'LOW') return 'success' as const;
  return 'neutral' as const;
}

export function formatMachineDate(value: string | null) {
  if (!value) return 'Not recorded';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(value),
  );
}
