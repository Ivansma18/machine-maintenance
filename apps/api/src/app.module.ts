import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HealthModule } from './health/health.module';
import { MachinesModule } from './machines/machines.module';
import { MaintenancePlansModule } from './maintenance-plans/maintenance-plans.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['apps/api/.env', '.env'],
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    MachinesModule,
    MaintenancePlansModule,
  ],
})
export class AppModule {}
