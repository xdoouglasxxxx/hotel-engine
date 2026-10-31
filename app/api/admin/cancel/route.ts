import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/require-admin';
import { z } from 'zod';

// Cancelamento feito pelo proprietário (pendente ou aprovada).
// Datas voltam a ficar livres automaticamente: o calendário e a
// trava anti-overbooking consideram apenas status = 'approved'.
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  const parsed = z.object({
    booking_id: z.string().uuid(),
    reason: z.string().max(300).optional(),
  }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancel_reason: parsed.data.reason?.trim() || null,
      cancelled_by: 'owner',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.booking_id)
    .in('status', ['pending', 'approved'])
    .select('id, guest_name, guest_phone, check_in, check_out, rooms(name)')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Reserva não encontrada ou já finalizada.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, booking: data });
}
