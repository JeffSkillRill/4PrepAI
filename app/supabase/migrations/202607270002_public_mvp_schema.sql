begin;

alter table public.sources rename column origin to name;

alter table public.sources
  add constraint verified_source_requires_url
  check (verification <> 'verified' or url is not null);

alter table public.university_facts
  add column amount_period text
  check (amount_period is null or amount_period in ('year', 'semester', 'month', 'one_time', 'percentage'));

alter table public.program_facts
  add column amount_period text
  check (amount_period is null or amount_period in ('year', 'semester', 'month', 'one_time', 'percentage'));

alter table public.scholarships
  add column amount_period text
  check (amount_period is null or amount_period in ('year', 'semester', 'month', 'one_time', 'percentage'));

alter table public.university_scholarships
  add column source_id text references public.sources(id);

update public.university_scholarships us
set source_id = s.source_id
from public.scholarships s
where s.id = us.scholarship_id;

alter table public.university_scholarships
  alter column source_id set not null;

create table public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  country text not null,
  field text not null,
  academic_score numeric,
  budget_max numeric,
  budget_currency text,
  language_score numeric,
  needs_language_pathway boolean not null default false,
  intake text not null,
  consented_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_profile_academic_score_bounds
    check (academic_score is null or academic_score between 0 and 100),
  constraint student_profile_budget_non_negative
    check (budget_max is null or budget_max >= 0),
  constraint student_profile_budget_currency
    check (
      (budget_max is null and budget_currency is null)
      or
      (budget_max is not null and budget_currency is not null and char_length(budget_currency) = 3)
    ),
  constraint student_profile_language_score_bounds
    check (language_score is null or language_score between 0 and 9)
);

create table public.saved_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  university_id text not null references public.universities(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, university_id)
);

create table public.counselor_strikes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null,
  user_id uuid references auth.users(id) on delete set null,
  strike_type text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger student_profiles_set_updated_at
before update on public.student_profiles
for each row execute function public.set_updated_at();

alter table public.student_profiles enable row level security;
alter table public.saved_plans enable row level security;
alter table public.counselor_strikes enable row level security;

create policy "profile owner can read"
on public.student_profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "profile owner can insert"
on public.student_profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "profile owner can update"
on public.student_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "profile owner can delete"
on public.student_profiles
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "saved plan owner can read"
on public.saved_plans
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "saved plan owner can insert"
on public.saved_plans
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "saved plan owner can delete"
on public.saved_plans
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "strike owner can read"
on public.counselor_strikes
for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.student_profiles from anon;
revoke all on public.saved_plans from anon;
revoke all on public.counselor_strikes from anon;

grant select, insert, update, delete on public.student_profiles to authenticated;
grant select, insert, delete on public.saved_plans to authenticated;
grant select on public.counselor_strikes to authenticated;

comment on table public.student_profiles is
  'Private student intake data. Direct access is restricted to the authenticated owner by RLS.';
comment on table public.saved_plans is
  'Private saved university plans. Direct access is restricted to the authenticated owner by RLS.';
comment on table public.counselor_strikes is
  'Grounding-validator audit log. Edge functions write with the service role; users may read only their own rows.';
comment on column public.university_scholarships.source_id is
  'Proves that the named scholarship is linked to the named university.';

commit;
