import type { MachineCriticality, MachineStatus } from '../types';

const statusLabels: Record<MachineStatus, string> = {
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
  UNDER_MAINTENANCE: 'En mantenimiento',
  RETIRED: 'Retirada',
};

const criticalityLabels: Record<MachineCriticality, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Critica',
};

const categoryLabels: Record<string, string> = {
  Oven: 'Horno',
  Mixer: 'Mezcladora',
  DoughKneader: 'Amasadora',
};

export function getMachineStatusLabel(status: MachineStatus) {
  return statusLabels[status];
}

export function getMachineCriticalityLabel(criticality: MachineCriticality) {
  return criticalityLabels[criticality];
}

export function getMachineCategoryLabel(name: string) {
  return categoryLabels[name] ?? name;
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
