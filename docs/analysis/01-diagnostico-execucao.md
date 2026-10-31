# 01 — Diagnóstico de execução: por que o sistema não roda

> Gerado em 2026-10-29 a partir de leitura integral do repositório (88 arquivos) e do histórico git.
> Nada foi instalado nem executado. Itens marcados **[VERIFICADO]** foram lidos no código;
> **[INFERIDO]** são deduções; **[INCERTO]** exigem resposta do proprietário (ver `00-perguntas-em-aberto.md`).

## 1. Stack identificada

| Camada | Tecnologia | Versão declarada | Fonte |
|---|---|---|---|
| Framework web | Next.js (App Router) | `^14.2.15` | `package.json` |
| UI | React / React DOM | `^18.3.1` | `package.json` |
| Linguagem | TypeScript (strict, target ES2017) | `^5` | `tsconfig.json` |
| Estilo | Tailwind CSS + PostCSS + autoprefixer | `^3.4.13` | `tailwind.config.ts`, `postcss.config.mjs` |
| Componentes | class-variance-authority, clsx, tailwind-merge, react-day-picker `^8.10.1`, date-fns `^3.6.0` | — | `package.json` |
| Validação | zod | `^3.23.8` | rotas em `app/api/**` |
| BaaS | Supabase: Postgres (RLS, RPC, GiST), Auth (e-mail/senha), Storage (bucket `rooms`), Realtime | `@supabase/ssr ^0.5.2`, `@supabase/supabase-js ^2.45.4` | `lib/supabase/*`, `supabase/*.sql` |
| Isolamento servidor | `server-only` | `^0.0.1` | `lib/supabase/admin.ts`, `lib/require-admin.ts` |
| Gerenciador de pacotes | npm (scripts `dev`, `build`, `start`, `lint`) | — | `package.json` |
| Runtime exigido | Node `>=18.17.0` (engines de `next@14.2.35`) | — | registro npm |
| Runtime local encontrado | Node v26.1.0, npm 11.13.0; `pnpm`, `docker`, `supabase`, `gh` ausentes | — | `node -v` etc. |
| Deploy previsto | Vercel (hobby) + Supabase cloud (free tier) | — | `README.md` |

**[VERIFICADO]** `lucide-react` está declarado mas não é importado em nenhum arquivo.

## 2. Dependências: situação por criticidade

| Criticidade | Pacote | Declarado → resolve hoje | Situação |
|---|---|---|---|
| **Alta** | `next` | `^14.2.15` → 14.2.35 | 14.2.15 está marcado *deprecated por vulnerabilidade* no registro npm (aviso remete ao boletim de segurança de 2025-12-11). O caret já puxa 14.2.35 (última da linha 14). Linha atual é 16.x; upgrade é fase posterior. |
| **Alta** | lockfile | ausente | Sem `package-lock.json`: instalação não reprodutível, auditoria de vulnerabilidades impossível antes de instalar. |
| Média | `eslint` | `^8` → 8.57.1 | Deprecated/EOL. Não há `.eslintrc*`; `next lint` abre assistente interativo na 1ª execução. |
| Média | `eslint-config-next` | `^14.2.15` → 14.2.35 | Acompanha o Next. |
| Média | `@supabase/ssr` | `^0.5.2` (latest 0.12.7) | A API `getAll/setAll` usada é a atual. Upgrade provável sem quebra, mas fica para depois. |
| Média | `@supabase/supabase-js` | `^2.45.4` → 2.118.x | Compatível; peer de `@supabase/ssr@0.5.2` é `^2.43.4`. |
| Baixa | `react-day-picker` | `^8.10.1` → 8.10.2 (latest 10.x) | v9+ quebra API (`fromDate`/`toDate`). Manter v8 na reanimação. |
| Baixa | `date-fns` | `^3.6.0` (latest 4.x) | OK; peer do day-picker v8 exige `^3`. |
| Baixa | `zod` | `^3.23.8` → 3.25.x (latest 4.x) | OK. |
| Baixa | `tailwindcss` | `^3.4.13` → 3.4.19 (latest 4.x) | OK. |
| Baixa | `typescript` | `^5` → 5.9.3 (latest 7.x) | OK. |
| Limpeza | `lucide-react` | `^0.446.0` | Não usado. |
| **[INCERTO]** | Node 26 × Next 14.2 | — | `engines` só exige >=18.17; Next 14 não foi validado em Node 26. |

