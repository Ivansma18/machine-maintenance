import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { MachinesModule } from './machines/machines.module';
import { MaintenancePlansModule } from './maintenance-plans/maintenance-plans.module';
import { MaintenanceLogsModule } from './maintenance-logs/maintenance-logs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['apps/api/.env', '.env'],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    DashboardModule,
    PrismaModule,
    HealthModule,
    MachinesModule,
    MaintenancePlansModule,
    MaintenanceLogsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
