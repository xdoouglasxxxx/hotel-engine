import type { MetadataRoute } from 'next';
import { getSiteSettings, siteUrlFor } from '@/lib/site-settings';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrlFor(await getSiteSettings());
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
  ];
}
