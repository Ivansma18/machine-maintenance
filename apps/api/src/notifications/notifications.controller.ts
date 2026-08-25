import { Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { auditContextFromRequest } from '../audit/audit-context';
import { RequirePermission } from '../authorization/decorators/require-permission.decorator';
import type { AuthenticatedRequest } from '../authorization/types/authenticated-request.type';
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
  processPreventiveNotifications(@Req() request: AuthenticatedRequest) {
    return this.notificationsService.processPreventiveNotifications(
      new Date(),
      auditContextFromRequest(request),
    );
  }

  @Get(':id')
  @RequirePermission('notifications:read')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/acknowledge')
  @RequirePermission('notifications:acknowledge')
  acknowledge(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.notificationsService.acknowledge(id, auditContextFromRequest(request));
  }

  @Patch(':id/resolve')
  @RequirePermission('notifications:resolve')
  resolve(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.notificationsService.resolve(id, auditContextFromRequest(request));
  }

  @Patch(':id/dismiss')
  @RequirePermission('notifications:dismiss')
  dismiss(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.notificationsService.dismiss(id, auditContextFromRequest(request));
  }
}
