import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { MaintenancePlansController } from './maintenance-plans.controller';
import { MaintenancePlansService } from './maintenance-plans.service';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [MaintenancePlansController],
  providers: [MaintenancePlansService],
  exports: [MaintenancePlansService],
})
export class MaintenancePlansModule {}
