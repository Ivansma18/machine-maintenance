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
import { AddMaintenanceLogPartDto } from './dto/add-maintenance-log-part.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { CreatePartDto } from './dto/create-part.dto';
import { ListPartsDto } from './dto/list-parts.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PartsService } from './parts.service';

@Controller()
export class PartsController {
  constructor(private readonly parts: PartsService) {}

  @Get('parts') @RequirePermission('parts:read') findAll(@Query() query: ListPartsDto) {
    return this.parts.findAll(query);
  }
  @Post('parts') @RequirePermission('parts:create') create(
    @Body() dto: CreatePartDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.parts.create(dto, auditContextFromRequest(req));
  }
  @Get('parts/:id') @RequirePermission('parts:read') findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.parts.findOne(id);
  }
  @Patch('parts/:id') @RequirePermission('parts:update') update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdatePartDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.parts.update(id, dto, auditContextFromRequest(req));
  }
  @Get('inventory') @RequirePermission('inventory:read') inventory(@Query() query: ListPartsDto) {
    return this.parts.inventory(query);
  }
  @Patch('inventory/:partId/adjust') @RequirePermission('inventory:adjust') adjust(
    @Param('partId', new ParseUUIDPipe({ version: '4' })) partId: string,
    @Body() dto: AdjustInventoryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.parts.adjustInventory(partId, dto, auditContextFromRequest(req));
  }
  @Get('maintenance-logs/:id/parts') @RequirePermission('maintenance-logs:read') findLogParts(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.parts.findLogParts(id);
  }
  @Post('maintenance-logs/:id/parts') @RequirePermission('maintenance-logs:parts') addToLog(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AddMaintenanceLogPartDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.parts.addToMaintenanceLog(id, dto, auditContextFromRequest(req));
  }

  @Get('machines/:id/parts') @RequirePermission('parts:read') findMachineParts(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.parts.findMachineParts(id);
  }
}
