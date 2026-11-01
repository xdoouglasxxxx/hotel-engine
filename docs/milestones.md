# Hotel Engine — Milestones

Fonte da verdade do PROGRESSO. `docs/produto-e-roadmap.md` diz o que e por que; este arquivo diz onde estamos, o que o agente pode pegar agora e o que espera o humano.
Toda sessao do Claude Code comeca lendo "Estado atual" e "Fila do humano", e termina atualizando-os.

## Protocolo (versao 2, 2026-10-31: flexivel por padrao, rigido onde ha risco)

**O que e rigido (nao muda sem decisao registrada no CLAUDE.md):**
- GATE (coluna Gate com D-algo aberto) e tarefa marcada `humano` so o humano marca. O agente para, escreve o que precisa, e segue para outra tarefa liberada em vez de esperar.
- Aplicar migracao, `git push`, deploy, instalar dependencia e qualquer escrita em Supabase/Vercel sao do humano. O agente prepara ate o ponto imediatamente anterior.
- Rota, SQL, RLS, service role ou hook: `revisor` antes do commit, sem excecao. Tarefa assim sem veredito fica `[~]`, nunca `[x]`.
- Um objetivo por commit. Uma sessao pode encadear varios commits (ver "lote"), mas cada commit tem um objetivo e, quando couber, o veredito do revisor no corpo.

**O que e flexivel:**
- **Ordem.** A ordem das linhas e preferencia, nao lei. O agente pode pegar qualquer tarefa `[ ]` cujas dependencias DURAS (marcadas com `!`) estejam `[x]` e cujo gate esteja fechado; dependencias sem `!` sao sugestao de ordem e podem ser puladas com uma nota. Ao escolher fora da ordem, o agente diz por que no relato.
- **Lote.** Tarefas adjacentes, na mesma branch, sem gate e sem migracao entre elas, podem ser feitas na mesma sessao (ex.: M0-08 + M0-09; M1-03 + M1-04). O lote e declarado no inicio do relato.
- **Milestones em paralelo.** Trabalhar no M1 com o M0 aberto e permitido quando houver autorizacao em pe (secao "Autorizacoes em pe"). O criterio de saida de cada milestone continua valendo para fecha-lo.
- **Tarefas humanas nao bloqueiam o agente.** Tudo que depende do humano vai para "Fila do humano"; o agente segue com o que esta liberado.
- **Tamanho.** O agente pode dividir uma linha em sub-tarefas (M1-06a, M1-06b) ou fundir duas, desde que atualize a tabela e o criterio de pronto continue verificavel.
- **Descobertas.** Tarefa nova encontrada no caminho entra como linha com nota "descoberta em <tarefa>". Se for pequena (< 15 min), sem gate, sem migracao e na mesma area, pode ser feita no mesmo lote; senao, fica para depois.

**Status:** `[ ]` aberta · `[~]` em andamento ou aguardando revisor · `[h]` entregue pelo agente, aguardando verificacao do humano · `[x]` concluida e aceita · `[!]` bloqueada (motivo na Nota) · `[-]` descartada (motivo na Nota).

**Pronto quando** tem duas partes quando necessario: *agente:* (o que o agente verifica sozinho) e *humano:* (o que so o humano confirma). O agente marca `[h]` ao cumprir a parte dele; o humano marca `[x]`.

**Milestone concluido** = todas as linhas `[x]` ou `[-]`; criterio de saida verificado e registrado; `evals/sessao-zero` rodado se o harness mudou. Linhas `[h]` impedem o fechamento, mas nao impedem o milestone seguinte de comecar.

Legenda: **Dep** = IDs de que depende (`!` = dura) · **Gate** = decisao humana (secao Decisoes) · **Nota** = data, commit, bloqueio, motivo.

---

## Estado atual

