import { createAdminClient } from '@/lib/supabase/admin';
import { CancelClient } from './CancelClient';
import { Logo } from '@/components/Logo';
import { SiteSettingsProvider } from '@/components/public/SiteSettingsProvider';
import { FALLBACK_SITE_NAME, getSiteSettings } from '@/lib/site-settings';
import { contactPhone, siteAssetUrl } from '@/lib/site-public';
import { formatWhatsAppBR } from '@/lib/site-config';

export const dynamic = 'force-dynamic';
// O template do layout raiz completa com " | <nome do hotel>".
export const metadata = { title: 'Cancelar reserva', robots: { index: false } };

export default async function CancelPage({
  params, searchParams,
}: { params: { id: string }; searchParams: { t?: string } }) {
  const token = searchParams.t ?? '';
  let booking: any = null;

  const uuidRe = /^[0-9a-f-]{36}$/i;
  if (uuidRe.test(params.id) && uuidRe.test(token)) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('bookings')
      .select('id, guest_name, check_in, check_out, nights, total_price, status, cancel_token, rooms(name)')
      .eq('id', params.id)
      .eq('cancel_token', token)
      .single();
    booking = data;
  }

  const settings = await getSiteSettings();
  const name = settings?.name ?? FALLBACK_SITE_NAME;
  const phone = contactPhone(settings);

  return (
    <SiteSettingsProvider settings={settings}>
      <main className="flex min-h-svh items-center justify-center bg-sand-100 px-5 py-10">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <div className="flex justify-center">
            <Logo name={name} logoUrl={siteAssetUrl(settings?.logo_path)} size={40} />
          </div>
          <h1 className="mt-3 text-center font-display text-2xl text-ocean-900">
            Cancelamento de reserva
          </h1>
          {booking ? (
            <CancelClient booking={booking} token={token} />
          ) : (
            <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-700">
              Link de cancelamento inválido ou expirado. Se precisar cancelar,{' '}
              {phone ? (
                <>fale direto com {name} pelo WhatsApp {formatWhatsAppBR(phone)}.</>
              ) : (
                <>
                  fale com {name} pelos{' '}
                  <a href="/#contato" className="font-semibold underline underline-offset-2">canais de contato do site</a>.
                </>
              )}
            </p>
          )}
        </div>
      </main>
    </SiteSettingsProvider>
  );
}
