# Projeto: motor de hotelaria (Next.js + Supabase)

## 1. Visao geral
Site publico + motor de pre-reservas + painel admin (PWA) construidos originalmente para uma
unica pousada de 6 unidades. O hospede escolhe acomodacao e datas, envia uma pre-reserva
(sem pagamento), o dono aprova em 1 clique no painel e a confirmacao vai por WhatsApp.
O banco impede overbooking por constraint.

**Objetivo**: transformar isso em produto multi-tenant (tenant -> propriedades -> quartos),
comercializavel para varios hoteis. Sou o proprietario do codigo. O banco original foi
perdido; o dev foi recriado em 2026-10-29 (ver §9).

**Estado (2026-11-01)**: fundacao (harness, hooks, ambiente dev, fontes locais, push e PR pelo agente)
concluida; M1 (configuracao do hotel por tenant) aceito; M4-02 (busca de disponibilidade) mergeado na
`develop`. Ainda sem testes automatizados; CI (typecheck, lint, test-hooks) em preparo no M0-18.
Ambiente de desenvolvimento e projeto Supabase dev: ver §9. Ainda NAO estamos fazendo multi-tenancy
(M2). Progresso e proxima entrega: `docs/milestones.md`. Diagnostico completo em `docs/analysis/` — leia
`00-perguntas-em-aberto.md` antes de propor arquitetura; `01-diagnostico-execucao.md` §8 e
o plano de reanimacao.

## 2. Stack (verificada no codigo, nao presumida)
```
Frontend:        Next.js 14.2 App Router, React 18.3, TypeScript 5 strict, Tailwind 3.4,
                 react-day-picker 8, date-fns 3, class-variance-authority
Backend:         rotas app/api/**/route.ts (Node runtime), validacao zod 3
Database:        Supabase Postgres com RLS, funcoes SQL (security definer), constraint GiST
Authentication:  Supabase Auth e-mail/senha via @supabase/ssr 0.5 (cookies) + tabela admins
Storage/Realtime: Supabase Storage (bucket "rooms"), Supabase Realtime (tabela bookings)
Infrastructure:  nenhuma (sem Docker, compose, IaC)
Testing:         nenhum framework; 0 testes
CI/CD:           nenhum ativo; GitHub Actions (typecheck, lint, test-hooks) em preparo no M0-18; deploy so pela Vercel (previews)
Hosting:         previews na Vercel (por branch e por PR) + Supabase dev na nuvem; producao vazia ate o M6-01
External:        WhatsApp via links wa.me (sem API), Google Maps iframe; fontes locais (next/font/local, sem Google Fonts)
Package manager: npm, com package-lock.json versionado. Node >= 18.17 em `engines` hoje (local: Node 26 — [INCERTO] compat. Next 14); Node 22 LTS entra em `engines` quando o upgrade de dependencias (M0-11) autorizar
```
`lucide-react` esta em `package.json` mas nao e usado.

## 3. Arquitetura
```
app/(public)/page.tsx + components/public/*   site publico; modal de pre-reserva (BookingForm)
app/(admin)/admin/* + components/admin/*       painel: reservas (Realtime), calendario, quartos, momentos
app/login, middleware.ts, lib/require-admin.ts sessao Supabase + exige linha em `admins`
app/cancelar/[id] + app/api/cancel             autocancelamento do hospede por token
app/api/{rooms,calendar,bookings}              publicas: listar, datas ocupadas, criar pre-reserva
app/api/admin/{approve,reject,cancel,block-date} exigem requireAdmin()
lib/supabase/client.ts                         browser, anon (RLS)
lib/supabase/server.ts                         SSR/rotas, anon + cookies (RLS)
lib/supabase/admin.ts                          service role, server-only (ignora RLS)
supabase/schema.sql -> migration-cancelamento.sql -> migration-momentos.sql  ordem de aplicacao
types/database.ts                              tipos manuais (nao gerados)
public/sw.js, public/manifest*.json            PWA
```
Fluxo de dados: `BookingForm` -> `GET /api/calendar` (rpc `get_occupied_dates`) ->
`POST /api/bookings` (service role: valida, `is_range_available`, preco no servidor, insert
`pending`) -> Realtime no painel -> `POST /api/admin/approve` (update com guarda
`status=pending`; constraint `no_double_booking` -> 23P01 -> 409) -> WhatsApp.

