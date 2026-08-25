import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { RequirePermission } from '../authorization/decorators/require-permission.decorator';
import { CreateMaintenanceLogDto } from './dto/create-maintenance-log.dto';
import { ListMaintenanceLogsDto } from './dto/list-maintenance-logs.dto';
import { MaintenanceLogsService } from './maintenance-logs.service';

@Controller('maintenance-logs')
export class MaintenanceLogsController {
  constructor(private readonly maintenanceLogsService: MaintenanceLogsService) {}

  @Post()
  @RequirePermission('maintenance-logs:create')
  create(@Body() dto: CreateMaintenanceLogDto) {
    return this.maintenanceLogsService.create(dto);
  }

  @Get()
  @RequirePermission('maintenance-logs:read')
  findAll(@Query() query: ListMaintenanceLogsDto) {
    return this.maintenanceLogsService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('maintenance-logs:read')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.maintenanceLogsService.findOne(id);
  }
}
