# Hotel Engine — produto final e roadmap

Camada: Conhecimento (ver `docs/harness.md`). Este arquivo descreve ONDE o projeto vai e EM QUE ORDEM.
Cada frente vira uma ou mais entregas do Claude Code, sempre com `desenvolver-feature`, `revisor` e handoff.
Nenhuma frente comeca com decisao pendente em aberto; decisoes vao para `CLAUDE.md` > Decisoes.

Status: **reescrito em 2026-11-01 (entrega A-0)** a partir de `docs/strategy/product-strategy-v1.md`. As secoes 1 a 4 estao em vigor. A visao SaaS e os epicos E0-E6 de 2026-10-30 foram preservados na secao 5 como **historico (superado)**, com o destino de cada epico. Desenho tecnico: `docs/architecture-v2.md`. Progresso e tarefas: `docs/milestones.md`.

---

## 1. Posicionamento e outcome (em vigor)

**Posicionamento:** "Hotel Engine confirma e paga suas reservas diretas, 24 horas, sem comissao de OTA e sem voce operar nada." (strategy, secao 5)

**Outcome principal:** reservas diretas confirmadas e pagas, atribuidas ao sistema, com tempo de resposta inferior a 2 minutos e zero overbooking.
**Outcomes secundarios:** comissao economizada em R$; horas devolvidas ao dono; no-show reduzido pelo sinal.

**Quem paga:** o proprietario-operador de pousada, residencial ou hotel de 6 a 30 unidades no Brasil, que vende por plataformas de reserva e pelo WhatsApp, sem recepcao 24 h, que perde reserva por demora e paga comissao de plataforma (a strategy cita 15 a 20% `[INFERIDO]`, a confirmar com cada piloto). Fora do alvo nos primeiros 12 meses: redes, hoteis com sistema de gestao instalado, hostels de alto volume.

**Modelo comercial (decidido em 2026-11-01):** hibrido, com base por unidade + 5% sobre reservas diretas confirmadas; garantia de 60 dias; o preco e explicado em comissao economizada. Um pagamento puro por resultado foi rejeitado (risco de demanda e disputa de atribuicao); assinatura pura tambem.

**Modelo de entrega:** servico gerenciado orientado a resultado. Onboarding feito por nos ou por agente; operacao automatizada; o dono so entra em excecoes e para ver o relatorio; relatorio semanal.

**O que o sistema e hoje:** um bom motor (regras de reserva no Postgres, sem overbooking, politicas, busca) e um painel de configuracao. Falta o que prova e entrega o outcome: eventos e atribuicao, pagamento de sinal, mensageria, sincronizacao de calendario, relatorio e linha de base.

**Principios herdados (nao mudam):** regras de disponibilidade e anti-overbooking vivem no Postgres; preco nunca vem do cliente; RLS em toda tabela; service role so no servidor; harness, CI e protecao de branch.

**Fase atual:** pilotos. T0-T2 rodam em **instancia por cliente** (1 projeto Supabase + 1 projeto Vercel por pousada; `hotel-engine-dev` e a "pousada zero"); multi-tenant (M2) fica para T3. Decisoes D10 e D11 em `docs/milestones.md`.

Referencia visual: `docs/design/README.md` (8 pranchas, tema escuro, 2026-10-30). Pranchas **novas** necessarias: Painel-Resultado e Painel-Concierge. Painel-Hoje, Painel-Calendario e a secao Equipe de Painel-Config ficam congeladas (Adiado).

### Metricas (resumo; definicao exata em `docs/architecture-v2.md` secao E)
Reservas diretas confirmadas por mes; comissao economizada (R$, estimativa); tempo de primeira resposta; conversao; no-show e cancelamento tardio; incidentes de overbooking (meta zero); horas devolvidas ao dono (estimativa); taxa de escalacao ao dono; razao receita variavel / custo de operacao. Sem linha de base dos 30 dias anteriores nao ha outcome, so numero bonito.

