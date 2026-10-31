import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SiteSettingsForm } from '@/components/admin/SiteSettingsForm';
import type { SiteSettings } from '@/types/database';

export const dynamic = 'force-dynamic';

// Configurações do hotel (prancha Painel-Config, seções "Site e marca" e
// "Políticas e horários"). Lê pela sessão do admin (RLS), sem o cache público,
// para mostrar sempre o valor recém-salvo.
export default async function SiteSettingsPage() {
  const supabase = createClient();
  const { data } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
  const settings = (data as SiteSettings | null) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/admin" className="text-sm font-semibold text-ocean-700 hover:underline">← Painel</Link>
          <h1 className="mt-1 font-display text-2xl text-ocean-900">Configurações do hotel</h1>
          <p className="text-sm text-ocean-900/60">
            Tudo aqui alimenta o site público e as regras de reserva.
          </p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer"
           className="rounded-full border border-ocean-300 bg-white px-5 py-2 text-sm font-semibold text-ocean-800 hover:bg-ocean-50">
          Ver site público
        </a>
      </div>

      {settings ? (
        <SiteSettingsForm initial={settings} />
      ) : (
        <p className="rounded-2xl border border-dashed border-sand-300 bg-white p-8 text-center text-sm text-ocean-900/60">
          Nenhuma configuração encontrada. Aplique a migração <code>site_settings</code> (com o seed) no projeto Supabase.
        </p>
      )}
    </div>
  );
}
