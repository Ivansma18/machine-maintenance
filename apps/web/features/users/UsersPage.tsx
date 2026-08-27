'use client';

import { useState } from 'react';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { AppPanel } from '@/components/ui/AppPanel';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppShell } from '@/components/layout/AppShell';
import { UserForm } from './components/UserForm';
import { UserList } from './components/UserList';
import { useUsersAdmin } from './hooks/useUsersAdmin';
import type { ManagedUser } from './types';

export function UsersPage() {
  const admin = useUsersAdmin();
  const [createOpen, setCreateOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<ManagedUser | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  async function submit(values: Parameters<typeof admin.create>[0]) {
    await admin.create(values);
    setCreateOpen(false);
  }
  return (
    <AppShell
      activeHref="/users"
      header={{
        eyebrow: 'Administración / identidad',
        title: 'Usuarios y roles',
        action: <AppButton onClick={() => setCreateOpen(true)}>Crear usuario</AppButton>,
      }}
    >
      <PermissionGate
        permission="users:manage"
        fallback={
          <div className="rounded-2xl border border-[#f3d7d2] bg-[#fff7f5] p-5 text-sm font-bold text-[#8e2f28]">
            No tienes permisos para administrar usuarios.
          </div>
        }
      >
        <div className="mb-8">
          <p className="eyebrow">Control de acceso</p>
          <p className="mb-0 mt-3 max-w-2xl text-sm leading-6 text-[#68736f]">
            Gestiona identidades, roles y permisos efectivos. Los cambios sensibles revocan sesiones
            y quedan registrados en auditoría.
          </p>
        </div>
        {admin.error ? (
          <div
            className="mb-5 flex items-center justify-between rounded-2xl border border-[#f3d7d2] bg-[#fff7f5] p-5 text-sm font-bold text-[#8e2f28]"
            role="alert"
          >
            <span>{admin.error}</span>
            <AppButton variant="secondary" onClick={admin.retry}>
              Reintentar
            </AppButton>
          </div>
        ) : null}
        {admin.feedback ? (
          <div className="mb-5 rounded-2xl border border-[#e8d39b] bg-[#fff4d8] p-5 text-sm font-bold text-[#72551a]">
            {admin.feedback}
          </div>
        ) : null}
        <AppPanel title="Usuarios registrados" eyebrow="Roles y permisos efectivos">
          <UserList
            users={admin.users}
            loading={admin.loading}
            onToggle={(user) => void admin.toggle(user)}
            onReset={(user) => void admin.resetPassword(user.id)}
            onRoles={(user) => {
              setRoleTarget(user);
              setSelectedRoles(user.roles.map((role) => role.id));
            }}
          />
        </AppPanel>
      </PermissionGate>
      <AppModal
        centered
        destroyOnHidden
        footer={null}
        open={createOpen}
        title="Crear usuario"
        width={680}
        onCancel={() => setCreateOpen(false)}
      >
        <UserForm
          roles={admin.roles}
          loading={admin.actionLoading}
          onCancel={() => setCreateOpen(false)}
          onSubmit={submit}
        />
      </AppModal>
      <AppModal
        centered
        footer={null}
        open={Boolean(roleTarget)}
        title={`Roles · ${roleTarget?.name ?? ''}`}
        width={560}
        onCancel={() => setRoleTarget(null)}
      >
        {roleTarget ? (
          <div className="grid gap-5">
            <AppSelectWrapper
              roles={admin.roles}
              value={selectedRoles}
              onChange={setSelectedRoles}
            />
            <div className="flex justify-end">
              <AppButton
                loading={admin.actionLoading}
                onClick={() =>
                  void admin
                    .assignRoles(roleTarget.id, selectedRoles)
                    .then(() => setRoleTarget(null))
                }
              >
                Guardar roles
              </AppButton>
            </div>
          </div>
        ) : null}
      </AppModal>
    </AppShell>
  );
}

function AppSelectWrapper({
  roles,
  value,
  onChange,
}: {
  roles: { id: string; name: string }[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <AppSelect
      mode="multiple"
      className="w-full"
      value={value}
      options={roles.map((role) => ({ value: role.id, label: role.name }))}
      onChange={onChange}
    />
  );
}
