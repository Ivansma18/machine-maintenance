'use client';

import type { ReactNode } from 'react';

import { useSession } from '@/hooks/useSession';

type PermissionGateProps = {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
};

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasPermission } = useSession();
  return hasPermission(permission) ? children : fallback;
}
