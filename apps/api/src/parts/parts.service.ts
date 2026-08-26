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
import { AddMaintenanceLogPartDto } from './dto/add-maintenance-log-part.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { CreatePartDto } from './dto/create-part.dto';
import { ListPartsDto } from './dto/list-parts.dto';
import { UpdatePartDto } from './dto/update-part.dto';

const partInclude = { inventory: true } satisfies Prisma.PartInclude;
const logPartInclude = {
  part: { include: { inventory: true } },
} satisfies Prisma.MaintenanceLogPartInclude;

@Injectable()
export class PartsService {
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
    const skip = (query.page - 1) * query.limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.part.findMany({
        where,
        include: partInclude,
        orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
        skip,
        take: query.limit,
      }),
      this.prisma.part.count({ where }),
    ]);
    return {
      data: data.map((part) => this.withStockState(part)),
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
    return this.withStockState(part);
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
      return this.withStockState(part);
    } catch (error) {
      this.rethrowKnownError(error);
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
      return this.withStockState(part);
    } catch (error) {
      this.rethrowKnownError(error);
    }
  }

  async inventory(query: ListPartsDto) {
    return this.findAll(query);
  }

  async adjustInventory(partId: string, dto: AdjustInventoryDto, context: AuditContext) {
    if (!Number.isFinite(dto.delta) || dto.delta === 0)
      throw new BadRequestException('delta must be a non-zero number');
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.inventoryItem.findUnique({
        where: { partId },
        include: { part: true },
      });
      if (!current) throw new NotFoundException(`Inventory for part ${partId} not found`);
      const nextQuantity = current.quantityOnHand + dto.delta;
      if (nextQuantity < 0) throw new ConflictException('Inventory cannot become negative');
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

  async addToMaintenanceLog(logId: string, dto: AddMaintenanceLogPartDto, context: AuditContext) {
    return this.prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.findUnique({
        where: { id: logId },
        select: { id: true, machineId: true },
      });
      if (!log) throw new NotFoundException(`Maintenance log ${logId} not found`);
      const part = await tx.part.findUnique({
        where: { id: dto.partId },
        include: { inventory: true },
      });
      if (!part) throw new NotFoundException(`Part ${dto.partId} not found`);
      if (!part.isActive) throw new ConflictException('Inactive parts cannot be consumed');
      if (!part.inventory) throw new ConflictException('Part has no inventory record');
      if (part.inventory.quantityOnHand < dto.quantity)
        throw new ConflictException('Insufficient inventory for this consumption');
      const updated = await tx.inventoryItem.updateMany({
        where: { id: part.inventory.id, quantityOnHand: { gte: dto.quantity } },
        data: { quantityOnHand: { decrement: dto.quantity } },
      });
      if (updated.count !== 1)
        throw new ConflictException('Inventory changed before consumption was applied');
      try {
        const line = await tx.maintenanceLogPart.create({
          data: {
            maintenanceLog: { connect: { id: logId } },
            part: { connect: { id: dto.partId } },
            quantity: dto.quantity,
            unitCostSnapshot: part.inventory.unitCost,
            notes: dto.notes,
          },
          include: logPartInclude,
        });
        await this.audit.record(
          {
            ...context,
            action: 'maintenance-log-part.created',
            entityType: 'MaintenanceLogPart',
            entityId: line.id,
            after: {
              line,
              machineId: log.machineId,
              quantityBefore: part.inventory.quantityOnHand,
              quantityAfter: part.inventory.quantityOnHand - dto.quantity,
            },
          },
          tx,
        );
        return line;
      } catch (error) {
        this.rethrowKnownError(error);
      }
    });
  }

  async findLogParts(logId: string) {
    return this.prisma.maintenanceLogPart.findMany({
      where: { maintenanceLogId: logId },
      include: logPartInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  private withStockState<
    T extends { inventory: { quantityOnHand: number; minimumQuantity: number } | null },
  >(part: T) {
    const inventory = part.inventory;
    return {
      ...part,
      inventory: inventory
        ? {
            ...inventory,
            stockState:
              inventory.quantityOnHand === 0
                ? 'OUT'
                : inventory.quantityOnHand <= inventory.minimumQuantity
                  ? 'LOW'
                  : 'AVAILABLE',
          }
        : null,
    };
  }

  private rethrowKnownError(error: unknown): never {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002')
      throw new ConflictException('A part with that SKU already exists');
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025')
      throw new NotFoundException('Part not found');
    throw error;
  }
}
