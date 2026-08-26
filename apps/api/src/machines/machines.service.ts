import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MachineStatus, NotificationStatus, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AuditContext } from '../audit/audit.types';
import {
  calculatePlanSchedule,
  VALID_PREVENTIVE_RESULTS,
} from '../maintenance-plans/maintenance-plan-dates';
import { CreateMachineDto } from './dto/create-machine.dto';
import { ListMachinesDto } from './dto/list-machines.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';

const machineInclude = { category: true } as const;
const profileNotificationStatuses: NotificationStatus[] = [
  NotificationStatus.OPEN,
  NotificationStatus.ACKNOWLEDGED,
];
const profileMachineInclude = {
  category: true,
  maintenancePlans: {
    orderBy: [{ isActive: 'desc' }, { startsAt: 'asc' }],
    include: {
      machine: { select: { id: true, name: true, location: true, status: true, category: true } },
      maintenanceLogs: {
        where: {
          type: 'PREVENTIVE',
          result: { in: VALID_PREVENTIVE_RESULTS },
        },
        orderBy: [{ performedAt: 'desc' }, { createdAt: 'desc' }],
        take: 1,
        select: { performedAt: true },
      },
    },
  },
  maintenanceLogs: {
    orderBy: [{ performedAt: 'desc' }, { createdAt: 'desc' }],
    take: 10,
    include: {
      machine: {
        select: { id: true, name: true, location: true, status: true, category: true },
      },
      maintenancePlan: { select: { id: true, name: true } },
    },
  },
  notifications: {
    where: { status: { in: profileNotificationStatuses } },
    orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    take: 20,
    select: {
      id: true,
      machineId: true,
      maintenancePlanId: true,
      type: true,
      severity: true,
      status: true,
      title: true,
      message: true,
      dueAt: true,
      createdAt: true,
      resolvedAt: true,
      machine: {
        select: { id: true, name: true, location: true, category: true },
      },
      maintenancePlan: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.MachineInclude;

@Injectable()
export class MachinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateMachineDto, context?: AuditContext) {
    await this.ensureCategoryExists(dto.categoryId);

    try {
      const machine = await this.prisma.machine.create({
        data: this.toCreateData(dto),
        include: machineInclude,
      });

      if (context) {
        await this.audit.record(
          {
            ...context,
            action: 'machine.created',
            entityType: 'Machine',
            entityId: machine.id,
            after: machine,
          },
          this.prisma,
        );
      }

      return machine;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(query: ListMachinesDto) {
    const where: Prisma.MachineWhereInput = {
      categoryId: query.categoryId,
      status: query.status,
      criticality: query.criticality,
      location: query.location ? { contains: query.location, mode: 'insensitive' } : undefined,
      OR: query.search
        ? [
            { name: { contains: query.search, mode: 'insensitive' } },
            { serialNumber: { contains: query.search, mode: 'insensitive' } },
            { manufacturer: { contains: query.search, mode: 'insensitive' } },
            { model: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
    };
    const skip = (query.page - 1) * query.limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.machine.findMany({
        where,
        include: machineInclude,
        orderBy: [{ status: 'asc' }, { name: 'asc' }],
        skip,
        take: query.limit,
      }),
      this.prisma.machine.count({ where }),
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

  findCategories() {
    return this.prisma.machineCategory.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true },
    });
  }

  async findProfile(id: string, now = new Date()) {
    const [machine, recentCriticalFailureCount, openNotificationCount] =
      await this.prisma.$transaction([
        this.prisma.machine.findUnique({
          where: { id },
          include: profileMachineInclude,
        }),
        this.prisma.maintenanceLog.count({
          where: {
            machineId: id,
            result: 'CRITICAL_FAILURE',
            performedAt: { gte: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) },
          },
        }),
        this.prisma.notification.count({
          where: { machineId: id, status: NotificationStatus.OPEN },
        }),
      ]);

    if (!machine) {
      throw new NotFoundException(`Machine ${id} not found`);
    }

    const schedules = machine.maintenancePlans.map((plan) => ({
      plan,
      schedule: calculatePlanSchedule(plan, now),
    }));
    const activeSchedules = schedules.filter(({ plan }) => plan.isActive);
    const nextSchedule = activeSchedules.sort(
      (left, right) => left.schedule.nextDueAt.getTime() - right.schedule.nextDueAt.getTime(),
    )[0];
    const lastMaintenance = machine.maintenanceLogs[0]?.performedAt ?? null;
    const activity = this.buildProfileActivity(machine);

    return {
      machine: {
        id: machine.id,
        categoryId: machine.categoryId,
        category: machine.category,
        name: machine.name,
        serialNumber: machine.serialNumber,
        location: machine.location,
        manufacturer: machine.manufacturer,
        model: machine.model,
        status: machine.status,
        criticality: machine.criticality,
        installedAt: machine.installedAt,
        createdAt: machine.createdAt,
        updatedAt: machine.updatedAt,
      },
      health: {
        lastMaintenanceAt: lastMaintenance,
        daysSinceLastMaintenance: lastMaintenance
          ? Math.max(0, Math.floor((now.getTime() - lastMaintenance.getTime()) / 86_400_000))
          : null,
        nextMaintenanceAt: nextSchedule?.schedule.nextDueAt ?? null,
        overduePreventiveCount: activeSchedules.filter(({ schedule }) => schedule.isOverdue).length,
        openNotificationCount,
        recentCriticalFailureCount,
      },
      maintenancePlans: machine.maintenancePlans.map((plan) => ({
        ...plan,
        ...calculatePlanSchedule(plan, now),
      })),
      recentMaintenanceLogs: machine.maintenanceLogs,
      openNotifications: machine.notifications,
      activity,
    };
  }

  async findOne(id: string) {
    const machine = await this.prisma.machine.findUnique({
      where: { id },
      include: machineInclude,
    });

    if (!machine) {
      throw new NotFoundException(`Machine ${id} not found`);
    }

    return machine;
  }

  async update(id: string, dto: UpdateMachineDto, context?: AuditContext) {
    const before = await this.findOne(id);

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    try {
      const machine = await this.prisma.machine.update({
        where: { id },
        data: this.toUpdateData(dto),
        include: machineInclude,
      });

      if (context) {
        await this.audit.record(
          {
            ...context,
            action: 'machine.updated',
            entityType: 'Machine',
            entityId: machine.id,
            before,
            after: machine,
          },
          this.prisma,
        );
      }

      return machine;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async deactivate(id: string, context?: AuditContext) {
    const before = await this.findOne(id);

    const machine = await this.prisma.machine.update({
      where: { id },
      data: { status: MachineStatus.RETIRED },
      include: machineInclude,
    });

    if (context) {
      await this.audit.record(
        {
          ...context,
          action: 'machine.retired',
          entityType: 'Machine',
          entityId: machine.id,
          before,
          after: machine,
        },
        this.prisma,
      );
    }

    return machine;
  }

  private async ensureCategoryExists(categoryId: string) {
    const category = await this.prisma.machineCategory.findUnique({ where: { id: categoryId } });

    if (!category) {
      throw new BadRequestException(`Machine category ${categoryId} does not exist`);
    }
  }

  private toCreateData(dto: CreateMachineDto): Prisma.MachineCreateInput {
    return {
      name: dto.name,
      serialNumber: dto.serialNumber,
      location: dto.location,
      manufacturer: dto.manufacturer,
      model: dto.model,
      status: dto.status,
      criticality: dto.criticality,
      installedAt: this.toDate(dto.installedAt),
      category: { connect: { id: dto.categoryId } },
    };
  }

  private buildProfileActivity(
    machine: Prisma.MachineGetPayload<{ include: typeof profileMachineInclude }>,
  ) {
    const activity = [
      ...machine.maintenanceLogs.map((log) => ({
        id: `maintenance-${log.id}`,
        kind: 'MAINTENANCE' as const,
        occurredAt: log.performedAt,
        title: `${log.type} maintenance` as string,
        description: log.notes,
      })),
      ...machine.notifications.map((notification) => ({
        id: `notification-${notification.id}`,
        kind: 'NOTIFICATION' as const,
        occurredAt: notification.createdAt,
        title: notification.title,
        description: notification.message,
      })),
      {
        id: `machine-${machine.id}`,
        kind: 'MACHINE' as const,
        occurredAt: machine.createdAt,
        title: 'Machine added to registry',
        description: null,
      },
    ];

    return activity
      .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime())
      .slice(0, 10);
  }

  private toUpdateData(dto: UpdateMachineDto): Prisma.MachineUpdateInput {
    return {
      name: dto.name,
      serialNumber: dto.serialNumber,
      location: dto.location,
      manufacturer: dto.manufacturer,
      model: dto.model,
      status: dto.status,
      criticality: dto.criticality,
      installedAt: dto.installedAt === undefined ? undefined : this.toDate(dto.installedAt),
      category: dto.categoryId ? { connect: { id: dto.categoryId } } : undefined,
    };
  }

  private toDate(value?: string) {
    return value ? new Date(`${value}T00:00:00.000Z`) : undefined;
  }

  private handlePrismaError(error: unknown): never {
    if (this.isPrismaError(error, 'P2002')) {
      throw new ConflictException('A machine with this serial number already exists');
    }

    if (this.isPrismaError(error, 'P2025')) {
      throw new NotFoundException('Machine not found');
    }

    throw error;
  }

  private isPrismaError(error: unknown, code: string): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
  }
}
