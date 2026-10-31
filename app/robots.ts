import type { MetadataRoute } from 'next';
import { getSiteSettings, siteUrlFor } from '@/lib/site-settings';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = siteUrlFor(await getSiteSettings());
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/cancelar/', '/admin', '/api', '/login'] },
    ],
    sitemap: base + '/sitemap.xml',
  };
}