---

## 2. Roadmap em frentes (em vigor)

Ordem: T0 -> T1 -> T2 -> T3. Duracao estimada da strategy entre parenteses. Mantidos fora das fases: upgrade do framework (E0-B1, E0-B2), `public/sw.js` (M1-12) e producao segura (E6-A, E6-B). Detalhe de tarefas, dependencias duras e criterios de aceite: `docs/milestones.md`, secao "Roadmap de resultado".

### T0 — Medicao (~2 semanas)
- **T0-A Medicao:** `booking_events` (ator, acao, de -> para, origem, sem PII), `source` e `channel` na reserva, funil anonimo, linha de base, relatorio v0, escolha dos 3 pilotos e dos termos.
- **T0-B Harness para agentes em runtime:** secao nova do harness, segredos por instancia, excecao de privacidade para o modelo, runbook de migracoes em N instancias.
Pronto quando: todo estado de reserva gera evento; o relatorio v0 confere com contagem manual; pilotos escolhidos e linha de base coletada; harness atualizado e `evals/sessao-zero` sem regressao.

### T1 — Concierge MVP (4-6 semanas)
- **T1-A Pagamento e confirmacao automatica:** `awaiting_deposit` que **bloqueia a data** com prazo, sinal via Pix (Mercado Pago, link + webhook idempotente), regra "pago => confirmada", expiracao por job.
- **T1-B Concierge semi-automatico e base de conhecimento:** o agente redige, o humano envia; FAQ, dicas locais, regras comerciais, perfil de estilo; estagio do funil; nenhum texto de hospede e gravado.
- **T1-C Relatorio e painel de resultado:** relatorio semanal revisado pelo operador; painel Resultado na entrada do `/admin`; Reservas como fila de excecoes.
Pronto quando: no dev (sandbox), sinal Pix confirma reserva, webhook repetido aplica uma vez, hold expirado libera a data, rascunhos passam no lint e o relatorio e gerado dos eventos. Nos pilotos: reservas diretas confirmadas e pagas, atribuidas ao sistema.

### T2 — Prova e preco (~4 semanas)
- **T2-A iCal:** importa bloqueios das plataformas de reserva e exporta os nossos; elimina overbooking entre canais.
- **T2-B WhatsApp API:** provedor oficial; concierge responde sozinho dentro da janela de 24 h; modelos para confirmacao e lembretes; texto retido 30 dias e expurgado.
- **T2-C Precificacao comercial e go/no-go:** relatorio mensal, fechamento do variavel, ajuste do modelo com dados, decisao go/no-go.
Pronto quando: pelo menos 2 dos 3 pilotos com reservas diretas confirmadas e pagas atribuidas ao sistema; tempo de 1a resposta abaixo de 2 min (medido com os horarios do provedor); conversao acima da linha de base; zero overbooking; taxa de escalacao caindo semana a semana; dono disposto a pagar o variavel.

### T3 — Produtizar (8+ semanas)
- **T3-A Multi-tenant:** o antigo E2 (tenants, `tenant_id`, RLS), mais a consolidacao dos pilotos.
- **T3-B Onboarding por agente:** hotel novo nasce de link e fotos, com proposta de agente e aprovacao humana.
- **T3-C Tarifacao por periodo:** base por noite por tipo de quarto + modificadores por periodo, no Postgres.
Pronto quando: a operacao por cliente cai (horas do operador por cliente por semana, mes a mes) e a margem sobe.

### Producao segura (mantida)
- **E6-A:** limite de requisicoes e protecao contra robos, cabecalhos de seguranca, keep-alive e dump por instancia. O limite de requisicoes e pre-requisito de ligar a reserva automatica de data num piloto.
- **E6-B:** projeto de producao por piloto, observabilidade sem PII, go-live com `/deploy-checklist`.

