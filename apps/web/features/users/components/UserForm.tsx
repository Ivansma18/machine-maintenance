'use client';

import { useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import type { CreateUserValues, UserRole } from '../types';

export function UserForm({
  roles,
  loading,
  onCancel,
  onSubmit,
}: {
  roles: UserRole[];
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateUserValues) => Promise<void>;
}) {
  const [values, setValues] = useState<CreateUserValues>({
    username: '',
    email: '',
    name: '',
    password: '',
    roleIds: [],
  });
  const [error, setError] = useState<string | null>(null);
  const set = (key: keyof CreateUserValues, value: string | string[]) =>
    setValues((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.username || !values.email || !values.name || values.password.length < 12) {
      setError('Completa todos los campos. El password debe tener al menos 12 caracteres.');
      return;
    }
    setError(null);
    await onSubmit(values);
  }
  return (
    <form className="grid gap-4" onSubmit={submit}>
      {error ? (
        <div className="rounded-xl border border-[#f3d7d2] bg-[#fff7f5] p-3 text-sm font-semibold text-[#8e2f28]">
          {error}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Nombre
          <AppInput value={values.name} onChange={(event) => set('name', event.target.value)} />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Usuario
          <AppInput
            value={values.username}
            onChange={(event) => set('username', event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Email
          <AppInput
            type="email"
            value={values.email}
            onChange={(event) => set('email', event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Password inicial
          <AppInput
            type="password"
            value={values.password}
            onChange={(event) => set('password', event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold sm:col-span-2">
          Roles
          <AppSelect
            mode="multiple"
            className="w-full"
            value={values.roleIds}
            options={roles.map((role) => ({ value: role.id, label: role.name }))}
            onChange={(value) => set('roleIds', value)}
          />
        </label>
      </div>
      <div className="flex justify-end gap-3 border-t border-[#dfe4df] pt-4">
        <AppButton variant="secondary" htmlType="button" onClick={onCancel}>
          Cancelar
        </AppButton>
        <AppButton htmlType="submit" loading={loading}>
          Crear usuario
        </AppButton>
      </div>
    </form>
  );
}
