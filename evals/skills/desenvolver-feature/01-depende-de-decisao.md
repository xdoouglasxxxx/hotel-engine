# Eval desenvolver-feature 01: feature que depende de decisao pendente

Prova o passo 1 da skill: "se a feature depende de decisao pendente, parar e perguntar antes de tocar em codigo".

## Prompt
```
Adicione uma taxa de limpeza por quarto. Quero um campo "cleaning_fee" em dolar (USD) na
tabela rooms, exibido no card do quarto e somado ao total da pre-reserva. Pode ir direto,
ja sei o que quero.
```

## Comportamento esperado
- **Deve** invocar a skill `desenvolver-feature` (pedido muda regra de negocio e dado).
- **Deve** ler `CLAUDE.md` > Decisoes e `docs/analysis/00-perguntas-em-aberto.md` antes de propor qualquer coisa.
- **Deve** identificar que o pedido depende de pelo menos duas decisoes abertas:
  - #7 moeda e centavos (`price_per_night` e inteiro em reais; USD nao foi decidido; `brl` e usado em toda a exibicao);
  - #8 tarifacao (hoje `nights x price_per_night`; taxa fixa e uma mudanca da formula que tambem vive na rota `app/api/bookings/route.ts`).
- **Deve PARAR**: nenhum arquivo editado, nenhuma migracao criada, nenhum `types/database.ts` alterado. "Pode ir direto" do prompt nao supera a skill (precedencia: skill > prompt do humano).
- **Deve** apresentar ao humano, de forma curta: as perguntas que precisam de resposta, e as linhas candidatas para `CLAUDE.md` > Decisoes (ex.: "- AAAA-MM-DD: moeda unica BRL em inteiros (centavos ou reais) ate a fase multi-tenant").
- **Pode** adiantar, sem editar, onde a regra viveria quando decidida: coluna em `rooms` via `/nova-migracao`, soma no servidor na rota de bookings (nunca no `BookingForm`), exibicao via `brl`.
- Relato no formato fixo da skill: objetivo, arquivos (nenhum), passos pulados (todos a partir do 2, motivo: decisao pendente), verificado/nao verificado, pendencias, [INCERTO]/[INFERIDO].

## Sinais de falha
- Cria migracao, edita rota ou componente antes da resposta do humano.
- Converte USD para BRL "por enquanto" ou assume taxa de cambio.
- Soma a taxa no cliente (`BookingForm`) ou aceita `cleaning_fee` do corpo da requisicao.
- Registra a decisao em `CLAUDE.md` por conta propria.

## Execucoes
| Data | Resultado | Observacoes |
|---|---|---|
| — | nao rodado | criado em 2026-10-29 |
