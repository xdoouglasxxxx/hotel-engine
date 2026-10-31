---
paths:
  - "lib/supabase/**"
  - "lib/require-admin.ts"
  - "middleware.ts"
  - "app/api/**"
  - "supabase/**"
  - "types/database.ts"
---

# Acesso a dados e Supabase

## Tres clientes, tres niveis de privilegio (nao misturar)
- `lib/supabase/client.ts` -> browser, chave anon, RLS aplicada. Unico permitido em componentes `'use client'`.
- `lib/supabase/server.ts` -> Server Components e rotas, chave anon + cookies da sessao, RLS aplicada.
- `lib/supabase/admin.ts` -> service role, ignora RLS, importa `server-only`. Somente em `app/api/**/route.ts` e Server Components que precisam ler sem sessao (ex.: `app/cancelar/[id]/page.tsx`).
- Nunca importar `lib/supabase/admin` ou ler `SUPABASE_SERVICE_ROLE_KEY` fora desses pontos. O hook `post-edit.js` bloqueia a edicao se isso acontecer.

## Regras para quem usa a service role
- Toda consulta com service role precisa de filtro explicito (hoje: `room_id`, `id`, `cancel_token`, `status`). Nunca `select` sem `where` em tabelas com dados de hospede.
- Quando a fase multi-tenant comecar, toda consulta com service role tambem filtra por tenant/propriedade. Rodar o agente `tenant-auditor` apos qualquer mudanca aqui.

## Autorizacao
- Rotas `/api/admin/*` comecam com `const admin = await requireAdmin(); if (!admin) return 401`. Manter esse padrao.
- `admins.role` existe mas nao e usado para autorizacao. Nao inventar checagens por papel sem decisao registrada em `CLAUDE.md`.

## Schema e migracoes
- Nunca editar `supabase/schema.sql`, `migration-cancelamento.sql` ou `migration-momentos.sql` para mudar o banco: sao o snapshot historico. Mudancas vao para `supabase/migrations/<YYYYMMDDHHMMSS>_<descricao>.sql` (comando `/nova-migracao`).
- Toda tabela nova: `enable row level security` + policies explicitas na mesma migracao. Nunca `using (true)` em tabela com dados de hospede.
- Toda migracao termina com um bloco comentado `-- down:` contendo os comandos de reversao. O revisor cobra isso.
- Funcoes `security definer` sempre com `set search_path = public`.
- Regras de negocio que ja vivem no banco (disponibilidade, anti-overbooking) continuam no banco; nao duplicar em TS.
- `types/database.ts` e manual. Ao mudar o schema, atualizar os tipos na mesma mudanca (ou migrar para `supabase gen types`, decisao pendente).

## Dados
- Seeds e fixtures: sempre sinteticos. Nomes, telefones e e-mails ficticios e obviamente falsos (ex.: `+55 00 00000-0000`, `teste@exemplo.test`).
- Nunca logar `guest_name`, `guest_phone`, `guest_email`, `cancel_token`.
