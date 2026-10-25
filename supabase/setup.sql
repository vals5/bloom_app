-- ════════════════════════════════════════════════════════════════
-- Bloom · preparación de Supabase  (v2)
-- Pegalo en Dashboard → SQL Editor → Run.
-- Es idempotente: se puede correr más de una vez (también si ya corriste la v1).
-- ════════════════════════════════════════════════════════════════

-- 1) pets: columnas que usa la app -----------------------------------
alter table public.pets add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.pets add column if not exists description text;
-- default aparte: así las publicaciones viejas quedan con user_id nulo
alter table public.pets alter column user_id set default auth.uid();

-- El WhatsApp ya NO se guarda en pets (esa tabla es pública). Ahora vive en `profiles`.
alter table public.pets drop column if exists contact_whatsapp;

create index if not exists pets_created_at_idx on public.pets (created_at desc);
create index if not exists pets_user_id_idx    on public.pets (user_id);

-- 2) pets: todos leen, cada persona maneja solo lo suyo ---------------
alter table public.pets enable row level security;

drop policy if exists "pets_select_all" on public.pets;
create policy "pets_select_all" on public.pets
  for select to anon, authenticated using (true);

drop policy if exists "pets_insert_own" on public.pets;
create policy "pets_insert_own" on public.pets
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "pets_update_own" on public.pets;
create policy "pets_update_own" on public.pets
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "pets_delete_own" on public.pets;
create policy "pets_delete_own" on public.pets
  for delete to authenticated using ((select auth.uid()) = user_id);

-- 3) profiles: datos de contacto, SOLO para personas logueadas --------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  whatsapp   text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
grant select, insert, update on public.profiles to authenticated;

-- Una persona logueada puede ver su propio perfil y el de quienes tienen publicaciones
-- (para poder contactarlos). El resto de los usuarios no es visible para nadie.
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or exists (select 1 from public.pets p where p.user_id = profiles.id)
  );

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- El perfil se crea solo al registrarse, con el nombre y WhatsApp del formulario.
-- La función vive en un esquema privado (no queda expuesta como API).
create schema if not exists private;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, whatsapp)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'whatsapp')
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Perfiles para las cuentas que ya existían
insert into public.profiles (id, full_name, whatsapp)
select id, raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'whatsapp'
from auth.users
on conflict (id) do nothing;

-- 4) favorites: guardados en la cuenta (se ven desde cualquier dispositivo)
-- pet_id toma el mismo tipo que pets.id (uuid o bigint), sea cual sea el tuyo.
do $$
declare id_type text;
begin
  select format_type(atttypid, atttypmod) into id_type
  from pg_attribute where attrelid = 'public.pets'::regclass and attname = 'id';

  execute format($f$
    create table if not exists public.favorites (
      user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
      pet_id     %s   not null references public.pets (id) on delete cascade,
      created_at timestamptz not null default now(),
      primary key (user_id, pet_id)
    )$f$, id_type);
end $$;

create index if not exists favorites_pet_id_idx on public.favorites (pet_id);
alter table public.favorites enable row level security;
grant select, insert, delete on public.favorites to authenticated;

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
  for delete to authenticated using (user_id = (select auth.uid()));

-- 5) Storage: bucket público para las fotos ---------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pet-photos', 'pet-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Cada persona sube/borra solo dentro de su carpeta: <user_id>/archivo.jpg
drop policy if exists "pet_photos_insert_own" on storage.objects;
create policy "pet_photos_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "pet_photos_select_own" on storage.objects;
create policy "pet_photos_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "pet_photos_delete_own" on storage.objects;
create policy "pet_photos_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
