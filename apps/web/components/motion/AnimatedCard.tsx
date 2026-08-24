'use client';

import type { ReactNode } from 'react';

import * as m from 'motion/react-m';

import { fadeUp } from '@/lib/motion/presets';

type AnimatedCardProps = {
  children: ReactNode;
  className?: string;
};

export function AnimatedCard({ children, className }: AnimatedCardProps) {
  return (
    <m.div
      animate="visible"
      className={className}
      initial="hidden"
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      variants={fadeUp}
    >
      {children}
    </m.div>
  );
}
