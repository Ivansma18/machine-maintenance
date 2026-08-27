import type { MaintenancePlan } from '../types';

export function getPlanSituation(plan: MaintenancePlan) {
  if (!plan.isActive) return { label: 'Inactivo', tone: 'neutral' as const };
  if (plan.isOverdue) return { label: 'Vencido', tone: 'critical' as const };
  if (plan.isDueSoon) return { label: 'Proximo', tone: 'warning' as const };
  return { label: 'En fecha', tone: 'success' as const };
}

export function getPlanSituationLabel(situation: string) {
  const labels: Record<string, string> = {
    ALL: 'Todas las situaciones',
    DUE_SOON: 'Proximos',
    OVERDUE: 'Vencidos',
    ON_TRACK: 'En fecha',
  };
  return labels[situation] ?? situation;
}
