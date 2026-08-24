'use client';

import type { ReactNode } from 'react';

import * as m from 'motion/react-m';

import { fadeUp } from '@/lib/motion/presets';

export function AnimatedPage({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <m.main animate="visible" className="min-h-screen" initial="hidden" variants={fadeUp}>
      {children}
    </m.main>
  );
}
