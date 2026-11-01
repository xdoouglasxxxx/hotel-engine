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

  // 2) Push, remoto do git e GitHub CLI: allowlist estrita, fail-closed (M0-16).
  //    A barreira real e o ruleset remoto de develop/main; isto e defesa em profundidade.
  const remoteGit = checkGitRemote(cmd);
  if (remoteGit) return remoteGit;

  // 2b) Git destrutivo.
  const gitRules = [
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

// Fail-closed (M0-16). O comando e normalizado em duas variantes (aspas removidas; barra invertida
// virando `/` ou sumindo) e cada segmento (separado por ; && || | & ( ) { } ou quebra de linha) que
// contenha `git` junto de `push`, ou `gh`, precisa casar inteiro com a forma permitida. Sem diferenca
// de caixa, `.exe` ou caminho absoluto. Variavel (`$x`) no mesmo segmento que git/push bloqueia.
// Segmento `git commit ...` e exento (mensagem pode citar push; prefira `git commit -F`).
function checkGitRemote(raw) {
  const base = raw.replace(/\$\{ifs\}/gi, ' ').replace(/['"]/g, '').replace(/\d*>&\d+|&>\S*/g, ' ');
  const variants = [base.replace(/[\\]/g, '/'), base.replace(/[\\]/g, '')];
  const gitTok = /(^|[\s(){=\/:])git(\.exe)?(?=\s|$)/i;
  const ghTok = /(^|[\s(){=\/:])gh(\.exe)?(?=\s|$)/i;
  // Opcoes globais do git entre `git` e o subcomando (-C x, -c k=v, --git-dir x, -p, --no-pager...).
  const gitOpts = /(\s+-\S+(\s+[^-\s]\S*)?)*/.source;
  const gitHead = /(^|[\s(){\/])git(\.exe)?/.source;
  const remoteRe = new RegExp(gitHead + gitOpts + /\s+remote(\s+-\S+)*\s+(add|set-url|rename|remove|rm|set-head|set-branches)\b/.source, 'i');
  const configRe = new RegExp(gitHead + gitOpts + /\s+config\b.*(remote\.|url\.|pushurl|insteadof|alias\.|core\.(sshcommand|hookspath))/.source, 'i');
  const pushOk = /^git push( -u| --set-upstream)? origin ([A-Za-z0-9_][A-Za-z0-9._\/-]*)$/i;
  const protectedBranch = /^(main|master|develop|head)$/i;
  const refPrefix = /^(refs|heads|remotes|tags)\//i;
  const PUSH_MSG = 'git push so e permitido como `git push [-u] origin <branch-de-trabalho>`: sem force, delete, refspec (:), --all/--tags, outro remoto, wrapper (bash -c, env, xargs), variavel ou quoting.';

  for (const v of variants) {
    const vs = v.replace(/[ \t]+/g, ' ');
    if (remoteRe.test(vs)) {
      return 'git remote add/set-url/rename/remove altera o destino do push; o remoto e sempre origin.';
    }
    if (configRe.test(vs)) {
      return 'git config de remote/url/pushurl/insteadOf/alias/sshCommand/hooksPath redireciona o push ou contorna hooks.';
    }
    if (gitTok.test(vs) && /(^|\s)(-c ?|--config-env[ =]?)\S*(alias\.|remote\.|url\.|pushurl|insteadof|core\.sshcommand|core\.hookspath)/i.test(vs)) {
      return 'git -c / --config-env com alias/remote/url/pushurl/insteadOf/sshCommand/hooksPath contorna a allowlist de push.';
    }
    if (gitTok.test(vs) && /(^|\s)(send-pack|http-push|svn|credential|receive-pack|fast-export)(\s|$)/i.test(vs)) {
      return 'git send-pack/http-push/svn/credential/receive-pack enviam refs ou expoem credenciais; use `git push origin <branch>`.';
    }
    for (const seg of vs.split(/&&|\|\||[;&|\n(){}]/)) {
      // redirecionamento de saida no fim do segmento nao altera o comando
      const s = seg.replace(/\s*\d*>>?\s*\S+/g, '').replace(/ +/g, ' ').trim();
      if (!s || /^git commit( |$)/i.test(s)) continue;
      const hasPush = /(^|\s)push(\s|$)/i.test(s);
      if ((gitTok.test(s) && hasPush) || (/\$/.test(s) && hasPush)) {
        const m = pushOk.exec(s);
        if (!m) return PUSH_MSG;
        if (protectedBranch.test(m[2]) || refPrefix.test(m[2])) {
          return 'push para main/develop/master/HEAD e proibido: use branch de trabalho e PR (ruleset remoto).';
        }
      }
      if (gitTok.test(s) && /\$/.test(s)) {
        return 'variavel em comando git pode esconder um push; escreva o subcomando por extenso.';
      }
      const gm = ghTok.exec(s);
      if (gm) {
        if (s.slice(0, gm.index).trim() !== '' || /^(\S*\/)/.test(s.slice(gm.index).trim().split(' ')[0])) {
          return 'gh so e permitido como primeira palavra do comando, sem caminho, wrapper ou variavel de ambiente.';
        }
        const g = s.slice(gm.index).trim().replace(/^\S+/, 'gh');
        if (/^gh pr (view|list|status|checks|diff)( |$)/i.test(g)) {
          if (/(^| )(--web|-w)( |$)/.test(g)) return 'gh pr view --web abre o navegador; use sem --web.';
          continue;
        }
        if (/^gh pr create( |$)/i.test(g)) {
          if (/(^| )(--repo|-R)/.test(g)) return 'gh pr create so no repositorio atual (sem --repo).';
          if (/(^| )(--head|-H)/.test(g)) return 'gh pr create usa a branch atual (sem --head).';
          if (/(^| )(--web|-w)( |$)/.test(g)) return 'gh pr create --web abre o navegador; use --title/--body-file.';
          for (const b of g.matchAll(/(?:^| )(?:--base[ =]?|-B ?)(\S*)/g)) {
            if (b[1] !== 'develop') return 'PR do agente aponta para develop (--base develop).';
          }
          continue;
        }
        return 'gh so permite `pr create` e leitura (`pr view/list/status/checks/diff`); merge, close, review, api, repo e demais sao do humano.';
      }
    }
  }
  return null;
}
