# Hotel Engine — Milestones

Fonte da verdade do PROGRESSO. `docs/produto-e-roadmap.md` diz o que e por que; este arquivo diz onde estamos, o que o agente pode pegar agora e o que espera o humano.
Desde 2026-11-01 (entrega A-0) o roadmap segue as fases **T0-T3** de `docs/strategy/product-strategy-v1.md`; o desenho tecnico esta em `docs/architecture-v2.md`. As tabelas M0-M6 abaixo foram **preservadas** como legado (nenhuma tarefa foi apagada); a secao "Mapa M -> T" diz o destino de cada uma.
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
| Webhooks e jobs (A-0) | como "API/rotas" mais: teste de **assinatura invalida recusada** e de **idempotencia** (mesmo evento duas vezes aplica uma), rota de job exige `CRON_SECRET`, `revisor` obrigatorio |
| Agente em runtime (A-0) | como "API/rotas" mais: prompt-contrato versionado, lint de saida verificado por script, nenhum texto de hospede persistido na T1, `revisor` obrigatorio em qualquer mudanca de prompt-contrato ou de poder |
| Docs | grep de termos proibidos, links |

O `revisor` e obrigatorio quando a entrega toca rota, SQL, RLS, service role, hook ou settings; nas demais, o agente decide e justifica no handoff. Entrega dessas classes sem veredito fica `[~]`, nunca `[x]`.

**Reversao.** Uma entrega e valida so se um unico `git revert` do merge commit desfaz tudo sem quebrar build nem banco; por isso migracao e seus consumidores sao entregas separadas. O handoff traz "Plano de rollback" e a tabela commit -> tarefa -> validacao. Branch viva recebe `git merge origin/develop` diariamente. Preview intermediario e permitido em UI.

**Rigido (inalterado, nao muda sem decisao registrada no CLAUDE.md):**
- GATE (coluna Gate com D-algo aberto) e tarefa marcada `humano` so o humano marca. O agente para, escreve o que precisa, e segue para outra entrega liberada em vez de esperar.
- Merge de PR, push em `develop`/`main`, migracao, deploy, dependencia nova e qualquer escrita em Supabase/Vercel sao do humano. O agente prepara ate o ponto imediatamente anterior. Push de branch de trabalho (`git push [-u] origin <branch>`) e `gh pr create` (base `develop`) sao do agente (M0-16).

**Ordem e paralelismo.** A ordem das linhas e preferencia. O agente pode pegar qualquer tarefa `[ ]` cujas dependencias DURAS (`!`) estejam `[x]` e cujo gate esteja fechado; dependencias sem `!` podem ser puladas com uma nota, e a escolha fora da ordem e justificada no plano. Trabalhar em milestones em paralelo e permitido com autorizacao em pe (secao "Autorizacoes em pe"). Tarefas humanas nao bloqueiam o agente: vao para a "Fila do humano".

**Status:** `[ ]` aberta · `[~]` em andamento ou aguardando revisor · `[h]` entregue pelo agente, aguardando verificacao do humano · `[x]` concluida e aceita · `[!]` bloqueada (motivo na Nota) · `[-]` descartada (motivo na Nota) · `[a]` adiada por decisao de estrategia (A-0, 2026-11-01): fica na secao "Adiado" com a origem; volta ao backlog so por decisao do proprietario.

**Pronto quando** tem duas partes quando necessario: *agente:* (o que o agente verifica sozinho) e *humano:* (o que so o humano confirma). O agente marca `[h]` ao cumprir a parte dele; o humano marca `[x]`.

**Milestone concluido** = todas as linhas `[x]` ou `[-]`; criterio de saida verificado e registrado; `evals/sessao-zero` rodado se o harness mudou. Linhas `[h]` impedem o fechamento, mas nao impedem o milestone seguinte de comecar.

Legenda: **Dep** = IDs de que depende (`!` = dura) · **Gate** = decisao humana (secao Decisoes) · **Nota** = data, commit, bloqueio, motivo.

---

## Estado atual

| Campo | Valor |
|---|---|
| Ultima atualizacao | 2026-11-01 (agente: entrega A-0, arquitetura v2 e roadmap T0-T3, em `docs/arquitetura-v2`, empilhada sobre a D-1 ate o merge dela) |
| Fundacao | concluida pelo agente (harness, hooks, ambiente dev, fontes locais, push/PR); falta o lado humano de M0-07, M0-14 e o ruleset do M0-18 |
| Milestones ativos | Roadmap de resultado T0-T3 (A-0 aguarda aceite do proprietario); legado: M0 (fechando), M1 (aceito), M4-02 mergeado |
| Branch de trabalho | `develop` (integracao; branches de trabalho saem dela) |
| Modelo em uso | Sonnet (padrao) / Fable |
| Entrega sugerida para o agente | depois do aceite da A-0: **T0-B** (harness: agentes em runtime, segredos por instancia; precede T1-A e T1-B) e **T0-A1** (migracao de medicao: so escreve o arquivo, o humano aplica). Em paralelo e sem dependencia: **M1-12** (`sw.js`, antes do 1o deploy publico). E0-B1 e E0-B2 seguem aguardando autorizacao de dependencias. E2-A, E4-B e E4-C foram absorvidas ou adiadas (ver "Entregas legadas") |
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
| 9 | **A-0:** ler `docs/architecture-v2.md`, aceitar ou corrigir; mergear o PR da D-1 (reconciliacao) antes ou junto com o da A-0 | A-0; T0-B; T0-A |
| 10 | Desenhar no canvas as pranchas novas **Painel-Resultado** (entrada do `/admin`) e **Painel-Concierge** (console do operador e secoes Concierge/Pagamentos em Configuracoes) e exportar para `docs/design/exports/` | T1-B3, T1-C2 |
| 11 | Escolher os **3 pilotos** (com trafego proprio) e os termos (base por unidade, 5% sobre diretas confirmadas, garantia de 60 dias); decidir o fato gerador do variavel (`architecture-v2` G.1 item 1) | T0-A (aceite), 1o fechamento |
| 12 | Criar a conta do gateway Pix (Mercado Pago) em **sandbox** para o dev e registrar so os **nomes** das variaveis; decidir `deposit_percent` e retencao do sinal (G.1 item 3) | T1-A |
| 13 | Decidir o minimo de rate limit/anti-abuso antes de ligar `auto_hold` num piloto (G.1 item 4; mecanismo do M6-07) | E6-A, T1-A (piloto) |
| 14 | Levar as pendencias do juridico (`architecture-v2` G.3) ao responsavel e decidir o conflito telefone x follow-up em T2 (G.2 item 1) | antes do 1o piloto com texto de hospede; T2-B |
| 15 | Aprovar o texto de harness proposto (`architecture-v2` secao H) e rodar `evals/sessao-zero` depois de aplicado | T0-B |

