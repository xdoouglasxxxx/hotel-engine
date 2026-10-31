'use client';

import { useEffect, useState } from 'react';
import { brl } from '@/lib/utils';

// Barra fixa no rodapé do celular: preço "a partir de" + CTA.
// Aparece depois que o visitante rola além do hero.
export function MobileBookBar({ minPrice }: { minPrice: number }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const pastHero = window.scrollY > 480;
      // Recolhe ao chegar perto do fim da página, para não cobrir o rodapé
      // (copyright, Área restrita, contatos).
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 320;
      setShow(pastHero && !nearBottom);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  if (minPrice <= 0) return null;

  return (
    <div
      className={
        'fixed inset-x-0 bottom-0 z-[55] border-t border-sand-200 bg-white/95 px-4 py-3 ' +
        'backdrop-blur transition-transform duration-300 md:hidden ' +
        (show ? 'translate-y-0' : 'translate-y-full')
      }
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ocean-900/70">
          A partir de{' '}
          <span className="font-display text-xl text-ocean-900">{brl(minPrice)}</span>
          <span className="text-xs"> / noite</span>
        </p>
        <a href="#suites"
           className="rounded-full bg-coral-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-coral-600/30 transition hover:bg-coral-600">
          Ver datas
        </a>
      </div>
    </div>
  );
}
