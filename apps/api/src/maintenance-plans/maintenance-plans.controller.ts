import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { auditContextFromRequest } from '../audit/audit-context';
import { RequirePermission } from '../authorization/decorators/require-permission.decorator';
import type { AuthenticatedRequest } from '../authorization/types/authenticated-request.type';
import { CreateMaintenancePlanDto } from './dto/create-maintenance-plan.dto';
import { ListMaintenancePlansDto } from './dto/list-maintenance-plans.dto';
import { UpdateMaintenancePlanDto } from './dto/update-maintenance-plan.dto';
import { MaintenancePlansService } from './maintenance-plans.service';

@Controller('maintenance-plans')
export class MaintenancePlansController {
  constructor(private readonly maintenancePlansService: MaintenancePlansService) {}

  @Post()
  @RequirePermission('maintenance-plans:create')
  create(@Body() dto: CreateMaintenancePlanDto, @Req() request: AuthenticatedRequest) {
    return this.maintenancePlansService.create(dto, auditContextFromRequest(request));
  }

  @Get()
  @RequirePermission('maintenance-plans:read')
  findAll(@Query() query: ListMaintenancePlansDto) {
    return this.maintenancePlansService.findAll(query);
  }

  @Patch(':id/activate')
  @RequirePermission('maintenance-plans:activate')
  activate(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.maintenancePlansService.activate(id, auditContextFromRequest(request));
  }

  @Patch(':id/deactivate')
  @RequirePermission('maintenance-plans:deactivate')
  deactivate(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.maintenancePlansService.deactivate(id, auditContextFromRequest(request));
  }

  @Get(':id')
  @RequirePermission('maintenance-plans:read')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.maintenancePlansService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('maintenance-plans:update')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateMaintenancePlanDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.maintenancePlansService.update(id, dto, auditContextFromRequest(request));
  }
}
