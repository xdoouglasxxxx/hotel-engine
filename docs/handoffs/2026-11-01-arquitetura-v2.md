# Handoff: A-0 arquitetura v2 para o modelo de resultado

> Nunca incluir dados de hospede, valores de `.env*`, chaves ou tokens: so nomes de variaveis.

| Campo | Valor |
|---|---|
| Data | 2026-11-01 |
| Branch | `docs/arquitetura-v2` (empilhada sobre `docs/reconciliacao-2026-11-01`, a D-1, que ainda nao estava na `develop`) |
| Entrega | A-0 (somente documentos) |
| Skill / fluxo usado | nenhum (docs); Plan mode aprovado pelo proprietario |
| Estado | concluido, aguardando aceite do proprietario |
| Proximo passo imediato | humano: ler `docs/architecture-v2.md`, mergear o PR da D-1 (antes ou junto), aceitar a A-0; depois agente: T0-B (harness) e T0-A1 (migracao de medicao) |
| Contexto minimo para retomar | `docs/architecture-v2.md` (secoes 0, B, G, H); `docs/milestones.md` ("Roadmap de resultado", "Mapa M -> T"); `docs/strategy/product-strategy-v1.md` secao 5 |
| Risco se parar aqui | nenhum: so documentos. Se a D-1 for mergeada por squash, o PR da A-0 pode precisar de rebase sobre `develop` |

## 1. Objetivo
Traduzir a strategy v1 em arquitetura e roadmap (T0-T3), sem implementar nada, e registrar as decisoes de 2026-11-01.

## 2. Arquivos
- `docs/strategy/product-strategy-v1.md` — adicionado ao git (estava untracked; nome em minusculas por decisao do proprietario).
- `docs/architecture-v2.md` — criado (secoes 0 a H: decisoes assumidas, modelo de dados, maquina de estados, integracoes e jobs, concierge, metricas, mapa do codigo atual, riscos, texto de harness proposto).
- `docs/milestones.md` — reescrito em torno de T0-T3: frentes T0-A, T0-B, T1-A/B/C, T2-A/B/C, T3-A/B/C, E6-A/B; Adiado (6 tarefas movidas, texto preservado); Mapa M -> T; decisoes D10-D16 e gates DA-1 a DA-7; D6/D7/D8 atualizadas; matriz com linhas para webhooks/jobs e agente em runtime. Conferido linha a linha que nenhuma das 68 tarefas antigas sumiu.
- `docs/produto-e-roadmap.md` — visao substituida por posicionamento e outcome; frentes T0-T3; visao SaaS e epicos E0-E6 preservados na secao 5 como historico, com destino de cada um.
- `CLAUDE.md` — 11 linhas em Decisoes (as 6 pedidas + as 5 decisoes de desenho e harness do proprietario) e 3 ajustes minimos (§1 objetivo e estado, §9 pilotos). Registro feito a pedido explicito do proprietario (a regra do harness diz que o agente so propoe).
- Nao ha migracao, SQL, codigo, dependencia nem alteracao em `docs/harness.md`.

### Commits da entrega
| Commit | Tarefa | Validacao |
|---|---|---|
| `e6607f0` strategy | A-0 | arquivo existe, grep de termos |
| `54a3376` architecture-v2 | A-0 | links, grep de termos, coerencia de IDs |
| `533523f` milestones | A-0 | diff conferido: so 6 linhas de tarefa removidas, todas reaparecem em "Adiado" |
| `c6feff2` produto-e-roadmap | A-0 | diff: secoes antigas preservadas na secao 5 |
| `b6e3cd1` CLAUDE.md | A-0 | `git diff --stat` |
| `7463df2` IDs | A-0 | grep |

### Plano de rollback
Um `git revert` do merge desfaz tudo (so documentos). Nada a desfazer no banco.

## 3. Passos pulados e por que
- `revisor`: nao exigido (sem rota, SQL, RLS, service role, hook ou settings). A secao de RLS por tabela do `architecture-v2` (A) e desenho: vale uma leitura do `revisor` quando virar migracao (T0-A01).
- `/verificar` (typecheck, lint, build): nao se aplica, sem codigo.

## 4. Verificado / nao verificado
| Item | Como | Resultado |
|---|---|---|
| Links internos | script sobre `](...)` dos 3 docs | nenhum quebrado |
| Caminhos entre crases | existencia de cada arquivo citado | todos existem (os poucos nomes soltos sao pre-existentes e vivem em subpastas) |
| Termos do cliente anterior | `git grep` com a lista local `.claude/acoplamento-termos.local` (5 termos) nos 4 docs | 0 ocorrencias |
| PII e segredos | regex de telefone, e-mail, chaves | 0 |
| `[FALTA]` / `[PREENCHER]` | grep nos 3 docs | 0 (o `[PREENCHER]` da D-1 em "Entregas" foi resolvido pela sequencia T0-T3) |
| Tarefas antigas preservadas | cada ID `M*` do milestones anterior procurado no novo | 68 de 68 presentes |
| Coerencia | estados, IDs de frente e decisoes comparados entre os 3 docs | consistente; 2 referencias de ID corrigidas (`7463df2`) |

**Nao verificado:** fatos externos citados como `[INFERIDO]`/`[INCERTO]` no desenho: formato exato da assinatura de webhook do Mercado Pago, limites do cron do plano Hobby da Vercel, desativacao de `schedule` do GitHub por inatividade, suporte a pre-preenchimento de datas por parametro no formulario atual, se `pg_cron` conta como atividade para a pausa do Supabase Free, uso de retencao zero pelo provedor do modelo. O proprietario nao leu o resultado ainda.

## 5. Pendencias
- `docs/harness.md` nao foi alterado (secao H e proposta); a aplicacao e a tarefa **T0-B01**, que exige aprovacao do texto e `evals/sessao-zero` depois.
- Pranchas **Painel-Resultado** e **Painel-Concierge** nao existem: o proprietario desenha no canvas (fila 10 do milestones); sem elas as tarefas de UI correspondentes param.
- `docs/analysis/00-perguntas-em-aberto.md` nao foi atualizado com D10-D16 e DA-1 a DA-7 (fora do escopo); o proprietario pode pedir.
- Conflito achado ao aplicar as decisoes: **telefone so como hash x follow-up proativo em T2** (`architecture-v2` G.2 item 1). Recomendacao: guardar cifrado e expurgar com as mensagens. Aguarda decisao (DA-6).

## 6. [INCERTO] / [INFERIDO]
- [INFERIDO] fato gerador do variavel (confirmacao) e prazo do `phone_hash` (30 dias) sao propostas a confirmar.
- [INFERIDO] sem dados reais em nenhuma instancia, o que dispensaria expand/contract; mantido por exigencia do protocolo.
- [INCERTO] o tempo de 1a resposta < 2 min **nao e comprovavel em T1** (o operador digita o horario da mensagem); so em T2. O criterio de sucesso da strategy 2.12 precisa dessa ressalva.
- [INCERTO] pendencias do juridico (G.3): o documento descreve minimizacao tecnica, nao e parecer.

## 7. Decisoes propostas (nao registradas)
Ja registradas em `CLAUDE.md` a pedido explicito: as 11 linhas de 2026-11-01. Nao ha linha nova proposta alem de:
- `- 2026-11-01: [proposta] telefone em repouso para follow-up em T2: cifrado com chave do Vault e expurgado com as mensagens (aguarda decisao DA-6).`
