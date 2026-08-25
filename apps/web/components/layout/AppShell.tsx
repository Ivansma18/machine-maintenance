import type { ReactNode } from 'react';

import { AnimatedPage } from '@/components/motion/AnimatedPage';

import { AppHeader } from './AppHeader';
import { OperationsSidebar } from './OperationsSidebar';

type AppShellProps = {
  activeHref: string;
  header: {
    eyebrow: string;
    title: string;
    action?: ReactNode;
    aside?: ReactNode;
  };
  children: ReactNode;
};

export function AppShell({ activeHref, header, children }: AppShellProps) {
  return (
    <AnimatedPage>
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col lg:flex-row">
        <OperationsSidebar activeHref={activeHref} />
        <div className="min-w-0 flex-1">
          <AppHeader {...header} />
          <main className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-12">{children}</main>
        </div>
      </div>
    </AnimatedPage>
  );
}
