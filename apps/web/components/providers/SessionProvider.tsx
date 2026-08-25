'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { ApiError } from '@/lib/api/client';

import {
  fetchCurrentIdentity,
  login as loginRequest,
  logout as logoutRequest,
} from '@/features/auth/api/authApi';
import type { AuthIdentity, LoginPayload } from '@/features/auth/types';

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

type SessionContextValue = {
  identity: AuthIdentity | null;
  status: SessionStatus;
  error: string | null;
  authorizationMessage: string | null;
  login: (payload: LoginPayload) => Promise<AuthIdentity>;
  logout: () => Promise<void>;
  clearAuthorizationMessage: () => void;
  hasPermission: (permission: string) => boolean;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const [identity, setIdentity] = useState<AuthIdentity | null>(null);
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [authorizationMessage, setAuthorizationMessage] = useState<string | null>(null);

  useEffect(() => {
    function handleUnauthorized() {
      setIdentity(null);
      setStatus('unauthenticated');
      if (window.location.pathname !== '/login') router.replace('/login');
    }

    function handleAuthError(event: Event) {
      const errorEvent = event as CustomEvent<ApiError>;
      if (errorEvent.detail?.status === 403) {
        setAuthorizationMessage('Tu cuenta no tiene permiso para completar esa accion.');
      }
    }

    window.addEventListener('app:auth-unauthorized', handleUnauthorized);
    window.addEventListener('app:auth-error', handleAuthError);

    return () => {
      window.removeEventListener('app:auth-unauthorized', handleUnauthorized);
      window.removeEventListener('app:auth-error', handleAuthError);
    };
  }, [router]);

  useEffect(() => {
    let active = true;

    void fetchCurrentIdentity()
      .then((currentIdentity) => {
        if (!active) return;
        setIdentity(currentIdentity);
        setStatus('authenticated');
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        if (!(requestError instanceof ApiError && requestError.status === 401)) {
          setError('No se pudo verificar la sesion.');
        }
        setIdentity(null);
        setStatus('unauthenticated');
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/login') {
      router.replace('/login');
    }
  }, [pathname, router, status]);

  const value = useMemo<SessionContextValue>(
    () => ({
      identity,
      status,
      error,
      authorizationMessage,
      async login(payload) {
        setError(null);
        const nextIdentity = await loginRequest(payload);
        setIdentity(nextIdentity);
        setStatus('authenticated');
        return nextIdentity;
      },
      async logout() {
        await logoutRequest();
        setIdentity(null);
        setStatus('unauthenticated');
        router.replace('/login');
      },
      clearAuthorizationMessage() {
        setAuthorizationMessage(null);
      },
      hasPermission(permission) {
        return identity?.permissions.includes(permission) ?? false;
      },
    }),
    [authorizationMessage, error, identity, router, status],
  );

  return (
    <SessionContext.Provider value={value}>
      {status === 'loading' || (status === 'unauthenticated' && pathname !== '/login') ? (
        <SessionLoading />
      ) : (
        children
      )}
      {authorizationMessage ? (
        <div
          className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between gap-4 rounded-2xl border border-[#e9aaa1] bg-[#fff1ee] p-4 text-sm font-semibold text-[#8e2f28] shadow-[0_12px_35px_rgba(35,55,43,0.12)] sm:inset-x-auto sm:right-6 sm:w-[min(28rem,calc(100vw-3rem))]"
          role="alert"
        >
          <span>{authorizationMessage}</span>
          <button
            className="shrink-0 text-xs font-black uppercase tracking-[0.1em]"
            type="button"
            onClick={() => setAuthorizationMessage(null)}
          >
            Cerrar
          </button>
        </div>
      ) : null}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used inside SessionProvider');
  }

  return context;
}

function SessionLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f5f1] px-6">
      <div className="flex items-center gap-3 text-sm font-bold text-[#68736f]" role="status">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#f2b84b]" />
        Verificando la sesion...
      </div>
    </main>
  );
}
