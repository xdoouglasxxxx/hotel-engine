# Hotel Engine — Milestones

Fonte da verdade do PROGRESSO. `docs/produto-e-roadmap.md` diz o que e por que; este arquivo diz onde estamos, o que o agente pode pegar agora e o que espera o humano.
Toda sessao do Claude Code comeca lendo "Estado atual" e "Fila do humano", e termina atualizando-os.

## Protocolo (versao 3, 2026-11-01: trabalho por entregas)

**Hierarquia:** Projeto > Milestone > **Entrega** > Tarefa. A branch e a unidade de desenvolvimento, o PR e a unidade de revisao e o handoff e a unidade de comunicacao; juntos representam a Entrega. As tabelas de tarefas abaixo continuam como checklist; as entregas ficam na secao "Entregas".

**Tamanho.** Uma entrega deve ser grande o bastante para representar progresso funcional significativo e pequena o bastante para ser revisada, testada e revertida com seguranca.

**Relacao.** Nao agrupar tarefas apenas para reduzir PRs. As tarefas de uma entrega precisam ter relacao funcional, tecnica ou de objetivo, o mesmo risco e o mesmo criterio de aceite. Migracao, upgrade de framework e hook/settings sao sempre entrega propria.

**Limites.** Ate 4 tarefas, cerca de 400 linhas de codigo alteradas (fora docs) e 3 dias de branch. Ao prever estourar qualquer um, dividir antes de comecar. Sinais para dividir: objetivos ou riscos diferentes; aceites em momentos diferentes; refatoracao misturada com feature; "aproveitar para" tocar algo adjacente. O agente lista os sinais (presentes ou ausentes) no plano da entrega. O agente nunca amplia uma entrega em andamento: descoberta vira linha nova na tabela do milestone, com nota "descoberta em <tarefa>".

**Commits.** Pequenos, com um objetivo cada, independentes da frequencia de entregas. Commit nao gera doc, milestone nem build.

**Fluxo da entrega:** planejar (tarefas cobertas, relacao entre elas, criterio de aceite unico, sinais de divisao, validacoes da matriz) -> implementar o conjunto -> validar -> documentar (handoff e `docs/milestones.md`, uma vez) -> proxima entrega. Push ao fechar a entrega, ou antes para preview se o humano pedir.

**Validacoes por tipo de mudanca.** O agente escolhe as aplicaveis no plano da entrega e as lista no handoff, com o resultado de cada uma:

| Tipo | Validacoes |
|---|---|
| Frontend/UI | typecheck, lint, build, responsividade (390 e 1440 px), `prefers-reduced-motion`; Playwright quando existir |
| API/rotas | zod, tratamento de erros, codigos HTTP, teste manual dos cenarios, `revisor` |
| Supabase | migracao com down, RLS/policies, queries, `types/database.ts`, `revisor` e `tenant-auditor` (a partir do M2), aplicacao pelo humano no dev |
| Hooks/settings | `test-hooks`, `revisor` |
| Docs | grep de termos proibidos, links |

O `revisor` e obrigatorio quando a entrega toca rota, SQL, RLS, service role, hook ou settings; nas demais, o agente decide e justifica no handoff. Entrega dessas classes sem veredito fica `[~]`, nunca `[x]`.

**Reversao.** Uma entrega e valida so se um unico `git revert` do merge commit desfaz tudo sem quebrar build nem banco; por isso migracao e seus consumidores sao entregas separadas. O handoff traz "Plano de rollback" e a tabela commit -> tarefa -> validacao. Branch viva recebe `git merge origin/develop` diariamente. Preview intermediario e permitido em UI.

**Rigido (inalterado, nao muda sem decisao registrada no CLAUDE.md):**
- GATE (coluna Gate com D-algo aberto) e tarefa marcada `humano` so o humano marca. O agente para, escreve o que precisa, e segue para outra entrega liberada em vez de esperar.
- Merge de PR, push em `develop`/`main`, migracao, deploy, dependencia nova e qualquer escrita em Supabase/Vercel sao do humano. O agente prepara ate o ponto imediatamente anterior. Push de branch de trabalho (`git push [-u] origin <branch>`) e `gh pr create` (base `develop`) sao do agente (M0-16).

