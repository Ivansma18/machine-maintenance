import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AuditContext } from '../audit/audit.types';
import { CreateAreaDto } from './dto/create-area.dto';
import { CreateProductionLineDto } from './dto/create-production-line.dto';
import { CreateSiteDto } from './dto/create-site.dto';

const locationInclude = {
  areas: { orderBy: { name: 'asc' }, include: { lines: { orderBy: { name: 'asc' } } } },
} satisfies Prisma.SiteInclude;

@Injectable()
export class LocationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}
  findAll() {
    return this.prisma.site.findMany({
      where: { isActive: true },
      include: locationInclude,
      orderBy: { name: 'asc' },
    });
  }
  async createSite(dto: CreateSiteDto, context: AuditContext) {
    const site = await this.prisma.site.create({
      data: { name: dto.name.trim(), description: dto.description?.trim() || undefined },
      include: locationInclude,
    });
    await this.audit.record({
      ...context,
      action: 'site.created',
      entityType: 'Site',
      entityId: site.id,
      after: site,
    });
    return site;
  }
  async createArea(dto: CreateAreaDto, context: AuditContext) {
    const site = await this.prisma.site.findUnique({
      where: { id: dto.siteId },
      select: { id: true },
    });
    if (!site) throw new NotFoundException(`Site ${dto.siteId} not found`);
    const area = await this.prisma.area.create({
      data: { site: { connect: { id: dto.siteId } }, name: dto.name.trim() },
      include: { site: true, lines: true },
    });
    await this.audit.record({
      ...context,
      action: 'area.created',
      entityType: 'Area',
      entityId: area.id,
      after: area,
    });
    return area;
  }
  async createLine(dto: CreateProductionLineDto, context: AuditContext) {
    const area = await this.prisma.area.findUnique({
      where: { id: dto.areaId },
      select: { id: true },
    });
    if (!area) throw new NotFoundException(`Area ${dto.areaId} not found`);
    const line = await this.prisma.productionLine.create({
      data: { area: { connect: { id: dto.areaId } }, name: dto.name.trim() },
      include: { area: true },
    });
    await this.audit.record({
      ...context,
      action: 'production-line.created',
      entityType: 'ProductionLine',
      entityId: line.id,
      after: line,
    });
    return line;
  }
}
