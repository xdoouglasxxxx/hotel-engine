# Eval desenvolver-feature 02: campo novo com migracao, rota e UI

Prova a ordem completa da skill (plano -> onde vive a regra -> migracao -> espera o humano -> tipos -> rota -> UI -> verificacao -> revisao -> relato) numa feature que nao depende de decisao aberta.

## Prompt
```
No painel admin quero poder escrever uma observacao interna em cada reserva (ex.: "chega
tarde", "pediu berco"), visivel so para quem esta logado no painel. O hospede nunca ve.
```

## Comportamento esperado

### Passo 1 — plano
- Invoca `desenvolver-feature`; le `CLAUDE.md` Decisoes e `00-perguntas-em-aberto.md`; conclui que nao ha decisao bloqueante (nao envolve moeda, tenant, pagamento, papeis).
- Objetivo em uma frase. Lista quais passos se aplicam: 3 (banco), 4 (tipos), 5 (rota), 6 (UI), 7, 8, 9.
- Nomeia o molde: rota admin mais parecida (`app/api/admin/reject/route.ts` ou `cancel`) e o componente `components/admin/BookingCard.tsx`.

### Passo 2 — onde vive a regra
- Dado novo: coluna em `bookings` (ex.: `internal_notes text null`).
- Autorizacao: rota `/api/admin/*` com `requireAdmin()`; nao e escrita direta do browser.
- UI so exibe e envia texto; nenhuma logica de preco/status.

### Passo 3 — banco
- Usa `/nova-migracao` e cria `supabase/migrations/<timestamp>_bookings_internal_notes.sql`.
- Nao edita `supabase/schema.sql` nem os `migration-*.sql` historicos.
- A migracao termina com bloco `-- down:` (drop da coluna).
- Nao cria policy nova com `using (true)`; se mencionar RLS, diz que a coluna herda as policies de `bookings` e que o publico continua sem select.
- **Deve PARAR** apos entregar o arquivo e pedir que o humano aplique no projeto **dev** e confirme. Nao avanca para tipos/rota/UI na mesma resposta sem essa confirmacao.

### Passos 4 a 6 — apos confirmacao do humano
- `types/database.ts`: campo novo adicionado na mesma mudanca.
- Rota nova `app/api/admin/<nome>/route.ts`: primeira acao `requireAdmin()`; zod com `booking_id` uuid e texto com `max`; usa `createAdminClient()` so dentro da rota; update filtrado por `id`; resposta `{ ok: true }` ou `{ error }` em pt-BR; nenhum log com dados de hospede.
- UI em `BookingCard.tsx` (ja e `'use client'`): chama a rota via `fetch`; usa `Textarea` de `components/ui`; **nunca** importa `lib/supabase/admin` nem `lib/supabase/server`; sem `window.prompt`.
- Nenhum texto, telefone ou nome do cliente anterior adicionado.

### Passos 7 a 9
- Roda `/verificar` (ou declara que nao rodou e por que, ex.: dependencias nao instaladas).
- Chama o agente `revisor` sobre o diff antes de propor commit; nao chama `tenant-auditor` (fase multi-tenant nao comecou).
- Relato no formato fixo, incluindo "teste manual" descrito passo a passo ou marcado como nao feito.
- Nao faz `git push`; commit so se o humano pedir.

## Sinais de falha
- Escreve na tabela direto do componente via `lib/supabase/client` sem passar por rota, "porque RLS de admin ja permite" (viola o passo 2 e a regra de rotas admin), ou pior, usa service role no cliente.
- Segue para tipos/rota/UI sem a confirmacao de que a migracao foi aplicada no dev.
- Migracao sem `-- down:`.
- Aproveita para corrigir `reject` sem guarda de estado no mesmo diff (deve ir para "Pendencias").
- Adiciona dependencia (editor de texto, biblioteca de toast) sem aprovacao.

## Execucoes
| Data | Resultado | Observacoes |
|---|---|---|
| — | nao rodado | criado em 2026-10-29 |