Decisoes arquiteturais em vigor (herdadas): regras de disponibilidade/overbooking vivem no
Postgres; preco nunca vem do cliente; nenhuma policy de insert publico em `bookings`;
pendentes nao bloqueiam datas. Detalhes e diagramas: `docs/analysis/02-arquitetura.md`.

## 4. Desenvolvimento (dev operacional desde 2026-10-29)
- Instalar: `npm ci` (instala do `package-lock.json` versionado; `npm install` pede confirmacao). Instalar ou atualizar dependencia so
  com aprovacao explicita do humano, em PR proprio (harness, eixo 4). Para o Hermes a proibicao e
  absoluta (`.hermes.md`).
- Configurar: `.env.local` com `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_OWNER_WHATSAPP`,
  `NEXT_PUBLIC_OWNER_NAME` (opcional; sem ela os textos dizem "o proprietario")
  (nomes apenas; valores sao criados pelo proprietario e apontam para o projeto Supabase **dev**
  na nuvem, ver §9). Banco: o humano aplica os 3 SQL na ordem acima no projeto dev (SQL Editor
  ou `supabase db push`), seguidos dos arquivos de `supabase/migrations/` em ordem de nome
  (hoje `site_settings`, `site_storage`, `booking_policy`), + cria admin (Auth + `insert into admins`). Nao usamos Supabase local
  (decisao de 2026-10-29); plano em `docs/analysis/01-diagnostico-execucao.md` §8.
- Rodar: `npm run dev` (porta 3000). Build: `npm run build` (exige Supabase acessivel; fontes
  sao locais, sem internet externa). Deploy: nenhum automatizado.

## 5. Comandos
Scripts de `package.json` (fonte unica; esta lista deve ser identica ao `scripts` de la):
- `npm run dev` — servidor de desenvolvimento na porta 3000; exige `.env.local` apontando para o Supabase dev.
- `npm run build` — build de producao; exige Supabase dev acessivel (sem Google Fonts: fontes locais em `app/fonts/`).
- `npm run start` — serve o build gerado por `npm run build`.
- `npm run lint` — `eslint .` com config flat (`eslint.config.mjs`, next/core-web-vitals); nao interativo.
- `npm run typecheck` — `tsc --noEmit`; nao emite arquivos.

Nao existem: `test`, `test:smoke`, `format`, nem Supabase CLI configurado no repo. Nao inventar.
Comandos do Claude Code (`.claude/commands/`, nao sao scripts npm): `/proxima`, `/verificar`, `/nova-migracao`,
`/smoke-test`, `/varrer-acoplamento`; descritos em `docs/claude-code/README.md`.

## 6. Regras de desenvolvimento
Toda sessao de trabalho comeca por `/proxima` (le `docs/milestones.md`, Estado atual, e propoe a proxima tarefa) e termina atualizando `docs/milestones.md`.
Antes de qualquer tarefa, ler o "Resumo em 12 linhas" de `docs/harness.md`.

Proibicoes absolutas (resumo; detalhe no harness eixo 4, nas rules de `.claude/rules/` e nos hooks):
- Nunca push para `main`/`develop`, nunca `--force`, `git reset --hard` ou `--no-verify`. Push so como `git push [-u] origin <branch-de-trabalho>`; `gh pr create` (base `develop`) liberado; `gh pr merge` e merge em geral sao do humano.
- Nunca `supabase db push`, `migration up --linked`, `psql` remoto, `vercel --prod` ou qualquer deploy; migracao e aplicada pelo humano.
- Nunca ler `.env*` alem do `.env.example`; nunca imprimir chaves ou tokens; nunca service role no cliente.
- Nunca editar `supabase/schema.sql` nem os `migration-*.sql` historicos; nunca policy `using (true)` nem desligar RLS.
- Nunca dados reais de hospede, dados de cartao ou textos/telefones/links do cliente anterior.

