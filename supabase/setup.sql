-- ════════════════════════════════════════════════════════════════
-- Bloom · migración v5: editar publicaciones
-- Pegalo en Dashboard → SQL Editor → Run. Es idempotente (se puede correr varias veces).
-- Es lo mismo que la sección 7 de supabase/setup.sql.
-- ════════════════════════════════════════════════════════════════

-- 7) Editar publicaciones ---------------------------------------------
-- Cuándo se editó por última vez (null = nunca se editó)
alter table public.pets add column if not exists updated_at timestamptz;

-- Valores válidos para los campos que se guardan "tal cual" (not valid = no toca filas viejas;
-- se exige en cada alta y en cada edición)
alter table public.pets drop constraint if exists pets_values_check;
alter table public.pets add constraint pets_values_check
  check (
    (gender is null or gender in ('Macho', 'Hembra', 'Desconocido'))
    and (size is null or size in ('Pequeño/a', 'Mediano', 'Grande'))
    and (age is null or age in ('Cachorro', 'Joven', 'Adulto', 'Senior'))
    and char_length(coalesce(breed, '')) <= 60
  ) not valid;

-- Al editar, una persona logueada NO puede cambiar de dueño, ni la fecha de alta
-- (evita saltearse el tope diario o "subir" la publicación), ni el estado
-- (perdido / encontrado / adopción). Desde el SQL Editor (sin sesión) se puede todo.
create or replace function private.protect_pet_on_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null then
    new.user_id    := old.user_id;
    new.created_at := old.created_at;
    if (case when new.status = 'adopt' then 'adoption' else new.status end)
       is distinct from
       (case when old.status = 'adopt' then 'adoption' else old.status end) then
      raise exception 'status_locked';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.protect_pet_on_update() from public, anon, authenticated;

drop trigger if exists pets_protect_update on public.pets;
create trigger pets_protect_update
  before update on public.pets
  for each row execute function private.protect_pet_on_update();