**Ordem e paralelismo.** A ordem das linhas e preferencia. O agente pode pegar qualquer tarefa `[ ]` cujas dependencias DURAS (`!`) estejam `[x]` e cujo gate esteja fechado; dependencias sem `!` podem ser puladas com uma nota, e a escolha fora da ordem e justificada no plano. Trabalhar em milestones em paralelo e permitido com autorizacao em pe (secao "Autorizacoes em pe"). Tarefas humanas nao bloqueiam o agente: vao para a "Fila do humano".

**Status:** `[ ]` aberta · `[~]` em andamento ou aguardando revisor · `[h]` entregue pelo agente, aguardando verificacao do humano · `[x]` concluida e aceita · `[!]` bloqueada (motivo na Nota) · `[-]` descartada (motivo na Nota).

**Pronto quando** tem duas partes quando necessario: *agente:* (o que o agente verifica sozinho) e *humano:* (o que so o humano confirma). O agente marca `[h]` ao cumprir a parte dele; o humano marca `[x]`.

**Milestone concluido** = todas as linhas `[x]` ou `[-]`; criterio de saida verificado e registrado; `evals/sessao-zero` rodado se o harness mudou. Linhas `[h]` impedem o fechamento, mas nao impedem o milestone seguinte de comecar.

Legenda: **Dep** = IDs de que depende (`!` = dura) · **Gate** = decisao humana (secao Decisoes) · **Nota** = data, commit, bloqueio, motivo.

---

## Estado atual

| Campo | Valor |
|---|---|
| Ultima atualizacao | 2026-11-01 (agente: entrega D-1, reconciliacao do tracker com o objetivo final, em `docs/reconciliacao-2026-11-01`) |
| Fundacao | concluida pelo agente (harness, hooks, ambiente dev, fontes locais, push/PR); falta o lado humano de M0-07, M0-14 e o ruleset do M0-18 |
| Milestones ativos | M0 (fechando), M1 (aceito) e M4 (iniciado: M4-02 mergeado) |
| Branch de trabalho | `develop` (integracao; branches de trabalho saem dela) |
| Modelo em uso | Sonnet (padrao) / Fable |
| Entrega sugerida para o agente | E4-A ou E4-B (E4-A: M1-12, que e a parte aberta; E4-B: M4-06); E2-A (documento) pode ir a qualquer momento. E0-B1 e E0-B2 aguardam autorizacao de dependencias |
| Bloqueios | nenhum de agente. Ressalvas medias do revisor movidas para M2-09 |

## Fila do humano (o que so voce destrava)

| Prioridade | Item | Libera |
|---|---|---|
| 0 | Entrega E4-A: testar M4-02 em localhost/preview: escolher datas, conferir total e estados, clicar Reservar e ver o dialogo com as datas; comparar com a prancha Site-Busca (exportar o PNG para `docs/design/exports/03-e4-reserva/` se quiser) (passos em `docs/handoffs/2026-11-01-m4-02-busca.md`) | M4-02 |
| 1 | Testar M1-11 no preview: reserva sintetica de nome `José & Ana #2`; aprovar, cancelar com motivo `100%` e rejeitar; conferir o texto no WhatsApp (passos em `docs/handoffs/2026-11-01-m1-11-whatsapp.md`) | M1-11 |
| 2 | Autorizar a E0-B1 (Next 15, React 19, eslint-config-next) e registrar em "Autorizacoes em pe"; zod 4 (E0-B2) so depois, com autorizacao propria | E0-B1 (M0-11), E0-B2 (M0-12) |
| 3 | Criar o projeto novo `hotel-engine` na Vercel so com Preview (sem Production) e renomear repo e projeto prod (M0-14) | M0-14, M6-04 |
| 4 | Reexportar as pranchas PNG do canvas para `docs/design/exports/` (criterio visual de pronto do `revisor`) | E4-A, E4-B |
| 5 | Rodar `evals/sessao-zero.md` em sessao nova com Sonnet (veredito) e registrar | M0-07 |
| 6 | Preencher `docs/runbook.md` §1 e §4 a §6 (prod, rollback, incidente, observabilidade) | M6-02 |
| 7 | Depois de o PR da D-1 rodar o job `ci`: exigir o status check `ci` no ruleset de `develop`; ligar secret scanning, push protection e alertas do Dependabot | M0-18 |
| 8 | Conferir o `.hermes.md` ajustado (linha 11: push de branch de trabalho e PR permitidos ao delegar ao Claude Code) | higiene |

