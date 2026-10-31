'use client';

import { useEffect, useMemo, useState } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { ptBR } from 'date-fns/locale';
import { addMonths, differenceInCalendarDays, eachDayOfInterval, format, startOfToday } from 'date-fns';
import type { Room } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { brl, waLink, formatDateBR } from '@/lib/utils';
import { OWNER_GREETING } from '@/lib/site-config';
import { contactPhone } from '@/lib/site-public';
import { useSiteSettings } from './SiteSettingsProvider';

type Step = 'dates' | 'details' | 'done';

export function BookingForm({ room, onDone }: { room: Room; onDone: () => void }) {
  const settings = useSiteSettings();
  const phone = contactPhone(settings);
  const hostName = settings?.name ?? 'A hospedagem';
  const [range, setRange] = useState<DateRange | undefined>();
  const [occupied, setOccupied] = useState<Date[]>([]);
  const [loadingCal, setLoadingCal] = useState(true);
  const [step, setStep] = useState<Step>('dates');
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState<{ total: number; nights: number } | null>(null);

  const today = startOfToday();

  // Carrega datas ocupadas dos próximos 6 meses
  useEffect(() => {
    const start = format(today, 'yyyy-MM-dd');
    const end = format(addMonths(today, 6), 'yyyy-MM-dd');
    fetch('/api/calendar?room_id=' + room.id + '&start=' + start + '&end=' + end)
      .then((r) => r.json())
      .then((d) => {
        const dates: Date[] = (d.occupied ?? []).map((s: string) => new Date(s + 'T00:00:00'));
        setOccupied(dates);
      })
      .catch(() => setError('Não foi possível carregar o calendário.'))
      .finally(() => setLoadingCal(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  const nights = useMemo(() => {
    if (!range?.from || !range?.to) return 0;
    return differenceInCalendarDays(range.to, range.from);
  }, [range]);

  const rangeHasOccupied = useMemo(() => {
    if (!range?.from || !range?.to) return false;
    const days = eachDayOfInterval({ start: range.from, end: range.to });
    const set = new Set(occupied.map((d) => d.toDateString()));
    // check-out pode coincidir com um check-in ocupado, então ignora o último dia
    return days.slice(0, -1).some((d) => set.has(d.toDateString()));
  }, [range, occupied]);

  const total = nights * room.price_per_night;

  async function submit() {
    if (!range?.from || !range?.to) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: room.id,
          guest_name: form.name,
          guest_phone: form.phone,
          guest_email: form.email,
          check_in: format(range.from, 'yyyy-MM-dd'),
          check_out: format(range.to, 'yyyy-MM-dd'),
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar.');
      setConfirmed({ total: data.booking.total_price, nights: data.booking.nights });
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar. Tente novamente.');
    } finally {
      setSending(false);
    }
  }

  if (step === 'done' && confirmed && range?.from && range?.to) {
    const ci = format(range.from, 'yyyy-MM-dd');
    const co = format(range.to, 'yyyy-MM-dd');
    const msg =
      OWNER_GREETING + ' Acabei de enviar uma pré-reserva pelo site.\n' +
      '• Acomodação: ' + room.name + '\n' +
      '• Entrada: ' + formatDateBR(ci) + '\n' +
      '• Saída: ' + formatDateBR(co) + '\n' +
      '• Nome: ' + form.name;
    return (
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-4 font-display text-2xl text-ocean-900">Pré-reserva enviada!</h3>
        <p className="mt-2 text-sm text-ocean-900/70">
          {room.name} · {formatDateBR(ci)} → {formatDateBR(co)} · {confirmed.nights}{' '}
          {confirmed.nights === 1 ? 'noite' : 'noites'} · <strong>{brl(confirmed.total)}</strong>
        </p>
        <p className="mt-3 text-sm text-ocean-900/70">
          {hostName} vai analisar e confirmar
          {phone ? '. Para agilizar, avise pelo WhatsApp:' : ' pelo WhatsApp informado.'}
        </p>
        {phone && (
          <a href={waLink(phone, msg)} target="_blank" rel="noopener noreferrer"
             className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-3 font-bold text-white hover:bg-emerald-700">
            Abrir WhatsApp
          </a>
        )}
        <button onClick={onDone} className="mt-4 block w-full text-sm text-ocean-900/50 hover:text-ocean-900">
          Fechar
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="section-eyebrow">Pré-reserva</p>
      <h3 className="mt-1 font-display text-2xl text-ocean-900">{room.name}</h3>
      <p className="text-sm text-ocean-900/60">
        {brl(room.price_per_night)}/noite · até {room.capacity} pessoas
        {settings && settings.min_nights > 1 && ' · mínimo de ' + settings.min_nights + ' noites'}
      </p>

      {step === 'dates' && (
        <>
          <div className="mt-5 flex justify-center rounded-2xl border border-sand-200 p-3">
            {loadingCal ? (
              <p className="py-16 text-sm text-ocean-900/50">Carregando disponibilidade…</p>
            ) : (
              <DayPicker
                mode="range"
                locale={ptBR}
                selected={range}
                onSelect={setRange}
                numberOfMonths={1}
                fromDate={today}
                toDate={addMonths(today, 6)}
                disabled={[{ before: today }, ...occupied]}
                modifiersClassNames={{ disabled: 'rdp-day_disabled' }}
              />
            )}
          </div>

          {rangeHasOccupied && (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
              O período escolhido inclui datas ocupadas. Ajuste a seleção.
            </p>
          )}

          {nights > 0 && !rangeHasOccupied && (
            <p className="mt-3 rounded-xl bg-ocean-50 px-4 py-2.5 text-sm text-ocean-900">
              {nights} {nights === 1 ? 'noite' : 'noites'} ·{' '}
              <strong className="font-display text-base">{brl(total)}</strong>
            </p>
          )}

          <Button
            className="mt-4 w-full"
            size="lg"
            disabled={nights < 1 || rangeHasOccupied}
            onClick={() => setStep('details')}
          >
            Continuar
          </Button>
        </>
      )}

      {step === 'details' && (
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => { e.preventDefault(); submit(); }}
        >
          <p className="rounded-xl bg-ocean-50 px-4 py-2.5 text-sm text-ocean-900">
            {range?.from && range?.to && (
              <>
                {format(range.from, 'dd/MM/yyyy')} → {format(range.to, 'dd/MM/yyyy')} · {nights}{' '}
                {nights === 1 ? 'noite' : 'noites'} · <strong>{brl(total)}</strong>
              </>
            )}
          </p>
          <div>
            <label htmlFor="bk-name" className="mb-1 block text-sm font-semibold text-ocean-900">Nome completo *</label>
            <Input id="bk-name" required minLength={2} value={form.name}
                   onChange={(e) => setForm({ ...form, name: e.target.value })}
                   placeholder="Seu nome" autoComplete="name" />
          </div>
          <div>
            <label htmlFor="bk-phone" className="mb-1 block text-sm font-semibold text-ocean-900">WhatsApp *</label>
            <Input id="bk-phone" required inputMode="tel" value={form.phone}
                   onChange={(e) => setForm({ ...form, phone: e.target.value })}
                   placeholder="(00) 00000-0000" autoComplete="tel" />
          </div>
          <div>
            <label htmlFor="bk-email" className="mb-1 block text-sm font-semibold text-ocean-900">E-mail (opcional)</label>
            <Input id="bk-email" type="email" value={form.email}
                   onChange={(e) => setForm({ ...form, email: e.target.value })}
                   placeholder="voce@email.com" autoComplete="email" />
          </div>
          <div>
            <label htmlFor="bk-notes" className="mb-1 block text-sm font-semibold text-ocean-900">Observações (opcional)</label>
            <Textarea id="bk-notes" value={form.notes} maxLength={500}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Quantidade de pessoas, horário de chegada…" />
          </div>

          {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => setStep('dates')}>Voltar</Button>
            <Button type="submit" variant="coral" className="flex-1" disabled={sending}>
              {sending ? 'Enviando…' : 'Enviar pré-reserva'}
            </Button>
          </div>
          <p className="text-center text-[11px] text-ocean-900/50">
            Sem pagamento agora. A reserva só é confirmada após aprovação da hospedagem.
          </p>
        </form>
      )}
    </div>
  );
}
