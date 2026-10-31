-- ===== schema.sql =====
-- ============================================================
-- HOTEL ENGINE - Schema completo (versão corrigida e segura)
-- Execute no Supabase: SQL Editor -> New query -> colar -> Run
-- ============================================================

create extension if not exists btree_gist;

-- ---------- TABELAS ----------

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  description text,
  price_per_night integer not null check (price_per_night > 0), -- em reais
  capacity int default 2 check (capacity > 0),
  amenities jsonb default '[]',
  images jsonb default '[]',
  active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  guest_name text not null,
  guest_phone text not null,
  guest_email text,
  check_in date not null,
  check_out date not null,
  nights int generated always as (check_out - check_in) stored,
  total_price integer not null,
  status text default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint valid_range check (check_out > check_in),
  -- PROTECAO ANTI-OVERBOOKING: duas reservas APROVADAS do mesmo quarto
  -- nunca podem ter datas sobrepostas (nem em condicao de corrida).
  constraint no_double_booking exclude using gist (
    room_id with =,
    daterange(check_in, check_out) with &&
  ) where (status = 'approved')
);

create index if not exists idx_bookings_room_dates on bookings (room_id, check_in, check_out);
create index if not exists idx_bookings_status on bookings (status);

create table if not exists blocked_dates (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  date date not null,
  reason text,
  created_at timestamptz default now(),
  unique(room_id, date)
);

create table if not exists admins (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text default 'manager'
);

-- ---------- FUNCOES ----------

-- CORRECAO IMPORTANTE: no schema original, "admins" tinha RLS ligado sem
-- nenhuma policy. Assim, o subquery "select id from admins" dentro das
-- policies retornava 0 linhas e NENHUM admin conseguiria ver nada.
-- Solucao: funcao security definer, que ignora RLS de forma controlada.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from admins where id = auth.uid());
$$;

-- Datas ocupadas de um quarto (aprovadas + bloqueios manuais).
create or replace function public.get_occupied_dates(p_room_id uuid, p_start date, p_end date)
returns table(occupied date)
language sql
security definer
set search_path = public
stable
as $$
  select d::date from generate_series(p_start, p_end, interval '1 day') d
  where exists (
    select 1 from bookings
    where room_id = p_room_id
      and status = 'approved'
      and d::date >= check_in
      and d::date < check_out
  )
  or exists (
    select 1 from blocked_dates
    where room_id = p_room_id and date = d::date
  );
$$;

-- Verificacao atomica de disponibilidade (usada pela API antes de inserir)
create or replace function public.is_range_available(p_room_id uuid, p_check_in date, p_check_out date)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (
    select 1 from bookings
    where room_id = p_room_id
      and status = 'approved'
      and daterange(check_in, check_out) && daterange(p_check_in, p_check_out)
  )
  and not exists (
    select 1 from blocked_dates
    where room_id = p_room_id
      and date >= p_check_in and date < p_check_out
  );
$$;

grant execute on function public.get_occupied_dates(uuid, date, date) to anon, authenticated;
grant execute on function public.is_range_available(uuid, date, date) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists trg_bookings_touch on bookings;
create trigger trg_bookings_touch before update on bookings
for each row execute function public.touch_updated_at();

-- ---------- RLS ----------

alter table rooms enable row level security;
alter table bookings enable row level security;
alter table blocked_dates enable row level security;
alter table admins enable row level security;

drop policy if exists "public_read_rooms" on rooms;
create policy "public_read_rooms" on rooms
  for select using (active = true or is_admin());

-- SEGURANCA: NAO existe policy de insert publico em bookings.
-- No schema original, qualquer pessoa podia inserir reserva com
-- total_price arbitrario. Agora toda pre-reserva passa pela API
-- (/api/bookings), que valida datas e calcula o preco no servidor.

drop policy if exists "admin_all_rooms" on rooms;
create policy "admin_all_rooms" on rooms for all
  using (is_admin()) with check (is_admin());

drop policy if exists "admin_all_bookings" on bookings;
create policy "admin_all_bookings" on bookings for all
  using (is_admin()) with check (is_admin());

