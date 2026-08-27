import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import type { AuditContext } from '../audit/audit.types';
import { PrismaService } from '../prisma/prisma.service';
import { AddMaintenanceLogPartDto } from './dto/add-maintenance-log-part.dto';
import { logPartInclude } from './parts.persistence';
import { rethrowPartPersistenceError } from './parts.errors';

@Injectable()
export class MaintenanceLogPartsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}
  async add(logId: string, dto: AddMaintenanceLogPartDto, context: AuditContext) {
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
        rethrowPartPersistenceError(error);
      }
    });
  }
  findForLog(logId: string) {
    return this.prisma.maintenanceLogPart.findMany({
      where: { maintenanceLogId: logId },
      include: logPartInclude,
      orderBy: { createdAt: 'asc' },
    });
  }
  async findForMachine(machineId: string) {
    const logs = await this.prisma.maintenanceLog.findMany({
      where: { machineId },
      include: { parts: { include: { part: { include: { inventory: true } } } } },
      orderBy: { performedAt: 'desc' },
      take: 100,
    });
    const usage = new Map<
      string,
      {
        part: (typeof logs)[number]['parts'][number]['part'];
        totalQuantity: number;
        usageCount: number;
      }
    >();
    const recent = logs.flatMap((log) =>
      log.parts.map((line) => {
        const current = usage.get(line.partId);
        usage.set(line.partId, {
          part: line.part,
          totalQuantity: (current?.totalQuantity ?? 0) + line.quantity,
          usageCount: (current?.usageCount ?? 0) + 1,
        });
        return {
          id: line.id,
          maintenanceLogId: log.id,
          performedAt: log.performedAt,
          quantity: line.quantity,
          notes: line.notes,
          part: line.part,
        };
      }),
    );
    return {
      recent,
      summary: Array.from(usage.values()).map(({ part, totalQuantity, usageCount }) => ({
        part,
        totalQuantity,
        usageCount,
      })),
    };
  }
}
