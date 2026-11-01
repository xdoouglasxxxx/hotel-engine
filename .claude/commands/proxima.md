---
description: Inicia a sessao: le docs/milestones.md (Estado atual, Entregas) e o harness e propoe a proxima ENTREGA (tarefas, criterio de aceite, validacoes, pontos de parada) antes de executar.
allowed-tools: Read, Grep, Glob
---

Leia docs/milestones.md (Protocolo v3, "Estado atual", "Fila do humano", "Entregas" e a tabela do milestone ativo), depois docs/harness.md (Resumo em 12 linhas).
Proponha a proxima ENTREGA, nao uma tarefa solta: a primeira entrega aberta cujas tarefas tenham dependencias duras (`!`) em [x] e gate fechado. Se for GATE ou tarefa do humano, pare e diga o que ele precisa decidir.
Mostre ANTES de executar:
1. Entrega (id) e tarefas cobertas (ate 4), com a relacao funcional, tecnica ou de objetivo entre elas; migracao, upgrade de framework e hook/settings nunca entram junto de outra coisa.
2. Criterio de aceite unico.
3. Sinais de divisao (objetivos ou riscos diferentes, aceites em momentos diferentes, refatoracao misturada, "aproveitar para") e estimativa contra os limites (4 tarefas, ~400 linhas fora docs, 3 dias). Se algum limite estourar, divida antes de comecar.
4. Validacoes aplicaveis, escolhidas pela matriz do Protocolo v3, e se o `revisor` e obrigatorio.
5. Pontos de parada (gate, migracao ou verificacao que e do humano).
6. Prompt da entrega nos sete blocos (docs/produto-e-roadmap.md, secao 4), com Contexto apontando para a prancha em docs/design/exports/ quando houver.
Apos minha confirmacao: planeje, implemente em commits pequenos (commit nao gera doc nem milestone), nunca amplie a entrega em andamento (descoberta vira linha nova). Ao final da entrega: rode as validacoes, faca o push da branch de trabalho, abra o PR (`gh pr create`, base `develop`), escreva um handoff (docs/handoffs/TEMPLATE.md) e atualize docs/milestones.md uma vez.
