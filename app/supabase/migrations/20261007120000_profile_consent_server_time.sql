-- student_profiles.consented_at becomes server-owned.
--
-- Before this migration the browser sent `new Date().toISOString()` on every
-- profile save (src/data/repository.ts saveStudentProfile), so:
--   1. every later save overwrote the original consent time, and
--   2. a skewed or forged client clock was stored verbatim.
-- Now the database sets it once, from its own clock, when the profile row is
-- first created, and keeps it on every update. Any client-sent value is ignored,
-- so app builds that still send the field keep working.
--
-- Existing rows keep their current value: the original consent times that
-- earlier saves overwrote cannot be recovered.

create or replace function public.student_profiles_pin_consent()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.consented_at = pg_catalog.clock_timestamp();
  else
    new.consented_at = old.consented_at;
  end if;
  return new;
end;
$$;

revoke all on function public.student_profiles_pin_consent() from public, anon, authenticated;

-- BEFORE triggers run before the NOT NULL check, so an insert without the column also works.
create trigger student_profiles_pin_consent
before insert or update on public.student_profiles
for each row execute function public.student_profiles_pin_consent();

comment on column public.student_profiles.consented_at is
  'Server time when the profile was first saved with consent. Set by trigger student_profiles_pin_consent; never changed by later saves or taken from the client clock.';
