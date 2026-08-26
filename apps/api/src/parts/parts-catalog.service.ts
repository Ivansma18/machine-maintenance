import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { AuditService } from '../audit/audit.service';
import type { AuditContext } from '../audit/audit.types';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartDto } from './dto/create-part.dto';
import { ListPartsDto } from './dto/list-parts.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { partInclude, withStockState } from './parts.persistence';
import { rethrowPartPersistenceError } from './parts.errors';

@Injectable()
export class PartsCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: ListPartsDto) {
    const where: Prisma.PartWhereInput = {
      unit: query.unit,
      isActive: query.isActive,
      OR: query.search
        ? [
            { sku: { contains: query.search, mode: 'insensitive' } },
            { name: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.part.findMany({
        where,
        include: partInclude,
        orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.part.count({ where }),
    ]);
    return {
      data: data.map(withStockState),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(id: string) {
    const part = await this.prisma.part.findUnique({ where: { id }, include: partInclude });
    if (!part) throw new NotFoundException(`Part ${id} not found`);
    return withStockState(part);
  }

  async create(dto: CreatePartDto, context: AuditContext) {
    try {
      const part = await this.prisma.$transaction(async (tx) => {
        const created = await tx.part.create({
          data: {
            sku: dto.sku.trim(),
            name: dto.name.trim(),
            description: dto.description,
            unit: dto.unit,
            manufacturer: dto.manufacturer,
            manufacturerPartNumber: dto.manufacturerPartNumber,
            isCritical: dto.isCritical,
            inventory: {
              create: {
                quantityOnHand: dto.initialQuantity,
                minimumQuantity: dto.minimumQuantity,
                reorderQuantity: dto.reorderQuantity,
                unitCost: dto.unitCost,
              },
            },
          },
          include: partInclude,
        });
        await this.audit.record(
          {
            ...context,
            action: 'part.created',
            entityType: 'Part',
            entityId: created.id,
            after: created,
          },
          tx,
        );
        return created;
      });
      return withStockState(part);
    } catch (error) {
      rethrowPartPersistenceError(error);
    }
  }

  async update(id: string, dto: UpdatePartDto, context: AuditContext) {
    const before = await this.findOne(id);
    if (dto.unit && dto.unit !== before.unit) {
      const usageCount = await this.prisma.maintenanceLogPart.count({ where: { partId: id } });
      if (usageCount > 0)
        throw new ConflictException('A part unit cannot change after it has been consumed');
    }
    try {
      const part = await this.prisma.part.update({
        where: { id },
        data: {
          sku: dto.sku?.trim(),
          name: dto.name?.trim(),
          description: dto.description,
          unit: dto.unit,
          manufacturer: dto.manufacturer,
          manufacturerPartNumber: dto.manufacturerPartNumber,
          isCritical: dto.isCritical,
          isActive: dto.isActive,
        },
        include: partInclude,
      });
      await this.audit.record(
        {
          ...context,
          action:
            dto.isActive === false
              ? 'part.deactivated'
              : dto.isActive === true
                ? 'part.activated'
                : 'part.updated',
          entityType: 'Part',
          entityId: id,
          before,
          after: part,
        },
        this.prisma,
      );
      return withStockState(part);
    } catch (error) {
      rethrowPartPersistenceError(error);
    }
  }
}
