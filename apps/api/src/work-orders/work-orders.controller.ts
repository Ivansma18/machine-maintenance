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
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';
import { CancelWorkOrderDto } from './dto/cancel-work-order.dto';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { CompleteWorkOrderDto } from './dto/complete-work-order.dto';
import { ListWorkOrdersDto } from './dto/list-work-orders.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { WorkOrdersService } from './work-orders.service';

@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  @RequirePermission('work-orders:create')
  create(@Body() dto: CreateWorkOrderDto, @Req() request: AuthenticatedRequest) {
    return this.workOrdersService.create(dto, auditContextFromRequest(request));
  }

  @Get()
  @RequirePermission('work-orders:read')
  findAll(@Query() query: ListWorkOrdersDto) {
    return this.workOrdersService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('work-orders:read')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.workOrdersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('work-orders:update')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateWorkOrderDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workOrdersService.update(id, dto, auditContextFromRequest(request));
  }

  @Patch(':id/assign')
  @RequirePermission('work-orders:assign')
  assign(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AssignWorkOrderDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workOrdersService.assign(id, dto, auditContextFromRequest(request));
  }

  @Patch(':id/start')
  @RequirePermission('work-orders:start')
  start(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workOrdersService.start(id, auditContextFromRequest(request));
  }

  @Patch(':id/complete')
  @RequirePermission('work-orders:complete')
  complete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: CompleteWorkOrderDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workOrdersService.complete(id, dto, auditContextFromRequest(request));
  }

  @Patch(':id/cancel')
  @RequirePermission('work-orders:cancel')
  cancel(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: CancelWorkOrderDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.workOrdersService.cancel(id, dto, auditContextFromRequest(request));
  }
}
