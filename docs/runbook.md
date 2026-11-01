# Runbook (versao inicial, 2026-10-31)

Procedimentos operacionais. Fonte das regras: `CLAUDE.md` e `docs/harness.md`. O que ainda nao existe esta marcado **[INCERTO]** ou **[FALTA]**; nao inventar. Todos os passos em producao sao do humano; o agente nunca os executa (hooks bloqueiam).

## 1. Ambientes
| Ambiente | Projeto Supabase | Variaveis | Quem opera |
|---|---|---|---|
| dev | `hotel-engine-dev` (sa-east-1, Free; pausa apos 7 dias sem uso) | `.env.local` (criado pelo humano) | humano e Claude Code (sem acesso ao banco) |
| prod | **[FALTA]** projeto ainda nao configurado (placeholders em `CLAUDE.md` §9) | so nas variaveis do projeto na Vercel | humano |

Nunca ha segredo de producao na maquina do agente (`CLAUDE.md` > Decisoes, 2026-10-31).

## 2. Deploy para producao (humano)
Pre-requisito: referencia de mudanca aprovada registrada (change management) e janela fora de horario de reserva.
1. Branch revisada, `/verificar` verde.
2. Migracao aplicada no `dev` e testada pela interface.
3. Mesma migracao aplicada no `prod` pelo humano.
4. Deploy na Vercel pelo humano. Production Branch = `main` (congelada ate o M6). **[INCERTO]** passo exato de promocao: nao ha CI/CD alem do preview por branch/PR.
5. `/smoke-test` contra producao se tocou fluxo de reserva.
`/deploy-checklist` imprime esta lista (so leitura).

## 3. Migracao
1. Claude escreve `supabase/migrations/<timestamp>_<nome>.sql` com reversao (`/nova-migracao`) e atualiza `types/database.ts`.
2. Humano revisa e aplica no dev (SQL Editor ou `supabase db push` contra o dev), confirma de volta.
3. So depois, o humano aplica no prod. Nunca editar `supabase/schema.sql` nem `migration-*.sql` historicos.

## 4. Reversao
- Codigo: reverter o commit/PR via novo PR; redeploy pelo humano. **[INCERTO]** "Instant Rollback" da Vercel: confirmar no dashboard antes de depender dele.
- Banco: bloco `-- down:` de cada migracao; o humano executa. Testar o down no dev antes de aplicar a migracao no prod (criterio de M2-02).
- Producao v1.0 antiga (codigo original): protegida com Deployment Protection "All Deployments" desde 2026-10-31; nao e destino de rollback.

## 5. Incidente
1. Conter: o humano pausa ou tira do acesso o deploy afetado (Deployment Protection) se houver exposicao.
2. Investigar com `investigar-bug`: o humano cola trechos de log do dashboard (Supabase API/Postgres/Auth; Vercel Functions) **com dados de hospede mascarados**. O agente nao acessa dashboards.
3. Se envolver credencial, token ou dado de hospede: tratar como incidente de seguranca e escalar ao time de seguranca; rotacionar chaves do projeto afetado (so o humano). **[INCERTO]** contato/canal de escalonamento: registrar aqui.
4. Pos-incidente: seguir "Pos-incidente" do harness (invariante, procedimento, conhecimento, perspectiva) e criar teste/regra na camada que falhou.

## 6. Observabilidade
A aplicacao nao emite logs proprios. Existem so os logs das plataformas. Retencao **[INCERTO]**: conferir no dashboard. Quem tem acesso aos dashboards **[FALTA]** (placeholder em `CLAUDE.md` §9).

## 7. Pendencias deste runbook
- Definir prod (D5), dono e acesso aos dashboards, retencao de logs, canal de escalonamento de seguranca.
- Registrar o procedimento de rollback da Vercel depois de conferido.
- Transformar em runbook do tenant quando houver multi-tenant (M2 em diante).
