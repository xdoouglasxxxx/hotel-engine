# Verificacao, git e relato

## Antes de dizer "pronto"
- Rodar `/verificar` (typecheck, lint, build quando aplicavel). Se nao for possivel rodar (dependencias nao instaladas, Supabase local fora do ar), **dizer explicitamente o que nao foi verificado**.
- Nao existem testes automatizados ainda. Ate existirem, descrever o teste manual feito ou nao feito.
- Mudancas em acesso a dados, RLS, rotas ou middleware: chamar o agente `tenant-auditor` (a partir da fase multi-tenant) e o agente `revisor`.

## Git
- Commits pequenos, mensagem no imperativo em pt-BR, prefixo `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `db:` (migracoes).
- `db:` e prefixo de commit para migracoes; a branch de uma migracao usa `feat/` (quando faz parte de funcionalidade) ou `chore/` (manutencao de schema).
- Nunca `git reset --hard`, `git push --force`, `--no-verify`. Push so como `git push [-u] origin <branch-de-trabalho>` (hook `validate-bash.js`); `gh pr create` com base `develop`; `gh pr merge`, `gh api` e demais `gh` sao bloqueados. develop e main sao protegidas no GitHub e so recebem merge por PR, feito pelo humano.
- Branches saem de develop e se chamam <tipo>/<id-ou-assunto-curto>, com tipo em feat, fix, chore, docs, refactor, test; exemplo feat/m2-02-tenants. Uma branch por tarefa do milestones; apagada apos o merge.
- Nunca commitar `.env*` (exceto `.env.example`, que so pode conter placeholders), lockfiles de outro gerenciador, ou `.claude/settings.local.json`.

## Relato ao final de uma tarefa
1. O que mudou (arquivos).
2. O que foi verificado e como (comando + resultado).
3. O que **nao** foi verificado e por que.
4. Marcar [INCERTO] ou [INFERIDO] onde couber.
5. Decisoes de arquitetura tomadas -> propor linha para a secao "Decisoes" de `CLAUDE.md`; nao registrar sem aprovacao.
