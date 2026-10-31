# Eval investigar-bug 03: "aprovar reserva da erro 500"

Prova o elo 3 (`PGRST116` por `.single()` sem linha), a correcao minima no elo certo, e "um bug por PR".

## Prompt
```
No painel, cliquei em Aprovar numa pre-reserva e apareceu "Erro ao aprovar." Abri a aba de
rede: POST /api/admin/approve devolveu 500. Tentei de novo, mesmo erro. Detalhe: eu tinha
aprovado essa mesma reserva uns minutos antes em outra aba, mas o card ainda aparecia como
pendente nesta aba. Log do Supabase (sem dados): code "PGRST116", message "JSON object
requested, multiple (or no) rows returned".
```

## Comportamento esperado
- Invoca `investigar-bug`. Passo 0: superficie = admin/API; acao = `POST /api/admin/approve`; observado = 500 com `error: "Erro ao aprovar."`; esperado = 200 ou um erro que explique; reproduz sempre nesta reserva; admin logado (401 nao ocorreu).
- Elo 1: `app/api/admin/approve/route.ts`, lida inteira.
- Elo 2: `createAdminClient()` (service role) apos `requireAdmin()`; RLS nao e o caso.
- **Elo 3: causa.** O update tem guarda `.eq('status', 'pending')` e termina em `.single()`. A reserva ja estava `approved` (aprovada na outra aba), o `where` nao casa nenhuma linha, PostgREST devolve `PGRST116`, e a rota so trata `23P01`; qualquer outro erro vira 500. Evidencia: o codigo colado pelo usuario e a divida ja registrada em `CLAUDE.md` §8 ("`approve` devolve 500 para nao pendente").
- Elo 4 lido uma vez: nao e cache (painel `force-dynamic`); a aba desatualizada e Realtime ou aba antiga, mas isso nao muda a causa do 500. Anotar em "Pendencias" se o Realtime nao atualizou a segunda aba.
- **Correcao minima, no elo certo (a rota):** tratar `PGRST116` devolvendo 409 (ou 404, conforme `.claude/rules/rotas-api.md`: 404 recurso inexistente, 409 conflito de estado; a skill deve escolher e justificar em uma frase) com mensagem em pt-BR como "Esta reserva ja nao esta pendente." **Manter** a guarda `.eq('status', 'pending')` e o `.single()`; nao substituir por update sem guarda.
- **Nao deve** corrigir `reject/route.ts` (sem guarda de estado) nem `cancel` no mesmo diff: vao para "Pendencias" (um bug por PR).
- Validacao: `/verificar`; reproducao descrita (aprovar duas vezes a mesma reserva sintetica no dev; a segunda deve devolver o novo codigo); `/smoke-test` porque toca o fluxo de reserva; agente `revisor` porque e rota com service role.
- Relato no formato fixo; [INFERIDO] se nao houve ambiente para reproduzir.

## Sinais de falha
- Remove a guarda de status para "parar de dar erro" (abre aprovacao de reserva cancelada e burla a constraint).
- Troca `.single()` por `.maybeSingle()` e devolve 200 sem linha (esconde o estado real do hospede).
- Devolve a mensagem crua do PostgREST ao cliente.
- Edita antes de escrever a hipotese e a evidencia.

## Execucoes
| Data | Resultado | Observacoes |
|---|---|---|
| — | nao rodado | criado em 2026-10-29 |
