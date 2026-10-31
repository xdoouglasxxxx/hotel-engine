# Handoff: M1 — plano (M1-01) e migrações (M1-02, M1-05, M1-07 parte SQL)

| Campo | Valor |
|---|---|
| Data | 2026-10-30 |
| Branch | `feat/m1-site-settings` (criada a partir de `develop`; o working tree já tinha a pasta de design movida, não commitada) |
| Skill / fluxo usado | `desenvolver-feature`, passos 1 a 4; parado antes do passo 5 (regra da skill: sem rota/UI até o humano confirmar a migração) |
| Estado | concluido (M1-01 e M1-02). Migrações aplicadas pelo humano no dev em 2026-10-30; validação estrutural 12/12 ok (o bloco 2, storage, precisou ser rodado de novo: não havia sido executado na 1ª vez). |
| Proximo passo imediato | Agente: M1-03 (`lib/site-settings.ts`, layout, About). |
| Contexto minimo para retomar | este arquivo; `supabase/migrations/20261031014813_site_settings.sql`; `docs/milestones.md` (Estado atual e M1) |
| Risco se parar aqui | Migrações escritas e não aplicadas. `types/database.ts` já descreve `SiteSettings`, mas nenhum código TS usa a tabela ainda, então nada quebra. |

## 1. Objetivo
Tirar marca, textos, contato, horários e regras simples de reserva do código para uma tabela `site_settings` editável no painel (M1), sem multi-tenant ainda.

## 2. Arquivos
- `supabase/migrations/20261031014813_site_settings.sql` — criado. Tabela, índice de linha única, trigger de validação de fuso, trigger `touch_updated_at`, RLS, seed "Hotel Engine Demo". Aplicada no dev? **não**.
- `supabase/migrations/20261031014814_site_storage.sql` — criado. Bucket `site` (público para leitura, 5 MB, jpeg/png/webp) e policies de admin. Aplicada no dev? **não**.
- `supabase/migrations/20261031014815_booking_policy.sql` — criado. Trigger `enforce_booking_policy` (mínimo de noites; janela de cancelamento do hóspede). Aplicada no dev? **não**.
- `types/database.ts` — alterado: `SiteSettings` e `BOOKING_POLICY_ERROR`.
- `docs/milestones.md` — alterado: autorização do humano, M1-01 e M1-02 (ver milestone).
- Nenhum arquivo de `supabase/schema.sql` ou `migration-*.sql` histórico foi tocado.

## 3. Passos pulados e por que
- Passo 5 (rota) e 6 (UI): esperam a confirmação de que as migrações foram aplicadas.
- `/smoke-test` e verificação visual: dev não está no ar nesta sessão (a verificação visual e de upload ficou com o humano).
- `tenant-auditor`: não se aplica antes do M2.

## 4. Verificado / não verificado
| Item | Como | Resultado |
|---|---|---|
| typecheck | `npm run typecheck` | passou (sem saída de erro) |
| lint | não rodado | `npm run lint` é interativo sem `.eslintrc` (M0-08 aberta); `eslint` e `eslint-config-next` já estão no `package.json` e em `node_modules`, então o `npm install` aprovado provavelmente não será necessário |
| SQL | humano aplicou no dev; query de validação (12 itens: tabela, seed, índice, RLS, 3 policies, 2 triggers, bucket, 4 policies de storage, função e trigger de política, pré-condição `cancelled_by`) | 12/12 ok em 2026-10-30. Testes de comportamento (singleton, fuso inválido) não confirmados pelo humano |
| `revisor` | agente, leitura | APROVADO COM RESSALVAS (§9) |

**Não verificado**: execução do SQL (sintaxe real, `file_size_limit`/`allowed_mime_types` em `storage.buckets` na versão do dev, SQLSTATE `HE001`/`HE002`), comportamento dos triggers contra as rotas, qualquer tela.

## 5. Pendências
- `lib/supabase/server.ts` usa `cookies()`. Isso torna dinâmica toda página que o chama, e o `export const revalidate = 60` de `app/(public)/page.tsx` provavelmente não tem efeito. Por isso o plano usa um cliente anon sem cookies dentro de `unstable_cache` para ler `site_settings` (M1-03). Não corrigido: fora do escopo.
- `app/api/bookings/route.ts`: "data já passou" usa o fuso do servidor (dívida conhecida). A coluna `timezone` abre caminho para corrigir; não entra no M1.
- Prancha `Painel-Config` tem itens sem tarefa no M1: Pagamentos, Notificações, Canais, Equipe, Domínio, Plano (M4, M5, M3). Ver §6.

## 6. Plano do M1 (M1-01)

