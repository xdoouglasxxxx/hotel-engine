# M0: ESLint, hook de Stop, allowlist endurecida e higiene

> Texto do PR de `chore/m0-higiene` (base: `feat/m1-site-settings`).

## Resumo

- M0-08: `eslint.config.mjs` (flat config via FlatCompat, `next/core-web-vitals`); `npm run lint` virou `eslint .`, nao interativo. Nenhuma dependencia instalada.
- M0-09: hook de Stop (`stop-verify.js`) roda o typecheck se houver mudanca de codigo no working tree ou `.ts/.tsx` no ultimo commit; distingue timeout de falha.
- M0-10: allowlist ampliada; `git commit` em allow; `Edit`/`Write` em `.claude/` e `scripts/test-hooks.js` pedem confirmacao; deny de leitura de `.env` por lista explicita (`.env`, `.local`, `.development`, `.production`, `.test`, `.env.*.local`), mantendo `.env.example` legivel.
- `validate-bash.js`: `.env` negado por nome (deny-by-default, so 4 formas sobre `.env.example`) e heuristica contra glob, chave, colchete, `$(`, crase e variavel + `nv`/`env`.
- M0-14 (parte do agente): `.gitattributes`, `package.json`/lock como `hotel-engine`, PDF de design renomeado.
- Docs: linha M0-16 e um gate novo no milestones; nota no M0-11; "Riscos aceitos" e principio de segredos no harness; decisao registrada no `CLAUDE.md`.

## Vereditos do revisor

1. Settings + stop-verify: APROVADO COM RESSALVAS (3 altas: `Edit`/`Write` sem escopo, glob de `.env`, excecao do `ls` encadeavel).
2. Apos endurecer: BLOQUEADO (bypass por quebra de linha e subexpressao do PowerShell).
3. Apos `.env` por nome: BLOQUEADO (colchete com intervalo, brace expansion, globs genericos, montagem em execucao).
4. Apos heuristica declarada e principio de segredos: **APROVADO COM RESSALVAS**, sem alta.

## Risco aceito

O hook de `.env` e heuristico. Expansao de shell (brace, glob, subshell, montagem em execucao) pode contorna-lo. Ele e defesa contra erro, nao contra ma-fe. Dano limitado: a maquina do agente so tem chaves do projeto dev com dado sintetico; chaves de prod vivem so na Vercel; apos qualquer suspeita, reset das chaves do dev. Principio: a maquina do agente nunca contem segredo de producao.

## Pendencias conhecidas (medias)

- `$(`/crase bloqueia commit com heredoc; usar `git commit -F`.
- Caminhos relativos com glob (`./app/*`) bloqueados por engano.

## Verificacao

- `node scripts/test-hooks.js`: 71 casos, FALHAS: 0
- `npm run typecheck`: sem erros
- `npm run lint`: 0 erros, 1 warning (`import/no-anonymous-default-export` em `postcss.config.mjs`)
- Deny de `.env` por lista explicita; `.env.example` nao casa com nenhum padrao (conferido pela lista, sem matcher de glob)

**Nao verificado:** comportamento real do PowerShell e do bash nos casos de glob e expansao; precedencia de `ask` sobre `allow` no Claude Code real; o stop-verify de verdade (so os 4 casos simulados); a ferramenta Read com a deny nova.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
