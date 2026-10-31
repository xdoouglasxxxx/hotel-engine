// Testa os hooks do projeto com entradas sinteticas.
// Uso: node scripts/test-hooks.js [repoRoot]   (sem argumento, usa a raiz do repo)
'use strict';
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const hookBash = path.join(root, '.claude', 'hooks', 'validate-bash.js');
const hookEdit = path.join(root, '.claude', 'hooks', 'post-edit.js');

for (const f of [hookBash, hookEdit, path.join(root, '.claude', 'hooks', 'stop-verify.js')]) {
  if (!fs.existsSync(f)) { console.log('ERR  nao encontrado: ' + f); process.exit(1); }
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  console.log((r.status === 0 ? 'OK  ' : 'ERR ') + 'syntax ' + path.basename(f) + (r.stderr ? ' ' + r.stderr.trim() : ''));
}
try { JSON.parse(fs.readFileSync(path.join(root, '.claude', 'settings.json'), 'utf8')); console.log('OK   settings.json JSON valido'); }
catch (e) { console.log('ERR  settings.json: ' + e.message); }

function run(hook, input) {
  const r = spawnSync(process.execPath, [hook], { input: JSON.stringify(input), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: root } });
  return { code: r.status, err: (r.stderr || '').trim(), out: (r.stdout || '').trim() };
}

console.log('\n--- validate-bash (B=bloqueado, P=passa) ---');
const bashCases = [
  ['B', 'cat .env.local'],
  ['B', 'type .env'],
  ['B', 'Get-Content .env.example'],
  ['B', 'sed -n 1,20p .env.example'],
  ['P', 'cut -d= -f1 .env.example'],
  ['P', "grep -oE '^[A-Z_]+=' .env.example"],
  ['P', 'ls -la .env.example'],
  ['B', 'git push origin main'],
  ['B', 'git reset --hard HEAD~1'],
  ['B', 'git commit --no-verify -m x'],
  ['P', "git commit -m 'feat: x'"],
  ['B', 'supabase db push'],
  ['B', 'supabase migration up --linked'],
  ['P', 'supabase start'],
  ['P', 'supabase db reset'],
  ['B', 'vercel --prod'],
  ['B', 'psql postgresql://x@db.abcdefgh.supabase.co:5432/postgres'],
  ['P', 'psql postgresql://postgres@127.0.0.1:54322/postgres'],
  ['B', 'rm -rf node_modules'],
  ['P', 'npm run build'],
  ['P', 'git log -p | grep -c password'],
  ['P', 'echo environment variables'],
  ['P', 'cat docs/analysis/01-diagnostico-execucao.md'],
  ['B', 'git filter-repo --path README.md'],
  ['B', 'ls; cat .env.local'],
  ['B', 'Select-String -Path .env* -Pattern KEY'],
  ['B', 'cat ".env.local"'],
  ['P', 'ls -la'],
  ['P', 'Get-ChildItem .claude'],
  ['B', 'ls .env.example\ncat .env.local'],
  ['B', 'ls (cat .env.local)'],
  ['B', 'cat .env.local cut -d= -f1'],
  ['B', 'cat .e*'],
  ['P', 'ls .env.example'],
  ['B', 'cat .environment'],
  ['B', 'cat<.env.local'],
  ['B', 'cat .env.local>&2'],
  ['B', 'cat .en[v].local'],
  ['B', 'cat .e{n}v.local'],
  ['B', 'type ".env"'],
  ['B', 'Get-Content -Path .env*'],
  ['P', 'Test-Path .env.local'],
  ['B', 'cat .e[n-n]v'],
  ['B', 'cat .e{n,}v'],
  ['B', 'cat .*'],
  ['B', 'cat ./?nv'],
  ['B', 'cat $(echo .e)nv'],
  ['B', 'a=.e;cat $a\'\'nv'],
  ['P', "grep '.*foo' README.md"],
  ['B', 'gc -Path:.env.local'],
  ['B', 'cat .env.local,x'],
  ['B', 'cat .ENV'],
  ['P', "grep -E -o '^[A-Z_]+=' .env.example"],
  ['P', 'cut -d= -f1 .env.example'],
];
let fails = 0;
for (const [exp, cmd] of bashCases) {
  const r = run(hookBash, { tool_name: 'Bash', tool_input: { command: cmd } });
  const got = r.code === 2 ? 'B' : 'P';
  const ok = got === exp;
  if (!ok) fails++;
  console.log((ok ? 'ok  ' : 'FAIL') + ' esperado ' + exp + ' obtido ' + got + ' | ' + cmd + (got === 'B' ? '  -> ' + r.err.replace('[hook validate-bash] BLOQUEADO: ', '') : ''));
}

