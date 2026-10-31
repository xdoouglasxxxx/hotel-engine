import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/require-admin';
import { z } from 'zod';

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  const parsed = z.object({ booking_id: z.string().uuid() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

  const supabase = createAdminClient();

  // A constraint no_double_booking garante que, se outra reserva
  // aprovada conflitar, este update falha (código 23P01).
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'approved' })
    .eq('id', parsed.data.booking_id)
    .eq('status', 'pending')
    .select('id, guest_name, guest_phone, check_in, check_out, total_price, rooms(name)')
    .single();

  if (error) {
    if (error.code === '23P01') {
      return NextResponse.json(
        { error: 'Conflito: já existe reserva aprovada nessas datas.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Erro ao aprovar.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, booking: data });
}