## Entregas

Cada entrega e uma branch + um PR + um handoff (Protocolo v3). As tarefas seguem na tabela do milestone; aqui fica o agrupamento. Entrega so e criada com tarefas relacionadas, mesmo risco e mesmo criterio de aceite, dentro dos limites do protocolo.

| ID | Entrega | Tarefas | Tipo de mudanca (matriz) | Estado | Nota |
|---|---|---|---|---|---|
| E4-A | Busca de disponibilidade | M4-02 (PR #9), M1-12 | UI + API/rotas; `revisor` obrigatorio (rota e `public/sw.js`) | em andamento: M4-02 mergeado na `develop` (falta a verificacao do humano, fila 0); M1-12 aberta | confirmado pelo proprietario (2026-11-01). Se o plano apontar risco distinto para M1-12 (service worker), ela vira a entrega propria E1-X |
| E4-B | Painel Reservas | M4-06 | UI + API/rotas; `revisor` obrigatorio | aberta | entrega propria; nao juntar com M4-08 (limites h/i) |
| E4-C | Painel Hoje | M4-08 | UI (+ rotas, se houver); `revisor` se tocar rota | aberta | entrega propria; nao juntar com M4-06 (limites h/i); dep. M4-06 so de ordem |
| E0-B1 | Upgrade Next 15 | M0-11 (Next 15, React 19, eslint-config-next) | dependencias; entrega propria | `[ ]`: aguarda autorizacao de dependencias (fila, item 2) | a autorizacao entra em "Autorizacoes em pe" quando o proprietario liberar; ate la a entrega nao comeca |
| E0-B2 | Upgrade zod 4 | M0-12 | dependencias; entrega propria | `[ ]`: depende da E0-B1 (`!`) e de autorizacao propria | PR separado do Next (CLAUDE.md: upgrades grandes ficam separados de mudanca funcional) |
| D-1 | Reconciliacao do tracker com o objetivo final | M0-18 (CI), linhas M4-06 (nota), M6-07, M6-08; `docs/producao-checklist.md`; CLAUDE.md | Docs + `.github/` (workflow e dependabot) | `[h]`: PR da branch `docs/reconciliacao-2026-11-01` | sem codigo de aplicacao; o ruleset (status check `ci`) e do humano |
| E2-A | Plano multi-tenant | M2-01 | Docs (documento) | aberta | pode comecar com M1 em `[h]`; gate D2 ja fechado |
| E4-A ... E6-C | Sequencia completa ate producao | [PREENCHER: texto da sequencia, com tarefas, criterio de aceite unico e dependencia dura por entrega] | | aguarda o proprietario | o texto da sequencia nao veio junto do pedido da entrega D-1; as linhas acima (E4-A a E4-C, E0-B1/B2, E2-A) sao as que ja existiam e nao foram alteradas |

## Autorizacoes em pe

| Data | Autorizacao | Limites |
|---|---|---|
| 2026-10-30 | Executar M1 com M0 aberto | parar na migracao para o humano aplicar; verificacao visual e upload ficam para o humano |
| 2026-10-30 | `npm install` do ESLint (M0-08) | so eslint e eslint-config-next; nenhuma outra dependencia |
| 2026-10-31 | Commit local sem confirmacao (allowlist, M0-10) | push, deploy, migracao, dependencias seguem humanos; commit traz veredito do revisor quando a tarefa exigir |
| 2026-10-31 | Protocolo v2: ordem flexivel, lotes, paralelismo entre milestones | respeitar deps duras (`!`), gates, revisor obrigatorio |
| 2026-11-01 | Push de branch de trabalho e `gh pr create` pelo agente (M0-16) | so `git push [-u] origin <branch-de-trabalho>` e `gh pr create --base develop --body-file`; nunca main/develop, force, `gh pr merge`/`gh api`; merge e do humano; rulesets remotos ativos (GH013 testado) |

---

## Decisoes (portoes)

| ID | Decisao | Status | Opcao | Bloqueia |
|---|---|---|---|---|
| D0 | Testes automatizados | fechada 2026-10-29 | sem por ora; reavaliar antes da 1a reserva real ou do M2 | — |
| D1 | Moeda | fechada 2026-10-30 (registrada em CLAUDE.md, M0-15) | so BRL ate M2 | — |
| D2 | Modelo de tenant | fechada 2026-10-30 (registrada em CLAUDE.md, M0-15) | `tenants` + `tenant_id` + RLS | M2-02 |
| D3 | Roteamento | fechada 2026-11-01 (CLAUDE.md) | subdominio primeiro; dominio proprio em M3-05 | — |
| D4 | Pagamento | fechada 2026-11-01 (CLAUDE.md) | reserva sob aprovacao ate M4-03; depois sinal via Pix; cartao depois | — |
| D5 | Prod Free vs Pro | fechada 2026-11-01 (CLAUDE.md) | Free com mitigacoes: keep-alive (M6-01a) e dump semanal + teste de restauracao (M6-01b) | — |
| D6 | SaaS ou instancia por cliente | fechada 2026-11-01 (CLAUDE.md) | SaaS multi-tenant em um deploy | — |
| D7 | Gateway de pagamento (qual) | fechada 2026-11-01 (CLAUDE.md) | decidido em M4-03; padrao Mercado Pago, alternativa Asaas | — |
| D8 | Provedor de e-mail/WhatsApp | fechada 2026-11-01 (CLAUDE.md) | e-mail Resend em M4-01; WhatsApp manual via wa.me ate o M5 | — |
| D9 | Politica de modelo: classes de tarefa x modelo minimo | revogada 2026-11-01 (CLAUDE.md > Decisoes) | Claude Code somente em Sonnet (padrao) ou Fable; sem classes de tarefa x modelo | — |

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
| M0-07 | Eval sessao-zero manual | M0-05! | — | *humano:* roda em sessao nova com o modelo padrao; *agente:* registra. 11/11 fecha | [h] | humano roda; triagem 2026-10-30 (subagente 8-10/11) |
| M0-08 | ESLint configurado; /verificar roda lint sem prompt | M0-05! | — | `npm run lint` nao interativo, 0 erros | [x] | 2026-10-31; `eslint .` + `eslint.config.mjs` (FlatCompat), nada instalado; 1 warning em postcss.config.mjs |
| M0-09 | Hook de Stop com typecheck + 4 casos no test-hooks | M0-08 | — | FALHAS: 0 (41 casos) | [x] | 2026-10-31; `.claude/hooks/stop-verify.js`; ressalvas do revisor (working tree, timeout) tratadas no commit extra; resta so repo de 1 commit (baixa) |
| M0-10 | Allowlist de permissoes (leitura, verificacao, edicao e git local) | M0-05! | — | test-hooks verde; sem push/reset/rebase/filter-repo na allow; commit permitido | [x] | 2026-10-31; 4 rodadas do revisor, ultima APROVADO COM RESSALVAS (medias/baixas). Pendentes: `$(`/crase bloqueia commit com heredoc (usar `git commit -F`); glob com `./app/*` e falso positivo. Resolvida: deny de `.env` por lista explicita, `.env.example` legivel. Hook e heuristico (harness, Riscos aceitos) |
| M0-11 | Upgrade Next 14.2 -> 15.x (React 19), branch propria | M0-08! | — | build, /verificar, /smoke-test no dev, revisor APROVADO | [ ] | sem --force; modelo Sonnet/Fable; ao subir o Next, declarar/remover @eslint/eslintrc e revalidar eslint.config.mjs (flat config nativo do next lint 15+) |
| M0-12 | Upgrade zod 3 -> 4, PR separado | M0-11! | — | rotas com validacao passando; revisor APROVADO | [ ] | |
| M0-13 | Varredura final de acoplamento (marca, geo, imagens, dominio, package name) | M0-04 | — | inventario 03 zerado ou movido para M1 | [~] | boa parte ja coberta por M1-04/M1-08; restam package name (M0-14) e icones |
| M0-14 | Renomear repo, package, Vercel e prod para hotel-engine; .gitattributes | M0-13 | — | *agente:* package.json, .gitattributes, referencias em .claude/ docs/ scripts/; *humano:* repo, Vercel, prod | [ ] | *agente feito 2026-10-31* (package.json/lock, .gitattributes, PDF renomeado); falta *humano* (fila 3); producao v1.0 da Vercel protegida em 2026-10-31 (All Deployments); ao renomear, conferir variaveis de producao (so nomes) e decidir se os deploys antigos de producao sao apagados |
| M0-15 | GATE: registrar D1 e D2 em CLAUDE.md | — | D1, D2 | linhas presentes | [x] | humano na fila (2) |
| M0-16 | Push para branches de trabalho e PR pelo agente; hook permite so `git push origin <branch nao protegida>`; `gh pr create` liberado, `gh pr merge` bloqueado | M0-10! | — | test-hooks verde com os casos de push; revisor APROVADO | [x] | aceita pelo humano em 2026-11-01 (PR #2 mergeado; rulesets ativos em develop e main, push direto recusado com GH013, testado); *agente 2026-10-31:* hook, settings, test-hooks 169 casos FALHAS: 0, docs; revisor 2a rodada APROVADO COM RESSALVAS (achado medio de alias via `git -c` corrigido depois; restam falsos positivos de leitura e `git send-pack`, baixos); `.hermes.md` linha 11 ajustada em `chore/pos-noite-ajustes` |
| M0-17 | Fontes locais: trocar `next/font/google` por `next/font/local` (build sem rede externa) | — | — | build local passa; typecheck ok; layout sem import de `next/font/google` | [x] | 2026-10-31, branch `fix/fontes-locais`; origem: falha intermitente do build na Vercel; harness eixo 3 |
| M0-18 | CI no GitHub Actions (typecheck, lint, test-hooks) como status check obrigatorio em `develop`; Dependabot; secret scanning | M0-08! | — | *agente:* `.github/workflows/ci.yml` (on pull_request para develop e main; Node 22; sem secrets) e `.github/dependabot.yml` (npm, semanal, agrupado); *humano:* ruleset de `develop` exige o status check `ci`; secret scanning e push protection ligados; PRs do Dependabot so com aprovacao (CLAUDE.md §4) | [h] | 2026-11-01, entrega D-1 (branch `docs/reconciliacao-2026-11-01`); agente nao ativa nada no ruleset; o job `ci` so aparece como check selecionavel depois de rodar uma vez num PR |

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
| M1-10 | Decidir destino da feature Momentos/galeria (generica por tenant ou remover) | M1-08 | — | decisao registrada em CLAUDE.md > Decisoes | [x] | 2026-11-01: Momentos vira "Galeria do hotel", generica por tenant (CLAUDE.md); a implementacao da galeria generica ainda nao tem tarefa propria; origem: descobertas do lote M0-08/09/10 |
| M1-09 | Fechamento do M1: revisor no diff completo, sessao-zero, handoff | M1-07!, M1-08 | — | APROVADO; criterio de saida registrado | [x] | aceito pelo proprietario em 2026-11-01 (M1 aceito); agente 2026-10-31: branch `chore/m1-09-fechamento`, revisor APROVADO COM RESSALVAS (7 achados baixos); eval sessao-zero fora do escopo (M0-07); handoff `2026-11-01-m1-fechamento.md` |
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
| M3-01 | middleware resolve tenant por host; 404 para host desconhecido | M2-03! | — | 2 hosts locais funcionam | [ ] | |
| M3-02 | Cache por tenant (tags) e revalidacao | M3-01 | — | sem vazamento | [ ] | |
| M3-03 | Tema (cor, fonte) em site_settings -> CSS vars | M1-06 | — | tweak da prancha reproduzido | [ ] | pode adiantar: nao depende de M2 |
| M3-04 | Sitemap, robots, metadata por tenant | M3-02 | — | verificados nos 2 hosts | [ ] | |
| M3-05 | Dominio proprio | M3-01 | — | fluxo documentado | [ ] | |

## M4 · Reserva completa
Pranchas: Site-Busca, Site-Reserva, Site-MinhaReserva, Painel-Reservas, Painel-Calendario, Painel-Hoje. Criterio de saida: /smoke-test completo no dev; nenhum dado de hospede em log.

| ID | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|
| M4-01 | Notificacoes e-mail (Resend)/WhatsApp manual; templates por tenant | M1-07 | — | enviados no dev para contato de teste | [ ] | |
| M4-02 | Site: busca com calendario, minimo de noites, total por estadia (Site-Busca) | M1-04 | — | *agente:* rota `/api/availability` (anon, sem service role), componente de busca, total do servidor, revisor APROVADO; *humano:* compara com a prancha em localhost e roda o smoke da busca | [h] | 2026-11-01, mergeado na `develop` (PR #9), falta a verificacao do humano; branch `feat/m4-02-busca-disponibilidade`; revisor APROVADO na 2a rodada (1a: com ressalvas, corrigidas); lacunas da prancha sem suporte no banco (minimo por quarto/periodo, "ultima unidade", cafe incluso, filtros) ficam para tarifacao; handoff `2026-11-01-m4-02-busca.md` |
| M4-03 | Pagamento: sinal via Pix pelo gateway; webhook idempotente (Site-Reserva passo 3) | M4-02! | — | pagamento de teste confirma reserva | [ ] | D4/D7: escolher o gateway aqui (padrao Mercado Pago, alternativa Asaas) e registrar em CLAUDE.md |
| M4-04 | Adicionais e reembolso parcial | M4-03 | — | calculo no servidor; smoke-test | [ ] | |
| M4-05 | Minha reserva: status, saldo, cancelar, mensagens (Site-MinhaReserva) | M4-01 | — | reproduz prancha | [ ] | |
| M4-06 | Painel Reservas: filtros, tabela, gaveta, acoes com guarda (Painel-Reservas) | M1-06 | — | reproduz prancha | [ ] | pode adiantar single-tenant; M2 ajusta escopo; substituir confirm/prompt nativos do cancelamento pelo fluxo da gaveta (prancha Painel-Reservas); incluir `booking_events` (historico de eventos da reserva: criada, aprovada, rejeitada, cancelada, com autor e data) para alimentar a gaveta; a tabela exige migracao, que e entrega propria e vem antes do consumo na UI (Protocolo v3); sem dado de hospede no payload do evento alem do id da reserva |
| M4-07 | Painel Calendario: tape chart, bloqueios, tarifas (Painel-Calendario) | M4-06 | — | reproduz prancha; sem overbooking | [ ] | |
| M4-08 | Painel Hoje: KPIs, chegadas/saidas, aprovacoes, inbox (Painel-Hoje) | M4-06 | — | reproduz prancha | [ ] | |
| M4-09 | iCal export/import | M4-07 | — | feed valido | [ ] | |
| M4-10 | Testes: reavaliar D0 | M4-04 | D0 | decisao registrada | [ ] | |

## M5 · Onboarding e operacao do tenant
Criterio de saida: hotel novo criado pelo painel aparece no host dele em < 10 min sem SQL.

| ID | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|
| M5-01 | Fluxo "novo hotel" | M3-02! | — | e2e no dev | [ ] | |
| M5-02 | Convite de equipe; papeis | M2-08! | — | e2e no dev | [ ] | |
| M5-03 | Plano e faturamento (SaaS, D6) | M5-01 | — | conforme decisao | [ ] | |
| M5-04 | Ajuda contextual e primeiros passos | M5-01 | — | prancha Painel-Config secao Plano | [ ] | |

## M6 · Producao
Criterio de saida: deploy pelo humano via /deploy-checklist; /smoke-test contra prod; backup ativo (M6-01b) e keep-alive ativo (M6-01a); historico git limpo.

| ID | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|
| M6-01 | Projeto prod; variaveis so na Vercel; dominio | M4-08 | — | prod criado | [ ] | humano; plano Free (D5) |
| M6-01a | Keep-alive do projeto prod (evita pausa do Free por inatividade) | M6-01 | — | rotina ativa e verificada; falha visivel | [ ] | mitigacao da D5 |
| M6-01b | Dump semanal do banco prod + teste de restauracao | M6-01 | — | dump semanal agendado; restauracao testada num projeto descartavel e registrada | [ ] | mitigacao da D5; sem dados reais fora do ambiente aprovado |
| M6-02 | /deploy-checklist e docs/runbook.md | — | — | command imprime os passos | [h] | pode adiantar a qualquer momento; agente 2026-10-31: branch `docs/m6-02-deploy-checklist` (command + runbook inicial); falta humano conferir o runbook |
| M6-03 | Observabilidade sem PII | M6-01 | — | CLAUDE.md §9 completo | [ ] | |
| M6-04 | Limpeza do historico git antes de repo publico | M0-14 | — | grep no historico zero | [ ] | humano executa; agente planeja |
| M6-05 | Migracoes no prod pelo humano; smoke-test contra prod | M6-02! | — | checklist assinado | [ ] | humano |
| M6-06 | Primeiro tenant real; go-live | M6-05! | — | reserva real processada | [ ] | |
| M6-07 | Rate limit e anti-bot nas rotas publicas (`/api/bookings`, `/api/availability`, `/api/calendar`, `/api/cancel`, login) | M6-01 | — | limite por IP/rota ativo e testado no preview (excesso devolve 429); CAPTCHA no login e na pre-reserva conforme checklist do Supabase (Auth) e ASVS V2.2.1/V11.1.4; revisor APROVADO | [ ] | origem: `docs/producao-checklist.md`; hoje nao ha limite algum nas rotas publicas; mecanismo ainda a decidir (middleware, servico externo ou Supabase), registrar em CLAUDE.md > Decisoes |
| M6-08 | Cabecalhos de seguranca (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options/frame-ancestors) e anti-cache em rotas autenticadas | M0-11 | — | `next.config` com `headers()` aplicando os cabecalhos; verificado com curl -I no preview; CSP compativel com Google Maps iframe, Supabase Storage e JSON-LD; `/admin` e `/api/admin/*` sem cache; revisor APROVADO | [ ] | origem: `docs/producao-checklist.md` (Next.js CSP, ASVS V14.4.x e V8.2.1); hoje `next.config.mjs` so define cabecalhos de `/sw.js`; M1-12 trata o cache do service worker |

---

## Registro de milestones concluidos

| Milestone | Data | Criterio de saida verificado por | Eval sessao-zero |
|---|---|---|---|
| — | — | — | — |

## Como iniciar a proxima sessao

Rode `/proxima`. O comando (`.claude/commands/proxima.md`) le este arquivo e o harness e propoe a proxima ENTREGA: tarefas cobertas e relacao entre elas, criterio de aceite unico, sinais de divisao e limites, validacoes da matriz, pontos de parada e o prompt nos sete blocos. Nada e executado antes da confirmacao do humano. Ao final da entrega: validacoes, push, PR, um handoff e este arquivo atualizado uma vez.
