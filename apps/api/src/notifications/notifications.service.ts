import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MachineCriticality,
  MaintenanceResult,
  MaintenanceType,
  NotificationSeverity,
  NotificationStatus,
  NotificationType,
  Prisma,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import {
  calculatePlanSchedule,
  VALID_PREVENTIVE_RESULTS,
} from '../maintenance-plans/maintenance-plan-dates';

const notificationInclude = {
  machine: { include: { category: true } },
  maintenancePlan: { select: { id: true, name: true } },
} satisfies Prisma.NotificationInclude;

const planInclude = {
  machine: { select: { id: true, name: true, criticality: true } },
  maintenanceLogs: {
    where: {
      type: MaintenanceType.PREVENTIVE,
      result: { in: VALID_PREVENTIVE_RESULTS },
    },
    orderBy: [{ performedAt: 'desc' }, { createdAt: 'desc' }],
    take: 1,
    select: { performedAt: true },
  },
} satisfies Prisma.MaintenancePlanInclude;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListNotificationsDto) {
    const where: Prisma.NotificationWhereInput = {
      machineId: query.machineId,
      maintenancePlanId: query.maintenancePlanId,
      type: query.type,
      severity: query.severity,
      status: query.status,
    };
    const skip = (query.page - 1) * query.limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        include: notificationInclude,
        orderBy: [{ status: 'asc' }, { severity: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: query.limit,
      }),
      this.prisma.notification.count({ where }),
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
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: notificationInclude,
    });

    if (!notification) {
      throw new NotFoundException(`Notification ${id} not found`);
    }

    return notification;
  }

  async processPreventiveNotifications(now = new Date()) {
    const plans = await this.prisma.maintenancePlan.findMany({
      where: { isActive: true },
      include: planInclude,
    });
    const result = { processedPlans: plans.length, created: 0, updated: 0, resolved: 0 };

    for (const plan of plans) {
      const schedule = calculatePlanSchedule(plan, now);
      const current = this.getCurrentPreventiveState(plan.machine.criticality, schedule);

      const outcome = await this.prisma.$transaction(async (tx) => {
        const openNotifications = await tx.notification.findMany({
          where: {
            machineId: plan.machine.id,
            maintenancePlanId: plan.id,
            type: {
              in: [
                NotificationType.PREVENTIVE_DUE_SOON,
                NotificationType.PREVENTIVE_OVERDUE,
              ],
            },
            status: NotificationStatus.OPEN,
          },
        });

        let created = 0;
        let updated = 0;
        let resolved = 0;

        if (current) {
          const existing = openNotifications.find((notification) => notification.type === current.type);

          if (existing) {
            const dueAtChanged = existing.dueAt?.getTime() !== schedule.nextDueAt.getTime();
            const notificationChanged =
              existing.severity !== current.severity ||
              existing.title !== current.title ||
              existing.message !== current.message ||
              dueAtChanged;

            if (notificationChanged) {
              await tx.notification.update({
                where: { id: existing.id },
                data: {
                  severity: current.severity,
                  title: current.title,
                  message: current.message,
                  dueAt: schedule.nextDueAt,
                },
              });
              updated += 1;
            }
          } else {
            await tx.notification.create({
              data: {
                machine: { connect: { id: plan.machine.id } },
                maintenancePlan: { connect: { id: plan.id } },
                type: current.type,
                severity: current.severity,
                status: NotificationStatus.OPEN,
                title: current.title,
                message: current.message,
                dueAt: schedule.nextDueAt,
              },
            });
            created += 1;
          }

          const staleIds = openNotifications
            .filter((notification) => notification.type !== current.type)
            .map((notification) => notification.id);

          if (staleIds.length > 0) {
            const closed = await tx.notification.updateMany({
              where: { id: { in: staleIds } },
              data: { status: NotificationStatus.RESOLVED, resolvedAt: now },
            });
            resolved += closed.count;
          }
        } else if (openNotifications.length > 0) {
          const closed = await tx.notification.updateMany({
            where: { id: { in: openNotifications.map((notification) => notification.id) } },
            data: { status: NotificationStatus.RESOLVED, resolvedAt: now },
          });
          resolved += closed.count;
        }

        return { created, updated, resolved };
      });

      result.created += outcome.created;
      result.updated += outcome.updated;
      result.resolved += outcome.resolved;
    }

    return result;
  }

  async acknowledge(id: string) {
    return this.transition(id, NotificationStatus.ACKNOWLEDGED, [NotificationStatus.OPEN]);
  }

  async resolve(id: string) {
    return this.transition(id, NotificationStatus.RESOLVED, [
      NotificationStatus.OPEN,
      NotificationStatus.ACKNOWLEDGED,
    ]);
  }

  async dismiss(id: string) {
    return this.transition(id, NotificationStatus.DISMISSED, [
      NotificationStatus.OPEN,
      NotificationStatus.ACKNOWLEDGED,
    ]);
  }

  private async transition(id: string, status: NotificationStatus, allowed: NotificationStatus[]) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });

    if (!notification) {
      throw new NotFoundException(`Notification ${id} not found`);
    }

    if (!allowed.includes(notification.status)) {
      throw new ConflictException(`Notification cannot transition from ${notification.status} to ${status}`);
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === NotificationStatus.RESOLVED || status === NotificationStatus.DISMISSED
          ? new Date()
          : undefined,
      },
      include: notificationInclude,
    });
  }

  private getCurrentPreventiveState(
    criticality: MachineCriticality,
    schedule: ReturnType<typeof calculatePlanSchedule>,
  ) {
    if (schedule.isOverdue) {
      return {
        type: NotificationType.PREVENTIVE_OVERDUE,
        severity: criticality === MachineCriticality.CRITICAL
          ? NotificationSeverity.CRITICAL
          : NotificationSeverity.URGENT,
        title: 'Preventive maintenance overdue',
        message: 'The preventive maintenance plan has exceeded its due date.',
      };
    }

    if (schedule.isDueSoon) {
      return {
        type: NotificationType.PREVENTIVE_DUE_SOON,
        severity: NotificationSeverity.WARNING,
        title: 'Preventive maintenance due soon',
        message: 'The preventive maintenance plan is within its warning window.',
      };
    }

    return null;
  }
}
