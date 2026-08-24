'use client';

import type { ReactNode } from 'react';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';

import { theme } from '@/lib/ui/theme';

export function AntdProvider({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AntdRegistry>
      <ConfigProvider locale={enUS} theme={theme}>
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
