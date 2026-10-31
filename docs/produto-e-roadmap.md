# Hotel Engine — produto final e roadmap

Camada: Conhecimento (ver `docs/harness.md`). Este arquivo descreve ONDE o projeto vai e EM QUE ORDEM.
Cada epico vira uma ou mais tarefas do Claude Code, sempre com `desenvolver-feature`, `revisor` e handoff.
Nenhum epico comeca com decisao pendente em aberto; decisoes vao para `CLAUDE.md` > Decisoes.

Status: rascunho de 2026-10-30, inferido do codigo atual e da conversa de setup. [INFERIDO] marca o que o humano precisa confirmar.

---

## 1. Visao do produto final

**Hotel Engine** e um motor de reservas white-label para pequenas hospedagens (pousadas, residenciais, hoteis de ate ~30 unidades).
Cada hospedagem e um **tenant** com:

- **Site publico proprio** (marca, textos, fotos, contato, dominio ou subdominio), com busca de disponibilidade, pedido de reserva e cancelamento por link.
- **Painel do anfitriao**: reservas em tempo real (aprovar, recusar, cancelar), quartos, bloqueio de datas, galeria, configuracoes do site.
- **Regras de integridade no Postgres**: sem overbooking (`no_double_booking`), disponibilidade e preco calculados no servidor, RLS isolando cada tenant.
- **Operacao segura por agentes**: todo o desenvolvimento passa pelo harness (hooks, rules, skills, revisor, tenant-auditor).

Modelo de negocio [INFERIDO]: SaaS por tenant, ou instancia por cliente. A escolha muda o epico 5. Decidir antes dele.

Referencia visual: `docs/design/README.md` (8 pranchas, tema escuro, 2026-10-30).

### O que ja existe (v0, single-tenant)
Next.js 14 App Router + Supabase. Site publico, reserva com aprovacao manual, cancelamento por token, painel com realtime, galeria.
Identidade do anfitriao ja vem de env (`lib/site-config.ts`). Marca, textos geograficos, imagens e dominio ainda hardcoded (ver `docs/analysis/03`).

### Decisoes que bloqueiam epicos (abrir em `00-perguntas-em-aberto.md` se ainda nao estiverem)
| Decisao | Bloqueia | Opcoes |
|---|---|---|
| Moeda e formatacao | E1, E4 | so BRL / por tenant |
| Modelo de tenant | E2 | tabela `tenants` + `tenant_id` em tudo (recomendado) / schema por tenant / projeto Supabase por cliente |
| Roteamento | E3 | subdominio `slug.hotelengine.app` / dominio proprio / ambos |
| Pagamento | E4 | nenhum (reserva sob aprovacao, como hoje) / sinal via gateway / integral |
| Prod Free vs Pro | E6 | Free pausa em 7 dias e nao tem backup |
| SaaS ou instancia por cliente | E5 | define billing e onboarding |

---

## 2. Roadmap em epicos

Ordem obrigatoria: E0 -> E1 -> E2 -> E3. E4, E5 e E6 podem intercalar depois de E2.

### E0 — Hardening (antes de qualquer feature)
Objetivo: eliminar risco conhecido e fechar o ciclo do agente.
- Upgrade `next` (14 -> 15/16, com React 19) e `zod` (3 -> 4), em PRs separados. P1 ja registrado no harness.
- ESLint configurado (`npm run lint` nao interativo).
- Hook de `Stop` com typecheck; allowlist de leitura; opcional: commit gate exigindo veredito do revisor.
- Opcao (b) de testes reavaliada: vitest sobre `is_range_available`, `get_occupied_dates`, `no_double_booking` e rotas de reserva, contra o projeto dev.
Pronto quando: `npm audit` sem high/critical em dependencias diretas; `/verificar` roda lint; `test-hooks` verde com os casos novos; decisao de testes registrada.

