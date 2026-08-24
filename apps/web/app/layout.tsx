import type { Metadata } from 'next';

import { AppProviders } from '@/components/providers/AppProviders';

import './globals.css';

export const metadata: Metadata = {
  title: 'Pantry | Maintenance control room',
  description: 'Operational maintenance planning for bakery machinery.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