Incompatibilidades entre si: **nenhuma encontrada [VERIFICADO nos peerDependencies]**.

## 3. O que falta para subir localmente

### 3.1 Variáveis de ambiente (nomes e propósito; valores nunca)

| Nome | Onde é lida | Propósito |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/{client,server,admin}.ts`, `middleware.ts` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/{client,server}.ts`, `middleware.ts` | Chave anônima (RLS aplicada) |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase/admin.ts` (com `server-only`) | Ignora RLS; usada em `app/api/bookings`, `app/api/cancel`, `app/api/admin/*`, `app/cancelar/[id]/page.tsx` |
| `NEXT_PUBLIC_SITE_URL` | `app/layout.tsx:13`, `app/robots.ts:4`, `app/sitemap.ts:4`, `components/admin/BookingCard.tsx:33` | Base de metadata, sitemap e link de cancelamento. **Fallback hardcoded = domínio do cliente anterior.** |
| `NEXT_PUBLIC_OWNER_WHATSAPP` | `components/public/{BookingForm,Footer,WhatsAppFloat}.tsx`, `app/cancelar/[id]/CancelClient.tsx` | Número para links `wa.me`. Sem fallback desde 2026-10-30: lido em `lib/site-config.ts`; sem a variável, os links de WhatsApp do anfitrião não são renderizados (ver doc 03 §11). |

**[INCERTO]** O arquivo `.env.example` existe (447 bytes), mas sua leitura foi bloqueada pela política do ambiente. Uma varredura por padrão (sem exibir conteúdo) indica que a linha 9 contém um valor com formato de telefone. Tratar como possível dado pessoal até o proprietário confirmar.

Todos os acessos usam `process.env.X!` (non-null assertion): sem `.env.local`, o cliente Supabase recebe `undefined` e lança erro em tempo de execução. **[INFERIDO]** Como a home (`app/(public)/page.tsx`, `revalidate = 60`) e `/api/rooms` são pré-renderizadas, `next build` falha sem um Supabase acessível.

### 3.2 Banco de dados: schema, migrações, seeds

- **[VERIFICADO]** Não há projeto Supabase CLI (`supabase/config.toml` ausente) nem pasta `supabase/migrations/`. Há 3 scripts para colar manualmente no SQL Editor, em **ordem obrigatória**:
  1. `supabase/schema.sql` — extensão `btree_gist`, tabelas `rooms`, `bookings`, `blocked_dates`, `admins`, funções `is_admin`, `get_occupied_dates`, `is_range_available`, `touch_updated_at`, RLS, publicação Realtime, bucket `rooms` + policies, **seed com 3 quartos reais do cliente** (linhas 196-212).
  2. `supabase/migration-cancelamento.sql` — colunas `cancel_reason`, `cancelled_by`, `cancelled_at`, `cancel_token` em `bookings`.
  3. `supabase/migration-momentos.sql` — tabela `gallery_photos` + RLS.
- O código **exige as três** aplicadas: `types/database.ts` e `app/api/cancel` usam `cancel_token`; `app/(public)/page.tsx` consulta `gallery_photos`.
- Seeds: só o de quartos (dados do cliente, a substituir por sintéticos). Admin é criado à mão: usuário em Auth + `insert into admins` (`README.md:23-30`, `schema.sql:214-217`).

### 3.3 Serviços auxiliares

| Serviço | Necessário? | Observação |
|---|---|---|
| Postgres + GoTrue (Auth) + Storage + Realtime | **Sim** (tudo via Supabase) | Fornecidos pelo projeto Supabase **dev** na nuvem (decisão de 2026-10-29: sem Supabase CLI local/Docker). |
| Fila, cache, e-mail, SMS | Não existem | Nenhuma notificação automática; tudo via link manual do WhatsApp. |

## 4. Integrações externas

| Integração | Depende de conta do cliente anterior? | Serviço ainda existe? | Mock/desligar em local |
|---|---|---|---|
| Supabase (Auth/DB/Storage/Realtime) | Sim — o projeto original foi perdido (`CLAUDE.md`) | O serviço sim; o projeto não | Substituir por Supabase CLI local. Não é mock: é o mesmo stack em Docker. |
| WhatsApp | Não (apenas links `https://wa.me/<número>?text=`; sem API, sem credencial) | Sim | Basta `NEXT_PUBLIC_OWNER_WHATSAPP` fictício. |
| Google Fonts (`next/font/google`, `app/layout.tsx:5-11`) | Não | Sim | Exige internet no `build`. Fallback para fontes locais = fase posterior. |
| Google Maps embed (`components/public/Distances.tsx:29,38`) | Não (iframe público, sem key) | Sim | Inofensivo offline. |
| Google Search Console (`public/google7ba4df3e37ceb4f9.html`) | **Sim** (conta do cliente) | — | Remover na fase de desacoplamento. |
| Instagram (`components/public/Footer.tsx:36-39`) | Link estático | — | — |
| Pagamento (PSP), e-mail, SMS, PMS, channel manager, OTA | **Inexistentes** | — | — |

## 5. Infra e deploy

| Artefato | Existe? | Estado |
|---|---|---|
| `Dockerfile` / `docker-compose.yml` | Não | — |
| CI/CD (`.github/`, outros) | Não | — |
| IaC | Não | — |
| `vercel.json` | Não | Deploy descrito só no `README.md` (import do repo + 5 env vars + domínio). |
| `supabase/config.toml` | Não | A pasta `supabase/` não é um projeto CLI. |
| `next.config.mjs` | Sim | `remotePatterns` para `**.supabase.co`; headers para `/sw.js`. |
| `public/sw.js` | Sim | Service worker que cacheia `/`, `/admin`, `/login` (ver §7). |

## 6. Testes

- **[VERIFICADO]** Nenhum arquivo de teste, nenhum runner (jest/vitest/playwright/cypress), nenhuma configuração. Cobertura: 0%.
- Único "teste" possível hoje: `npm run lint` (que não tem config) e `npm run typecheck` (`tsc --noEmit`; script adicionado em 2026-10-29).
- Não há como rodá-los antes de instalar dependências.

## 7. Observações de execução que afetam a reanimação

1. `app/api/bookings/route.ts:32-36` usa `new Date()` do servidor para "data já passou": em host UTC (Vercel) o resultado difere do Brasil em até 3 h.
2. `public/sw.js:18-34` cacheia qualquer GET fora de `/api` e Supabase, inclusive o HTML de `/admin` com dados de hóspedes. Risco de privacidade em dispositivo compartilhado (LGPD).
3. `app/api/admin/approve/route.ts:21-23`: se a reserva não está `pending`, `.single()` falha e a rota devolve 500 em vez de 404/409.
4. `app/api/admin/reject/route.ts` não restringe o status atual: pode "recusar" uma reserva aprovada sem preencher campos de auditoria.
5. `aggregateRating` fixo (4.8 / 100) em `app/layout.tsx:71`, `components/public/Hero.tsx:50`, `Testimonials.tsx:31-35`.
6. Não há criação de quarto por UI/API: `components/admin/RoomEditor.tsx` só edita quartos existentes. O smoke test precisa criar quarto via SQL/seed.

## 8. Plano ordenado de reanimação (mínimo necessário)

> Atualizado em 2026-10-29 conforme decisão registrada em `CLAUDE.md`: **não usamos Supabase local**. O desenvolvimento usa um projeto Supabase **dev** na nuvem (plano Free, separado do prod); o humano aplica as migrações (SQL Editor ou `supabase db push`) e confirma de volta. Os passos abaixo foram ajustados; o texto original falava em Supabase CLI + Docker.

Objetivo: app Next rodando localmente contra o projeto Supabase dev na nuvem, com dados sintéticos, e smoke test do fluxo principal. Esforço: **P** (horas), **M** (1 dia), **G** (vários dias).

| # | Passo | Esf. | Risco | Critério de pronto |
|---|---|---|---|---|
| 1 | Fixar runtime: `.nvmrc` + `engines` em Node 20 LTS (ou validar Node 26 e registrar a decisão) | P | Baixo | `node -v` documentado em `CLAUDE.md`; build passa nessa versão |
| 2 | Gerar lockfile (instalação com npm), que resolve `next@14.2.35`; remover `lucide-react` | P | Baixo | `package-lock.json` versionado; `npm ci` limpo; `npm audit` sem crítico |
| 3 | Banco no projeto dev: converter os 3 SQL em `supabase/migrations/<timestamp>_*.sql` na ordem (Claude escreve); **humano aplica no projeto dev** e confirma | P | Baixo (sem Docker nem CLI local; projeto Free pausa após 7 dias sem uso) | Tabelas, funções, policies e publicação Realtime existem no dev sem erro |
| 4 | Seed sintético: `supabase/seed.sql` com quartos fictícios (substitui `schema.sql:196-212`), aplicado pelo humano no dev; admin de teste criado pelo humano (Auth do dashboard + `insert into admins`) | P | Baixo | Login em `/login` com usuário fictício abre `/admin` |
| 5 | `.env.local` criado pelo humano com URL/anon key/service role do projeto **dev** (dashboard > API) e WhatsApp e SITE_URL fictícios; o agente nunca lê o conteúdo | P | Baixo | `npm run dev` serve `/` e `/admin` |
| 6 | `npm run build`; corrigir **apenas** o que impedir o build (TS, ESLint config mínima, fontes offline se necessário) | M | Médio | Build verde |
| 7 | ~~Containerizar o app~~ **Não se aplica** pela decisão de 2026-10-29: não há banco local para compor. Reavaliar só se a pergunta 15 do doc 00 for respondida de outra forma. | — | — | — |
| 8 | Smoke test scriptado (abaixo) e scripts npm `typecheck`, `test:smoke` | M | Baixo | Script passa fim a fim em ambiente limpo |
| 9 | **Fase posterior, separada**: Next 15/16, React 19, `@supabase/ssr` 0.12, ESLint 9+, react-day-picker 9+, Tailwind 4, zod 4 | G | Alto | Fora do escopo da reanimação |

### Smoke test do fluxo principal (definição)

1. **Criar quarto** — via `seed.sql` (não há API). Pronto: `GET /api/rooms` lista o quarto.
2. **Consultar disponibilidade** — `GET /api/calendar?room_id=&start=&end=` → `{ occupied: [] }`.
3. **Criar reserva** — `POST /api/bookings` → 200, `status=pending`, `total_price = nights × price_per_night`.
4. **Confirmar** — login admin (cookies de sessão Supabase) + `POST /api/admin/approve` → 200, `status=approved`.
5. **Verificar bloqueio** — `GET /api/calendar` mostra as datas; novo `POST /api/bookings` nas mesmas datas → 409.
6. **Cancelar** — `POST /api/cancel` com `booking_id` + `cancel_token` → 200; `GET /api/calendar` volta a vazio.

Regra do plano: atualizar o mínimo. Qualquer upgrade de framework/runtime vai para o passo 9.
