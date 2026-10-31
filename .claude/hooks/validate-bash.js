#!/usr/bin/env node
// PreToolUse hook (Bash). Le o JSON do stdin, inspeciona `tool_input.command`
// e bloqueia (exit 2 + mensagem no stderr) comandos que violam as regras do
// CLAUDE.md: leitura de .env*, acoes destrutivas no git e qualquer acao em
// Supabase/Vercel remotos (producao). Tudo o mais passa (exit 0).
//
// Para listar apenas NOMES de variaveis de um .env, use uma das formas:
//   cut -d= -f1 .env.example
//   grep -oE '^[A-Z_]+=' .env.example

'use strict';

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => { raw += c; });
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); }
  if (!input || input.tool_name !== 'Bash') process.exit(0);
  const cmd = String((input.tool_input && input.tool_input.command) || '');
  const reason = check(cmd);
  if (reason) {
    process.stderr.write('[hook validate-bash] BLOQUEADO: ' + reason + '\n');
    process.exit(2);
  }
  process.exit(0);
});

function check(cmd) {
  const c = cmd.replace(/\s+/g, ' ');

  // 1) Arquivos .env: proibido ler/imprimir valores.
  //    Deny-by-default pelo nome: normaliza (sem aspas, colchetes, chaves, barra invertida;
  //    sem espacos ao redor de < > | ; &) e bloqueia qualquer `.env` (sem caixa), salvo se o
  //    comando INTEIRO for uma das formas abaixo. Globs de inicio de nome oculto (.e*, .en?,
  //    .?nv) tambem bloqueiam; outros globs ficam fora (limitacao).
  const n = c.replace(/['"\[\]{}\\]/g, '').replace(/ ?([<>|;&]) ?/g, '$1').trim();
  const envForm = /\.env/i.test(n) ||
    /(^|[\s\/=])\.(e|en)[*?]|(^|[\s\/=])\.[*?]nv|(^|[\s\/=])\.e[*?]v/.test(n);
  if (envForm) {
    const allowed = [
      /^cut -d= -f1 \.env\.example$/,
      /^grep (-oE|-Eo|-o -E|-E -o) \^A-Z_\+= \.env\.example$/,
      /^ls( -la)? \.env\.example$/,
      /^Test-Path \.env\.(example|local)$/,
    ];
    if (!allowed.some((re) => re.test(n))) {
      return 'comando referencia um arquivo .env. Nunca ler/imprimir valores. ' +
        'Para listar nomes: cut -d= -f1 .env.example ou grep -oE \'^[A-Z_]+=\' .env.example.';
    }
  }

  //    Heuristica contra expansao de shell (o hook e defesa contra erro, nao contra ma-fe):
  //    argumento iniciado por `.` com glob/chave/colchete, subshell, crase e variavel + nv/env.
  const expansion = c.split(' ').some((t) => /^\.[^]*[\[{*?]/.test(t)) || /\$\(|`/.test(c) ||
    /\$\{?\w+\}?['"]*(nv|env)/i.test(c);
  if (expansion) {
    return 'expansao de shell (glob, chave, colchete, $(), crase ou variavel) em argumento oculto pode alcancar .env. ' +
      'Escreva o nome do arquivo por extenso.';
  }

  // 2) Git destrutivo / remoto.
  const gitRules = [
    [/\bgit push\b/, 'git push e proibido nesta sessao (CLAUDE.md).'],
    [/\bgit reset --hard\b/, 'git reset --hard descarta trabalho.'],
    [/\bgit clean -[a-zA-Z]*f/, 'git clean -f apaga arquivos nao versionados.'],
    [/\bgit (checkout|restore) .*--\s+\./, 'descarte em massa do working tree.'],
    [/--no-verify\b/, '--no-verify pula hooks de commit.'],
    [/\bgit filter-(repo|branch)\b/, 'reescrita de historico exige decisao explicita do proprietario.'],
  ];
  for (const [re, msg] of gitRules) if (re.test(c)) return msg;

  // 3) Supabase / Vercel remotos (producao). Local (supabase start/stop/status/db reset) passa.
  const remoteRules = [
    [/\bsupabase (link|db push|db dump|projects|secrets|functions deploy|migration up --linked)\b/, 'acao em projeto Supabase remoto.'],
    [/\bsupabase .*--linked\b/, 'flag --linked aponta para o projeto remoto.'],
    [/\bvercel\b/, 'CLI da Vercel (deploy/env de producao).'],
    [/\b(psql|pg_dump|pg_restore)\b.*\b([a-z0-9-]+\.supabase\.co|pooler\.supabase\.com)\b/i, 'conexao direta a banco Supabase remoto.'],
    [/\bcurl\b.*\b[a-z0-9-]+\.supabase\.co\b.*\b(service_role|apikey)\b/i, 'chamada a Supabase remoto com chave.'],
  ];
  for (const [re, msg] of remoteRules) if (re.test(c)) return msg;

  // 4) Destrutivo em disco/banco.
  const destructive = [
    [/\brm -rf?\s+(\/|~|\.\.?|\*|"\$HOME"|\$HOME)(\s|$)/, 'rm -rf em raiz/home/cwd.'],
    [/\brm -rf\b/, 'rm -rf esta na lista deny do settings.json.'],
    [/\b(drop (database|schema)|truncate table)\b/i, 'DDL destrutivo direto; use migracao revisada.'],
  ];
  for (const [re, msg] of destructive) if (re.test(c)) return msg;

  return null;
}
