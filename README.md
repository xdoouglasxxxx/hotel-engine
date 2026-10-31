# Hotel Engine — Site + Motor de Reservas + Painel Admin

Sistema completo para uma pousada ou pequeno hotel:

- **Site público** com calendário de disponibilidade real e pré-reserva online
- **Painel admin (PWA)** instalável no celular do proprietário, com aprovação em 1 clique
- **Tempo real**: nova pré-reserva aparece no painel na hora (Supabase Realtime)
- **WhatsApp**: ao aprovar/recusar, abre a conversa com o hóspede com a mensagem pronta
- **SEO**: metadata, Open Graph, JSON-LD (LodgingBusiness), sitemap.xml, robots.txt
- **100% em serviços gratuitos**: Vercel (hobby) + Supabase (free tier)

Stack: Next.js 14 (App Router) · TypeScript · Tailwind · Supabase (Auth, Postgres, Storage, Realtime).

---

## 1. Criar o projeto no Supabase (grátis)

1. Acesse https://supabase.com → **New project** (região `sa-east-1` / São Paulo).
2. Guarde a **senha do banco** em local seguro (não será usada no código).
3. Vá em **SQL Editor → New query**, cole todo o conteúdo de `supabase/schema.sql` e clique **Run**.
   - Isso cria tabelas, políticas de segurança (RLS), funções, o bucket de fotos e 3 suítes de exemplo.

### Criar o usuário do proprietário

1. **Authentication → Users → Add user** → e-mail + senha forte → marque **Auto Confirm User**.
2. Copie o **UUID** do usuário criado.
3. No SQL Editor, rode:
   ```sql
   insert into admins (id, name, role) values ('UUID_COPIADO_AQUI', 'NOME_DO_PROPRIETARIO', 'owner');
   ```

### Pegar as chaves

Em **Settings → API**, copie:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **secreta — só no servidor, nunca no navegador nem no git**

---

## 2. Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha com as chaves acima
npm run dev                  # http://localhost:3000
```

Além das chaves do Supabase, o `.env.local` define a identidade do anfitrião (nenhum
nome ou telefone fica no código):

- `NEXT_PUBLIC_SITE_URL` — URL pública do site.
- `NEXT_PUBLIC_OWNER_WHATSAPP` — WhatsApp do anfitrião, só dígitos com DDI (ex.: `55` + DDD + número).
  Sem ele, os botões e links de WhatsApp do anfitrião não são exibidos.
- `NEXT_PUBLIC_OWNER_NAME` — opcional; um único nome (ex.: `Maria`), usado em saudações e textos
  no singular. Sem ele, os textos dizem "o proprietário".

- Site público: `http://localhost:3000`
- Painel: `http://localhost:3000/admin` (redireciona para `/login`)

---

## 3. Deploy grátis na Vercel

1. Suba o código para um repositório no GitHub (confira que `.env.local` **não** foi commitado — o `.gitignore` já cuida disso).
2. https://vercel.com → **Add New → Project** → importe o repositório.
3. Em **Environment Variables**, adicione as variáveis do `.env.example`
   (em produção, `NEXT_PUBLIC_SITE_URL=https://seu-dominio.exemplo`).
4. **Deploy**. Depois, em **Settings → Domains**, aponte o domínio `seu-dominio.exemplo`
   (no registrador, crie um CNAME `www → cname.vercel-dns.com` e um A `@ → 76.76.21.21`).

> Alternativa Netlify: funciona também (runtime Next.js automático), mas a Vercel tem
> melhor suporte nativo ao App Router — por isso é a recomendada aqui.

---

## 4. Instalar o PWA no celular do proprietário

**Android (Chrome):** abrir `https://SEU-DOMINIO/admin` → fazer login → menu ⋮ → **Adicionar à tela inicial**.
**iPhone (Safari):** abrir a mesma URL → botão Compartilhar → **Adicionar à Tela de Início**.

O app abre direto no painel. Com ele aberto, novas pré-reservas aparecem em tempo real
(com aviso visual e vibração no Android).

> **Notificações push com o app fechado** não estão incluídas (exigiriam Web Push/FCM).
> Alternativa gratuita e simples: manter o e-mail de notificação do Supabase ou usar um
> webhook do banco para um serviço como ntfy.sh. Posso adicionar se você quiser.

---

## 5. Fluxo de reserva

1. Cliente escolhe a suíte → o calendário mostra apenas datas livres (reservas aprovadas + bloqueios).
2. Cliente envia a pré-reserva → **preço calculado no servidor** (nunca confia no navegador).
3. O proprietário recebe no painel em tempo real → **Aprovar** ou **Recusar** em 1 clique.
4. Ao aprovar: a data some do site automaticamente e abre o WhatsApp com a mensagem de confirmação pronta.
5. O banco tem uma **trava física anti-overbooking** (constraint de exclusão): é impossível aprovar duas reservas sobrepostas, mesmo em cliques simultâneos.

## 6. Gestão pelo painel

- **Reservas**: pendentes no topo com contador; histórico abaixo.
- **Calendário**: bloquear/liberar dias manualmente (manutenção, reserva por telefone).
- **Quartos**: editar nome, preço, capacidade, comodidades, fotos (upload direto para o Supabase Storage) e ocultar/exibir no site.

---

## Notas de segurança (importante)

- O schema entregue **corrige três problemas** do rascunho original:
  1. RLS da tabela `admins` sem policy fazia as policies de admin nunca passarem → resolvido com a função `is_admin()` (security definer).
  2. Insert público em `bookings` permitia preço/datas arbitrários → removido; a pré-reserva passa pela API `/api/bookings`, que valida disponibilidade e calcula o preço no servidor.
  3. Sem proteção contra overbooking → adicionada constraint `no_double_booking` (GiST).
- `SUPABASE_SERVICE_ROLE_KEY` é usada apenas em rotas de API no servidor (`lib/supabase/admin.ts` importa `server-only`).
- Rotas `/api/admin/*` verificam sessão **e** presença na tabela `admins`.
- O service worker nunca cacheia `/api` nem chamadas ao Supabase.
- Dados pessoais dos hóspedes (nome/telefone/e-mail) ficam apenas no seu Supabase, protegidos por RLS; colete somente o necessário e apague reservas antigas periodicamente (LGPD).

## Limites do plano gratuito

- **Supabase Free**: 500MB de banco, 1GB de storage, pausa após 7 dias sem uso — abra o painel pelo menos 1x/semana ou configure um ping (ex.: cron do GitHub Actions).
- **Vercel Hobby**: mais que suficiente para o tráfego de uma pousada.

## Licença

Copyright (C) 2026 Hotel Engine contributors. Distribuído sob a licença GNU AGPL-3.0 (ver `LICENSE`).
