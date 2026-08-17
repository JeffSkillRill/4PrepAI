-- Adds the two scheduled jobs Production was missing.
--
-- RECOVERED FILE. This migration was applied to both QA and Production on
-- 5 August 2026 but the file was never committed to the repository. The body
-- below was exported verbatim from supabase_migrations.schema_migrations on
-- 17 August 2026 and restored under its recorded version and name.
--
-- Production already has `prune-counselor-operational-data-daily` at 17 3 * * *,
-- scheduled independently. That job is correct and is deliberately left alone --
-- adding a second counselor prune would run the same delete twice, two minutes
-- apart, for no benefit. Only the support-retention and search-index jobs are
-- added here, and they are offset from the existing 03:17 job so no two run at
-- the same minute.
--
-- prune_expired_support_threads() enforces the twelve-month retention stated in
-- the support_threads table comment. Its only other caller is the admin console
-- opening its inbox, which is not a guarantee.
--
-- refresh_university_search_index() bounds how long the catalogue read model can
-- stay stale after a manual catalogue edit. Migrations that change the catalogue
-- should still refresh it directly.

create extension if not exists pg_cron;

revoke all on schema cron from anon, authenticated;
revoke all on all tables in schema cron from anon, authenticated;
revoke all on all functions in schema cron from anon, authenticated;

select cron.schedule(
  'prune-expired-support-threads',
  '30 3 * * *',
  $job$ select public.prune_expired_support_threads(); $job$
);

select cron.schedule(
  'refresh-university-search-index',
  '45 3 * * *',
  $job$ select public.refresh_university_search_index(); $job$
);
