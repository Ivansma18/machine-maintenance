import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  MaintenanceResult,
  NotificationSeverity,
  NotificationStatus,
  NotificationType,
  Prisma,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AuditContext } from '../audit/audit.types';
import { CreateMaintenanceLogDto } from './dto/create-maintenance-log.dto';
import { ListMaintenanceLogsDto } from './dto/list-maintenance-logs.dto';

const logInclude = {
  machine: { include: { category: true } },
  maintenancePlan: { select: { id: true, name: true } },
} satisfies Prisma.MaintenanceLogInclude;

@Injectable()
export class MaintenanceLogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateMaintenanceLogDto, context?: AuditContext) {
    return this.prisma.$transaction((tx) => this.createInTransaction(tx, dto, context));
  }

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
      },
      machines: machineRows,
    };
  }

  async createInTransaction(
    tx: Prisma.TransactionClient,
    dto: CreateMaintenanceLogDto,
    context?: AuditContext,
  ) {
    const performedAt = this.toDateTime(dto.performedAt);

    const machine = await tx.machine.findUnique({
      where: { id: dto.machineId },
      select: { id: true, name: true },
    });

    if (!machine) {
      throw new BadRequestException(`Machine ${dto.machineId} does not exist`);
    }

    if (dto.maintenancePlanId) {
      const plan = await tx.maintenancePlan.findUnique({
        where: { id: dto.maintenancePlanId },
        select: { id: true, machineId: true },
      });

      if (!plan) {
        throw new BadRequestException(`Maintenance plan ${dto.maintenancePlanId} does not exist`);
      }

      if (plan.machineId !== dto.machineId) {
        throw new BadRequestException(
          'The maintenance plan does not belong to the selected machine',
        );
      }
    }

    const log = await tx.maintenanceLog.create({
      data: {
        machine: { connect: { id: dto.machineId } },
        maintenancePlan: dto.maintenancePlanId
          ? { connect: { id: dto.maintenancePlanId } }
          : undefined,
        performedAt,
        type: dto.type,
        result: dto.result,
        notes: dto.notes,
        performedBy: dto.performedBy,
      },
      include: logInclude,
    });

    const criticalNotificationResult =
      dto.result === MaintenanceResult.CRITICAL_FAILURE
        ? await this.ensureCriticalNotification(tx, {
            machineId: dto.machineId,
            machineName: machine.name,
            maintenancePlanId: dto.maintenancePlanId,
            performedAt,
            notes: dto.notes,
          })
        : null;
    const criticalNotification = criticalNotificationResult?.notification ?? null;
    const createdCriticalNotification = criticalNotificationResult?.created
      ? criticalNotificationResult.notification
      : null;

    if (context && createdCriticalNotification) {
      await this.audit.record(
        {
          ...context,
          action: 'notification.urgent.created',
          entityType: 'Notification',
          entityId: createdCriticalNotification.id,
          after: createdCriticalNotification,
        },
        tx,
      );
    }

    const result = { ...log, criticalNotification };

    if (context) {
      await this.audit.record(
        {
          ...context,
          action: 'maintenance-log.created',
          entityType: 'MaintenanceLog',
          entityId: log.id,
          after: result,
        },
        tx,
      );
    }

    return result;
  }

  async findAll(query: ListMaintenanceLogsDto) {
    const where: Prisma.MaintenanceLogWhereInput = {
      machineId: query.machineId,
      maintenancePlanId: query.maintenancePlanId,
      type: query.type,
      result: query.result,
      performedAt: {
        gte: query.performedFrom ? this.toDateTime(query.performedFrom) : undefined,
        lte: query.performedTo ? this.toEndOfDay(query.performedTo) : undefined,
      },
    };
    const skip = (query.page - 1) * query.limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.maintenanceLog.findMany({
        where,
        include: logInclude,
        orderBy: [{ performedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: query.limit,
      }),
      this.prisma.maintenanceLog.count({ where }),
    ]);

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(id: string) {
    const log = await this.prisma.maintenanceLog.findUnique({
      where: { id },
      include: logInclude,
    });

    if (!log) {
      throw new NotFoundException(`Maintenance log ${id} not found`);
    }

    return log;
  }

  private async ensureCriticalNotification(
    tx: Prisma.TransactionClient,
    input: {
      machineId: string;
      machineName: string;
      maintenancePlanId?: string;
      performedAt: Date;
      notes?: string;
    },
  ) {
    const existing = await tx.notification.findFirst({
      where: {
        machineId: input.machineId,
        maintenancePlanId: input.maintenancePlanId ?? null,
        type: NotificationType.URGENT_CRITICAL_FAILURE,
        status: NotificationStatus.OPEN,
      },
    });

    if (existing) {
      return { notification: existing, created: false };
    }

    const notification = await tx.notification.create({
      data: {
        machine: { connect: { id: input.machineId } },
        maintenancePlan: input.maintenancePlanId
          ? { connect: { id: input.maintenancePlanId } }
          : undefined,
        type: NotificationType.URGENT_CRITICAL_FAILURE,
        severity: NotificationSeverity.CRITICAL,
        status: NotificationStatus.OPEN,
        title: `Critical failure: ${input.machineName}`,
        message: input.notes || 'A critical machine failure requires immediate attention.',
        dueAt: input.performedAt,
      },
    });

    return { notification, created: true };
  }

  private toDateTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('performedAt must be a valid date and time');
    }

    return date;
  }

  private toEndOfDay(value: string) {
    const date = new Date(`${value}T23:59:59.999Z`);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('performedTo must be a valid date');
    }

    return date;
  }
}
