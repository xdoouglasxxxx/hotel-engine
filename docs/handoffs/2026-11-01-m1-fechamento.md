# Handoff: M1-09, fechamento do M1

| Campo | Valor |
|---|---|
| Data | 2026-10-31 (sessao noturna autonoma) |
| Branch | `chore/m1-09-fechamento` (so documento) |
| Estado | agente: concluido; humano: confirmar o criterio de saida e os itens da fila |
| Fora do escopo por instrucao | eval sessao-zero (M0-07 segue `[h]`, humano roda) |

## 1. Criterio de saida do M1 (milestones.md)
| Criterio | Como foi verificado | Resultado |
|---|---|---|
| Nenhum texto/marca/contato/imagem hardcoded | grep de telefone, `wa.me/<numero>` e "Mandala" em `app/ components/ lib/ public/`; leitura do revisor | zero ocorrencias; `public/` so com icones, manifests e `sw.js` neutros |
| Painel edita e site reflete | verificado pelo humano no preview da Vercel (M1-05/06/08, 2026-10-31) | ok (registrado no milestones) |
| Seed "Hotel Engine Demo" | migracao `20261031014813_site_settings.sql`; aplicada no dev (12/12, 2026-10-30) | ok |
| Revisor APROVADO nas rotas | revisor sobre os arquivos do M1 por inteiro (sem diff: historico recomecado em 1 commit) | **APROVADO COM RESSALVAS**, sem critica nem alta |

Verificacoes do agente: `npm run typecheck` ok; `npm run lint` 0 erros (1 warning antigo em `postcss.config.mjs`); `node scripts/test-hooks.js` FALHAS: 0.

## 2. Achados do revisor (todos baixos, nenhum bloqueia)
| Onde | Achado | Sugestao |
|---|---|---|
| `app/cancelar/[id]/page.tsx:24,46`, `CancelClient.tsx:9` | `cancel_token` entra no payload RSC; `booking: any` esconde isso | select sem o token; tipar a prop com `Pick<>` |
| `lib/site-settings.ts:19-21` | erro transitorio do banco vira `null` e o `unstable_cache` guarda por 60 s (site sem marca, `robots` noindex) | lancar excecao no erro; separar "erro" de "sem linha" |
| `supabase/migrations/20261031014814_site_storage.sql:20-21` | policy de select em `storage.objects` deixa anon listar nomes; bucket ja e publico | remover a policy de select |
| `components/admin/SiteSettingsForm.tsx:217,223` | "Remover" deixa arquivo orfao no bucket | remover do storage apos salvar |
| `20261031014815_booking_policy.sql:43-50` | HE001 so vale no INSERT; UPDATE de datas nao revalida | registrar a premissa; cobrir se alguma rota passar a mudar datas |
| `CancelClient.tsx:12` | com `published=false` a tela nao mostra o aviso da janela de cancelamento (o banco aplica) | passar `cancellation_free_days` pelo servidor |
| `app/api/bookings/route.ts:33-35` | "data ja passou" usa fuso do servidor; ja existe `site_settings.timezone` | tratar no M2-09 |
| booking_policy + `app/api/cancel/route.ts:21` | janela de cancelamento depende de `cancelled_by='guest'` vindo da rota | ja conhecido (M2-09) |

Decisao do proprietario (2026-11-01): os achados baixos entram no M2-09; nao havera M1-13. Nenhuma das ressalvas ja conhecidas do M2-09 subiu de severidade.

## 3. Nao verificado [INCERTO]
- Smoke-test e qualquer tela (nao ha ambiente no ar nesta sessao).
- Se `bookings.cancelled_by` existe no dev e se o PostgREST entrega `HE001`/`HE002` em `error.code`/`details` como as rotas assumem [INFERIDO].
- Leitura por inteiro de `Hero`, `Header`, `Footer`, `Moments`, `RoomsSection`, `BookingForm`, `MobileBookBar`, `WhatsAppFloat`: so grep.
- `middleware.ts`, `lib/require-admin.ts`, `lib/supabase/*`, `public/sw.js`, rotas `approve`/`reject`/`block-date` (fora do M1).
- `unstable_cache` e `revalidateTag` com varias instancias na Vercel.
- `tenant-auditor`: nao se aplica antes do M2; recomendado rodar no M2.

## 4. Proximo passo
M1-09 pode ir a `[h]`; falta o humano marcar `[x]` (e fechar M1-10, M1-12 para considerar o milestone concluido).
