import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListAuditEventsDto } from './dto/list-audit-events.dto';

@Injectable()
export class AuditQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListAuditEventsDto) {
    const where = {
      actorId: query.actor ? { contains: query.actor, mode: 'insensitive' as const } : undefined,
      action: query.action ? { contains: query.action, mode: 'insensitive' as const } : undefined,
      entityType: query.entityType
        ? { contains: query.entityType, mode: 'insensitive' as const }
        : undefined,
      entityId: query.entityId
        ? { contains: query.entityId, mode: 'insensitive' as const }
        : undefined,
      requestId: query.requestId
        ? { contains: query.requestId, mode: 'insensitive' as const }
        : undefined,
      createdAt: {
        gte: query.from ? new Date(query.from) : undefined,
        lte: query.to ? new Date(`${query.to}T23:59:59.999Z`) : undefined,
      },
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.auditEvent.count({ where }),
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
}
