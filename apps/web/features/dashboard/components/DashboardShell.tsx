import type { ReactNode } from 'react';

import { AnimatedSection } from '@/components/motion/AnimatedSection';
import { AppButton } from '@/components/ui/AppButton';
import { AppShell } from '@/components/layout/AppShell';

import { DashboardError } from './DashboardError';

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
    <AppShell
      activeHref="/"
      header={{
        eyebrow: 'Planta de produccion / todas las ubicaciones',
        title: 'Centro de control',
        aside: (
          <>
            <div className="hidden text-right sm:block">
              <p className="m-0 text-sm font-bold text-[#17211f]">Operaciones</p>
              <p className="m-0 text-xs text-[#68736f]">Vista de mantenimiento en vivo</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9e7db] text-xs font-black text-[#365441]">
              OP
            </div>
          </>
        ),
      }}
    >
      <AnimatedSection className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Estado operativo</p>
          <p className="mb-0 mt-3 max-w-xl text-sm leading-6 text-[#68736f]">
            Identifica lo que necesita atencion antes de que comience el siguiente turno.
          </p>
        </div>
        <AppButton loading={refreshing} variant="primary" onClick={onRunAlertScan}>
          Revisar alertas
        </AppButton>
      </AnimatedSection>
      {error ? <DashboardError message={error} onRetry={onRetry} /> : null}
      {children}
    </AppShell>
  );
}
