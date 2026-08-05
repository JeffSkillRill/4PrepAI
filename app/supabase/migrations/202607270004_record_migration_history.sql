-- Historical production migrations 001-003 were first applied through the SQL
-- Editor. Supabase CLI now owns `supabase_migrations.schema_migrations`, so a
-- migration must never insert its own version into that table. Keep this
-- compatibility migration as an intentional no-op; the CLI records version 004
-- after it succeeds.
select 1;
