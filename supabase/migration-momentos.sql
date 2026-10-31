-- ============================================================
-- MIGRAÇÃO: Momentos (galeria viva do proprietário)
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
