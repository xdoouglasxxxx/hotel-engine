# 03 — Inventário de acoplamento ao cliente atual

> Varredura completa do repositório e do histórico git em 2026-10-29.
> Convenção: **nenhum valor** de telefone, endereço, e-mail, token ou chave é transcrito; nomes de pessoas estão mascarados.
> Categorias: **(A)** configuração · **(B)** dado por tenant · **(C)** regra de negócio variável · **(D)** feature opcional · **(E)** segredo/credencial · **(F)** dado pessoal real.

## 1. Resumo quantitativo

| Categoria | Itens | Arquivos |
|---|---|---|
| (A) Configuração | 52 | 31 |
| (B) Dado por tenant | 7 | 5 |
| (C) Regra de negócio variável | 17 | 10 |
| (D) Feature opcional | 8 | — |
| (E) Segredo/credencial | 0 confirmados · 1 [INCERTO] · 1 token de baixa sensibilidade | 2 |
| (F) Dado pessoal real | 33 ocorrências em 14 arquivos + metadados git | 14 |

## 2. (A) Configuração — nome, domínio, marca, textos, cores, idioma, moeda, fuso

| Arquivo:linha | Descrição |
|---|---|
| `package.json:2` | nome do pacote com a marca do cliente |
| `app/layout.tsx:13` | fallback do domínio do cliente para `NEXT_PUBLIC_SITE_URL` |
| `app/layout.tsx:15-42` | título, template, descrição, keywords, OG (siteName, título, imagem), `appleWebApp.title`, manifest |
| `app/layout.tsx:45` | `themeColor` da marca |
| `app/layout.tsx:50-74` | JSON-LD `LodgingBusiness`: nome, descrição, telefone (F), endereço (F), geo (F), amenities, `aggregateRating`, horários de check-in/out — nome/telefone removidos em 2026-10-30 (§11) |
| `app/layout.tsx:78` | `lang="pt-BR"` |
| `app/layout.tsx:5-11` | fontes da identidade visual (Fraunces, Nunito Sans) |
| `app/robots.ts:4`, `app/sitemap.ts:4` | fallback do domínio do cliente |
| `app/login/page.tsx:57-58` | "Painel <marca>", "Acesso restrito ao proprietário" |
| `app/cancelar/[id]/page.tsx:6` | título com marca |
| `app/cancelar/[id]/page.tsx:37-38` | texto com marca e telefone (F) — nome/telefone removidos em 2026-10-30 (§11) |
| `app/cancelar/[id]/CancelClient.tsx:36` | template WhatsApp com nome do dono (F) — nome/telefone removidos em 2026-10-30 (§11) |
| `components/admin/AdminShell.tsx:23` | "Painel <marca>" |
| `components/admin/MomentsManager.tsx:81,121` | textos "Momentos no <marca>" |
| `components/admin/BookingCard.tsx:36-51` | 3 templates WhatsApp com marca e horários |
| `components/public/Header.tsx:7-12,35` | itens de navegação e nome da marca |
| `components/public/Hero.tsx:7-15` | imagem hero específica do local |
| `components/public/Hero.tsx:29-37` | cidade/UF, slogan, descrição do imóvel |
| `components/public/Hero.tsx:48-52` | métricas fixas ("50 m", "4.8★ +100", "24 h") |
| `components/public/About.tsx:4-9` | 4 diferenciais do imóvel |
| `components/public/About.tsx:17-30` | título "Seis unidades…", texto com nome do dono (F), localização — nome/telefone removidos em 2026-10-30 (§11) |
| `components/public/AboutCollage.tsx:7-12` | 4 fotos locais com alt da marca |
| `components/public/Gallery.tsx:8-17,27` | 8 fotos locais; título com marca |
| `components/public/Distances.tsx:1-5` | lista de cidades/distâncias |
| `components/public/Distances.tsx:16` | endereço (F) |
| `components/public/Distances.tsx:29,38` | iframe e link do Google Maps com endereço (F) |
| `components/public/Footer.tsx:4` | fallback do telefone (F) — nome/telefone removidos em 2026-10-30 (§11) |
| `components/public/Footer.tsx:13-16` | marca e slogan |
| `components/public/Footer.tsx:23-24` | endereço (F) |
| `components/public/Footer.tsx:34` | telefone formatado (F) — nome/telefone removidos em 2026-10-30 (§11) |
| `components/public/Footer.tsx:36-39` | perfil Instagram do cliente |
| `components/public/Footer.tsx:45` | copyright com marca |
| `components/public/Testimonials.tsx:1-8` | 6 depoimentos com nomes (F) — nome/telefone removidos em 2026-10-30 (§11) |
| `components/public/Testimonials.tsx:18` | link de busca Google Maps com marca/cidade |
| `components/public/Testimonials.tsx:31-35` | nota e contagem de avaliações fixas |
| `components/public/WhatsAppFloat.tsx:3-4` | fallback do telefone (F) e mensagem com marca — nome/telefone removidos em 2026-10-30 (§11) |
| `components/public/Moments.tsx:27,44,50,55` | textos com marca/cidade |
| `components/public/RoomsSection.tsx:22` | texto com nome do dono (F) — nome/telefone removidos em 2026-10-30 (§11) |
| `components/public/BookingForm.tsx:14` | fallback do telefone (F) — nome/telefone removidos em 2026-10-30 (§11) |
| `components/public/BookingForm.tsx:93,111` | textos com nome do dono (F) — nome/telefone removidos em 2026-10-30 (§11) |
| `components/public/BookingForm.tsx:199` | placeholder de telefone com DDD regional |
| `components/[Logotipo].tsx` (hoje `Logo.tsx`) | logotipo SVG da marca (arquivo inteiro) |
| `tailwind.config.ts:8-25` | paleta da marca (`ocean`, `sand`, `coral`) |
| `app/globals.css:16-22` | tema do calendário com cores da marca |
| `public/manifest.json`, `public/manifest-admin.json` | nome, short_name, descrição, cores |
| `public/sw.js:3` | nome do cache com a marca |
| `public/google7ba4df3e37ceb4f9.html` | verificação Search Console da conta do cliente |
| `public/images/*` (16), `public/og-image.png`, `public/icons/*` | mídia do imóvel e da marca (≈2,6 MB) |
| `lib/utils.ts:8-9` | `brl()`: moeda BRL, locale pt-BR, sem centavos |
| `lib/utils.ts:15` | formato de data dd/mm/aaaa |
| `README.md` | documentação inteira voltada ao cliente (nome do dono (F), domínio, instruções) — nome/telefone removidos em 2026-10-30 (§11) |

