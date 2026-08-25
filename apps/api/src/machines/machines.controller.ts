import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { RequirePermission } from '../authorization/decorators/require-permission.decorator';
import { CreateMachineDto } from './dto/create-machine.dto';
import { ListMachinesDto } from './dto/list-machines.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { MachinesService } from './machines.service';

@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Post()
  @RequirePermission('machines:create')
  create(@Body() dto: CreateMachineDto) {
    return this.machinesService.create(dto);
  }

  @Get()
  @RequirePermission('machines:read')
  findAll(@Query() query: ListMachinesDto) {
    return this.machinesService.findAll(query);
  }

  @Get('categories')
  @RequirePermission('machines:read')
  findCategories() {
    return this.machinesService.findCategories();
  }

  @Patch(':id/deactivate')
  @RequirePermission('machines:retire')
  deactivate(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.machinesService.deactivate(id);
  }

  @Get(':id')
  @RequirePermission('machines:read')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.machinesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('machines:update')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateMachineDto,
  ) {
    return this.machinesService.update(id, dto);
  }
}
