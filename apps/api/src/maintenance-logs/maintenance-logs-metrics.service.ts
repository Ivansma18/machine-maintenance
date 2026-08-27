import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type RecurrenceMachineMetric = {
  machineId: string;
  machineName: string;
  category: string;
  failureCount: number;
  correctiveCount: number;
  overduePreventiveCount: number;
  maintenanceCost: number;
  repeatedPart: { name: string; count: number } | null;
  recurringFailure: { type: string; count: number } | null;
};

@Injectable()
export class MaintenanceLogsMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async recurrenceMetrics() {
    const generatedAt = new Date();
    const since = new Date(generatedAt);
    since.setMonth(since.getMonth() - 6);

    const [logs, plans] = await Promise.all([
      this.prisma.maintenanceLog.findMany({
        where: { performedAt: { gte: since } },
        include: {
          machine: { include: { category: true } },
          parts: { include: { part: true } },
        },
        orderBy: { performedAt: 'desc' },
      }),
      this.prisma.maintenancePlan.findMany({
        where: { isActive: true },
        include: { machine: true },
      }),
    ]);

    const failureResults = new Set(['FAILED', 'CRITICAL_FAILURE']);
    const machines = new Map<
      string,
      {
        machineId: string;
        machineName: string;
        category: string;
        failureCount: number;
        correctiveCount: number;
        overduePreventiveCount: number;
        maintenanceCost: number;
        partCounts: Map<string, { name: string; count: number }>;
        failureTypes: Map<string, number>;
      }
    >();

    for (const log of logs) {
      const current = machines.get(log.machineId) ?? {
        machineId: log.machineId,
        machineName: log.machine.name,
        category: log.machine.category.name,
        failureCount: 0,
        correctiveCount: 0,
        overduePreventiveCount: 0,
        maintenanceCost: 0,
        partCounts: new Map(),
        failureTypes: new Map(),
      };
      if (failureResults.has(log.result)) {
        current.failureCount += 1;
        current.failureTypes.set(log.type, (current.failureTypes.get(log.type) ?? 0) + 1);
      }
      if (log.type === 'CORRECTIVE') current.correctiveCount += 1;
      for (const line of log.parts) {
        const part = current.partCounts.get(line.partId) ?? { name: line.part.name, count: 0 };
        part.count += line.quantity;
        current.partCounts.set(line.partId, part);
        current.maintenanceCost += (line.unitCostSnapshot ?? 0) * line.quantity;
      }
      machines.set(log.machineId, current);
    }

    for (const plan of plans) {
      if (plan.lastComputedDueAt && plan.lastComputedDueAt < generatedAt) {
        const current = machines.get(plan.machineId) ?? {
          machineId: plan.machineId,
          machineName: plan.machine.name,
          category: '',
          failureCount: 0,
          correctiveCount: 0,
          overduePreventiveCount: 0,
          maintenanceCost: 0,
          partCounts: new Map(),
          failureTypes: new Map(),
        };
        current.overduePreventiveCount += 1;
        machines.set(plan.machineId, current);
      }
    }

    const machineRows = [...machines.values()]
      .map((machine) => {
        const repeatedPart = [...machine.partCounts.values()].sort((a, b) => b.count - a.count)[0];
        const recurringType = [...machine.failureTypes.entries()].sort(([, a], [, b]) => b - a)[0];
        return {
          machineId: machine.machineId,
          machineName: machine.machineName,
          category: machine.category,
          failureCount: machine.failureCount,
          correctiveCount: machine.correctiveCount,
          overduePreventiveCount: machine.overduePreventiveCount,
          maintenanceCost: Number(machine.maintenanceCost.toFixed(2)),
          repeatedPart: repeatedPart && repeatedPart.count > 1 ? repeatedPart : null,
          recurringFailure:
            recurringType && recurringType[1] > 1
              ? { type: recurringType[0], count: recurringType[1] }
              : null,
        };
      })
      .sort((a, b) => b.failureCount - a.failureCount || b.maintenanceCost - a.maintenanceCost);
    const recommendations = this.buildRecommendations(machineRows);

    return {
      periodMonths: 6,
      since: since.toISOString(),
      generatedAt: generatedAt.toISOString(),
      summary: {
        machinesAnalyzed: machineRows.length,
        failureCount: machineRows.reduce((total, machine) => total + machine.failureCount, 0),
        correctiveCount: machineRows.reduce((total, machine) => total + machine.correctiveCount, 0),
        overduePreventiveCount: machineRows.reduce(
          (total, machine) => total + machine.overduePreventiveCount,
          0,
        ),
        maintenanceCost: Number(
          machineRows.reduce((total, machine) => total + machine.maintenanceCost, 0).toFixed(2),
        ),
        recurringMachines: machineRows.filter(
          (machine) => machine.recurringFailure || machine.repeatedPart,
        ).length,
        recommendationCount: recommendations.length,
      },
      machines: machineRows,
      recommendations,
    };
  }

  private buildRecommendations(machines: RecurrenceMachineMetric[]) {
    return machines.flatMap((machine) => {
      const recommendations: Array<{
        id: string;
        machineId: string;
        machineName: string;
        severity: 'URGENT' | 'HIGH' | 'MEDIUM';
        title: string;
        reason: string;
        action: string;
      }> = [];
      if (machine.failureCount >= 3) {
        recommendations.push({
          id: `${machine.machineId}-failures`,
          machineId: machine.machineId,
          machineName: machine.machineName,
          severity: 'URGENT',
          title: 'Investigar fallas repetitivas',
          reason: `${machine.failureCount} fallas registradas en los últimos 6 meses.`,
          action: 'Inspeccionar causa raíz y revisar la condición de la máquina.',
        });
      }
      if (machine.overduePreventiveCount >= 2) {
        recommendations.push({
          id: `${machine.machineId}-preventive`,
          machineId: machine.machineId,
          machineName: machine.machineName,
          severity: 'HIGH',
          title: 'Programar mantenimiento preventivo',
          reason: `${machine.overduePreventiveCount} planes preventivos activos están vencidos.`,
          action: 'Programar una intervención prioritaria desde el expediente técnico.',
        });
      }
      if (machine.repeatedPart && machine.repeatedPart.count >= 4) {
        recommendations.push({
          id: `${machine.machineId}-part`,
          machineId: machine.machineId,
          machineName: machine.machineName,
          severity: 'HIGH',
          title: 'Revisar reemplazo recurrente',
          reason: `${machine.repeatedPart.name} fue consumida ${machine.repeatedPart.count} veces.`,
          action: 'Revisar compatibilidad, instalación y causa raíz antes del siguiente cambio.',
        });
      }
      if (machine.recurringFailure) {
        recommendations.push({
          id: `${machine.machineId}-type`,
          machineId: machine.machineId,
          machineName: machine.machineName,
          severity: 'MEDIUM',
          title: 'Comparar intervenciones del mismo tipo',
          reason: `${machine.recurringFailure.type} aparece ${machine.recurringFailure.count} veces entre las fallas.`,
          action:
            'Comparar notas y resultados de esas intervenciones para definir una corrección permanente.',
        });
      }
      if (machine.maintenanceCost >= 1000) {
        recommendations.push({
          id: `${machine.machineId}-cost`,
          machineId: machine.machineId,
          machineName: machine.machineName,
          severity: 'MEDIUM',
          title: 'Evaluar costo acumulado',
          reason: `El costo estimado de refacciones alcanza ${machine.maintenanceCost.toFixed(2)} en el periodo.`,
          action: 'Comparar el costo de mantener la máquina contra reemplazo o renovación.',
        });
      }
      return recommendations;
    });
  }
}