### Adiado (decisao de 2026-11-01)
Tema e cores por hotel, dominio proprio, equipe e papeis, tape chart elaborado, painel "Hoje" elaborado, multi-tenant antes de T3. Voltam so por decisao do proprietario.

---

## 3. Decisoes e riscos (em vigor)

Decisoes fechadas D0-D16 e gates em aberto DA-1 a DA-7: `docs/milestones.md` (secao Decisoes). Riscos, conflitos e pendencias do juridico: `docs/architecture-v2.md` secao G. Em resumo, o que mais pesa: fato gerador do variavel, anti-abuso antes de segurar datas, provedor de WhatsApp e numero do concierge, telefone em repouso para follow-up, e a lista do juridico para tratar texto de hospede.

Riscos de negocio e como testamos cedo (strategy, secao 5): atribuicao contestada (T0 resolve com eventos e linha de base); dono que nao quer automacao (T1 mede o que ele delega); API de WhatsApp com custo e aprovacao de modelos (T1 comeca semi-automatico); demanda insuficiente no piloto (pilotos com trafego existente); virar agencia (meta explicita: horas de operacao humana por cliente caindo a cada fase).

---

## 4. Modelo de prompt por tarefa (os sete blocos) — em vigor

```
Tarefa: <uma frase> + <por que e delicada, se for>.

Contexto obrigatorio: <arquivos nomeados, incluindo um molde de estilo>.

Escopo (so isto):
1. ...
2. ... (ordem interna explicita onde importa)

Fora de escopo (nao fazer): <o que ele vai querer fazer e nao deve>.

Pronto quando: <mensuravel: comando, numero, veredito>.

Pontos de parada: <quando DEVE me interromper; o resto, siga sem perguntar>.

Relato no formato de docs/handoffs/TEMPLATE.md. Nao commitar.
```

---

## 5. Historico (superado em 2026-11-01)

Preservado sem alteracao de conteudo para consulta e diff. **Nao use estas secoes como plano.** O roadmap em vigor e o das secoes 1 a 3.

### 5.1 Visao SaaS multi-tenant (rascunho de 2026-10-30)

Status original: rascunho de 2026-10-30, inferido do codigo atual e da conversa de setup. [INFERIDO] marca o que o humano precisa confirmar.

**Hotel Engine** e um motor de reservas white-label para pequenas hospedagens (pousadas, residenciais, hoteis de ate ~30 unidades).
Cada hospedagem e um **tenant** com:

- **Site publico proprio** (marca, textos, fotos, contato, dominio ou subdominio), com busca de disponibilidade, pedido de reserva e cancelamento por link.
- **Painel do anfitriao**: reservas em tempo real (aprovar, recusar, cancelar), quartos, bloqueio de datas, galeria, configuracoes do site.
- **Regras de integridade no Postgres**: sem overbooking (`no_double_booking`), disponibilidade e preco calculados no servidor, RLS isolando cada tenant.
- **Operacao segura por agentes**: todo o desenvolvimento passa pelo harness (hooks, rules, skills, revisor, tenant-auditor).

Modelo de negocio [INFERIDO]: SaaS por tenant, ou instancia por cliente. A escolha muda o epico 5. Decidir antes dele.

*Resolucao (A-0):* hibrido por resultado, pilotos por instancia, multi-tenant em T3 (secao 1).

#### O que ja existia (v0, single-tenant)
Next.js 14 App Router + Supabase. Site publico, reserva com aprovacao manual, cancelamento por token, painel com realtime, galeria.
Identidade do anfitriao ja vem de env (`lib/site-config.ts`). Marca, textos geograficos, imagens e dominio ainda hardcoded (ver `docs/analysis/03`).

