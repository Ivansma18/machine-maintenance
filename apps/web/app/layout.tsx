import type { Metadata } from 'next';

import { AppProviders } from '@/components/providers/AppProviders';

import './globals.css';

export const metadata: Metadata = {
  title: 'Pantry | Centro de mantenimiento',
  description: 'Planificacion operativa del mantenimiento de maquinaria de panaderia.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
