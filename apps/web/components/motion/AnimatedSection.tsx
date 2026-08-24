'use client';

import type { ReactNode } from 'react';

import * as m from 'motion/react-m';

import { fadeUp } from '@/lib/motion/presets';

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
};

export function AnimatedSection({ children, className, id, delay = 0 }: AnimatedSectionProps) {
  return (
    <m.section
      animate="visible"
      className={className}
      id={id}
      initial="hidden"
      transition={{ delay }}
      variants={fadeUp}
    >
      {children}
    </m.section>
  );
}
