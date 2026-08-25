import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateMachineDto } from './dto/create-machine.dto';
import { ListMachinesDto } from './dto/list-machines.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { MachinesService } from './machines.service';

@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Post()
  create(@Body() dto: CreateMachineDto) {
    return this.machinesService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListMachinesDto) {
    return this.machinesService.findAll(query);
  }

  @Get('categories')
  findCategories() {
    return this.machinesService.findCategories();
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.machinesService.deactivate(id);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.machinesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateMachineDto,
  ) {
    return this.machinesService.update(id, dto);
  }
}
