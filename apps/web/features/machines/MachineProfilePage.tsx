'use client';

import Link from 'next/link';

import { AppShell } from '@/components/layout/AppShell';

import { MachineProfileContent } from './components/MachineProfileContent';
import { ErrorState, NotFoundState, ProfileSkeleton } from './components/MachineProfileStates';
import { useMachineProfile } from './hooks/useMachineProfile';

export function MachineProfilePage({ id }: { id: string }) {
  const query = useMachineProfile(id);

  return (
    <AppShell
      activeHref="/machines"
      header={{ eyebrow: 'Expediente tecnico', title: query.profile?.machine.name ?? 'Maquina' }}
    >
      <Link
        className="mb-6 inline-flex text-sm font-bold text-[#365441] underline underline-offset-4"
        href="/machines"
      >
        Volver a maquinas
      </Link>
      {query.loading && !query.profile ? <ProfileSkeleton /> : null}
      {!query.loading && query.errorStatus === 404 ? <NotFoundState /> : null}
      {!query.loading && query.error && query.errorStatus !== 404 ? (
        <ErrorState message={query.error} onRetry={query.retry} />
      ) : null}
      {query.profile ? (
        <MachineProfileContent onRefresh={query.retry} profile={query.profile} />
      ) : null}
    </AppShell>
  );
}
