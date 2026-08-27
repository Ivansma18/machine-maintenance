import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
