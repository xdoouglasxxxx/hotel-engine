import { createClient } from '@/lib/supabase/server';
import { Hero } from '@/components/public/Hero';
import { About } from '@/components/public/About';
import { RoomsSection } from '@/components/public/RoomsSection';
import { Moments } from '@/components/public/Moments';
import { Location } from '@/components/public/Location';
import { Footer } from '@/components/public/Footer';
import { Header } from '@/components/public/Header';
import { WhatsAppFloat } from '@/components/public/WhatsAppFloat';
import { MobileBookBar } from '@/components/public/MobileBookBar';
import { Reveal } from '@/components/public/Reveal';
import { SiteSettingsProvider } from '@/components/public/SiteSettingsProvider';
import { getSiteSettings } from '@/lib/site-settings';
import type { GalleryPhoto, Room } from '@/types/database';

export const revalidate = 60;

export default async function HomePage() {
  const settings = await getSiteSettings();
  const supabase = createClient();
  const { data } = await supabase
    .from('rooms')
    .select('*')
    .eq('active', true)
    .order('sort_order');

  const rooms = (data ?? []) as Room[];

  const { data: momentData } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(24);
  const moments = (momentData ?? []) as GalleryPhoto[];
  const minPrice = rooms.length ? Math.min(...rooms.map((r) => r.price_per_night)) : 0;

  return (
    <SiteSettingsProvider settings={settings}>
      <Header />
      <main>
        <Hero settings={settings} />
        <Reveal><About settings={settings} /></Reveal>
        <Reveal><RoomsSection rooms={rooms} /></Reveal>
        <Reveal><Moments photos={moments} /></Reveal>
        <Reveal><Location settings={settings} /></Reveal>
      </main>
      <Footer settings={settings} />
      <WhatsAppFloat />
      <MobileBookBar minPrice={minPrice} />
    </SiteSettingsProvider>
  );
}
