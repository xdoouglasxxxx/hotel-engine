# Fila de aprovacao (noite autonoma 2026-10-31 -> 2026-11-01)

Atualizada em 2026-11-01. As tarefas foram feitas em branches separadas saindo de `develop`.

## Resolvido
| Item | Situacao |
|---|---|
| M0-16 (ruleset, push, PR, merge) | PR #2 mergeado pelo humano; rulesets ativos (GH013 testado) |
| M1-11 (codigo) | PR #1 mergeado; falta so o teste manual (item 3) |
| Achados baixos do M1-09 | decidido: entram no M2-09; sem M1-13 |
| PRs abertos pelo agente | #3 `chore/m1-09-fechamento`, #4 `docs/m6-02-deploy-checklist`; o da branch final de docs sai depois deles |

## O que o agente precisa de voce (aberto)
| # | Tarefa | O que preciso de voce | Por que | Como fazer (comandos ou cliques) | Urgencia |
|---|---|---|---|---|---|
| 3 | M1-11 | Testar no painel (dev) com reserva sintetica de nome `José & Ana #2`: aprovar, cancelar com motivo `100%` e rejeitar; conferir o texto no WhatsApp | Causa raiz e [INFERIDO]; o U+FFFD nao foi reproduzido, so a truncagem por `&` | Passos em `docs/handoffs/2026-11-01-m1-11-whatsapp.md` | baixa |
| 4 | M1-09 | Revisar e fazer o merge do PR #3; marcar M1-09 `[x]` se o relato bastar | Revisor: APROVADO COM RESSALVAS, sem critica/alta | Ler `docs/handoffs/2026-11-01-m1-fechamento.md` | baixa |
| 5 | M6-02 | Fazer o merge do PR #4 e conferir `docs/runbook.md` e preencher os [INCERTO]/[FALTA] (prod, acesso a dashboards, retencao de logs, rollback da Vercel, canal de seguranca) | O agente nao tem esses dados | Editar `docs/runbook.md` §1, §4, §5, §6 | baixa |
| 6 | Docs finais | Conferir as linhas novas em `CLAUDE.md > Decisoes` (historico recomecado, protecao remota, politica de push) | O agente so registrou o que o seu prompt declarou; | Diff da branch `docs/2026-11-01-noite-autonoma` | media |
| 7 | M0-07 | Rodar `evals/sessao-zero.md` em sessao nova com Sonnet (fora do escopo da noite) | Veredito e humano; M1-09 e M0 dependem dele para fechar | ver `evals/README.md` | media |
| 8 | Harness | A tabela de pendencias ainda mostra "aberto" para testes (D0 fechada em 2026-10-29) e para o `/deploy-checklist` ate o merge | O agente so sincronizou o corpo com a tabela; nao mexeu na tabela de decisoes | Atualizar a tabela de pendencias | baixa |

## Tarefas puladas (nao feitas)
| Tarefa | Motivo |
|---|---|
| 6. M4-02 busca de disponibilidade | Regra da sessao: contexto longo; terminei a tarefa em curso e parei, em vez de comecar uma feature com UI e revisor pela metade. Exige ler a prancha Site-Busca do PDF |
| 7. M4-06 painel de reservas | Mesmo motivo; exige a prancha Painel-Reservas e revisor |
| 8. M2-01 plano do M2 | Mesmo motivo; documento nao iniciado |

## Ordem restante de merge
1. PR #3 `chore/m1-09-fechamento` e PR #4 `docs/m6-02-deploy-checklist` (independentes entre si; so documentos e um command)
2. PR da `docs/2026-11-01-noite-autonoma` por ultimo (referencia as demais em milestones e decisoes)

O texto de cada PR esta em `docs/handoffs/pr-*.md` e vai com `--body-file` (o hook bloqueia o texto "git push" em titulo/corpo).
