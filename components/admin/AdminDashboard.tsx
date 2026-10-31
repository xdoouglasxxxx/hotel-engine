'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Booking, Room } from '@/types/database';
import { BookingCard } from './BookingCard';
import { CalendarManager } from './CalendarManager';
import { RoomEditor } from './RoomEditor';
import { MomentsManager } from './MomentsManager';
import { cn } from '@/lib/utils';

type Tab = 'reservas' | 'calendario' | 'quartos' | 'momentos';

export function AdminDashboard({ initialBookings, rooms }:
  { initialBookings: Booking[]; rooms: Room[] }) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [tab, setTab] = useState<Tab>('reservas');
  const [flash, setFlash] = useState('');

  const roomName = useMemo(() => {
    const map = new Map(rooms.map((r) => [r.id, r.name]));
    return (id: string) => map.get(id) ?? 'Acomodação';
  }, [rooms]);

  // Realtime: nova pré-reserva aparece na hora no celular do proprietário
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('bookings-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload) => {
          const b = payload.new as Booking;
          setBookings((prev) => [b, ...prev.filter((x) => x.id !== b.id)]);
          setFlash('Nova pré-reserva de ' + b.guest_name + '!');
          if ('vibrate' in navigator) navigator.vibrate?.(200);
          setTimeout(() => setFlash(''), 6000);
        })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' },
        (payload) => {
          const b = payload.new as Booking;
          setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, ...b } : x)));
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const pending = bookings.filter((b) => b.status === 'pending');
  const others = bookings.filter((b) => b.status !== 'pending');

  function updateLocal(updated: Booking) {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)));
  }

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'reservas', label: 'Reservas', badge: pending.length },
    { id: 'calendario', label: 'Calendário' },
    { id: 'quartos', label: 'Quartos' },
    { id: 'momentos', label: 'Momentos' },
  ];

  return (
    <div>
      {flash && (
        <div className="mb-4 animate-fade-up rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg">
          {flash}
        </div>
      )}

      <nav className="mb-6 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Seções do painel">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              'relative flex-none whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition',
              tab === t.id ? 'bg-ocean-800 text-white' : 'bg-white text-ocean-800 hover:bg-ocean-50'
            )}>
            {t.label}
            {!!t.badge && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-500 px-1 text-[11px] font-bold text-white">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {tab === 'reservas' && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 font-display text-xl text-ocean-900">
              Aguardando aprovação {pending.length > 0 && '(' + pending.length + ')'}
            </h2>
            {pending.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-sand-300 bg-white p-8 text-center text-sm text-ocean-900/50">
                Nenhuma pré-reserva pendente. Quando um cliente reservar pelo site, ela aparece aqui na hora.
              </p>
            ) : (
              <div className="space-y-3">
                {pending.map((b) => (
                  <BookingCard key={b.id} booking={b} roomName={roomName(b.room_id)} onUpdate={updateLocal} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl text-ocean-900">Histórico</h2>
            {others.length === 0 ? (
              <p className="text-sm text-ocean-900/50">Sem reservas anteriores.</p>
            ) : (
              <div className="space-y-3">
                {others.slice(0, 30).map((b) => (
                  <BookingCard key={b.id} booking={b} roomName={roomName(b.room_id)} onUpdate={updateLocal} compact />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === 'calendario' && <CalendarManager rooms={rooms} />}
      {tab === 'quartos' && <RoomEditor rooms={rooms} />}
      {tab === 'momentos' && <MomentsManager />}
    </div>
  );
}
