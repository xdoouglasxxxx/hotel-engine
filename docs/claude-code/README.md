# Configuracao do Claude Code neste repositorio

Criada em 2026-10-29 a partir do diagnostico em `docs/analysis/`. Cada item abaixo existe porque resolve um risco ou uma repeticao concreta deste projeto; nao ha pastas "de enfeite".

## Mapa

```
CLAUDE.md                      regras inegociaveis, estado, comandos, decisoes (carregado em toda sessao)
.claude/settings.json          permissoes (deny/ask/allow) + registro dos hooks (versionado)
.claude/settings.local.json    ajustes pessoais (ignorado pelo git)
.claude/rules/
  dados-e-supabase.md          3 clientes Supabase, service role, RLS, migracoes, dados sinteticos
  rotas-api.md                 padrao zod -> regra -> resposta; codigos HTTP; guardas de status
  frontend.md                  Server/Client Components, tokens Tailwind, pt-BR, nao aumentar acoplamento
  verificacao-e-git.md         o que rodar antes de "pronto", convencao de commits, relato honesto
.claude/commands/
  proxima.md                   /proxima               inicio de sessao: le milestones.md, acha a proxima tarefa, propoe o prompt antes de executar
  verificar.md                 /verificar [--build]   typecheck + lint (+ build), relata o nao-verificado
  nova-migracao.md             /nova-migracao <nome>  migracao versionada com checklist de RLS
  smoke-test.md                /smoke-test [url]      fluxo quarto -> disponibilidade -> reserva -> aprovacao -> cancelamento
  varrer-acoplamento.md        /varrer-acoplamento    delta do inventario de hardcoding (doc 03)
.claude/skills/
  investigar-bug/SKILL.md      cadeia browser -> rota -> cliente Supabase -> RLS/SQL; causas silenciosas tipicas
  desenvolver-feature/SKILL.md ordem decisao -> migracao -> tipos -> rota -> UI -> verificacao -> revisao
.claude/agents/
  explorer.md                  leitura: onde/como algo e feito
  tenant-auditor.md            leitura: isolamento entre tenants (fase multi-tenant)
  revisor.md                   leitura: revisao de diff com checklist do projeto
.claude/hooks/
  validate-bash.js             PreToolUse(Bash): bloqueia leitura de .env*, git destrutivo/remoto, Supabase/Vercel remotos
  post-edit.js                 PostToolUse(Edit|Write): bloqueia service role em codigo cliente, escrita em .env*, edicao do schema historico; lembrete em migracoes
docs/analysis/
  00-perguntas-em-aberto.md    decisoes pendentes do proprietario, por impacto
  01-diagnostico-execucao.md   stack, dependencias, env vars, integracoes, plano de reanimacao, smoke test
  02-arquitetura.md            camadas, fluxo da reserva, ER, regras de negocio, auth, qualidade
  03-acoplamento-ao-cliente-atual.md  inventario arquivo:linha (A-F), historico git, top 10
```

## Por que cada peca existe

| Peca | Risco/repeticao que resolve (evidencia no codigo) |
|---|---|
| Regra `dados-e-supabase` | Tres clientes com privilegios distintos (`lib/supabase/*`); service role em rotas publicas; schema sem versionamento (`supabase/*.sql` colados a mao). |
| Regra `rotas-api` | Oito rotas com o mesmo padrao; `reject/route.ts` sem guarda de estado e `approve` devolvendo 500 mostram que o padrao precisa estar escrito. |
| Regra `frontend` | ~20 componentes com marca/telefone/nome do dono embutidos; evitar que cresca enquanto nao ha configuracao por tenant. |
| Regra `verificacao-e-git` | Zero testes, zero CI, sem lockfile: o relato honesto do "nao verificado" e a unica rede de seguranca. |
| `/proxima` | Cada sessao deve comecar pelo estado real em `docs/milestones.md` e nao por memoria do modelo; o comando fixa o protocolo (primeira [ ] com deps [x], gate fechado, prompt nos sete blocos mostrado antes de executar). |
| `/verificar` | `next lint` sem config e interativo e o build depende de Supabase/internet. O comando encapsula isso, relata o nao-verificado e nao instala nada. |
| `/nova-migracao` | `CLAUDE.md` exige migracao versionada e revisada; nao existe `supabase/migrations/` ainda. |
| `/smoke-test` | O criterio de "pronto" da reanimacao (doc 01 §8) e esse fluxo; nao ha criacao de quarto por API, por isso o comando explica a dependencia do seed. |
| `/varrer-acoplamento` | Desacoplar o cliente anterior sera trabalho incremental; o delta contra o doc 03 mede progresso. |
| Skill `investigar-bug` | RLS devolve vazio em vez de erro, `.single()` -> PGRST116 (`approve` vira 500), `revalidate=60`, fuso do servidor: causas silenciosas que ja existem no codigo. |
| Skill `desenvolver-feature` | Tipos manuais, regra no Postgres e rotas com dois clientes Supabase exigem ordem; "um objetivo por PR" do `CLAUDE.md`. |
| Agente `revisor` | Mudancas em rotas publicas com service role sao o ponto mais sensivel; revisao com checklist do projeto antes de commitar. |
| Hook `validate-bash` | Regras "nunca ler .env", "nunca tocar producao" do `CLAUDE.md` viram bloqueio mecanico, cobrindo variantes que a lista `deny` do `settings.json` nao pega (`type`, `Get-Content`, `--linked`, `psql` remoto). |
| Hook `post-edit` | "Nunca usar service role no cliente" vira verificacao a cada edicao de `.ts/.tsx`. Protege o snapshot historico do schema. |

