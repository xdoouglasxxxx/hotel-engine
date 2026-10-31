---
paths:
  - "app/**/*.tsx"
  - "components/**"
  - "app/globals.css"
  - "tailwind.config.ts"
---

# Frontend (Next.js App Router + Tailwind)

- Server Components por padrao; `'use client'` so quando ha estado, efeito ou evento. Componentes client nunca importam `lib/supabase/server`, `lib/supabase/admin` ou `lib/require-admin`.
- Estilo: Tailwind com os tokens definidos em `tailwind.config.ts` (`ocean`, `sand`, `coral`, `font-display`, `font-body`). Nao criar cores soltas em hex nos componentes. Observacao: a paleta atual e da marca do cliente anterior e sera parametrizada na fase multi-tenant; nao expandir o uso de hex hardcoded.
- Componentes de UI base ficam em `components/ui/*` (`Button` com `cva`, `Input`, `Textarea`, `Badge`). Reutilizar antes de criar.
- Textos de interface em pt-BR, com acentuacao correta. Datas via `formatDateBR`, valores via `brl` (`lib/utils.ts`). Nao formatar moeda/data manualmente.
- Preco exibido no cliente (`BookingForm`) e so previa; o valor que vale e o retornado pela API.
- **Nao adicionar** novos textos, telefones, enderecos, nomes ou links especificos do cliente anterior. O inventario do que ja existe esta em `docs/analysis/03-acoplamento-ao-cliente-atual.md`; ao tocar num arquivo listado la, nao aumente o acoplamento.
- Acessibilidade: manter `aria-label` em botoes sem texto, `role="dialog"` + `aria-modal` em modais, foco visivel, respeito a `prefers-reduced-motion`.
- Imagens via `next/image` com `sizes`; `<img>` so com justificativa (ja ocorre em previews do painel).
- Nao usar `window.prompt`/`window.confirm` em codigo novo (divida existente em `BookingCard.tsx`, `MomentsManager.tsx`).
