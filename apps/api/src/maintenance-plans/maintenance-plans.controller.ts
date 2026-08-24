import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateMaintenancePlanDto } from './dto/create-maintenance-plan.dto';
import { ListMaintenancePlansDto } from './dto/list-maintenance-plans.dto';
import { UpdateMaintenancePlanDto } from './dto/update-maintenance-plan.dto';
import { MaintenancePlansService } from './maintenance-plans.service';

@Controller('maintenance-plans')
export class MaintenancePlansController {
  constructor(private readonly maintenancePlansService: MaintenancePlansService) {}

  @Post()
  create(@Body() dto: CreateMaintenancePlanDto) {
    return this.maintenancePlansService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListMaintenancePlansDto) {
    return this.maintenancePlansService.findAll(query);
  }

  @Patch(':id/activate')
  activate(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.maintenancePlansService.activate(id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.maintenancePlansService.deactivate(id);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.maintenancePlansService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateMaintenancePlanDto,
  ) {
    return this.maintenancePlansService.update(id, dto);
  }
}
