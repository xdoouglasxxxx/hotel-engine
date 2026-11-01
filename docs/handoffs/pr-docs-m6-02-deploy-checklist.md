## M6-02: `/deploy-checklist` e `docs/runbook.md` inicial

- `.claude/commands/deploy-checklist.md`: command so leitura (`allowed-tools: Read`) que imprime os 5 passos do caminho para producao (harness, eixo 3), mais o pre-requisito de referencia de mudanca aprovada. Nao executa nada.
- `docs/runbook.md`: ambientes, deploy, migracao, reversao, incidente, observabilidade. Tudo que nao existe esta marcado [INCERTO]/[FALTA] (prod, acesso aos dashboards, retencao de logs, rollback da Vercel, canal de escalonamento).
- Documentos apenas; nenhum codigo de app, rota ou SQL.

Verificado: texto dos 5 passos conferido contra `docs/harness.md` eixo 3; `npm run typecheck` e `lint` sem mudanca. Nao verificado: execucao do command numa sessao nova (so o humano ve o comando listado); veracidade dos itens [INCERTO].

Revisor: nao exigido (sem rota/SQL/RLS/hook/settings; o command e arquivo de prompt de leitura).

Nota: `docs/milestones.md` (M6-02) e a linha P3 do harness serao atualizados na branch final de docs.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
