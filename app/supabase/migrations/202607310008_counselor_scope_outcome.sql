-- Records off-topic counselor questions as their own outcome.
--
-- The counselor now refuses questions outside US admissions before the provider
-- call. Those requests are neither a local grounded response nor a failure, so
-- they need a distinct outcome to keep the analytics on counselor_requests
-- honest: 'out_of_scope' shows how much traffic the scope gate is deflecting and
-- how much Perplexity spend it is saving.
--
-- Out-of-scope requests deliberately still count against the rate limit, so the
-- gate cannot be used as a free, unmetered endpoint.

begin;

alter table public.counselor_requests
  drop constraint if exists counselor_requests_outcome_check;

alter table public.counselor_requests
  add constraint counselor_requests_outcome_check
  check (outcome in (
    'started',
    'local_response',
    'cache_hit',
    'live_call',
    'out_of_scope',
    'rate_limited',
    'provider_failure',
    'server_failure'
  ));

insert into supabase_migrations.schema_migrations (version, statements, name) values
  ('202607310008', array['Applied from the checked-in migration through Supabase SQL Editor.'], 'counselor_scope_outcome')
on conflict (version) do nothing;

commit;
