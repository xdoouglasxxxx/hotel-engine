import Image from 'next/image';
import { cn } from '@/lib/utils';

// Marca do hotel: a imagem enviada pelo painel (bucket "site") ou, sem logo,
// um quadrado com a inicial do nome. Sem hooks: serve a Server e Client Components.
export function Logo({ name, logoUrl, size = 36, className = '' }:
  { name: string; logoUrl?: string; size?: number; className?: string }) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl} alt={name} width={size} height={size}
        className={cn('rounded-xl object-cover', className)}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.5) }}
      className={cn('inline-flex flex-none items-center justify-center rounded-xl bg-ocean-700 font-display font-semibold text-white', className)}
    >
      {name.trim().charAt(0).toUpperCase() || 'H'}
    </span>
  );
}
