-- ============================================================
-- MIGRAÇÃO: Fluxo de cancelamento (proprietário e hóspede)
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
