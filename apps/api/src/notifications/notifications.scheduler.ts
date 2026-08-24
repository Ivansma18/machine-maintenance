import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'preventive-notifications',
    waitForCompletion: true,
  })
  async processPreventiveNotifications() {
    try {
      const result = await this.notificationsService.processPreventiveNotifications();
      this.logger.log(`Preventive notifications processed: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(
        'Preventive notification job failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
