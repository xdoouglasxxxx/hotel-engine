'use client';

import { useState } from 'react';
import type { Booking } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { brl, formatDateBR, waLink } from '@/lib/utils';
import { formatTimeBR, siteUrlFor } from '@/lib/site-public';
import { useSiteSettings } from '@/components/public/SiteSettingsProvider';

const statusLabel: Record<string, string> = {
  pending: 'Pendente', approved: 'Aprovada', rejected: 'Recusada', cancelled: 'Cancelada',
};

export function BookingCard({ booking, roomName, onUpdate, compact = false }:
  { booking: Booking; roomName: string; onUpdate: (b: Booking) => void; compact?: boolean }) {
  const settings = useSiteSettings();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Nome e horários do hotel nas mensagens; sem configuração, o texto fica genérico.
  const hotel = settings ? ' em ' + settings.name : '';
  const checkinNote = settings ? ' (a partir das ' + formatTimeBR(settings.checkin_time) + ')' : '';
  const checkoutNote = settings ? ' (até ' + formatTimeBR(settings.checkout_time) + ')' : '';

  async function act(path: 'approve' | 'reject' | 'cancel', reason?: string) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/' + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.id, ...(reason ? { reason } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro.');
      const newStatus = path === 'approve' ? 'approved' : path === 'cancel' ? 'cancelled' : 'rejected';
      onUpdate({ ...booking, status: newStatus });

      // WhatsApp automático: abre a conversa já com a mensagem pronta
      const cancelLink = siteUrlFor(settings) + '/cancelar/' + booking.id + '?t=' + booking.cancel_token;
      const msg = path === 'approve'
        ? 'Olá, ' + booking.guest_name + '! Sua reserva' + hotel + ' foi CONFIRMADA. ✅\n' +
          '• ' + roomName + '\n' +
          '• Entrada: ' + formatDateBR(booking.check_in) + checkinNote + '\n' +
          '• Saída: ' + formatDateBR(booking.check_out) + checkoutNote + '\n' +
          '• Total: ' + brl(booking.total_price) + '\n' +
          'Se seus planos mudarem, você pode cancelar por aqui: ' + cancelLink + '\n' +
          'Qualquer dúvida, estou à disposição. Até breve!'
        : path === 'cancel'
        ? 'Olá, ' + booking.guest_name + '. Precisamos CANCELAR sua reserva' + hotel + ' ' +
          '(' + roomName + ', ' + formatDateBR(booking.check_in) + ' a ' + formatDateBR(booking.check_out) + '). ❌\n' +
          (reason ? 'Motivo: ' + reason + '\n' : '') +
          'Pedimos desculpas pelo transtorno. Se quiser, posso ajudar a remarcar para outras datas. ' +
          'Por favor, confirme o recebimento desta mensagem. 🙏'
        : 'Olá, ' + booking.guest_name + '. Infelizmente não temos disponibilidade para as datas ' +
          formatDateBR(booking.check_in) + ' a ' + formatDateBR(booking.check_out) +
          hotel + '. Posso sugerir outras datas ou acomodações?';
      // waLink codifica o texto uma unica vez (UTF-8); nao pre-codificar partes da mensagem.
      window.open(waLink(booking.guest_phone.replace(/\D/g, '').replace(/^(?!55)/, '55'), msg), '_blank');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-2xl border border-sand-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-bold text-ocean-900">{booking.guest_name}</p>
          <p className="text-sm text-ocean-900/60">
            {roomName} · {formatDateBR(booking.check_in)} → {formatDateBR(booking.check_out)} ·{' '}
            {booking.nights} {booking.nights === 1 ? 'noite' : 'noites'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display text-lg text-ocean-900">{brl(booking.total_price)}</span>
          <Badge tone={booking.status}>{statusLabel[booking.status]}</Badge>
        </div>
      </div>

      {!compact && booking.notes && (
        <p className="mt-2 rounded-xl bg-sand-100 px-3 py-2 text-sm text-ocean-900/70">
          “{booking.notes}”
        </p>
      )}

      {error && <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={waLink(booking.guest_phone.replace(/\D/g, '').replace(/^(?!55)/, '55'), 'Olá, ' + booking.guest_name + '!')}
          target="_blank" rel="noopener noreferrer"
          className="rounded-full border border-emerald-600 px-4 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
        >
          WhatsApp
        </a>
        {booking.status === 'pending' && (
          <>
            <Button size="sm" variant="success" disabled={busy} onClick={() => act('approve')}>
              {busy ? '…' : 'Aprovar'}
            </Button>
            <Button size="sm" variant="destructive" disabled={busy} onClick={() => act('reject')}>
              Recusar
            </Button>
          </>
        )}
        {booking.status === 'approved' && (
          <Button
            size="sm" variant="destructive" disabled={busy}
            onClick={() => {
              const reason = window.prompt(
                'Motivo do cancelamento (opcional — vai na mensagem ao hóspede e fica registrado):'
              );
              if (reason === null) return; // desistiu
              if (window.confirm('Cancelar esta reserva? As datas serão liberadas no site.')) {
                act('cancel', reason.trim() || undefined);
              }
            }}
          >
            {busy ? '…' : 'Cancelar reserva'}
          </Button>
        )}
      </div>
    </article>
  );
}
