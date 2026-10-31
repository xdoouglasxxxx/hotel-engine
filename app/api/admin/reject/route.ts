import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/require-admin';
import { z } from 'zod';

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  const parsed = z.object({
    booking_id: z.string().uuid(),
    status: z.enum(['rejected', 'cancelled']).default('rejected'),
  }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.booking_id)
    .select('id, guest_name, guest_phone, check_in, check_out, rooms(name)')
    .single();

  if (error) return NextResponse.json({ error: 'Erro ao atualizar.' }, { status: 500 });
  return NextResponse.json({ ok: true, booking: data });
}
