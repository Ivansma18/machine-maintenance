'use client';

import type { ReactNode } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { useSession } from '@/hooks/useSession';

type AppHeaderProps = {
  eyebrow: string;
  title: string;
  action?: ReactNode;
  aside?: ReactNode;
};

export function AppHeader({ eyebrow, title, action, aside }: AppHeaderProps) {
  const { identity, logout } = useSession();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dfe4df] px-5 py-5 sm:px-8 lg:px-10">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mb-0 mt-2 text-2xl font-black tracking-[-0.04em] text-[#17211f] sm:text-3xl">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {aside ?? action}
        {identity ? (
          <div className="flex items-center gap-3 border-l border-[#dfe4df] pl-3">
            <div className="hidden text-right sm:block">
              <p className="m-0 text-xs font-black text-[#17211f]">{identity.user.name}</p>
              <p className="m-0 text-[0.65rem] font-semibold text-[#68736f]">
                {identity.user.username}
              </p>
            </div>
            <AppButton variant="quiet" onClick={() => void logout()}>
              Salir
            </AppButton>
          </div>
        ) : null}
      </div>
    </header>
  );
}