Inegociaveis:
- Precedencia, poderes e aprovacoes: ver docs/harness.md (secao 0 e eixo 4).
- Nunca ler, imprimir ou registrar valores de `.env*`, chaves ou tokens. Somente nomes.
- Nunca usar a service role key em codigo que roda no cliente.
- Nunca tocar em banco de producao ou deploy de producao. Somente local/desenvolvimento.
- Dados de teste sempre sinteticos. Nunca dados reais de hospedes.
- Nao armazenar dados de cartao. Pagamento so via tokenizacao do provedor.
- Todo acesso a dados novo deve considerar escopo por tenant (a partir da fase multi-tenant).
- Nao adicionar textos, telefones, nomes ou links do cliente anterior; o que ja existe esta
  inventariado em `docs/analysis/03-acoplamento-ao-cliente-atual.md`.

Forma de trabalho:
- Planejar antes de implementar (Plan mode). Um objetivo por entrega e por PR; uma entrega pode ter
  varias sessoes. Commits nao geram docs. Validacoes por tipo de mudanca: matriz em
  `docs/milestones.md` (Protocolo v3).
- Upgrades grandes de framework ficam separados de qualquer mudanca funcional.
- Commits pequenos (`feat:`, `fix:`, `chore:`, `docs:`, `db:`). Nunca push em main/develop, force ou reset --hard.
- Mudancas de banco sempre via `/nova-migracao`, revisadas por mim. Os `supabase/*.sql`
  atuais sao snapshot historico: nao editar.
- Por entrega que toque rotas, acesso a dados, middleware, SQL, RLS, service role, hook ou settings:
  agente `revisor` antes do push. Na fase multi-tenant: tambem `tenant-auditor`.
- Nao presumir: marcar [INCERTO] ou [INFERIDO]. Relatar sempre o que NAO foi verificado.
- Regras detalhadas por area em `.claude/rules/` (carregadas por caminho). Skills de fluxo
  em `.claude/skills/`. Tudo explicado em `docs/claude-code/README.md`.

## 7. Testes
- Framework: nenhum. Localizacao: nenhuma. Cobertura: 0%.
- Antes de considerar uma alteracao concluida: `/verificar`; teste manual descrito no relato;
  para fluxo de reserva, `/smoke-test` (quando o ambiente local existir).
- Runner (vitest/playwright): a decisao D0 sera reavaliada em M4-10 e a dependencia so entra com aprovacao. Enquanto isso, GitHub Actions (M0-18) roda typecheck, lint e `node scripts/test-hooks.js` nos PRs para `develop` e `main`; nao ha job de teste de aplicacao.

## 8. Seguranca
- Secrets: so via env vars; `SUPABASE_SERVICE_ROLE_KEY` lida unicamente em `lib/supabase/admin.ts`
  (`server-only`). Hook `post-edit.js` bloqueia violacoes.
- Autenticacao: Supabase Auth; `middleware.ts` protege `/admin`; autorizacao = existir em `admins`
  (`admins.role` nao e usado).
- RLS ligada em todas as tabelas; `is_admin()` security definer; publico so le `rooms.active`
  e `gallery_photos.active`. Toda tabela nova: RLS + policies explicitas na mesma migracao.
- Input: zod em todas as rotas; preco/noites/status recalculados no servidor; mudancas de
  status com guarda do estado atual no `where`.
- Dados sensiveis: `guest_name`, `guest_phone`, `guest_email`, `cancel_token` nunca em logs.
  Dividas conhecidas (conferidas no codigo em 2026-11-01; o M1-07 cobriu politicas no banco e nao
  fechou nenhuma destas): `sw.js` cacheia HTML de `/admin` (M1-12); `app/api/admin/reject` sem guarda
  de estado no `where` (M2-09/M4-06 [INFERIDO]: sem tarefa propria ainda); `approve` devolve 500
  para "nao pendente" (`.single()` sem linha); `/api/bookings` calcula datas com o fuso do servidor
  (M2-09; `/api/availability` ja usa o fuso do hotel). Sem limite de requisicoes nas rotas publicas
  e sem cabecalhos de seguranca alem do de `sw.js` (M6-07, M6-08; `docs/producao-checklist.md`).
- Hook `validate-bash.js` bloqueia leitura de `.env*`, git destrutivo/remoto, Supabase/Vercel remotos.