#### Decisoes que bloqueavam epicos
| Decisao | Bloqueia | Opcoes |
|---|---|---|
| Moeda e formatacao | E1, E4 | so BRL / por tenant |
| Modelo de tenant | E2 | tabela `tenants` + `tenant_id` em tudo (recomendado) / schema por tenant / projeto Supabase por cliente |
| Roteamento | E3 | subdominio `slug.hotelengine.app` / dominio proprio / ambos |
| Pagamento | E4 | nenhum (reserva sob aprovacao, como hoje) / sinal via gateway / integral |
| Prod Free vs Pro | E6 | Free pausa em 7 dias e nao tem backup |
| SaaS ou instancia por cliente | E5 | define billing e onboarding |

### 5.2 Epicos E0-E6 (2026-10-30) e destino na A-0

Ordem original: E0 -> E1 -> E2 -> E3. E4, E5 e E6 podiam intercalar depois de E2.

| Epico | Destino |
|---|---|
| E0 Hardening | segue como M0 e as entregas E0-B1/E0-B2 (mantidas); harness novo em T0-B |
| E1 Configuracao do site por tenant | M1, aceito em 2026-11-01 |
| E2 Multi-tenant no dado | T3-A (adiado) |
| E3 Roteamento e tema por tenant | T3-A para o roteamento por host; tema e dominio proprio em "Adiado" |
| E4 Reserva completa | pagamento, estados e confirmacao em T1-A; iCal em T2-A; calendario e painel Hoje em "Adiado"; Reservas reduzido em T1-C4 |
| E5 Onboarding e operacao do tenant | T3-B; equipe em "Adiado" |
| E6 Producao | E6-A e E6-B (mantidas), agora por instancia de piloto |

#### E0 — Hardening (antes de qualquer feature)
Objetivo: eliminar risco conhecido e fechar o ciclo do agente.
- Upgrade `next` (14 -> 15/16, com React 19) e `zod` (3 -> 4), em PRs separados. P1 ja registrado no harness.
- ESLint configurado (`npm run lint` nao interativo).
- Hook de `Stop` com typecheck; allowlist de leitura; opcional: commit gate exigindo veredito do revisor.
- Opcao (b) de testes reavaliada: vitest sobre `is_range_available`, `get_occupied_dates`, `no_double_booking` e rotas de reserva, contra o projeto dev.
Pronto quando: `npm audit` sem high/critical em dependencias diretas; `/verificar` roda lint; `test-hooks` verde com os casos novos; decisao de testes registrada.

#### E1 — Configuracao do site por tenant (desacoplar o cliente anterior)
Objetivo: nenhum texto, marca, imagem, contato ou dominio hardcoded; tudo vem de uma tabela `site_settings` (ou `tenants`, se E2 ja estiver decidido) editavel no painel.
- Migracao: `site_settings` (nome, slogan, descricao, endereco, contatos, redes, dominio, logo/imagens em storage, moeda, fuso).
- Seed sintetico "Hotel Engine Demo".
- Painel: tela "Configuracoes do site" (Server Component + form), com `requireAdmin()`.
- Site publico le `site_settings` com cache e `revalidate`; metadata/JSON-LD dinamicos.
- Remocao dos arquivos de verificacao Google e imagens do cliente anterior (`varrer-acoplamento` com grep zero).
- Pranchas: Painel-Config, Main.
Pronto quando: grep do inventario de `docs/analysis/03` retorna zero em `app/`, `components/`, `lib/`, `public/`; site renderiza com o seed demo; revisor APROVADO; `tenant-auditor` nao se aplica ainda.

#### E2 — Multi-tenant no dado
Objetivo: varios tenants no mesmo banco, isolados por RLS.
- Tabela `tenants`; `tenant_id` em `rooms`, `bookings`, `blocked_dates`, `gallery_photos`, `site_settings`; `admins` passa a (tenant_id, user_id, role).
- Funcao `current_tenant_id()` (via claim no JWT ou via `admins`), policies reescritas com predicado de tenant, `is_admin()` recebe tenant.
- `no_double_booking` e `is_range_available` por (tenant_id, room_id).
- Storage: path `tenants/<id>/...` e policies por tenant. Realtime: filtro por `tenant_id`.
- Rotas: toda consulta com service role leva `tenant_id` explicito; IDOR checado.
Pronto quando: `tenant-auditor` sem critica/alta; teste cruzado (admin A tentando id de B) falha em select/update/realtime/storage; `types/database.ts` atualizado; migracao reversivel aplicada no dev pelo humano.

