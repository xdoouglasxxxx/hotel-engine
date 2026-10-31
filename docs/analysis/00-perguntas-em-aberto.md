# 00 — Perguntas em aberto e decisões pendentes

> Consolidação de tudo marcado **[INCERTO]** nos documentos 01-03 e das decisões de negócio que só o proprietário pode tomar. Ordenado por impacto. Ao decidir, registre uma linha datada na seção "Decisões" de `CLAUDE.md`.

## Impacto alto — bloqueiam o desenho do multi-tenant

| # | Pergunta | Por que importa | Onde aparece |
|---|---|---|---|
| 1 | **Modelo de tenant**: tenant → propriedades → quartos (como diz `CLAUDE.md`)? Um tenant pode ter várias propriedades desde o início? | Define FKs, policies, Storage, Realtime e navegação do painel. | `03 §9-10` |
| 2 | **Resolução de tenant por request**: subdomínio (`hotel.produto.com`), domínio próprio do cliente, ou path (`/hotel`)? | Afeta `middleware.ts`, metadata, links de cancelamento, PWA (manifest/scope), SEO. | `03 §9` |
| 3 | **Plataforma de dados**: manter Supabase (Auth, RLS, Realtime, Storage) ou Postgres puro com auth própria? | Define o "docker compose" local (Supabase CLI ≈ 10 containers), a estratégia de isolamento (RLS vs. código) e o custo por tenant. | `01 §3.3, §8` |
| 4 | **Quarto = unidade física ou tipo com N unidades?** O texto público fala em 6 unidades; o seed tem 3 quartos. | O modelo atual só permite 1 reserva por linha de `rooms` por noite. Hotéis reais precisam de tipo × inventário. | `02 §3`, `03 §9` |
| 5 | **Isolamento**: RLS tenant-aware (mantendo escrita direta do browser) ou tudo via rotas API com service role + filtro explícito? | Determina onde o `tenant-auditor` precisa olhar e quanto do painel é reescrito. | `02 §8`, `03 §10 item 10` |

## Impacto médio — definem o produto

| # | Pergunta | Por que importa |
|---|---|---|
| 6 | O produto continua sendo **pré-reserva aprovada manualmente, sem pagamento**? Ou entra PSP (tokenizado), sinal, política de cancelamento, impostos/taxas? | Hoje não existe nada disso. Pagamento traz escopo de PCI (só via tokenização do provedor, conforme `CLAUDE.md`). |
| 7 | **Moeda e centavos**: `price_per_night integer` em reais serve? Produto será só BRL/pt-BR/America-Sao_Paulo no início? | Mudar depois exige migração de dados e de toda a exibição. |
| 8 | **Tarifação**: diária fixa por quarto basta para os primeiros clientes, ou temporadas/fins de semana/mínimo de noites são requisito de entrada? | Hoje: `nights × price_per_night`. |
| 9 | Quais features viram **opcionais por tenant**: Momentos, WhatsApp, PWA, autocancelamento por token, Realtime, depoimentos, mapa? | Define flags/configuração por tenant. |
| 10 | **Papéis**: `owner` e `manager` existem no schema mas não são usados. Quais papéis o produto precisa (dono, gerente, recepção, super-admin da plataforma)? | Autorização atual é binária. |
| 11 | Canais de notificação além do WhatsApp manual (e-mail, push)? | Hoje nada é automático. |

## Impacto médio — reanimação e repositório

| # | Pergunta | Por que importa |
|---|---|---|
| 12 | **Runtime**: fixar Node 20 LTS ou validar Node 26 (versão local)? | Next 14.2 não foi validado em Node 26. |
| 13 | Ficar em **Next 14.2.35** na reanimação e só depois ir para 15/16? (Recomendado pelo princípio "mínimo necessário".) | 14.2.15 declarado está deprecated por segurança; o caret já resolve para 14.2.35. |
| 14 | **Histórico git**: reescrever para remover dados do cliente e e-mail pessoal do autor, ou começar repositório novo para o produto? | Dados pessoais ficam no histórico mesmo após remoção dos arquivos. |
| 15 | Posso considerar o Supabase CLI local (`supabase start`) como o "docker compose equivalente", ou você quer um `docker-compose.yml` próprio também para o app? | Esforço e manutenção diferentes. |
| 16 | Há **Docker Desktop** disponível na máquina de desenvolvimento? (Não foi encontrado no PATH.) | Pré-requisito do Supabase CLI local. |

## Confirmações factuais [INCERTO]

| # | Pergunta | Contexto |
|---|---|---|
| 17 | O que há em `.env.example`? Só placeholders ou valores reais (a linha 9 tem formato de telefone)? | Leitura bloqueada pela política do ambiente; posso só listar nomes de variáveis. |
| 18 | Os 6 depoimentos em `components/public/Testimonials.tsx` são de pessoas reais? | Se sim, são dados pessoais a remover antes de publicar. |
| 19 | O projeto Supabase original foi perdido (`CLAUDE.md`). Existe algum backup com dados de hóspedes que precise de exclusão (LGPD)? | Nada de hóspedes está no repositório. |
| 20 | As fotos em `public/images/` mostram pessoas? Há direito de uso fora do site do cliente anterior? | Serão substituídas por placeholders sintéticos no produto. |
| 21 | O cliente anterior continuará usando o sistema (precisa de migração de dados) ou o produto nasce sem clientes ativos? | Define se há compatibilidade a manter. |
| 22 | Confirma que a verificação do Google Search Console (`public/google*.html`) e o perfil Instagram devem ser removidos? | Pertencem à conta do cliente. |

## O que NÃO depende de resposta (pode começar após sua aprovação)

- Gerar lockfile, fixar runtime, criar `supabase/migrations/` a partir dos 3 SQL, seed sintético, `.env.local` local, scripts `typecheck`/`smoke`.
- Remover `lucide-react` não usado.
- Corrigir `.gitignore` para ignorar `.env` e `.env.*` (hoje só `.env*.local`). *(Feito em 2026-10-29 junto com a estrutura do Claude Code.)*
