import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/require-admin';
import { z } from 'zod';

const schema = z.object({
  room_id: z.string().uuid(),
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1).max(90),
  reason: z.string().trim().max(200).optional(),
  action: z.enum(['block', 'unblock']).default('block'),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  const { room_id, dates, reason, action } = parsed.data;

  const supabase = createAdminClient();

  if (action === 'unblock') {
    const { error } = await supabase
      .from('blocked_dates')
      .delete()
      .eq('room_id', room_id)
      .in('date', dates);
    if (error) return NextResponse.json({ error: 'Erro ao desbloquear.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const rows = dates.map((date) => ({ room_id, date, reason: reason || 'Bloqueio manual' }));
  const { error } = await supabase
    .from('blocked_dates')
    .upsert(rows, { onConflict: 'room_id,date', ignoreDuplicates: true });

  if (error) return NextResponse.json({ error: 'Erro ao bloquear datas.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