### Divergências entre prancha e escopo do M1
| Item da prancha | Decisão no plano | Motivo |
|---|---|---|
| Cor de destaque, "Mostrar Powered by" | fora do M1; cor em M3-03 | tema é M3; gravar uma coluna que nada aplica engana o painel |
| Aprovação manual, pets | fora | hoje a aprovação é sempre manual; pets não é requisito do M1 |
| "Depois disso, retém X% do sinal" | fora | sem pagamento até M4 (D4) |
| Cancelamento grátis até N dias | entra como `cancellation_free_days` | aplicado só ao hóspede, em reserva aprovada; NULL = sem restrição (comportamento atual) |
| Mínimo de noites padrão | entra como `min_nights` | aplicado no banco |
| Seções Pagamentos, Notificações, Canais, Equipe, Domínio, Plano | fora | pertencem a M4/M5/M3 |
| Cards "4,8 avaliação média" e "Pix ou cartão" da Main | fora | não há dado de avaliação nem pagamento |

### Tarefas (um PR cada)
| ID | Entrega | Arquivos prováveis | Migração | Risco |
|---|---|---|---|---|
| M1-02 | 3 migrações + tipos (**feito, aguarda aplicação**) | `supabase/migrations/*`, `types/database.ts` | sim | médio |
| M1-03 | `lib/site-settings.ts` (anon sem cookies, `unstable_cache` 60 s, tag `site-settings`, retorna `null` se não publicado); `app/layout.tsx` com `generateMetadata` e JSON-LD dinâmicos; `About.tsx`; remover do JSON-LD o `aggregateRating` fixo e o `geo` do cliente anterior | `lib/site-settings.ts`, `app/layout.tsx`, `components/public/About.tsx` | não | médio |
| M1-04 | Header, Hero, Footer, RoomsSection, WhatsAppFloat, cancelar, login, AdminShell, BookingForm lendo as configurações; remover métricas fixas do Hero; **Testimonials, Distances, Gallery e AboutCollage saem da home** (conteúdo do cliente anterior, sem tabela para recebê-lo); "Como chegar" passa a ser um bloco com o endereço das configurações | `components/public/*`, `app/(public)/page.tsx`, `app/cancelar/*`, `app/login/page.tsx`, `components/admin/AdminShell.tsx` | não | médio |
| M1-05 (código) | `lib/` + upload de logo e foto principal no painel pelo cliente anon (RLS), bucket `site` | `components/admin/SiteSettingsForm.tsx` | não (já em M1-02) | médio |
| M1-06 | Painel > Configurações do hotel: seções "Site e marca" e "Políticas e horários"; salva com `UPDATE` pelo cliente anon (RLS) ou rota `app/api/admin/site-settings` com `requireAdmin()` + zod | `app/(admin)/admin/configuracoes/page.tsx`, `components/admin/SiteSettingsForm.tsx`, rota | não | médio |
| M1-07 (código) | Rotas mapeiam `HE001`/`HE002` para 400/403 em pt-BR; BookingForm exibe mínimo de noites e janela; página `/cancelar` mostra o aviso | `app/api/bookings/route.ts`, `app/api/cancel/route.ts`, `components/public/BookingForm.tsx`, `app/cancelar/[id]/*` | não | **alto** (rotas públicas com service role: `revisor` obrigatório) |
| M1-08 | Remover de `public/`: `google*.html`, imagens do imóvel, `og-image.png`; atualizar `manifest*.json`, `sw.js`; apagar componentes órfãos | `public/*`, `components/public/*` | não | baixo |
| M1-09 | `eval-sessao-zero` + `revisor` no diff do M1; handoff final | — | não | baixo |

Decisão pendente de produto, dentro de M1-06: a escrita das configurações pelo cliente anon (RLS) ou por rota com `requireAdmin()`. Recomendo **rota com zod**: valida o formato (telefone, instagram, domínio) antes do banco e mantém o padrão de `app/api/admin/*`.

## 7. Pendências do M0 que afetam o M1
| Tarefa M0 | Afeta? | Como |
|---|---|---|
| M0-07 eval sessao-zero | não | só valida o harness; roda antes de fechar o M1 (M1-09) |
| M0-08 ESLint | **sim, na verificação** | sem `.eslintrc`, `/verificar` não roda lint; sem ela o "Pronto quando" do M1 só tem typecheck |
| M0-09 hook de Stop | não | só reduz risco de esquecer o typecheck |
| M0-10 allowlist | não | só menos prompts |
| M0-11 Next 15 | **sim** | `cookies()` e `params` viram assíncronos; `revalidate`/`unstable_cache` mudam de padrão. Código novo do M1 (`lib/site-settings.ts`, `layout.tsx`, páginas com `params`) será reescrito em parte. Mitigação: manter a leitura de configurações em uma função só e não espalhar `cookies()` |
| M0-12 zod 4 | **sim, pouco** | a rota nova de M1-06 usa zod; mensagens e `.email()` mudam de API |
| M0-13 varredura de acoplamento | **sim, duplica** | sobrepõe M1-04 e M1-08; pelo próprio milestone, parte dela vira M1 |
| M0-14 renomear repo/package | **sim, leve** | `package.json` `name` e `sw.js` (nome de cache) caem aqui ou em M1-08; combinar para não editar duas vezes |
| M0-15 registrar D1/D2 | sim | confirmadas no chat; falta o registro em `CLAUDE.md` (linhas em §10) |

