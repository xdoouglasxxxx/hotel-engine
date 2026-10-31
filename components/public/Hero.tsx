import Image from 'next/image';
import type { SiteSettings } from '@/types/database';
import { FALLBACK_SITE_NAME, placeLabel, siteAssetUrl } from '@/lib/site-public';

// Hero (prancha Main): foto principal, nome, cidade e slogan vêm de site_settings.
// Sem foto configurada, fica só o fundo oceano.
export function Hero({ settings }: { settings: SiteSettings | null }) {
  const name = settings?.name ?? FALLBACK_SITE_NAME;
  const place = placeLabel(settings);
  const heroUrl = siteAssetUrl(settings?.hero_image_path);

  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden bg-ocean-900 text-white">
      {heroUrl && (
        <Image
          src={heroUrl}
          alt={'Foto principal de ' + name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      {/* Véu oceano para legibilidade do texto */}
      <div className="absolute inset-0 bg-gradient-to-r from-ocean-950/90 via-ocean-900/70 to-ocean-900/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/60 via-transparent to-transparent" />
      {/* "Linha do mar" na base */}
      <svg className="absolute bottom-0 left-0 w-full text-sand-50" viewBox="0 0 1440 90" fill="currentColor" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,50 C240,90 480,10 720,45 C960,80 1200,20 1440,55 L1440,90 L0,90 Z" />
      </svg>

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-24 pt-32">
        <p className="section-eyebrow mb-4 text-coral-400">
          {name}{place ? ' · ' + place : ''}
        </p>
        <h1 className="max-w-2xl font-display text-4xl leading-[1.08] sm:text-6xl">
          {settings?.tagline ?? name}
        </h1>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <a href="#suites"
             className="rounded-full bg-coral-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-coral-600/30 transition hover:bg-coral-600">
            Ver disponibilidade
          </a>
          <a href="#sobre" className="text-sm font-semibold text-sand-100 underline-offset-4 hover:underline">
            Conhecer a hospedagem
          </a>
        </div>
      </div>
    </section>
  );
}
