---
name: investigar-bug
description: Investiga comportamento inesperado neste projeto (Next.js App Router + Supabase) seguindo a cadeia browser -> rota API -> cliente Supabase -> RLS/funcao SQL -> constraint, checando primeiro as causas silenciosas do stack (RLS, `.single()`, cache de 60 s, fuso de datas, sessao admin). Use sempre que o usuario relatar que algo "nao aparece", "sumiu", "da 500", "nao salva", "nao atualiza", "datas erradas", "nao autorizado", "401/403/409" ou "funcionava antes" — no site publico, painel admin, pagina de cancelar ou API — mesmo que nao use a palavra "bug". Nao use para mudanca de requisito ou regra de negocio (isso e `desenvolver-feature`).
---

# Investigar bug

## Problema que resolve
Neste stack a maioria dos bugs nao da erro explicito: RLS devolve lista vazia em vez de 403; `.single()` devolve `PGRST116` quando o `where` nao casa; cache de 60 s esconde mudancas; strings `YYYY-MM-DD` viram `Date` com fuso do servidor. Quem nao conhece isso "corrige" o sintoma no lugar errado. Esta skill forca a checagem dessas causas, em ordem de probabilidade, antes de tocar no codigo.

## Regra central
**Hipotese antes de edicao.** Nenhuma alteracao de codigo ate ter uma causa provavel escrita em uma frase e uma evidencia que a sustente (log do dashboard, resposta HTTP, linha de policy). Se depois de todos os passos nao houver causa, o relato diz isso; nao chutar correcao.

## Passo 0: capturar o relato
Antes de abrir arquivo, fixar por escrito:
- Superficie: publico / admin / cancelar / API direta.
- Acao exata e resultado observado (status HTTP, campo `error` em pt-BR, tela em branco, dado antigo).
- Resultado esperado.
- Reproduz sempre ou as vezes? Desde quando? Mudou algo (deploy, migracao, dado)?
- Usuario logado ou anonimo? Se admin, tem linha em `admins`?
Se algum item faltar e nao for inferivel, perguntar antes de seguir; so pedir o minimo para reproduzir, com dados sinteticos ou mascarados (ver Cuidados).

## Cadeia de investigacao
Seguir em ordem; parar no primeiro elo que explica o sintoma, mas ler o elo seguinte uma vez (bugs aqui costumam ter duas camadas, ex.: RLS vazia + `.single()` virando 500).

1. **Mapear o ponto de entrada.** Acao -> rota em `app/api/**/route.ts` ou escrita direta do browser (`RoomEditor`, `MomentsManager`, `CalendarManager`). Ler a rota ou o componente inteiro, nao so o trecho suspeito.
2. **Qual cliente Supabase?** `client.ts` (anon, RLS), `server.ts` (anon + cookies, RLS) ou `admin.ts` (service role). Com anon e resultado vazio/nulo, suspeitar de RLS/policy antes de qualquer outra coisa: ler as policies da tabela em `supabase/schema.sql` e `migration-momentos.sql` (buscar por `create policy` + nome da tabela, nao confiar em numero de linha).
3. **Erro Postgres mapeado?**
   - `23P01` -> constraint `no_double_booking`; esperado, deve virar 409. Se virou 500, o mapeamento na rota esta faltando.
   - `PGRST116` -> `.single()` sem linha. Checar cada `.eq`/`.in` do `where`; caso tipico: aprovar reserva que ja nao esta `pending`.
   - Outro codigo -> procurar no `types/database.ts` e nas funcoes SQL antes de assumir bug de app.
4. **Cache.** `app/(public)/page.tsx` e `app/api/rooms` usam `revalidate = 60`; painel e `force-dynamic`. "Nao atualizou no site" ha menos de 1 min nao e bug; explicar ao usuario e encerrar, salvo se persistir.
5. **Datas.** Comparar como a string foi convertida: `new Date(s + 'T00:00:00')` no cliente vs `new Date()` / parse implicito no servidor (`app/api/bookings/route.ts`, funcao de criacao). Fuso do host (Vercel = UTC) difere do Brasil; sintomas: noite a menos, disponibilidade deslocada em 1 dia, reserva "no passado".
6. **Sessao/admin.** `middleware.ts` so cobre `/admin` e `/login`; `/api/admin/*` depende de `requireAdmin()` (cookie valido + linha em `admins`). Login OK mas 401 = usuario sem linha em `admins`, nao bug de auth.
7. **Realtime.** `AdminDashboard` assina `bookings`; depende da publicacao em `schema.sql` (buscar `publication`) e da RLS do usuario logado. Painel nao atualiza ao vivo mas atualiza no refresh = publicacao ou policy, nao o componente.
8. **Logs e reproducao no dev.** Pedir logs do dashboard Supabase e da Vercel (o usuario cola, com dados mascarados) e reproduzir pela interface ou chamando a rota no projeto dev. Sem acesso ao banco: marcar a causa como [INFERIDO] no relato quando depender de dado.

## Correcao
- Minima e no elo correto: regra de integridade se corrige no Postgres, mapeamento de erro na rota, exibicao na UI. Nao mover a regra de camada para "fazer passar".
- Um bug por PR. Se a investigacao revelar segundo bug ou divida, anotar em "Pendencias" do relato.
- Se a correcao exigir migracao, tipos ou nova regra, seguir `desenvolver-feature` a partir do passo 3.
- Se tocar em rota, dado ou SQL, passar pelo agente `revisor`.

## Validacao
- `/verificar` apos a correcao.
- Reproduzir o caso original e confirmar que o sintoma sumiu; descrever passo a passo.
- `/smoke-test` se afetar o fluxo de reserva.
- Quando couber, deixar o caso coberto (teste ou seed) para nao regredir.

## Relato (formato fixo)
- Sintoma (do passo 0)
- Causa raiz, em uma frase, e a evidencia
- Elos descartados e por que (curto)
- Correcao aplicada e arquivos
- Como foi validado / o que nao pode ser verificado
- Pendencias encontradas e nao corrigidas
- Itens [INCERTO] / [INFERIDO]

## Cuidados
- Nao "corrigir" desligando RLS, trocando para service role, criando policy `using (true)` ou removendo a guarda de status: mascara o bug e abre falha de seguranca.
- Nunca pedir, copiar ou colar dados reais de hospede (nome, telefone, e-mail, reserva) para reproduzir; usar valores sinteticos ou mascarados. Se o usuario colar, nao repetir nos logs nem no relato.
- Nunca consultar o banco diretamente (producao ou dev); usar logs do dashboard e rotas do projeto dev.
- Se o "bug" for na verdade comportamento esperado (cache, cancelamento fora da janela, 409 por overbooking), explicar e nao alterar codigo.