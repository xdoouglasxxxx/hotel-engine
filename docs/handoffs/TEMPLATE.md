# Handoff: <tarefa em poucas palavras>

> Copiar para `docs/handoffs/AAAA-MM-DD-<tarefa>.md` quando uma tarefa nao fecha na sessao
> (harness, eixo 1: "handoff e escrito, nunca lembrado"). O mesmo formato e o relato final
> das skills `desenvolver-feature` e `investigar-bug` e do agente `revisor`.
> Nunca incluir dados de hospede, valores de `.env*`, chaves ou tokens: so nomes de variaveis.

| Campo | Valor |
|---|---|
| Data | AAAA-MM-DD |
| Branch | `nome-da-branch` |
| Skill / fluxo usado | `desenvolver-feature` / `investigar-bug` / nenhum |
| Estado | concluido / parcial / bloqueado |
| Proximo passo imediato | uma frase; quem faz (humano ou agente) |
| Contexto minimo para retomar | 2-3 caminhos a ler antes de qualquer coisa (ex.: secao X de `docs/analysis/02-arquitetura.md`, `app/api/<rota>/route.ts`, este handoff). Nunca "o repositorio". |
| Risco se parar aqui | uma frase ou "nenhum". Ex.: "migracao aplicada no dev, `types/database.ts` ainda antigo". Obrigatorio quando Estado = parcial. |

## 1. Objetivo
Uma frase (a mesma do plano). Se for bug: o sintoma do passo 0 e a causa raiz em uma frase, com a evidencia.

## 2. Arquivos
- `caminho/arquivo` — o que mudou (criado / alterado / removido).
- Migracao: `supabase/migrations/<timestamp>_<nome>.sql` — aplicada no dev? (sim, confirmado pelo humano em AAAA-MM-DD / nao).

## 3. Passos pulados e por que
- Passo N (`nome do passo da skill`) — motivo (ex.: "sem dado novo, migracao nao se aplica").

## 4. Verificado / nao verificado
| Item | Como | Resultado |
|---|---|---|
| `/verificar` (typecheck, lint) | comando | passou / falhou (trecho) / nao rodado (motivo) |
| `/smoke-test` | url usada | ok / falhou / nao rodado (motivo) |
| Teste manual | passos resumidos | resultado observado |
| `revisor` | veredito | APROVADO / COM RESSALVAS / BLOQUEADO (cada item aberto tambem em §5, ou marcado como resolvido com o commit/arquivo) |

**Nao verificado**: lista explicita com motivo (dependencias nao instaladas, projeto dev pausado, sem sessao admin, etc.).

## 5. Pendencias
Bugs, dividas e ideias encontrados no caminho e **nao** corrigidos (um objetivo por PR). Cada item: o que e, onde (`arquivo`, nome da funcao/policy), por que ficou de fora. Inclui todo apontamento do `revisor` nao resolvido nesta tarefa.

## 6. [INCERTO] / [INFERIDO]
- [INCERTO] afirmacao que nao pode ser confirmada e o que confirmaria.
- [INFERIDO] conclusao tirada de leitura de codigo/doc sem executar.

## 7. Decisoes propostas (nao registradas)
Linhas candidatas para `CLAUDE.md` > Decisoes, no formato `- AAAA-MM-DD: ...`. So o humano registra.