## Como manter
- Mudou uma regra de negocio ou uma decisao? Atualize `CLAUDE.md` (secao Decisoes, uma linha datada) e a regra em `.claude/rules/` que a reflete.
- Novo tipo de tarefa repetitiva (>2 vezes) -> comando em `.claude/commands/`. Novo "ponto de vista" de revisao -> agente. Nova proibicao mecanica -> hook.
- Hooks sao Node puro (sem dependencias) porque Node e o unico runtime garantido na maquina; testam-se com `echo '{"tool_name":"Bash","tool_input":{"command":"..."}}' | node .claude/hooks/validate-bash.js`.
- Comandos listados em `allow` no `settings.json` sao somente leitura/verificacao. Instalacao, commit e reset do banco local permanecem em `ask`.

## Integracoes

**Existentes no repositorio**: nenhuma. Nao ha `.mcp.json`, `AGENTS.md`, `.cursor/`, `.clinerules/` nem `.github/`. As unicas configuracoes de agente sao `CLAUDE.md` e `.claude/` (criadas em 2026-10-28/29).

**Configuradas nesta estruturacao**: nenhuma. Todas as candidatas abaixo exigem credencial ou decisao que nao devem ser inventadas nem versionadas.

**Candidatas** (ordem de utilidade):

```
Integracao:     MCP Supabase (servidor oficial apontando para o Supabase LOCAL ou PAT de projeto de desenvolvimento)
Objetivo:       inspecionar schema, policies e dados sinteticos; rodar SQL de leitura durante a reanimacao e o desenho multi-tenant
O que falta:    Supabase CLI + Docker Desktop instalados; decisao de manter Supabase (doc 00 #3); se remoto, token com escopo somente leitura
Como configurar: .mcp.json com o servidor supabase e --read-only; token via variavel de ambiente local, nunca no arquivo versionado

Integracao:     GitHub (gh CLI ou MCP)
Objetivo:       abrir PRs por objetivo, ler reviews; base para CI futura
O que falta:    gh nao esta instalado; token com escopo minimo (repo) do proprietario
Como configurar: `gh auth login` pelo proprietario; o agente usa gh sem ver o token

Integracao:     Playwright (npm, opcionalmente MCP)
Objetivo:       smoke test de UI (modal de reserva, aprovacao no painel) alem do /smoke-test por HTTP
O que falta:    ambiente local funcionando; decisao de adotar runner de testes (doc 00)
Como configurar: devDependency + script `test:e2e`, so apos aprovacao

Integracao:     Vercel
Objetivo:       preview deploy por PR (ambiente de desenvolvimento, nunca producao via agente)
O que falta:    decisao de hospedagem do produto; conta/projeto do proprietario
Como configurar: pelo painel da Vercel; CLI continua bloqueada pelo hook validate-bash
```

**Nao aplicaveis hoje**: Jira, Slack, monitoramento (Sentry etc.), sistemas de documentacao. Projeto pessoal de um unico desenvolvedor, sem ambiente em execucao; reavaliar quando houver equipe ou ambiente.
