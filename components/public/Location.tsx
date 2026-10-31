import type { SiteSettings } from '@/types/database';
import { fullAddress } from '@/lib/site-public';

// "Como chegar" (prancha Main): endereço e mapa a partir de site_settings.
// Sem endereço nem cidade configurados, a seção não aparece.
export function Location({ settings }: { settings: SiteSettings | null }) {
  if (!settings || (!settings.address && !settings.city)) return null;

  const address = fullAddress(settings);
  const q = encodeURIComponent(address);

  return (
    <section id="localizacao" className="scroll-mt-20 bg-sand-50 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <p className="section-eyebrow">Como chegar</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl text-ocean-900 sm:text-4xl">
          Onde fica {settings.name}
        </h2>
        <address className="mt-3 not-italic text-ocean-900/70">{address}</address>
        <div className="mt-8 overflow-hidden rounded-2xl border border-sand-200 shadow-lg">
          <iframe
            src={'https://www.google.com/maps?q=' + q + '&z=15&output=embed'}
            title={'Mapa — ' + settings.name}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-80 w-full border-0"
          />
        </div>
        <a
          href={'https://www.google.com/maps/dir/?api=1&destination=' + q}
          target="_blank" rel="noopener noreferrer"
          className="mt-8 inline-block rounded-full border-2 border-ocean-700 px-7 py-3 font-bold text-ocean-800 transition hover:bg-ocean-700 hover:text-white"
        >
          Ver rota no Google Maps
        </a>
      </div>
    </section>
  );
}