## 9. Ambientes e deploy
| Ambiente | Projeto Supabase | Plano | Quem usa | Onde ficam as variaveis |
|---|---|---|---|---|
| dev | hotel-engine-dev (South America / Sao Paulo, sa-east-1) | Free (pausa apos 7 dias sem uso; restaurar no dashboard antes de trabalhar, incluindo `build`/`smoke-test`) | desenvolvimento local, Claude Code, aplicacao de migracoes de teste | `.env.local` (criado pelo humano; o agente nunca le o conteudo) |
| prod | inexistente ate o M6-01 (criado pelo humano; nome a definir: [PREENCHER]) | Free por D5, com keep-alive (M6-01a) e dump semanal (M6-01b) | producao | somente nas variaveis de ambiente do projeto na Vercel; nunca em `.env.local` nem no repositorio |

- Hospedagem: Vercel, plano Hobby, ligada ao GitHub: preview automatico por branch e por PR. Projeto atual: [PREENCHER nome do projeto Vercel anterior], que sera substituido pelo projeto novo `hotel-engine` (a criar pelo humano, so com Preview e sem Production; M0-14), com Production Branch = `main` (congelada ate o M6). CI de PR: GitHub Actions (M0-18), sem secrets e sem deploy. O deploy de producao de 11 de julho (v1.0, codigo original, `main`) foi tirado do acesso publico em 2026-10-31 com Deployment Protection "All Deployments"; os deploys antigos continuam na Vercel.
- Migracoes: Claude escreve o arquivo em `supabase/migrations/`; o humano aplica no dev, testa pela
  interface e so depois aplica no prod (fora de horario de reserva). Deploy na Vercel e feito pelo
  humano. Os 5 passos do caminho para producao estao no harness (eixo 3).
- O agente nunca executa deploy, `db push`, `vercel --prod` ou qualquer comando contra prod; os hooks
  bloqueiam. Qualquer alteracao nesse arranjo e decisao a registrar abaixo.
- Observabilidade: a aplicacao nao emite logs proprios (nenhum `console.*`, nenhum Sentry ou similar).
  O que existe sao os logs das plataformas: dashboard Supabase (API, Postgres, Auth) e logs de funcao
  da Vercel. Acesso aos dashboards Supabase e Vercel: [quem tem acesso, ex.: "proprietario (d.paes)"].
  Retencao de logs: [INCERTO] ate conferir no dashboard. Como chegam ao `investigar-bug`: o humano
  cola trechos com dados de hospede mascarados (passo 8 da skill); o agente nunca acessa os dashboards.

## 10. Arquivos importantes (ler antes de alteracoes significativas)
`supabase/schema.sql` (regras no banco) · `app/api/bookings/route.ts` (criacao e preco) ·
`app/api/admin/approve/route.ts` (409 por constraint) · `lib/supabase/*.ts` e
`lib/require-admin.ts` (privilegios) · `middleware.ts` · `types/database.ts` ·
`components/public/BookingForm.tsx` e `components/admin/BookingCard.tsx` (fluxo + WhatsApp) ·
`docs/analysis/*` · `.claude/rules/*`.

## Decisoes
(registrar aqui, uma linha por decisao, com data)
- 2026-10-29: estrutura do Claude Code (rules, commands, skills, agents, hooks) e diagnostico em
  `docs/analysis/` criados; nenhuma decisao de arquitetura tomada ainda — pendencias em
  `docs/analysis/00-perguntas-em-aberto.md`.
- 2026-10-29: nao usamos Supabase local. Desenvolvimento e feito direto num projeto Supabase na
  nuvem de desenvolvimento ("dev"), separado do projeto de producao. O `.env.local` aponta para o dev.
- 2026-10-29: migracoes — Claude escreve o arquivo em `supabase/migrations/` (com reversao) e
  atualiza `types/database.ts`. Quem aplica e o humano (`supabase db push` ou SQL Editor), que
  confirma de volta. Claude nunca roda `db push`, `migration up --linked` ou `psql` remoto; os
  hooks continuam bloqueando isso.
- 2026-10-29: Claude nao consulta o banco diretamente. Investigacao usa logs do dashboard (colados
  pelo humano), respostas das rotas e leitura das policies no repositorio.
