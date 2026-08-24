import { AnimatedCard } from '@/components/motion/AnimatedCard';

type MetricCardProps = {
  label: string;
  value: number;
  detail: string;
  tone: 'ink' | 'warning' | 'critical' | 'sage';
};

export function MetricCard({ label, value, detail, tone }: MetricCardProps) {
  const color =
    tone === 'critical'
      ? 'text-[#d95b4f]'
      : tone === 'warning'
        ? 'text-[#a56c14]'
        : tone === 'sage'
          ? 'text-[#668875]'
          : 'text-[#17211f]';

  return (
    <AnimatedCard className="rounded-2xl border border-[#dfe4df] bg-white p-5">
      <p className="eyebrow">{label}</p>
      <p className={`tabular-nums mb-2 mt-4 text-4xl font-black tracking-[-0.06em] ${color}`}>
        {value}
      </p>
      <p className="m-0 text-xs font-semibold text-[#68736f]">{detail}</p>
    </AnimatedCard>
  );
}
