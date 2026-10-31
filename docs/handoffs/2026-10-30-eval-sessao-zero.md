# Handoff: fechamento de M0-05 e M0-06 e preparacao do eval sessao-zero (M0-07)

| Campo | Valor |
|---|---|
| Data | 2026-10-30 |
| Branch | `develop` |
| Skill / fluxo usado | nenhum (`/proxima`) |
| Estado | parcial: M0-05 e M0-06 concluidos; M0-07 aguardando execucao pelo humano |
| Proximo passo imediato | humano abre sessao nova (`/clear`), cola o prompt de `evals/sessao-zero.md` e traz o transcrito; agente avalia e registra (este handoff e atualizado) |
| Contexto minimo para retomar | `evals/sessao-zero.md` (conteudo minimo, sinais de falha, tabela Execucoes), `docs/milestones.md` (Estado atual e M0), este handoff |
| Risco se parar aqui | nenhum: M0-07 segue `[ ]` e nada depende de resultado inferido |

## 1. Objetivo
Fechar formalmente M0-05 e M0-06, cujo criterio de pronto ja estava cumprido no commit `fe6aab4`, e preparar o registro do eval sessao-zero manual (M0-07), que so o humano pode rodar.

## 2. Arquivos
- `docs/milestones.md` — M0-05 e M0-06 marcados `[x]` (2026-10-30, `fe6aab4`); Estado atual atualizado; secao final aponta para `/proxima`.
- `evals/sessao-zero.md` — linha "Comandos do Claude Code" do conteudo minimo passa a incluir `/proxima`.
- `.claude/commands/proxima.md` — criado nesta sessao (inicio de sessao: le milestones, identifica a proxima tarefa, propoe prompt nos sete blocos).
- `CLAUDE.md` — §6 ganha a regra de inicio/fim de sessao por `/proxima` e `docs/milestones.md`; §5 lista `/proxima`.
- `docs/harness.md` — mapa de camadas: `/proxima` em "Acao repetivel"; `docs/milestones.md` em "Estado aberto".
- `docs/claude-code/README.md` — entrada do comando na arvore e na tabela "por que existe".
- `docs/handoffs/2026-10-30-eval-sessao-zero.md` — este arquivo (criado).
- Migracao: nao se aplica.

## 3. Passos pulados e por que
- Relato individual de M0-05 e M0-06 na sessao que os concluiu — nao foi escrito na epoca; este handoff cobre os dois retroativamente, com base no conteudo do commit `fe6aab4` (CLAUDE.md, docs/harness.md, evals/README.md, evals/sessao-zero.md, .claude/workflows/eval-sessao-zero.js).
- Execucao do eval M0-07 — nao pode ser feita pela sessao que editou o harness nem por subagente (conta como triagem). Fica com o humano.

## 4. Verificado / nao verificado
| Item | Como | Resultado |
|---|---|---|
| Criterio de M0-05 ("diff revisado e commitado") | `git show --stat fe6aab4` | CLAUDE.md e docs/harness.md no commit |
| Criterio de M0-06 (arquivos commitados) | `git ls-files evals .claude/workflows` | `evals/README.md` e `.claude/workflows/eval-sessao-zero.js` rastreados |
| `/proxima` registrado como comando | lista de skills da sessao apos criar o arquivo | aparece como `proxima` |
| `/verificar` | nao rodado | so documentacao e commands; nenhum codigo alterado |
| `/smoke-test` | nao rodado | nao se aplica |
| `revisor` | nao chamado | nenhuma rota, dado, middleware ou SQL alterado |

**Nao verificado**: se o conteudo de `fe6aab4` foi revisado por humano antes do commit (o criterio diz "revisado"); eval sessao-zero manual ainda nao rodado apos as mudancas desta sessao no CLAUDE.md e no harness.

## 5. Pendencias
- M0-07: rodar o eval em sessao nova e registrar na tabela Execucoes de `evals/sessao-zero.md`; falhas de conteudo viram linha nova no M0, nao correcao na mesma sessao.
- Triagem de 2026-10-30 (subagentes) apontou que as sessoes leram o harness truncado e omitiram Hermes, eixo 4 e `using (true)`. Se o eval manual repetir isso, abrir tarefa para encurtar ou reorganizar `docs/harness.md`.

## 6. [INCERTO] / [INFERIDO]
- [INFERIDO] M0-05 e M0-06 correspondem integralmente ao commit `fe6aab4`, pela mensagem do commit e pelos arquivos tocados; nao havia relato da sessao original.
- [INCERTO] se o humano quer que o eval manual seja rodado antes ou depois do commit `c0ced2a` (milestones) entrar no contexto; assumido depois, pois `docs/milestones.md` nao e lido automaticamente pelo eval.

## 7. Decisoes propostas (nao registradas)
- 2026-10-30: toda sessao comeca por `/proxima` e termina atualizando `docs/milestones.md`; `docs/milestones.md` e a fonte de progresso (ja refletido em CLAUDE.md §6 e no harness; registrar em Decisoes se quiser rastreabilidade por data).
