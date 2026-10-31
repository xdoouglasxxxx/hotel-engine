#!/usr/bin/env node
// Stop hook. Quando o agente tenta encerrar o turno, roda o typecheck se houver
// mudanca de codigo. Falhou: exit 2 + stderr (o agente volta a trabalhar).
// Passa (exit 0) quando:
//   - stop_hook_active e true (evita laco de Stop);
//   - node_modules/ nao existe (nada a verificar; /verificar relata);
//   - o working tree so tem .md (ou esta limpo, ou nao e repo git) e o ultimo
//     commit nao mexeu em .ts/.tsx.
// STOP_VERIFY_CMD substitui o comando (usado nos testes); padrao: npm run typecheck.

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => { raw += c; });
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); }
  if (input && input.stop_hook_active) process.exit(0);

  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  if (!fs.existsSync(path.join(root, 'node_modules'))) process.exit(0);
  if (!hasCodeChanges(root)) process.exit(0);

  const cmd = process.env.STOP_VERIFY_CMD || 'npm run typecheck';
  const r = spawnSync(cmd, { cwd: root, shell: true, encoding: 'utf8', timeout: 100000 });
  if (r.status === 0) process.exit(0);

  const out = ((r.stdout || '') + (r.stderr || '')).trim().split('\n').slice(0, 20).join('\n');
  const timedOut = (r.error && r.error.code === 'ETIMEDOUT') || r.signal;
  const head = timedOut
    ? '[hook stop-verify] typecheck excedeu o tempo limite (' + cmd + '); resultado desconhecido.'
    : '[hook stop-verify] typecheck falhou (' + cmd + '). Corrija antes de encerrar.';
  process.stderr.write(head + '\n' + out + '\n');
  process.exit(2);
});

// Working tree (qualquer arquivo que nao seja .md) ou .ts/.tsx do ultimo commit,
// para o typecheck nao ser pulado depois de um git commit.
function hasCodeChanges(root) {
  const git = (args) => spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  const st = git(['status', '--porcelain', '-uall']);
  if (st.status !== 0) return false;
  const dirty = st.stdout.split('\n').filter(Boolean).some((line) => {
    const file = line.slice(3).split(' -> ').pop().replace(/^"|"$/g, '');
    return !/\.md$/i.test(file);
  });
  if (dirty) return true;
  const last = git(['diff', '--name-only', 'HEAD~1', 'HEAD']);
  return last.status === 0 && last.stdout.split('\n').some((f) => /\.tsx?$/.test(f));
}