#### E3 — Roteamento e tema por tenant
Objetivo: cada tenant acessado pelo proprio endereco.
- `middleware.ts` resolve tenant por host (subdominio ou dominio custom) e injeta no request.
- Tema (cores, fontes) em `site_settings`, aplicado via tokens Tailwind/CSS vars.
- Cache por tenant (tags), sitemap/robots por tenant.
- Pranchas: Main com tema por tenant.
Pronto quando: dois tenants de seed respondem em hosts diferentes no dev (hosts locais), sem vazamento de cache; `tenant-auditor` APROVADO.

#### E4 — Reserva completa
Objetivo: fluxo de reserva pronto para hospede real.
- Politica de cancelamento por tenant (janela, taxa); e-mail/WhatsApp de confirmacao e lembrete (provedor a decidir, chaves so em env).
- Pagamento conforme decisao (nenhum / sinal / integral); se gateway, webhook idempotente e estados em Postgres.
- Calendario do painel com arrastar/bloquear; exportacao iCal.
- Pranchas: Site-Reserva, Site-MinhaReserva, Painel-Reservas.
Pronto quando: `/smoke-test` completo (reservar, aprovar, cancelar, pagar se houver) no dev; nenhum dado de hospede em log; revisor APROVADO.

#### E5 — Onboarding e operacao do tenant
Objetivo: criar um hotel novo sem SQL.
- Fluxo "novo tenant": cria `tenants`, `site_settings`, primeiro admin, quartos iniciais.
- Convite de admin por e-mail; papeis (owner, staff).
- Billing (se SaaS): plano, status, bloqueio gracioso.
- Pranchas: Painel-Config (secoes Equipe e Plano).
Pronto quando: um tenant criado pelo painel aparece no host dele em menos de 10 minutos sem intervencao tecnica.

#### E6 — Producao
Objetivo: operar com seguranca.
- Prod no plano com backup e sem pausa; variaveis so na Vercel; checklist de deploy (`/deploy-checklist`).
- Observabilidade: logs estruturados sem PII, alertas basicos, pagina de status interna.
- Historico git limpo antes de repo publico; rename `hotel-engine` no repo, package, Vercel.
Pronto quando: deploy feito pelo humano seguindo o checklist; `/smoke-test` contra prod; decisoes de E6 fechadas.

### 5.3 Prompt-mestre de planejamento (usado uma vez, Plan mode)

Este prompt nao constroi nada. Ele transforma o roadmap antigo em tarefas executaveis e aponta o que falta decidir. Ja executado; o resultado esta em `docs/milestones.md`.

