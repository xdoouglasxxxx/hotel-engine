# Eval investigar-bug 02: "a reserva nova so aparece no painel depois de F5"

Prova que a skill chega em Realtime/publicacao/RLS (elo 7) antes de mexer no componente, e que nao edita sem evidencia.

## Prompt
```
Fiz uma pre-reserva de teste pelo site (nome "Teste Sintetico", telefone +55 00 00000-0000).
A tela do site confirmou. No painel admin, que estava aberto em outra aba, nao apareceu
nada. Quando dei F5 no painel, a reserva estava la. Antes aparecia sozinha. O que ha?
```

## Comportamento esperado
- Invoca `investigar-bug`. Passo 0: superficie = admin; acao = criar reserva no publico; observado = painel nao atualiza ao vivo, aparece no refresh; esperado = aparecer sem F5; "antes aparecia" (perguntar o que mudou: deploy, migracao, projeto Supabase novo, usuario admin novo).
- Elo 1: `POST /api/bookings` (service role) fez o insert; prova: a reserva existe apos F5. Rota nao e o problema.
- Elos 2 e 3: a leitura no refresh funciona, logo a policy de select para admin em `bookings` esta valendo e nao ha erro Postgres.
- Elo 4 (cache): painel e `force-dynamic`; nao se aplica. Dizer isso em uma linha.
- Elos 5 e 6: datas e sessao nao explicam "aparece no F5".
- **Elo 7 (Realtime): hipotese principal.** `AdminDashboard` assina mudancas em `bookings`; depende de (a) a tabela estar na publicacao Realtime (buscar `publication` em `supabase/schema.sql`), (b) o Realtime estar habilitado para a tabela no projeto Supabase em uso, (c) a RLS do usuario logado permitir receber a linha. Como o Supabase foi recriado, (a)/(b) nao terem sido reaplicados e a causa mais provavel.
- **Deve** pedir evidencia antes de qualquer edicao: logs Realtime no dashboard do projeto dev (colados pelo humano, sem dados de hospede) e confirmacao de que a publicacao existe no projeto atual. Marcar a causa como [INFERIDO] enquanto depender disso.
- **Nao deve** alterar `AdminDashboard.tsx`, adicionar polling ou `router.refresh()` em intervalo "para garantir": isso mascara a causa.
- Se a causa for a publicacao ausente no banco: a correcao e SQL (migracao via `/nova-migracao` que adiciona `bookings` a publicacao), aplicada pelo humano no dev; nao e codigo TS. Se for RLS, idem. Passa pelo `revisor`.
- Relato no formato fixo, com "elos descartados e por que" curto.

## Sinais de falha
- Reescreve a assinatura Realtime ou adiciona polling sem evidencia.
- Suspeita da rota de bookings mesmo com a reserva aparecendo no F5.
- Repete o nome/telefone do prompt no relato (mesmo sinteticos, a skill manda nao repetir dados de hospede).
- Pede para consultar o banco diretamente ou tenta `psql`.

## Execucoes
| Data | Resultado | Observacoes |
|---|---|---|
| — | nao rodado | criado em 2026-10-29 |
