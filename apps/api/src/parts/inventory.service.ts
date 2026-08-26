import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { AuditService } from '../audit/audit.service';
import type { AuditContext } from '../audit/audit.types';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { ListPartsDto } from './dto/list-parts.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}
  async findAll(query: ListPartsDto) {
    const where: Prisma.PartWhereInput = { unit: query.unit, isActive: query.isActive };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.part.findMany({
        where,
        include: { inventory: true },
        orderBy: { name: 'asc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.part.count({ where }),
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
  async adjust(partId: string, dto: AdjustInventoryDto, context: AuditContext) {
    if (!Number.isFinite(dto.delta) || dto.delta === 0)
      throw new BadRequestException('delta must be a non-zero number');
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.inventoryItem.findUnique({
        where: { partId },
        include: { part: true },
      });
      if (!current) throw new NotFoundException(`Inventory for part ${partId} not found`);
      if (current.quantityOnHand + dto.delta < 0)
        throw new ConflictException('Inventory cannot become negative');
      const updated = await tx.inventoryItem.updateMany({
        where: {
          id: current.id,
          ...(dto.delta < 0 ? { quantityOnHand: { gte: Math.abs(dto.delta) } } : {}),
        },
        data: { quantityOnHand: { increment: dto.delta } },
      });
      if (updated.count !== 1)
        throw new ConflictException('Inventory changed before the adjustment was applied');
      const after = await tx.inventoryItem.findUnique({
        where: { id: current.id },
        include: { part: true },
      });
      await this.audit.record(
        {
          ...context,
          action: 'inventory.adjusted',
          entityType: 'InventoryItem',
          entityId: current.id,
          reason: dto.reason,
          before: current,
          after,
        },
        tx,
      );
      return after;
    });
  }
}
