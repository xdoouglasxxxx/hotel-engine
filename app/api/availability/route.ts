import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSiteSettings } from '@/lib/site-settings';
import { z } from 'zod';

// Disponibilidade muda a cada reserva aprovada: nunca cachear esta rota.
export const dynamic = 'force-dynamic';

// Data de calendário válida: a regex só confere o formato; 2026-02-31 faria rollover no Date.
function utcDay(s: string): number | null {
  const t = Date.parse(s + 'T00:00:00Z');
  return Number.isNaN(t) || new Date(t).toISOString().slice(0, 10) !== s ? null : t;
}

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((s) => utcDay(s) !== null);

const schema = z.object({
  check_in: isoDate,
  check_out: isoDate,
  guests: z.coerce.number().int().min(1).max(20).default(1),
});

// Busca pública: para um período, lista as acomodações ativas com disponibilidade
// e total da estadia. Usa o cliente anon (RLS): rooms só expõe as ativas e
// is_range_available tem EXECUTE para anon. O total é calculado aqui, nunca no cliente;
// o preço que vale continua sendo o de POST /api/bookings.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = schema.safeParse({
    check_in: searchParams.get('check_in'),
    check_out: searchParams.get('check_out'),
    guests: searchParams.get('guests') ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
  }
  const b = parsed.data;

  const settings = await getSiteSettings();

  // "Hoje" no fuso do hotel (site_settings.timezone), não no do servidor; en-CA formata YYYY-MM-DD.
  let today: string;
  try {
    today = new Intl.DateTimeFormat('en-CA', { timeZone: settings?.timezone || 'America/Sao_Paulo' }).format(new Date());
  } catch {
    today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  }
  if (b.check_in < today) {
    return NextResponse.json({ error: 'A data de entrada já passou.' }, { status: 400 });
  }
  const nights = Math.round((utcDay(b.check_out)! - utcDay(b.check_in)!) / 86400000);
  if (nights < 1) {
    return NextResponse.json({ error: 'A saída precisa ser depois da entrada.' }, { status: 400 });
  }
  if (nights > 60) {
    return NextResponse.json({ error: 'Para estadias longas, fale direto no WhatsApp.' }, { status: 400 });
  }

  const supabase = createClient();

  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('id, name, slug, capacity, price_per_night, images')
    .eq('active', true)
    .gte('capacity', b.guests)
    .order('sort_order');
  if (roomsError) {
    return NextResponse.json({ error: 'Erro ao buscar acomodações.' }, { status: 500 });
  }

  const checks = await Promise.all(
    (rooms ?? []).map((room) =>
      supabase.rpc('is_range_available', {
        p_room_id: room.id,
        p_check_in: b.check_in,
        p_check_out: b.check_out,
      })
    )
  );
  if (checks.some((c) => c.error)) {
    return NextResponse.json({ error: 'Erro ao verificar disponibilidade.' }, { status: 500 });
  }

  const minNights = settings?.min_nights ?? 1;

  return NextResponse.json({
    ok: true,
    nights,
    min_nights: minNights,
    meets_min_nights: nights >= minNights,
    rooms: (rooms ?? []).map((room, i) => ({
      ...room,
      available: checks[i].data === true,
      total: nights * room.price_per_night,
    })),
  });
}