## 3. (B) Dado por tenant — quartos, usuários, IDs de integração

| Arquivo:linha | Descrição |
|---|---|
| `supabase/schema.sql:196-212` | seed com 3 quartos reais (nomes, descrições, preços, capacidades, comodidades, fotos) |
| `supabase/schema.sql:214-217` | instruções de criação do admin com nome do dono (F) e `role='owner'` |
| `supabase/schema.sql:177-191` | bucket único `rooms` + 3 policies de Storage |
| `supabase/migration-momentos.sql:26-27` | reutiliza bucket `rooms`, pasta `momentos/` |
| `components/admin/MomentsManager.tsx:38,41,71` | nome do bucket hardcoded |
| `components/admin/RoomEditor.tsx:70,72` | nome do bucket hardcoded |
| `next.config.mjs:5` | `remotePatterns` restrito a `**.supabase.co` (genérico, mas assume Supabase cloud) |

## 4. (C) Regra de negócio variável

| Arquivo:linha | Regra |
|---|---|
| `app/api/bookings/route.ts:32-36` | "entrada já passou" calculada com TZ do servidor |
| `app/api/bookings/route.ts:43` | máximo 60 noites; acima disso "fale no WhatsApp" |
| `app/api/bookings/route.ts:74` | preço = noites × diária fixa (sem temporada, taxa, imposto, desconto) |
| `supabase/schema.sql:15` | `price_per_night integer` em reais (sem centavos, sem moeda) |
| `supabase/schema.sql:32` | `nights` gerado (sem day-use) |
| `supabase/schema.sql:41-44` | exclusão só entre `approved` (pendentes não reservam) |
| `supabase/schema.sql:82-122` | disponibilidade = aprovadas + bloqueios |
| `components/public/BookingForm.tsx:33,145` | janela de 6 meses |
| `components/public/BookingForm.tsx:54-55` | regra "dia de check-out pode coincidir com check-in ocupado" |
| `components/admin/CalendarManager.tsx:28,98` | janela de 6 meses no painel |
| `app/api/admin/block-date/route.ts:8` | máximo 90 datas por operação |
| `components/admin/BookingCard.tsx:38-39`, `app/layout.tsx:72-73` | check-in 14h / check-out 12h |
| `components/admin/BookingCard.tsx:52,86` | prefixo de país `55` forçado |
| `components/admin/RoomEditor.tsx:114` | capacidade máxima 12 |
| `components/admin/RoomEditor.tsx:64`, `MomentsManager.tsx:32` | limite de upload 5 MB |
| `app/api/admin/approve/route.ts:21`, `admin/cancel/route.ts:29`, `reject/route.ts:17-22` | máquina de estados (reject sem guarda) |
| `app/api/cancel/route.ts:26`, `components/public/BookingForm.tsx:223` | cancelamento livre a qualquer momento; nenhum pagamento |

