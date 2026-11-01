## Ajustes pos-noite: milestones, harness, `.hermes.md` e decisao sobre edicao em lote

So docs e `.hermes.md`.

- `docs/milestones.md`: protocolo "rigido" agora separa push de `develop`/`main` e merge (humano) de push de branch de trabalho e `gh pr create` (agente, M0-16); nova autorizacao em pe de 2026-11-01 com limites; Fila do humano sem D1/D2 e com teste M1-11 no preview, eval sessao-zero com Sonnet, runbook §1 e §4 a §6, projeto novo `hotel-engine` na Vercel so com Preview, decisao M1-10 (Momentos) e conferencia do `.hermes.md`; Estado atual na `develop` com lote M4-02 + M4-06 + M2-01; M0-16 em `[x]`.
- `.hermes.md` linha 11: Hermes continua sem push proprio; ao delegar ao Claude Code, push de branch de trabalho e PR sao permitidos; `develop`/`main` nunca.
- `docs/harness.md`: tabela de pendencias (testes/D0 fechada em 2026-10-29; `/deploy-checklist` fechado em M6-02; M0-16 fechado); novo risco aceito (edicao de docs em lote por `awk`/`sed` proibida ao agente; usar Edit por trecho).
- `CLAUDE.md > Decisoes`: linha de 2026-11-01 correspondente.

### Atencao ao merge
Esta branch saiu da `develop` sem os PRs #3, #4 e #5. O #5 (`docs/2026-11-01-noite-autonoma`) edita as mesmas areas de `docs/milestones.md` (Estado atual, Fila do humano, linhas M0-16, M1-09, M1-11, M6-02, M2-09), `CLAUDE.md > Decisoes` e `docs/harness.md` (marcadores `[FALTA]`, tabela de pendencias, Riscos aceitos). Ordem sugerida: mergear #3, #4 e #5 primeiro e depois este, resolvendo o conflito do `milestones.md` mantendo as duas versoes; ou mergear este antes e deixar o conflito para o #5. Se houver conflito, o texto deste PR (Fila do humano, Estado atual, M0-16 `[x]`) e o mais recente.

Verificado: `git diff --stat` conferido apos as edicoes (so os 4 arquivos), sem marcadores de conflito. Nao verificado: rodada de `test-hooks`/typecheck (nenhum codigo mudou); renderizacao das tabelas.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
