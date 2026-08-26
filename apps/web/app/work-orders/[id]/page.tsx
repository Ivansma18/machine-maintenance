'use client';

import { use } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { AppPanel } from '@/components/ui/AppPanel';
import { WorkOrderDetail } from '@/features/work-orders/components/WorkOrderDetail';
import { useWorkOrder } from '@/features/work-orders/hooks/useWorkOrder';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const query = useWorkOrder(id);
  return (
    <AppShell
      activeHref="/work-orders"
      header={{ eyebrow: 'Detalle operativo', title: query.order?.title ?? 'Orden de trabajo' }}
    >
      <Link
        className="mb-6 inline-flex text-sm font-bold text-[#365441] underline underline-offset-4"
        href="/work-orders"
      >
        Volver a órdenes
      </Link>
      <AppPanel title="Orden de trabajo" eyebrow="Seguimiento">
        {query.loading ? (
          <div className="h-48 animate-pulse rounded-xl bg-[#e8ece8]" />
        ) : query.error ? (
          <p className="text-sm text-[#8e2f28]" role="alert">
            {query.error}
          </p>
        ) : query.order ? (
          <WorkOrderDetail
            order={query.order}
            loading={false}
            onAssign={() => undefined}
            onStart={() => undefined}
            onComplete={() => undefined}
            onCancel={() => undefined}
          />
        ) : null}
      </AppPanel>
    </AppShell>
  );
}
