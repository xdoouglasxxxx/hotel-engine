import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  room_id: z.string().uuid(),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = schema.safeParse({
    room_id: searchParams.get('room_id'),
    start: searchParams.get('start'),
    end: searchParams.get('end'),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_occupied_dates', {
    p_room_id: parsed.data.room_id,
    p_start: parsed.data.start,
    p_end: parsed.data.end,
  });

  if (error) return NextResponse.json({ error: 'Erro ao consultar calendário.' }, { status: 500 });
  return NextResponse.json({ occupied: (data ?? []).map((r: { occupied: string }) => r.occupied) });
}
