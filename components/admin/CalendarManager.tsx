'use client';

import { useCallback, useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { ptBR } from 'date-fns/locale';
import { addMonths, format, startOfToday } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import type { Room, BlockedDate } from '@/types/database';
import { Button } from '@/components/ui/button';

// Bloqueio manual de datas: o proprietário marca dias como indisponíveis
// (manutenção, reserva por telefone etc). Clicar de novo desbloqueia.
export function CalendarManager({ rooms }: { rooms: Room[] }) {
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? '');
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [approvedDays, setApprovedDays] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Date[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const today = startOfToday();

  const load = useCallback(async () => {
    if (!roomId) return;
    const supabase = createClient();
    const start = format(today, 'yyyy-MM-dd');
    const end = format(addMonths(today, 6), 'yyyy-MM-dd');

    const [{ data: blocks }, occ] = await Promise.all([
      supabase.from('blocked_dates').select('*').eq('room_id', roomId).gte('date', start),
      fetch('/api/calendar?room_id=' + roomId + '&start=' + start + '&end=' + end).then((r) => r.json()),
    ]);

    const blockedSet = new Set(((blocks ?? []) as BlockedDate[]).map((b) => b.date));
    setBlocked(blockedSet);
    const occSet = new Set<string>((occ.occupied ?? []).filter((d: string) => !blockedSet.has(d)));
    setApprovedDays(occSet);
    setSelected([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => { load(); }, [load]);

  async function apply(action: 'block' | 'unblock') {
    if (selected.length === 0) return;
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/block-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId,
          dates: selected.map((d) => format(d, 'yyyy-MM-dd')),
          action,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro.');
      setMsg(action === 'block' ? 'Datas bloqueadas.' : 'Datas liberadas.');
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erro.');
    } finally {
      setBusy(false);
    }
  }

  const toDate = (s: string) => new Date(s + 'T00:00:00');

  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-5">
      <h2 className="font-display text-xl text-ocean-900">Bloquear / liberar datas</h2>
      <p className="mt-1 text-sm text-ocean-900/60">
        Selecione os dias e use os botões. Dias em <span className="font-bold text-ocean-800">azul escuro</span> já
        têm reserva aprovada; dias <span className="font-bold text-sand-700">riscados em bege</span> estão bloqueados manualmente.
      </p>

      <label className="mt-4 block text-sm font-semibold text-ocean-900" htmlFor="cal-room">Acomodação</label>
      <select
        id="cal-room"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="mt-1 h-11 w-full max-w-sm rounded-xl border border-sand-200 bg-white px-3 text-sm"
      >
        {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
      </select>

      <div className="mt-4 flex justify-center rounded-2xl border border-sand-100 p-2 sm:justify-start">
        <DayPicker
          mode="multiple"
          locale={ptBR}
          selected={selected}
          onSelect={(d) => setSelected(d ?? [])}
          numberOfMonths={1}
          fromDate={today}
          toDate={addMonths(today, 6)}
          disabled={[...approvedDays].map(toDate)}
          modifiers={{
            blockedDay: [...blocked].map(toDate),
            approvedDay: [...approvedDays].map(toDate),
          }}
          modifiersStyles={{
            blockedDay: { backgroundColor: '#eaddc0', textDecoration: 'line-through', borderRadius: '8px' },
            approvedDay: { backgroundColor: '#1e5262', color: '#fff', borderRadius: '8px', opacity: 1 },
          }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button disabled={busy || selected.length === 0} onClick={() => apply('block')}>
          Bloquear {selected.length > 0 && '(' + selected.length + ')'}
        </Button>
        <Button variant="outline" disabled={busy || selected.length === 0} onClick={() => apply('unblock')}>
          Liberar selecionadas
        </Button>
        {msg && <span className="text-sm font-semibold text-ocean-700">{msg}</span>}
      </div>
    </div>
  );
}
