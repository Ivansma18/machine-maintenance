import type { ReactNode } from 'react';

export function ProfileDetail({
  label,
  value,
  dark = false,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div>
      <dt className={`eyebrow ${dark ? '!text-[#b8c7bc]' : ''}`}>{label}</dt>
      <dd className={`m-0 mt-1 text-sm font-semibold ${dark ? 'text-white' : 'text-[#17211f]'}`}>
        {value}
      </dd>
    </div>
  );
}

export function ProfileEmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="p-8 text-center">
      <h2 className="m-0 text-base font-black text-[#17211f]">{title}</h2>
      <p className="mb-0 mt-2 text-sm text-[#68736f]">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
