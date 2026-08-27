import type { MaintenanceLog, MaintenanceResult, MaintenanceType } from '../types';

const typeLabels: Record<MaintenanceType, string> = {
  PREVENTIVE: 'Preventivo',
  CORRECTIVE: 'Correctivo',
  INSPECTION: 'Inspeccion',
};

const resultLabels: Record<MaintenanceResult, string> = {
  OK: 'Correcto',
  NEEDS_FOLLOW_UP: 'Requiere seguimiento',
  FAILED: 'Fallido',
  CRITICAL_FAILURE: 'Fallo critico',
};

export function getMaintenanceTypeLabel(type: MaintenanceType) {
  return typeLabels[type];
}

export function getMaintenanceResultLabel(result: MaintenanceResult) {
  return resultLabels[result];
}

export function getMaintenanceResultTone(result: MaintenanceResult) {
  if (result === 'CRITICAL_FAILURE') return 'critical' as const;
  if (result === 'FAILED' || result === 'NEEDS_FOLLOW_UP') return 'warning' as const;
  return 'success' as const;
}

export function getMaintenanceLogSummary(log: MaintenanceLog) {
  if (log.result === 'CRITICAL_FAILURE')
    return 'Se genero una alerta urgente para esta falla critica.';
  if (log.result === 'FAILED') return 'El equipo requiere atencion correctiva.';
  if (log.result === 'NEEDS_FOLLOW_UP') return 'El mantenimiento requiere seguimiento.';
  return 'Mantenimiento registrado correctamente.';
}
