create extension if not exists pg_trgm with schema extensions;

create function public.annualize_amount(
  p_numeric numeric,
  p_currency text,
  p_period text
)
returns numeric
language sql
immutable
parallel safe
set search_path = ''
as $$
  select case
    when p_numeric is null or p_currency is null or p_period is null then null
    when p_period = 'month' then p_numeric * 12
    when p_period = 'semester' then p_numeric * 2
    when p_period = 'year' then p_numeric
    else null
  end
$$;

create function public.aid_policy_covers_full_cost(p_value text)
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
  select coalesce(
    p_value ~* '\y(meets?|meeting)\s+(100%\s+of\s+)?(full\s+)?demonstrated\s+(financial\s+)?need\y'
    or p_value ~* '\yfull demonstrated (financial )?need is met\y'
    or p_value ~* '\y100%\s+funding\s+(to|for)\s+100%\s+of\s+enrolled international students\y',
    false
  )
$$;

create materialized view public.university_search_index as
select
  university.id,
  university.name,
  university.city,
  university.country,
  source.verification,
  lower(
    university.name || ' ' || university.city || ' ' || university.country || ' ' ||
    coalesce(
      (
        select string_agg(program.name || ' ' || program.field, ' ' order by program.id)
        from public.programs as program
        where program.university_id = university.id
      ),
      ''
    )
  ) as search_text,
  coalesce(
    (
      select array_agg(distinct program.field)
      from public.programs as program
      where program.university_id = university.id
    ),
    array[]::text[]
  ) as program_fields,
  cost.cost_currency,
  cost.sticker_annual,
  cost.aid_annual,
  case
    when cost.sticker_annual is null then null
    else greatest(0, cost.sticker_annual - coalesce(cost.aid_annual, 0))
  end as net_annual,
  case
    when cost.policy_covered then 'policy_covered'
    when cost.sticker_annual is null then 'unknown'
    else 'published'
  end as cost_certainty
from public.universities as university
join public.sources as source
  on source.id = university.source_id
cross join lateral (
  select
    sticker.cost_currency,
    sticker.sticker_annual,
    sticker.policy_covered,
    coalesce(
      (
        select public.annualize_amount(fact.numeric_value, fact.currency, fact.amount_period)
        from public.university_facts as fact
        where fact.university_id = university.id
          and fact.kind = 'aid_international'
          and fact.value is not null
          and fact.currency = sticker.cost_currency
      ),
      (
        select max(
          public.annualize_amount(
            scholarship.amount_numeric,
            scholarship.currency,
            scholarship.amount_period
          )
        )
        from public.university_scholarships as link
        join public.scholarships as scholarship
          on scholarship.id = link.scholarship_id
        where link.university_id = university.id
          and scholarship.amount_value is not null
          and scholarship.currency = sticker.cost_currency
      )
    ) as aid_annual
  from (
    select
      annualised.annual as sticker_annual,
      case when annualised.annual is null then null else annualised.currency end as cost_currency,
      coalesce(
        (
          select public.aid_policy_covers_full_cost(fact.value)
          from public.university_facts as fact
          where fact.university_id = university.id
            and fact.kind = 'aid_international'
        ),
        false
      ) as policy_covered
    from (
      select
        (
          select public.annualize_amount(fact.numeric_value, fact.currency, fact.amount_period)
          from public.university_facts as fact
          where fact.university_id = university.id
            and fact.kind = 'total_cost_of_attendance'
            and fact.value is not null
        ) as annual,
        (
          select fact.currency
          from public.university_facts as fact
          where fact.university_id = university.id
            and fact.kind = 'total_cost_of_attendance'
            and fact.value is not null
        ) as currency
    ) as annualised
  ) as sticker
) as cost;

create unique index university_search_index_id_idx
  on public.university_search_index (id);

create index university_search_index_search_trgm_idx
  on public.university_search_index
  using gin (search_text extensions.gin_trgm_ops);

create index university_search_index_fields_idx
  on public.university_search_index
  using gin (program_fields);

create index university_search_index_country_name_idx
  on public.university_search_index (country, name);

create index university_search_index_net_annual_idx
  on public.university_search_index (net_annual)
  where cost_certainty = 'published';

create function public.refresh_university_search_index()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  refresh materialized view concurrently public.university_search_index;
end;
$$;

create function public.search_universities(
  p_query text default null,
  p_country text default null,
  p_field text default null,
  p_budget_max numeric default null,
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (
  id text,
  cost_currency text,
  sticker_annual numeric,
  aid_annual numeric,
  net_annual numeric,
  cost_certainty text,
  total_count bigint
)
language sql
stable
parallel safe
set search_path = ''
as $$
  with bounded as (
    select
      least(greatest(coalesce(p_limit, 24), 1), 100) as row_limit,
      greatest(coalesce(p_offset, 0), 0) as row_offset,
      nullif(btrim(coalesce(p_query, '')), '') as query_text,
      nullif(btrim(coalesce(p_country, '')), '') as country_filter,
      nullif(btrim(coalesce(p_field, '')), '') as field_filter
  ),
  matched as (
    select entry.*
    from public.university_search_index as entry, bounded
    where (bounded.query_text is null or entry.search_text like '%' || lower(bounded.query_text) || '%')
      and (bounded.country_filter is null or entry.country = bounded.country_filter)
      and (bounded.field_filter is null or entry.program_fields @> array[bounded.field_filter])
      and (
        p_budget_max is null
        or entry.cost_certainty <> 'published'
        or entry.net_annual <= p_budget_max
      )
  )
  select
    matched.id,
    matched.cost_currency,
    matched.sticker_annual,
    matched.aid_annual,
    matched.net_annual,
    matched.cost_certainty,
    count(*) over () as total_count
  from matched, bounded
  order by matched.name
  limit (select row_limit from bounded)
  offset (select row_offset from bounded);
$$;

create function public.university_search_facets()
returns table (
  countries text[],
  fields text[]
)
language sql
stable
parallel safe
set search_path = ''
as $$
  select
    coalesce((
      select array_agg(distinct entry.country order by entry.country)
      from public.university_search_index as entry
    ), array[]::text[]),
    coalesce((
      select array_agg(distinct field order by field)
      from public.university_search_index as entry,
        lateral unnest(entry.program_fields) as field
    ), array[]::text[])
$$;

revoke all on function public.refresh_university_search_index()
  from public, anon, authenticated;
grant execute on function public.refresh_university_search_index() to service_role;

grant select on public.university_search_index to anon, authenticated;
grant execute on function public.search_universities(text, text, text, numeric, integer, integer)
  to anon, authenticated, service_role;
grant execute on function public.university_search_facets()
  to anon, authenticated, service_role;

comment on materialized view public.university_search_index is
  'Derived read model for catalogue search. Every column comes from a publicly readable table; adding a private column would bypass row-level security because materialized views do not support it. Refresh with public.refresh_university_search_index() after any catalogue write.';
comment on function public.search_universities(text, text, text, numeric, integer, integer) is
  'Server-side catalogue search, filtering, and pagination. Returns the matching page plus the unpaginated total in total_count. Limit is clamped to 1..100.';
comment on function public.refresh_university_search_index() is
  'Rebuilds the catalogue search index. Call after any write to universities, programs, university_facts, scholarships, university_scholarships, or sources.';
