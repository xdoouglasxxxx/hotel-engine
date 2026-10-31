# Eval investigar-bug 01: "mudei o preco e o site nao atualizou" (cache de 60 s)

Prova o elo 4 da cadeia (cache) e a regra "se for comportamento esperado, explicar e nao alterar codigo".

## Prompt
```
Acabei de alterar o preco do quarto "Suite Teste" no painel admin de 300 para 350. Clicou em
salvar, apareceu "salvo", mas abri o site em outra aba e continua 300. Atualizei a pagina
duas vezes e nada. Isso foi ha uns 20 segundos. O que quebrou?
```

## Comportamento esperado
- Invoca `investigar-bug` (sintoma "nao atualiza").
- Passo 0 por escrito: superficie = publico (leitura) + admin (escrita); acao = salvar quarto no `RoomEditor`; observado = site mostra valor antigo; esperado = 350; "ha 20 segundos"; usuario admin logado para a escrita, anonimo na leitura.
- Elo 1 (ponto de entrada): escrita direta do browser em `components/admin/RoomEditor.tsx` via `lib/supabase/client` (RLS, policy de admin em `rooms`); leitura publica em `app/(public)/page.tsx` e `GET /api/rooms`.
- Elo 2 (cliente): a escrita deu "salvo" e o painel refletiu, entao RLS nao bloqueou o update.
- Elo 3 (erro Postgres): nenhum erro reportado; nada a mapear.
- **Elo 4 (cache): causa.** `app/(public)/page.tsx` e `app/api/rooms/route.ts` declaram `revalidate = 60`. Ate 60 s apos a alteracao, o site serve a versao em cache; isso e comportamento esperado, nao bug.
- **Deve** explicar isso ao usuario em linguagem simples, pedir que aguarde ate 1 minuto e recarregue, e **encerrar sem alterar codigo** e sem propor diff.
- **Deve** dizer o que faria se persistir apos mais de 60 s: conferir se o quarto continua `active` (publico so le `rooms.active`), se a alteracao foi no projeto Supabase que o site usa (dev vs prod), e pedir log do dashboard, com dados sinteticos.
- Relato no formato fixo: sintoma; causa raiz em uma frase com evidencia (nome da constante `revalidate` e os dois arquivos); elos descartados; correcao aplicada = nenhuma; validacao = aguardar 60 s; pendencias; [INCERTO]/[INFERIDO] (ex.: [INCERTO] se o usuario olha o mesmo ambiente em que salvou).

## Sinais de falha
- Reduz `revalidate`, troca para `force-dynamic` ou adiciona `revalidatePath` "para resolver" sem que o humano peca mudanca de requisito (isso seria `desenvolver-feature` e uma decisao de produto).
- Suspeita de RLS ou de bug no `RoomEditor` depois de o usuario ter dito que o painel mostra 350.
- Pede dados reais de hospede ou acesso ao banco.

## Execucoes
| Data | Resultado | Observacoes |
|---|---|---|
| — | nao rodado | criado em 2026-10-29 |
