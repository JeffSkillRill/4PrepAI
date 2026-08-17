begin;

-- Real scores on the student profile.
--
-- Until now the intake offered three fixed buttons - "IELTS 6.5", "TOEFL iBT 90",
-- "Duolingo 120" - so every student who selected IELTS was stored as exactly 6.5.
-- The Skill Gap Analyzer was therefore comparing published university minimums
-- against a number the student never gave us. Recording a made-up score and then
-- telling a student what it means is the same failure as inventing a university
-- figure, so the profile now holds what the student actually typed.
--
-- SAT/ACT and GPA are added at the same time because the analyzer had rows for
-- them with nothing behind them: no column existed, so those rows could never
-- say anything and were pure noise on the page.

alter table public.student_profiles
  -- A student sits the SAT or the ACT, not both. Null means "not taken", which
  -- is a normal and permanent state for most applicants to test-optional schools.
  add column admission_test text,
  add column admission_test_score numeric,
  add column gpa numeric;

-- A test without its score, or a score without its test, cannot be compared
-- against anything. Storing half of the pair would produce a row the analyzer
-- must silently ignore, so the pair is required to be complete or absent.
alter table public.student_profiles
  add constraint student_profiles_admission_test_pair check (
    (admission_test is null and admission_test_score is null)
    or (admission_test is not null and admission_test_score is not null)
  );

alter table public.student_profiles
  add constraint student_profiles_admission_test_kind check (
    admission_test is null or admission_test in ('sat', 'act')
  );

-- Published score scales. A value outside these ranges is a typo or a different
-- scale, and comparing it to a university minimum would produce a confident,
-- wrong answer. Bounds are inclusive of the real reporting ranges.
alter table public.student_profiles
  add constraint student_profiles_admission_test_range check (
    admission_test_score is null
    or (admission_test = 'sat' and admission_test_score between 400 and 1600)
    or (admission_test = 'act' and admission_test_score between 1 and 36)
  );

alter table public.student_profiles
  add constraint student_profiles_gpa_range check (
    gpa is null or gpa between 0 and 4.0
  );

-- The same pairing rule for the language test, which was previously unguarded:
-- language_test and language_score are both nullable and nothing stopped one
-- being set without the other.
alter table public.student_profiles
  add constraint student_profiles_language_pair check (
    (language_test is null and language_score is null)
    or (language_test is not null and language_score is not null)
  ) not valid;

alter table public.student_profiles
  add constraint student_profiles_language_kind check (
    language_test is null or language_test in ('ielts', 'toefl', 'duolingo')
  ) not valid;

alter table public.student_profiles
  add constraint student_profiles_language_range check (
    language_score is null
    or (language_test = 'ielts' and language_score between 0 and 9)
    or (language_test = 'toefl' and language_score between 0 and 120)
    or (language_test = 'duolingo' and language_score between 10 and 160)
  ) not valid;

-- Validated separately so an existing row written under the old fixed-option
-- intake is checked rather than assumed. The three seeded profiles all carry a
-- matched test and score, so this passes; if a future restore does not, the
-- failure is loud here rather than silent in the analyzer.
alter table public.student_profiles validate constraint student_profiles_language_pair;
alter table public.student_profiles validate constraint student_profiles_language_kind;
alter table public.student_profiles validate constraint student_profiles_language_range;

comment on column public.student_profiles.admission_test is
  'Which admission test the student sat, sat or act, or null for neither. A student never holds both.';
comment on column public.student_profiles.admission_test_score is
  'The score the student actually reported, not a preset. Range-checked against the chosen test.';
comment on column public.student_profiles.gpa is
  'Student-reported GPA on the 0-4.0 scale, or null if not provided.';

commit;
