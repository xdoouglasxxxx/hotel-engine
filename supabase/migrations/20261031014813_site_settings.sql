-- ============================================================
-- MIGRAÇÃO: site_settings (configuração do hotel; M1-02)
-- Data: 2026-10-30 (UTC 2026-10-31)
-- Objetivo: tirar marca, textos, contato, horários e regras simples de reserva
--   do código e guardá-los numa linha editável pelo painel.
-- Decisões em vigor: D1 só BRL até o M2 (coluna currency presa em 'BRL');
--   D2 tenants + tenant_id + RLS (entra no M2: esta tabela ganha tenant_id e
--   o índice site_settings_singleton é removido lá).
-- Escopo atual: UMA linha (single-tenant), garantida por índice único.
-- ATENÇÃO: esta tabela é lida pelo público (anon). Nunca colocar aqui chave,
--   token, segredo de gateway nem dado de hóspede.
-- Ordem de aplicação: 1/3 (depois: _site_storage, _booking_policy).
--
-- Reversão: bloco "-- down:" no final.
-- ============================================================

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  published boolean not null default true,

  -- Site e marca
  name text not null check (char_length(name) between 1 and 120),
  tagline text check (char_length(tagline) <= 160),
  description text check (char_length(description) <= 2000),
  address text check (char_length(address) <= 240),
  city text check (char_length(city) <= 80),
  state text check (char_length(state) <= 40),
  country text not null default 'BR' check (country ~ '^[A-Z]{2}$'),
  phone_public text check (phone_public ~ '^[0-9]{10,15}$'),   -- só dígitos, com DDI (ex.: 55 + DDD + número)
  email_public text check (char_length(email_public) <= 160 and email_public ~ '^[^@[:space:]]+@[^@[:space:]]+$'),
  instagram text check (instagram ~ '^[A-Za-z0-9._]{1,30}$'),  -- usuário, sem @
  domain text check (domain ~ '^[a-z0-9]([a-z0-9.-]{0,251}[a-z0-9])?$' and domain !~ '\.\.'),
  -- caminhos no bucket "site": sem "/" inicial e sem ".."
  logo_path text check (logo_path ~ '^[A-Za-z0-9_][A-Za-z0-9/_.-]{0,199}$' and logo_path !~ '\.\.'),
  hero_image_path text check (hero_image_path ~ '^[A-Za-z0-9_][A-Za-z0-9/_.-]{0,199}$' and hero_image_path !~ '\.\.'),

  -- Moeda e fuso (D1: só BRL; relaxar a constraint numa migração do M2)
  currency char(3) not null default 'BRL' check (currency = 'BRL'),
  timezone text not null default 'America/Sao_Paulo',

  -- Políticas e horários (aplicados no banco pela migração _booking_policy)
  checkin_time time not null default '14:00',
  checkout_time time not null default '12:00',
  min_nights int not null default 1 check (min_nights between 1 and 30),
  -- Cancelamento pelo hóspede de reserva APROVADA só até N dias antes do check-in.
  -- NULL = sem restrição (comportamento anterior). Não implica reembolso (M4-04).
  cancellation_free_days int check (cancellation_free_days between 0 and 365),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Single-tenant: no máximo uma linha. Removido no M2 (tenant_id unique).
create unique index if not exists site_settings_singleton on public.site_settings ((true));

-- Um fuso inválido quebraria a regra de cancelamento (now() at time zone ...),
-- e CHECK não aceita subconsulta; por isso a validação é por trigger.
create or replace function public.site_settings_validate()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (select 1 from pg_timezone_names where name = new.timezone) then
    raise exception 'timezone invalido: %', new.timezone using errcode = '22023';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_site_settings_validate on public.site_settings;
create trigger trg_site_settings_validate before insert or update on public.site_settings
for each row execute function public.site_settings_validate();

drop trigger if exists trg_site_settings_touch on public.site_settings;
create trigger trg_site_settings_touch before update on public.site_settings
for each row execute function public.touch_updated_at();

-- ---------- RLS ----------
alter table public.site_settings enable row level security;

-- Público lê só enquanto o site estiver publicado; admin lê sempre.
drop policy if exists "public_read_site_settings" on public.site_settings;
create policy "public_read_site_settings" on public.site_settings
  for select using (published = true or public.is_admin());

-- Admin cria e edita. Sem policy de delete: ninguém apaga a configuração pela API.
drop policy if exists "admin_insert_site_settings" on public.site_settings;
create policy "admin_insert_site_settings" on public.site_settings
  for insert with check (public.is_admin());

drop policy if exists "admin_update_site_settings" on public.site_settings;
create policy "admin_update_site_settings" on public.site_settings
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------- SEED SINTÉTICO ----------
-- Hotel fictício. Sem cidade, endereço, telefone ou e-mail reais.
-- phone_public fica nulo de propósito: o site esconde os links de WhatsApp até o admin preencher.
insert into public.site_settings (name, tagline, description, address, city, state)
values (
  'Hotel Engine Demo',
  'Hospedagem de demonstração',
  'Texto de demonstração. Edite o nome, o slogan e esta descrição em Configurações do hotel.',
  'Rua Exemplo, 0',
  'Cidade Exemplo',
  'UF'
)
on conflict do nothing;

-- ============================================================
-- down: (rodar no SQL Editor para reverter; apaga a configuração)
-- drop trigger if exists trg_site_settings_touch on public.site_settings;
-- drop trigger if exists trg_site_settings_validate on public.site_settings;
-- drop function if exists public.site_settings_validate();
-- drop policy if exists "admin_update_site_settings" on public.site_settings;
-- drop policy if exists "admin_insert_site_settings" on public.site_settings;
-- drop policy if exists "public_read_site_settings" on public.site_settings;
-- drop table if exists public.site_settings;
-- (reverter _booking_policy ANTES: o trigger dela lê esta tabela)
-- ============================================================
