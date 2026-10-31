import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { BOOKING_POLICY_ERROR } from '@/types/database';
import { z } from 'zod';

const schema = z.object({
  room_id: z.string().uuid(),
  guest_name: z.string().trim().min(2).max(120),
  guest_phone: z.string().trim().min(8).max(20).regex(/^[\d\s()+-]+$/),
  guest_email: z.string().trim().email().max(160).optional().or(z.literal('')),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().trim().max(500).optional(),
});

// Cria uma PRÉ-RESERVA. O preço é SEMPRE calculado no servidor a partir
// do banco (nunca confiar no valor vindo do cliente) e a disponibilidade
// é verificada antes do insert.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos. Confira os campos.' }, { status: 400 });
  }
  const b = parsed.data;

  const checkIn = new Date(b.check_in + 'T00:00:00');
  const checkOut = new Date(b.check_out + 'T00:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);

  if (checkIn < today) {
    return NextResponse.json({ error: 'A data de entrada já passou.' }, { status: 400 });
  }
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000);
  if (nights < 1) {
    return NextResponse.json({ error: 'A saída precisa ser depois da entrada.' }, { status: 400 });
  }
  if (nights > 60) {
    return NextResponse.json({ error: 'Para estadias longas, fale direto no WhatsApp.' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id, name, price_per_night, active')
    .eq('id', b.room_id)
    .single();

  if (roomError || !room || !room.active) {
    return NextResponse.json({ error: 'Acomodação não encontrada.' }, { status: 404 });
  }

  const { data: available, error: availError } = await supabase.rpc('is_range_available', {
    p_room_id: b.room_id,
    p_check_in: b.check_in,
    p_check_out: b.check_out,
  });
  if (availError) {
    return NextResponse.json({ error: 'Erro ao verificar disponibilidade.' }, { status: 500 });
  }
  if (!available) {
    return NextResponse.json(
      { error: 'Essas datas acabaram de ser ocupadas. Escolha outro período.' },
      { status: 409 }
    );
  }

  const total_price = nights * room.price_per_night;

  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      room_id: b.room_id,
      guest_name: b.guest_name,
      guest_phone: b.guest_phone,
      guest_email: b.guest_email || null,
      check_in: b.check_in,
      check_out: b.check_out,
      total_price,
      notes: b.notes || null,
      status: 'pending',
    })
    .select('id, check_in, check_out, total_price, nights')
    .single();

  if (insertError) {
    // Mínimo de noites: a regra vive no trigger enforce_booking_policy; aqui só traduzimos o erro.
    if (insertError.code === BOOKING_POLICY_ERROR.MIN_NIGHTS) {
      const min = Number.parseInt(insertError.details ?? '', 10);
      return NextResponse.json(
        { error: Number.isFinite(min) ? 'A estadia mínima é de ' + min + (min === 1 ? ' noite.' : ' noites.') : 'A estadia é menor que o mínimo permitido.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Não foi possível registrar a pré-reserva.' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    booking: { ...booking, room_name: room.name },
  });
}
