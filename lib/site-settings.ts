import 'server-only';
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import type { SiteSettings } from '@/types/database';

// Configuração do hotel (linha única de site_settings), lida no servidor.
// Usa a chave anon SEM cookies de propósito: a leitura passa pela RLS
// (policy public_read_site_settings) e, sem cookies(), pode ser cacheada.
// Nunca usar service role aqui: a tabela é pública por desenho.
export const SITE_SETTINGS_TAG = 'site-settings';

const fetchSiteSettings = unstable_cache(
  async (): Promise<SiteSettings | null> => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
    if (error) return null;
    return (data as SiteSettings | null) ?? null;
  },
  [SITE_SETTINGS_TAG],
  { revalidate: 60, tags: [SITE_SETTINGS_TAG] }
);

/** Configuração publicada do hotel, ou null se não houver linha, estiver despublicada ou o banco falhar. */
export function getSiteSettings(): Promise<SiteSettings | null> {
  return fetchSiteSettings();
}

// FALLBACK_SITE_NAME e siteUrlFor vivem em lib/site-public.ts (sem server-only,
// para os Client Components); reexportados aqui para quem já importa deste módulo.
export { FALLBACK_SITE_NAME, siteUrlFor } from '@/lib/site-public';
