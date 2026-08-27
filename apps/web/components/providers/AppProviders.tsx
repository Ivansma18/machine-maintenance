'use client';

import type { ReactNode } from 'react';

import { AntdProvider } from '@/components/providers/AntdProvider';
import { MotionProvider } from '@/components/providers/MotionProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AntdProvider>
      <SessionProvider>
        <MotionProvider>{children}</MotionProvider>
      </SessionProvider>
    </AntdProvider>
  );
}
