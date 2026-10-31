'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';
import { siteAssetUrl } from '@/lib/site-public';
import { useSiteSettings } from '@/components/public/SiteSettingsProvider';

export function AdminShell({ adminName, children }: { adminName: string; children: React.ReactNode }) {
  const router = useRouter();
  const settings = useSiteSettings();
  const hotelName = settings?.name ?? 'Hotel ainda sem nome';

  async function logout() {
    await createClient().auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-svh bg-sand-50">
      <header className="sticky top-0 z-40 border-b border-sand-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Logo name={hotelName} logoUrl={siteAssetUrl(settings?.logo_path)} size={28} />
            <div>
              <p className="text-sm font-bold text-ocean-900">{hotelName}</p>
              <p className="text-xs text-ocean-900/50">Painel do anfitrião · Olá, {adminName}</p>
            </div>
          </div>
          <nav className="flex items-center gap-4" aria-label="Painel">
            <Link href="/admin/configuracoes" className="text-sm font-semibold text-ocean-700 hover:text-ocean-900">
              Configurações
            </Link>
            <button onClick={logout} className="text-sm font-semibold text-ocean-700 hover:text-ocean-900">
              Sair
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
