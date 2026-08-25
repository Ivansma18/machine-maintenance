import type { AuthIdentity } from '@/types/auth';

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type { AuthIdentity };
