'use client';

import type { ReactNode } from 'react';

import * as m from 'motion/react-m';

import { list } from '@/lib/motion/presets';

export function AnimatedList({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <m.div animate="visible" initial="hidden" variants={list}>
      {children}
    </m.div>
  );
}
