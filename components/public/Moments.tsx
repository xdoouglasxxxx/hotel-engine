'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { GalleryPhoto } from '@/types/database';
import { Lightbox } from './Lightbox';
import { useSiteSettings } from './SiteSettingsProvider';

// "Momentos": galeria viva alimentada pelo anfitrião pelo painel.
// Se não houver fotos publicadas, a seção não aparece.
export function Moments({ photos }: { photos: GalleryPhoto[] }) {
  const settings = useSiteSettings();
  const [open, setOpen] = useState<number | null>(null);
  if (photos.length === 0) return null;

  const name = settings?.name ?? 'nossa hospedagem';
  const lbPhotos = photos.map((p) => ({
    src: p.url,
    alt: p.caption ?? 'Momento em ' + name,
  }));

  return (
    <section id="momentos" className="scroll-mt-20 overflow-hidden bg-white py-20">
      <div className="mx-auto max-w-6xl px-5">
        <p className="section-eyebrow">Galeria viva</p>
        <h2 className="mt-3 font-display text-3xl text-ocean-900 sm:text-4xl">
          Momentos em {name}
        </h2>
        <p className="mt-3 max-w-xl text-ocean-900/70">
          A vida por aqui, compartilhada por quem cuida de tudo. Deslize e toque para ampliar.
        </p>
      </div>

      <div className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4
                      [scrollbar-width:thin] sm:px-[max(1.25rem,calc((100vw-72rem)/2))]">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={'Ampliar: ' + (p.caption ?? 'momento em ' + name)}
            className="group w-64 flex-none snap-start cursor-zoom-in rounded-2xl bg-sand-50 p-3 pb-4
                       shadow-md ring-1 ring-sand-200 transition-transform hover:-translate-y-1
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500"
          >
            <span className="relative block h-56 w-full overflow-hidden rounded-xl">
              <Image src={p.url} alt={p.caption ?? 'Momento em ' + name} fill
                     sizes="256px"
                     className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </span>
            <span className="mt-3 block px-1 text-left text-sm leading-snug text-ocean-900/75">
              {p.caption ?? name}
            </span>
            <span className="mt-1 block px-1 text-left text-[11px] font-semibold text-ocean-900/40">
              {new Date(p.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </span>
          </button>
        ))}
      </div>

      {open !== null && (
        <Lightbox photos={lbPhotos} startIndex={open} onClose={() => setOpen(null)} />
      )}
    </section>
  );
}
