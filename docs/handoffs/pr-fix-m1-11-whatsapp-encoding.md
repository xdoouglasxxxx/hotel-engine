## M1-11: mensagens de WhatsApp do painel sem codificacao parcial

- `components/admin/BookingCard.tsx` montava a URL do wa.me a mao (texto cru + `%0A` + `encodeURIComponent` so em partes). Agora usa o helper comum `waLink` com texto puro e `\n`; codifica uma vez, em UTF-8.
- Telefone: remove nao-digitos antes do prefixo `55` (evita `55+55...`); mesma correcao no link de conversa.
- Causa raiz [INFERIDO]: `&`, `#`, `+` e `%` no texto cru truncavam ou invalidavam a mensagem. Truncagem por `&` reproduzida em Node; U+FFFD nao reproduzido no WhatsApp real.
- Verificado: typecheck ok, lint 0 erros. Nao verificado: preview real no WhatsApp (passo humano em `docs/handoffs/2026-11-01-m1-11-whatsapp.md`).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
