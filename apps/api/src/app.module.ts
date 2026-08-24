import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HealthModule } from './health/health.module';
import { MachinesModule } from './machines/machines.module';
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
  ],
})
export class AppModule {}
