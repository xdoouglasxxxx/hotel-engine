---
name: desenvolver-feature
description: Fluxo para implementar uma funcionalidade ou mudanca de regra de negocio neste projeto (Next.js + Supabase) na ordem certa (contexto -> decisao -> regra -> migracao -> tipos -> rota -> UI -> verificacao -> revisao -> relato), respeitando RLS, service role e um objetivo por PR. Use sempre que o pedido envolver criar, alterar ou remover comportamento do sistema — nova tela, novo campo, novo endpoint, mudanca de preco, disponibilidade, status, conteudo do painel — mesmo que o usuario nao use a palavra "feature". Nao use para refatoracao pura, correcao de bug isolado ou upgrade de dependencia.
---

# Desenvolver feature

## Problema que resolve
As camadas deste projeto tem dependencia de ordem: `types/database.ts` depende do schema, rotas dependem de funcoes SQL e policies, UI depende da resposta da rota. Fazer fora de ordem produz tipos desatualizados, policies esquecidas e regra duplicada em TS e SQL. Este fluxo forca a ordem certa e deixa explicito o que pode ser pulado.

## Antes de comecar: ler contexto
Ler, nesta ordem, antes de escrever o plano:
1. `CLAUDE.md` (secao "Decisoes") e `docs/analysis/00-perguntas-em-aberto.md` — se algum dos dois nao existir ou estiver claramente desatualizado, dizer isso no plano e seguir com [INFERIDO].
2. `docs/analysis/02-arquitetura.md`, apenas a secao da camada afetada.
3. A rota ou componente existente mais parecido com a feature — e o molde a copiar.
4. `supabase/schema.sql` (funcoes, constraints e policies existentes) e `types/database.ts`, se houver dado envolvido.

## Fluxo
Passos marcados com *(se aplicavel)* podem ser pulados; dizer no relato que foram pulados e por que.

1. **Plano (Plan mode).** Uma frase de objetivo. Se a feature depende de decisao pendente (moeda, tenant, pagamento, etc.), parar e perguntar antes de tocar em codigo. Se a feature gera uma decisao nova, propor a linha para "Decisoes" do `CLAUDE.md` no proprio plano. Listar quais passos abaixo se aplicam.
2. **Onde vive a regra?** Decidir antes de codar e nao duplicar:
   - Postgres (funcoes, constraints, policies): disponibilidade, overbooking, integridade, tudo que precisa valer mesmo se a rota falhar.
   - Rota: validacao de entrada (zod), orquestracao, autorizacao.
   - UI: exibir. Nunca calcular preco, noites ou status.
3. **Banco** *(se aplicavel)*: `/nova-migracao <nome>` — tabela/coluna, RLS habilitado + policies, indices, reversao. Nunca editar `supabase/schema.sql` a mao. Dado sintetico no seed se a feature precisar de exemplo. Entregar o arquivo de migracao com bloco de reversao e pedir que o usuario aplique no projeto dev. Nao prosseguir para o passo 5 ate o usuario confirmar que aplicou sem erro.
4. **Tipos** *(se houve passo 3)*: atualizar `types/database.ts` na mesma mudanca, nunca em PR separado.
5. **Rota** *(se aplicavel)* em `app/api/**/route.ts`: seguir `.claude/rules/rotas-api.md`. Resumo do que mais erra: zod no input; cliente Supabase correto (anon vs service role, ver `.claude/rules/dados-e-supabase.md`); guarda de estado antes de mutar; codigos HTTP coerentes; nenhum dado de hospede em log. Rotas admin comecam com `requireAdmin()`.
6. **UI** *(se aplicavel)*: Server Component por padrao; `'use client'` so com estado ou efeito. Reutilizar `components/ui/*`, tokens Tailwind, `brl` e `formatDateBR`. Nenhum texto, telefone ou marca do cliente anterior.
7. **Verificacao**: `/verificar`; `/smoke-test` se tocar no fluxo de reserva; descrever o teste manual feito (passos e resultado), nao apenas "testado".
8. **Revisao**: agente `revisor` sobre o diff. Na fase multi-tenant, tambem `tenant-auditor`. Resolver ou justificar cada apontamento.
9. **Relato** (formato fixo):
   - Objetivo (a frase do passo 1)
   - Arquivos alterados
   - Passos pulados e por que
   - O que foi verificado / o que nao foi
   - Pendencias anotadas (bugs ou dividas encontradas, nao corrigidas)
   - Itens [INCERTO] / [INFERIDO]

## Criterio de pronto
A feature esta pronta quando: `/verificar` passa; migracao (se houver) aplicada pelo usuario no projeto dev e confirmada; reversao escrita e revisada; tipos refletem o schema; revisor sem apontamento bloqueante; relato entregue. Faltando qualquer um, nao esta pronta — dizer isso em vez de arredondar.

## Cuidados
- Um objetivo por PR: bug ou divida encontrada no caminho vai para "Pendencias" do relato, nao para o diff.
- Nao adicionar dependencias sem aprovacao.
- Nao criar policy `using (true)` nem usar service role "para simplificar". Se parece que so da com service role, voltar ao passo 2: provavelmente a regra esta na camada errada.
- Preco, noites e status nunca vem do cliente.
- Nunca rodar comandos contra producao (`supabase db push`, `migration up --linked`, `vercel --prod`, `psql` remoto). Os hooks bloqueiam, mas o fluxo certo e: Claude escreve a migracao, o humano aplica no dev e decide o deploy.