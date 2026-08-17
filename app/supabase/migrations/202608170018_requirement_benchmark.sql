begin;

-- What a requirement number actually MEANS.
--
-- Until now `requirements.numeric_value` carried a bare number and the only
-- record of what that number represented lived in the free-text `value`
-- description. Three genuinely different things were stored identically:
--
--   Alabama IELTS 6.0  "Minimum IELTS 6.0"                      -> a real bar
--   Yale    IELTS 7.0  "typically...; not stated as a minimum"  -> not a bar
--   Alabama SAT  1420  "begins the published $28,000 merit tier" -> money, not entry
--   UNK     SAT  1030  "can satisfy English proficiency"        -> English, not entry
--
-- Any feature that compares a student's score against `numeric_value` without
-- this distinction will tell a seventeen year old she falls short of a Yale
-- requirement that Yale does not publish. That is precisely the fabrication the
-- product forbids, aimed at the reader least able to check it. Parsing the
-- English description at read time was rejected: a researcher phrasing the next
-- row differently would silently reintroduce the false requirement, and no test
-- could catch it. The meaning is therefore recorded as data, once, here.

create type public.requirement_benchmark as enum (
  -- A published minimum for ADMISSION. The only value a gap tool may treat as
  -- a bar the student must clear.
  'admission_minimum',
  -- Published and real, but explicitly not a cutoff: "typically", "general
  -- indicator", "strong-applicant benchmark". Show it, never fail anyone against it.
  'indicative',
  -- The number gates money, not entry. Reaching it is optional and upside.
  'scholarship_threshold',
  -- The number satisfies an English-proficiency route, not academic admission.
  'english_proficiency_alternative',
  -- No comparable published number exists on this row.
  'none'
);

alter table public.requirements
  add column benchmark public.requirement_benchmark not null default 'none';

-- The invariant that keeps this honest as the catalogue grows from 10 to 300.
-- A row carrying a number must say what the number is, and a row carrying no
-- number must not claim to be a bar. A researcher who inserts a numeric
-- requirement without classifying it gets a loud failure at write time rather
-- than a quiet false requirement at read time.
alter table public.requirements
  add constraint requirements_benchmark_matches_number check (
    (numeric_value is null and benchmark = 'none')
    or (numeric_value is not null and benchmark <> 'none')
  ) not valid;

-- Backfill. Every classification below is read from the row's own published
-- `value` text, which already states the distinction explicitly; nothing is
-- inferred beyond what the source says.

-- Explicitly not a cutoff.
update public.requirements set benchmark = 'indicative'
where numeric_value is not null
  and (
    (university_id = 'yale' and kind in ('ielts', 'toefl', 'duolingo'))
    or (university_id = 'clark' and kind in ('ielts', 'toefl', 'duolingo'))
    -- "A 2.5 GPA is the published strong-applicant benchmark" - a benchmark,
    -- not a stated minimum.
    or (university_id = 'usm' and kind = 'gpa')
  );

-- The number opens a merit award; admission is test-optional at both.
update public.requirements set benchmark = 'scholarship_threshold'
where numeric_value is not null
  and university_id in ('alabama', 'usm')
  and kind in ('sat', 'act');

-- "Not required for admission; SAT 1030 / ACT 20 can satisfy English proficiency."
update public.requirements set benchmark = 'english_proficiency_alternative'
where numeric_value is not null
  and university_id = 'unk'
  and kind in ('sat', 'act');

-- Everything else carrying a number states a minimum in its own text:
-- Alabama/Berea/Illinois Wesleyan/UNK/USM English minimums, Berea's SAT 980 and
-- ACT 19 "when used as the required test", and the Alabama and UNK GPA 3.0
-- admission minimums.
update public.requirements set benchmark = 'admission_minimum'
where numeric_value is not null and benchmark = 'none';

alter table public.requirements
  validate constraint requirements_benchmark_matches_number;

comment on type public.requirement_benchmark is
  'What a requirements.numeric_value represents. Only admission_minimum may be treated as a bar a student must clear; indicative, scholarship_threshold and english_proficiency_alternative are published figures that are not admission cutoffs.';
comment on column public.requirements.benchmark is
  'Classification of numeric_value, read from the row''s published value text. Enforced against numeric_value by requirements_benchmark_matches_number so a numeric row can never be left unclassified.';

commit;
