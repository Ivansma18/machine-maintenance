import type { ReactNode } from 'react';

import { Card } from 'antd';

export type AppPanelProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  eyebrow?: string;
  extra?: ReactNode;
};

export function AppPanel({ children, className, title, eyebrow, extra }: AppPanelProps) {
  return (
    <Card
      className={className}
      styles={{ body: { padding: 0 } }}
      title={
        title ? (
          <div className="flex flex-col gap-1 py-1">
            {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
            <span className="text-base font-bold text-[#17211f]">{title}</span>
          </div>
        ) : undefined
      }
      extra={extra}
    >
      {children}
    </Card>
  );
}
