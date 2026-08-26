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
import type { AuthenticatedRequest } from '../authorization/types/authenticated-request.type';
import { auditContextFromRequest } from '../audit/audit-context';
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
  create(@Body() dto: CreateMachineDto, @Req() request: AuthenticatedRequest) {
    return this.machinesService.create(dto, auditContextFromRequest(request));
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

  @Get(':id/profile')
  @RequirePermission('machines:read')
  findProfile(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.machinesService.findProfile(id);
  }

  @Patch(':id/deactivate')
  @RequirePermission('machines:retire')
  deactivate(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.machinesService.deactivate(id, auditContextFromRequest(request));
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
    @Req() request: AuthenticatedRequest,
  ) {
    return this.machinesService.update(id, dto, auditContextFromRequest(request));
  }
}