## 5. (D) Features opcionais (só este cliente pode querer)

| Feature | Arquivos |
|---|---|
| Momentos (galeria viva) | `supabase/migration-momentos.sql`, `components/admin/MomentsManager.tsx`, `components/public/Moments.tsx`, `app/(public)/page.tsx:28-34` |
| Fluxo WhatsApp (deep links e templates) | `BookingCard.tsx`, `BookingForm.tsx`, `CancelClient.tsx`, `WhatsAppFloat.tsx`, `Footer.tsx`, `lib/utils.ts:11` |
| PWA / service worker | `public/sw.js`, `public/manifest*.json`, `app/layout.tsx:85-90`, `next.config.mjs:7-14` |
| Autocancelamento do hóspede por token | `supabase/migration-cancelamento.sql`, `app/api/cancel`, `app/cancelar/[id]/*` |
| Realtime no painel (flash + vibração) | `components/admin/AdminDashboard.tsx:26-45`, `schema.sql:171-174` |
| SEO: JSON-LD, sitemap, robots, verificação Google | `app/layout.tsx:50-83`, `app/{robots,sitemap}.ts`, `public/google*.html` |
| Seções estáticas de marketing | `Testimonials.tsx`, `Distances.tsx`, `Gallery.tsx`, `AboutCollage.tsx`, `MobileBookBar.tsx` |
| Bloqueio manual de datas | `CalendarManager.tsx`, `app/api/admin/block-date` |

## 6. (E) Segredos e credenciais — apenas localização e tipo

| Local | Tipo | Situação |
|---|---|---|
| Código-fonte (todos os `.ts/.tsx/.sql/.json/.mjs`) | — | **Nenhum segredo.** Chaves só via `process.env`. |
| `.env.example` | arquivo de exemplo de variáveis | **[INCERTO]** Leitura bloqueada pela política do ambiente. Varredura por padrão (sem exibir) encontrou na linha 9 um valor com formato de telefone; não foi possível confirmar se as demais linhas têm placeholders ou valores reais. |
| `public/google7ba4df3e37ceb4f9.html` | token de verificação Search Console | Baixa sensibilidade, mas vinculado à conta Google do cliente; remover. |
| `.claude/settings.local.json.off` | config local desativada com endpoint alternativo | Ignorado pelo git; contém um token de placeholder, não uma credencial real. Não versionar. |

## 7. (F) Dados pessoais reais — mascarados

| Dado | Localizações | Observação |
|---|---|---|
| Nome do proprietário (J*** C***) | ~~`README.md`, `CancelClient.tsx`, `About.tsx`, `BookingForm.tsx`, `RoomsSection.tsx`, `Testimonials.tsx`, comentários em `AdminDashboard.tsx` e `CalendarManager.tsx`~~ removidos em 2026-10-30 (§11). Restam `supabase/schema.sql:214,217` e `supabase/migration-cancelamento.sql:2` (snapshots históricos, não editáveis por regra) | 3 ocorrências restantes + histórico git |
| Telefone/WhatsApp do proprietário | ~~`app/layout.tsx`, `app/cancelar/[id]/page.tsx`, `BookingForm.tsx`, `Footer.tsx`, `WhatsAppFloat.tsx`~~ removidos em 2026-10-30 (§11); código lê só `NEXT_PUBLIC_OWNER_WHATSAPP`, sem fallback. Resta `.env.example:9` [INCERTO] | 1 ocorrência [INCERTO] |
| Endereço e coordenadas do imóvel | `app/layout.tsx:59-64`; `components/public/Footer.tsx:23-24`; `Distances.tsx:16,29,38` | Endereço do negócio |
| Nomes de hóspedes em depoimentos (6 pessoas, nome + sobrenome) | ~~`components/public/Testimonials.tsx:2-7`~~ removidos em 2026-10-30 (§11); autoria neutra "Hóspede" | Textos dos depoimentos mantidos; permanecem no histórico git |
| Perfil Instagram do cliente | `components/public/Footer.tsx:36-39` | |
| Fotos do imóvel | `public/images/*` (16 arquivos) | **[INCERTO]** se alguma mostra pessoas; direito de uso fora do cliente |
| E-mail pessoal do autor dos commits | metadado `Author:` nos 20 commits (domínio gmail) | Não está em arquivo; visível em repositório público |
| **Dados de hóspedes/reservas** | — | **Nenhum** encontrado no repositório nem no histórico (0 e-mails além do placeholder `voce@email.com`, 0 CPF, 0 UUID). |

