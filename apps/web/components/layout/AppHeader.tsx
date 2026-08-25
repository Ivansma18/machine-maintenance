import type { ReactNode } from 'react';

type AppHeaderProps = {
  eyebrow: string;
  title: string;
  action?: ReactNode;
  aside?: ReactNode;
};

export function AppHeader({ eyebrow, title, action, aside }: AppHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dfe4df] px-5 py-5 sm:px-8 lg:px-10">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mb-0 mt-2 text-2xl font-black tracking-[-0.04em] text-[#17211f] sm:text-3xl">
          {title}
        </h1>
      </div>
      {(aside ?? action) ? <div className="flex items-center gap-3">{aside ?? action}</div> : null}
    </header>
  );
}
