---
description: Varre o codigo por acoplamento ao cliente anterior (marca, dono, telefone, endereco, dominio) e compara com o inventario em docs/analysis/03.
allowed-tools: Bash(git grep:*), Grep, Glob, Read
---

Varra o repositorio por acoplamento ao cliente anterior e produza um delta em relacao a `docs/analysis/03-acoplamento-ao-cliente-atual.md`.

Padroes (ajuste se a secao "Decisoes" de `CLAUDE.md` renomear algo):
- marca, local, endereco, dominio e nome do proprietario anterior: leia os termos, um por linha, de `.claude/acoplamento-termos.local` (arquivo local, fora do git, entao `git grep` nao o le: use `Read` para os termos e `Grep` para buscar; se nao existir, peca ao humano para cria-lo) e busque-os case-insensitive — **no relatorio, escreva apenas "marca", "local", "nome do dono"; nunca o termo**;
- telefone: regex `(\(?[0-9]{2}\)?[ -]?9?[0-9]{4}-?[0-9]{4}|55[0-9]{10,11})` — **relate apenas arquivo:linha, nunca o numero**;
- geo: `latitude`, `longitude`;
- URL: `instagram.com/`, `\.vercel\.app`;
- fallbacks de env: `NEXT_PUBLIC_OWNER_WHATSAPP ||`, `NEXT_PUBLIC_OWNER_WHATSAPP ??`, `NEXT_PUBLIC_SITE_URL ||`.

Excluir: `public/images/**`, `public/icons/**`, `docs/**`, `.claude/**`, `node_modules/**`.

Saida:
1. Tabela `arquivo:linha | categoria (A-F) | descricao curta sem valores sensiveis`.
2. Delta: itens novos (nao listados no doc 03) e itens que sumiram (ja removidos).
3. Contagem por categoria antes/depois.

Nao edite nada. Se o delta for relevante, proponha atualizar o doc 03 e aguarde.
