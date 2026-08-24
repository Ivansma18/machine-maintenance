import type { ReactNode } from 'react';

import { AnimatedPage } from '@/components/motion/AnimatedPage';
import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { AppButton } from '@/components/ui/AppButton';

import { DashboardError } from './DashboardError';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';

type DashboardShellProps = {
  children: ReactNode;
  error: string | null;
  refreshing: boolean;
  onRetry: () => void;
  onRunAlertScan: () => void;
};

export function DashboardShell({
  children,
  error,
  refreshing,
  onRetry,
  onRunAlertScan,
}: DashboardShellProps) {
  return (
    <AnimatedPage>
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <DashboardSidebar />
        <div className="min-w-0 flex-1">
          <DashboardHeader />
          <main className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-12" id="overview">
            <AnimatedSection className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">Operational pulse</p>
                <p className="mb-0 mt-3 max-w-xl text-sm leading-6 text-[#68736f]">
                  See what needs attention before the next bakery shift starts.
                </p>
              </div>
              <AppButton loading={refreshing} variant="primary" onClick={onRunAlertScan}>
                Run alert scan
              </AppButton>
            </AnimatedSection>
            {error ? <DashboardError message={error} onRetry={onRetry} /> : null}
            {children}
          </main>
        </div>
      </div>
    </AnimatedPage>
  );
}