## 8. Varredura do histórico git

Método: histórico completo com diffs filtrado por padrões, exibindo apenas **contagens e localizações**, nunca o conteúdo.

| Padrão | Ocorrências | Conclusão |
|---|---|---|
| JWT (`eyJ….eyJ…`) | 0 | nenhuma chave Supabase |
| URL de projeto `*.supabase.co` | 0 | |
| `sb_secret_` / `sb_publishable_` | 0 | |
| `postgres://` / `postgresql://` | 0 | |
| `password=` / `senha=` | 0 | |
| `PRIVATE KEY`, `AKIA…` | 0 | |
| `api_key|secret|token = <16+ chars>` | 0 | |
| E-mails | 2 distintos | 1 placeholder em `BookingForm.tsx`; 1 e-mail do autor (apenas em `Author:`) |
| Telefones BR | 9 linhas | mesmas localizações da tabela F |
| CPF | 0 | |
| UUIDs literais | 0 | |

Histórico: 20 commits do projeto original (2026-07-10/11, 1 autor); maioria "Add files via upload" (upload via GitHub web, sem granularidade). Diretório `update-manifest/` (3 arquivos, cópias de layout/manifests) adicionado em `5b0caf8` e removido em `03f7bac` — sem segredos. `.env.example` é o único arquivo `env` que já existiu. Arquivos afetados por dados pessoais no histórico: os mesmos da tabela F (presentes desde `8b270be`) + `README.md` (desde `3360ef3`).

**Implicação**: se o repositório for publicado como produto, os dados do cliente permanecem no histórico até reescrita do histórico ou novo repositório. Decisão do proprietário (ver `00-perguntas-em-aberto.md`).

## 9. Onde o código assume uma única propriedade/hotel

| Local | Suposição |
|---|---|
| `supabase/schema.sql:10-63`, `migration-momentos.sql:6-12` | Nenhuma tabela/FK de tenant ou propriedade em `rooms`, `bookings`, `blocked_dates`, `gallery_photos`, `admins` |
| `supabase/schema.sql:71-79` | `is_admin()` global: qualquer admin administra tudo |
| `supabase/schema.sql:146-168`, `migration-momentos.sql:17-24` | Todas as policies são globais (sem predicado de tenant) |
| `supabase/schema.sql:13` | `rooms.slug unique` global → colide entre propriedades |
| `supabase/schema.sql:177-191` | Um bucket `rooms`, URLs públicas sem prefixo de tenant |
| `supabase/schema.sql:171-174` + `AdminDashboard.tsx:30-38` | Realtime assina **todos** os INSERT/UPDATE de `bookings` |
| `app/(admin)/admin/page.tsx:10-16` | Carrega todas as reservas e quartos |
| `app/(public)/page.tsx:20-24`, `app/api/rooms/route.ts:8-12` | Lista todos os quartos ativos |
| `components/admin/CalendarManager.tsx:15` | `rooms[0]` como padrão |
| `lib/supabase/admin.ts` + rotas públicas | Service role ignora RLS: isolamento de tenant teria de ser feito em código em cada consulta |
| `middleware.ts:41` | Matcher só `/admin`; sem resolução de tenant por domínio/subdomínio/path |
| Env vars `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_OWNER_WHATSAPP` | Uma identidade por deploy |
| `app/layout.tsx` (metadata, JSON-LD), `public/manifest*.json`, `app/{robots,sitemap}.ts` | Constantes de build, não por tenant |
| `app/cancelar/[id]/page.tsx:37-38`, `CancelClient.tsx:36` | Textos da marca na página do hóspede |
| Modelo de quarto | Cada linha = 1 unidade; não há tipo de quarto × quantidade. **[INCERTO]** `About.tsx:19` fala em "seis unidades", seed tem 3 |

