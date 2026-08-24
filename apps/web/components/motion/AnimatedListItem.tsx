'use client';

import type { ReactNode } from 'react';

import * as m from 'motion/react-m';

import { listItem } from '@/lib/motion/presets';

type AnimatedListItemProps = {
  children: ReactNode;
  className?: string;
};

export function AnimatedListItem({ children, className }: AnimatedListItemProps) {
  return (
    <m.div className={className} variants={listItem}>
      {children}
    </m.div>
  );
}
