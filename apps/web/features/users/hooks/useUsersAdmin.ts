'use client';

import { useEffect, useState } from 'react';
import {
  assignUserRoles,
  createUser,
  fetchRoles,
  fetchUsers,
  resetUserPassword,
  updateUserStatus,
} from '../api/usersApi';
import type { CreateUserValues, ManagedUser, UserRole } from '../types';

export function useUsersAdmin() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    void Promise.all([fetchUsers(controller.signal), fetchRoles(controller.signal)])
      .then(([userResult, roleResult]) => {
        setUsers(userResult);
        setRoles(roleResult);
      })
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError'))
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'No se pudieron cargar los usuarios.',
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [refreshKey]);
  async function run(action: () => Promise<unknown>) {
    setActionLoading(true);
    setError(null);
    setFeedback(null);
    try {
      await action();
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'No se pudo completar la acción.',
      );
      throw requestError;
    } finally {
      setActionLoading(false);
    }
  }
  return {
    users,
    roles,
    loading,
    actionLoading,
    error,
    feedback,
    setFeedback,
    retry: () => setRefreshKey((value) => value + 1),
    create: (values: CreateUserValues) => run(() => createUser(values)),
    toggle: (user: ManagedUser) => run(() => updateUserStatus(user.id, !user.isActive)),
    assignRoles: (id: string, roleIds: string[]) => run(() => assignUserRoles(id, roleIds)),
    resetPassword: (id: string) =>
      run(async () => {
        const result = await resetUserPassword(id);
        setFeedback(`Password temporal: ${result.temporaryPassword}`);
      }),
  };
}