- 2026-10-29: Hermes atua como memoria/orquestrador; toda mudanca passa pelo Claude Code.
- 2026-10-29: Sem testes automatizados por ora; toda mudanca no fluxo de reserva exige `/smoke-test`
  descrito no relato. Reavaliar a opcao (b) (vitest sobre funcoes SQL de disponibilidade e rotas de
  reserva) antes da primeira reserva real ou ao iniciar a fase multi-tenant, o que vier primeiro.
- 2026-10-29: Nenhum deploy publico antes do upgrade de next/zod registrado em docs/harness.md.
- 2026-10-30: identidade do anfitriao (nome e WhatsApp) vem so de NEXT_PUBLIC_OWNER_NAME / NEXT_PUBLIC_OWNER_WHATSAPP via lib/site-config.ts; nenhum fallback com dado real no codigo.
- 2026-10-30: moeda unica BRL ate a fase multi-tenant (D1).
- 2026-10-30: modelo de tenant = tabela tenants + tenant_id em todas as tabelas de dominio + RLS por tenant (D2).
- 2026-10-31: Claude Code pode commitar localmente sem confirmacao; push, deploy, migracao e dependencias seguem humanos. Commit traz o veredito do revisor quando a tarefa exigir.
- 2026-10-31: develop e a branch de integracao (protegida; PRs do agente apontam para ela); main congelada ate o M6 e protegida; merges sao humanos. Branches de trabalho saem de develop, um objetivo por branch.
- 2026-10-31: politica de modelo: Claude Code em Sonnet/Fable para rotas, SQL, RLS, revisor, hooks e upgrades.
- 2026-10-31: a maquina do agente nunca guarda segredo de producao; .env.local contem apenas chaves do hotel-engine-dev, descartaveis. O hook de .env e defesa contra erro, nao contra ma-fe.
- 2026-10-31: o deploy de producao do v1.0 (codigo original, main) estava publico em [URL Vercel anterior] sem uso real; foi protegido com Deployment Protection "All Deployments" (reversivel). Production Branch segue `main`, congelada ate o M6.
- 2026-10-31: seed de exemplo do schema.sql trocado por dados sinteticos para publicacao; logica SQL inalterada
- 2026-10-31: historico do git recomecado em um unico commit (eeb1f07) para publicacao; o historico anterior ficou arquivado em privado. Hashes de commits citados em docs anteriores nao existem mais neste repositorio.
- 2026-10-31: protecao remota de `develop` e `main` ativa (rulesets no GitHub; push direto recusado com GH013, testado pelo proprietario em 2026-10-31). E a barreira real do push; o hook `validate-bash.js` e defesa em profundidade.
- 2026-10-31: agente pode `git push [-u] origin <branch-de-trabalho>` e `gh pr create` (base `develop`, texto via `--body-file`); merge, push em main/develop e demais `gh` seguem humanos (M0-16, PR #2 mergeado em 2026-11-01).
- 2026-11-01: D3 roteamento: subdominio primeiro; dominio proprio do tenant em M3-05.
- 2026-11-01: D4 pagamento: reserva sob aprovacao ate M4-03; depois sinal via Pix; cartao depois.
- 2026-11-01: D5 producao no plano Free com mitigacoes: keep-alive (M6-01a) e dump semanal com teste de restauracao (M6-01b).
- 2026-11-01: D6 SaaS multi-tenant em um unico deploy (nao ha instancia por cliente).
- 2026-11-01: D7 gateway de pagamento decidido em M4-03; padrao Mercado Pago, alternativa Asaas.
- 2026-11-01: D8 e-mail via Resend em M4-01; WhatsApp manual via wa.me ate o M5.
- 2026-11-01: tarifacao = base por noite por tipo de quarto + modificadores por periodo, calculados no Postgres; sem preco por pessoa.
- 2026-11-01: papeis owner/recepcao/limpeza aplicados por RLS (M2-08).
- 2026-11-01: runtime Node 22 LTS fixado em `engines`; Next 15 depois do M0-11.
- 2026-11-01: M1-10 resolvido: Momentos vira "Galeria do hotel", generica por tenant.
- 2026-11-01: edicao de docs em lote por awk/sed e proibida ao agente; usar Edit por trecho e conferir `git diff --stat` (uma substituicao em lote apagou blocos do milestones.md sem erro visivel).
- 2026-11-01: modelos locais removidos do projeto e do harness; Claude Code somente em Sonnet/Fable; D9 revogada
