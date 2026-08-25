import type { Request } from 'express';

import type { AuthenticatedIdentity } from '../../auth/types/auth.types';

export type AuthenticatedRequest = Request & {
  identity?: AuthenticatedIdentity;
};
