'use client';

import { waLink } from '@/lib/utils';
import { contactPhone } from '@/lib/site-public';
import { useSiteSettings } from './SiteSettingsProvider';

export function WhatsAppFloat() {
  const settings = useSiteSettings();
  const phone = contactPhone(settings);
  if (!phone) return null;

  const msg = 'Olá! Vi o site' + (settings?.name ? ' de ' + settings.name : '') + ' e gostaria de mais informações. 🙂';

  return (
    <a
      href={waLink(phone, msg)}
      target="_blank" rel="noopener noreferrer"
      aria-label="Falar pelo WhatsApp"
      className="fixed bottom-20 right-4 z-[60] flex h-14 w-14 items-center justify-center
                 rounded-full bg-[#25D366] shadow-xl shadow-emerald-900/30 transition-transform
                 hover:scale-110 focus-visible:outline-none focus-visible:ring-2
                 focus-visible:ring-white md:bottom-6 md:right-6"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" aria-hidden="true">
        <path d="M16 3C9.4 3 4 8.3 4 14.9c0 2.6.8 5 2.3 7L4 29l7.3-2.3c1.9 1 4 1.6 6.2 1.6h.5c6.6 0 12-5.3 12-11.9C30 8.3 24.6 3 18 3h-2zm.1 2.4h1.8c5.3.1 9.7 4.4 9.7 9.6 0 5.3-4.4 9.6-9.8 9.6h-.4c-2 0-3.9-.6-5.6-1.7l-.4-.3-4.3 1.4 1.4-4.1-.3-.4c-1.3-1.7-2-3.8-2-6 0-5.2 4.5-9.6 9.9-10.1zm-3.9 4.9c-.3 0-.7.1-1 .5-.3.4-1.3 1.2-1.3 3s1.3 3.5 1.5 3.7c.2.3 2.6 4.1 6.4 5.6 3.2 1.3 3.8 1 4.5.9.7-.1 2.2-.9 2.5-1.8.3-.9.3-1.6.2-1.8-.1-.2-.3-.3-.7-.5s-2.2-1.1-2.5-1.2c-.3-.1-.6-.2-.8.2-.2.3-.9 1.2-1.1 1.4-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3-1.8-1.1-1-1.8-2.2-2-2.5-.2-.4 0-.6.2-.7l.6-.7c.2-.2.2-.4.4-.6.1-.2.1-.5 0-.7-.1-.2-.8-2-1.1-2.7-.3-.7-.6-.6-.8-.6h-.2z"/>
      </svg>
      <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-coral-500 ring-2 ring-white motion-safe:animate-ping" aria-hidden="true" />
      <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-coral-500 ring-2 ring-white" aria-hidden="true" />
    </a>
  );
}
