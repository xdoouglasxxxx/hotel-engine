-- ============================================================
-- MIGRAÇÃO: políticas de reserva no banco (M1-07)
-- Data: 2026-10-30 (UTC 2026-10-31)
-- Objetivo: aplicar no Postgres duas regras configuráveis em site_settings:
--   1) mínimo de noites ao criar a pré-reserva (INSERT);
--   2) janela de cancelamento: o HÓSPEDE não cancela reserva APROVADA a menos
--      de cancellation_free_days dias do check-in (UPDATE). Cancelamento pelo
--      proprietário nunca é bloqueado; cancelar pré-reserva pendente é sempre livre.
-- Erros (SQLSTATE próprio; as rotas mapeiam pelo código, não pela mensagem):
--   HE001 = menos noites que o mínimo (detail = mínimo)
--   HE002 = fora da janela de cancelamento
-- Depende de: _site_settings (1/3) e, ANTES de tudo, de schema.sql +
--   migration-cancelamento.sql já aplicados (a função lê bookings.cancelled_by;
--   sem essa coluna, TODO update em bookings falha, inclusive approve/reject).
--   Confirmar no dev: select cancelled_by from bookings limit 1;
-- Ordem de aplicação: 3/3.
-- Premissa: a janela depende de cancelled_by = 'guest', informado pela rota
--   /api/cancel (service role). Quem cancela com outro valor não é bloqueado.
-- Sem linha em site_settings, nenhuma regra é aplicada (comportamento anterior).
--
-- Reversão: bloco "-- down:" no final.
-- ============================================================

-- security definer: a regra precisa ler site_settings mesmo se published = false
-- (o anon não enxergaria a linha). search_path fixo, como as demais funções.
create or replace function public.enforce_booking_policy()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  s record;
begin
  select min_nights, cancellation_free_days, timezone
    into s
    from site_settings
   limit 1;
  if not found then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- "nights" é coluna gerada e ainda não existe em BEFORE INSERT: calcular das datas.
    -- check_out <= check_in fica para a constraint valid_range responder.
    if new.check_out > new.check_in and (new.check_out - new.check_in) < s.min_nights then
      raise exception 'min_nights' using errcode = 'HE001', detail = s.min_nights::text;
    end if;
    return new;
  end if;

  -- UPDATE
  if new.status = 'cancelled'
     and old.status = 'approved'
     and new.cancelled_by = 'guest'
     and s.cancellation_free_days is not null
     and (now() at time zone s.timezone)::date > old.check_in - s.cancellation_free_days then
    raise exception 'cancel_window_closed' using errcode = 'HE002';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_bookings_policy on public.bookings;
create trigger trg_bookings_policy before insert or update on public.bookings
for each row execute function public.enforce_booking_policy();

-- ============================================================
-- down:
-- drop trigger if exists trg_bookings_policy on public.bookings;
-- drop function if exists public.enforce_booking_policy();
-- ============================================================
