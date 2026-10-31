import type { SiteSettings } from '@/types/database';
import { placeLabel } from '@/lib/site-public';

// "Sobre a hospedagem" (prancha Main): nome e descrição vêm de site_settings.
// Sem configuração publicada, a seção não é renderizada.
export function About({ settings }: { settings: SiteSettings | null }) {
  if (!settings) return null;

  const place = placeLabel(settings);

  return (
    <section id="sobre" className="scroll-mt-20 bg-sand-50 py-20">
      <div className="mx-auto max-w-3xl px-5">
        <p className="section-eyebrow">Sobre a hospedagem</p>
        <h2 className="mt-3 font-display text-3xl text-ocean-900 sm:text-4xl">
          {settings.name}
        </h2>
        {place && <p className="mt-2 text-sm font-semibold text-ocean-900/60">{place}</p>}
        {settings.description && (
          <p className="mt-5 whitespace-pre-line leading-relaxed text-ocean-900/75">
            {settings.description}
          </p>
        )}
      </div>
    </section>
  );
}