| Campo | Valor |
|---|---|
| Ultima atualizacao | 2026-11-01 (agente: M0-16 mergeada pelo humano (PR #2); PRs #3 (M1-09) e #4 (M6-02) abertos; branch final de docs a seguir; ver `docs/handoffs/2026-11-01-fila-de-aprovacao.md`) |
| Milestones ativos | M0 (fechando) e M1 (em andamento, autorizado) |
| Branch de trabalho | `docs/2026-11-01-noite-autonoma` (docs); PRs abertos: `chore/m1-09-fechamento`, `docs/m6-02-deploy-checklist` |
| Modelo em uso | local `qwen3-coder-16k` certificado so para leitura/triagem; Sonnet/Fable para rotas, SQL, RLS, revisor, upgrades (ver harness, eixo 4) |
| Lote sugerido para o agente | M1-12 (PWA, media); M4-02 e M4-06 (nao feitos na noite de 2026-10-31: contexto longo); M2-01 (plano, so documento, nao feito). M1-10 e gate humano |
| Bloqueios | nenhum de agente. Ressalvas medias do revisor movidas para M2-09 |

## Fila do humano (o que so voce destrava)

| Prioridade | Item | Libera |
|---|---|---|
| 0 | Seguir `docs/handoffs/2026-11-01-fila-de-aprovacao.md`: conferir ruleset remoto, push e PR de cada branch na ordem sugerida; merge da M0-16 primeiro | M0-16, M1-09, M1-11, M6-02 |
| 1 | Rodar `evals/sessao-zero.md` em sessao nova com Sonnet (veredito) e registrar; registrar tambem a rodada com `qwen3-coder-16k` como certificacao local | M0-07 |
| 2 | Registrar D1 e D2 em `CLAUDE.md > Decisoes` (ja decididas no chat de 2026-10-30) | M0-15, fecha D1/D2 |
| 3 | Renomear repo, Vercel e projeto prod para hotel-engine (M0-14) | M0-14, M6-04 |
| 4 | Conferir o `.hermes.md` ajustado (o `docs/design/` movido ja foi commitado) | higiene |

## Autorizacoes em pe

| Data | Autorizacao | Limites |
|---|---|---|
| 2026-10-30 | Executar M1 com M0 aberto | parar na migracao para o humano aplicar; verificacao visual e upload ficam para o humano |
| 2026-10-30 | `npm install` do ESLint (M0-08) | so eslint e eslint-config-next; nenhuma outra dependencia |
| 2026-10-31 | Commit local sem confirmacao (allowlist, M0-10) | push, deploy, migracao, dependencias seguem humanos; commit traz veredito do revisor quando a tarefa exigir |
| 2026-10-31 | Protocolo v2: ordem flexivel, lotes, paralelismo entre milestones | respeitar deps duras (`!`), gates, revisor obrigatorio |

---

## Decisoes (portoes)

| ID | Decisao | Status | Opcao | Bloqueia |
|---|---|---|---|---|
| D0 | Testes automatizados | fechada 2026-10-29 | sem por ora; reavaliar antes da 1a reserva real ou do M2 | — |
| D1 | Moeda | fechada 2026-10-30 (registrada em CLAUDE.md, M0-15) | so BRL ate M2 | — |
| D2 | Modelo de tenant | fechada 2026-10-30 (registrada em CLAUDE.md, M0-15) | `tenants` + `tenant_id` + RLS | M2-02 |
| D3 | Roteamento | aberta | sugestao: subdominio primeiro | M3-01, M3-05 |
| D4 | Pagamento | aberta | sugestao: sinal via Pix | M4-03 |
| D5 | Prod Free vs Pro | aberta | — | M6-01 |
| D6 | SaaS ou instancia por cliente | aberta | — | M5-03 |
| D7 | Gateway de pagamento (qual) | aberta | — | M4-03 |
| D8 | Provedor de e-mail/WhatsApp | aberta | — | M4-01, M5-02 |
| D9 | Politica de modelo: classes de tarefa x modelo minimo | decidida 2026-10-31 (harness, eixo 4) | local so para classes certificadas por eval | — |

---

## M0 · Fundacao (harness, ambiente, higiene)
Criterio de saida: `test-hooks` verde; `/verificar` roda typecheck+lint; sessao-zero 11/11 no modelo padrao; dependencias diretas sem high/critical; nenhum dado do cliente anterior em `app/ components/ lib/ public/`.

| ID | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|
| M0-01 | Harness, skills, agentes, hooks, test-hooks | — | — | FALHAS: 0 | [x] | 2026-10-29 |
| M0-02 | Hermes como memoria/orquestrador | M0-01 | — | job harness-check retorna OK | [x] | 2026-10-29 |
| M0-03 | Ambiente dev: hotel-engine-dev, admin, .env.local, site e painel em localhost | — | — | conferencia 5/5/7 e login ok | [x] | 2026-10-29 |
| M0-04 | Remover dados pessoais do cliente anterior | M0-03 | — | grep zero em app/components/lib | [x] | 2026-10-30 |
| M0-05 | Resumo executivo do harness + correcoes no CLAUDE.md | M0-01 | — | commitado | [x] | 2026-10-30, fe6aab4 |
| M0-06 | Protocolo de eval em duas etapas + workflow versionado | M0-05 | — | commitado | [x] | 2026-10-30, fe6aab4 |
| M0-07 | Eval sessao-zero manual | M0-05! | — | *humano:* roda em sessao nova com o modelo padrao; *agente:* registra. 11/11 fecha; rodadas com modelo local vao para a tabela de execucoes como certificacao | [h] | humano roda; triagens 2026-10-30 (subagente 8-10/11; gemma 5/11) |
| M0-08 | ESLint configurado; /verificar roda lint sem prompt | M0-05! | — | `npm run lint` nao interativo, 0 erros | [x] | 2026-10-31; `eslint .` + `eslint.config.mjs` (FlatCompat), nada instalado; 1 warning em postcss.config.mjs |
| M0-09 | Hook de Stop com typecheck + 4 casos no test-hooks | M0-08 | — | FALHAS: 0 (41 casos) | [x] | 2026-10-31; `.claude/hooks/stop-verify.js`; ressalvas do revisor (working tree, timeout) tratadas no commit extra; resta so repo de 1 commit (baixa) |
| M0-10 | Allowlist de permissoes (leitura, verificacao, edicao e git local) | M0-05! | — | test-hooks verde; sem push/reset/rebase/filter-repo na allow; commit permitido | [x] | 2026-10-31; 4 rodadas do revisor, ultima APROVADO COM RESSALVAS (medias/baixas). Pendentes: `$(`/crase bloqueia commit com heredoc (usar `git commit -F`); glob com `./app/*` e falso positivo. Resolvida: deny de `.env` por lista explicita, `.env.example` legivel. Hook e heuristico (harness, Riscos aceitos) |
| M0-11 | Upgrade Next 14.2 -> 15.x (React 19), branch propria | M0-08! | — | build, /verificar, /smoke-test no dev, revisor APROVADO | [ ] | sem --force; modelo Sonnet/Fable; ao subir o Next, declarar/remover @eslint/eslintrc e revalidar eslint.config.mjs (flat config nativo do next lint 15+) |
| M0-12 | Upgrade zod 3 -> 4, PR separado | M0-11! | — | rotas com validacao passando; revisor APROVADO | [ ] | |
| M0-13 | Varredura final de acoplamento (marca, geo, imagens, dominio, package name) | M0-04 | — | inventario 03 zerado ou movido para M1 | [~] | boa parte ja coberta por M1-04/M1-08; restam package name (M0-14) e icones |
| M0-14 | Renomear repo, package, Vercel e prod para hotel-engine; .gitattributes | M0-13 | — | *agente:* package.json, .gitattributes, referencias em .claude/ docs/ scripts/; *humano:* repo, Vercel, prod | [ ] | *agente feito 2026-10-31* (package.json/lock, .gitattributes, PDF renomeado); falta *humano* (fila 3); producao v1.0 da Vercel protegida em 2026-10-31 (All Deployments); ao renomear, conferir variaveis de producao (so nomes) e decidir se os deploys antigos de producao sao apagados |
| M0-15 | GATE: registrar D1 e D2 em CLAUDE.md | — | D1, D2 | linhas presentes | [x] | humano na fila (2) |
| M0-16 | Push para branches de trabalho e PR pelo agente; hook permite so `git push origin <branch nao protegida>`; `gh pr create` liberado, `gh pr merge` bloqueado | M0-10! | — | test-hooks verde com os casos de push; revisor APROVADO | [h] | mergeada pelo humano em 2026-11-01 (PR #2); rulesets ativos em develop e main (gate cumprido; push direto recusado com GH013, testado pelo humano); revisor 2a rodada APROVADO COM RESSALVAS (restam falsos positivos de leitura e `git send-pack`, baixos); `.hermes.md` linha 11 ainda proibe push (fila do humano) |
| M0-17 | Fontes locais: trocar `next/font/google` por `next/font/local` (build sem rede externa) | — | — | build local passa; typecheck ok; layout sem import de `next/font/google` | [x] | 2026-10-31, branch `fix/fontes-locais`; origem: falha intermitente do build na Vercel; harness eixo 3 |

## M1 · Configuracao do hotel por tenant (site_settings)
Pranchas: Painel-Config, Main. Criterio de saida: nenhum texto/marca/contato/imagem hardcoded; painel edita e site reflete; seed "Hotel Engine Demo"; revisor APROVADO nas rotas.

| ID | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|
| M1-01 | Plano do M1 | — | — | plano registrado | [x] | 2026-10-30; handoff m1-plano-e-migracoes |
| M1-02 | Migracoes site_settings, site_storage, booking_policy + seed + types | M1-01 | — | humano aplicou no dev; 12/12 ok | [x] | 2026-10-30 |
| M1-03 | lib/site-settings.ts + layout/metadata/JSON-LD + About | M1-02! | — | site mostra "Hotel Engine Demo" | [x] | 2026-10-31; revisor com ressalvas corrigidas |
| M1-04 | Demais componentes publicos lendo settings | M1-03 | — | grep de marca zero | [x] | 2026-10-31 |
| M1-05 | Storage por hotel + upload no painel | M1-02! | — | *agente:* policies e form escritos, typecheck ok; *humano:* upload funciona logado | [x] | 2026-10-31, verificado pelo humano no preview da Vercel |
| M1-06 | Painel > Configuracoes: Site e marca, Politicas e horarios | M1-03 | — | *agente:* rota PUT com requireAdmin+zod, revisor APROVADO; *humano:* compara com a prancha logado | [x] | revisor APROVADO COM RESSALVAS (2026-10-31); verificado pelo humano no preview da Vercel em 2026-10-31 |
| M1-07 | Politicas aplicadas (check-in/out, cancelamento, minimo de noites) | M1-06 | — | *agente:* trigger no Postgres, rotas mapeiam HE001/HE002, **revisor APROVADO**; *humano:* smoke-test | [x] | revisor APROVADO COM RESSALVAS (2026-10-31); HE001 verificado na UI e no banco; HE002 (janela de cancelamento do hospede) coberto por revisor, teste humano pendente no /smoke-test do M4 |
| M1-08 | Remover arquivos do cliente anterior em public/ | M1-05 | — | *agente:* grep zero em public/; *humano:* icone neutro e quartos sinteticos com foto | [x] | 2026-10-31, verificado pelo humano no preview da Vercel |
| M1-10 | Decidir destino da feature Momentos/galeria (generica por tenant ou remover) | M1-08 | — | decisao registrada em CLAUDE.md > Decisoes | [h] | GATE humano; origem: descobertas do lote M0-08/09/10 |
| M1-09 | Fechamento do M1: revisor no diff completo, sessao-zero, handoff | M1-07!, M1-08 | — | APROVADO; criterio de saida registrado | [h] | agente 2026-10-31: branch `chore/m1-09-fechamento`, revisor APROVADO COM RESSALVAS (7 achados baixos); eval sessao-zero fora do escopo (M0-07); handoff `2026-11-01-m1-fechamento.md` |
| M1-11 | U+FFFD (caractere de substituicao) nas mensagens de WhatsApp de confirmacao e cancelamento; escopo: helper comum que monta os textos | M1-07 | — | mensagens sem U+FFFD no preview; causa raiz registrada | [h] | prioridade baixa; usar `investigar-bug`; agente 2026-10-31: branch `fix/m1-11-whatsapp-encoding`; causa [INFERIDO]: BookingCard montava a URL a mao (ver relato); mergeada pelo humano em 2026-11-01 (PR #1); falta preview real no WhatsApp |
| M1-12 | PWA: `public/sw.js` nao cachear `/admin` (hoje no SHELL e em `cache.put`), ignorar requisicoes fora de http/https (erro `chrome-extension` no console) e acrescentar meta `mobile-web-app-capable` ao lado de `apple-mobile-web-app-capable` | M1-08 | — | *agente:* sw.js sem `/admin` e sem esquemas nao-HTTP, revisor APROVADO; *humano:* logout nao mostra painel em cache; console limpo | [ ] | prioridade media; fazer antes do primeiro deploy publico (CLAUDE.md §8, divida do sw.js); descoberta na verificacao das fontes (2026-10-31) |

## M2 · Multi-tenant no dado
Criterio de saida: dois tenants de seed isolados; tenant-auditor sem critica/alta; teste cruzado falha em select/update/realtime/storage.

| ID | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|
| M2-01 | Plano do M2 + modelo de ameaca | M1-09 | D2 | plano aprovado | [ ] | pode comecar com M1 em [h] |
| M2-02 | Migracao tenants + tenant_id em tudo; admins (tenant_id,user_id,role) | M2-01! | D2 | humano aplicou; down testado | [ ] | humano aplica |
| M2-03 | current_tenant_id(), is_admin(tenant), policies reescritas | M2-02! | — | tenant-auditor sem critica | [ ] | |
| M2-04 | no_double_booking e is_range_available por (tenant_id, room_id) | M2-02! | — | teste cruzado de overbooking falha | [ ] | |
| M2-05 | Storage paths tenants/<id>/; realtime filtrado | M2-03 | — | auditor sem alta | [ ] | |
| M2-06 | Rotas: tenant explicito com service role; IDOR; 404/403 consistentes | M2-03 | — | revisor + auditor APROVADO | [ ] | |
| M2-07 | Seed com 2 tenants; teste cruzado em evals/tenant/ | M2-06 | — | 3 cenarios falham como esperado | [ ] | |
| M2-08 | Papeis por RLS; tela Equipe | M2-06 | — | prancha Painel-Config secao Equipe | [ ] | |
| M2-09 | Endurecer rotas de settings e cancel (regex do path, strip do zod, 404 generico, cancelled_by) | M2-06 | — | revisor sem ressalvas medias nessas rotas | [ ] | origem: ressalvas do revisor em M1-05/06/07 (2026-10-31). Inclui os 7 achados baixos do fechamento do M1 (M1-09; decisao do proprietario em 2026-11-01, sem M1-13): cancel_token fora do payload RSC e prop tipada em `/cancelar/[id]`; erro transitorio nao cacheado em `lib/site-settings.ts`; policy de select do bucket `site`; arquivo orfao ao remover logo/hero; HE001 so no INSERT; aviso da janela de cancelamento com `published=false`; fuso do servidor em `/api/bookings`. Detalhe: `docs/handoffs/2026-11-01-m1-fechamento.md` |

## M3 · Roteamento e tema por tenant
Criterio de saida: dois hosts locais servem dois tenants sem vazamento de cache; tema por tenant aplicado.

| ID | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|
| M3-01 | middleware resolve tenant por host; 404 para host desconhecido | M2-03! | D3 | 2 hosts locais funcionam | [ ] | |
| M3-02 | Cache por tenant (tags) e revalidacao | M3-01 | — | sem vazamento | [ ] | |
| M3-03 | Tema (cor, fonte) em site_settings -> CSS vars | M1-06 | — | tweak da prancha reproduzido | [ ] | pode adiantar: nao depende de M2 |
| M3-04 | Sitemap, robots, metadata por tenant | M3-02 | — | verificados nos 2 hosts | [ ] | |
| M3-05 | Dominio proprio | M3-01 | D3 | fluxo documentado | [ ] | |

## M4 · Reserva completa
Pranchas: Site-Busca, Site-Reserva, Site-MinhaReserva, Painel-Reservas, Painel-Calendario, Painel-Hoje. Criterio de saida: /smoke-test completo no dev; nenhum dado de hospede em log.

| ID | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|
| M4-01 | Notificacoes e-mail/WhatsApp; templates por tenant | M1-07 | D8 | enviados no dev para contato de teste | [ ] | |
| M4-02 | Site: busca com calendario, minimo de noites, total por estadia (Site-Busca) | M1-04 | — | reproduz prancha; precos do servidor | [ ] | pode adiantar: nao depende de M2 |
| M4-03 | Pagamento: sinal via gateway; webhook idempotente (Site-Reserva passo 3) | M4-02! | D4, D7 | pagamento de teste confirma reserva | [ ] | |
| M4-04 | Adicionais e reembolso parcial | M4-03 | — | calculo no servidor; smoke-test | [ ] | |
| M4-05 | Minha reserva: status, saldo, cancelar, mensagens (Site-MinhaReserva) | M4-01 | — | reproduz prancha | [ ] | |
| M4-06 | Painel Reservas: filtros, tabela, gaveta, acoes com guarda (Painel-Reservas) | M1-06 | — | reproduz prancha | [ ] | pode adiantar single-tenant; M2 ajusta escopo; substituir confirm/prompt nativos do cancelamento pelo fluxo da gaveta (prancha Painel-Reservas) |
| M4-07 | Painel Calendario: tape chart, bloqueios, tarifas (Painel-Calendario) | M4-06 | — | reproduz prancha; sem overbooking | [ ] | |
| M4-08 | Painel Hoje: KPIs, chegadas/saidas, aprovacoes, inbox (Painel-Hoje) | M4-06 | — | reproduz prancha | [ ] | |
| M4-09 | iCal export/import | M4-07 | — | feed valido | [ ] | |
| M4-10 | Testes: reavaliar D0 | M4-04 | D0 | decisao registrada | [ ] | |

## M5 · Onboarding e operacao do tenant
Criterio de saida: hotel novo criado pelo painel aparece no host dele em < 10 min sem SQL.

| ID | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|
| M5-01 | Fluxo "novo hotel" | M3-02! | — | e2e no dev | [ ] | |
| M5-02 | Convite de equipe; papeis | M2-08! | D8 | e2e no dev | [ ] | |
| M5-03 | Plano e faturamento (se SaaS) | M5-01 | D6 | conforme decisao | [ ] | |
| M5-04 | Ajuda contextual e primeiros passos | M5-01 | — | prancha Painel-Config secao Plano | [ ] | |

## M6 · Producao
Criterio de saida: deploy pelo humano via /deploy-checklist; /smoke-test contra prod; backup ativo; historico git limpo.

| ID | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|
| M6-01 | Projeto prod; variaveis so na Vercel; dominio | M4-08 | D5 | prod criado | [ ] | humano |
| M6-02 | /deploy-checklist e docs/runbook.md | — | — | command imprime os passos | [h] | pode adiantar a qualquer momento; agente 2026-10-31: branch `docs/m6-02-deploy-checklist` (command + runbook inicial); falta humano conferir o runbook |
| M6-03 | Observabilidade sem PII | M6-01 | — | CLAUDE.md §9 completo | [ ] | |
| M6-04 | Limpeza do historico git antes de repo publico | M0-14 | — | grep no historico zero | [ ] | humano executa; agente planeja |
| M6-05 | Migracoes no prod pelo humano; smoke-test contra prod | M6-02! | — | checklist assinado | [ ] | humano |
| M6-06 | Primeiro tenant real; go-live | M6-05! | — | reserva real processada | [ ] | |

---

## Registro de milestones concluidos

| Milestone | Data | Criterio de saida verificado por | Eval sessao-zero |
|---|---|---|---|
| — | — | — | — |

## Como iniciar a proxima sessao

Rode `/proxima`. Texto de referencia (`.claude/commands/proxima.md`):

```
Leia docs/milestones.md ("Estado atual", "Fila do humano", "Autorizacoes em pe" e as tabelas dos milestones ativos), depois docs/harness.md (Resumo em 12 linhas). Confira o modelo em uso e se ele e permitido para a classe da tarefa (harness, eixo 4).
Monte o LOTE da sessao: uma ou mais tarefas [ ] com dependencias duras (!) em [x], gate fechado, mesma branch, sem migracao entre elas. Se preferir uma ordem diferente da tabela, diga por que. Se a unica opcao for GATE ou tarefa do humano, liste o que precisa dele e pare.
Escreva o prompt do lote nos sete blocos (docs/produto-e-roadmap.md, secao 4), com Contexto obrigatorio apontando para as pranchas em docs/design/exports/ quando houver, e me mostre ANTES de executar. Apos minha confirmacao: execute, um commit por objetivo, revisor onde o protocolo exige, atualize milestones.md (status, fila do humano, estado atual) e entregue o relato.
```
