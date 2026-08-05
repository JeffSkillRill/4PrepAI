-- Closes the dangling reference on public.counselor_strikes.request_id.
--
-- counselor_strikes was created by migration 002 with a `request_id uuid not
-- null` column, but counselor_requests did not exist until migration 007, and
-- the foreign key was never added afterwards. Pruning requests after seven days
-- therefore orphans the strikes that explain why a counselor answer was
-- rejected -- a retention leak, not merely a missing constraint.
--
-- `on delete cascade` because request_id is `not null` and is the only thing
-- tying a strike to its request; a strike whose request is gone is unreadable.
--
-- Fails closed on pre-existing orphans rather than aborting with a bare
-- constraint violation, following the precondition pattern of migration 006.

do $$
declare
  v_orphans bigint;
  v_recent bigint;
begin
  select
    count(*),
    count(*) filter (where created_at >= clock_timestamp() - interval '7 days')
  into v_orphans, v_recent
  from public.counselor_strikes as strike
  where not exists (
    select 1
    from public.counselor_requests as request
    where request.request_id = strike.request_id
  );

  if v_orphans > 0 then
    raise exception
      'counselor strike backfill required: % orphaned strike rows (% inside the seven-day retention window)',
      v_orphans, v_recent;
  end if;
end
$$;

alter table public.counselor_strikes
  add constraint counselor_strikes_request_id_fkey
  foreign key (request_id)
  references public.counselor_requests (request_id)
  on delete cascade;

create index counselor_strikes_request_id_idx
  on public.counselor_strikes (request_id);

comment on column public.counselor_strikes.request_id is
  'The counselor request that produced this strike. Cascades on delete so that seven-day request pruning does not leave unreadable strike rows behind.';
