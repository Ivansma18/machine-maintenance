import Link from 'next/link';
import { AppTag } from '@/components/ui/AppTag';
import type { MaintenanceRecommendation } from '../types';

const severityLabels = { URGENT: 'Urgente', HIGH: 'Alta', MEDIUM: 'Media' };

export function RecommendationList({
  recommendations,
}: {
  recommendations: MaintenanceRecommendation[];
}) {
  return recommendations.length ? (
    <div className="grid gap-3">
      {recommendations.map((recommendation) => (
        <article
          className="rounded-xl border border-[#dfe4df] bg-[#fbfcfa] p-4"
          key={recommendation.id}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link
                className="font-black text-[#365441] underline-offset-4 hover:underline"
                href={`/machines/${recommendation.machineId}`}
              >
                {recommendation.machineName}
              </Link>
              <h3 className="m-0 mt-1 text-sm font-black text-[#17211f]">{recommendation.title}</h3>
            </div>
            <AppTag
              tone={
                recommendation.severity === 'URGENT'
                  ? 'critical'
                  : recommendation.severity === 'HIGH'
                    ? 'warning'
                    : 'neutral'
              }
            >
              {severityLabels[recommendation.severity]}
            </AppTag>
          </div>
          <p className="m-0 mt-3 text-sm font-semibold text-[#495852]">{recommendation.reason}</p>
          <p className="m-0 mt-1 text-xs leading-5 text-[#68736f]">
            Siguiente paso: {recommendation.action}
          </p>
        </article>
      ))}
    </div>
  ) : (
    <div className="rounded-xl border border-[#cfe0d2] bg-[#e8f1e9] p-5 text-sm font-semibold text-[#365441]">
      No se detectaron patrones que requieran una recomendación en el periodo analizado.
    </div>
  );
}
