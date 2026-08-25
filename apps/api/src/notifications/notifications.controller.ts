import { Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { RequirePermission } from '../authorization/decorators/require-permission.decorator';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermission('notifications:read')
  findAll(@Query() query: ListNotificationsDto) {
    return this.notificationsService.findAll(query);
  }

  @Post('process-preventive')
  @RequirePermission('notifications:process-preventive')
  processPreventiveNotifications() {
    return this.notificationsService.processPreventiveNotifications();
  }

  @Get(':id')
  @RequirePermission('notifications:read')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/acknowledge')
  @RequirePermission('notifications:acknowledge')
  acknowledge(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.notificationsService.acknowledge(id);
  }

  @Patch(':id/resolve')
  @RequirePermission('notifications:resolve')
  resolve(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.notificationsService.resolve(id);
  }

  @Patch(':id/dismiss')
  @RequirePermission('notifications:dismiss')
  dismiss(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.notificationsService.dismiss(id);
  }
}
