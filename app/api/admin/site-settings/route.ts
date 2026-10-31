import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/require-admin';
import { SITE_SETTINGS_TAG } from '@/lib/site-settings';
import { z } from 'zod';

// Campo de texto opcional: "" vira null; o resto é aparado e limitado.
const optional = (max: number) =>
  z.string().trim().max(max).transform((v) => (v === '' ? null : v)).nullable().optional();

// Espelha as constraints de site_settings (migração _site_settings). O banco é a
// última palavra; aqui a mensagem só fica mais clara antes de chegar lá.
const schema = z.object({
  published: z.boolean().optional(),
  name: z.string().trim().min(1).max(120),
  tagline: optional(160),
  description: optional(2000),
  address: optional(240),
  city: optional(80),
  state: optional(40),
  phone_public: z.string().trim().transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v === '' || /^[0-9]{10,15}$/.test(v), 'telefone')
    .transform((v) => (v === '' ? null : v)).nullable().optional(),
  email_public: z.string().trim().max(160).email().or(z.literal('')).transform((v) => (v === '' ? null : v)).nullable().optional(),
  instagram: z.string().trim().transform((v) => v.replace(/^@/, ''))
    .refine((v) => v === '' || /^[A-Za-z0-9._]{1,30}$/.test(v), 'instagram')
    .transform((v) => (v === '' ? null : v)).nullable().optional(),
  domain: z.string().trim().toLowerCase()
    // mesma regra do banco + recusa TLD numérico, que o parser de URL rejeita
    .refine((v) => v === '' || (/^[a-z0-9]([a-z0-9.-]{0,251}[a-z0-9])?$/.test(v) && !/\.\./.test(v) && !/\.[0-9]+$/.test(v)), 'dominio')
    .transform((v) => (v === '' ? null : v)).nullable().optional(),
  logo_path: z.string().regex(/^[A-Za-z0-9_][A-Za-z0-9/_.-]{0,199}$/).refine((v) => !v.includes('..')).nullable().optional(),
  hero_image_path: z.string().regex(/^[A-Za-z0-9_][A-Za-z0-9/_.-]{0,199}$/).refine((v) => !v.includes('..')).nullable().optional(),
  checkin_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  checkout_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  min_nights: z.number().int().min(1).max(30).optional(),
  cancellation_free_days: z.number().int().min(0).max(365).nullable().optional(),
});

// Salva a configuração do hotel. Usa o cliente de SESSÃO (anon + cookies):
// a policy admin_update_site_settings exige is_admin(); sem service role.
export async function PUT(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos. Confira os campos destacados.' }, { status: 400 });
  }

  const supabase = createClient();

  // Linha única (índice site_settings_singleton); no M2 passa a ser por tenant.
  const { data: current, error: readError } = await supabase
    .from('site_settings')
    .select('id')
    .limit(1)
    .maybeSingle();
  if (readError || !current) {
    return NextResponse.json({ error: 'Configuração não encontrada.' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('site_settings')
    .update(parsed.data)
    .eq('id', current.id)
    .select('*')
    .single();

  if (error) {
    // 23514 = check violation; 22023 = fuso inválido (trigger). Nada do Postgres vaza.
    if (error.code === '23514' || error.code === '22023') {
      return NextResponse.json({ error: 'Algum campo está fora do formato aceito.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Não foi possível salvar.' }, { status: 500 });
  }

  // O site público lê com cache de 60 s; invalidar para refletir na hora.
  revalidateTag(SITE_SETTINGS_TAG);

  return NextResponse.json({ ok: true, settings: data });
}
