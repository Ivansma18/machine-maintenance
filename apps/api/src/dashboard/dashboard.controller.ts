import { Controller, Get } from '@nestjs/common';
import { RequirePermission } from '../authorization/decorators/require-permission.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @RequirePermission('dashboard:read')
  getSummary() {
    return this.dashboardService.getSummary();
  }
}
