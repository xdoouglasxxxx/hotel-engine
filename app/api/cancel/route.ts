import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { BOOKING_POLICY_ERROR } from '@/types/database';
import { z } from 'zod';

// Cancelamento feito pelo hóspede pela página /cancelar/[id]?t=TOKEN.
// O token (uuid aleatório por reserva) é a credencial: só quem recebeu
// o link de confirmação consegue cancelar aquela reserva específica.
export async function POST(req: Request) {
  const parsed = z.object({
    booking_id: z.string().uuid(),
    token: z.string().uuid(),
  }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Link inválido.' }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_by: 'guest',
      cancelled_at: new Date().toISOString(),
      cancel_reason: 'Cancelado pelo hóspede pelo site',
    })
    .eq('id', parsed.data.booking_id)
    .eq('cancel_token', parsed.data.token)
    .in('status', ['pending', 'approved'])
    .select('id, guest_name, check_in, check_out, rooms(name)')
    .single();

  // Fora da janela de cancelamento: a regra vive no trigger enforce_booking_policy.
  if (error?.code === BOOKING_POLICY_ERROR.CANCEL_WINDOW_CLOSED) {
    return NextResponse.json(
      { error: 'O prazo para cancelar pelo site terminou. Fale com a hospedagem pelos canais de contato.' },
      { status: 403 }
    );
  }

  if (error || !data) {
    return NextResponse.json(
      { error: 'Reserva não encontrada, link inválido ou reserva já finalizada.' },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true, booking: data });
}
