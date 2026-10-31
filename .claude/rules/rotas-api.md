---
paths:
  - "app/api/**"
---

# Rotas de API (`app/api/**/route.ts`)

Padrao observado em todas as rotas existentes; manter:

1. **Validar entrada com zod** antes de qualquer acesso ao banco. `safeParse(await req.json().catch(() => null))`; invalido -> 400 com mensagem generica em pt-BR.
2. **Nunca confiar em preco, noites ou status vindos do cliente.** O servidor recalcula (`total_price = nights * price_per_night` em `app/api/bookings/route.ts`).
3. **Codigos de status**: 400 entrada invalida · 401 sem admin · 404 recurso inexistente/inativo · 409 conflito de datas (erro Postgres `23P01` da constraint `no_double_booking`) · 500 erro interno.
4. **Resposta**: `{ ok: true, ... }` ou `{ error: 'texto em pt-BR para o usuario' }`. Nao vazar mensagens do Postgres nem stack traces.
5. **Mudancas de status** sempre com guarda do estado atual na clausula `where` (`.eq('status', 'pending')`, `.in('status', [...])`). Divida conhecida: `reject/route.ts` nao tem guarda; corrigir quando tocar nela.
6. **Datas**: strings `YYYY-MM-DD` validadas por regex; nao criar `Date` com fuso implicito sem necessidade. Divida conhecida: "data ja passou" usa fuso do servidor.
7. **Sem logs com dados de hospede.** Logar apenas ids e codigos de erro.
8. Rotas publicas que usam service role (`bookings`, `cancel`) sao o ponto mais sensivel do sistema: qualquer mudanca nelas pede revisao com o agente `revisor`.
