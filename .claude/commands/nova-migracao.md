---
description: Cria uma migracao SQL versionada em supabase/migrations com checklist de RLS, seguranca e tipos.
argument-hint: "<descricao-curta-em-kebab-case>"
allowed-tools: Bash(ls:*), Bash(date:*), Read, Grep, Glob, Write
---

Crie uma migracao versionada para: $ARGUMENTS

Contexto do projeto:
- O schema historico esta em `supabase/schema.sql`, `supabase/migration-cancelamento.sql` e `supabase/migration-momentos.sql`. **Nao edite esses arquivos.** Leia-os para entender o estado atual.
- Novas mudancas vao para `supabase/migrations/<YYYYMMDDHHMMSS>_<descricao>.sql` (formato do Supabase CLI). Se a pasta nao existir, crie.
- Regras em `.claude/rules/dados-e-supabase.md`.

Passos:
1. Gere o timestamp UTC com `date -u +%Y%m%d%H%M%S`.
2. Escreva a migracao com:
   - cabecalho comentado: objetivo, data, "reversao" (comandos para desfazer, mesmo que manuais);
   - `create table if not exists` / `alter table ... add column if not exists` (idempotente quando possivel);
   - para toda tabela nova: `alter table ... enable row level security;` e policies explicitas (`drop policy if exists` antes de `create policy`);
   - funcoes `security definer` com `set search_path = public`;
   - indices para colunas usadas em `where`/`join`.
3. Liste o impacto em `types/database.ts` e nos arquivos TS que leem as tabelas afetadas (use Grep por `.from('<tabela>')`). Nao altere TS neste comando; apenas liste.
4. Relate o checklist:
   - [ ] RLS habilitado e policies definidas
   - [ ] nenhum `using (true)` em tabela com dado de hospede
   - [ ] escopo por tenant considerado (se a fase multi-tenant ja comecou)
   - [ ] reversao documentada
   - [ ] tipos TS a atualizar listados
5. Pare e peca revisao. **Nao aplique a migracao** (nenhum `supabase db` ou `psql`).
