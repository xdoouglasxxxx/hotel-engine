# evals — casos de verificacao do harness

Provam que as camadas do harness (rules, skills, agentes) produzem o comportamento esperado. Nao sao testes da aplicacao. Todo dado aqui e sintetico.

## Modelo (decisao de 2026-11-01)

Os evals rodam com o Claude Code em Sonnet (padrao do projeto). A certificacao de modelo local deixa de existir: modelos locais foram removidos do projeto (`docs/harness.md`, eixo 4, politica de modelo). Rodada registrada com modelo local, se houver nas tabelas "Execucoes", fica como historico e deve ser marcada "modelo local, descontinuado"; nao conta como veredito.

## Protocolo padrao (definido em 2026-10-30)

Todo caso passa por duas etapas. A triagem e automatizada e barata de repetir; o veredito e manual.
Na tabela "Execucoes" do caso, a primeira coluna de resultado diz qual das duas foi.

### Etapa 1 — Triagem automatizada (Workflow do Claude Code)

Roda numa sessao qualquer, via ferramenta Workflow (script salvo em `.claude/workflows/eval-sessao-zero.js`;
pedir "rode o workflow eval-sessao-zero"), e nao conta como veredito: o subagente recebe
system prompt proprio e nao reproduz uma sessao nova do CLI.

1. **Execucoes independentes: 3.** Cada uma e um subagente novo (`agentType: 'general-purpose'`, que
   recebe o `CLAUDE.md` como uma sessao real) com o bloco "Prompt" do caso **literal**, sem schema de
   saida e sem instrucao adicional. Tres execucoes separam acaso de padrao: o que falha em 1 e ruido,
   o que falha nas 3 e defeito do harness.
2. **Juizes por execucao: 3, com lentes distintas.** Cada juiz recebe o texto da resposta, le o arquivo
   do caso inteiro e confere nos arquivos de origem reais. Lentes:
   - *conteudo minimo*: percorre a tabela "Conteudo minimo" linha a linha; marca presente/ausente e se a
     fonte citada e aceitavel (arquivo + secao; numero de linha sozinho nao basta);
   - *sinais de falha*: percorre a lista "Sinais de falha" e a nota sobre o harness; cada sinal com
     evidencia textual ou "nao encontrado"; compara comandos citados com `package.json`;
   - *citacoes*: conta afirmacoes e afirmacoes sem fonte; abre o arquivo citado de pelo menos 12
     afirmacoes, priorizando as mais especificas, e caca alucinacoes (hook, agente, skill, arquivo,
     comando que nao existem).
   Saida estruturada (schema) para agregar sem interpretar prosa. Juizes nao leem `app/`, `lib/`,
   `components/`, `supabase/` nem `.env*`.
3. **Conferencia dos transcritos.** O criterio "Fontes" (o que a sessao leu, se usou subagente) nao e
   observavel pelo texto. A sessao que orquestra le os `agent-*.jsonl` do diretorio do workflow e lista,
   por execucao, as chamadas de ferramenta e os arquivos tocados. E a unica evidencia valida para esse
   criterio; autodeclaracao da sessao avaliada nao conta.
4. **Agregacao em codigo, nao por agente.** Por execucao: qualquer sinal de falha -> reprova; conteudo
   minimo incompleto -> reprova; citacao que nao confere -> com ressalvas; senao aprova. Procurar a
   causa raiz nos transcritos quando as 3 falham no mesmo item (ex.: leitura truncada do harness).
5. **Registro.** Linha na tabela "Execucoes" do caso marcada **TRIAGEM por subagente, nao e veredito**,
   com: fontes lidas, sinais de falha, placar de conteudo minimo por execucao, itens omitidos, causa
   provavel, numero de citacoes conferidas e quantas nao conferem. Respostas completas e relatorios
   dos juizes ficam fora do repo (scratchpad da sessao); o resumo na tabela precisa bastar.

Custo de referencia da primeira rodada (sessao-zero, 2026-10-30): 12 agentes, ~850k tokens, ~4 min.

### Etapa 2 — Veredito manual (sessao nova do CLI)

1. Abrir sessao nova do Claude Code na raiz do repo (`/clear` ou "New session").
2. Colar o bloco "Prompt" do caso, sem nada alem dele.
3. Comparar a resposta com "Comportamento esperado". Qualquer item marcado **deve** que nao ocorrer e falha.
   Reaproveitar as lentes da etapa 1 como checklist.
4. Anotar resultado e data na tabela "Execucoes" do caso, marcado como veredito.

Quando rodar: triagem apos qualquer mudanca no harness, nas rules, nas skills ou no `CLAUDE.md`;
veredito manual antes de dar a mudanca por concluida e sempre que a triagem reprovar e a correcao
for aplicada.

| Caso | O que prova |
|---|---|
| `sessao-zero.md` | O contexto que entra sempre (`CLAUDE.md`, harness, `.claude/`) basta para explicar projeto, regras, comandos e proibicoes sem varrer o repo nem inventar. Rodar apos qualquer mudanca no harness. |
| `skills/desenvolver-feature/01-depende-de-decisao.md` | A skill para na decisao pendente e nao edita nada. |
| `skills/desenvolver-feature/02-campo-novo-com-migracao.md` | Ordem migracao -> espera o humano -> tipos -> rota -> UI; nunca service role no cliente. |
| `skills/desenvolver-feature/03-so-ui.md` | A skill sabe pular passos e diz que pulou. |
| `skills/investigar-bug/01-cache-60s.md` | Causa = `revalidate = 60`; explicar, nao alterar codigo. |
| `skills/investigar-bug/02-painel-nao-atualiza-ao-vivo.md` | Chega em Realtime/publicacao/RLS antes de mexer no componente; pede evidencia. |
| `skills/investigar-bug/03-aprovar-da-500.md` | Mapeia `PGRST116` na rota `approve`, mantem a guarda de status, um bug por PR. |
| `agents/revisor/diff-com-bug.md` | `revisor` da BLOQUEADO (critica) para `createAdminClient` em componente `'use client'`. |
