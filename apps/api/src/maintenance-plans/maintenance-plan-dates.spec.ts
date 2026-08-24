import { MaintenanceResult } from '../generated/prisma/client';
import { calculatePlanSchedule, calculateNextDueAt } from './maintenance-plan-dates';

describe('maintenance plan dates', () => {
  it('adds frequency days using UTC calendar days', () => {
    expect(calculateNextDueAt(new Date('2026-01-31T00:00:00.000Z'), 30)).toEqual(
      new Date('2026-03-02T00:00:00.000Z'),
    );
  });

  it('uses the last valid preventive log as the schedule base', () => {
    const schedule = calculatePlanSchedule(
      {
        startsAt: new Date('2026-01-01T00:00:00.000Z'),
        frequencyDays: 30,
        warningDaysBefore: 7,
        maintenanceLogs: [
          {
            performedAt: new Date('2026-02-10T00:00:00.000Z'),
            result: MaintenanceResult.OK,
          },
        ],
      },
      new Date('2026-02-20T00:00:00.000Z'),
    );

    expect(schedule.nextDueAt).toEqual(new Date('2026-03-12T00:00:00.000Z'));
  });

  it('marks a plan due soon at the warning boundary and overdue after due date', () => {
    const plan = {
      startsAt: new Date('2026-01-01T00:00:00.000Z'),
      frequencyDays: 30,
      warningDaysBefore: 7,
    };

    expect(calculatePlanSchedule(plan, new Date('2026-01-24T00:00:00.000Z')).isDueSoon).toBe(true);
    expect(calculatePlanSchedule(plan, new Date('2026-01-31T00:00:00.000Z')).isDueSoon).toBe(true);
    expect(calculatePlanSchedule(plan, new Date('2026-02-01T00:00:00.000Z')).isOverdue).toBe(true);
  });
});
