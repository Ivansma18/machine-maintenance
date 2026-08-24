import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { CreateMaintenanceLogDto } from './dto/create-maintenance-log.dto';
import { ListMaintenanceLogsDto } from './dto/list-maintenance-logs.dto';
import { MaintenanceLogsService } from './maintenance-logs.service';

@Controller('maintenance-logs')
export class MaintenanceLogsController {
  constructor(private readonly maintenanceLogsService: MaintenanceLogsService) {}

  @Post()
  create(@Body() dto: CreateMaintenanceLogDto) {
    return this.maintenanceLogsService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListMaintenanceLogsDto) {
    return this.maintenanceLogsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.maintenanceLogsService.findOne(id);
  }
}
