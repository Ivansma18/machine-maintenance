import { MaintenanceLogsMetricsService } from './maintenance-logs-metrics.service';

describe('MaintenanceLogsMetricsService', () => {
  it('aggregates failures, repeated parts, overdue plans, and cost by machine', async () => {
    const prisma = {
      maintenanceLog: {
        findMany: jest.fn().mockResolvedValue([
          {
            machineId: 'machine-id',
            machine: { name: 'Oven 01', category: { name: 'Horno' } },
            result: 'FAILED',
            type: 'CORRECTIVE',
            parts: [
              { partId: 'belt-id', quantity: 2, unitCostSnapshot: 15, part: { name: 'Banda' } },
            ],
          },
          {
            machineId: 'machine-id',
            machine: { name: 'Oven 01', category: { name: 'Horno' } },
            result: 'CRITICAL_FAILURE',
            type: 'CORRECTIVE',
            parts: [
              { partId: 'belt-id', quantity: 1, unitCostSnapshot: 15, part: { name: 'Banda' } },
            ],
          },
        ]),
      },
      maintenancePlan: {
        findMany: jest.fn().mockResolvedValue([
          {
            machineId: 'machine-id',
            machine: { name: 'Oven 01' },
            lastComputedDueAt: new Date('2020-01-01T00:00:00.000Z'),
          },
        ]),
      },
    };

    const result = await new MaintenanceLogsMetricsService(prisma as never).recurrenceMetrics();

    expect(result.summary).toEqual({
      machinesAnalyzed: 1,
      failureCount: 2,
      correctiveCount: 2,
      overduePreventiveCount: 1,
      maintenanceCost: 45,
      recurringMachines: 1,
      recommendationCount: 1,
    });
    expect(result.machines[0]).toEqual(
      expect.objectContaining({
        machineId: 'machine-id',
        repeatedPart: { name: 'Banda', count: 3 },
        recurringFailure: { type: 'CORRECTIVE', count: 2 },
      }),
    );
  });

  it('returns no recurrence markers when one-off activity is found', async () => {
    const prisma = {
      maintenanceLog: {
        findMany: jest.fn().mockResolvedValue([
          {
            machineId: 'machine-id',
            machine: { name: 'Mixer 01', category: { name: 'Mezcladora' } },
            result: 'OK',
            type: 'PREVENTIVE',
            parts: [],
          },
        ]),
      },
      maintenancePlan: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const result = await new MaintenanceLogsMetricsService(prisma as never).recurrenceMetrics();

    expect(result.summary.recurringMachines).toBe(0);
    expect(result.machines[0].repeatedPart).toBeNull();
    expect(result.machines[0].recurringFailure).toBeNull();
  });
});
