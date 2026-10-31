'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';
import { FALLBACK_SITE_NAME, siteAssetUrl } from '@/lib/site-public';
import { useSiteSettings } from './SiteSettingsProvider';

export function Header() {
  const settings = useSiteSettings();
  const name = settings?.name ?? FALLBACK_SITE_NAME;
  // Só âncoras de seções que existem: About exige configuração; Location exige endereço ou cidade.
  const links = [
    ...(settings ? [{ href: '#sobre', label: 'Sobre' }] : []),
    { href: '#suites', label: 'Acomodações' },
    ...(settings?.address || settings?.city ? [{ href: '#localizacao', label: 'Como chegar' }] : []),
    { href: '#contato', label: 'Contato' },
  ];
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all',
        scrolled ? 'bg-ocean-900/95 shadow-lg backdrop-blur' : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2 text-white">
          <Logo name={name} logoUrl={siteAssetUrl(settings?.logo_path)} size={34} />
          <span className="font-display text-lg tracking-wide">{name}</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Principal">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-semibold text-sand-100/90 hover:text-white">
              {l.label}
            </a>
          ))}
          <a
            href="#suites"
            className="rounded-full bg-coral-500 px-5 py-2 text-sm font-bold text-white hover:bg-coral-600"
          >
            Reservar
          </a>
        </nav>

        <button
          className="text-white md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Abrir menu"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-ocean-900/95 px-5 pb-5 pt-2 backdrop-blur md:hidden" aria-label="Menu móvel">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
               className="block py-2.5 font-semibold text-sand-100">
              {l.label}
            </a>
          ))}
          <a href="#suites" onClick={() => setOpen(false)}
             className="mt-2 block rounded-full bg-coral-500 px-5 py-2.5 text-center font-bold text-white">
            Reservar
          </a>
        </nav>
      )}
    </header>
  );
}