## Roadmap de resultado (T0-T3), desde 2026-11-01

Fonte: `docs/strategy/product-strategy-v1.md` (secao 5) e `docs/architecture-v2.md` (desenho, decisoes e riscos). Ordem de fases, com a duracao estimada da strategy:

| Fase | Duracao (strategy) | Frentes | Resultado esperado |
|---|---|---|---|
| T0 Medicao | ~2 semanas | T0-A medicao, T0-B harness | sabemos medir; 3 pilotos escolhidos |
| T1 Concierge MVP | 4-6 semanas | T1-A pagamento e confirmacao, T1-B concierge semi-automatico, T1-C relatorio e painel de resultado | 3 pilotos com reservas diretas confirmadas e pagas |
| T2 Prova e preco | ~4 semanas | T2-A iCal, T2-B WhatsApp API, T2-C precificacao e go/no-go | 2 de 3 pilotos pagando o variavel |
| T3 Produtizar | 8+ semanas | T3-A multi-tenant, T3-B onboarding por agente, T3-C tarifacao por periodo | operacao por cliente cai; margem sobe |

Mantidos fora das fases, com as mesmas regras de antes: **E0-B1** (upgrade Next 15), **E0-B2** (zod 4), **M1-12** (`sw.js`) e **E6-A/E6-B** (producao segura). Premissas da fase de pilotos: 1 projeto Supabase + 1 projeto Vercel por pousada; `hotel-engine-dev` e a "pousada zero"; migracoes aplicadas pelo humano na ordem dev -> piloto 1 -> 2 -> 3 (runbook; `schema_version`).

**Como ler:** cada **frente** abaixo (T0-A, T1-A...) tem o criterio de aceite da frente e e executada em **entregas** (branch + PR + handoff). Migracao e seus consumidores sao entregas separadas (Protocolo v3), por isso as frentes com banco se dividem em `-1` (migracao), `-2` (rotas) e seguintes. As tarefas usam o formato das tabelas M0-M6: `Dep` (`!` = dura), `Gate` e `Status`.

### T0-A · Medicao

Aceite da frente: no dev, toda transicao de `bookings` grava evento com ator e origem; reserva criada pelo site guarda `source`, `channel` e `guests`; o funil registra buscas; o relatorio v0 calculado a partir dos eventos bate com a contagem manual das reservas sinteticas; os 3 pilotos e a linha de base estao definidos. Desenho: `architecture-v2` A.1, A.2, A.3, A.9, A.11, E.

| ID | Entrega | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|---|
| T0-A01 | T0-A1 (migracao) | Migracao de medicao: `booking_events` (append-only, payload com allowlist), `transition_booking` com a matriz atual (pending, approved, rejected, cancelled) e trigger de seguranca, `funnel_events`, `bookings.source`/`channel`/`guests`, `baselines`, `commercial_terms`, `schema_version`; RLS e `-- down:` | A-0! | — | *agente:* arquivo em `supabase/migrations/`, `revisor` APROVADO; *humano:* aplicou no dev, conferiu RLS e o `down` | [ ] | entrega propria; so escreve o arquivo |
| T0-A02 | T0-A1 | `types/database.ts` + secao de `docs/runbook.md` com o runbook de migracoes em N instancias (ordem, checklist, `schema_version`) | T0-A01! | — | typecheck verde; runbook revisado | [ ] | |
| T0-A03 | T0-A2 (rotas) | `/api/bookings`, `approve`, `reject`, `cancel`, `/api/cancel` passam por `transition_booking`; gravam `source`, `channel`, `guests`; `reject` ganha guarda `pending`; "estado ja mudou" em `approve` vira 409; `/api/bookings` usa o fuso do hotel | T0-A01! | humano aplicou T0-A01 | `revisor` APROVADO; teste manual dos cenarios (aprovar, recusar, cancelar, conflito 23P01, repeticao) e `/smoke-test` | [ ] | fecha duas dividas de CLAUDE.md §8 (reject sem guarda, approve 500) |
| T0-A04 | T0-A2 | `POST /api/events` (zod, enum fechado) e captura de `channel` no site (busca e formulario) | T0-A01! | rate limit minimo definido (`architecture-v2` G.1 item 4) | `revisor` APROVADO; eventos aparecem no dev; sem IP nem user agent gravados | [ ] | rota publica nova: ponto sensivel |
| T0-A05 | T0-A3 | Relatorio v0: calcula as metricas de `architecture-v2` E.2 a partir dos eventos (rota admin ou script, sem painel) | T0-A03!, T0-A04! | — | resultado do dev confere com contagem manual das reservas sinteticas | [ ] | |
| T0-A06 | T0-A3 | Kit do piloto em `docs/`: modelo da linha de base (E.3), checklist de implantacao (strategy 5b), modelo de termos | A-0! | — | docs revisados; sem dado real | [ ] | |
| T0-A07 | — | **Humano:** escolher os 3 pilotos com trafego proprio, fechar os termos e o fato gerador do variavel (G.1 item 1) | — | negocio | termos por escrito; decisao registrada em CLAUDE.md > Decisoes | [ ] | fila do humano 11 |
| T0-A08 | — | **Humano (com o operador):** coletar a linha de base dos 30 dias de cada piloto | T0-A07!, T0-A06 | — | `baselines` preenchida com `source` explicito | [ ] | sem baseline nao ha outcome |

