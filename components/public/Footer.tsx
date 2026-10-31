import type { SiteSettings } from '@/types/database';
import { Logo } from '@/components/Logo';
import { waLink } from '@/lib/utils';
import { formatWhatsAppBR } from '@/lib/site-config';
import { FALLBACK_SITE_NAME, contactPhone, placeLabel, siteAssetUrl } from '@/lib/site-public';

// Rodapé (prancha Main): marca, endereço, contatos e "Powered by Hotel Engine".
export function Footer({ settings }: { settings: SiteSettings | null }) {
  const name = settings?.name ?? FALLBACK_SITE_NAME;
  const phone = contactPhone(settings);
  const place = placeLabel(settings);

  return (
    <footer id="contato" className="bg-ocean-950 py-14 text-sand-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <Logo name={name} logoUrl={siteAssetUrl(settings?.logo_path)} size={34} />
            <span className="font-display text-lg">{name}</span>
          </div>
          {settings?.tagline && (
            <p className="mt-3 text-sm text-sand-100/70">{settings.tagline}</p>
          )}
        </div>

        {(settings?.address || place) && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-coral-400">Endereço</h3>
            <address className="mt-3 text-sm not-italic leading-relaxed text-sand-100/80">
              {settings?.address && <>{settings.address}<br /></>}
              {place}
            </address>
          </div>
        )}

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-coral-400">Contato</h3>
          <div className="mt-3 space-y-2 text-sm">
            {phone && (
              <a href={waLink(phone, 'Olá! Vim pelo site e gostaria de informações.')}
                 target="_blank" rel="noopener noreferrer"
                 className="block text-sand-100/80 hover:text-white">
                WhatsApp: {formatWhatsAppBR(phone)}
              </a>
            )}
            {settings?.email_public && (
              <a href={'mailto:' + settings.email_public} className="block text-sand-100/80 hover:text-white">
                E-mail: {settings.email_public}
              </a>
            )}
            {settings?.instagram && (
              <a href={'https://www.instagram.com/' + settings.instagram + '/'}
                 target="_blank" rel="noopener noreferrer"
                 className="block text-sand-100/80 hover:text-white">
                Instagram: @{settings.instagram}
              </a>
            )}
            {!phone && !settings?.email_public && !settings?.instagram && (
              <p className="text-sand-100/50">Contatos ainda não configurados.</p>
            )}
          </div>
        </div>
      </div>
      <p className="mt-12 text-center text-xs text-sand-100/50">
        © {new Date().getFullYear()} {name} — Todos os direitos reservados.
        {' · '}
        <a href="/admin" className="underline-offset-2 hover:text-sand-100/80 hover:underline">
          Área restrita
        </a>
      </p>
      <p className="mt-2 text-center text-xs text-sand-100/40">Powered by Hotel Engine</p>
    </footer>
  );
}
