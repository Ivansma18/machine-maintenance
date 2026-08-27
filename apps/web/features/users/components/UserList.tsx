import { AppButton } from '@/components/ui/AppButton';
import { AppTag } from '@/components/ui/AppTag';
import type { ManagedUser } from '../types';

export function UserList({
  users,
  loading,
  onToggle,
  onRoles,
  onReset,
}: {
  users: ManagedUser[];
  loading: boolean;
  onToggle: (user: ManagedUser) => void;
  onRoles: (user: ManagedUser) => void;
  onReset: (user: ManagedUser) => void;
}) {
  return (
    <div className={loading ? 'opacity-60' : ''}>
      {users.length ? (
        <div className="divide-y divide-[#dfe4df]">
          {users.map((user) => (
            <div
              className="flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between"
              key={user.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="m-0 text-base font-black">{user.name}</h2>
                  <AppTag tone={user.isActive ? 'success' : 'neutral'}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </AppTag>
                </div>
                <p className="m-0 mt-1 text-sm text-[#68736f]">
                  {user.username} · {user.email}
                </p>
                <p className="m-0 mt-2 text-xs font-semibold text-[#495852]">
                  Roles: {user.roles.map((role) => role.name).join(', ') || 'Sin roles'} ·{' '}
                  {user.permissions.length} permisos efectivos
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <AppButton variant="secondary" onClick={() => onRoles(user)}>
                  Asignar roles
                </AppButton>
                <AppButton variant="secondary" onClick={() => onReset(user)}>
                  Reset password
                </AppButton>
                <AppButton
                  variant={user.isActive ? 'danger' : 'primary'}
                  onClick={() => onToggle(user)}
                >
                  {user.isActive ? 'Desactivar' : 'Activar'}
                </AppButton>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="p-5 text-sm font-semibold text-[#68736f]">No hay usuarios registrados.</p>
      )}
    </div>
  );
}