### T0-B · Harness para agentes em runtime

Aceite da frente: `docs/harness.md` contem a secao "Agentes em runtime", os segredos por instancia, a excecao para modelo ler texto de hospede, o runbook de migracoes em N instancias e a matriz de validacao com webhooks e crons; `evals/sessao-zero` roda sem regressao. Texto proposto: `architecture-v2` secao H.

| ID | Entrega | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|---|
| T0-B01 | T0-B | Aplicar em `docs/harness.md` o texto da secao H (os 5 itens) e atualizar o resumo em 12 linhas | A-0! | humano aprova o texto (fila 15) | diff revisado; links ok | [ ] | entrega de docs; harness mudou: exige sessao-zero |
| T0-B02 | T0-B | Nomes das novas variaveis em `.env.example` (so nomes, sem valores) e secao de segredos por instancia em `docs/runbook.md` | T0-B01 | — | grep: nenhum valor real | [ ] | variaveis: `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `CONCIERGE_LLM_API_KEY`, `CRON_SECRET`, `PHONE_HASH_PEPPER`; as do provedor de WhatsApp entram em T2-B |
| T0-B03 | — | **Humano:** rodar `evals/sessao-zero` e aceitar | T0-B01! | — | resultado registrado | [ ] | regra nova (`.claude/rules/`) so com confirmacao do humano (matriz de aprovacao) |

Dependencia dura: T1-A e T1-B nao comecam antes de T0-B01.

### T1-A · Pagamento e confirmacao automatica

Aceite da frente: no dev, com credenciais **sandbox**, um sinal Pix de teste confirma a reserva; o mesmo webhook entregue duas vezes aplica uma; assinatura invalida e recusada; hold expirado libera a data e gera `hold_expired`; pagamento depois da expiracao escala ao dono; `/smoke-test` cobre o fluxo com sinal; `no_double_booking` cobre `awaiting_deposit` e `confirmed`. Desenho: `architecture-v2` A.4, A.5, A.12, B, C.1, C.2.

| ID | Entrega | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|---|
| T1-A01 | T1-A1 (migracao) | Migracao expandir: status `awaiting_deposit`/`confirmed`/`expired` convivendo com `approved`; `no_double_booking` e funcoes de disponibilidade no conjunto bloqueante; `transition_booking` v1 (matriz de B.2) e trigger; `payments`; `webhook_receipts`; `job_runs`; `expire_holds` (SQL); `apply_payment_event`; colunas publicas de politica (`confirmation_mode`, `deposit_required`, `deposit_percent`, `deposit_ttl_hours`) | T0-A01! | gate G.1 item 3 (deposito e retencao) | *agente:* arquivo, `down`, `revisor` APROVADO; *humano:* aplicou no dev | [ ] | entrega propria |
| T1-A02 | T1-A1 | `types/database.ts` e `BOOKING_POLICY_ERROR` com os novos codigos | T1-A01! | — | typecheck verde | [ ] | |
| T1-A03 | T1-A2 (rotas) | Rota que cria o link Pix (idempotente), `auto_hold`, `approve` -> `awaiting_deposit`, *lazy sweep* antes do hold, `cancel`/`reject` na matriz v1 | T1-A01! | T0-B01 (secao de segredos) | `revisor` APROVADO; teste manual (hold, conflito 409, cancelar, expirar) | [ ] | service role: ponto sensivel |
| T1-A04 | T1-A2 | Webhook `POST /api/webhooks/mercadopago` (assinatura, consulta ao gateway, idempotencia), reconciliacao e rotas de job (`expire`, `notify`, `reconcile`) protegidas por `CRON_SECRET` | T1-A01!, T0-B01! | conta sandbox (fila 12) | **teste de assinatura invalida e de idempotencia**; `revisor` APROVADO | [ ] | |
| T1-A05 | T1-A3 (UI) | Pix no `BookingForm` (passo 3 da prancha Site-Reserva) com contagem regressiva, estados novos em `BookingCard`, textos de `/cancelar/[id]` e da pagina de reserva | T1-A03! | — | reproduz a prancha; 390 e 1440 px; sem `window.prompt/confirm` novos | [ ] | |
| T1-A06 | T1-A4 (migracao) | Migracao contrair: `approved` -> `confirmed` nos dados, remove `approved` do CHECK e da constraint | T1-A05! | — | `revisor` APROVADO; humano aplicou | [ ] | entrega propria |
| T1-A07 | — | **Humano:** agendar `pg_cron`/`pg_net` na instancia dev (segredo `CRON_SECRET` no Vault) e conferir `job_runs` e o vigia | T1-A04! | — | jobs rodam; falha visivel | [ ] | |

### T1-B · Concierge semi-automatico e base de conhecimento

Aceite da frente: no dev, o operador cola 3 conversas sinteticas no console e recebe rascunhos que passam no lint; os gatilhos de escalacao funcionam; **nenhum texto de hospede e gravado** (conferido nas tabelas do dev); eventos de rascunho e de envio sao registrados. Desenho: `architecture-v2` A.6, A.7, A.8, C.3, C.4, D.

| ID | Entrega | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|---|
| T1-B01 | T1-B1 (migracao) | Migracao: `hotel_faq`, `local_tips`, `commercial_rules`, `concierge_profile`, `conversations`, `conversation_events` (R-adm-all / R-append) | T0-A01!, T0-B01! | — | *agente:* arquivo, `down`, `revisor` APROVADO; *humano:* aplicou no dev | [ ] | sem `messages` (so T2) |
| T1-B02 | T1-B2 (motor) | Motor do concierge: mascaramento, extracao, pacote de fatos, redacao, **lint** (glossario, numeros so dos fatos, escassez, "seguro sua data"); funcao de disponibilidade compartilhada extraida de `/api/availability`; modulo unico de acesso a dados | T1-B01!, T0-B01! | contrato do provedor do modelo no piloto real (G.3); no dev, chave descartavel | script `node` de verificacao do lint (sem dependencia nova) verde; `revisor` APROVADO | [ ] | prompt-contrato versionado |
| T1-B03 | T1-B2 | Rota `POST /api/admin/concierge/draft` e pagina `/admin/concierge` (console) | T1-B02! | prancha Painel-Concierge (fila 10) | reproduz a prancha; nenhum texto gravado; `revisor` APROVADO | [ ] | |
| T1-B04 | T1-B3 (conhecimento) | Rotas e telas admin para FAQ, dicas locais, regras comerciais e perfil do concierge (secao Concierge em Configuracoes) | T1-B01! | prancha (fila 10) | `requireAdmin` + zod; `revisor` APROVADO | [ ] | |
| T1-B05 | T1-B3 | Kit do operador em `docs/`: rotina diaria de 10 min, tratamento das perguntas sem resposta, glossario | T1-B03 | — | docs revisados | [ ] | |
| T1-B06 | — | **Humano:** contrato do provedor do modelo (nao treinamento, retencao zero) e pendencias do juridico (`architecture-v2` G.3) antes de texto de hospede real | — | juridico | registrado | [ ] | fila 14 |

### T1-C · Relatorio e painel de resultado

Aceite da frente: relatorio semanal gerado dos eventos, revisado e aprovado pelo operador antes de ir ao dono; painel **Resultado** como entrada do `/admin`; Reservas como fila de excecoes com historico de eventos. Desenho: `architecture-v2` A.9, E.

| ID | Entrega | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|---|
| T1-C01 | T1-C1 (migracao) | Migracao `reports` | T0-A01! | — | `down`; `revisor` APROVADO; humano aplicou | [ ] | |
| T1-C02 | T1-C2 (job) | Job semanal (`daily_dispatch` na segunda): metricas + narrativa gerada **so de agregados**, status `draft` -> `approved` -> `sent`; envio por `wa.me` em T1 | T1-C01!, T0-A05! | T0-B01 | relatorio do dev confere com T0-A05; **sem PII no modelo**; `revisor` APROVADO | [ ] | |
| T1-C03 | T1-C3 (UI) | Painel **Resultado** (entrada do `/admin`) | T1-C02! | prancha Painel-Resultado (fila 10) | reproduz a prancha | [ ] | substitui o painel Hoje |
| T1-C04 | T1-C4 (UI) | Reservas como fila de excecoes + historico de `booking_events` na gaveta; substitui `window.prompt/confirm` do cancelamento (**M4-06 reduzido**) | T1-A05!, T0-A03! | prancha Painel-Reservas | reproduz a prancha; `revisor` APROVADO | [ ] | origem: M4-06 |

### T2-A · iCal

Aceite da frente: feed exportado valido (validador de iCal) com `awaiting_deposit` + `confirmed` + bloqueios proprios; importacao bloqueia as datas da outra plataforma; conflito gera `ical_conflict_detected`; sem laco de reexportacao. Desenho: `architecture-v2` A.10, C.2.

| ID | Entrega | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|---|
| T2-A01 | T2-A1 (migracao) | Migracao `ical_feeds` + `blocked_dates.feed_id` | T1-A06! | — | `down`; `revisor` APROVADO; humano aplicou | [ ] | reaproveita **M4-09** |
| T2-A02 | T2-A2 (rotas) | Rota de exportacao por token, rota/job de importacao (15-30 min por `pg_cron`), deteccao de conflito | T2-A01! | — | feed valido; teste de conflito; `revisor` APROVADO | [ ] | |
| T2-A03 | T2-A3 (UI) | Tela de feeds em Configuracoes | T2-A02! | — | e2e no dev | [ ] | |

### T2-B · WhatsApp API

Aceite da frente: webhook com assinatura e idempotencia; resposta automatica do concierge dentro da janela de 24 h; modelos para confirmacao e lembretes; follow-ups sozinhos; expurgo de texto aos 30 dias; tempo de 1a resposta medido com timestamps do provedor. Desenho: `architecture-v2` A.6, C.3, D.

| ID | Entrega | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|---|
| T2-B01 | T2-B1 (migracao) | Migracao `messages` (texto mascarado, `expires_at`) e colunas necessarias ao envio | T1-B01! | G.2 item 1 (telefone em repouso) e escolha do provedor (G.1 item 2) | `down`; `revisor` APROVADO; humano aplicou | [ ] | |
| T2-B02 | T2-B2 (rotas) | Webhook `POST /api/webhooks/whatsapp`, envio pela API, motor T2 reutilizando o da T1-B02 | T2-B01!, T1-B02! | numero do concierge (R-12) | teste de assinatura invalida e de idempotencia; `revisor` APROVADO | [ ] | |
| T2-B03 | T2-B3 (jobs) | Follow-ups, modelos (confirmacao, lembrete de chegada, pos-estadia), job de expurgo | T2-B02! | modelos aprovados no provedor | `revisor` APROVADO; expurgo verificado no dev | [ ] | |
| T2-B04 | — | **Humano:** pendencias do juridico (G.3), contrato do provedor, decisao sobre role dedicada (G.1 item 8) | — | juridico | registrado | [ ] | |

### T2-C · Precificacao comercial e go/no-go

Aceite da frente: relatorio mensal e fechamento do variavel por piloto a partir de `booking_events`; modelo comercial ajustado com os dados; decisao go/no-go registrada contra o criterio da strategy 2.12 (pelo menos 2 de 3 pilotos com diretas confirmadas e pagas, conversao acima da linha de base, zero overbooking, escalacao caindo, dono disposto a pagar o variavel).

| ID | Entrega | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|---|
| T2-C01 | T2-C | Relatorio mensal e fechamento do variavel (job + `reports` mensal) | T1-C02!, T2-A02 | fato gerador (T0-A07) | fecha com os pilotos do dev | [ ] | |
| T2-C02 | — | **Humano:** ajustar o modelo comercial com os dados (base por unidade, percentual, garantia) | T2-C01 | negocio | registrado em CLAUDE.md > Decisoes | [ ] | |
| T2-C03 | — | **Humano:** decisao go/no-go de T3 | T2-C02! | negocio | decisao e criterio registrados | [ ] | |

### T3-A · Multi-tenant

Aceite da frente: o do M2 (dois tenants de seed isolados; `tenant-auditor` sem critica/alta; teste cruzado falha em select/update/realtime/storage) **mais** a consolidacao dos dados dos pilotos. Executa as tarefas legadas **M2-01 a M2-07, M2-09** e **M3-01, M3-02, M3-04** na ordem original; M2-08 (equipe) e M3-03/M3-05 estao em "Adiado".

| ID | Entrega | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|---|
| T3-A01 | T3-A (plano) | Plano do M2 ampliado: incluir as tabelas novas (`tenant_id`, indices unicos por tenant) e o plano de consolidar as instancias dos pilotos | T2-C03! | D2 fechada | plano aprovado | [ ] | substitui a entrega E2-A e a tarefa M2-01 |
| T3-A02 | T3-A | Executar M2-02 a M2-07 e M2-09, M3-01, M3-02, M3-04 | T3-A01! | — | criterios de saida do M2 e do M3 | [ ] | `tenant-auditor` obrigatorio |
| T3-A03 | T3-A | Consolidar os pilotos num so banco | T3-A02! | humano | dados migrados e verificados | [ ] | decisao de D6 volta a valer |

### T3-B · Onboarding por agente

Aceite da frente: hotel novo nasce do link da plataforma de reservas/Instagram + fotos, com quartos, textos, politicas, guia de estilo e dicas locais **propostos** por agente e **aprovados** por humano; o agente de onboarding e agente em runtime (secao H). Reaproveita **M5-01**, **M5-03** e **M5-04**.

| ID | Entrega | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|---|
| T3-B01 | T3-B | Agente de onboarding: le a pagina publica do hotel e propoe quartos, textos, politicas, `concierge_profile` e `local_tips` (status `proposto`) | T3-A02!, T1-B04! | T0-B01 | humano aprova cada item; e2e no dev | [ ] | executa tambem M5-01 |

### T3-C · Tarifacao por periodo

Decisao de 2026-11-01: tarifa = base por noite por tipo de quarto + modificadores por periodo, calculados no Postgres; sem preco por pessoa. Entra em T3 (strategy 5). Sem tarefas detalhadas ainda: o plano abre quando T2-C03 for `go`.

### E6-A · Producao segura (mantida)

Aceite: rate limit e anti-bot ativos e testados no preview; cabecalhos de seguranca; keep-alive e dump semanal por instancia. **M6-07 e dependencia dura antes de ligar `auto_hold` em qualquer piloto** (`architecture-v2` G.1 item 4). Tarefas legadas: **M6-07, M6-08, M6-01a, M6-01b**. **E6-B** (go-live do 1o piloto): **M6-01, M6-03, M6-04, M6-05, M6-06**, por instancia, com `/deploy-checklist`.

### Entregas mantidas sem mudanca

E0-B1 (M0-11, Next 15), E0-B2 (M0-12, zod 4) e a parte aberta de E4-A (**M1-12**, `sw.js`) seguem como estavam na tabela abaixo.

## Entregas legadas (antes da A-0)

Cada entrega e uma branch + um PR + um handoff (Protocolo v3). As tarefas seguem na tabela do milestone; aqui fica o agrupamento. Entrega so e criada com tarefas relacionadas, mesmo risco e mesmo criterio de aceite, dentro dos limites do protocolo. As linhas E4-B, E4-C e E2-A foram absorvidas ou adiadas pela A-0 (notas na tabela).

| ID | Entrega | Tarefas | Tipo de mudanca (matriz) | Estado | Nota |
|---|---|---|---|---|---|
| E4-A | Busca de disponibilidade | M4-02 (PR #9), M1-12 | UI + API/rotas; `revisor` obrigatorio (rota e `public/sw.js`) | em andamento: M4-02 mergeado na `develop` (falta a verificacao do humano, fila 0); M1-12 aberta | confirmado pelo proprietario (2026-11-01). Se o plano apontar risco distinto para M1-12 (service worker), ela vira a entrega propria E1-X |
| E4-B | Painel Reservas | M4-06 | UI + API/rotas; `revisor` obrigatorio | absorvida (A-0): vira a entrega **T1-C4** (fila de excecoes + historico de eventos), reduzida | a E4-B original (tabela completa, filtros, gaveta) fica como referencia; a prancha Painel-Reservas continua sendo o criterio visual |
| E4-C | Painel Hoje | M4-08 | UI (+ rotas, se houver); `revisor` se tocar rota | `[a]` adiada (A-0) | movida para "Adiado"; o painel **Resultado** (T1-C3) ocupa a entrada do `/admin` |
| E0-B1 | Upgrade Next 15 | M0-11 (Next 15, React 19, eslint-config-next) | dependencias; entrega propria | `[ ]`: aguarda autorizacao de dependencias (fila, item 2) | a autorizacao entra em "Autorizacoes em pe" quando o proprietario liberar; ate la a entrega nao comeca |
| E0-B2 | Upgrade zod 4 | M0-12 | dependencias; entrega propria | `[ ]`: depende da E0-B1 (`!`) e de autorizacao propria | PR separado do Next (CLAUDE.md: upgrades grandes ficam separados de mudanca funcional) |
| D-1 | Reconciliacao do tracker com o objetivo final | M0-18 (CI), linhas M4-06 (nota), M6-07, M6-08; `docs/producao-checklist.md`; CLAUDE.md | Docs + `.github/` (workflow e dependabot) | `[h]`: PR da branch `docs/reconciliacao-2026-11-01` | sem codigo de aplicacao; o ruleset (status check `ci`) e do humano |
| E2-A | Plano multi-tenant | M2-01 | Docs (documento) | adiada (A-0): vira a tarefa **T3-A01**, ampliada com a consolidacao das instancias dos pilotos | multi-tenant so em T3 (decisao de 2026-11-01) |
| A-0 | Arquitetura v2 para o modelo de resultado | `docs/architecture-v2.md`, este arquivo, `docs/produto-e-roadmap.md`, CLAUDE.md > Decisoes | Docs (grep de termos proibidos, links) | `[h]`: PR da branch `docs/arquitetura-v2` | sem codigo e sem SQL; define a sequencia T0-T3 abaixo, que substitui o texto da sequencia que faltava na D-1 |

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
| D6 | SaaS ou instancia por cliente | fechada 2026-11-01 (CLAUDE.md); **reaberta so para a fase de pilotos em 2026-11-01** (ver D11) | SaaS multi-tenant em um deploy; durante T0-T2, 1 projeto Supabase + 1 projeto Vercel por pousada; volta a valer em T3-A | — |
| D7 | Gateway de pagamento (qual) | **fechada 2026-11-01** (CLAUDE.md) | Mercado Pago (link de pagamento + webhook), sandbox primeiro; Asaas deixa de ser a alternativa padrao | — |
| D8 | Provedor de e-mail/WhatsApp | fechada 2026-11-01 (CLAUDE.md); **ajustada em 2026-11-01** | e-mail Resend em M4-01; WhatsApp semi-automatico em T1 (agente redige, humano envia por wa.me); API oficial via provedor em T2 (provedor ainda a escolher: DA-2) | — |
| D9 | Politica de modelo: classes de tarefa x modelo minimo | revogada 2026-11-01 (CLAUDE.md > Decisoes) | Claude Code somente em Sonnet (padrao) ou Fable; sem classes de tarefa x modelo | — |
| D10 | Modelo comercial | fechada 2026-11-01 (CLAUDE.md) | hibrido: base por unidade + 5% sobre reservas diretas confirmadas; garantia de 60 dias; preco explicado em comissao economizada | — |
| D11 | Fase de pilotos | fechada 2026-11-01 (CLAUDE.md) | T0-T2 em instancia por cliente; 3 pilotos com trafego proprio; `hotel-engine-dev` = "pousada zero"; M2 em T3 | — |
| D12 | Quem bloqueia a data | fechada 2026-11-01 (`architecture-v2` secao B) | `awaiting_deposit` bloqueia com TTL (`expires_at`, configuravel em `booking_policy`); `no_double_booking` cobre `awaiting_deposit` e `confirmed`; `pending` nao bloqueia; expiracao por job | — |
| D13 | Retencao e privacidade do concierge | fechada 2026-11-01 (`architecture-v2` A.6, D.6) | T1 sem texto de hospede; T2 texto mascarado por 30 dias com expurgo; telefone como hash na conversa, em claro so em `bookings` | — |
| D14 | Jobs agendados | fechada 2026-11-01 (`architecture-v2` C.2) | `pg_cron` + `pg_net` com `CRON_SECRET` como padrao; GitHub Actions `schedule` como alternativa (por excecao); Vercel Cron so para diarios | — |
| D15 | Agentes em runtime e segredos por instancia | fechada 2026-11-01 (`architecture-v2` secao H) | concierge e codigo de produto com secao propria no harness; segredos so nas variaveis da Vercel/Supabase de cada instancia; excecao registrada para modelo ler texto mascarado; runbook de migracoes em N instancias | aplicacao em T0-B |
| D16 | Tabelas privadas e idempotencia | fechada 2026-11-01 (`architecture-v2` A.5, A.8) | `concierge_profile` e `commercial_terms` em tabelas proprias com RLS so admin; `webhook_receipts` propria | — |
| DA-1 | Fato gerador do variavel, estorno e quais canais cobram | **aberta** | confirmacao x estadia concluida (`architecture-v2` G.1 item 1) | 1o fechamento (T0-A07) |
| DA-2 | Provedor de WhatsApp e numero do concierge | **aberta** | G.1 item 2 e risco R-12 | T2-B |
| DA-3 | `deposit_percent`, retencao do sinal, reembolso | **aberta** | G.1 item 3 | T1-A01 |
| DA-4 | Anti-abuso minimo antes de `auto_hold` | **aberta** | G.1 item 4 (M6-07) | `auto_hold` em piloto |
| DA-5 | Expiracao de `pending`; reais x centavos; auditoria das edicoes do concierge; role dedicada | **aberta** | G.1 itens 5 a 8 | T1-A, T1-B, T2-B |
| DA-6 | Telefone em repouso para follow-up em T2 | **aberta** | G.2 item 1 (recomendacao: cifrado e expurgado com as mensagens) | T2-B01 |
| DA-7 | Pendencias do juridico | **aberta** | G.3 | antes de texto de hospede real |

---

## Legado por milestone (M0-M6, preservado)

As tabelas abaixo continuam sendo o checklist das tarefas antigas. A A-0 nao apagou nenhuma: seis foram movidas para "Adiado" e as demais ganharam destino na secao "Mapa M -> T". Tarefas novas usam os IDs T*.

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
**A-0: executado em T3-A (adiado ate o go da T2-C03).** Criterio de saida: dois tenants de seed isolados; tenant-auditor sem critica/alta; teste cruzado falha em select/update/realtime/storage.

| ID | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|
| M2-01 | Plano do M2 + modelo de ameaca | M1-09 | D2 | plano aprovado | [ ] | pode comecar com M1 em [h] |
| M2-02 | Migracao tenants + tenant_id em tudo; admins (tenant_id,user_id,role) | M2-01! | D2 | humano aplicou; down testado | [ ] | humano aplica |
| M2-03 | current_tenant_id(), is_admin(tenant), policies reescritas | M2-02! | — | tenant-auditor sem critica | [ ] | |
| M2-04 | no_double_booking e is_range_available por (tenant_id, room_id) | M2-02! | — | teste cruzado de overbooking falha | [ ] | |
| M2-05 | Storage paths tenants/<id>/; realtime filtrado | M2-03 | — | auditor sem alta | [ ] | |
| M2-06 | Rotas: tenant explicito com service role; IDOR; 404/403 consistentes | M2-03 | — | revisor + auditor APROVADO | [ ] | |
| M2-07 | Seed com 2 tenants; teste cruzado em evals/tenant/ | M2-06 | — | 3 cenarios falham como esperado | [ ] | |
| M2-09 | Endurecer rotas de settings e cancel (regex do path, strip do zod, 404 generico, cancelled_by) | M2-06 | — | revisor sem ressalvas medias nessas rotas | [ ] | origem: ressalvas do revisor em M1-05/06/07 (2026-10-31). Inclui os 7 achados baixos do fechamento do M1 (M1-09; decisao do proprietario em 2026-11-01, sem M1-13): cancel_token fora do payload RSC e prop tipada em `/cancelar/[id]`; erro transitorio nao cacheado em `lib/site-settings.ts`; policy de select do bucket `site`; arquivo orfao ao remover logo/hero; HE001 so no INSERT; aviso da janela de cancelamento com `published=false`; fuso do servidor em `/api/bookings`. Detalhe: `docs/handoffs/2026-11-01-m1-fechamento.md` |

## M3 · Roteamento e tema por tenant
**A-0: M3-01, M3-02 e M3-04 executam em T3-A; M3-03 (tema) e M3-05 (dominio proprio) foram para "Adiado".** Criterio de saida: dois hosts locais servem dois tenants sem vazamento de cache; tema por tenant aplicado.

| ID | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|
| M3-01 | middleware resolve tenant por host; 404 para host desconhecido | M2-03! | — | 2 hosts locais funcionam | [ ] | |
| M3-02 | Cache por tenant (tags) e revalidacao | M3-01 | — | sem vazamento | [ ] | |
| M3-04 | Sitemap, robots, metadata por tenant | M3-02 | — | verificados nos 2 hosts | [ ] | |

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
| M4-09 | iCal export/import | T1-A! | — | feed valido | [ ] | A-0 (2026-11-01): absorvida pela entrega T2-A; a dependencia original em M4-07 (tape chart, adiado) cai, porque o feed nao precisa do tape chart |
| M4-10 | Testes: reavaliar D0 | M4-04 | D0 | decisao registrada | [ ] | |

## M5 · Onboarding e operacao do tenant
**A-0: M5-01, M5-03 e M5-04 executam em T3-B; M5-02 (equipe) foi para "Adiado".** Criterio de saida: hotel novo criado pelo painel aparece no host dele em < 10 min sem SQL.

| ID | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|
| M5-01 | Fluxo "novo hotel" | M3-02! | — | e2e no dev | [ ] | |
| M5-03 | Plano e faturamento (SaaS, D6) | M5-01 | — | conforme decisao | [ ] | |
| M5-04 | Ajuda contextual e primeiros passos | M5-01 | — | prancha Painel-Config secao Plano | [ ] | |

## M6 · Producao
Criterio de saida: deploy pelo humano via /deploy-checklist; /smoke-test contra prod; backup ativo (M6-01b) e keep-alive ativo (M6-01a); historico git limpo.

| ID | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|
| M6-01 | Projeto prod; variaveis so na Vercel; dominio | T1-A | — | prod criado | [ ] | humano; plano Free (D5); A-0 (2026-11-01): passa a valer **por piloto** (1 projeto Supabase + 1 projeto Vercel por pousada); a dependencia original em M4-08 (painel Hoje, adiado) cai; ver entrega E6-A |
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

## Adiado (A-0, 2026-11-01: strategy 2.9)

Linhas **movidas sem alteracao de conteudo** (texto original preservado). Motivo comum: nao movem o outcome nos primeiros clientes; voltam ao backlog so por decisao do proprietario.

| ID | Tarefa | Dep | Gate | Pronto quando | Status | Nota |
|---|---|---|---|---|---|---|
| M2-08 | Papeis por RLS; tela Equipe | M2-06 | — | prancha Painel-Config secao Equipe | [a] | origem M2; equipe para quem tem 1 pessoa nao move o outcome; papeis seguem decididos (owner/recepcao/limpeza por RLS, 2026-11-01) |
| M3-03 | Tema (cor, fonte) em site_settings -> CSS vars | M1-06 | — | tweak da prancha reproduzido | [a] | origem M3; era "pode adiantar: nao depende de M2" |
| M3-05 | Dominio proprio | M3-01 | — | fluxo documentado | [a] | origem M3; D3 segue: subdominio primeiro |
| M4-07 | Painel Calendario: tape chart, bloqueios, tarifas (Painel-Calendario) | M4-06 | — | reproduz prancha; sem overbooking | [a] | origem M4; prancha Painel-Calendario congelada |
| M4-08 | Painel Hoje: KPIs, chegadas/saidas, aprovacoes, inbox (Painel-Hoje) | M4-06 | — | reproduz prancha | [a] | origem M4 e entrega E4-C; o painel Resultado (T1-C3) ocupa a entrada do `/admin`; prancha Painel-Hoje congelada |
| M5-02 | Convite de equipe; papeis | M2-08! | — | e2e no dev | [a] | origem M5; depende de M2-08 (tambem adiada) |

Tambem adiadas **sem mudar de tabela** (continuam nas linhas originais, marcadas aqui): M1-10 (a implementacao da galeria generica por tenant nao tem tarefa propria e fica fora das fases), M4-04 (adicionais e reembolso parcial: nao ha reembolso na v1), M4-05 (pagina "Minha reserva" completa: a v1 so adapta `/cancelar/[id]` em T1-A5) e M4-10 (reavaliar D0 acontece antes do primeiro piloto com sinal real, ver decisao de testes em CLAUDE.md).

## Mapa M -> T (nenhuma tarefa foi apagada)

| Legado | Destino | Situacao |
|---|---|---|
| M0-01 a M0-10, M0-13 a M0-17 | M0 (fundacao) | inalterado |
| M0-07 (eval sessao-zero) | M0 + T0-B03 | humano roda depois de T0-B01 |
| M0-11, M0-12 | **E0-B1, E0-B2** (mantidos) | inalterado |
| M0-18 (CI) | M0 | inalterado; o ruleset e do humano |
| M1-01 a M1-09, M1-11 | M1 (aceito) | inalterado |
| M1-10 | adiado (acima) | decisao registrada; implementacao fora das fases |
| M1-12 (`sw.js`) | **mantida** (entrega E4-A restante) | antes do 1o deploy publico |
| M2-01 | T3-A01 | adiada para T3 |
| M2-02 a M2-07, M2-09 | T3-A02 | adiadas para T3 |
| M2-08 | Adiado | `[a]` |
| M3-01, M3-02, M3-04 | T3-A02 | adiadas para T3 |
| M3-03, M3-05 | Adiado | `[a]` |
| M4-01 (e-mail/WhatsApp) | T1-A/T1-B | e-mail Resend permanece para alertas ao operador; mensagens a hospedes saem de modelos de texto |
| M4-02 | M4 | `[h]` aguardando o humano (fila 0) |
| M4-03 (pagamento) | T1-A01 a T1-A06 | absorvida e ampliada |
| M4-04 | adiado (acima) | sem reembolso na v1 |
| M4-05 | adiado (acima) | v1 adapta `/cancelar/[id]` em T1-A05 |
| M4-06 | T1-C04 | reduzida: fila de excecoes + eventos |
| M4-07, M4-08 | Adiado | `[a]` |
| M4-09 (iCal) | T2-A01 a T2-A03 | absorvida |
| M4-10 (testes, D0) | M4 | reavaliar antes do 1o sinal real |
| M5-01 | T3-B | executada em T3 |
| M5-02 | Adiado | `[a]` |
| M5-03 (plano e faturamento) | T3-B | executada em T3; a cobranca dos pilotos e manual (T2-C) |
| M5-04 | T3-B | executada em T3 |
| M6-01, M6-03 a M6-06 | **E6-B** (mantida, por piloto) | dep. de M6-01 passa a T1-A |
| M6-01a, M6-01b, M6-07, M6-08 | **E6-A** (mantida) | M6-07 e dura antes de `auto_hold` |
| M6-02 | M6 | `[h]` |
| E2-A | T3-A01 | adiada |
| E4-A | M4-02 `[h]` + M1-12 | M1-12 segue |
| E4-B | T1-C04 | absorvida |
| E4-C | Adiado | `[a]` |

## Registro de milestones concluidos

| Milestone | Data | Criterio de saida verificado por | Eval sessao-zero |
|---|---|---|---|
| — | — | — | — |

## Como iniciar a proxima sessao

Rode `/proxima`. O comando (`.claude/commands/proxima.md`) le este arquivo e o harness e propoe a proxima ENTREGA: tarefas cobertas e relacao entre elas, criterio de aceite unico, sinais de divisao e limites, validacoes da matriz, pontos de parada e o prompt nos sete blocos. Nada e executado antes da confirmacao do humano. Ao final da entrega: validacoes, push, PR, um handoff e este arquivo atualizado uma vez.
