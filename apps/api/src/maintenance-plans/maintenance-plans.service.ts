import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MaintenanceType, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenancePlanDto } from './dto/create-maintenance-plan.dto';
import { ListMaintenancePlansDto } from './dto/list-maintenance-plans.dto';
import { UpdateMaintenancePlanDto } from './dto/update-maintenance-plan.dto';
import { calculatePlanSchedule, VALID_PREVENTIVE_RESULTS } from './maintenance-plan-dates';

const planInclude = {
  machine: { include: { category: true } },
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
export class MaintenancePlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaintenancePlanDto) {
    await this.ensureMachineExists(dto.machineId);
    const isActive = dto.isActive ?? true;

    if (isActive) {
      await this.ensureNoEquivalentActivePlan(
        dto.machineId,
        {
          frequencyDays: dto.frequencyDays,
          warningDaysBefore: dto.warningDaysBefore,
          startsAt: this.toDate(dto.startsAt),
          isActive,
        },
        undefined,
      );
    }

    const plan = await this.prisma.maintenancePlan.create({
      data: {
        machine: { connect: { id: dto.machineId } },
        name: dto.name,
        description: dto.description,
        frequencyDays: dto.frequencyDays,
        warningDaysBefore: dto.warningDaysBefore,
        isActive,
        startsAt: this.toDate(dto.startsAt),
      },
      include: planInclude,
    });

    return this.withSchedule(plan);
  }

  async findAll(query: ListMaintenancePlansDto) {
    const where: Prisma.MaintenancePlanWhereInput = {
      machineId: query.machineId,
      isActive: query.isActive,
    };
    const skip = (query.page - 1) * query.limit;

    const [plans, total] = await this.prisma.$transaction([
      this.prisma.maintenancePlan.findMany({
        where,
        include: planInclude,
        orderBy: [{ isActive: 'desc' }, { startsAt: 'asc' }, { name: 'asc' }],
        skip,
        take: query.limit,
      }),
      this.prisma.maintenancePlan.count({ where }),
    ]);

    return {
      data: plans.map((plan) => this.withSchedule(plan)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(id: string) {
    const plan = await this.prisma.maintenancePlan.findUnique({
      where: { id },
      include: planInclude,
    });

    if (!plan) {
      throw new NotFoundException(`Maintenance plan ${id} not found`);
    }

    return this.withSchedule(plan);
  }

  async update(id: string, dto: UpdateMaintenancePlanDto) {
    const current = await this.findPlanRecord(id);
    const next = {
      machineId: current.machineId,
      frequencyDays: dto.frequencyDays ?? current.frequencyDays,
      warningDaysBefore: dto.warningDaysBefore ?? current.warningDaysBefore,
      startsAt: dto.startsAt ? this.toDate(dto.startsAt) : current.startsAt,
      isActive: dto.isActive ?? current.isActive,
    };

    if (next.isActive) {
      await this.ensureNoEquivalentActivePlan(next.machineId, next, id);
    }

    const plan = await this.prisma.maintenancePlan.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        frequencyDays: dto.frequencyDays,
        warningDaysBefore: dto.warningDaysBefore,
        isActive: dto.isActive,
        startsAt: dto.startsAt ? this.toDate(dto.startsAt) : undefined,
      },
      include: planInclude,
    });

    return this.withSchedule(plan);
  }

  async activate(id: string) {
    const current = await this.findPlanRecord(id);

    await this.ensureNoEquivalentActivePlan(current.machineId, current, id);

    const plan = await this.prisma.maintenancePlan.update({
      where: { id },
      data: { isActive: true },
      include: planInclude,
    });

    return this.withSchedule(plan);
  }

  async deactivate(id: string) {
    await this.findPlanRecord(id);

    const plan = await this.prisma.maintenancePlan.update({
      where: { id },
      data: { isActive: false },
      include: planInclude,
    });

    return this.withSchedule(plan);
  }

  private async findPlanRecord(id: string) {
    const plan = await this.prisma.maintenancePlan.findUnique({ where: { id } });

    if (!plan) {
      throw new NotFoundException(`Maintenance plan ${id} not found`);
    }

    return plan;
  }

  private async ensureMachineExists(machineId: string) {
    const machine = await this.prisma.machine.findUnique({ where: { id: machineId } });

    if (!machine) {
      throw new BadRequestException(`Machine ${machineId} does not exist`);
    }
  }

  private async ensureNoEquivalentActivePlan(
    machineId: string,
    rule: {
      frequencyDays: number;
      warningDaysBefore: number;
      startsAt: Date;
      isActive: boolean;
    },
    excludedId?: string,
  ) {
    const existing = await this.prisma.maintenancePlan.findFirst({
      where: {
        machineId,
        frequencyDays: rule.frequencyDays,
        warningDaysBefore: rule.warningDaysBefore,
        startsAt: rule.startsAt,
        isActive: true,
        id: excludedId ? { not: excludedId } : undefined,
      },
    });

    if (existing) {
      throw new ConflictException(
        'An equivalent active maintenance plan already exists for this machine',
      );
    }
  }

  private toDate(value: string) {
    const date = new Date(`${value}T00:00:00.000Z`);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('startsAt must be a valid date');
    }

    return date;
  }

  private withSchedule<
    T extends {
      startsAt: Date;
      frequencyDays: number;
      warningDaysBefore: number;
      maintenanceLogs?: Array<{ performedAt: Date }>;
    },
  >(plan: T) {
    return {
      ...plan,
      ...calculatePlanSchedule(plan),
    };
  }
}
