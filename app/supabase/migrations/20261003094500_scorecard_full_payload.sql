-- Full College Scorecard payload, stored verbatim, one row per catalogue university.
--
-- Why a jsonb payload instead of rows in university_facts:
-- university_facts.kind is an enum with a (university_id, kind) primary key, so it
-- holds one row per curated, counselor-citable fact. A Scorecard record carries
-- 5,600-58,800 leaf values per school. Those are bulk reference data from a single
-- source, not individually curated claims, so they live in their own table and the
-- honesty contract on university_facts stays meaningful.

create table if not exists public.university_scorecard (
  university_id text primary key references public.universities(id) on delete cascade,
  unitid integer not null unique,
  data_year integer not null,
  payload jsonb not null,
  leaf_count integer not null default 0,
  fetched_at timestamptz not null default now(),
  source_id text not null references public.sources(id)
);

comment on table public.university_scorecard is
  'Verbatim College Scorecard API record per university. Nothing added, nothing inferred, nothing normalised.';

create index if not exists university_scorecard_unitid_idx
  on public.university_scorecard (unitid);
create index if not exists university_scorecard_payload_idx
  on public.university_scorecard using gin (payload jsonb_path_ops);

-- programs.cip_4_digit is an array, so it gets rows rather than living inside the blob.
-- This table is a convenience index over the payload, which remains the source of truth:
-- any row that cannot be keyed here is still present verbatim in university_scorecard.payload.
create table if not exists public.university_scorecard_programs (
  university_id text not null references public.universities(id) on delete cascade,
  cip_code text not null,
  credential_level smallint not null,
  credential_title text,
  title text,
  awards_ipeds1 integer,
  awards_ipeds2 integer,
  distance smallint,
  earnings jsonb,
  debt jsonb,
  source_id text not null references public.sources(id),
  primary key (university_id, cip_code, credential_level)
);

comment on column public.university_scorecard_programs.earnings is
  'Scorecard program-level earnings. Null where Scorecard suppresses small cohorts; null means not reported, never zero.';
comment on column public.university_scorecard_programs.awards_ipeds1 is
  'IPEDS_AWARDS1 exactly as Scorecard reports it. Kept separate from awards_ipeds2; the two count different cohorts and must not be merged.';
comment on column public.university_scorecard_programs.awards_ipeds2 is
  'IPEDS_AWARDS2 exactly as Scorecard reports it. Kept separate from awards_ipeds1.';
comment on column public.university_scorecard_programs.distance is
  'Raw Scorecard distance-education code, stored as reported. Not coerced to a boolean, because the codes are not two-valued.';
comment on column public.university_scorecard_programs.title is
  'Scorecard program title exactly as reported, including its trailing period.';

create index if not exists university_scorecard_programs_university_idx
  on public.university_scorecard_programs (university_id);
create index if not exists university_scorecard_programs_cip_idx
  on public.university_scorecard_programs (cip_code);

alter table public.university_scorecard enable row level security;
alter table public.university_scorecard_programs enable row level security;

drop policy if exists "read university scorecard" on public.university_scorecard;
create policy "read university scorecard"
  on public.university_scorecard for select to anon, authenticated using (true);

drop policy if exists "read university scorecard programs" on public.university_scorecard_programs;
create policy "read university scorecard programs"
  on public.university_scorecard_programs for select to anon, authenticated using (true);