## 8. Como aplicar (humano, no `hotel-engine-dev`)
1. Restaurar o projeto dev no dashboard se estiver pausado. Conferir que `schema.sql`, `migration-cancelamento.sql` e `migration-momentos.sql` já estão aplicados (`select cancelled_by from bookings limit 1;` não pode dar erro).
2. SQL Editor, **nesta ordem**, um arquivo por vez: `..014813_site_settings.sql`, `..014814_site_storage.sql`, `..014815_booking_policy.sql`.
3. Conferir: `select name, currency, timezone, min_nights from site_settings;` deve retornar 1 linha ("Hotel Engine Demo"); `select id, public from storage.buckets where id = 'site';` retorna 1 linha.
4. Dizer aqui se algum arquivo falhou (colar a mensagem de erro, sem dados de hóspede).

## 9. Revisão
`revisor`: **APROVADO COM RESSALVAS** (só por leitura; não viu `approve`/`reject`, não executou SQL).

| Achado | Gravidade | Situação |
|---|---|---|
| Rotas não mapeiam `HE001`/`HE002` (cancelamento fora da janela viraria 404 enganoso; `min_nights` > 1 viraria 500) | média | **aberto, por desenho**: é o M1-07 (código). Hoje `min_nights` = 1 e `cancellation_free_days` = NULL, então nada muda até o admin configurar. **Não alterar essas configurações antes do M1-07.** |
| `booking_policy` lê `bookings.cancelled_by` (de `migration-cancelamento.sql`) sem declarar a pré-condição; sem a coluna, todo update em `bookings` falha | média | **corrigido** no cabeçalho da migração 3/3, com query de conferência |
| Escopo misturado (3 entregas) e design movido no working tree | média | **aberto**: ao commitar, separar `db:` por migração e `docs:` para a pasta de design (commit é seu) |
| `select ... limit 1` sem escopo de tenant | baixa | **aberto para o M2** (reescrever com filtro de tenant; rodar `tenant-auditor`) |
| BEFORE INSERT respondia `HE001` antes de `valid_range` | baixa | **corrigido**: a regra só vale com `check_out > check_in` |
| Janela depende de `cancelled_by = 'guest'` informado pela rota | baixa | **documentado** como premissa na migração |
| `email_public` sem formato; paths com `/` inicial; domínio aceitava `a..b` | baixa | **corrigido** nos CHECKs |
| `published = false` esconde tudo do anon | baixa | **aberto para o M1-03**: `getSiteSettings()` retorna `null` e o front trata |
| SELECT em bucket público permite listar objetos | baixa | aceito (mesmo padrão do bucket `rooms`) |
| `on conflict do nothing` ignora bucket `site` pré-existente | baixa | **aberto**: conferir no dashboard após aplicar |
| `checkin_time`/`checkout_time` chegam como `HH:MM:SS` | baixa | **aberto para o M1-04**: formatar na exibição |

As correções acima foram feitas depois da revisão e **não foram revisadas de novo** (mudança em comentário, 3 CHECKs e uma condição).

## 10. [INCERTO] / [INFERIDO]
- [INCERTO] `storage.buckets.file_size_limit` e `allowed_mime_types` existem no projeto dev; confirma-se ao aplicar.
- [INCERTO] SQLSTATE `HE001`/`HE002` chegam às rotas em `error.code` do supabase-js; confirma-se no M1-07 com teste manual.
- [INFERIDO] `cookies()` em `lib/supabase/server.ts` torna a home dinâmica (comportamento conhecido do Next 14; não medido).
- [INFERIDO] o `npm install` aprovado para o lint não é necessário (`eslint` em `node_modules`).

## 11. Decisões propostas (não registradas)
Para `CLAUDE.md` > Decisões:
- `- 2026-10-30: D1 moeda — só BRL até o M2. site_settings.currency existe e é presa a 'BRL' por constraint; multimoeda exige migração própria.`
- `- 2026-10-30: D2 modelo de tenant — tabela tenants + tenant_id em todas as tabelas de dado + RLS por tenant (M2). Até lá, site_settings tem uma linha (índice site_settings_singleton), removido no M2.`
- `- 2026-10-30: M1 iniciado com o M0 aberto (M0-07 a M0-14), por autorização do humano; gate de D1/D2 fechado por confirmação no chat.`
- `- 2026-10-30: site_settings é lida pelo público (anon): nunca guardar segredo, chave ou dado de hóspede nela. A leitura usa cliente anon sem cookies + unstable_cache (60 s), sem service role.`
- `- 2026-10-30: regras de política de reserva (mínimo de noites, janela de cancelamento do hóspede) vivem em trigger no Postgres (enforce_booking_policy), com SQLSTATE HE001/HE002 mapeados pelas rotas.`
