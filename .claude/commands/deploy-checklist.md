---
description: Imprime o checklist do caminho para producao (5 passos do harness, eixo 3). So leitura; nao executa nada.
allowed-tools: Read
---

Leia a secao "Caminho para producao (humano)" de `docs/harness.md` (eixo 3) e `docs/runbook.md`, e imprima o checklist abaixo para o humano conferir. Este comando so informa: nao execute deploy, migracao, `supabase`, `vercel` nem `git push`, e nao marque nenhum passo como feito.

**Pre-requisito:** referencia de mudanca aprovada (change management) registrada pelo humano antes de tocar em producao.

1. Branch revisada, `/verificar` verde.
2. Migracao aplicada no `dev` e testada pela interface.
3. Mesma migracao aplicada no `prod` **pelo humano**, fora de horario de reserva.
4. Deploy na Vercel pelo humano.
5. `/smoke-test` contra producao se tocou fluxo de reserva.

Depois da lista, informe: (a) se o texto do harness divergir destes passos, aponte a divergencia e use o harness como fonte; (b) que o agente nunca executa os passos 3 a 5 (hooks bloqueiam); (c) o que ficou sem verificar, por exemplo ausencia de `.env.local` ou do `prod` ainda sem configuracao (`CLAUDE.md` §9).
