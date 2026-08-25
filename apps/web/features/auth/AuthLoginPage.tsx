'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';

import { AnimatedPage } from '@/components/motion/AnimatedPage';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { useSession } from '@/hooks/useSession';
import { ApiError } from '@/lib/api/client';

export function AuthLoginPage() {
  const router = useRouter();
  const { login } = useSession();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login({ identifier, password });
      router.replace('/');
    } catch (requestError: unknown) {
      setError(
        requestError instanceof ApiError && requestError.status === 401
          ? 'El usuario o la contraseña no son validos.'
          : 'No se pudo iniciar sesion. Intenta de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatedPage>
      <main className="grid min-h-screen bg-[#f4f5f1] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden bg-[#17211f] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div>
            <div className="mb-16 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f2b84b] text-sm font-black text-[#17211f]">
                P
              </div>
              <span className="text-sm font-black tracking-[0.2em]">PANTRY</span>
            </div>
            <p className="max-w-md text-5xl font-black leading-[0.95] tracking-[-0.06em]">
              Mantén el ritmo de tu planta.
            </p>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#b7c4ba]">
            Un punto de control para máquinas, planes preventivos, historial y alertas operativas.
          </p>
        </section>
        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <p className="m-0 text-sm font-black tracking-[0.2em] text-[#17211f]">PANTRY</p>
              <p className="m-0 mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#68736f]">
                Sistema de mantenimiento
              </p>
            </div>
            <p className="eyebrow">Acceso operativo</p>
            <h1 className="mb-3 mt-3 text-4xl font-black tracking-[-0.06em] text-[#17211f]">
              Entra a tu centro de mantenimiento
            </h1>
            <p className="mb-8 max-w-sm text-sm leading-6 text-[#68736f]">
              Usa tu nombre de usuario o correo corporativo para continuar.
            </p>
            <form className="grid gap-5" onSubmit={submit}>
              <label className="grid gap-2 text-sm font-bold text-[#17211f]">
                Usuario o correo
                <AppInput
                  autoComplete="username"
                  placeholder="admin o nombre@empresa.com"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-[#17211f]">
                Contraseña
                <AppInput
                  autoComplete="current-password"
                  placeholder="Escribe tu contraseña"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              {error ? (
                <div
                  className="rounded-xl border border-[#f3d7d2] bg-[#fff7f5] p-4 text-sm font-semibold text-[#8e2f28]"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}
              <AppButton block htmlType="submit" loading={submitting} size="large">
                Iniciar sesion
              </AppButton>
            </form>
            <p className="mt-8 text-xs leading-5 text-[#68736f]">
              Si tu sesion estuvo inactiva durante siete dias, vuelve a iniciar sesion para
              continuar.
            </p>
          </div>
        </section>
      </main>
    </AnimatedPage>
  );
}