## 10. Os 10 acoplamentos mais difíceis de remover

1. **Ausência da dimensão tenant/propriedade no schema + `is_admin()` e policies globais** — exige redesenho de todas as tabelas, funções SQL, policies e da função de autorização. Toca banco, API e UI ao mesmo tempo.
2. **Service role nas rotas públicas** (`api/bookings`, `api/cancel`, `/cancelar`) — como ignora RLS, cada consulta precisa de filtro explícito de tenant; qualquer esquecimento vaza dados entre clientes.
3. **Marca e conteúdo embutidos em ~20 componentes React** — não há camada de conteúdo; vira CMS/tabela por tenant ou templates, com redesign das seções de marketing.
4. **Identidade via env vars** (`SITE_URL`, `OWNER_WHATSAPP`) — precisa de resolução de tenant por request (domínio/subdomínio/path) e store de configuração; afeta middleware, metadata, links.
5. **Preço inteiro em reais, sem centavos nem moeda** (`schema.sql:15`, `brl()`) — mudar tipo/moeda afeta constraint, cálculo, exibição, mensagens e dados históricos.
6. **Templates WhatsApp inline com nome do dono e horários** — 4 componentes; vira motor de templates por tenant.
7. **Realtime e dashboard globais** — filtro por tenant no canal e nas consultas; Realtime respeita RLS, então depende do item 1.
8. **Bucket único e URLs públicas** — prefixo por tenant ou bucket por tenant, com policies de Storage tenant-aware; URLs já gravadas em `rooms.images` e `gallery_photos.url`.
9. **Metadata, JSON-LD, manifests, sitemap, robots estáticos** — tudo vira `generateMetadata`/rotas dinâmicas por tenant; manifests PWA por tenant são não triviais.
10. **Escrita direta do browser dependente de RLS** (`RoomEditor`, `MomentsManager`, `CalendarManager`) — ou todas as policies se tornam tenant-aware, ou essas operações migram para rotas API. Decisão arquitetural com impacto em todo o painel.

## 11. Delta 2026-10-30 — remoção de dados pessoais do código-fonte

Varredura repetida com `/varrer-acoplamento` (mesmos padrões e exclusões) e mudança na branch `feat/remover-dados-pessoais`.

**Removido do código** (nome do dono, telefone e nomes em depoimentos), substituído por `lib/site-config.ts`, que lê apenas `NEXT_PUBLIC_OWNER_WHATSAPP` (sem fallback) e a nova `NEXT_PUBLIC_OWNER_NAME` (opcional). Sem as variáveis: textos dizem "o proprietário" e os links de WhatsApp do anfitrião não são renderizados. Arquivos: `app/layout.tsx` (JSON-LD `telephone`), `app/cancelar/[id]/{page,CancelClient}.tsx`, `components/public/{BookingForm,Footer,WhatsAppFloat,About,RoomsSection,Testimonials}.tsx`, comentários em `components/admin/{AdminDashboard,CalendarManager}.tsx`, `README.md`. As linhas correspondentes das tabelas (A) e (F) acima estão superadas; o restante das tabelas continua válido.

**Permanece** (fora do escopo desta mudança ou bloqueado por regra):
- Nome do dono em `supabase/schema.sql:214,217` e `supabase/migration-cancelamento.sql:2` — snapshots históricos; decisão pendente (editar o snapshot, ou aceitar até a migração de base limpa).
- `.env.example:9` [INCERTO] — não legível pelo agente; o humano confirma/troca por placeholder.
- Marca, textos geográficos, endereço, coordenadas, Instagram, imagens, fallbacks de domínio e verificação Google — inventariados, intencionalmente não tocados.
- Histórico git (§8): todos os dados continuam nos commits anteriores.

**Itens novos vs. a varredura de 2026-10-29**: `package-lock.json:2,8` (nome do pacote); `scripts/test-hooks.js:76,77` (falso positivo do regex de telefone: timestamp de migração); comentários de cabeçalho com a marca em `supabase/schema.sql:2` e `supabase/migration-momentos.sql:2`; usos do componente logotipo em 11 arquivos. Nenhum item do doc original havia sumido antes desta mudança.
