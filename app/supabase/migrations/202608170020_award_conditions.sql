begin;

-- What a named scholarship publishes as its conditions.
--
-- `scholarships` holds an award and its amount. `requirements` holds a number a
-- university publishes, and since migration 018 it records whether that number is
-- an admission bar or a scholarship tier. Neither can express the thing a merit
-- tier actually is: a NAMED AWARD reached by meeting SEVERAL conditions at once.
--
--   Alabama: "SAT 1420 begins the published $28,000 merit tier with GPA 3.5"
--   USM:     "SAT 1420 with GPA 3.25 can reach the published full-tuition tier"
--
-- Both name a score AND a GPA. Only the score was structured; the GPA lived in
-- the sentence. A finder that compared the score alone would tell a student with
-- SAT 1420 and GPA 2.9 that she reaches a $28,000 award she does not reach. The
-- conditions are therefore stored one row per condition, so a tier can only ever
-- be reported as met when EVERY condition it publishes is met.

create table public.award_conditions (
  id bigint generated always as identity primary key,
  scholarship_id text not null references public.scholarships(id) on delete cascade,
  -- Which measure this condition is about. Reuses the requirement vocabulary so
  -- a student's profile field maps to it without translation.
  kind public.requirement_kind not null,
  -- The published minimum for this measure. Not null: a condition without a
  -- number is not a condition, it is prose, and prose belongs in published_text.
  minimum numeric not null,
  -- The award's own sentence, kept verbatim so a student can always read the
  -- university's wording rather than only our reading of it.
  published_text text not null,
  source_id text not null references public.sources(id),
  created_at timestamptz not null default now(),
  -- One condition per measure per award. A second SAT row for the same award
  -- would mean two different bars and no way to know which is real.
  constraint award_conditions_unique_measure unique (scholarship_id, kind),
  constraint award_conditions_minimum_positive check (minimum > 0),
  constraint award_conditions_text_length check (char_length(btrim(published_text)) between 1 and 500)
);

alter table public.award_conditions enable row level security;

-- The catalogue is public, like universities, programs, requirements and
-- scholarships. Read-only to everyone; writes are migrations and the service role.
create policy award_conditions_public_read on public.award_conditions
  for select to anon, authenticated using (true);

revoke all on public.award_conditions from public, anon, authenticated;
grant select on public.award_conditions to anon, authenticated;
grant all on public.award_conditions to service_role;

create index award_conditions_scholarship_idx on public.award_conditions (scholarship_id);

-- Backfill: the two published merit tiers currently in the catalogue. Each row
-- is read from the requirement text quoted above; nothing is inferred beyond the
-- university's own sentence. An award is reachable by SAT OR ACT, so both score
-- rows are recorded and the logic treats the score family as satisfied when
-- either is met, while the GPA condition must be met regardless.

insert into public.award_conditions (scholarship_id, kind, minimum, published_text, source_id) values
  ('alabama-automatic', 'sat', 1420,
   'SAT 1420 begins the published $28,000 merit tier with GPA 3.5', 'us-ua-scholarship'),
  ('alabama-automatic', 'act', 32,
   'ACT 32 begins the published $28,000 merit tier with GPA 3.5', 'us-ua-scholarship'),
  ('alabama-automatic', 'gpa', 3.5,
   'SAT 1420 begins the published $28,000 merit tier with GPA 3.5', 'us-ua-scholarship'),
  ('usm-academic', 'sat', 1420,
   'SAT 1420 with GPA 3.25 can reach the published full-tuition merit tier', 'us-usm-scholarship'),
  ('usm-academic', 'act', 32,
   'ACT 32 with GPA 3.25 can reach the published full-tuition merit tier', 'us-usm-scholarship'),
  ('usm-academic', 'gpa', 3.25,
   'SAT 1420 with GPA 3.25 can reach the published full-tuition merit tier', 'us-usm-scholarship');

comment on table public.award_conditions is
  'Conditions a named scholarship publishes, one row per measure. An award may only be reported as reached when every condition it publishes is met; an award with no rows here publishes no criteria and must never be described as one the student qualifies for.';
comment on column public.award_conditions.minimum is
  'The published minimum for this measure. Score conditions are alternatives to each other (SAT or ACT); a GPA condition applies in addition.';
comment on column public.award_conditions.published_text is
  'The university''s own sentence, kept verbatim so the student can read the original wording.';

commit;
