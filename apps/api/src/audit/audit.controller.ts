import { Controller, Get, Query } from '@nestjs/common';
import { RequirePermission } from '../authorization/decorators/require-permission.decorator';
import { AuditQueryService } from './audit-query.service';
import { ListAuditEventsDto } from './dto/list-audit-events.dto';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditQuery: AuditQueryService) {}

  @Get()
  @RequirePermission('audit:read')
  findAll(@Query() query: ListAuditEventsDto) {
    return this.auditQuery.findAll(query);
  }
}
