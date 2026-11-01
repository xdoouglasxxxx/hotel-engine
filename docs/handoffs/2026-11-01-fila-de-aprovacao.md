# Fila de aprovacao (noite autonoma 2026-10-31 -> 2026-11-01)

Comece por aqui. Tudo foi feito localmente, em branches separadas saindo de `develop`; nada foi publicado. O hook ainda e a versao antiga em `develop` (push bloqueado), entao o primeiro push e seu, no terminal.

## O que o agente precisa de voce
| # | Tarefa | O que preciso de voce | Por que | Como fazer (comandos ou cliques) | Urgencia |
|---|---|---|---|---|---|
| 1 | M0-16 | Conferir o ruleset remoto de `develop` e `main` (PR obrigatorio, sem force-push, sem delecao); ler o diff do hook; push e PR; merge | O hook e heuristico; a barreira real e o ruleset, que o agente nao verificou. O revisor deu BLOQUEADO na 1a rodada e APROVADO COM RESSALVAS na 2a | GitHub > Settings > Rules; depois os comandos da secao "Comandos" | alta (libera o push do agente) |
| 2 | M0-16 | Aceitar que a branch edita `CLAUDE.md`, `docs/harness.md` e `.claude/rules/verificacao-e-git.md` (commit `docs:`) | Essas edicoes ja estavam no working tree no inicio da sessao (Prompt 1); descrevem a permissao de push | Ler o commit `docs:` no PR | media |
| 3 | M1-11 | Testar no painel (dev) com reserva sintetica de nome `José & Ana #2`: aprovar, cancelar com motivo `100%` e rejeitar; conferir o texto no WhatsApp | Causa raiz e [INFERIDO]; o U+FFFD nao foi reproduzido, so a truncagem por `&` | Passos em `docs/handoffs/2026-11-01-m1-11-whatsapp.md` | baixa |
| 4 | M1-09 | Marcar M1-09 `[x]` se o relato bastar; decidir se os 7 achados baixos viram M2-09 ou uma linha M1-13 | Revisor: APROVADO COM RESSALVAS, sem critica/alta | Ler `docs/handoffs/2026-11-01-m1-fechamento.md` | baixa |
| 5 | M6-02 | Conferir `docs/runbook.md` e preencher os [INCERTO]/[FALTA] (prod, acesso a dashboards, retencao de logs, rollback da Vercel, canal de seguranca) | O agente nao tem esses dados | Editar `docs/runbook.md` §1, §4, §5, §6 | baixa |
| 6 | Docs finais | Conferir as linhas novas em `CLAUDE.md > Decisoes` (historico recomecado, protecao remota declarada, politica de push) | O agente so registrou o que o seu prompt declarou; a protecao remota nao foi verificada | Diff da branch `docs/2026-11-01-noite-autonoma` | media |
| 7 | M0-07 | Rodar `evals/sessao-zero.md` em sessao nova com Sonnet (fora do escopo da noite) | Veredito e humano; M1-09 e M0 dependem dele para fechar | ver `evals/README.md` | media |
| 8 | Harness | A tabela de pendencias ainda mostra "aberto" para testes (D0 fechada em 2026-10-29) e para o `/deploy-checklist` ate o merge | O agente so sincronizou o corpo com a tabela; nao mexeu na tabela de decisoes | Atualizar a tabela de pendencias | baixa |

## Tarefas puladas (nao feitas)
| Tarefa | Motivo |
|---|---|
| 6. M4-02 busca de disponibilidade | Regra da sessao: contexto longo; terminei a tarefa em curso e parei, em vez de comecar uma feature com UI e revisor pela metade. Exige ler a prancha Site-Busca do PDF |
| 7. M4-06 painel de reservas | Mesmo motivo; exige a prancha Painel-Reservas e revisor |
| 8. M2-01 plano do M2 | Mesmo motivo; documento nao iniciado |

## Ordem sugerida de merge
1. `chore/m0-16-push-branches` (libera o push do agente para o resto)
2. `fix/m1-11-whatsapp-encoding` (unica mudanca de codigo de app; independente)
3. `chore/m1-09-fechamento` (so doc)
4. `docs/m6-02-deploy-checklist` (command + runbook; independente)
5. `docs/2026-11-01-noite-autonoma` (por ultimo: referencia as demais em milestones e decisoes)
Conflitos esperados: nenhum de conteudo. `CLAUDE.md` e `docs/harness.md` sao editados na M0-16 e na branch final em linhas diferentes; se o Git acusar conflito, mantenha as duas versoes.

## Comandos (por branch; rode a partir da raiz do repo)
Os textos de PR usam `--body-file` porque o hook bloqueia o texto "git push" em titulo/corpo.
```
git push -u origin chore/m0-16-push-branches
gh pr create --base develop --title "chore: libera push de branch e gh pr create (M0-16)" --body-file docs/handoffs/pr-chore-m0-16-push-branches.md

git push -u origin fix/m1-11-whatsapp-encoding
gh pr create --base develop --title "fix: mensagens de WhatsApp do painel via waLink (M1-11)" --body-file docs/handoffs/pr-fix-m1-11-whatsapp-encoding.md

git push -u origin chore/m1-09-fechamento
gh pr create --base develop --title "docs: fechamento do M1 (M1-09)" --body-file docs/handoffs/pr-chore-m1-09-fechamento.md

git push -u origin docs/m6-02-deploy-checklist
gh pr create --base develop --title "docs: /deploy-checklist e runbook inicial (M6-02)" --body-file docs/handoffs/pr-docs-m6-02-deploy-checklist.md

git push -u origin docs/2026-11-01-noite-autonoma
gh pr create --base develop --title "docs: milestones, decisoes e handoff da noite autonoma" --body-file docs/handoffs/pr-docs-2026-11-01-noite-autonoma.md
```
Depois do merge da M0-16 e de `git switch develop && git pull`, o agente consegue fazer os pushes seguintes sozinho.
