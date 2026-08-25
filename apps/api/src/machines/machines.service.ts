import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MachineStatus, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { ListMachinesDto } from './dto/list-machines.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';

const machineInclude = { category: true } as const;

@Injectable()
export class MachinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMachineDto) {
    await this.ensureCategoryExists(dto.categoryId);

    try {
      return await this.prisma.machine.create({
        data: this.toCreateData(dto),
        include: machineInclude,
      });
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

  async update(id: string, dto: UpdateMachineDto) {
    await this.findOne(id);

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    try {
      return await this.prisma.machine.update({
        where: { id },
        data: this.toUpdateData(dto),
        include: machineInclude,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async deactivate(id: string) {
    await this.findOne(id);

    return this.prisma.machine.update({
      where: { id },
      data: { status: MachineStatus.RETIRED },
      include: machineInclude,
    });
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
