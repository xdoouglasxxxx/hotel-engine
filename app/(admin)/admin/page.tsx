import { createClient } from '@/lib/supabase/server';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import type { Booking, Room } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = createClient();

  const [{ data: bookings }, { data: rooms }] = await Promise.all([
    supabase
      .from('bookings')
      .select('*, rooms(name)')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('rooms').select('*').order('sort_order'),
  ]);

  return (
    <AdminDashboard
      initialBookings={(bookings ?? []) as Booking[]}
      rooms={(rooms ?? []) as Room[]}
    />
  );
}
