-- This RPC is deliberately not public. admin-api authorizes an active admin
-- grant first and invokes it with the server-side service role client.
create or replace function public.ingest_qs_university_profile(p_payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_university_id text := p_payload->>'universityId';
  v_source_id text := 'qs-' || (p_payload->>'universityId');
  v_url text := p_payload->'source'->>'url';
  v_key text;
  v_value text;
  v_program jsonb;
  v_program_id text;
  v_existing boolean;
  v_counts jsonb := '{"sources":{"inserted":0,"updated":0},"universityFacts":{"inserted":0,"updated":0},"rankings":{"inserted":0,"updated":0},"campuses":{"inserted":0,"updated":0},"programmes":{"inserted":0,"updated":0},"programFacts":{"inserted":0,"updated":0}}'::jsonb;
  v_absent text[] := '{}';
begin
  if v_university_id is null or not exists (select 1 from universities where id = v_university_id) then
    raise exception using errcode = 'P0001', message = 'Unknown universityId.';
  end if;
  if v_url !~ '^https://www\.topuniversities\.com/' then
    raise exception using errcode = 'P0001', message = 'A QS source URL is required.';
  end if;

  select exists(select 1 from sources where id = v_source_id) into v_existing;
  insert into sources (id, origin, url, retrieved_at, verification)
  values (v_source_id, 'QS', v_url, current_date, 'verified')
  on conflict (id) do update set origin = excluded.origin, url = excluded.url,
    retrieved_at = excluded.retrieved_at, verification = excluded.verification;
  v_counts := jsonb_set(v_counts, '{sources,' || case when v_existing then 'updated' else 'inserted' end || '}', '1'::jsonb);

  foreach v_key in array array['internationalStudentPct','facultyCount','employabilityRate','employabilitySummary'] loop
    v_value := p_payload->>v_key;
    if v_value is null then
      v_absent := array_append(v_absent, v_key);
      continue;
    end if;
    select exists(select 1 from university_facts where university_id = v_university_id and kind = case v_key
      when 'internationalStudentPct' then 'international_student_pct'::university_fact_kind
      when 'facultyCount' then 'faculty_count'::university_fact_kind
      when 'employabilityRate' then 'employability_rate'::university_fact_kind
      else 'employability_summary'::university_fact_kind end) into v_existing;
    insert into university_facts (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action)
    values (v_university_id, case v_key when 'internationalStudentPct' then 'international_student_pct'::university_fact_kind when 'facultyCount' then 'faculty_count'::university_fact_kind when 'employabilityRate' then 'employability_rate'::university_fact_kind else 'employability_summary'::university_fact_kind end, v_value, case when v_value ~ '^\s*[0-9]+(\.[0-9]+)?\s*$' then trim(v_value)::numeric else null end, v_source_id, null, null)
    on conflict (university_id, kind) do update set value = excluded.value, numeric_value = excluded.numeric_value, source_id = excluded.source_id, unknown_reason = null, suggested_action = null;
    v_counts := jsonb_set(v_counts, '{universityFacts,' || case when v_existing then 'updated' else 'inserted' end || '}', to_jsonb((v_counts #>> array['universityFacts', case when v_existing then 'updated' else 'inserted' end])::integer + 1));
  end loop;
  foreach v_key in array array['accommodation','food','transport','utilities'] loop
    v_value := p_payload->'costOfLiving'->>v_key;
    if v_value is null then v_absent := array_append(v_absent, 'costOfLiving.' || v_key); continue; end if;
    select exists(select 1 from university_facts where university_id = v_university_id and kind = ('living_' || v_key)::university_fact_kind) into v_existing;
    insert into university_facts (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action)
    values (v_university_id, ('living_' || v_key)::university_fact_kind, v_value, case when v_value ~ '^\s*[0-9]+(\.[0-9]+)?\s*$' then trim(v_value)::numeric else null end, v_source_id, null, null)
    on conflict (university_id, kind) do update set value = excluded.value, numeric_value = excluded.numeric_value, source_id = excluded.source_id, unknown_reason = null, suggested_action = null;
    v_counts := jsonb_set(v_counts, '{universityFacts,' || case when v_existing then 'updated' else 'inserted' end || '}', to_jsonb((v_counts #>> array['universityFacts', case when v_existing then 'updated' else 'inserted' end])::integer + 1));
  end loop;

  if p_payload ? 'rankings' then
    delete from rankings where university_id = v_university_id and source_id = v_source_id;
    insert into rankings (university_id, label, rank_display, year, source_id)
    select v_university_id, label, "rankDisplay", year, v_source_id from jsonb_to_recordset(p_payload->'rankings') as r(label text, "rankDisplay" text, year integer);
    v_counts := jsonb_set(v_counts, '{rankings,inserted}', to_jsonb(jsonb_array_length(p_payload->'rankings')));
  else v_absent := array_append(v_absent, 'rankings'); end if;
  if p_payload ? 'campuses' then
    delete from campuses where university_id = v_university_id and source_id = v_source_id;
    insert into campuses (university_id, name, city, country, source_id)
    select v_university_id, name, city, country, v_source_id from jsonb_to_recordset(p_payload->'campuses') as c(name text, city text, country text);
    v_counts := jsonb_set(v_counts, '{campuses,inserted}', to_jsonb(jsonb_array_length(p_payload->'campuses')));
  else v_absent := array_append(v_absent, 'campuses'); end if;

  if p_payload ? 'programmes' then
    for v_program in select value from jsonb_array_elements(p_payload->'programmes') loop
      v_program_id := 'qs-' || v_university_id || '-' || trim(both '-' from regexp_replace(lower(v_program->>'name'), '[^a-z0-9]+', '-', 'g')) || '-' || (v_program->>'degreeLevel');
      select exists(select 1 from programs where id = v_program_id) into v_existing;
      insert into programs (id, university_id, name, degree, field, degree_level, subject_area, source_id)
      values (v_program_id, v_university_id, v_program->>'name', v_program->>'degree', v_program->>'subjectArea', (v_program->>'degreeLevel')::program_degree_level, (v_program->>'subjectArea')::program_subject_area, v_source_id)
      on conflict (id) do update set university_id = excluded.university_id, name = excluded.name, degree = excluded.degree, field = excluded.field, degree_level = excluded.degree_level, subject_area = excluded.subject_area, source_id = excluded.source_id;
      v_counts := jsonb_set(v_counts, '{programmes,' || case when v_existing then 'updated' else 'inserted' end || '}', to_jsonb((v_counts #>> array['programmes', case when v_existing then 'updated' else 'inserted' end])::integer + 1));
      foreach v_key in array array['duration','tuition'] loop
        v_value := v_program->>v_key; if v_value is null then continue; end if;
        select exists(select 1 from program_facts where program_id = v_program_id and kind = v_key::program_fact_kind) into v_existing;
        insert into program_facts (program_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action)
        values (v_program_id, v_key::program_fact_kind, v_value, case when v_value ~ '^\s*[0-9]+(\.[0-9]+)?\s*$' then trim(v_value)::numeric else null end, v_source_id, null, null)
        on conflict (program_id, kind) do update set value = excluded.value, numeric_value = excluded.numeric_value, source_id = excluded.source_id, unknown_reason = null, suggested_action = null;
        v_counts := jsonb_set(v_counts, '{programFacts,' || case when v_existing then 'updated' else 'inserted' end || '}', to_jsonb((v_counts #>> array['programFacts', case when v_existing then 'updated' else 'inserted' end])::integer + 1));
      end loop;
    end loop;
  else v_absent := array_append(v_absent, 'programmes'); end if;
  return jsonb_build_object('universityId', v_university_id, 'sourceId', v_source_id, 'counts', v_counts, 'absent', v_absent);
end;
$$;

revoke all on function public.ingest_qs_university_profile(jsonb) from public, anon, authenticated;
grant execute on function public.ingest_qs_university_profile(jsonb) to service_role;
