import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { auditContextFromRequest } from '../audit/audit-context';
import { RequirePermission } from '../authorization/decorators/require-permission.decorator';
import type { AuthenticatedRequest } from '../authorization/types/authenticated-request.type';
import { CreateMaintenanceLogDto } from './dto/create-maintenance-log.dto';
import { ListMaintenanceLogsDto } from './dto/list-maintenance-logs.dto';
import { MaintenanceLogsService } from './maintenance-logs.service';

@Controller('maintenance-logs')
export class MaintenanceLogsController {
  constructor(private readonly maintenanceLogsService: MaintenanceLogsService) {}

  @Post()
  @RequirePermission('maintenance-logs:create')
  create(@Body() dto: CreateMaintenanceLogDto, @Req() request: AuthenticatedRequest) {
    return this.maintenanceLogsService.create(dto, auditContextFromRequest(request));
  }

  @Get()
  @RequirePermission('maintenance-logs:read')
  findAll(@Query() query: ListMaintenanceLogsDto) {
    return this.maintenanceLogsService.findAll(query);
  }

  @Get('metrics/recurrence')
  @RequirePermission('maintenance-logs:read')
  recurrenceMetrics() {
    return this.maintenanceLogsService.recurrenceMetrics();
  }

  @Get(':id')
  @RequirePermission('maintenance-logs:read')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.maintenanceLogsService.findOne(id);
  }
}
