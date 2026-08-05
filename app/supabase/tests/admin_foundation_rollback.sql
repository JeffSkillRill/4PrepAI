-- Run only against a disposable local/QA database after migration 012.
-- Every synthetic row is rolled back.
begin;

do $$
declare
  v_admin_user uuid := '11111111-1111-4111-8111-111111111111'::uuid;
  v_grant_id uuid;
  v_allowed boolean;
  v_denied boolean;
begin
  if not exists (
    select 1
    from pg_catalog.pg_class as relation
    join pg_catalog.pg_namespace as namespace on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relname = 'admin_users'
      and relation.relrowsecurity
  ) then
    raise exception 'admin_users RLS is not enabled';
  end if;

  if has_table_privilege('anon', 'public.admin_users', 'select')
    or has_table_privilege('authenticated', 'public.admin_users', 'select')
    or has_table_privilege('authenticated', 'public.admin_audit_log', 'select')
    or has_function_privilege(
      'authenticated',
      'public.begin_admin_api_request(uuid,uuid,text,text,integer,integer)',
      'execute'
    )
  then
    raise exception 'a browser role can reach the admin control plane';
  end if;

  if not has_table_privilege('service_role', 'public.admin_users', 'select')
    or not has_table_privilege('service_role', 'public.admin_audit_log', 'insert')
    or not has_function_privilege(
      'service_role',
      'public.begin_admin_api_request(uuid,uuid,text,text,integer,integer)',
      'execute'
    )
  then
    raise exception 'service_role admin privileges are incomplete';
  end if;

  insert into public.admin_users (user_id, grant_reason)
  values (v_admin_user, 'qa_bootstrap')
  returning id into v_grant_id;

  begin
    insert into public.admin_users (user_id, grant_reason)
    values (v_admin_user, 'duplicate_should_fail');
    raise exception 'a second active admin grant was accepted';
  exception
    when unique_violation then null;
  end;

  insert into public.admin_audit_log (
    request_id,
    actor_user_id,
    actor_admin_grant_id,
    endpoint,
    action,
    resource_type,
    target_user_id,
    outcome,
    metadata
  ) values (
    '22222222-2222-4222-8222-222222222222'::uuid,
    v_admin_user,
    v_grant_id,
    'admin-api',
    'cohort.roster.read',
    'student_cohort',
    v_admin_user,
    'allowed',
    '{"result_count": 1}'::jsonb
  );

  insert into public.admin_audit_log (
    request_id,
    endpoint,
    action,
    resource_type,
    outcome,
    reason_code
  ) values (
    '33333333-3333-4333-8333-333333333333'::uuid,
    'admin-api',
    'authorize',
    'admin_api',
    'denied',
    'authorization_failed'
  );

  begin
    insert into public.admin_audit_log (
      request_id,
      endpoint,
      action,
      resource_type,
      outcome,
      reason_code,
      metadata
    ) values (
      '44444444-4444-4444-8444-444444444444'::uuid,
      'admin-api',
      'authorize',
      'admin_api',
      'denied',
      'authorization_failed',
      '{"token": "must-not-be-stored"}'::jsonb
    );
    raise exception 'secret-shaped audit metadata was accepted';
  exception
    when check_violation then null;
  end;

  select allowed into v_allowed
  from public.begin_admin_api_request(
    '55555555-5555-4555-8555-555555555555'::uuid,
    v_admin_user,
    'user:' || v_admin_user::text,
    'admin-api',
    1,
    2
  );
  select allowed into v_denied
  from public.begin_admin_api_request(
    '66666666-6666-4666-8666-666666666666'::uuid,
    v_admin_user,
    'user:' || v_admin_user::text,
    'admin-api',
    1,
    2
  );
  if not v_allowed or v_denied then
    raise exception 'admin API rate limiter did not allow once and then deny';
  end if;

  update public.admin_users
  set revoked_at = now(),
      revocation_reason = 'qa_complete'
  where id = v_grant_id;
  if exists (
    select 1 from public.admin_users
    where user_id = v_admin_user and revoked_at is null
  ) then
    raise exception 'revoked admin still has an active grant';
  end if;

  begin
    delete from public.admin_users where id = v_grant_id;
    raise exception 'admin grant history was deleted';
  exception
    when raise_exception then
      if sqlerrm <> 'Admin grant history cannot be deleted' then raise; end if;
  end;

  begin
    update public.admin_audit_log
    set action = 'tampered'
    where request_id = '22222222-2222-4222-8222-222222222222'::uuid;
    raise exception 'admin audit history was changed';
  exception
    when raise_exception then
      if sqlerrm <> 'The admin audit log is append-only' then raise; end if;
  end;
end;
$$;

rollback;
