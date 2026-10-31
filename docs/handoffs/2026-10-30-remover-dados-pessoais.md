# Handoff: remover dados pessoais do cliente anterior do código-fonte

| Campo | Valor |
|---|---|
| Data | 2026-10-30 |
| Branch | `feat/remover-dados-pessoais` (commit `9528f70`, a partir de `develop`) |
| Skill / fluxo usado | `/varrer-acoplamento` → `desenvolver-feature` → `revisor` → `/verificar` |
| Estado | concluído no código; parcial no repositório (2 pendências só o humano fecha) |
| Próximo passo imediato | Humano: conferir `.env.example` (placeholder falso em `NEXT_PUBLIC_OWNER_WHATSAPP`, adicionar `NEXT_PUBLIC_OWNER_NAME=`) e decidir sobre o nome do dono nos `supabase/*.sql` de snapshot. |
| Contexto mínimo para retomar | `lib/site-config.ts`; `docs/analysis/03-acoplamento-ao-cliente-atual.md` §11; este handoff. |
| Risco se parar aqui | Nenhum funcional. Sem `NEXT_PUBLIC_OWNER_WHATSAPP` no build, o site não mostra botão/links de WhatsApp do anfitrião (comportamento intencional). |

## 1. Objetivo
Remover do código-fonte todo dado pessoal do cliente anterior (nome do proprietário, nomes de hóspedes em depoimentos, telefone hardcoded e fallbacks), substituindo por placeholders neutros configuráveis por env; marca, textos geográficos e imagens só inventariados.

## 2. Arquivos
- `lib/site-config.ts` — criado. Lê `NEXT_PUBLIC_OWNER_WHATSAPP` (dígitos, sem fallback) e `NEXT_PUBLIC_OWNER_NAME` (opcional); expõe saudação, telefone formatado e E.164.
- `components/public/BookingForm.tsx` — saudação e link de WhatsApp via config; link só se houver número; mensagem por `waLink()`; placeholder de telefone neutro.
- `components/public/Footer.tsx` — link de WhatsApp condicional com número vindo da env.
- `components/public/WhatsAppFloat.tsx` — não renderiza sem número.
- `app/cancelar/[id]/CancelClient.tsx` — saudação via config; bloco de aviso por WhatsApp condicional; mensagem por `waLink()`.
- `app/cancelar/[id]/page.tsx` — texto de link inválido mostra o número da env ou aponta para `/#contato`.
- `app/layout.tsx` — JSON-LD `telephone` vem da env (omitido se vazio).
- `components/public/About.tsx`, `RoomsSection.tsx` — nome do dono → `NEXT_PUBLIC_OWNER_NAME` ou "o(s) proprietário(s)".
- `components/public/Testimonials.tsx` — 6 autorias neutras ("Hóspede"); menção ao dono no 1º texto removida; `key` por índice.
- `components/admin/AdminDashboard.tsx`, `CalendarManager.tsx` — comentários com o primeiro nome neutralizados.
- `README.md` — nome do dono removido; documenta `NEXT_PUBLIC_OWNER_WHATSAPP` e `NEXT_PUBLIC_OWNER_NAME`.
- `CLAUDE.md` §4 — nova env var na lista de nomes.
- `docs/analysis/03-acoplamento-ao-cliente-atual.md` — linhas F atualizadas, linhas A superadas marcadas, novo §11 (delta).
- `docs/analysis/01-diagnostico-execucao.md:56` — texto do fallback atualizado.
- Migração: nenhuma.

## 3. Passos pulados e por que
- Passo 3 (banco) e 4 (tipos) — nenhum dado novo; mudança só de UI/config/docs.
- Passo 5 (rota) — nenhuma rota de API tocada.
- `/smoke-test` — sem ambiente de execução com Supabase nesta sessão; fluxo de reserva não mudou de lógica (só textos/links).

