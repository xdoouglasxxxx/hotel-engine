# Eval desenvolver-feature 03: mudanca so de UI (passos pulados)

Prova que a skill sabe pular banco, tipos e rota quando o dado ja existe, e diz no relato que pulou.

## Prompt
```
Nos cards de reserva do painel, mostre tambem a quantidade de noites e o valor por noite,
alem do total que ja aparece.
```

## Comportamento esperado
- Invoca `desenvolver-feature`. Le Decisoes e perguntas em aberto; nada bloqueia (exibicao de dado existente em BRL).
- Verifica no codigo que o dado ja existe: `bookings` expoe `nights` (a rota `app/api/bookings/route.ts` seleciona `nights` no insert) e `total_price`; `rooms.price_per_night` vem pelo join ja usado no painel. [INFERIDO] se nao abrir `supabase/schema.sql` para confirmar que `nights` e coluna gerada; o esperado e que abra e cite o nome da coluna.
- **Passos 3, 4 e 5 pulados**, com o motivo explicito no plano e no relato: "nenhum dado novo; nenhuma regra nova; nenhuma rota nova".
- Passo 6 (UI), em `components/admin/BookingCard.tsx`:
  - exibe `nights` vindo do dado; **nao** recalcula noites a partir de `check_in`/`check_out` com `new Date()` no cliente (regra: UI nunca calcula preco, noites ou status);
  - "valor por noite" exibido via `brl` (de `lib/utils.ts`), nunca formatacao manual; se o valor por noite nao estiver no payload do card, a resposta correta e exibir `total_price / nights` **como previa** rotulada, ou propor incluir `price_per_night` no select do Server Component que alimenta o painel, e nao inventar outro caminho;
  - texto em pt-BR com acentuacao; tokens Tailwind existentes; sem hex solto; sem texto do cliente anterior.
- Passo 7: `/verificar` (ou declarar nao rodado e por que). `/smoke-test` nao se aplica (nao toca fluxo de reserva na API); dizer isso.
- Passo 8: `revisor` e opcional aqui (componente nao toca Supabase diretamente); aceitavel chamar ou justificar que nao chamou. Se o diff mudar o select do Server Component do painel (acesso a dados), **deve** chamar o `revisor`.
- Relato no formato fixo, listando os passos pulados.

## Sinais de falha
- Cria migracao ou altera `types/database.ts` sem necessidade.
- Calcula noites no cliente com `Date` e fuso implicito.
- Formata moeda com template string em vez de `brl`.
- Mistura refatoracao do card (ex.: remover `window.confirm`) no mesmo diff; isso vai para "Pendencias".

## Execucoes
| Data | Resultado | Observacoes |
|---|---|---|
| — | nao rodado | criado em 2026-10-29 |
