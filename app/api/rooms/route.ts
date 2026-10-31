import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60;

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('active', true)
    .order('sort_order');

  if (error) return NextResponse.json({ error: 'Erro ao buscar quartos.' }, { status: 500 });
  return NextResponse.json({ rooms: data });
}
