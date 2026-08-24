import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MaintenanceLogsController } from './maintenance-logs.controller';
import { MaintenanceLogsService } from './maintenance-logs.service';

@Module({
  imports: [PrismaModule],
  controllers: [MaintenanceLogsController],
  providers: [MaintenanceLogsService],
  exports: [MaintenanceLogsService],
})
export class MaintenanceLogsModule {}
