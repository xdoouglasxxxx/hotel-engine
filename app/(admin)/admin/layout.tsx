import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/require-admin';
import { createClient } from '@/lib/supabase/server';
import type { SiteSettings } from '@/types/database';
import { AdminShell } from '@/components/admin/AdminShell';
import { SiteSettingsProvider } from '@/components/public/SiteSettingsProvider';

export const metadata = {
  title: 'Painel',
  robots: { index: false, follow: false },
  manifest: '/manifest-admin.json',
};
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware garante login; aqui garantimos que o usuário É admin.
  const admin = await requireAdmin();
  if (!admin) redirect('/login');

  // Nome, logo e horários do hotel para o cabeçalho e as mensagens de WhatsApp.
  // Lê pela sessão do admin (RLS), sem o cache público: vê o site despublicado
  // e o valor recém-salvo em Configurações.
  const { data } = await createClient().from('site_settings').select('*').limit(1).maybeSingle();
  const settings = (data as SiteSettings | null) ?? null;

  return (
    <SiteSettingsProvider settings={settings}>
      <AdminShell adminName={admin.name}>{children}</AdminShell>
    </SiteSettingsProvider>
  );
}
