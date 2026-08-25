import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { MachinesController } from './machines.controller';
import { MachinesService } from './machines.service';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [MachinesController],
  providers: [MachinesService],
  exports: [MachinesService],
})
export class MachinesModule {}
