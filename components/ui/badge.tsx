import { cn } from '@/lib/utils';

const styles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-200 text-gray-600',
  neutral: 'bg-ocean-100 text-ocean-800',
};

export function Badge({ tone = 'neutral', className, children }:
  { tone?: string; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', styles[tone] ?? styles.neutral, className)}>
      {children}
    </span>
  );
}