## 4. Verificado / não verificado
| Item | Como | Resultado |
|---|---|---|
| Typecheck | `npx tsc --noEmit -p tsconfig.json` (2x, antes e depois dos ajustes do revisor) | passou (exit 0) |
| Build | `npm run build` (2x) | passou (exit 0); aviso pré-existente de fonte `Nunito Sans` |
| Lint | `npm run lint` | não verificado: sem config de ESLint, o comando abre prompt interativo (não respondido) |
| Grep de sobras | nome completo, primeiro nome, sobrenomes dos depoimentos, regex de telefone, excluindo `docs/**`, `.claude/**`, `public/images|icons/**`, `node_modules/**`, `package-lock.json` | zero em `app/`, `components/`, `lib/`, `README.md`. Restam `supabase/schema.sql:214,217`, `supabase/migration-cancelamento.sql:2` (nome, snapshots) e `.env.example:9` (telefone, [INCERTO]); `scripts/test-hooks.js:76,77` é falso positivo |
| `revisor` | 2 passadas | 1ª: APROVADO COM RESSALVAS (todas baixas/médias); 2ª: **APROVADO**. Itens resolvidos: beco sem saída em `cancelar/[id]/page.tsx`, encoding das mensagens, nota de nome único no README, docs 01/03 |
| Teste manual no browser | — | não feito (sem `npm run dev` nesta sessão) |

**Não verificado**: lint (sem config); renderização real com e sem envs; `.env.example` (leitura bloqueada por política); inlining de `NEXT_PUBLIC_*` via módulo compartilhado em Client Components é [INFERIDO] da documentação do Next 14, confirmado só pelo build passar.

## 5. Pendências
- **Humano** — `.env.example`: confirmar que `NEXT_PUBLIC_OWNER_WHATSAPP` tem placeholder obviamente falso e acrescentar `NEXT_PUBLIC_OWNER_NAME=`; o README manda copiar esse arquivo. O agente não lê nem escreve `.env*`.
- **Decisão** — nome do dono em `supabase/schema.sql:214,217` (comentários da instrução de criar admin) e `supabase/migration-cancelamento.sql:2` (comentário de cabeçalho). CLAUDE.md §6 proíbe editar esses snapshots. Opções: (a) autorizar edição pontual dos comentários; (b) aceitar até a base limpa da fase multi-tenant. Enquanto isso, o critério "grep retorna zero" não fecha nesses 3 pontos.
- **Histórico git** — todos os dados continuam nos commits anteriores (doc 03 §8); decisão em `00-perguntas-em-aberto.md`.
- **Fora de escopo, ainda no código** — marca, endereço/coordenadas, Instagram (`Footer.tsx`), fallbacks de domínio (`layout.tsx`, `robots.ts`, `sitemap.ts`), `public/google*.html`, imagens.
- **Dívida menor** — `About.tsx` concorda o verbo no singular com `NEXT_PUBLIC_OWNER_NAME`; documentado no README como "um único nome".
- `.claude/settings.json` modificado no working tree (allowlist de leitura pedida em sessão anterior); não entrou neste commit.

## 6. [INCERTO] / [INFERIDO]
- [INCERTO] `.env.example:9` contém o telefone real ou um placeholder; confirma-se abrindo o arquivo (humano).
- [INCERTO] `.env.local` existe localmente: Glob não encontrou, mas pode respeitar `.gitignore`; o build passou sem precisar dele.
- [INFERIDO] Next 14 inlina `process.env.NEXT_PUBLIC_*` acessado literalmente em `lib/site-config.ts` nos bundles de cliente e servidor; mudar a variável na Vercel exige novo build.
- [INFERIDO] Os 6 depoimentos eram de pessoas reais (pergunta 18 do doc 00); tratados como reais.

## 7. Decisões propostas (não registradas)
- `- 2026-10-30: identidade do anfitriao (nome e WhatsApp) vem so de NEXT_PUBLIC_OWNER_NAME / NEXT_PUBLIC_OWNER_WHATSAPP via lib/site-config.ts; nenhum fallback com dado real no codigo. Sem a variavel, o texto usa "o proprietario" e os links de WhatsApp do anfitriao nao sao renderizados.`
- `- 2026-10-30: [a decidir] nome do dono nos comentarios de supabase/schema.sql e migration-cancelamento.sql: editar snapshot (excecao pontual) ou manter ate a base limpa.`
