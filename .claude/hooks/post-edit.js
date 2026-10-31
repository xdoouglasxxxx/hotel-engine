#!/usr/bin/env node
// PostToolUse hook (Edit|Write|MultiEdit). Le o JSON do stdin, olha o arquivo
// editado e:
//   - exit 2 (erro devolvido ao Claude) quando a service role vaza para codigo
//     cliente ou para fora de lib/supabase/admin.ts + rotas/Server Components;
//   - exit 2 quando um arquivo .env* e escrito (nunca gerar/alterar env com valores);
//   - exit 2 quando os SQL historicos (snapshot) sao editados;
//   - lembrete (additionalContext) para migracoes novas em supabase/migrations.

'use strict';

const fs = require('fs');
const path = require('path');

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => { raw += c; });
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); }
  const fp = input && input.tool_input && input.tool_input.file_path;
  if (!fp) process.exit(0);

  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const rel = path.relative(root, fp).replace(/\\/g, '/');
  const base = path.basename(rel);

  // .env*: nunca escrever (exceto .env.example, que so pode ter placeholders).
  if (/^\.env(\..+)?$/.test(base) && base !== '.env.example') {
    fail(rel + ': arquivos .env* nao devem ser escritos pelo agente. Peca ao proprietario para criar/ajustar localmente.');
  }

  // Snapshot historico do schema: somente leitura.
  if (/^supabase\/(schema|migration-cancelamento|migration-momentos)\.sql$/.test(rel)) {
    fail(rel + ' e snapshot historico. Mudancas de banco vao em supabase/migrations/<timestamp>_<nome>.sql (/nova-migracao).');
  }

  if (/\.(ts|tsx|js|jsx|mjs)$/.test(rel)) {
    let src = '';
    try { src = fs.readFileSync(fp, 'utf8'); } catch { process.exit(0); }
    const isClient = /^\s*['"]use client['"]/m.test(src);
    const usesServiceRole = /SUPABASE_SERVICE_ROLE_KEY/.test(src);
    const importsAdmin = /from ['"]@\/lib\/supabase\/admin['"]|lib\/supabase\/admin['"]/.test(src);

    if (isClient && (usesServiceRole || importsAdmin)) {
      fail(rel + ': componente client importa a service role (lib/supabase/admin ou SUPABASE_SERVICE_ROLE_KEY). Proibido pelo CLAUDE.md. Mova a logica para app/api/**/route.ts.');
    }
    if (usesServiceRole && rel !== 'lib/supabase/admin.ts') {
      fail(rel + ': SUPABASE_SERVICE_ROLE_KEY so pode ser lida em lib/supabase/admin.ts. Use createAdminClient().');
    }
    if (importsAdmin && !/^app\/api\/.*\/route\.ts$/.test(rel) && !/^app\/.*\/page\.tsx$/.test(rel) && rel !== 'lib/supabase/admin.ts') {
      fail(rel + ': lib/supabase/admin so e permitido em app/api/**/route.ts ou em Server Components (page.tsx) justificados. Verifique .claude/rules/dados-e-supabase.md.');
    }
  }

  // Migracao nova: lembrete (nao bloqueia).
  if (/^supabase\/migrations\/.+\.sql$/.test(rel)) {
    let src = '';
    try { src = fs.readFileSync(fp, 'utf8'); } catch { /* ignore */ }
    const hasCreateTable = /create table/i.test(src);
    const hasRls = /enable row level security/i.test(src);
    const notes = [];
    if (hasCreateTable && !hasRls) notes.push('create table sem "enable row level security"');
    if (/security definer/i.test(src) && !/set search_path/i.test(src)) notes.push('security definer sem set search_path');
    if (/using\s*\(\s*true\s*\)/i.test(src)) notes.push('policy com using (true)');
    const msg = 'Migracao ' + rel + ' editada. Checklist: RLS + policies, search_path em security definer, reversao comentada, types/database.ts a atualizar, escopo por tenant (quando aplicavel).' +
      (notes.length ? ' ATENCAO: ' + notes.join('; ') + '.' : '');
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: msg },
    }));
    process.exit(0);
  }

  process.exit(0);
});

function fail(msg) {
  process.stderr.write('[hook post-edit] ' + msg + '\n');
  process.exit(2);
}
