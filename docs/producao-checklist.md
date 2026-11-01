# Checklist de producao

Cruza tres listas oficiais com o que o repositorio e o `docs/milestones.md` ja cobrem. Criado em 2026-11-01 (entrega D-1). Nao ha item inventado: cada linha vem de uma das fontes abaixo; o que a fonte nao diz nao esta aqui.

Fontes (lidas em 2026-11-01; reler antes do M6-05, as listas mudam):
- Supabase, "Going into production": https://supabase.com/docs/guides/deployment/going-into-prod
- Next.js, "Production checklist" (App Router, atualizada em 2026-03-10): https://nextjs.org/docs/app/guides/production-checklist
- OWASP ASVS 4.0.3, nivel 1 (itens com marca L1 no CSV oficial: https://github.com/OWASP/ASVS/tree/v4.0.3/4.0/docs_en). O capitulo V1 nao tem item L1.

Legenda de status:
- **coberto**: ja verdadeiro no codigo ou na decisao registrada (indico onde).
- **falta -> M6-xx**: tem linha no `docs/milestones.md` que entrega o item.
- **falta, sem linha**: nenhuma linha cobre; listado em "Lacunas sem linha" no fim, para o proprietario decidir.
- **[INCERTO]**: nao verifiquei no codigo nem no dashboard; precisa de conferencia humana.
- **n/a**: nao se aplica a este projeto hoje (motivo na linha).

Quem executa: itens de projeto Supabase de producao e da Vercel sao do humano (CLAUDE.md §9). O agente so confere o que esta no repositorio.

## 1. Supabase

| Item da fonte | Status | Onde / linha |
|---|---|---|
| RLS ligada em todas as tabelas, com policies sensatas | coberto | CLAUDE.md §8; regra "toda tabela nova: RLS + policies na mesma migracao". Revalidar no prod com M6-05 |
| Policies e publicacoes de replicacao (Realtime) revisadas | falta -> M2-05 | Realtime filtrado por tenant; hoje a publicacao cobre `bookings` |
| SSL enforcement no banco | falta -> M6-01 | configuracao do projeto prod (humano) |
| Network restrictions no banco | falta -> M6-01 | idem; avaliar se faz sentido, pois a Vercel nao tem IP fixo no plano Hobby [INCERTO] |
| MFA na conta Supabase; varios owners na organizacao | falta -> M6-01 | humano; registrar quem tem acesso em CLAUDE.md §9 |
| Confirmacao de e-mail (Auth > Providers) | [INCERTO] -> M6-01 | admins sao criados pelo humano; conferir se o cadastro publico esta desligado no prod |
| Remover telefones de teste do Auth | n/a | nao ha login por telefone |
| Expiracao de OTP (maximo recomendado 3600 s) | [INCERTO] -> M6-01 | so relevante se houver OTP/magic link; hoje o login e e-mail e senha |
| MFA para usuarios finais | n/a | o hospede nao tem conta; ver ASVS V4.3.1 para o admin |
| SMTP proprio para e-mails de Auth | falta -> M4-01 / M6-01 | M4-01 define Resend para notificacoes; o SMTP do Auth e configuracao separada do projeto prod |
| Pensar em como abusar do proprio servico | falta -> M6-07 | rate limit e anti-bot nas rotas publicas |
| Indices para os padroes de consulta; `pg_stat_statements` | falta, sem linha | a constraint GiST de `bookings` existe; indices do restante nao foram revisados |
| Teste de carga, de preferencia em staging | falta, sem linha | |
| Upgrade de compute/disco; PITR acima de 4 GB | n/a | plano Free (D5), volume pequeno; reavaliar ao crescer |
| Projeto Free pode pausar apos 7 dias de baixa atividade | falta -> M6-01a | keep-alive (mitigacao da D5) |
| Free nao baixa backups pelo painel | falta -> M6-01b | dump semanal + teste de restauracao (mitigacao da D5) |
| Deploy de migracoes pela integracao com GitHub ("Deploy to production") | n/a | decisao vigente: o humano aplica a migracao (CLAUDE.md §9); nao adotar sem decisao nova |
| Branching para testar migracoes | n/a | exige plano Pro (D5: Free) |
| Limites de taxa do Auth (e-mails, OTP, verificacao, refresh) | coberto | padroes da plataforma; ajustes so com SMTP proprio |
| Limites do Realtime | [INCERTO] | conferir a documentacao de limites antes do M6-06 |
| CAPTCHA em signup, sign-in e reset de senha | falta -> M6-07 | CAPTCHA no login e na pre-reserva |
| Links de e-mail de uso unico e scanners de seguranca; desligar rastreio de links no SMTP | falta -> M4-01 | so se houver link de uso unico por e-mail; o cancelamento do hospede usa `cancel_token` (confirmar o comportamento ao enviar e-mail) |
| Modelo de responsabilidade compartilhada (leitura) | falta, sem linha | leitura do proprietario |
| Suporte do Pro | n/a | plano Free |

## 2. Next.js

| Item da fonte | Status | Onde / linha |
|---|---|---|
| Server Components por padrao, code-splitting, prefetch, prerender, cache (automaticos) | coberto | App Router; cache de 60 s em `/` e `/api/rooms` |
| Layouts e `<Link>` | coberto [INFERIDO] | uso nao auditado item a item |
| Paginas de erro e 404 personalizadas; `app/global-error.tsx`; `app/global-not-found.tsx` | falta, sem linha | nao existem `error.tsx`, `not-found.tsx` nem `global-error.tsx` em `app/` (conferido em 2026-11-01) |
| Fronteiras `"use client"` e composicao Server/Client | [INCERTO] | nao auditado |
| APIs de tempo de requisicao (`cookies`, `searchParams`) intencionais | coberto [INFERIDO] | `force-dynamic` no painel e em `/api/availability`; resto nao auditado |
| Route Handlers para o cliente; nao chamar Route Handler de Server Component | [INCERTO] | nao auditado |
| Streaming (`loading.tsx`, Suspense) | falta, sem linha | nenhum `loading.tsx` em `app/` |
| Busca de dados em paralelo; cache de dados fora de `fetch` | [INCERTO] | nao auditado; M3-02 trata cache por tenant |
| Imagens estaticas em `public/` | coberto | |
| Formularios com Server Actions e validacao no servidor | n/a | o projeto usa Route Handlers com zod, nao Server Actions |
| Font Module (fontes locais) | coberto | M0-17, `next/font/local` em `app/layout.tsx` |
| `<Image>` | coberto | usado em `app/layout.tsx`, `Hero`, `AvailabilitySearch`, `Logo`; `next.config.mjs` libera so o Storage do Supabase |
| `<Script>` para scripts de terceiros | n/a | nao ha script de terceiro; o registro do service worker e inline |
| `eslint-plugin-jsx-a11y` | coberto [INFERIDO] | vem em `eslint-config-next`; `npm run lint` roda no CI (M0-18) |
| Tainting de dados sensiveis | falta, sem linha | recurso experimental do Next; hoje o isolamento e por `server-only` em `lib/supabase/admin.ts` |
| Server Actions: autenticar dentro de cada acao; camada de dados `server-only`; rate limit | falta -> M6-07 | sem Server Actions; o equivalente para rotas e `requireAdmin()` (coberto) e rate limit (M6-07) |
| `.env.*` no `.gitignore`; so variaveis publicas com `NEXT_PUBLIC_` | coberto | `.gitignore` ignora `.env*` salvo `.env.example`; service role so em `lib/supabase/admin.ts` |
| Content Security Policy | falta -> M6-08 | |
| Metadata API | coberto | M1-03 (metadata e JSON-LD por configuracao do hotel) |
| Imagens Open Graph | falta, sem linha | nao ha `opengraph-image` em `app/` |
| Sitemap e robots | coberto | `app/sitemap.ts`, `app/robots.ts`; por tenant em M3-04 |
| TypeScript | coberto | strict; `npm run typecheck` no CI |
| `next build` + `next start` localmente antes de producao | falta -> M6-05 | smoke contra o ambiente real |
| Lighthouse em janela anonima; `useReportWebVitals` | falta, sem linha | |
| `@next/bundle-analyzer` | falta, sem linha | exigiria nova dependencia (aprovacao do humano) |

## 3. OWASP ASVS 4.0.3, nivel 1

A lista de IDs foi extraida do CSV oficial por leitura automatizada; conferir contra o CSV antes de usar como evidencia de auditoria.

### V2 Autenticacao
Quem se autentica hoje e so o admin (Supabase Auth, e-mail e senha). O hospede nao tem conta.

| IDs | Resumo | Status | Onde / linha |
|---|---|---|---|
| V2.1.1 a V2.1.12 | politica de senha (tamanho, sem truncar, sem regras de composicao, colar, verificar vazadas, medidor, trocar senha) | [INCERTO] -> M6-01 | senha e gerida pelo Supabase Auth; conferir os parametros do projeto prod. Nao ha tela de troca de senha no app (V2.1.5, V2.1.6): falta, sem linha |
| V2.2.1 | anti-automacao contra forca bruta | falta -> M6-07 | |
| V2.2.2, V2.2.3, V2.5.5 | autenticador fraco so como secundario; avisar mudancas de credencial | [INCERTO] -> M6-01 | depende dos e-mails de Auth do Supabase |
| V2.3.1, V2.5.4 | segredos iniciais aleatorios; sem contas padrao ou compartilhadas | coberto [INFERIDO] | admin criado pelo humano (Auth + `insert into admins`); nao ha conta padrao no codigo |
| V2.5.1 a V2.5.3, V2.5.6, V2.7.1 a V2.7.4, V2.8.1 | recuperacao e codigos fora de banda | n/a hoje | o app nao tem fluxo de recuperacao de senha nem OTP; se ativar, reabrir estes itens |

### V3 Sessao
| IDs | Resumo | Status | Onde / linha |
|---|---|---|---|
| V3.1.1 | token fora da URL | coberto [INFERIDO] | sessao em cookies via `@supabase/ssr`; `middleware.ts` e `lib/require-admin.ts` usam `auth.getUser()` |
| V3.2.1 a V3.2.3 | token novo no login, entropia, armazenamento seguro | coberto pela biblioteca [INFERIDO] | |
| V3.3.1 | logout e expiracao invalidam o token | falta -> M6-05 | `signOut` existe em `AdminShell.tsx`; verificar no smoke contra prod, junto com M1-12 (sem `/admin` no cache do service worker) |
| V3.4.1 a V3.4.5 | `Secure`, `HttpOnly`, `SameSite`, prefixo `__Host-`, path | [INCERTO] -> M6-05 | o codigo nao define opcoes de cookie; conferir os atributos reais no preview em HTTPS |
| V3.7.1 | reautenticar antes de transacao sensivel | falta, sem linha | |

### V4 Controle de acesso
| IDs | Resumo | Status | Onde / linha |
|---|---|---|---|
| V4.1.1, V4.1.2, V4.1.5 | regras na camada confiavel; atributos nao manipulaveis; falha segura | coberto | `requireAdmin()` em `app/api/admin/*`, RLS, preco e status calculados no servidor; revalidar no M2-06 |
| V4.1.3 | privilegio minimo | falta -> M2-08 | hoje `admins.role` nao e usado; papeis por RLS no M2-08; rotas com service role revistas no M2-06 |
| V4.2.1 | protecao contra IDOR | falta -> M2-06 | cancelamento por `cancel_token`; IDOR entre tenants no M2-06/M2-07 |
| V4.2.2, V13.2.3 | protecao contra CSRF | falta, sem linha | rotas POST autenticadas por cookie; nao ha token anti-CSRF no codigo. Analisar `SameSite` e verificacao de `Origin` |
| V4.3.1 | MFA em interfaces administrativas | falta, sem linha | o login do admin e e-mail e senha |
| V4.3.2 | sem listagem de diretorio nem vazamento de metadados | coberto [INFERIDO] | servido pela Vercel |

### V5 Validacao, sanitizacao e codificacao
| IDs | Resumo | Status | Onde / linha |
|---|---|---|---|
| V5.1.3, V5.1.4, V13.2.2 | validacao positiva e por schema | coberto | zod nas rotas (CLAUDE.md §8); zod 4 no M0-12 |
| V5.1.1, V5.1.2 | poluicao de parametros; atribuicao em massa | falta -> M2-09 | "strip do zod" nas rotas de settings e cancel |
| V5.1.5 | redirecionamentos so para destinos permitidos | [INCERTO] | nao auditado |
| V5.2.1, V5.2.2, V5.2.8, V5.3.1 a V5.3.3 | sanitizacao e codificacao de saida; XSS | coberto [INFERIDO] | React escapa por padrao; `dangerouslySetInnerHTML` so em `app/layout.tsx` (JSON-LD com `<` escapado e registro do service worker, texto fixo) |
| V5.2.3 | sanitizar antes de sistemas de e-mail | falta -> M4-01 | quando houver envio de e-mail |
| V5.2.4, V5.5.4 | sem `eval`; `JSON.parse` | coberto | busca em `app/`, `components/`, `lib/` sem `eval` |
| V5.2.5 a V5.2.7, V5.3.7 a V5.3.10, V5.5.1 a V5.5.3 | template, SSRF, SVG, LDAP, comando, LFI/RFI, XML, desserializacao | n/a [INFERIDO] | sem templates, XML, LDAP, desserializacao nem chamada de saida com URL do usuario; reabrir ao integrar gateway e webhook (M4-03) |
| V5.3.4 | consulta parametrizada | coberto | acesso via supabase-js e funcoes SQL |
| V5.3.5, V5.3.6 | codificacao onde nao ha parametrizacao; injecao em JSON | coberto [INFERIDO] | |

### V6 a V8 Criptografia, erros, dados
| IDs | Resumo | Status | Onde / linha |
|---|---|---|---|
| V6.2.1 | modulos criptograficos falham de forma segura | n/a | o app nao implementa criptografia propria |
| V7.1.1, V7.1.2 | nao logar credenciais, pagamento nem dados sensiveis | coberto | a aplicacao nao emite log proprio (CLAUDE.md §9); M6-03 define observabilidade sem PII |
| V7.4.1 | erro generico com identificador de rastreio | falta -> M6-03 | hoje as rotas devolvem mensagem generica sem trace id |
| V8.2.1 | cabecalhos anti-cache para dado sensivel | falta -> M6-08 | `/admin` e `/api/admin/*` |
| V8.2.2, V8.2.3 | sem dado sensivel em armazenamento do navegador; limpar ao encerrar a sessao | falta -> M1-12 | `sw.js` cacheia `/admin`; sem `localStorage`/`sessionStorage` no codigo |
| V8.3.1 | dado sensivel fora da query string | [INCERTO] | o token de cancelamento vai no path `/cancelar/[id]`; M2-09 trata o payload RSC |
| V8.3.2, V8.3.3, V8.3.4 | remover ou exportar dados; consentimento; politica de tratamento | falta, sem linha | |

### V9 a V12 Comunicacao, codigo malicioso, logica de negocio, arquivos
| IDs | Resumo | Status | Onde / linha |
|---|---|---|---|
| V9.1.1 a V9.1.3 | TLS em todo acesso, cifras e versoes atuais | coberto pela plataforma [INFERIDO] | Vercel e Supabase terminam o TLS |
| V10.3.1, V10.3.2 | atualizacoes assinadas; sem carregar codigo nao confiavel; integridade | falta -> M0-18 | lockfile versionado, `npm ci` no CI e Dependabot; scripts externos nao existem |
| V10.3.3 | protecao contra subdomain takeover | falta -> M3-05 / M6-01 | ao configurar dominios; conferir DNS de preview e producao |
| V11.1.1, V11.1.2 | fluxo em ordem; tempo humano realista | falta -> M6-07 | anti-bot da pre-reserva |
| V11.1.3, V11.1.4 | limites por usuario; anti-automacao | falta -> M6-07 | |
| V11.1.5 | limites a partir de modelo de ameacas | falta -> M2-01 | plano e modelo de ameaca do M2 |
| V12.1.1 | rejeitar arquivo grande | coberto | bucket `site` (5 MB, jpeg/png/webp) e checagem de 5 MB no cliente; bucket `rooms`: [INCERTO] |
| V12.3.x, V12.4.1, V12.5.1, V12.5.2 | nome de arquivo, fora da raiz web, so extensoes permitidas, nunca executar upload | coberto [INFERIDO] | uploads vao ao Supabase Storage (fora do servidor web), com tipo restrito no bucket `site` |
| V12.4.2 | varredura de malware | falta, sem linha | |
| V12.6.1 | requisicoes de saida por lista de permissao | n/a | sem chamada de saida com destino do usuario; reabrir no M4-03 |

### V13 e V14 API e configuracao
| IDs | Resumo | Status | Onde / linha |
|---|---|---|---|
| V13.1.1, V13.1.3, V13.2.1, V13.3.1 | parsers consistentes; segredos fora da URL; metodos REST; XSD | coberto [INFERIDO] | sem SOAP/XML; metodos por rota |
| V14.2.1 | componentes atualizados | falta -> M0-11, M0-12, M0-18 | Next 15, zod 4 e Dependabot |
| V14.2.2 | remover recursos nao usados | falta, sem linha | `lucide-react` esta no `package.json` e nao e usado (CLAUDE.md §2) |
| V14.2.3 | SRI para ativos externos | n/a | sem script ou CSS externo; o iframe do Google Maps nao e coberto por SRI |
| V14.3.2 | modo debug desligado em producao | coberto pela plataforma [INFERIDO] | `next build` + `next start` |
| V14.3.3 | sem versao nas respostas | falta -> M6-08 | `X-Powered-By` do Next esta ativo por padrao; desligar em `next.config` |
| V14.4.1 | `Content-Type` em toda resposta | coberto pelo framework [INFERIDO] | |
| V14.4.2 | `Content-Disposition` em respostas de API | n/a [INFERIDO] | as APIs devolvem JSON, nao download |
| V14.4.3 a V14.4.7 | CSP, `nosniff`, HSTS, `Referrer-Policy`, anti-framing | falta -> M6-08 | |
| V14.5.1 | so metodos HTTP esperados | [INCERTO] | o Next responde 405 para metodo nao exportado; confirmar e registrar |
| V14.5.2, V14.5.3 | `Origin` fora das decisoes de auth; CORS por lista de permissao | coberto [INFERIDO] | sem CORS configurado no codigo |

## Lacunas sem linha no milestones

Itens marcados "falta, sem linha" acima. Nao criei linhas: a entrega D-1 pedia so M4-06 (nota), M6-07, M6-08 e M0-18. Proposta para o proprietario decidir (por exemplo uma linha M6-09 de endurecimento, ou itens nas entregas E4/E6):
1. Paginas `error`, `global-error`, `not-found`/`global-not-found`, `loading` e imagens Open Graph.
2. Revisao de indices e teste de carga em staging; Lighthouse e Web Vitals; analise de bundle (dependencia nova).
3. Seguranca do admin: MFA (V4.3.1), reautenticacao (V3.7.1), tela de troca de senha (V2.1.5/6) e verificacao de `Origin`/CSRF (V4.2.2).
4. Direitos do titular: exportar/remover dados do hospede e politica de tratamento de dados (V8.3.2 a V8.3.4).
5. Varredura de malware em uploads (V12.4.2); remover `lucide-react` (V14.2.2); tainting (Next).
6. Guarda de estado no `reject` e `approve` com 404/409 em vez de 500 (divida de CLAUDE.md §8).

## Como usar

No M6-05 (checklist assinado) o humano percorre as tabelas 1 a 3, resolve os `[INCERTO]` e marca cada linha no PR do go-live. Quem atualiza este arquivo ao mudar uma linha do milestones e o agente, na mesma entrega.
