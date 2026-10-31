'use client';

import { createContext, useContext } from 'react';
import type { SiteSettings } from '@/types/database';

// Leva site_settings (lida no servidor) até os Client Components sem prop drilling.
// Só dados públicos: a tabela inteira é legível pelo anon.
const SiteSettingsContext = createContext<SiteSettings | null>(null);

export function SiteSettingsProvider({ settings, children }:
  { settings: SiteSettings | null; children: React.ReactNode }) {
  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}

/** Configurações do hotel; null fora do provider ou sem configuração publicada. */
export function useSiteSettings(): SiteSettings | null {
  return useContext(SiteSettingsContext);
}
