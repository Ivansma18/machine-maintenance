import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly indicator: HealthIndicatorService,
    private readonly prisma: PrismaService,
  ) {}

  async isHealthy(key: string) {
    const result = this.indicator.check(key);

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return result.up();
    } catch {
      return result.down({ message: 'PostgreSQL is unavailable' });
    }
  }
}
