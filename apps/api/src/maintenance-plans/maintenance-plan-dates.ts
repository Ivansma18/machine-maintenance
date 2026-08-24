import { MaintenanceResult, MaintenanceType } from '../generated/prisma/client';

export const VALID_PREVENTIVE_RESULTS: MaintenanceResult[] = [
  MaintenanceResult.OK,
  MaintenanceResult.NEEDS_FOLLOW_UP,
] as const;

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function calculateNextDueAt(baseDate: Date, frequencyDays: number) {
  return addDays(baseDate, frequencyDays);
}

export function calculatePlanSchedule(
  plan: {
    startsAt: Date;
    frequencyDays: number;
    warningDaysBefore: number;
    maintenanceLogs?: Array<{
      performedAt: Date;
      type?: MaintenanceType;
      result?: MaintenanceResult;
    }>;
  },
  now = new Date(),
) {
  const lastValidLog = plan.maintenanceLogs?.[0];
  const baseDate = lastValidLog?.performedAt ?? plan.startsAt;
  const nextDueAt = calculateNextDueAt(baseDate, plan.frequencyDays);
  const warningStartsAt = addDays(nextDueAt, -plan.warningDaysBefore);

  return {
    nextDueAt,
    warningStartsAt,
    isOverdue: now.getTime() >= nextDueAt.getTime(),
    isDueSoon: now.getTime() >= warningStartsAt.getTime() && now.getTime() < nextDueAt.getTime(),
  };
}