```
Plan mode. Tarefa de planejamento, somente leitura; nao edite codigo.

Contexto obrigatorio: docs/harness.md, docs/produto-e-roadmap.md (este), CLAUDE.md, docs/analysis/00-perguntas-em-aberto.md, docs/analysis/03-acoplamento-ao-cliente-atual.md, supabase/schema.sql, types/database.ts.

Escopo:
1. Para cada decisao da secao 1 deste roadmap, dizer se ja esta registrada em CLAUDE.md > Decisoes, aberta em 00-perguntas-em-aberto.md, ou em lugar nenhum. Propor a linha a adicionar em 00-perguntas-em-aberto.md para as que faltam (nao decidir).
2. Para E0 e E1, quebrar cada epico em tarefas de UM objetivo cada (tamanho: um PR revisavel em ate 30 min). Para cada tarefa: titulo, arquivos provaveis, se exige migracao, dependencias, risco (baixo/medio/alto) e o criterio de pronto.
3. Para E2 a E6, so listar as tarefas em uma linha cada e marcar as que dependem de decisao.
4. Apontar conflitos entre este roadmap e o codigo atual (ex.: tabela que ja existe com outro nome, funcao que ja faz parte do E2).
5. Propor a ordem das 5 primeiras tarefas, justificando.

Fora de escopo: implementar, criar migracao, editar qualquer arquivo. Nao estimar horas.

Pronto quando: a lista de tarefas de E0 e E1 esta completa, cada uma com criterio de pronto, e todas as decisoes faltantes tem linha proposta.

Pontos de parada: se encontrar no codigo algo que contradiga a visao (ex.: ja existe multi-tenant parcial), pare e mostre antes de continuar.

Relato: salvar em docs/handoffs/AAAA-MM-DD-plano-roadmap.md no formato do TEMPLATE, com a lista de tarefas como secao extra. Nao commitar.
```

### 5.4 Prompt completo da primeira tarefa de E1 (exemplo, concluido)

Exemplo historico de prompt nos sete blocos; a tarefa foi entregue no M1 (M1-02, `site_settings`). Serve de molde de estilo.

```
Tarefa: criar a tabela site_settings e a leitura dela no site publico, substituindo marca, slogan e descricao hardcoded. E o primeiro passo do E1 e envolve migracao, entao: siga desenvolver-feature do passo 1 ao 9.

Contexto obrigatorio: docs/harness.md (eixo 3, contrato de pronto), .claude/rules/dados-e-supabase.md, .claude/rules/rotas-api.md, docs/analysis/03-acoplamento-ao-cliente-atual.md (itens de marca e texto), supabase/schema.sql (padrao de RLS e policies), lib/site-config.ts (molde: e assim que a config chega ao app hoje), components/public/About.tsx e app/layout.tsx (onde a marca aparece).

Escopo (so isto):
1. Plan mode: confirmar em 00-perguntas-em-aberto.md se "moeda" esta decidida. Se nao, PARAR e me perguntar; a tabela tem coluna de moeda.
2. Migracao supabase/migrations/<timestamp>_site_settings.sql: tabela site_settings (id uuid pk, name, tagline, description, address, city, country, phone_public, email_public, instagram, domain, currency char(3), timezone, logo_path, hero_image_path, created_at, updated_at), RLS ligada, policy de select para anon, policy de update so para is_admin(), trigger touch_updated_at, bloco "-- down:" com a reversao. Seed sintetico: uma linha "Hotel Engine Demo", sem cidade real, sem contato real.
3. types/database.ts atualizado na mesma mudanca.
4. lib/site-settings.ts: funcao server-only getSiteSettings() com cache e revalidate = 60, lendo com o cliente anon (RLS). Sem service role.
5. Substituir marca, slogan e descricao em app/layout.tsx (title, metadata, JSON-LD) e components/public/About.tsx pelos valores de getSiteSettings(). Nenhum outro componente nesta tarefa.
6. Grep final: os termos de marca listados em docs/analysis/03 devem retornar zero em app/layout.tsx e components/public/About.tsx.

Fora de escopo (nao fazer): tela de edicao no painel, imagens e storage, endereco/contatos nos demais componentes, tema/cores, multi-tenant, alterar supabase/schema.sql.

Pronto quando: /verificar passa; migracao entregue com bloco down e EU confirmei que apliquei no dev; types refletem a tabela; site em localhost mostra "Hotel Engine Demo" no header, title e About; revisor APROVADO; relato entregue.

Pontos de parada: decisao de moeda em aberto; apos entregar a migracao, esperar minha confirmacao de aplicacao antes do passo 4; qualquer necessidade de service role.

Relato no formato de docs/handoffs/TEMPLATE.md, com a linha de decisao proposta para CLAUDE.md se houver. Nao commitar.
```
