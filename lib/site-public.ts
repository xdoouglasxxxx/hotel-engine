// Helpers de apresentação de site_settings. Só usam variáveis públicas e dados
// já públicos (a tabela é lida pelo anon), então servem a Server e Client Components.
import type { SiteSettings } from '@/types/database';
import { OWNER_WHATSAPP } from '@/lib/site-config';

/** Nome exibido quando não há configuração (sem marca de hotel nenhum). */
export const FALLBACK_SITE_NAME = 'Hotel Engine';

function parseUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * URL pública do site: domínio configurado, senão NEXT_PUBLIC_SITE_URL, senão localhost.
 * Sempre devolve algo que `new URL()` aceita: a constraint do banco não impede um
 * domínio que o parser WHATWG rejeita (ex.: TLD numérico), e um throw aqui derrubaria
 * todas as páginas via generateMetadata.
 */
export function siteUrlFor(settings: SiteSettings | null | undefined): string {
  const fallback = parseUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? 'http://localhost:3000';
  if (!settings?.domain) return fallback;
  return parseUrl('https://' + settings.domain) ?? fallback;
}

/** URL pública de um caminho do bucket "site" (migração _site_storage); undefined se não houver caminho. */
export function siteAssetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return undefined;
  return base.replace(/\/$/, '') + '/storage/v1/object/public/site/' + path;
}

/** Telefone de contato (só dígitos, com DDI): o configurado no painel, senão o da env; vazio se nenhum. */
export function contactPhone(s: SiteSettings | null | undefined): string {
  return s?.phone_public || OWNER_WHATSAPP;
}

/** "Cidade, UF" a partir das configurações; vazio se não houver nenhum dos dois. */
export function placeLabel(s: SiteSettings | null | undefined): string {
  return [s?.city, s?.state].filter(Boolean).join(', ');
}

/** Endereço completo em uma linha para mapa e rodapé. */
export function fullAddress(s: SiteSettings | null | undefined): string {
  return [s?.address, s?.city, s?.state, s?.country].filter(Boolean).join(', ');
}

/** "HH:MM:SS" (coluna time) -> "HH:MM". */
export function formatTimeBR(t: string): string {
  return t.slice(0, 5);
}
