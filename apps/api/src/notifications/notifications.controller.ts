import { Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Query() query: ListNotificationsDto) {
    return this.notificationsService.findAll(query);
  }

  @Post('process-preventive')
  processPreventiveNotifications() {
    return this.notificationsService.processPreventiveNotifications();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/acknowledge')
  acknowledge(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.notificationsService.acknowledge(id);
  }

  @Patch(':id/resolve')
  resolve(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.notificationsService.resolve(id);
  }

  @Patch(':id/dismiss')
  dismiss(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.notificationsService.dismiss(id);
  }
}
