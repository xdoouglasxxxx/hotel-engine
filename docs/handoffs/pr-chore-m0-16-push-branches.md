## M0-16: push de branch de trabalho e `gh pr create` pelo agente

### O que muda
- `.claude/hooks/validate-bash.js`: nova `checkGitRemote`, fail-closed. Permite so `git push [-u] origin <branch-de-trabalho>`, `gh pr create` (base `develop`, sem `--repo`/`--head`/`--web`) e leitura de `gh pr`. Bloqueia push para main/develop/master/HEAD, force, delete, refspec, `--all`/`--tags`, outro remoto, `git remote` de escrita, `git config`/`-c` de remote/url/alias/sshCommand/hooksPath, `send-pack`, `credential`, wrappers (`bash -c`, `env`, `xargs`), variaveis e quoting; sem diferenca de caixa, `.exe` ou caminho.
- `.claude/settings.json`: deny de force, de push para main/develop/master, `gh pr merge`, `gh api`; allow de push de branch e `gh pr create`.
- `scripts/test-hooks.js`: ~80 casos novos (bypasses do revisor e regressoes de uso legitimo).
- Docs: `CLAUDE.md`, `docs/harness.md`, `.claude/rules/verificacao-e-git.md` descrevem a nova permissao; merge segue humano.

### Verificacao
- `node scripts/test-hooks.js`: FALHAS: 0. `npm run typecheck`: ok. `npm run lint`: 0 erros (1 warning antigo em `postcss.config.mjs`).
- Revisor: rodada 1 BLOQUEADO (bypasses de caixa, `.exe`, quoting, wrapper, `gh` fora do inicio) -> corrigido; rodada 2 APROVADO COM RESSALVAS (medias corrigidas).

### Nao verificado / limites [INCERTO]
- O ruleset remoto de develop/main (a barreira real) nao foi verificado pelo agente.
- O hook e heuristico. Falsos positivos conhecidos: `push` como palavra solta (`git log -S push`, `git grep push`) e texto "git push" em titulo/corpo de PR (use `--body-file`).
- Ordem de avaliacao entre `allow` do settings e o hook nao verificada em execucao real.
- As regras `allow` de push sao mais largas que o hook aceita; so o hook segura `--force`/`:main`. Aceitavel se o ruleset remoto bloqueia force-push e delecao.

### Ordem de merge
Primeiro este PR: libera o push do agente para os demais.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
