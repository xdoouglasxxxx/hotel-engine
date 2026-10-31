---
description: Roda typecheck, lint e (opcional) build; relata o que passou, falhou e o que nao pode ser verificado.
argument-hint: "[--build]"
allowed-tools: Bash(npx tsc:*), Bash(npm run lint:*), Bash(npm run build:*), Bash(ls:*), Bash(test:*), Read, Grep
---

Verifique o estado do projeto e relate com honestidade.

1. Pre-condicoes:
   - `node_modules/` existe? Se nao, pare e informe: "dependencias nao instaladas; nada foi verificado". Nao instale nada.
   - `.env.local` existe? Nao leia o conteudo. Apenas informe presenca/ausencia (o build precisa dele).
2. Typecheck: `npx tsc --noEmit -p tsconfig.json`. Resuma erros por arquivo.
3. Lint: `npm run lint` (`eslint .`, config flat em `eslint.config.mjs`, nao interativo). Erros contam como falha; warnings sao listados no relato.
4. Se `$ARGUMENTS` contiver `--build`: `npm run build`. Lembre que o build exige Supabase acessivel e internet (Google Fonts). Se falhar por isso, classifique como "bloqueio de ambiente", nao como erro de codigo.
5. Relate em tres blocos: **Passou**, **Falhou (com trecho do erro)**, **Nao verificado (motivo)**.

Nunca edite codigo durante este comando. Se encontrar erros, proponha a correcao e aguarde.