### E1 — Configuracao do site por tenant (desacoplar o cliente anterior)
Objetivo: nenhum texto, marca, imagem, contato ou dominio hardcoded; tudo vem de uma tabela `site_settings` (ou `tenants`, se E2 ja estiver decidido) editavel no painel.
- Migracao: `site_settings` (nome, slogan, descricao, endereco, contatos, redes, dominio, logo/imagens em storage, moeda, fuso).
- Seed sintetico "Hotel Engine Demo".
- Painel: tela "Configuracoes do site" (Server Component + form), com `requireAdmin()`.
- Site publico le `site_settings` com cache e `revalidate`; metadata/JSON-LD dinamicos.
- Remocao dos arquivos de verificacao Google e imagens do cliente anterior (`varrer-acoplamento` com grep zero).
- Pranchas: Painel-Config, Main.
Pronto quando: grep do inventario de `docs/analysis/03` retorna zero em `app/`, `components/`, `lib/`, `public/`; site renderiza com o seed demo; revisor APROVADO; `tenant-auditor` nao se aplica ainda.

### E2 — Multi-tenant no dado
Objetivo: varios tenants no mesmo banco, isolados por RLS.
- Tabela `tenants`; `tenant_id` em `rooms`, `bookings`, `blocked_dates`, `gallery_photos`, `site_settings`; `admins` passa a (tenant_id, user_id, role).
- Funcao `current_tenant_id()` (via claim no JWT ou via `admins`), policies reescritas com predicado de tenant, `is_admin()` recebe tenant.
- `no_double_booking` e `is_range_available` por (tenant_id, room_id).
- Storage: path `tenants/<id>/...` e policies por tenant. Realtime: filtro por `tenant_id`.
- Rotas: toda consulta com service role leva `tenant_id` explicito; IDOR checado.
Pronto quando: `tenant-auditor` sem critica/alta; teste cruzado (admin A tentando id de B) falha em select/update/realtime/storage; `types/database.ts` atualizado; migracao reversivel aplicada no dev pelo humano.

### E3 — Roteamento e tema por tenant
Objetivo: cada tenant acessado pelo proprio endereco.
- `middleware.ts` resolve tenant por host (subdominio ou dominio custom) e injeta no request.
- Tema (cores, fontes) em `site_settings`, aplicado via tokens Tailwind/CSS vars.
- Cache por tenant (tags), sitemap/robots por tenant.
- Pranchas: Main com tema por tenant.
Pronto quando: dois tenants de seed respondem em hosts diferentes no dev (hosts locais), sem vazamento de cache; `tenant-auditor` APROVADO.

### E4 — Reserva completa
Objetivo: fluxo de reserva pronto para hospede real.
- Politica de cancelamento por tenant (janela, taxa); e-mail/WhatsApp de confirmacao e lembrete (provedor a decidir, chaves so em env).
- Pagamento conforme decisao (nenhum / sinal / integral); se gateway, webhook idempotente e estados em Postgres.
- Calendario do painel com arrastar/bloquear; exportacao iCal.
- Pranchas: Site-Reserva, Site-MinhaReserva, Painel-Reservas.
Pronto quando: `/smoke-test` completo (reservar, aprovar, cancelar, pagar se houver) no dev; nenhum dado de hospede em log; revisor APROVADO.

### E5 — Onboarding e operacao do tenant
Objetivo: criar um hotel novo sem SQL.
- Fluxo "novo tenant": cria `tenants`, `site_settings`, primeiro admin, quartos iniciais.
- Convite de admin por e-mail; papeis (owner, staff).
- Billing (se SaaS): plano, status, bloqueio gracioso.
- Pranchas: Painel-Config (secoes Equipe e Plano).
Pronto quando: um tenant criado pelo painel aparece no host dele em menos de 10 minutos sem intervencao tecnica.

### E6 — Producao
Objetivo: operar com seguranca.
- Prod no plano com backup e sem pausa; variaveis so na Vercel; checklist de deploy (`/deploy-checklist`).
- Observabilidade: logs estruturados sem PII, alertas basicos, pagina de status interna.
- Historico git limpo antes de repo publico; rename `hotel-engine` no repo, package, Vercel.
Pronto quando: deploy feito pelo humano seguindo o checklist; `/smoke-test` contra prod; decisoes de E6 fechadas.

---

## 3. Prompt-mestre de planejamento (rodar UMA vez, Plan mode)

Este prompt nao constroi nada. Ele transforma este arquivo em tarefas executaveis e aponta o que falta decidir.

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

Depois do relato, o humano: registra decisoes, aprova a ordem, e cada tarefa vira um prompt com o modelo da secao 4.

---

## 4. Modelo de prompt por tarefa (os sete blocos)

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

## 5. Prompt completo da primeira tarefa de E1 (exemplo pronto)

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