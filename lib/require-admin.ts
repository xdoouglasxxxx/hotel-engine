import 'server-only';
import { createClient } from '@/lib/supabase/server';

// Confirma que a requisição vem de um usuário logado E cadastrado
// na tabela admins. Retorna null se não for admin.
export async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: admin } = await supabase
    .from('admins')
    .select('id, name, role')
    .eq('id', user.id)
    .single();

  return admin ?? null;
}
