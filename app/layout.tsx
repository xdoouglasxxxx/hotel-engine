import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { getSiteSettings } from '@/lib/site-settings';
import { FALLBACK_SITE_NAME, contactPhone, formatTimeBR, siteAssetUrl, siteUrlFor } from '@/lib/site-public';

// Fontes locais (subset latin, licenca OFL em app/fonts): o build nao depende do Google Fonts.
const display = localFont({
  src: [
    { path: './fonts/Fraunces-Variable.woff2', weight: '400 600', style: 'normal' },
    { path: './fonts/Fraunces-Italic-Variable.woff2', weight: '400 600', style: 'italic' },
  ],
  variable: '--font-display',
  display: 'swap',
});
const body = localFont({
  src: [{ path: './fonts/NunitoSans-Variable.woff2', weight: '400 800', style: 'normal' }],
  variable: '--font-body',
  display: 'swap',
});

// Metadata vem de site_settings (cache de 60 s). Sem configuração publicada,
// o site responde com o nome neutro do produto e sem descrição.
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const name = s?.name ?? FALLBACK_SITE_NAME;
  const siteUrl = siteUrlFor(s);
  const title = s?.tagline ? name + ' | ' + s.tagline : name;
  const description = s?.description ?? undefined;
  const heroUrl = siteAssetUrl(s?.hero_image_path);

  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: '%s | ' + name },
    description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url: siteUrl,
      siteName: name,
      title,
      description,
      images: heroUrl ? [{ url: heroUrl, alt: name }] : undefined,
    },
    twitter: { card: heroUrl ? 'summary_large_image' : 'summary' },
    manifest: '/manifest.json',
    icons: { apple: '/apple-touch-icon.png' },
    appleWebApp: { capable: true, statusBarStyle: 'default', title: name },
    // Sem configuração publicada (RLS só devolve published = true ao anon), não indexar.
    robots: { index: s !== null, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: '#1e5262',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSiteSettings();

  // JSON-LD só com o que está configurado; nada fixo de hotel nenhum.
  const phone = contactPhone(s);
  const jsonLd = s && {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: s.name,
    description: s.description ?? undefined,
    url: siteUrlFor(s),
    telephone: phone ? '+' + phone : undefined,
    email: s.email_public ?? undefined,
    image: siteAssetUrl(s.hero_image_path),
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.address ?? undefined,
      addressLocality: s.city ?? undefined,
      addressRegion: s.state ?? undefined,
      addressCountry: s.country,
    },
    checkinTime: formatTimeBR(s.checkin_time),
    checkoutTime: formatTimeBR(s.checkout_time),
  };

  return (
    <html lang="pt-BR" className={display.variable + ' ' + body.variable}>
      <body className="font-body bg-sand-50 text-ocean-950 antialiased">
        {jsonLd && (
          // Conteúdo editável pelo admin: escapar "<" para que "</script>" num campo
          // não feche a tag (padrão recomendado pelo Next para JSON-LD).
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
          />
        )}
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js')})}",
          }}
        />
      </body>
    </html>
  );
}
