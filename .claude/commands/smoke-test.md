---
description: Executa (ou descreve, se o ambiente nao estiver pronto) o smoke test do fluxo principal: quarto -> disponibilidade -> reserva -> aprovacao -> cancelamento.
argument-hint: "[base-url, padrao http://localhost:3000]"
allowed-tools: Bash(curl:*), Bash(ls:*), Bash(test:*), Read, Grep
---

Smoke test do fluxo principal contra `$ARGUMENTS` (padrao `http://localhost:3000`).

Pre-condicoes (verifique e relate; nao tente corrigir aqui):
- app respondendo em `GET /api/rooms` (200 com `rooms[]` nao vazio: precisa de seed sintetico).
- um usuario admin de teste existe (criado pelo seed/script da reanimacao). Se nao houver como autenticar, execute so os passos publicos e marque os demais como "nao verificado".

Passos (use datas futuras, ex.: hoje+30 e hoje+32; dados de hospede **sinteticos**):
1. `GET /api/rooms` -> guarde `rooms[0].id` e `price_per_night`.
2. `GET /api/calendar?room_id=<id>&start=<hoje>&end=<hoje+180d>` -> espere `occupied: []` para as datas escolhidas.
3. `POST /api/bookings` com `{ room_id, guest_name: "Teste Sintetico", guest_phone: "+55 00 00000-0000", guest_email: "teste@exemplo.test", check_in, check_out }` -> 200, `booking.total_price == nights * price_per_night`. Guarde `booking.id`.
4. Autenticacao admin: se houver script/cookie de teste disponivel no projeto (procure em `scripts/` ou `docs/`), use-o para `POST /api/admin/approve` com `{ booking_id }` -> 200. Se nao houver, marque como nao verificado.
5. `GET /api/calendar` novamente -> as datas aparecem em `occupied`.
6. `POST /api/bookings` com as mesmas datas -> 409.
7. Cancelamento: o `cancel_token` nao e retornado pela API publica (so visivel ao admin/DB). Se tiver acesso ao token via passo 4, `POST /api/cancel` com `{ booking_id, token }` -> 200 e o calendario volta a vazio. Caso contrario, nao verificado.

Relate em tabela: passo | esperado | obtido | status (ok / falhou / nao verificado). Nao exiba dados de hospede reais (nao deve haver nenhum).
