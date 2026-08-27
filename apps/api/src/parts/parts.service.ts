import { Injectable } from '@nestjs/common';
import type { AuditContext } from '../audit/audit.types';
import { AddMaintenanceLogPartDto } from './dto/add-maintenance-log-part.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { CreatePartDto } from './dto/create-part.dto';
import { ListPartsDto } from './dto/list-parts.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { InventoryService } from './inventory.service';
import { MaintenanceLogPartsService } from './maintenance-log-parts.service';
import { PartsCatalogService } from './parts-catalog.service';

@Injectable()
export class PartsService {
  constructor(
    private readonly catalog: PartsCatalogService,
    private readonly inventoryService: InventoryService,
    private readonly logParts: MaintenanceLogPartsService,
  ) {}

  findAll(query: ListPartsDto) {
    return this.catalog.findAll(query);
  }
  findOne(id: string) {
    return this.catalog.findOne(id);
  }
  create(dto: CreatePartDto, context: AuditContext) {
    return this.catalog.create(dto, context);
  }
  update(id: string, dto: UpdatePartDto, context: AuditContext) {
    return this.catalog.update(id, dto, context);
  }
  inventory(query: ListPartsDto) {
    return this.inventoryService.findAll(query);
  }
  adjustInventory(partId: string, dto: AdjustInventoryDto, context: AuditContext) {
    return this.inventoryService.adjust(partId, dto, context);
  }
  addToMaintenanceLog(logId: string, dto: AddMaintenanceLogPartDto, context: AuditContext) {
    return this.logParts.add(logId, dto, context);
  }
  findLogParts(logId: string) {
    return this.logParts.findForLog(logId);
  }
  findMachineParts(machineId: string) {
    return this.logParts.findForMachine(machineId);
  }
}
