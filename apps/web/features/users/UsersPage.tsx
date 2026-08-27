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
import { useLocations } from '@/features/locations/hooks/useLocations';

export function UsersPage() {
  const admin = useUsersAdmin();
  const locations = useLocations();
  const [createOpen, setCreateOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<ManagedUser | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [scopeTarget, setScopeTarget] = useState<ManagedUser | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
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
            onScopes={(user) => {
              setScopeTarget(user);
              setSelectedScopes(
                user.scopes.map((scope) => `${scope.level}:${scope.siteId ?? scope.areaId}`),
              );
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
        open={Boolean(scopeTarget)}
        title={`Alcances · ${scopeTarget?.name ?? ''}`}
        width={560}
        onCancel={() => setScopeTarget(null)}
      >
        {scopeTarget ? (
          <div className="grid gap-5">
            <p className="m-0 text-sm leading-6 text-[#68736f]">
              Sin alcances asignados, el usuario no verá máquinas. Los usuarios con rol Admin
              conservan acceso global.
            </p>
            <AppSelect
              mode="multiple"
              className="w-full"
              value={selectedScopes}
              options={locations.data.flatMap((site) => [
                { value: `SITE:${site.id}`, label: `Planta · ${site.name}` },
                ...site.areas.map((area) => ({
                  value: `AREA:${area.id}`,
                  label: `Área · ${site.name} / ${area.name}`,
                })),
              ])}
              onChange={setSelectedScopes}
            />
            <div className="flex justify-end">
              <AppButton
                loading={admin.actionLoading}
                onClick={() =>
                  void admin
                    .assignScopes(
                      scopeTarget.id,
                      selectedScopes.map((value) => {
                        const [level, id] = value.split(':');
                        return level === 'SITE'
                          ? { level: 'SITE' as const, siteId: id }
                          : { level: 'AREA' as const, areaId: id };
                      }),
                    )
                    .then(() => setScopeTarget(null))
                }
              >
                Guardar alcances
              </AppButton>
            </div>
          </div>
        ) : null}
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
