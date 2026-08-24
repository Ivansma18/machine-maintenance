'use client';

import type { ReactNode } from 'react';

import { AntdProvider } from '@/components/providers/AntdProvider';
import { MotionProvider } from '@/components/providers/MotionProvider';

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AntdProvider>
      <MotionProvider>{children}</MotionProvider>
    </AntdProvider>
  );
}
