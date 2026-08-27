import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { RequirePermission } from '../authorization/decorators/require-permission.decorator';
import { auditContextFromRequest } from '../audit/audit-context';
import type { AuthenticatedRequest } from '../authorization/types/authenticated-request.type';
import { CreateAreaDto } from './dto/create-area.dto';
import { CreateProductionLineDto } from './dto/create-production-line.dto';
import { CreateSiteDto } from './dto/create-site.dto';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locations: LocationsService) {}
  @Get() @RequirePermission('locations:read') findAll() {
    return this.locations.findAll();
  }
  @Post('sites') @RequirePermission('locations:manage') createSite(
    @Body() dto: CreateSiteDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.locations.createSite(dto, auditContextFromRequest(req));
  }
  @Post('areas') @RequirePermission('locations:manage') createArea(
    @Body() dto: CreateAreaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.locations.createArea(dto, auditContextFromRequest(req));
  }
  @Post('lines') @RequirePermission('locations:manage') createLine(
    @Body() dto: CreateProductionLineDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.locations.createLine(dto, auditContextFromRequest(req));
  }
}
