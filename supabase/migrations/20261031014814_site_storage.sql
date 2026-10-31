-- ============================================================
-- MIGRAÇÃO: bucket "site" para logo e foto principal (M1-05)
-- Data: 2026-10-30 (UTC 2026-10-31)
-- Objetivo: guardar imagens de marca do hotel fora do repositório.
--   Leitura pública; escrita, troca e remoção só de admin (is_admin()).
-- Escopo atual: bucket único (single-tenant). No M2 o caminho passa a
--   tenants/<id>/... e as policies ganham o predicado de tenant.
-- Ordem de aplicação: 2/3.
--
-- Reversão: bloco "-- down:" no final. O bucket não é apagado por SQL
--   (o Supabase bloqueia DELETE direto em storage.*): esvaziar e excluir pelo
--   dashboard (Storage) depois de remover as policies.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site', 'site', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "public_read_site_images" on storage.objects;
create policy "public_read_site_images" on storage.objects
  for select using (bucket_id = 'site');

drop policy if exists "admin_insert_site_images" on storage.objects;
create policy "admin_insert_site_images" on storage.objects
  for insert with check (bucket_id = 'site' and public.is_admin());

-- update é necessário para substituir o arquivo (upsert) sem apagar antes.
drop policy if exists "admin_update_site_images" on storage.objects;
create policy "admin_update_site_images" on storage.objects
  for update using (bucket_id = 'site' and public.is_admin())
  with check (bucket_id = 'site' and public.is_admin());

drop policy if exists "admin_delete_site_images" on storage.objects;
create policy "admin_delete_site_images" on storage.objects
  for delete using (bucket_id = 'site' and public.is_admin());

-- ============================================================
-- down:
-- drop policy if exists "admin_delete_site_images" on storage.objects;
-- drop policy if exists "admin_update_site_images" on storage.objects;
-- drop policy if exists "admin_insert_site_images" on storage.objects;
-- drop policy if exists "public_read_site_images" on storage.objects;
-- -- depois: dashboard > Storage > bucket "site" > esvaziar e excluir
-- ============================================================