console.log('\n--- post-edit (B=bloqueado, P=passa, C=passa com contexto) ---');
const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'hooktest-'));
// Arquivos sinteticos escritos em um clone de estrutura dentro do tmp para nao tocar o repo.
const fakeRoot = path.join(tmp, 'repo');
const editCases = [
  ['B', 'components/public/Bad.tsx', "'use client';\nimport { createAdminClient } from '@/lib/supabase/admin';\n"],
  ['B', 'components/public/Bad2.tsx', "'use client';\nconst k = process.env.SUPABASE_SERVICE_ROLE_KEY;\n"],
  ['B', 'lib/other.ts', "const k = process.env.SUPABASE_SERVICE_ROLE_KEY;\n"],
  ['P', 'app/api/x/route.ts', "import { createAdminClient } from '@/lib/supabase/admin';\n"],
  ['P', 'app/cancelar/[id]/page.tsx', "import { createAdminClient } from '@/lib/supabase/admin';\n"],
  ['B', 'components/admin/Bad3.tsx', "import { createAdminClient } from '@/lib/supabase/admin';\n"],
  ['P', 'lib/supabase/admin.ts', "const k = process.env.SUPABASE_SERVICE_ROLE_KEY;\n"],
  ['B', 'supabase/schema.sql', '-- x\n'],
  ['B', '.env.local', 'X=1\n'],
  ['P', '.env.example', 'X=\n'],
  ['C', 'supabase/migrations/20260101000000_x.sql', 'create table t (id int);\n'],
  ['C', 'supabase/migrations/20260101000001_y.sql', 'create table t (id int);\nalter table t enable row level security;\n'],
  ['P', 'components/public/Good.tsx', "'use client';\nimport { createClient } from '@/lib/supabase/client';\n"],
];
for (const [exp, rel, content] of editCases) {
  const p = path.join(fakeRoot, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  const r = spawnSync(process.execPath, [hookEdit], { input: JSON.stringify({ tool_name: 'Write', tool_input: { file_path: p } }), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: fakeRoot } });
  const got = r.status === 2 ? 'B' : (r.stdout && r.stdout.includes('additionalContext') ? 'C' : 'P');
  const ok = got === exp;
  if (!ok) fails++;
  const extra = got === 'B' ? '  -> ' + (r.stderr || '').trim().replace('[hook post-edit] ', '') : got === 'C' ? '  -> ' + JSON.parse(r.stdout).hookSpecificOutput.additionalContext.slice(0, 110) + '...' : '';
  console.log((ok ? 'ok  ' : 'FAIL') + ' esperado ' + exp + ' obtido ' + got + ' | ' + rel + extra);
}
console.log('\n--- stop-verify (B=bloqueado, P=passa; typecheck simulado) ---');
const hookStop = path.join(root, '.claude', 'hooks', 'stop-verify.js');
const failCmd = 'node -e "process.exit(1)"';
function stopRepo(name, { nodeModules, files }) {
  const dir = path.join(tmp, name);
  fs.mkdirSync(dir, { recursive: true });
  if (nodeModules) fs.mkdirSync(path.join(dir, 'node_modules'));
  spawnSync('git', ['init', '-q'], { cwd: dir });
  for (const f of files) fs.writeFileSync(path.join(dir, f), 'x\n');
  return dir;
}
const stopCases = [
  ['P', 'stop_hook_active true', { nodeModules: true, files: ['a.ts'] }, { stop_hook_active: true }],
  ['P', 'sem node_modules', { nodeModules: false, files: ['a.ts'] }, {}],
  ['P', 'so .md no diff', { nodeModules: true, files: ['notas.md'] }, {}],
  ['B', 'typecheck falha com .ts no diff', { nodeModules: true, files: ['a.ts', 'notas.md'] }, {}],
];
stopCases.forEach(([exp, label, setup, input], i) => {
  const dir = stopRepo('stop' + i, setup);
  const r = spawnSync(process.execPath, [hookStop], { input: JSON.stringify(input), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: dir, STOP_VERIFY_CMD: failCmd } });
  const got = r.status === 2 && /typecheck falhou/.test(r.stderr) ? 'B' : (r.status === 0 ? 'P' : '?');
  const ok = got === exp;
  if (!ok) fails++;
  console.log((ok ? 'ok  ' : 'FAIL') + ' esperado ' + exp + ' obtido ' + got + ' | ' + label);
});

fs.rmSync(tmp, { recursive: true, force: true });
console.log('\nFALHAS: ' + fails);
process.exit(fails ? 1 : 0);