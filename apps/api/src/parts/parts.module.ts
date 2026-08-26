import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PartsController } from './parts.controller';
import { PartsService } from './parts.service';
import { PartsCatalogService } from './parts-catalog.service';
import { InventoryService } from './inventory.service';
import { MaintenanceLogPartsService } from './maintenance-log-parts.service';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [PartsController],
  providers: [PartsService, PartsCatalogService, InventoryService, MaintenanceLogPartsService],
  exports: [PartsService],
})
export class PartsModule {}
