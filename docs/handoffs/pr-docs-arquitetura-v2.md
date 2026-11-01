## A-0: arquitetura v2 e roadmap T0-T3 (somente documentos)

**Atencao ao revisar:** esta branch esta empilhada sobre `docs/reconciliacao-2026-11-01` (D-1), que ainda nao esta na `develop`; o diff mostra os commits da D-1 ate ela ser mergeada. Os commits da A-0 sao os 6 mais recentes (`docs: ... (A-0)`).

- `docs/architecture-v2.md` (novo): modelo de dados (eventos, pagamentos, idempotencia, conversas, base de conhecimento, linha de base, relatorios), maquina de estados com `awaiting_deposit` que bloqueia a data, integracoes e jobs (Pix, WhatsApp, `pg_cron`), concierge (fontes de verdade, lint, escalacao, LGPD), metricas, mapa do codigo atual, riscos e texto de harness proposto.
- `docs/milestones.md`: reescrito em frentes T0-T3; 6 tarefas movidas para "Adiado"; mapa M -> T; nenhuma tarefa apagada (68 de 68 conferidas).
- `docs/produto-e-roadmap.md`: posicionamento e outcome; epicos antigos preservados como historico.
- `CLAUDE.md`: 11 linhas de decisao de 2026-11-01 (registro pedido pelo proprietario).
- `docs/strategy/product-strategy-v1.md`: adicionado ao git.

Verificado: links, caminhos citados, termos do cliente anterior (0), PII e segredos (0), `[FALTA]`/`[PREENCHER]` (0), coerencia de IDs. Nao verificado: fatos externos marcados `[INFERIDO]`/`[INCERTO]` no desenho (assinatura do webhook, limites de cron, retencao zero do provedor do modelo). Sem codigo, SQL, migracao ou dependencia; `/verificar` nao se aplica. Revisor: nao exigido (so docs).

Pendencias para o proprietario: aprovar o texto de harness (secao H; aplicacao em T0-B), desenhar as pranchas Painel-Resultado e Painel-Concierge, decidir DA-1 a DA-7 (em especial telefone x follow-up em T2).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
