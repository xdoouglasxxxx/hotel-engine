'use client';

import { useState } from 'react';
import { brl, waLink, formatDateBR } from '@/lib/utils';
import { OWNER_GREETING } from '@/lib/site-config';
import { contactPhone } from '@/lib/site-public';
import { useSiteSettings } from '@/components/public/SiteSettingsProvider';

export function CancelClient({ booking, token }: { booking: any; token: string }) {
  const settings = useSiteSettings();
  const phone = contactPhone(settings);
  const windowDays = booking.status === 'approved' ? settings?.cancellation_free_days ?? null : null;
  const [step, setStep] = useState<'confirm' | 'done' | 'closed'>(
    booking.status === 'cancelled' || booking.status === 'rejected' ? 'closed' : 'confirm'
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const roomName = booking.rooms?.name ?? 'Acomodação';

  async function cancel() {
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.id, token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Não foi possível cancelar.');
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro.');
    } finally {
      setBusy(false);
    }
  }

  const waMsg =
    OWNER_GREETING + ' Precisei CANCELAR minha reserva pelo site. ❌\n' +
    '• Nome: ' + booking.guest_name + '\n' +
    '• ' + roomName + '\n' +
    '• ' + formatDateBR(booking.check_in) + ' → ' + formatDateBR(booking.check_out);

  if (step === 'closed') {
    return (
      <p className="mt-5 rounded-2xl bg-sand-100 px-4 py-3 text-center text-sm text-ocean-900/70">
        Esta reserva já está encerrada (cancelada ou recusada). Nada a fazer por aqui. 🙂
      </p>
    );
  }

  if (step === 'done') {
    return (
      <div className="mt-5 text-center">
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Reserva cancelada com sucesso. As datas foram liberadas.
        </p>
        {phone && (
          <>
            <p className="mt-3 text-sm text-ocean-900/70">
              Para garantir que a hospedagem fique sabendo agora mesmo, avise pelo WhatsApp:
            </p>
            <a
              href={waLink(phone, waMsg)}
              target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-block rounded-full bg-emerald-600 px-7 py-3 font-bold text-white shadow hover:bg-emerald-700"
            >
              Avisar pelo WhatsApp
            </a>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="rounded-2xl bg-sand-100 px-4 py-3 text-sm text-ocean-900/80">
        <p className="font-bold text-ocean-900">{booking.guest_name}</p>
        <p>{roomName}</p>
        <p>
          {formatDateBR(booking.check_in)} → {formatDateBR(booking.check_out)} ·{' '}
          {booking.nights} {booking.nights === 1 ? 'noite' : 'noites'} · {brl(booking.total_price)}
        </p>
      </div>
      <p className="mt-4 text-center text-sm text-ocean-900/70">
        Tem certeza que deseja cancelar esta reserva? As datas serão liberadas
        para outros hóspedes e a ação não pode ser desfeita pelo site.
      </p>
      {windowDays !== null && (
        <p className="mt-3 text-center text-xs text-ocean-900/60">
          O cancelamento pelo site é possível até {windowDays} {windowDays === 1 ? 'dia' : 'dias'} antes da entrada.
        </p>
      )}
      {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button
        onClick={cancel} disabled={busy}
        className="mt-4 w-full rounded-full bg-red-600 px-6 py-3 font-bold text-white shadow hover:bg-red-700 disabled:opacity-50"
      >
        {busy ? 'Cancelando…' : 'Sim, cancelar minha reserva'}
      </button>
      <a href="/" className="mt-3 block text-center text-sm font-semibold text-ocean-700 underline-offset-4 hover:underline">
        Voltar ao site sem cancelar
      </a>
    </div>
  );
}
