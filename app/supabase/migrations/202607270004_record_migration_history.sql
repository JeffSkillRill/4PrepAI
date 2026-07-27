begin;

-- The first launch migrations were applied through the connected dashboard
-- because this workspace does not have a Supabase access token or database
-- password. Record the same ordered history used by the CLI so later
-- `supabase db push` runs do not replay them.
create schema if not exists supabase_migrations;

create table if not exists supabase_migrations.schema_migrations (
  version text primary key,
  statements text[],
  name text
);

insert into supabase_migrations.schema_migrations (version, statements, name) values
  ('202607240001', array['Applied from the checked-in migration through Supabase SQL Editor.'], 'initial_schema'),
  ('202607270002', array['Applied from the checked-in migration through Supabase SQL Editor.'], 'public_mvp_schema'),
  ('202607270003', array['Applied from the checked-in migration through Supabase SQL Editor.'], 'seed_verified_universities'),
  ('202607270004', array['Applied from the checked-in migration through Supabase SQL Editor.'], 'record_migration_history')
on conflict (version) do update
set statements = excluded.statements,
    name = excluded.name;

commit;
