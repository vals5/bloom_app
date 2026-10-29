-- ════════════════════════════════════════════════════════════════
-- Bloom · preparación de Supabase  (v4)
-- Pegalo en Dashboard → SQL Editor → Run.
-- Es idempotente: se puede correr más de una vez (también si ya corriste la v1).
-- ════════════════════════════════════════════════════════════════

-- 0) Tabla pets: se crea si no existe y se completan TODAS las columnas que usa la app ------
-- (sirve aunque tu tabla la hayas armado a mano con menos columnas: no borra nada de lo que ya tenés)
create table if not exists public.pets (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.pets add column if not exists created_at     timestamptz not null default now();
alter table public.pets add column if not exists name           text;
alter table public.pets add column if not exists status         text;
alter table public.pets add column if not exists type           text;
alter table public.pets add column if not exists breed          text;
alter table public.pets add column if not exists age            text;
alter table public.pets add column if not exists gender         text;
alter table public.pets add column if not exists size           text;
alter table public.pets add column if not exists location       text;
alter table public.pets add column if not exists image_url      text;
alter table public.pets add column if not exists date           text;   -- columna vieja: la app ahora usa created_at
alter table public.pets add column if not exists vaccinated     boolean not null default false;
alter table public.pets add column if not exists neutered       boolean not null default false;
alter table public.pets add column if not exists good_with_kids boolean not null default false;
alter table public.pets add column if not exists house_trained  boolean not null default false;

-- Si una columna vieja era obligatoria (NOT NULL) y la app no la completa, publicar fallaría.
-- Las volvemos opcionales (la clave primaria y las que tienen valor por defecto no se tocan).
do $$
declare c record;
begin
  for c in
    select a.attname
    from pg_attribute a
    left join pg_index i on i.indrelid = a.attrelid and i.indisprimary and a.attnum = any (i.indkey)
    where a.attrelid = 'public.pets'::regclass
      and a.attnum > 0 and not a.attisdropped
      and a.attnotnull and not a.atthasdef
      and a.attidentity = '' and a.attgenerated = ''
      and i.indrelid is null
  loop
    execute format('alter table public.pets alter column %I drop not null', c.attname);
  end loop;

  -- si el id es uuid y no tenía valor automático, se lo ponemos
  if exists (
    select 1 from pg_attribute
    where attrelid = 'public.pets'::regclass and attname = 'id'
      and not atthasdef and attidentity = '' and atttypid = 'uuid'::regtype
  ) then
    alter table public.pets alter column id set default gen_random_uuid();
  end if;
end $$;

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

-- 6) Validaciones y antiabuso: para que cualquiera pueda registrarse sin ensuciar la base ----
-- "not valid" = se exige a partir de ahora; no toca ni rompe las filas que ya tenías.
alter table public.pets drop constraint if exists pets_status_check;
alter table public.pets add constraint pets_status_check
  check (status in ('lost', 'found', 'adoption', 'adopt')) not valid;

alter table public.pets drop constraint if exists pets_type_check;
alter table public.pets add constraint pets_type_check
  check (type in ('perro', 'gato')) not valid;

alter table public.pets drop constraint if exists pets_text_len_check;
alter table public.pets add constraint pets_text_len_check
  check (char_length(name) <= 60 and char_length(location) <= 120 and char_length(coalesce(description, '')) <= 400) not valid;

alter table public.profiles drop constraint if exists profiles_text_len_check;
alter table public.profiles add constraint profiles_text_len_check
  check (char_length(coalesce(full_name, '')) <= 80 and char_length(coalesce(whatsapp, '')) <= 20) not valid;

-- Tope: máximo 10 publicaciones por persona cada 24 horas (cambiá el 10 si querés otro número)
create or replace function private.limit_pets_per_day()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.pets
      where user_id = new.user_id and created_at > now() - interval '24 hours') >= 10 then
    raise exception 'daily_limit';
  end if;
  return new;
end;
$$;
revoke all on function private.limit_pets_per_day() from public, anon, authenticated;

drop trigger if exists pets_daily_limit on public.pets;
create trigger pets_daily_limit
  before insert on public.pets
  for each row execute function private.limit_pets_per_day();