drop policy if exists "admin_all_blocked" on blocked_dates;
create policy "admin_all_blocked" on blocked_dates for all
  using (is_admin()) with check (is_admin());

drop policy if exists "admin_read_self" on admins;
create policy "admin_read_self" on admins for select using (id = auth.uid());

-- ---------- REALTIME ----------
do $$ begin
  alter publication supabase_realtime add table bookings;
exception when duplicate_object then null;
end $$;

-- ---------- STORAGE ----------
insert into storage.buckets (id, name, public)
values ('rooms', 'rooms', true)
on conflict (id) do nothing;

drop policy if exists "public_read_room_images" on storage.objects;
create policy "public_read_room_images" on storage.objects
  for select using (bucket_id = 'rooms');

drop policy if exists "admin_write_room_images" on storage.objects;
create policy "admin_write_room_images" on storage.objects
  for insert with check (bucket_id = 'rooms' and is_admin());

drop policy if exists "admin_delete_room_images" on storage.objects;
create policy "admin_delete_room_images" on storage.objects
  for delete using (bucket_id = 'rooms' and is_admin());

-- ---------- SEED: 3 tipos de suite ----------
-- As imagens iniciais apontam para /images/* (arquivos locais do site).
-- Quando o proprietário enviar fotos pelo painel, as URLs do Storage substituem estas.
insert into rooms (name, slug, description, price_per_night, capacity, amenities, images, sort_order) values
('Suite Padrao', 'suite-padrao',
 'Suite confortavel para hospedes que buscam praticidade.',
 250, 2,
 '["Wi-Fi","Ar-condicionado","TV Smart","Estacionamento"]',
 '[]', 1),
('Suite Superior', 'suite-superior',
 'Suite ampla com mais espaco e conforto para a estadia.',
 380, 3,
 '["Wi-Fi","Ar-condicionado","TV Smart","Frigobar","Estacionamento"]',
 '[]', 2),
('Suite Master', 'suite-master',
 'Nossa suite mais completa, ideal para grupos pequenos.',
 520, 4,
 '["Wi-Fi","Ar-condicionado","TV Smart","Frigobar","Cozinha equipada","Estacionamento"]',
 '[]', 3)
on conflict (slug) do nothing;

-- admin: inserir via docs/harness.md > bootstrap dev


-- ===== migration-cancelamento.sql =====
-- ============================================================
-- MIGRAÇÃO: Fluxo de cancelamento (o proprietario e hóspede)
-- Rodar UMA VEZ no Supabase > SQL Editor > New query > Run
-- Seguro para rodar em produção (não apaga nada).
-- ============================================================

-- Colunas de auditoria + token de autocancelamento do hóspede
alter table public.bookings
  add column if not exists cancel_reason text,
  add column if not exists cancelled_by text check (cancelled_by in ('owner','guest')),
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancel_token uuid not null default gen_random_uuid();

-- Índice para busca por token (página pública de cancelamento)
create index if not exists idx_bookings_cancel_token on public.bookings (cancel_token);

-- Observação: nenhum ajuste é necessário no calendário/anti-overbooking.
-- A constraint no_double_booking e as funções get_occupied_dates /
-- is_range_available já consideram apenas status = 'approved';
-- ao mudar para 'cancelled', as datas ficam livres automaticamente.


-- ===== migration-momentos.sql =====
-- ============================================================
-- MIGRAÇÃO: Momentos no Hotel Engine (galeria viva do proprietário)
-- Rodar UMA VEZ no Supabase > SQL Editor > Run
-- ============================================================

create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  caption text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.gallery_photos enable row level security;

-- Público vê apenas fotos ativas
drop policy if exists "public_read_gallery" on public.gallery_photos;
create policy "public_read_gallery" on public.gallery_photos
  for select using (active = true or is_admin());

-- Admin gerencia tudo
drop policy if exists "admin_write_gallery" on public.gallery_photos;
create policy "admin_write_gallery" on public.gallery_photos
  for all using (is_admin()) with check (is_admin());

-- As fotos usam o bucket "rooms" já existente (pasta momentos/),
-- cujas policies de Storage já permitem leitura pública e escrita de admin.


-- ===== grants (bootstrap dev) =====
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
