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
  // push, remoto e gh (M0-16)
  ['P', 'git push origin chore/x'],
  ['P', 'git push -u origin feat/m1-09'],
  ['P', 'git push --set-upstream origin fix/a.b'],
  ['P', 'git status && git push origin chore/x'],
  ['P', 'git remote -v'],
  ['P', 'gh pr create --base develop --title x --body-file f.md'],
  ['P', 'gh pr create --title x --body-file f.md'],
  ['P', 'gh pr view 3'],
  ['P', 'gh pr checks 3'],
  ['B', 'git push'],
  ['B', 'git push origin'],
  ['B', 'git push origin develop'],
  ['B', 'git push origin MAIN'],
  ['B', 'git push origin master'],
  ['B', 'git push origin HEAD'],
  ['B', 'git push origin HEAD:main'],
  ['B', 'git push origin feat/x:main'],
  ['B', 'git push origin +feat/x'],
  ['B', 'git push origin refs/heads/main'],
  ['B', 'git push -f origin feat/x'],
  ['B', 'git push --force-with-lease origin feat/x'],
  ['B', 'git push origin --delete feat/x'],
  ['B', 'git push upstream feat/x'],
  ['B', 'git push --all origin'],
  ['B', 'git push --tags origin'],
  ['B', 'git -C . push origin main'],
  ['B', 'git -c a=b push origin feat/x:main'],
  ['B', 'git push origin feat/x && git push origin main'],
  ['B', 'git push origin feat/x\ngit push origin develop'],
  ['B', 'git remote add evil https://example.com/x.git'],
  ['B', 'git remote set-url origin https://example.com/x.git'],
  ['B', '(git push origin main)'],
  ['B', '{ git push origin main; }'],
  ['B', 'echo x && (git push origin develop)'],
  ['B', '(git remote add evil https://example.com/x.git)'],
  ['B', 'git --git-dir x push origin main'],
  ['B', 'git --work-tree x push origin main'],
  ['B', 'git -p push origin main'],
  ['B', 'git remote -v add x y'],
  ['B', 'git config remote.origin.pushurl https://example.com/x.git'],
  ['B', 'git config remote.origin.url https://example.com/x.git'],
  ['B', 'git config url.https://example.com/.insteadOf https://github.com/'],
  ['B', 'git config alias.p push'],
  ['B', 'git -c alias.p=push p origin main'],
  ['B', 'git -c alias.p=push p'],
  ['B', 'git -calias.p=push p'],
  ['B', 'git --config-env=alias.p=X p'],
  ['B', 'git -c core.sshCommand=x fetch'],
  ['P', 'git -c user.name=x log'],
  ['P', 'git config user.name x'],
  ['B', 'gh pr create -Bmain --title x'],
  ['B', 'gh pr create --head main --title x'],
  ['B', 'gh pr merge 3'],
  ['B', 'gh pr close 3'],
  ['B', 'gh pr create --base main --title x'],
  ['B', 'gh pr create --repo a/b --title x'],
  ['B', 'gh api -X PUT repos/x/y/pulls/3/merge'],
  ['B', 'gh repo delete x/y'],
  ['B', 'gh auth token'],
  // bypass de caixa, caminho, .exe, quoting, wrapper e variavel (revisor, rodada 1)
  ['B', '/usr/bin/git push origin main'],
  ['B', 'git.exe push origin main'],
  ['B', '"C:\\Git\\git.exe" push --force origin x'],
  ['B', '(git push origin main)'],
  ['B', 'bash -c "git push origin main"'],
  ['B', "sh -c 'git push --force origin x'"],
  ['B', 'GIT push origin main'],
  ['B', 'Git.exe push -f origin x'],
  ['B', 'git "push" origin main'],
  ['B', "git 'push' origin main"],
  ['B', 'git p\\ush origin main'],
  ['B', 'g=push; git $g origin main'],
  ['B', 'git push${IFS}origin${IFS}main'],
  ['B', 'git --git-dir x push origin main'],
  ['B', 'git --work-tree . push origin main'],
  ['B', 'git -p push origin main'],
  ['B', 'git config remote.origin.url https://example.com/x.git'],
  ['B', 'git config remote.origin.pushurl https://example.com/x.git'],
  ['B', 'git config alias.pp "push --force"'],
  ['B', 'git remote -v set-url origin https://example.com/x.git'],
  ['B', '/usr/bin/gh pr merge 3'],
  ['B', 'gh.exe pr merge 3'],
  ['B', 'bash -c "gh pr merge 3"'],
  ['B', 'env gh pr merge 3'],
  ['B', 'xargs gh pr merge'],
  ['B', '(gh pr merge 3)'],
  ['B', 'gh pr create --base develop --base main --title x'],
  ['B', 'gh pr create -Bmain --title x'],
  ['B', 'gh pr create -Rowner/repo --title x'],
  ['B', 'gh pr create --head fork:branch --title x'],
  ['B', 'gh pr view 3 --web'],
  ['B', 'git -c alias.x=push x origin main'],
  ['B', 'git send-pack https://example.com/x.git main'],
  ['B', 'git credential fill'],
  // regressoes: uso legitimo que nao pode bloquear
  ['P', 'git push -u origin feat/a 2>&1'],
  ['P', 'git push origin feat/a > out.txt'],
  ['P', 'git commit -m "docs: git push origin main"'],
  // limite documentado: texto "git push" em titulo/corpo de PR bloqueia (fail-closed); use --body-file
  ['B', 'gh pr create --base develop --title "docs: git push origin main" --body-file f.md'],
  ['P', 'git push origin feat/a | cat'],
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