'use client';

import { useState } from 'react';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppPanel } from '@/components/ui/AppPanel';
import { AppShell } from '@/components/layout/AppShell';
import { createArea, createProductionLine, createSite } from './api/locationAdminApi';
import { useLocations } from './hooks/useLocations';

export function LocationsPage() {
  const locations = useLocations();
  const sites = locations.data;
  const [name, setName] = useState('');
  const [target, setTarget] = useState<{ kind: 'site' | 'area' | 'line'; id?: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  async function add() {
    if (!name.trim() || !target) return;
    try {
      if (target.kind === 'site') await createSite(name);
      if (target.kind === 'area') await createArea(target.id!, name);
      if (target.kind === 'line') await createProductionLine(target.id!, name);
      setName('');
      setTarget(null);
      locations.retry();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'No se pudo crear la ubicación.',
      );
    }
  }
  return (
    <AppShell
      activeHref="/locations"
      header={{
        eyebrow: 'Administración / estructura',
        title: 'Plantas y líneas',
        action: <AppButton onClick={() => setTarget({ kind: 'site' })}>Nueva planta</AppButton>,
      }}
    >
      <PermissionGate
        permission="locations:manage"
        fallback={
          <div className="rounded-2xl border border-[#f3d7d2] bg-[#fff7f5] p-5 text-sm font-bold text-[#8e2f28]">
            No tienes permisos para administrar la estructura operativa.
          </div>
        }
      >
        <div className="mb-8">
          <p className="eyebrow">Estructura operativa</p>
          <p className="mb-0 mt-3 max-w-2xl text-sm leading-6 text-[#68736f]">
            Organiza los activos como planta, área y línea de producción para dar contexto real a
            cada máquina.
          </p>
        </div>
        {error ? (
          <div className="mb-5 rounded-xl border border-[#f3d7d2] bg-[#fff7f5] p-4 text-sm font-bold text-[#8e2f28]">
            {error}
          </div>
        ) : null}
        <AppPanel title="Jerarquía operativa" eyebrow={`${sites.length} plantas activas`}>
          <div className="divide-y divide-[#dfe4df]">
            {sites.map((site) => (
              <div className="p-5" key={site.id}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="m-0 text-lg font-black">{site.name}</h2>
                  <AppButton
                    variant="quiet"
                    onClick={() => setTarget({ kind: 'area', id: site.id })}
                  >
                    Agregar área
                  </AppButton>
                </div>
                {site.areas.length ? (
                  <div className="mt-4 grid gap-3 pl-4">
                    {site.areas.map((area) => (
                      <div className="rounded-xl border border-[#e7ebe7] p-4" key={area.id}>
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="m-0 text-sm font-black">{area.name}</h3>
                          <AppButton
                            variant="quiet"
                            onClick={() => setTarget({ kind: 'line', id: area.id })}
                          >
                            Agregar línea
                          </AppButton>
                        </div>
                        <p className="m-0 mt-2 text-xs font-semibold text-[#68736f]">
                          {area.lines.map((line) => line.name).join(' · ') ||
                            'Sin líneas registradas'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="m-0 mt-4 text-sm text-[#68736f]">Sin áreas registradas.</p>
                )}
              </div>
            ))}
          </div>
        </AppPanel>
      </PermissionGate>
      {target ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17211f]/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <p className="eyebrow">Nueva estructura</p>
            <h2 className="mb-5 mt-2 text-xl font-black">
              {target.kind === 'site'
                ? 'Planta'
                : target.kind === 'area'
                  ? 'Área'
                  : 'Línea de producción'}
            </h2>
            <AppInput
              autoFocus
              placeholder="Nombre"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <div className="mt-5 flex justify-end gap-3">
              <AppButton variant="secondary" onClick={() => setTarget(null)}>
                Cancelar
              </AppButton>
              <AppButton onClick={() => void add()}>Crear</AppButton>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
