-- Reviewed alternatives are explicit. A null group means an independent requirement.
alter table public.award_conditions add column alternative_group text;
alter table public.award_conditions add constraint award_conditions_alternative_group_length
  check (alternative_group is null or char_length(alternative_group) between 1 and 80);
update public.award_conditions set alternative_group = 'admission_test'
where scholarship_id in ('alabama-automatic', 'usm-academic') and kind in ('sat', 'act');
comment on column public.award_conditions.alternative_group is
  'Reviewed conditions in the same non-null group are alternatives; every group and every null-group row is required.';

-- Per-caller protection at the Edge boundary; the existing aggregate cap remains.
alter function public.submit_lead(uuid, text, text, text, text, text) rename to submit_lead_internal;
revoke all on function public.submit_lead_internal(uuid, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_lead_internal(uuid, text, text, text, text, text) to service_role;
create table public.lead_caller_requests (
  lead_id uuid primary key references public.leads(id) on delete cascade,
  caller_key text not null check (caller_key ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default clock_timestamp()
);
create index lead_caller_requests_key_time on public.lead_caller_requests(caller_key, created_at);
alter table public.lead_caller_requests enable row level security;
revoke all on public.lead_caller_requests from public, anon, authenticated;
grant all on public.lead_caller_requests to service_role;

create function public.submit_lead_for_caller(
  p_lead_id uuid, p_name text, p_contact text, p_source text,
  p_caller_key text, p_user_id uuid default null, p_context_ref text default null, p_note text default null
) returns table(status text, lead_id uuid, retry_after_seconds integer)
language plpgsql security definer set search_path = '' as $$
declare
  v_result record;
  v_hour integer;
  v_day integer;
begin
  if p_caller_key is null or p_caller_key !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid caller key' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('lead-caller:' || p_caller_key, 0));
  -- Only this service-role RPC can set the verified identity used by the original guard.
  perform set_config('request.jwt.claim.sub', coalesce(p_user_id::text, ''), true);
  perform set_config('request.jwt.claims', jsonb_build_object('role', 'service_role', 'sub', p_user_id)::text, true);
  if not exists (select 1 from public.lead_caller_requests as r where r.lead_id = p_lead_id and r.caller_key = p_caller_key) then
    select count(*) filter (where r.created_at > clock_timestamp() - interval '1 hour'), count(*)
    into v_hour, v_day from public.lead_caller_requests as r
    where r.caller_key = p_caller_key and r.created_at > clock_timestamp() - interval '24 hours';
    if v_hour >= 3 or v_day >= 10 then
      return query select 'rate_limited'::text, p_lead_id, case when v_hour >= 3 then 3600 else 86400 end;
      return;
    end if;
  end if;
  select * into v_result from public.submit_lead_internal(p_lead_id, p_name, p_contact, p_source, p_context_ref, p_note);
  if v_result.status = 'submitted' then
    insert into public.lead_caller_requests(lead_id, caller_key) values (p_lead_id, p_caller_key) on conflict do nothing;
  end if;
  return query select v_result.status::text, v_result.lead_id::uuid, v_result.retry_after_seconds::integer;
end;
$$;
revoke all on function public.submit_lead_for_caller(uuid,text,text,text,text,uuid,text,text) from public, anon, authenticated;
grant execute on function public.submit_lead_for_caller(uuid,text,text,text,text,uuid,text,text) to service_role;

-- Durable deletion journal survives auth cascades and permits service-only reconciliation.
create table public.account_deletion_jobs (
  user_id uuid primary key,
  stage text not null default 'pending' check (stage in ('pending', 'auth_deleted', 'finished')),
  created_at timestamptz not null default clock_timestamp(),
  finished_at timestamptz
);
alter table public.account_deletion_jobs enable row level security;
revoke all on public.account_deletion_jobs from public, anon, authenticated;
grant all on public.account_deletion_jobs to service_role;
create function public.account_deletion_pending() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.account_deletion_jobs where user_id = (select auth.uid()) and stage <> 'finished');
$$;
revoke all on function public.account_deletion_pending() from public, anon;
grant execute on function public.account_deletion_pending() to authenticated, service_role;
create policy "no uploads during account deletion" on storage.objects as restrictive for insert to authenticated
with check (bucket_id not in ('avatars', 'learning-submissions') or not (select public.account_deletion_pending()));
create policy "no file changes during account deletion" on storage.objects as restrictive for update to authenticated
using (bucket_id not in ('avatars', 'learning-submissions') or not (select public.account_deletion_pending()))
with check (bucket_id not in ('avatars', 'learning-submissions') or not (select public.account_deletion_pending()));

-- Draft assignments and completions are not an available course.
create policy "published lessons only can be completed" on public.learning_progress as restrictive for insert to authenticated
with check (exists(select 1 from public.learning_lessons as lesson where lesson.id = lesson_id and lesson.status = 'published'));
create policy "published modules only can receive submissions" on public.learning_submissions as restrictive for insert to authenticated
with check (exists(select 1 from public.learning_assignments as assignment join public.learning_lessons as lesson on lesson.module_id = assignment.module_id where assignment.id = assignment_id and lesson.status = 'published'));

select cron.schedule('prune-resolved-leads-daily', '40 3 * * *', $job$
  select public.prune_resolved_leads();
  delete from public.lead_caller_requests where created_at < clock_timestamp() - interval '24 hours';
  delete from public.account_deletion_jobs where stage = 'finished' and finished_at < clock_timestamp() - interval '30 days';
$job$);

create policy "only published lessons remain complete" on public.learning_progress as restrictive for update to authenticated
using (exists(select 1 from public.learning_lessons as lesson where lesson.id = lesson_id and lesson.status = 'published'))
with check (exists(select 1 from public.learning_lessons as lesson where lesson.id = lesson_id and lesson.status = 'published'));
create policy "only published modules receive submission updates" on public.learning_submissions as restrictive for update to authenticated
using (exists(select 1 from public.learning_assignments as assignment join public.learning_lessons as lesson on lesson.module_id = assignment.module_id where assignment.id = assignment_id and lesson.status = 'published'))
with check (exists(select 1 from public.learning_assignments as assignment join public.learning_lessons as lesson on lesson.module_id = assignment.module_id where assignment.id = assignment_id and lesson.status = 'published'));

create table public.operational_events (
  id bigint generated always as identity primary key,
  event text not null check (event in ('app_crash','intake_started','intake_completed','intake_failed','profile_saved','profile_save_failed','university_saved','university_save_failed','handoff_shown','handoff_opened','lead_submitted','lead_failed')),
  caller_key text not null check (caller_key ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default clock_timestamp()
);
create index operational_events_time on public.operational_events(created_at);
create index operational_events_caller_time on public.operational_events(caller_key, created_at);
alter table public.operational_events enable row level security;
revoke all on public.operational_events from public, anon, authenticated;
grant all on public.operational_events to service_role;
grant usage, select on sequence public.operational_events_id_seq to service_role;
create function public.record_operational_event(p_event text, p_caller_key text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_caller_key is null or p_caller_key !~ '^[0-9a-f]{64}$' then return; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('operational-events-limit', 0));
  if (select count(*) from public.operational_events where created_at > clock_timestamp() - interval '24 hours') >= 5000 then return; end if;
  if (select count(*) from public.operational_events where caller_key = p_caller_key and created_at > clock_timestamp() - interval '1 hour') >= 30 then return; end if;
  insert into public.operational_events(event, caller_key) values(p_event, p_caller_key);
end;
$$;
revoke all on function public.record_operational_event(text,text) from public, anon, authenticated;
grant execute on function public.record_operational_event(text,text) to service_role;

create function public.launch_ops_snapshot() returns jsonb language sql security definer set search_path = '' as $$
  select jsonb_build_object(
    'crashes_24h', (select count(*) from public.operational_events where event = 'app_crash' and created_at > clock_timestamp() - interval '24 hours'),
    'failed_actions_24h', (select count(*) from public.operational_events where event in ('intake_failed','profile_save_failed','university_save_failed','lead_failed') and created_at > clock_timestamp() - interval '24 hours'),
    'new_leads', (select count(*) from public.leads where status = 'new'),
    'waiting_support', (select count(*) from public.support_threads where last_sender_role = 'student'),
    'pending_deletions', (select count(*) from public.account_deletion_jobs where stage <> 'finished'),
    'failed_cron_24h', (select count(*) from cron.job_run_details where status = 'failed' and start_time > clock_timestamp() - interval '24 hours'),
    'published_lessons', (select count(*) from public.learning_lessons where status = 'published'),
    'flow_events_24h', (select coalesce(jsonb_object_agg(event, total), '{}'::jsonb) from (select event, count(*) as total from public.operational_events where created_at > clock_timestamp() - interval '24 hours' group by event) as counts)
  );
$$;
revoke all on function public.launch_ops_snapshot() from public, anon, authenticated;
grant execute on function public.launch_ops_snapshot() to service_role;
select cron.schedule('prune-operational-events-daily', '50 3 * * *', $job$
  delete from public.operational_events where created_at < clock_timestamp() - interval '7 days';
$job$);
