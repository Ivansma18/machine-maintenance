import { SetMetadata } from '@nestjs/common';

import { REQUIRED_PERMISSION_KEY } from '../authorization.constants';

export const RequirePermission = (permission: string) =>
  SetMetadata(REQUIRED_PERMISSION_KEY, permission);
