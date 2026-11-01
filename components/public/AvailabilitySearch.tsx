'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { ptBR } from 'date-fns/locale';
import { addMonths, format, startOfToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { brl } from '@/lib/utils';

interface FoundRoom {
  id: string;
  name: string;
  capacity: number;
  price_per_night: number;
  images: string[] | null;
  available: boolean;
  total: number;
}

interface SearchResult {
  nights: number;
  min_nights: number;
  meets_min_nights: boolean;
  rooms: FoundRoom[];
}

export function AvailabilitySearch({ maxGuests, onBook }:
  { maxGuests: number; onBook: (roomId: string, range: { from: Date; to: Date }) => void }) {
  const today = startOfToday();
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Resultado guarda o período buscado: se o hóspede mexer nas datas, o resultado antigo não vale mais.
  const [result, setResult] = useState<(SearchResult & { from: Date; to: Date; guests: number }) | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  async function search() {
    if (!range?.from || !range?.to) return;
    const { from, to } = range;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams({
        check_in: format(from, 'yyyy-MM-dd'),
        check_out: format(to, 'yyyy-MM-dd'),
        guests: String(guests),
      });
      const res = await fetch('/api/availability?' + qs.toString(), { cache: 'no-store', signal: ctrl.signal });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error || 'Erro ao buscar disponibilidade.');
      setResult({ ...data, from, to, guests });
      setTimeout(() => resultsRef.current?.focus(), 0);
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setResult(null);
      setError(e instanceof Error && e.name !== 'TypeError' ? e.message : 'Erro ao buscar disponibilidade.');
    } finally {
      if (abortRef.current === ctrl) setLoading(false);
    }
  }

  const stale =
    !!result &&
    (range?.from?.getTime() !== result.from.getTime() || range?.to?.getTime() !== result.to.getTime() || guests !== result.guests);
  const availableCount =result ? result.rooms.filter((r) => r.available).length : 0;

  return (
    <div className="mt-10 rounded-3xl border border-sand-200 bg-sand-50 p-5 sm:p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div role="group" aria-label="Calendário: escolha a entrada e a saída" className="flex justify-center md:justify-start">
          <DayPicker
            mode="range"
            locale={ptBR}
            selected={range}
            onSelect={(r) => { setRange(r); setError(''); }}
            numberOfMonths={1}
            fromDate={today}
            toDate={addMonths(today, 6)}
            disabled={{ before: today }}
          />
        </div>

        <div className="flex-1 space-y-4">
          <p aria-live="polite" className="text-sm font-semibold text-ocean-900">
            {range?.from && range?.to
              ? format(range.from, "dd 'de' MMM", { locale: ptBR }) + ' – ' + format(range.to, "dd 'de' MMM", { locale: ptBR })
              : 'Escolha a entrada e a saída no calendário.'}
          </p>

          <div>
            <label htmlFor="av-guests" className="mb-1 block text-sm font-semibold text-ocean-900">Hóspedes</label>
            <select
              id="av-guests"
              value={guests}
              onChange={(e) => { setGuests(Number(e.target.value)); setError(''); }}
              className="h-11 w-full rounded-xl border border-ocean-300 bg-white px-3 text-sm text-ocean-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500"
            >
              {Array.from({ length: Math.min(Math.max(maxGuests, 1), 20) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'hóspede' : 'hóspedes'}</option>
              ))}
            </select>
          </div>

          <Button
            className="w-full"
            size="lg"
            variant="coral"
            disabled={!range?.from || !range?.to || loading}
            onClick={search}
          >
            {loading ? 'Buscando…' : 'Ver disponibilidade'}
          </Button>

          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
        </div>
      </div>

      {result && !stale && (
        <div ref={resultsRef} tabIndex={-1} className="mt-8 focus:outline-none">
          <p aria-live="polite" className="font-display text-xl text-ocean-900">
            {availableCount === 0
              ? 'Nenhuma acomodação disponível nestas datas'
              : availableCount + (availableCount === 1 ? ' acomodação disponível' : ' acomodações disponíveis')}
          </p>
          <p className="mt-1 text-sm text-ocean-900/60">
            {result.nights} {result.nights === 1 ? 'noite' : 'noites'}
            {result.min_nights > 1 && ' · mínimo de ' + result.min_nights + ' noites'}
          </p>

          {!result.meets_min_nights && (
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
              A estadia mínima é de {result.min_nights} noites. Ajuste as datas para reservar.
            </p>
          )}

          <ul className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {result.rooms.map((room) => {
              const cover = Array.isArray(room.images) ? room.images[0] : undefined;
              const canBook = room.available && result.meets_min_nights;
              return (
                <li key={room.id} className="flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white">
                  <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-ocean-700 to-ocean-500">
                    {cover ? (
                      <Image src={cover} alt={'Foto: ' + room.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                    ) : (
                      <span aria-hidden="true" className="font-display text-5xl text-white/25">
                        {room.name.trim().charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-display text-lg text-ocean-900">{room.name}</h3>
                    <p className="text-xs text-ocean-900/60">Até {room.capacity} hóspedes</p>
                    <div className="mt-3 flex flex-1 items-end justify-between gap-3">
                      {room.available ? (
                        <p>
                          <span className="font-display text-xl text-ocean-900">{brl(room.total)}</span>
                          <span className="block text-xs text-ocean-900/60">
                            {result.nights} {result.nights === 1 ? 'noite' : 'noites'} · {brl(room.price_per_night)}/noite
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm text-ocean-900/60">Indisponível nestas datas</p>
                      )}
                      <Button
                        size="sm"
                        variant="coral"
                        disabled={!canBook}
                        aria-label={'Reservar ' + room.name}
                        onClick={() => onBook(room.id, { from: result.from, to: result.to })}
                      >
                        {room.available ? 'Reservar' : 'Indisponível'}
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-ocean-900/50">
        Precisa de ajuda com as datas? Fale com a recepção pelo WhatsApp.
      </p>
    </div>
  );
}
