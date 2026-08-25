import { AppButton } from '@/components/ui/AppButton';
import { AppTag } from '@/components/ui/AppTag';
import { formatDateOnly } from '@/lib/formatters/dateFormatters';

import type { MaintenancePlan } from '../types';
import { getPlanSituation } from '../utils/maintenancePlanFormatters';

type MaintenancePlanListProps = {
  plans: MaintenancePlan[];
  total: number;
  onCreate: () => void;
  onEdit: (plan: MaintenancePlan) => void;
  onToggleStatus: (plan: MaintenancePlan) => void;
};

export function MaintenancePlanList({
  plans,
  total,
  onCreate,
  onEdit,
  onToggleStatus,
}: MaintenancePlanListProps) {
  if (plans.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#bfc9c1] bg-white p-10 text-center">
        <p className="m-0 text-lg font-black text-[#17211f]">No hay planes que mostrar</p>
        <p className="mx-auto mb-4 mt-2 max-w-md text-sm leading-6 text-[#68736f]">
          Ajusta los filtros o agrega el primer plan preventivo al registro.
        </p>
        {total === 0 ? <AppButton onClick={onCreate}>Agregar plan</AppButton> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {plans.map((plan) => {
        const situation = getPlanSituation(plan);
        return (
          <article
            className="rounded-2xl border border-[#dfe4df] bg-white p-5 shadow-[0_12px_35px_rgba(35,55,43,0.05)]"
            key={plan.id}
          >
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="m-0 text-base font-black text-[#17211f]">{plan.name}</h2>
                  <AppTag tone={situation.tone}>{situation.label}</AppTag>
                </div>
                <p className="m-0 mt-2 text-sm font-bold text-[#426b50]">{plan.machine.name}</p>
                <p className="m-0 mt-1 text-xs text-[#68736f]">
                  {plan.machine.location} · {plan.machine.category.name}
                </p>
                {plan.description ? (
                  <p className="m-0 mt-3 max-w-2xl text-sm leading-6 text-[#68736f]">
                    {plan.description}
                  </p>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-x-7 gap-y-2 text-left text-xs sm:grid-cols-3 lg:text-right">
                <div>
                  <p className="eyebrow m-0">Frecuencia</p>
                  <p className="m-0 mt-1 font-bold text-[#17211f]">
                    Cada {plan.frequencyDays} dias
                  </p>
                </div>
                <div>
                  <p className="eyebrow m-0">Proximo</p>
                  <p className="m-0 mt-1 font-bold text-[#17211f]">
                    {formatDateOnly(plan.nextDueAt)}
                  </p>
                </div>
                <div>
                  <p className="eyebrow m-0">Aviso desde</p>
                  <p className="m-0 mt-1 font-bold text-[#17211f]">
                    {formatDateOnly(plan.warningStartsAt)}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-[#edf0ed] pt-4">
              <AppButton variant="quiet" onClick={() => onEdit(plan)}>
                Editar
              </AppButton>
              <AppButton variant="secondary" onClick={() => onToggleStatus(plan)}>
                {plan.isActive ? 'Desactivar' : 'Activar'}
              </AppButton>
            </div>
          </article>
        );
      })}
    </div>
  );
}
