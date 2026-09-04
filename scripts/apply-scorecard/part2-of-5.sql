begin;

-- #41: Wellesley College (UNITID 168218)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-wellesley-college', 'College Scorecard — Wellesley College', 'https://collegescorecard.ed.gov/school/?168218-wellesley_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('wellesley-college', 'Wellesley College', 'Wellesley, Massachusetts', 'United States', '🇺🇸', 'Private four-year institution in Wellesley, Massachusetts.',
  'Wellesley College. College Scorecard (2023) reports out-of-state tuition $67,176 / year and a middle-50% SAT range Middle-50% SAT critical reading 730–770; math 730–790 (Scorecard 2023).', 'wellesley-college', array[]::text[], 'us-scorecard-wellesley-college', 41, 'us-4prep-ranking-scorecard-2023', 168218)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('wellesley-college', 'tuition'::public.university_fact_kind, '$67,176 / year (Scorecard 2023)', 67176, 'USD', 'us-scorecard-wellesley-college', null, null, 'year'),
  ('wellesley-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Wellesley College''s admissions / financial-aid pages.', null),
  ('wellesley-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Wellesley College''s admissions pages.', null),
  ('wellesley-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Wellesley College''s admissions pages.', null),
  ('wellesley-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Wellesley College''s financial-aid pages.', null),
  ('wellesley-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Wellesley College''s admissions pages.', null),
  ('wellesley-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Wellesley College''s admissions pages.', null),
  ('wellesley-college', 'room_board'::public.university_fact_kind, '$21,024 / year (Scorecard 2023)', 21024, 'USD', 'us-scorecard-wellesley-college', null, null, 'year'),
  ('wellesley-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Wellesley College''s financial-aid pages.', null),
  ('wellesley-college', 'total_cost_of_attendance'::public.university_fact_kind, '$86,290 / year (Scorecard 2023)', 86290, 'USD', 'us-scorecard-wellesley-college', null, null, 'year'),
  ('wellesley-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Wellesley College''s international admissions / financial-aid pages.', null),
  ('wellesley-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 730–770; math 730–790 (Scorecard 2023); Middle-50% ACT 33–35 (Scorecard 2023)', null, null, 'us-scorecard-wellesley-college', null, null, null),
  ('wellesley-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Wellesley College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('wellesley-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Wellesley College''s admissions pages.'),
  ('wellesley-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Wellesley College''s admissions pages.'),
  ('wellesley-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Wellesley College''s admissions pages.'),
  ('wellesley-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 730–770; math 730–790 (Scorecard 2023)', null, 'us-scorecard-wellesley-college', null, null),
  ('wellesley-college', 'act'::public.requirement_kind, 'Middle-50% ACT 33–35 (Scorecard 2023)', null, 'us-scorecard-wellesley-college', null, null),
  ('wellesley-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Wellesley College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #42: University of California-Los Angeles (UNITID 110662)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-california-los-angeles', 'College Scorecard — University of California-Los Angeles', 'https://collegescorecard.ed.gov/school/?110662-university_of_california_los_angeles', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-california-los-angeles', 'University of California-Los Angeles', 'Los Angeles, California', 'United States', '🇺🇸', 'Public four-year institution in Los Angeles, California.',
  'University of California-Los Angeles. College Scorecard (2023) reports out-of-state tuition $49,403 / year and a middle-50% SAT range not reported.', 'university-of-california-los-angeles', array[]::text[], 'us-scorecard-university-of-california-los-angeles', 42, 'us-4prep-ranking-scorecard-2023', 110662)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-california-los-angeles', 'tuition'::public.university_fact_kind, '$49,403 / year (Scorecard 2023)', 49403, 'USD', 'us-scorecard-university-of-california-los-angeles', null, null, 'year'),
  ('university-of-california-los-angeles', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of California-Los Angeles''s admissions / financial-aid pages.', null),
  ('university-of-california-los-angeles', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of California-Los Angeles''s admissions pages.', null),
  ('university-of-california-los-angeles', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of California-Los Angeles''s admissions pages.', null),
  ('university-of-california-los-angeles', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of California-Los Angeles''s financial-aid pages.', null),
  ('university-of-california-los-angeles', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of California-Los Angeles''s admissions pages.', null),
  ('university-of-california-los-angeles', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of California-Los Angeles''s admissions pages.', null),
  ('university-of-california-los-angeles', 'room_board'::public.university_fact_kind, '$18,369 / year (Scorecard 2023)', 18369, 'USD', 'us-scorecard-university-of-california-los-angeles', null, null, 'year'),
  ('university-of-california-los-angeles', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of California-Los Angeles''s financial-aid pages.', null),
  ('university-of-california-los-angeles', 'total_cost_of_attendance'::public.university_fact_kind, '$38,614 / year (Scorecard 2023)', 38614, 'USD', 'us-scorecard-university-of-california-los-angeles', null, null, 'year'),
  ('university-of-california-los-angeles', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of California-Los Angeles''s international admissions / financial-aid pages.', null),
  ('university-of-california-los-angeles', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check University of California-Los Angeles''s admissions pages.', null),
  ('university-of-california-los-angeles', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of California-Los Angeles''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-california-los-angeles', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of California-Los Angeles''s admissions pages.'),
  ('university-of-california-los-angeles', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of California-Los Angeles''s admissions pages.'),
  ('university-of-california-los-angeles', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of California-Los Angeles''s admissions pages.'),
  ('university-of-california-los-angeles', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check University of California-Los Angeles''s admissions pages.'),
  ('university-of-california-los-angeles', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check University of California-Los Angeles''s admissions pages.'),
  ('university-of-california-los-angeles', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of California-Los Angeles''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #43: Colgate University (UNITID 190099)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-colgate-university', 'College Scorecard — Colgate University', 'https://collegescorecard.ed.gov/school/?190099-colgate_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('colgate-university', 'Colgate University', 'Hamilton, New York', 'United States', '🇺🇸', 'Private four-year institution in Hamilton, New York.',
  'Colgate University. College Scorecard (2023) reports out-of-state tuition $70,306 / year and a middle-50% SAT range Middle-50% SAT critical reading 710–760; math 720–780 (Scorecard 2023).', 'colgate-university', array[]::text[], 'us-scorecard-colgate-university', 43, 'us-4prep-ranking-scorecard-2023', 190099)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('colgate-university', 'tuition'::public.university_fact_kind, '$70,306 / year (Scorecard 2023)', 70306, 'USD', 'us-scorecard-colgate-university', null, null, 'year'),
  ('colgate-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Colgate University''s admissions / financial-aid pages.', null),
  ('colgate-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Colgate University''s admissions pages.', null),
  ('colgate-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Colgate University''s admissions pages.', null),
  ('colgate-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Colgate University''s financial-aid pages.', null),
  ('colgate-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Colgate University''s admissions pages.', null),
  ('colgate-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Colgate University''s admissions pages.', null),
  ('colgate-university', 'room_board'::public.university_fact_kind, '$17,610 / year (Scorecard 2023)', 17610, 'USD', 'us-scorecard-colgate-university', null, null, 'year'),
  ('colgate-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Colgate University''s financial-aid pages.', null),
  ('colgate-university', 'total_cost_of_attendance'::public.university_fact_kind, '$87,070 / year (Scorecard 2023)', 87070, 'USD', 'us-scorecard-colgate-university', null, null, 'year'),
  ('colgate-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Colgate University''s international admissions / financial-aid pages.', null),
  ('colgate-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 710–760; math 720–780 (Scorecard 2023); Middle-50% ACT 33–34 (Scorecard 2023)', null, null, 'us-scorecard-colgate-university', null, null, null),
  ('colgate-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Colgate University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('colgate-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Colgate University''s admissions pages.'),
  ('colgate-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Colgate University''s admissions pages.'),
  ('colgate-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Colgate University''s admissions pages.'),
  ('colgate-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 710–760; math 720–780 (Scorecard 2023)', null, 'us-scorecard-colgate-university', null, null),
  ('colgate-university', 'act'::public.requirement_kind, 'Middle-50% ACT 33–34 (Scorecard 2023)', null, 'us-scorecard-colgate-university', null, null),
  ('colgate-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Colgate University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #44: Emory University (UNITID 139658)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-emory-university', 'College Scorecard — Emory University', 'https://collegescorecard.ed.gov/school/?139658-emory_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('emory-university', 'Emory University', 'Atlanta, Georgia', 'United States', '🇺🇸', 'Private four-year institution in Atlanta, Georgia.',
  'Emory University. College Scorecard (2023) reports out-of-state tuition $64,280 / year and a middle-50% SAT range Middle-50% SAT critical reading 720–760; math 750–790 (Scorecard 2023).', 'emory-university', array[]::text[], 'us-scorecard-emory-university', 44, 'us-4prep-ranking-scorecard-2023', 139658)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('emory-university', 'tuition'::public.university_fact_kind, '$64,280 / year (Scorecard 2023)', 64280, 'USD', 'us-scorecard-emory-university', null, null, 'year'),
  ('emory-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Emory University''s admissions / financial-aid pages.', null),
  ('emory-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Emory University''s admissions pages.', null),
  ('emory-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Emory University''s admissions pages.', null),
  ('emory-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Emory University''s financial-aid pages.', null),
  ('emory-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Emory University''s admissions pages.', null),
  ('emory-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Emory University''s admissions pages.', null),
  ('emory-university', 'room_board'::public.university_fact_kind, '$20,220 / year (Scorecard 2023)', 20220, 'USD', 'us-scorecard-emory-university', null, null, 'year'),
  ('emory-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Emory University''s financial-aid pages.', null),
  ('emory-university', 'total_cost_of_attendance'::public.university_fact_kind, '$83,622 / year (Scorecard 2023)', 83622, 'USD', 'us-scorecard-emory-university', null, null, 'year'),
  ('emory-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Emory University''s international admissions / financial-aid pages.', null),
  ('emory-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 720–760; math 750–790 (Scorecard 2023); Middle-50% ACT 32–35 (Scorecard 2023)', null, null, 'us-scorecard-emory-university', null, null, null),
  ('emory-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Emory University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('emory-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Emory University''s admissions pages.'),
  ('emory-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Emory University''s admissions pages.'),
  ('emory-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Emory University''s admissions pages.'),
  ('emory-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 720–760; math 750–790 (Scorecard 2023)', null, 'us-scorecard-emory-university', null, null),
  ('emory-university', 'act'::public.requirement_kind, 'Middle-50% ACT 32–35 (Scorecard 2023)', null, 'us-scorecard-emory-university', null, null),
  ('emory-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Emory University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #45: University of Virginia-Main Campus (UNITID 234076)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-virginia-main-campus', 'College Scorecard — University of Virginia-Main Campus', 'https://collegescorecard.ed.gov/school/?234076-university_of_virginia_main_campus', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-virginia-main-campus', 'University of Virginia-Main Campus', 'Charlottesville, Virginia', 'United States', '🇺🇸', 'Public four-year institution in Charlottesville, Virginia.',
  'University of Virginia-Main Campus. College Scorecard (2023) reports out-of-state tuition $59,512 / year and a middle-50% SAT range Middle-50% SAT critical reading 700–760; math 710–780 (Scorecard 2023).', 'university-of-virginia-main-campus', array[]::text[], 'us-scorecard-university-of-virginia-main-campus', 45, 'us-4prep-ranking-scorecard-2023', 234076)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-virginia-main-campus', 'tuition'::public.university_fact_kind, '$59,512 / year (Scorecard 2023)', 59512, 'USD', 'us-scorecard-university-of-virginia-main-campus', null, null, 'year'),
  ('university-of-virginia-main-campus', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of Virginia-Main Campus''s admissions / financial-aid pages.', null),
  ('university-of-virginia-main-campus', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of Virginia-Main Campus''s admissions pages.', null),
  ('university-of-virginia-main-campus', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of Virginia-Main Campus''s admissions pages.', null),
  ('university-of-virginia-main-campus', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of Virginia-Main Campus''s financial-aid pages.', null),
  ('university-of-virginia-main-campus', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of Virginia-Main Campus''s admissions pages.', null),
  ('university-of-virginia-main-campus', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of Virginia-Main Campus''s admissions pages.', null),
  ('university-of-virginia-main-campus', 'room_board'::public.university_fact_kind, '$14,800 / year (Scorecard 2023)', 14800, 'USD', 'us-scorecard-university-of-virginia-main-campus', null, null, 'year'),
  ('university-of-virginia-main-campus', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of Virginia-Main Campus''s financial-aid pages.', null),
  ('university-of-virginia-main-campus', 'total_cost_of_attendance'::public.university_fact_kind, '$39,926 / year (Scorecard 2023)', 39926, 'USD', 'us-scorecard-university-of-virginia-main-campus', null, null, 'year'),
  ('university-of-virginia-main-campus', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of Virginia-Main Campus''s international admissions / financial-aid pages.', null),
  ('university-of-virginia-main-campus', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 700–760; math 710–780 (Scorecard 2023); Middle-50% ACT 32–35 (Scorecard 2023)', null, null, 'us-scorecard-university-of-virginia-main-campus', null, null, null),
  ('university-of-virginia-main-campus', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of Virginia-Main Campus''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-virginia-main-campus', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of Virginia-Main Campus''s admissions pages.'),
  ('university-of-virginia-main-campus', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of Virginia-Main Campus''s admissions pages.'),
  ('university-of-virginia-main-campus', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of Virginia-Main Campus''s admissions pages.'),
  ('university-of-virginia-main-campus', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 700–760; math 710–780 (Scorecard 2023)', null, 'us-scorecard-university-of-virginia-main-campus', null, null),
  ('university-of-virginia-main-campus', 'act'::public.requirement_kind, 'Middle-50% ACT 32–35 (Scorecard 2023)', null, 'us-scorecard-university-of-virginia-main-campus', null, null),
  ('university-of-virginia-main-campus', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of Virginia-Main Campus''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #46: New York University (UNITID 193900)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-new-york-university', 'College Scorecard — New York University', 'https://collegescorecard.ed.gov/school/?193900-new_york_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('new-york-university', 'New York University', 'New York, New York', 'United States', '🇺🇸', 'Private four-year institution in New York, New York.',
  'New York University. College Scorecard (2023) reports out-of-state tuition $62,796 / year and a middle-50% SAT range Middle-50% SAT critical reading 720–760; math 760–800 (Scorecard 2023).', 'new-york-university', array[]::text[], 'us-scorecard-new-york-university', 46, 'us-4prep-ranking-scorecard-2023', 193900)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('new-york-university', 'tuition'::public.university_fact_kind, '$62,796 / year (Scorecard 2023)', 62796, 'USD', 'us-scorecard-new-york-university', null, null, 'year'),
  ('new-york-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check New York University''s admissions / financial-aid pages.', null),
  ('new-york-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check New York University''s admissions pages.', null),
  ('new-york-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check New York University''s admissions pages.', null),
  ('new-york-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check New York University''s financial-aid pages.', null),
  ('new-york-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check New York University''s admissions pages.', null),
  ('new-york-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check New York University''s admissions pages.', null),
  ('new-york-university', 'room_board'::public.university_fact_kind, '$23,530 / year (Scorecard 2023)', 23530, 'USD', 'us-scorecard-new-york-university', null, null, 'year'),
  ('new-york-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check New York University''s financial-aid pages.', null),
  ('new-york-university', 'total_cost_of_attendance'::public.university_fact_kind, '$84,374 / year (Scorecard 2023)', 84374, 'USD', 'us-scorecard-new-york-university', null, null, 'year'),
  ('new-york-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check New York University''s international admissions / financial-aid pages.', null),
  ('new-york-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 720–760; math 760–800 (Scorecard 2023); Middle-50% ACT 34–35 (Scorecard 2023)', null, null, 'us-scorecard-new-york-university', null, null, null),
  ('new-york-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask New York University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('new-york-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check New York University''s admissions pages.'),
  ('new-york-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check New York University''s admissions pages.'),
  ('new-york-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check New York University''s admissions pages.'),
  ('new-york-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 720–760; math 760–800 (Scorecard 2023)', null, 'us-scorecard-new-york-university', null, null),
  ('new-york-university', 'act'::public.requirement_kind, 'Middle-50% ACT 34–35 (Scorecard 2023)', null, 'us-scorecard-new-york-university', null, null),
  ('new-york-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check New York University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #47: Colby College (UNITID 161086)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-colby-college', 'College Scorecard — Colby College', 'https://collegescorecard.ed.gov/school/?161086-colby_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('colby-college', 'Colby College', 'Waterville, Maine', 'United States', '🇺🇸', 'Private four-year institution in Waterville, Maine.',
  'Colby College. College Scorecard (2023) reports out-of-state tuition $69,600 / year and a middle-50% SAT range Middle-50% SAT critical reading 720–760; math 740–790 (Scorecard 2023).', 'colby-college', array[]::text[], 'us-scorecard-colby-college', 47, 'us-4prep-ranking-scorecard-2023', 161086)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('colby-college', 'tuition'::public.university_fact_kind, '$69,600 / year (Scorecard 2023)', 69600, 'USD', 'us-scorecard-colby-college', null, null, 'year'),
  ('colby-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Colby College''s admissions / financial-aid pages.', null),
  ('colby-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Colby College''s admissions pages.', null),
  ('colby-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Colby College''s admissions pages.', null),
  ('colby-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Colby College''s financial-aid pages.', null),
  ('colby-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Colby College''s admissions pages.', null),
  ('colby-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Colby College''s admissions pages.', null),
  ('colby-college', 'room_board'::public.university_fact_kind, '$17,890 / year (Scorecard 2023)', 17890, 'USD', 'us-scorecard-colby-college', null, null, 'year'),
  ('colby-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Colby College''s financial-aid pages.', null),
  ('colby-college', 'total_cost_of_attendance'::public.university_fact_kind, '$85,420 / year (Scorecard 2023)', 85420, 'USD', 'us-scorecard-colby-college', null, null, 'year'),
  ('colby-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Colby College''s international admissions / financial-aid pages.', null),
  ('colby-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 720–760; math 740–790 (Scorecard 2023); Middle-50% ACT 32–34 (Scorecard 2023)', null, null, 'us-scorecard-colby-college', null, null, null),
  ('colby-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Colby College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('colby-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Colby College''s admissions pages.'),
  ('colby-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Colby College''s admissions pages.'),
  ('colby-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Colby College''s admissions pages.'),
  ('colby-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 720–760; math 740–790 (Scorecard 2023)', null, 'us-scorecard-colby-college', null, null),
  ('colby-college', 'act'::public.requirement_kind, 'Middle-50% ACT 32–34 (Scorecard 2023)', null, 'us-scorecard-colby-college', null, null),
  ('colby-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Colby College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #48: Northeastern University Oakland (UNITID 118888)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-northeastern-university-oakland', 'College Scorecard — Northeastern University Oakland', 'https://collegescorecard.ed.gov/school/?118888-northeastern_university_oakland', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('northeastern-university-oakland', 'Northeastern University Oakland', 'Oakland, California', 'United States', '🇺🇸', 'Private four-year institution in Oakland, California.',
  'Northeastern University Oakland. College Scorecard (2023) reports out-of-state tuition $67,778 / year and a middle-50% SAT range Middle-50% SAT critical reading 690–740; math 730–780 (Scorecard 2023).', 'northeastern-university-oakland', array[]::text[], 'us-scorecard-northeastern-university-oakland', 48, 'us-4prep-ranking-scorecard-2023', 118888)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('northeastern-university-oakland', 'tuition'::public.university_fact_kind, '$67,778 / year (Scorecard 2023)', 67778, 'USD', 'us-scorecard-northeastern-university-oakland', null, null, 'year'),
  ('northeastern-university-oakland', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Northeastern University Oakland''s admissions / financial-aid pages.', null),
  ('northeastern-university-oakland', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Northeastern University Oakland''s admissions pages.', null),
  ('northeastern-university-oakland', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Northeastern University Oakland''s admissions pages.', null),
  ('northeastern-university-oakland', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Northeastern University Oakland''s financial-aid pages.', null),
  ('northeastern-university-oakland', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Northeastern University Oakland''s admissions pages.', null),
  ('northeastern-university-oakland', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Northeastern University Oakland''s admissions pages.', null),
  ('northeastern-university-oakland', 'room_board'::public.university_fact_kind, '$19,580 / year (Scorecard 2023)', 19580, 'USD', 'us-scorecard-northeastern-university-oakland', null, null, 'year'),
  ('northeastern-university-oakland', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Northeastern University Oakland''s financial-aid pages.', null),
  ('northeastern-university-oakland', 'total_cost_of_attendance'::public.university_fact_kind, '$85,418 / year (Scorecard 2023)', 85418, 'USD', 'us-scorecard-northeastern-university-oakland', null, null, 'year'),
  ('northeastern-university-oakland', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Northeastern University Oakland''s international admissions / financial-aid pages.', null),
  ('northeastern-university-oakland', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 690–740; math 730–780 (Scorecard 2023); Middle-50% ACT 32–33 (Scorecard 2023)', null, null, 'us-scorecard-northeastern-university-oakland', null, null, null),
  ('northeastern-university-oakland', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Northeastern University Oakland''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('northeastern-university-oakland', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Northeastern University Oakland''s admissions pages.'),
  ('northeastern-university-oakland', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Northeastern University Oakland''s admissions pages.'),
  ('northeastern-university-oakland', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Northeastern University Oakland''s admissions pages.'),
  ('northeastern-university-oakland', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 690–740; math 730–780 (Scorecard 2023)', null, 'us-scorecard-northeastern-university-oakland', null, null),
  ('northeastern-university-oakland', 'act'::public.requirement_kind, 'Middle-50% ACT 32–33 (Scorecard 2023)', null, 'us-scorecard-northeastern-university-oakland', null, null),
  ('northeastern-university-oakland', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Northeastern University Oakland''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #49: Villanova University (UNITID 216597)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-villanova-university', 'College Scorecard — Villanova University', 'https://collegescorecard.ed.gov/school/?216597-villanova_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('villanova-university', 'Villanova University', 'Villanova, Pennsylvania', 'United States', '🇺🇸', 'Private four-year institution in Villanova, Pennsylvania.',
  'Villanova University. College Scorecard (2023) reports out-of-state tuition $67,776 / year and a middle-50% SAT range Middle-50% SAT critical reading 685–740; math 710–770 (Scorecard 2023).', 'villanova-university', array[]::text[], 'us-scorecard-villanova-university', 49, 'us-4prep-ranking-scorecard-2023', 216597)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('villanova-university', 'tuition'::public.university_fact_kind, '$67,776 / year (Scorecard 2023)', 67776, 'USD', 'us-scorecard-villanova-university', null, null, 'year'),
  ('villanova-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Villanova University''s admissions / financial-aid pages.', null),
  ('villanova-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Villanova University''s admissions pages.', null),
  ('villanova-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Villanova University''s admissions pages.', null),
  ('villanova-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Villanova University''s financial-aid pages.', null),
  ('villanova-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Villanova University''s admissions pages.', null),
  ('villanova-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Villanova University''s admissions pages.', null),
  ('villanova-university', 'room_board'::public.university_fact_kind, '$17,694 / year (Scorecard 2023)', 17694, 'USD', 'us-scorecard-villanova-university', null, null, 'year'),
  ('villanova-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Villanova University''s financial-aid pages.', null),
  ('villanova-university', 'total_cost_of_attendance'::public.university_fact_kind, '$84,793 / year (Scorecard 2023)', 84793, 'USD', 'us-scorecard-villanova-university', null, null, 'year'),
  ('villanova-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Villanova University''s international admissions / financial-aid pages.', null),
  ('villanova-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 685–740; math 710–770 (Scorecard 2023); Middle-50% ACT 32–34 (Scorecard 2023)', null, null, 'us-scorecard-villanova-university', null, null, null),
  ('villanova-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Villanova University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('villanova-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Villanova University''s admissions pages.'),
  ('villanova-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Villanova University''s admissions pages.'),
  ('villanova-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Villanova University''s admissions pages.'),
  ('villanova-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 685–740; math 710–770 (Scorecard 2023)', null, 'us-scorecard-villanova-university', null, null),
  ('villanova-university', 'act'::public.requirement_kind, 'Middle-50% ACT 32–34 (Scorecard 2023)', null, 'us-scorecard-villanova-university', null, null),
  ('villanova-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Villanova University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #50: Haverford College (UNITID 212911)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-haverford-college', 'College Scorecard — Haverford College', 'https://collegescorecard.ed.gov/school/?212911-haverford_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('haverford-college', 'Haverford College', 'Haverford, Pennsylvania', 'United States', '🇺🇸', 'Private four-year institution in Haverford, Pennsylvania.',
  'Haverford College. College Scorecard (2023) reports out-of-state tuition $70,688 / year and a middle-50% SAT range Middle-50% SAT critical reading 720–770; math 740–780 (Scorecard 2023).', 'haverford-college', array[]::text[], 'us-scorecard-haverford-college', 50, 'us-4prep-ranking-scorecard-2023', 212911)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('haverford-college', 'tuition'::public.university_fact_kind, '$70,688 / year (Scorecard 2023)', 70688, 'USD', 'us-scorecard-haverford-college', null, null, 'year'),
  ('haverford-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Haverford College''s admissions / financial-aid pages.', null),
  ('haverford-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Haverford College''s admissions pages.', null),
  ('haverford-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Haverford College''s admissions pages.', null),
  ('haverford-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Haverford College''s financial-aid pages.', null),
  ('haverford-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Haverford College''s admissions pages.', null),
  ('haverford-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Haverford College''s admissions pages.', null),
  ('haverford-college', 'room_board'::public.university_fact_kind, '$19,548 / year (Scorecard 2023)', 19548, 'USD', 'us-scorecard-haverford-college', null, null, 'year'),
  ('haverford-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Haverford College''s financial-aid pages.', null),
  ('haverford-college', 'total_cost_of_attendance'::public.university_fact_kind, '$90,382 / year (Scorecard 2023)', 90382, 'USD', 'us-scorecard-haverford-college', null, null, 'year'),
  ('haverford-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Haverford College''s international admissions / financial-aid pages.', null),
  ('haverford-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 720–770; math 740–780 (Scorecard 2023); Middle-50% ACT 33–35 (Scorecard 2023)', null, null, 'us-scorecard-haverford-college', null, null, null),
  ('haverford-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Haverford College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('haverford-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Haverford College''s admissions pages.'),
  ('haverford-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Haverford College''s admissions pages.'),
  ('haverford-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Haverford College''s admissions pages.'),
  ('haverford-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 720–770; math 740–780 (Scorecard 2023)', null, 'us-scorecard-haverford-college', null, null),
  ('haverford-college', 'act'::public.requirement_kind, 'Middle-50% ACT 33–35 (Scorecard 2023)', null, 'us-scorecard-haverford-college', null, null),
  ('haverford-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Haverford College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #51: Boston University (UNITID 164988)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-boston-university', 'College Scorecard — Boston University', 'https://collegescorecard.ed.gov/school/?164988-boston_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('boston-university', 'Boston University', 'Boston, Massachusetts', 'United States', '🇺🇸', 'Private four-year institution in Boston, Massachusetts.',
  'Boston University. College Scorecard (2023) reports out-of-state tuition $68,102 / year and a middle-50% SAT range Middle-50% SAT critical reading 690–750; math 730–780 (Scorecard 2023).', 'boston-university', array[]::text[], 'us-scorecard-boston-university', 51, 'us-4prep-ranking-scorecard-2023', 164988)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('boston-university', 'tuition'::public.university_fact_kind, '$68,102 / year (Scorecard 2023)', 68102, 'USD', 'us-scorecard-boston-university', null, null, 'year'),
  ('boston-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Boston University''s admissions / financial-aid pages.', null),
  ('boston-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Boston University''s admissions pages.', null),
  ('boston-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Boston University''s admissions pages.', null),
  ('boston-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Boston University''s financial-aid pages.', null),
  ('boston-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Boston University''s admissions pages.', null),
  ('boston-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Boston University''s admissions pages.', null),
  ('boston-university', 'room_board'::public.university_fact_kind, '$19,020 / year (Scorecard 2023)', 19020, 'USD', 'us-scorecard-boston-university', null, null, 'year'),
  ('boston-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Boston University''s financial-aid pages.', null),
  ('boston-university', 'total_cost_of_attendance'::public.university_fact_kind, '$86,285 / year (Scorecard 2023)', 86285, 'USD', 'us-scorecard-boston-university', null, null, 'year'),
  ('boston-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Boston University''s international admissions / financial-aid pages.', null),
  ('boston-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 690–750; math 730–780 (Scorecard 2023); Middle-50% ACT 32–34 (Scorecard 2023)', null, null, 'us-scorecard-boston-university', null, null, null),
  ('boston-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Boston University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('boston-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Boston University''s admissions pages.'),
  ('boston-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Boston University''s admissions pages.'),
  ('boston-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Boston University''s admissions pages.'),
  ('boston-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 690–750; math 730–780 (Scorecard 2023)', null, 'us-scorecard-boston-university', null, null),
  ('boston-university', 'act'::public.requirement_kind, 'Middle-50% ACT 32–34 (Scorecard 2023)', null, 'us-scorecard-boston-university', null, null),
  ('boston-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Boston University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #52: University of Michigan-Ann Arbor (UNITID 170976)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-michigan-ann-arbor', 'College Scorecard — University of Michigan-Ann Arbor', 'https://collegescorecard.ed.gov/school/?170976-university_of_michigan_ann_arbor', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-michigan-ann-arbor', 'University of Michigan-Ann Arbor', 'Ann Arbor, Michigan', 'United States', '🇺🇸', 'Public four-year institution in Ann Arbor, Michigan.',
  'University of Michigan-Ann Arbor. College Scorecard (2023) reports out-of-state tuition $60,946 / year and a middle-50% SAT range Middle-50% SAT critical reading 680–750; math 680–780 (Scorecard 2023).', 'university-of-michigan-ann-arbor', array[]::text[], 'us-scorecard-university-of-michigan-ann-arbor', 52, 'us-4prep-ranking-scorecard-2023', 170976)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-michigan-ann-arbor', 'tuition'::public.university_fact_kind, '$60,946 / year (Scorecard 2023)', 60946, 'USD', 'us-scorecard-university-of-michigan-ann-arbor', null, null, 'year'),
  ('university-of-michigan-ann-arbor', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of Michigan-Ann Arbor''s admissions / financial-aid pages.', null),
  ('university-of-michigan-ann-arbor', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of Michigan-Ann Arbor''s admissions pages.', null),
  ('university-of-michigan-ann-arbor', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of Michigan-Ann Arbor''s admissions pages.', null),
  ('university-of-michigan-ann-arbor', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of Michigan-Ann Arbor''s financial-aid pages.', null),
  ('university-of-michigan-ann-arbor', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of Michigan-Ann Arbor''s admissions pages.', null),
  ('university-of-michigan-ann-arbor', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of Michigan-Ann Arbor''s admissions pages.', null),
  ('university-of-michigan-ann-arbor', 'room_board'::public.university_fact_kind, '$15,328 / year (Scorecard 2023)', 15328, 'USD', 'us-scorecard-university-of-michigan-ann-arbor', null, null, 'year'),
  ('university-of-michigan-ann-arbor', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of Michigan-Ann Arbor''s financial-aid pages.', null),
  ('university-of-michigan-ann-arbor', 'total_cost_of_attendance'::public.university_fact_kind, '$34,654 / year (Scorecard 2023)', 34654, 'USD', 'us-scorecard-university-of-michigan-ann-arbor', null, null, 'year'),
  ('university-of-michigan-ann-arbor', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of Michigan-Ann Arbor''s international admissions / financial-aid pages.', null),
  ('university-of-michigan-ann-arbor', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 680–750; math 680–780 (Scorecard 2023); Middle-50% ACT 31–34 (Scorecard 2023)', null, null, 'us-scorecard-university-of-michigan-ann-arbor', null, null, null),
  ('university-of-michigan-ann-arbor', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of Michigan-Ann Arbor''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-michigan-ann-arbor', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of Michigan-Ann Arbor''s admissions pages.'),
  ('university-of-michigan-ann-arbor', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of Michigan-Ann Arbor''s admissions pages.'),
  ('university-of-michigan-ann-arbor', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of Michigan-Ann Arbor''s admissions pages.'),
  ('university-of-michigan-ann-arbor', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 680–750; math 680–780 (Scorecard 2023)', null, 'us-scorecard-university-of-michigan-ann-arbor', null, null),
  ('university-of-michigan-ann-arbor', 'act'::public.requirement_kind, 'Middle-50% ACT 31–34 (Scorecard 2023)', null, 'us-scorecard-university-of-michigan-ann-arbor', null, null),
  ('university-of-michigan-ann-arbor', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of Michigan-Ann Arbor''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #53: Middlebury College (UNITID 230959)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-middlebury-college', 'College Scorecard — Middlebury College', 'https://collegescorecard.ed.gov/school/?230959-middlebury_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('middlebury-college', 'Middlebury College', 'Middlebury, Vermont', 'United States', '🇺🇸', 'Private four-year institution in Middlebury, Vermont.',
  'Middlebury College. College Scorecard (2023) reports out-of-state tuition $67,600 / year and a middle-50% SAT range Middle-50% SAT critical reading 720–760; math 725–790 (Scorecard 2023).', 'middlebury-college', array[]::text[], 'us-scorecard-middlebury-college', 53, 'us-4prep-ranking-scorecard-2023', 230959)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('middlebury-college', 'tuition'::public.university_fact_kind, '$67,600 / year (Scorecard 2023)', 67600, 'USD', 'us-scorecard-middlebury-college', null, null, 'year'),
  ('middlebury-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Middlebury College''s admissions / financial-aid pages.', null),
  ('middlebury-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Middlebury College''s admissions pages.', null),
  ('middlebury-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Middlebury College''s admissions pages.', null),
  ('middlebury-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Middlebury College''s financial-aid pages.', null),
  ('middlebury-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Middlebury College''s admissions pages.', null),
  ('middlebury-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Middlebury College''s admissions pages.', null),
  ('middlebury-college', 'room_board'::public.university_fact_kind, '$19,250 / year (Scorecard 2023)', 19250, 'USD', 'us-scorecard-middlebury-college', null, null, 'year'),
  ('middlebury-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Middlebury College''s financial-aid pages.', null),
  ('middlebury-college', 'total_cost_of_attendance'::public.university_fact_kind, '$85,880 / year (Scorecard 2023)', 85880, 'USD', 'us-scorecard-middlebury-college', null, null, 'year'),
  ('middlebury-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Middlebury College''s international admissions / financial-aid pages.', null),
  ('middlebury-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 720–760; math 725–790 (Scorecard 2023); Middle-50% ACT 33–35 (Scorecard 2023)', null, null, 'us-scorecard-middlebury-college', null, null, null),
  ('middlebury-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Middlebury College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('middlebury-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Middlebury College''s admissions pages.'),
  ('middlebury-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Middlebury College''s admissions pages.'),
  ('middlebury-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Middlebury College''s admissions pages.'),
  ('middlebury-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 720–760; math 725–790 (Scorecard 2023)', null, 'us-scorecard-middlebury-college', null, null),
  ('middlebury-college', 'act'::public.requirement_kind, 'Middle-50% ACT 33–35 (Scorecard 2023)', null, 'us-scorecard-middlebury-college', null, null),
  ('middlebury-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Middlebury College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #54: Hamilton College (UNITID 191515)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-hamilton-college', 'College Scorecard — Hamilton College', 'https://collegescorecard.ed.gov/school/?191515-hamilton_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('hamilton-college', 'Hamilton College', 'Clinton, New York', 'United States', '🇺🇸', 'Private four-year institution in Clinton, New York.',
  'Hamilton College. College Scorecard (2023) reports out-of-state tuition $68,960 / year and a middle-50% SAT range Middle-50% SAT critical reading 720–770; math 730–780 (Scorecard 2023).', 'hamilton-college', array[]::text[], 'us-scorecard-hamilton-college', 54, 'us-4prep-ranking-scorecard-2023', 191515)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('hamilton-college', 'tuition'::public.university_fact_kind, '$68,960 / year (Scorecard 2023)', 68960, 'USD', 'us-scorecard-hamilton-college', null, null, 'year'),
  ('hamilton-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Hamilton College''s admissions / financial-aid pages.', null),
  ('hamilton-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Hamilton College''s admissions pages.', null),
  ('hamilton-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Hamilton College''s admissions pages.', null),
  ('hamilton-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Hamilton College''s financial-aid pages.', null),
  ('hamilton-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Hamilton College''s admissions pages.', null),
  ('hamilton-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Hamilton College''s admissions pages.', null),
  ('hamilton-college', 'room_board'::public.university_fact_kind, '$17,510 / year (Scorecard 2023)', 17510, 'USD', 'us-scorecard-hamilton-college', null, null, 'year'),
  ('hamilton-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Hamilton College''s financial-aid pages.', null),
  ('hamilton-college', 'total_cost_of_attendance'::public.university_fact_kind, '$84,230 / year (Scorecard 2023)', 84230, 'USD', 'us-scorecard-hamilton-college', null, null, 'year'),
  ('hamilton-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Hamilton College''s international admissions / financial-aid pages.', null),
  ('hamilton-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 720–770; math 730–780 (Scorecard 2023); Middle-50% ACT 33–35 (Scorecard 2023)', null, null, 'us-scorecard-hamilton-college', null, null, null),
  ('hamilton-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Hamilton College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('hamilton-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Hamilton College''s admissions pages.'),
  ('hamilton-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Hamilton College''s admissions pages.'),
  ('hamilton-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Hamilton College''s admissions pages.'),
  ('hamilton-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 720–770; math 730–780 (Scorecard 2023)', null, 'us-scorecard-hamilton-college', null, null),
  ('hamilton-college', 'act'::public.requirement_kind, 'Middle-50% ACT 33–35 (Scorecard 2023)', null, 'us-scorecard-hamilton-college', null, null),
  ('hamilton-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Hamilton College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #55: Lehigh University (UNITID 213543)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-lehigh-university', 'College Scorecard — Lehigh University', 'https://collegescorecard.ed.gov/school/?213543-lehigh_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('lehigh-university', 'Lehigh University', 'Bethlehem, Pennsylvania', 'United States', '🇺🇸', 'Private four-year institution in Bethlehem, Pennsylvania.',
  'Lehigh University. College Scorecard (2023) reports out-of-state tuition $64,980 / year and a middle-50% SAT range Middle-50% SAT critical reading 680–730; math 690–770 (Scorecard 2023).', 'lehigh-university', array[]::text[], 'us-scorecard-lehigh-university', 55, 'us-4prep-ranking-scorecard-2023', 213543)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('lehigh-university', 'tuition'::public.university_fact_kind, '$64,980 / year (Scorecard 2023)', 64980, 'USD', 'us-scorecard-lehigh-university', null, null, 'year'),
  ('lehigh-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Lehigh University''s admissions / financial-aid pages.', null),
  ('lehigh-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Lehigh University''s admissions pages.', null),
  ('lehigh-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Lehigh University''s admissions pages.', null),
  ('lehigh-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Lehigh University''s financial-aid pages.', null),
  ('lehigh-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Lehigh University''s admissions pages.', null),
  ('lehigh-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Lehigh University''s admissions pages.', null),
  ('lehigh-university', 'room_board'::public.university_fact_kind, '$17,220 / year (Scorecard 2023)', 17220, 'USD', 'us-scorecard-lehigh-university', null, null, 'year'),
  ('lehigh-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Lehigh University''s financial-aid pages.', null),
  ('lehigh-university', 'total_cost_of_attendance'::public.university_fact_kind, '$80,856 / year (Scorecard 2023)', 80856, 'USD', 'us-scorecard-lehigh-university', null, null, 'year'),
  ('lehigh-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Lehigh University''s international admissions / financial-aid pages.', null),
  ('lehigh-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 680–730; math 690–770 (Scorecard 2023); Middle-50% ACT 31–34 (Scorecard 2023)', null, null, 'us-scorecard-lehigh-university', null, null, null),
  ('lehigh-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Lehigh University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('lehigh-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Lehigh University''s admissions pages.'),
  ('lehigh-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Lehigh University''s admissions pages.'),
  ('lehigh-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Lehigh University''s admissions pages.'),
  ('lehigh-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 680–730; math 690–770 (Scorecard 2023)', null, 'us-scorecard-lehigh-university', null, null),
  ('lehigh-university', 'act'::public.requirement_kind, 'Middle-50% ACT 31–34 (Scorecard 2023)', null, 'us-scorecard-lehigh-university', null, null),
  ('lehigh-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Lehigh University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #56: Webb Institute (UNITID 197221)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-webb-institute', 'College Scorecard — Webb Institute', 'https://collegescorecard.ed.gov/school/?197221-webb_institute', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('webb-institute', 'Webb Institute', 'Glen Cove, New York', 'United States', '🇺🇸', 'Private four-year institution in Glen Cove, New York.',
  'Webb Institute. College Scorecard (2023) reports out-of-state tuition $63,214 / year and a middle-50% SAT range Middle-50% SAT critical reading 710–750; math 720–780 (Scorecard 2023).', 'webb-institute', array[]::text[], 'us-scorecard-webb-institute', 56, 'us-4prep-ranking-scorecard-2023', 197221)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('webb-institute', 'tuition'::public.university_fact_kind, '$63,214 / year (Scorecard 2023)', 63214, 'USD', 'us-scorecard-webb-institute', null, null, 'year'),
  ('webb-institute', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Webb Institute''s admissions / financial-aid pages.', null),
  ('webb-institute', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Webb Institute''s admissions pages.', null),
  ('webb-institute', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Webb Institute''s admissions pages.', null),
  ('webb-institute', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Webb Institute''s financial-aid pages.', null),
  ('webb-institute', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Webb Institute''s admissions pages.', null),
  ('webb-institute', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Webb Institute''s admissions pages.', null),
  ('webb-institute', 'room_board'::public.university_fact_kind, '$15,280 / year (Scorecard 2023)', 15280, 'USD', 'us-scorecard-webb-institute', null, null, 'year'),
  ('webb-institute', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Webb Institute''s financial-aid pages.', null),
  ('webb-institute', 'total_cost_of_attendance'::public.university_fact_kind, '$81,950 / year (Scorecard 2023)', 81950, 'USD', 'us-scorecard-webb-institute', null, null, 'year'),
  ('webb-institute', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Webb Institute''s international admissions / financial-aid pages.', null),
  ('webb-institute', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 710–750; math 720–780 (Scorecard 2023); Middle-50% ACT 32–34 (Scorecard 2023)', null, null, 'us-scorecard-webb-institute', null, null, null),
  ('webb-institute', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Webb Institute''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('webb-institute', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Webb Institute''s admissions pages.'),
  ('webb-institute', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Webb Institute''s admissions pages.'),
  ('webb-institute', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Webb Institute''s admissions pages.'),
  ('webb-institute', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 710–750; math 720–780 (Scorecard 2023)', null, 'us-scorecard-webb-institute', null, null),
  ('webb-institute', 'act'::public.requirement_kind, 'Middle-50% ACT 32–34 (Scorecard 2023)', null, 'us-scorecard-webb-institute', null, null),
  ('webb-institute', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Webb Institute''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #57: Davidson College (UNITID 198385)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-davidson-college', 'College Scorecard — Davidson College', 'https://collegescorecard.ed.gov/school/?198385-davidson_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('davidson-college', 'Davidson College', 'Davidson, North Carolina', 'United States', '🇺🇸', 'Private four-year institution in Davidson, North Carolina.',
  'Davidson College. College Scorecard (2023) reports out-of-state tuition $64,410 / year and a middle-50% SAT range Middle-50% SAT critical reading 695–750; math 705–780 (Scorecard 2023).', 'davidson-college', array[]::text[], 'us-scorecard-davidson-college', 57, 'us-4prep-ranking-scorecard-2023', 198385)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('davidson-college', 'tuition'::public.university_fact_kind, '$64,410 / year (Scorecard 2023)', 64410, 'USD', 'us-scorecard-davidson-college', null, null, 'year'),
  ('davidson-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Davidson College''s admissions / financial-aid pages.', null),
  ('davidson-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Davidson College''s admissions pages.', null),
  ('davidson-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Davidson College''s admissions pages.', null),
  ('davidson-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Davidson College''s financial-aid pages.', null),
  ('davidson-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Davidson College''s admissions pages.', null),
  ('davidson-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Davidson College''s admissions pages.', null),
  ('davidson-college', 'room_board'::public.university_fact_kind, '$17,100 / year (Scorecard 2023)', 17100, 'USD', 'us-scorecard-davidson-college', null, null, 'year'),
  ('davidson-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Davidson College''s financial-aid pages.', null),
  ('davidson-college', 'total_cost_of_attendance'::public.university_fact_kind, '$79,475 / year (Scorecard 2023)', 79475, 'USD', 'us-scorecard-davidson-college', null, null, 'year'),
  ('davidson-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Davidson College''s international admissions / financial-aid pages.', null),
  ('davidson-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 695–750; math 705–780 (Scorecard 2023); Middle-50% ACT 31–34 (Scorecard 2023)', null, null, 'us-scorecard-davidson-college', null, null, null),
  ('davidson-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Davidson College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('davidson-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Davidson College''s admissions pages.'),
  ('davidson-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Davidson College''s admissions pages.'),
  ('davidson-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Davidson College''s admissions pages.'),
  ('davidson-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 695–750; math 705–780 (Scorecard 2023)', null, 'us-scorecard-davidson-college', null, null),
  ('davidson-college', 'act'::public.requirement_kind, 'Middle-50% ACT 31–34 (Scorecard 2023)', null, 'us-scorecard-davidson-college', null, null),
  ('davidson-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Davidson College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #58: Yeshiva Zichron Aryeh (UNITID 487746)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-yeshiva-zichron-aryeh', 'College Scorecard — Yeshiva Zichron Aryeh', 'https://collegescorecard.ed.gov/school/?487746-yeshiva_zichron_aryeh', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('yeshiva-zichron-aryeh', 'Yeshiva Zichron Aryeh', 'Far Rockaway, New York', 'United States', '🇺🇸', 'Private four-year institution in Far Rockaway, New York.',
  'Yeshiva Zichron Aryeh. College Scorecard (2023) reports out-of-state tuition $9,650 / year and a middle-50% SAT range not reported.', 'yeshiva-zichron-aryeh', array[]::text[], 'us-scorecard-yeshiva-zichron-aryeh', 58, 'us-4prep-ranking-scorecard-2023', 487746)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('yeshiva-zichron-aryeh', 'tuition'::public.university_fact_kind, '$9,650 / year (Scorecard 2023)', 9650, 'USD', 'us-scorecard-yeshiva-zichron-aryeh', null, null, 'year'),
  ('yeshiva-zichron-aryeh', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Yeshiva Zichron Aryeh''s admissions / financial-aid pages.', null),
  ('yeshiva-zichron-aryeh', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Yeshiva Zichron Aryeh''s admissions pages.', null),
  ('yeshiva-zichron-aryeh', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Yeshiva Zichron Aryeh''s admissions pages.', null),
  ('yeshiva-zichron-aryeh', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Yeshiva Zichron Aryeh''s financial-aid pages.', null),
  ('yeshiva-zichron-aryeh', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Yeshiva Zichron Aryeh''s admissions pages.', null),
  ('yeshiva-zichron-aryeh', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Yeshiva Zichron Aryeh''s admissions pages.', null),
  ('yeshiva-zichron-aryeh', 'room_board'::public.university_fact_kind, '$7,850 / year (Scorecard 2023)', 7850, 'USD', 'us-scorecard-yeshiva-zichron-aryeh', null, null, 'year'),
  ('yeshiva-zichron-aryeh', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Yeshiva Zichron Aryeh''s financial-aid pages.', null),
  ('yeshiva-zichron-aryeh', 'total_cost_of_attendance'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report academic-year cost of attendance.', 'Check Yeshiva Zichron Aryeh''s financial-aid pages.', null),
  ('yeshiva-zichron-aryeh', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Yeshiva Zichron Aryeh''s international admissions / financial-aid pages.', null),
  ('yeshiva-zichron-aryeh', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check Yeshiva Zichron Aryeh''s admissions pages.', null),
  ('yeshiva-zichron-aryeh', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Yeshiva Zichron Aryeh''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('yeshiva-zichron-aryeh', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Yeshiva Zichron Aryeh''s admissions pages.'),
  ('yeshiva-zichron-aryeh', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Yeshiva Zichron Aryeh''s admissions pages.'),
  ('yeshiva-zichron-aryeh', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Yeshiva Zichron Aryeh''s admissions pages.'),
  ('yeshiva-zichron-aryeh', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check Yeshiva Zichron Aryeh''s admissions pages.'),
  ('yeshiva-zichron-aryeh', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check Yeshiva Zichron Aryeh''s admissions pages.'),
  ('yeshiva-zichron-aryeh', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Yeshiva Zichron Aryeh''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #59: Carleton College (UNITID 173258)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-carleton-college', 'College Scorecard — Carleton College', 'https://collegescorecard.ed.gov/school/?173258-carleton_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('carleton-college', 'Carleton College', 'Northfield, Minnesota', 'United States', '🇺🇸', 'Private four-year institution in Northfield, Minnesota.',
  'Carleton College. College Scorecard (2023) reports out-of-state tuition $68,892 / year and a middle-50% SAT range Middle-50% SAT critical reading 720–770; math 730–790 (Scorecard 2023).', 'carleton-college', array[]::text[], 'us-scorecard-carleton-college', 59, 'us-4prep-ranking-scorecard-2023', 173258)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('carleton-college', 'tuition'::public.university_fact_kind, '$68,892 / year (Scorecard 2023)', 68892, 'USD', 'us-scorecard-carleton-college', null, null, 'year'),
  ('carleton-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Carleton College''s admissions / financial-aid pages.', null),
  ('carleton-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Carleton College''s admissions pages.', null),
  ('carleton-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Carleton College''s admissions pages.', null),
  ('carleton-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Carleton College''s financial-aid pages.', null),
  ('carleton-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Carleton College''s admissions pages.', null),
  ('carleton-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Carleton College''s admissions pages.', null),
  ('carleton-college', 'room_board'::public.university_fact_kind, '$17,586 / year (Scorecard 2023)', 17586, 'USD', 'us-scorecard-carleton-college', null, null, 'year'),
  ('carleton-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Carleton College''s financial-aid pages.', null),
  ('carleton-college', 'total_cost_of_attendance'::public.university_fact_kind, '$84,893 / year (Scorecard 2023)', 84893, 'USD', 'us-scorecard-carleton-college', null, null, 'year'),
  ('carleton-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Carleton College''s international admissions / financial-aid pages.', null),
  ('carleton-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 720–770; math 730–790 (Scorecard 2023); Middle-50% ACT 32–34 (Scorecard 2023)', null, null, 'us-scorecard-carleton-college', null, null, null),
  ('carleton-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Carleton College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('carleton-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Carleton College''s admissions pages.'),
  ('carleton-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Carleton College''s admissions pages.'),
  ('carleton-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Carleton College''s admissions pages.'),
  ('carleton-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 720–770; math 730–790 (Scorecard 2023)', null, 'us-scorecard-carleton-college', null, null),
  ('carleton-college', 'act'::public.requirement_kind, 'Middle-50% ACT 32–34 (Scorecard 2023)', null, 'us-scorecard-carleton-college', null, null),
  ('carleton-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Carleton College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #60: Case Western Reserve University (UNITID 201645)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-case-western-reserve-university', 'College Scorecard — Case Western Reserve University', 'https://collegescorecard.ed.gov/school/?201645-case_western_reserve_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('case-western-reserve-university', 'Case Western Reserve University', 'Cleveland, Ohio', 'United States', '🇺🇸', 'Private four-year institution in Cleveland, Ohio.',
  'Case Western Reserve University. College Scorecard (2023) reports out-of-state tuition $66,608 / year and a middle-50% SAT range Middle-50% SAT critical reading 700–760; math 730–780 (Scorecard 2023).', 'case-western-reserve-university', array[]::text[], 'us-scorecard-case-western-reserve-university', 60, 'us-4prep-ranking-scorecard-2023', 201645)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('case-western-reserve-university', 'tuition'::public.university_fact_kind, '$66,608 / year (Scorecard 2023)', 66608, 'USD', 'us-scorecard-case-western-reserve-university', null, null, 'year'),
  ('case-western-reserve-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Case Western Reserve University''s admissions / financial-aid pages.', null),
  ('case-western-reserve-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Case Western Reserve University''s admissions pages.', null),
  ('case-western-reserve-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Case Western Reserve University''s admissions pages.', null),
  ('case-western-reserve-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Case Western Reserve University''s financial-aid pages.', null),
  ('case-western-reserve-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Case Western Reserve University''s admissions pages.', null),
  ('case-western-reserve-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Case Western Reserve University''s admissions pages.', null),
  ('case-western-reserve-university', 'room_board'::public.university_fact_kind, '$18,762 / year (Scorecard 2023)', 18762, 'USD', 'us-scorecard-case-western-reserve-university', null, null, 'year'),
  ('case-western-reserve-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Case Western Reserve University''s financial-aid pages.', null),
  ('case-western-reserve-university', 'total_cost_of_attendance'::public.university_fact_kind, '$85,851 / year (Scorecard 2023)', 85851, 'USD', 'us-scorecard-case-western-reserve-university', null, null, 'year'),
  ('case-western-reserve-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Case Western Reserve University''s international admissions / financial-aid pages.', null),
  ('case-western-reserve-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 700–760; math 730–780 (Scorecard 2023); Middle-50% ACT 32–34 (Scorecard 2023)', null, null, 'us-scorecard-case-western-reserve-university', null, null, null),
  ('case-western-reserve-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Case Western Reserve University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('case-western-reserve-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Case Western Reserve University''s admissions pages.'),
  ('case-western-reserve-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Case Western Reserve University''s admissions pages.'),
  ('case-western-reserve-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Case Western Reserve University''s admissions pages.'),
  ('case-western-reserve-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 700–760; math 730–780 (Scorecard 2023)', null, 'us-scorecard-case-western-reserve-university', null, null),
  ('case-western-reserve-university', 'act'::public.requirement_kind, 'Middle-50% ACT 32–34 (Scorecard 2023)', null, 'us-scorecard-case-western-reserve-university', null, null),
  ('case-western-reserve-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Case Western Reserve University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #61: Wesleyan University (UNITID 130697)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-wesleyan-university', 'College Scorecard — Wesleyan University', 'https://collegescorecard.ed.gov/school/?130697-wesleyan_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('wesleyan-university', 'Wesleyan University', 'Middletown, Connecticut', 'United States', '🇺🇸', 'Private four-year institution in Middletown, Connecticut.',
  'Wesleyan University. College Scorecard (2023) reports out-of-state tuition $70,342 / year and a middle-50% SAT range Middle-50% SAT critical reading 705–760; math 710–780 (Scorecard 2023).', 'wesleyan-university', array[]::text[], 'us-scorecard-wesleyan-university', 61, 'us-4prep-ranking-scorecard-2023', 130697)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('wesleyan-university', 'tuition'::public.university_fact_kind, '$70,342 / year (Scorecard 2023)', 70342, 'USD', 'us-scorecard-wesleyan-university', null, null, 'year'),
  ('wesleyan-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Wesleyan University''s admissions / financial-aid pages.', null),
  ('wesleyan-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Wesleyan University''s admissions pages.', null),
  ('wesleyan-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Wesleyan University''s admissions pages.', null),
  ('wesleyan-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Wesleyan University''s financial-aid pages.', null),
  ('wesleyan-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Wesleyan University''s admissions pages.', null),
  ('wesleyan-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Wesleyan University''s admissions pages.', null),
  ('wesleyan-university', 'room_board'::public.university_fact_kind, '$19,872 / year (Scorecard 2023)', 19872, 'USD', 'us-scorecard-wesleyan-university', null, null, 'year'),
  ('wesleyan-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Wesleyan University''s financial-aid pages.', null),
  ('wesleyan-university', 'total_cost_of_attendance'::public.university_fact_kind, '$89,020 / year (Scorecard 2023)', 89020, 'USD', 'us-scorecard-wesleyan-university', null, null, 'year'),
  ('wesleyan-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Wesleyan University''s international admissions / financial-aid pages.', null),
  ('wesleyan-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 705–760; math 710–780 (Scorecard 2023); Middle-50% ACT 33–35 (Scorecard 2023)', null, null, 'us-scorecard-wesleyan-university', null, null, null),
  ('wesleyan-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Wesleyan University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('wesleyan-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Wesleyan University''s admissions pages.'),
  ('wesleyan-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Wesleyan University''s admissions pages.'),
  ('wesleyan-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Wesleyan University''s admissions pages.'),
  ('wesleyan-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 705–760; math 710–780 (Scorecard 2023)', null, 'us-scorecard-wesleyan-university', null, null),
  ('wesleyan-university', 'act'::public.requirement_kind, 'Middle-50% ACT 33–35 (Scorecard 2023)', null, 'us-scorecard-wesleyan-university', null, null),
  ('wesleyan-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Wesleyan University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #62: University of California-San Diego (UNITID 110680)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-california-san-diego', 'College Scorecard — University of California-San Diego', 'https://collegescorecard.ed.gov/school/?110680-university_of_california_san_diego', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-california-san-diego', 'University of California-San Diego', 'La Jolla, California', 'United States', '🇺🇸', 'Public four-year institution in La Jolla, California.',
  'University of California-San Diego. College Scorecard (2023) reports out-of-state tuition $50,958 / year and a middle-50% SAT range not reported.', 'university-of-california-san-diego', array[]::text[], 'us-scorecard-university-of-california-san-diego', 62, 'us-4prep-ranking-scorecard-2023', 110680)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-california-san-diego', 'tuition'::public.university_fact_kind, '$50,958 / year (Scorecard 2023)', 50958, 'USD', 'us-scorecard-university-of-california-san-diego', null, null, 'year'),
  ('university-of-california-san-diego', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of California-San Diego''s admissions / financial-aid pages.', null),
  ('university-of-california-san-diego', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of California-San Diego''s admissions pages.', null),
  ('university-of-california-san-diego', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of California-San Diego''s admissions pages.', null),
  ('university-of-california-san-diego', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of California-San Diego''s financial-aid pages.', null),
  ('university-of-california-san-diego', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of California-San Diego''s admissions pages.', null),
  ('university-of-california-san-diego', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of California-San Diego''s admissions pages.', null),
  ('university-of-california-san-diego', 'room_board'::public.university_fact_kind, '$18,970 / year (Scorecard 2023)', 18970, 'USD', 'us-scorecard-university-of-california-san-diego', null, null, 'year'),
  ('university-of-california-san-diego', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of California-San Diego''s financial-aid pages.', null),
  ('university-of-california-san-diego', 'total_cost_of_attendance'::public.university_fact_kind, '$38,701 / year (Scorecard 2023)', 38701, 'USD', 'us-scorecard-university-of-california-san-diego', null, null, 'year'),
  ('university-of-california-san-diego', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of California-San Diego''s international admissions / financial-aid pages.', null),
  ('university-of-california-san-diego', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check University of California-San Diego''s admissions pages.', null),
  ('university-of-california-san-diego', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of California-San Diego''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-california-san-diego', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of California-San Diego''s admissions pages.'),
  ('university-of-california-san-diego', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of California-San Diego''s admissions pages.'),
  ('university-of-california-san-diego', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of California-San Diego''s admissions pages.'),
  ('university-of-california-san-diego', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check University of California-San Diego''s admissions pages.'),
  ('university-of-california-san-diego', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check University of California-San Diego''s admissions pages.'),
  ('university-of-california-san-diego', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of California-San Diego''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #63: Wake Forest University (UNITID 199847)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-wake-forest-university', 'College Scorecard — Wake Forest University', 'https://collegescorecard.ed.gov/school/?199847-wake_forest_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('wake-forest-university', 'Wake Forest University', 'Winston-Salem, North Carolina', 'United States', '🇺🇸', 'Private four-year institution in Winston-Salem, North Carolina.',
  'Wake Forest University. College Scorecard (2023) reports out-of-state tuition $67,642 / year and a middle-50% SAT range Middle-50% SAT critical reading 700–750; math 710–770 (Scorecard 2023).', 'wake-forest-university', array[]::text[], 'us-scorecard-wake-forest-university', 63, 'us-4prep-ranking-scorecard-2023', 199847)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('wake-forest-university', 'tuition'::public.university_fact_kind, '$67,642 / year (Scorecard 2023)', 67642, 'USD', 'us-scorecard-wake-forest-university', null, null, 'year'),
  ('wake-forest-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Wake Forest University''s admissions / financial-aid pages.', null),
  ('wake-forest-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Wake Forest University''s admissions pages.', null),
  ('wake-forest-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Wake Forest University''s admissions pages.', null),
  ('wake-forest-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Wake Forest University''s financial-aid pages.', null),
  ('wake-forest-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Wake Forest University''s admissions pages.', null),
  ('wake-forest-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Wake Forest University''s admissions pages.', null),
  ('wake-forest-university', 'room_board'::public.university_fact_kind, '$18,494 / year (Scorecard 2023)', 18494, 'USD', 'us-scorecard-wake-forest-university', null, null, 'year'),
  ('wake-forest-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Wake Forest University''s financial-aid pages.', null),
  ('wake-forest-university', 'total_cost_of_attendance'::public.university_fact_kind, '$87,499 / year (Scorecard 2023)', 87499, 'USD', 'us-scorecard-wake-forest-university', null, null, 'year'),
  ('wake-forest-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Wake Forest University''s international admissions / financial-aid pages.', null),
  ('wake-forest-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 700–750; math 710–770 (Scorecard 2023); Middle-50% ACT 32–34 (Scorecard 2023)', null, null, 'us-scorecard-wake-forest-university', null, null, null),
  ('wake-forest-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Wake Forest University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('wake-forest-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Wake Forest University''s admissions pages.'),
  ('wake-forest-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Wake Forest University''s admissions pages.'),
  ('wake-forest-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Wake Forest University''s admissions pages.'),
  ('wake-forest-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 700–750; math 710–770 (Scorecard 2023)', null, 'us-scorecard-wake-forest-university', null, null),
  ('wake-forest-university', 'act'::public.requirement_kind, 'Middle-50% ACT 32–34 (Scorecard 2023)', null, 'us-scorecard-wake-forest-university', null, null),
  ('wake-forest-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Wake Forest University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #64: California Polytechnic State University-San Luis Obispo (UNITID 110422)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-california-polytechnic-state-university-san-luis-obispo', 'College Scorecard — California Polytechnic State University-San Luis Obispo', 'https://collegescorecard.ed.gov/school/?110422-california_polytechnic_state_university_san_luis_obispo', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('california-polytechnic-state-university-san-luis-obispo', 'California Polytechnic State University-San Luis Obispo', 'San Luis Obispo, California', 'United States', '🇺🇸', 'Public four-year institution in San Luis Obispo, California.',
  'California Polytechnic State University-San Luis Obispo. College Scorecard (2023) reports out-of-state tuition $34,665 / year and a middle-50% SAT range not reported.', 'california-polytechnic-state-university-san-luis-obispo', array[]::text[], 'us-scorecard-california-polytechnic-state-university-san-luis-obispo', 64, 'us-4prep-ranking-scorecard-2023', 110422)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('california-polytechnic-state-university-san-luis-obispo', 'tuition'::public.university_fact_kind, '$34,665 / year (Scorecard 2023)', 34665, 'USD', 'us-scorecard-california-polytechnic-state-university-san-luis-obispo', null, null, 'year'),
  ('california-polytechnic-state-university-san-luis-obispo', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check California Polytechnic State University-San Luis Obispo''s admissions / financial-aid pages.', null),
  ('california-polytechnic-state-university-san-luis-obispo', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check California Polytechnic State University-San Luis Obispo''s admissions pages.', null),
  ('california-polytechnic-state-university-san-luis-obispo', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check California Polytechnic State University-San Luis Obispo''s admissions pages.', null),
  ('california-polytechnic-state-university-san-luis-obispo', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check California Polytechnic State University-San Luis Obispo''s financial-aid pages.', null),
  ('california-polytechnic-state-university-san-luis-obispo', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check California Polytechnic State University-San Luis Obispo''s admissions pages.', null),
  ('california-polytechnic-state-university-san-luis-obispo', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check California Polytechnic State University-San Luis Obispo''s admissions pages.', null),
  ('california-polytechnic-state-university-san-luis-obispo', 'room_board'::public.university_fact_kind, '$18,792 / year (Scorecard 2023)', 18792, 'USD', 'us-scorecard-california-polytechnic-state-university-san-luis-obispo', null, null, 'year'),
  ('california-polytechnic-state-university-san-luis-obispo', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check California Polytechnic State University-San Luis Obispo''s financial-aid pages.', null),
  ('california-polytechnic-state-university-san-luis-obispo', 'total_cost_of_attendance'::public.university_fact_kind, '$32,265 / year (Scorecard 2023)', 32265, 'USD', 'us-scorecard-california-polytechnic-state-university-san-luis-obispo', null, null, 'year'),
  ('california-polytechnic-state-university-san-luis-obispo', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check California Polytechnic State University-San Luis Obispo''s international admissions / financial-aid pages.', null),
  ('california-polytechnic-state-university-san-luis-obispo', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check California Polytechnic State University-San Luis Obispo''s admissions pages.', null),
  ('california-polytechnic-state-university-san-luis-obispo', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask California Polytechnic State University-San Luis Obispo''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('california-polytechnic-state-university-san-luis-obispo', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check California Polytechnic State University-San Luis Obispo''s admissions pages.'),
  ('california-polytechnic-state-university-san-luis-obispo', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check California Polytechnic State University-San Luis Obispo''s admissions pages.'),
  ('california-polytechnic-state-university-san-luis-obispo', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check California Polytechnic State University-San Luis Obispo''s admissions pages.'),
  ('california-polytechnic-state-university-san-luis-obispo', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check California Polytechnic State University-San Luis Obispo''s admissions pages.'),
  ('california-polytechnic-state-university-san-luis-obispo', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check California Polytechnic State University-San Luis Obispo''s admissions pages.'),
  ('california-polytechnic-state-university-san-luis-obispo', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check California Polytechnic State University-San Luis Obispo''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #65: Bucknell University (UNITID 211291)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-bucknell-university', 'College Scorecard — Bucknell University', 'https://collegescorecard.ed.gov/school/?211291-bucknell_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('bucknell-university', 'Bucknell University', 'Lewisburg, Pennsylvania', 'United States', '🇺🇸', 'Private four-year institution in Lewisburg, Pennsylvania.',
  'Bucknell University. College Scorecard (2023) reports out-of-state tuition $67,812 / year and a middle-50% SAT range Middle-50% SAT critical reading 650–730; math 660–740 (Scorecard 2023).', 'bucknell-university', array[]::text[], 'us-scorecard-bucknell-university', 65, 'us-4prep-ranking-scorecard-2023', 211291)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('bucknell-university', 'tuition'::public.university_fact_kind, '$67,812 / year (Scorecard 2023)', 67812, 'USD', 'us-scorecard-bucknell-university', null, null, 'year'),
  ('bucknell-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Bucknell University''s admissions / financial-aid pages.', null),
  ('bucknell-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Bucknell University''s admissions pages.', null),
  ('bucknell-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Bucknell University''s admissions pages.', null),
  ('bucknell-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Bucknell University''s financial-aid pages.', null),
  ('bucknell-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Bucknell University''s admissions pages.', null),
  ('bucknell-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Bucknell University''s admissions pages.', null),
  ('bucknell-university', 'room_board'::public.university_fact_kind, '$16,924 / year (Scorecard 2023)', 16924, 'USD', 'us-scorecard-bucknell-university', null, null, 'year'),
  ('bucknell-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Bucknell University''s financial-aid pages.', null),
  ('bucknell-university', 'total_cost_of_attendance'::public.university_fact_kind, '$83,756 / year (Scorecard 2023)', 83756, 'USD', 'us-scorecard-bucknell-university', null, null, 'year'),
  ('bucknell-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Bucknell University''s international admissions / financial-aid pages.', null),
  ('bucknell-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 650–730; math 660–740 (Scorecard 2023); Middle-50% ACT 30–33 (Scorecard 2023)', null, null, 'us-scorecard-bucknell-university', null, null, null),
  ('bucknell-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Bucknell University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('bucknell-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Bucknell University''s admissions pages.'),
  ('bucknell-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Bucknell University''s admissions pages.'),
  ('bucknell-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Bucknell University''s admissions pages.'),
  ('bucknell-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 650–730; math 660–740 (Scorecard 2023)', null, 'us-scorecard-bucknell-university', null, null),
  ('bucknell-university', 'act'::public.requirement_kind, 'Middle-50% ACT 30–33 (Scorecard 2023)', null, 'us-scorecard-bucknell-university', null, null),
  ('bucknell-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Bucknell University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #66: Gnomon (UNITID 449384)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-gnomon', 'College Scorecard — Gnomon', 'https://collegescorecard.ed.gov/school/?449384-gnomon', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('gnomon', 'Gnomon', 'North Hollywood, California', 'United States', '🇺🇸', 'Private four-year institution in North Hollywood, California.',
  'Gnomon. College Scorecard (2023) reports out-of-state tuition $37,635 / year and a middle-50% SAT range not reported.', 'gnomon', array[]::text[], 'us-scorecard-gnomon', 66, 'us-4prep-ranking-scorecard-2023', 449384)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('gnomon', 'tuition'::public.university_fact_kind, '$37,635 / year (Scorecard 2023)', 37635, 'USD', 'us-scorecard-gnomon', null, null, 'year'),
  ('gnomon', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Gnomon''s admissions / financial-aid pages.', null),
  ('gnomon', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Gnomon''s admissions pages.', null),
  ('gnomon', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Gnomon''s admissions pages.', null),
  ('gnomon', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Gnomon''s financial-aid pages.', null),
  ('gnomon', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Gnomon''s admissions pages.', null),
  ('gnomon', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Gnomon''s admissions pages.', null),
  ('gnomon', 'room_board'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report on-campus room and board.', 'Check Gnomon''s financial-aid pages.', null),
  ('gnomon', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Gnomon''s financial-aid pages.', null),
  ('gnomon', 'total_cost_of_attendance'::public.university_fact_kind, '$54,947 / year (Scorecard 2023)', 54947, 'USD', 'us-scorecard-gnomon', null, null, 'year'),
  ('gnomon', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Gnomon''s international admissions / financial-aid pages.', null),
  ('gnomon', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check Gnomon''s admissions pages.', null),
  ('gnomon', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Gnomon''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('gnomon', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Gnomon''s admissions pages.'),
  ('gnomon', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Gnomon''s admissions pages.'),
  ('gnomon', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Gnomon''s admissions pages.'),
  ('gnomon', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check Gnomon''s admissions pages.'),
  ('gnomon', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check Gnomon''s admissions pages.'),
  ('gnomon', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Gnomon''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #67: Lafayette College (UNITID 213385)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-lafayette-college', 'College Scorecard — Lafayette College', 'https://collegescorecard.ed.gov/school/?213385-lafayette_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('lafayette-college', 'Lafayette College', 'Easton, Pennsylvania', 'United States', '🇺🇸', 'Private four-year institution in Easton, Pennsylvania.',
  'Lafayette College. College Scorecard (2023) reports out-of-state tuition $65,398 / year and a middle-50% SAT range Middle-50% SAT critical reading 670–740; math 680–760 (Scorecard 2023).', 'lafayette-college', array[]::text[], 'us-scorecard-lafayette-college', 67, 'us-4prep-ranking-scorecard-2023', 213385)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('lafayette-college', 'tuition'::public.university_fact_kind, '$65,398 / year (Scorecard 2023)', 65398, 'USD', 'us-scorecard-lafayette-college', null, null, 'year'),
  ('lafayette-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Lafayette College''s admissions / financial-aid pages.', null),
  ('lafayette-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Lafayette College''s admissions pages.', null),
  ('lafayette-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Lafayette College''s admissions pages.', null),
  ('lafayette-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Lafayette College''s financial-aid pages.', null),
  ('lafayette-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Lafayette College''s admissions pages.', null),
  ('lafayette-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Lafayette College''s admissions pages.', null),
  ('lafayette-college', 'room_board'::public.university_fact_kind, '$19,866 / year (Scorecard 2023)', 19866, 'USD', 'us-scorecard-lafayette-college', null, null, 'year'),
  ('lafayette-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Lafayette College''s financial-aid pages.', null),
  ('lafayette-college', 'total_cost_of_attendance'::public.university_fact_kind, '$83,133 / year (Scorecard 2023)', 83133, 'USD', 'us-scorecard-lafayette-college', null, null, 'year'),
  ('lafayette-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Lafayette College''s international admissions / financial-aid pages.', null),
  ('lafayette-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 670–740; math 680–760 (Scorecard 2023); Middle-50% ACT 31–33 (Scorecard 2023)', null, null, 'us-scorecard-lafayette-college', null, null, null),
  ('lafayette-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Lafayette College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('lafayette-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Lafayette College''s admissions pages.'),
  ('lafayette-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Lafayette College''s admissions pages.'),
  ('lafayette-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Lafayette College''s admissions pages.'),
  ('lafayette-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 670–740; math 680–760 (Scorecard 2023)', null, 'us-scorecard-lafayette-college', null, null),
  ('lafayette-college', 'act'::public.requirement_kind, 'Middle-50% ACT 31–33 (Scorecard 2023)', null, 'us-scorecard-lafayette-college', null, null),
  ('lafayette-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Lafayette College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #68: Baptist Missionary Association Theological Seminary (UNITID 223117)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-baptist-missionary-association-theological-seminary', 'College Scorecard — Baptist Missionary Association Theological Seminary', 'https://collegescorecard.ed.gov/school/?223117-baptist_missionary_association_theological_seminary', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('baptist-missionary-association-theological-seminary', 'Baptist Missionary Association Theological Seminary', 'Jacksonville, Texas', 'United States', '🇺🇸', 'Private four-year institution in Jacksonville, Texas.',
  'Baptist Missionary Association Theological Seminary. College Scorecard (2023) reports out-of-state tuition $10,050 / year and a middle-50% SAT range not reported.', 'baptist-missionary-association-theological-seminary', array[]::text[], 'us-scorecard-baptist-missionary-association-theological-seminary', 68, 'us-4prep-ranking-scorecard-2023', 223117)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('baptist-missionary-association-theological-seminary', 'tuition'::public.university_fact_kind, '$10,050 / year (Scorecard 2023)', 10050, 'USD', 'us-scorecard-baptist-missionary-association-theological-seminary', null, null, 'year'),
  ('baptist-missionary-association-theological-seminary', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Baptist Missionary Association Theological Seminary''s admissions / financial-aid pages.', null),
  ('baptist-missionary-association-theological-seminary', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Baptist Missionary Association Theological Seminary''s admissions pages.', null),
  ('baptist-missionary-association-theological-seminary', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Baptist Missionary Association Theological Seminary''s admissions pages.', null),
  ('baptist-missionary-association-theological-seminary', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Baptist Missionary Association Theological Seminary''s financial-aid pages.', null),
  ('baptist-missionary-association-theological-seminary', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Baptist Missionary Association Theological Seminary''s admissions pages.', null),
  ('baptist-missionary-association-theological-seminary', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Baptist Missionary Association Theological Seminary''s admissions pages.', null),
  ('baptist-missionary-association-theological-seminary', 'room_board'::public.university_fact_kind, '$9,000 / year (Scorecard 2023)', 9000, 'USD', 'us-scorecard-baptist-missionary-association-theological-seminary', null, null, 'year'),
  ('baptist-missionary-association-theological-seminary', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Baptist Missionary Association Theological Seminary''s financial-aid pages.', null),
  ('baptist-missionary-association-theological-seminary', 'total_cost_of_attendance'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report academic-year cost of attendance.', 'Check Baptist Missionary Association Theological Seminary''s financial-aid pages.', null),
  ('baptist-missionary-association-theological-seminary', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Baptist Missionary Association Theological Seminary''s international admissions / financial-aid pages.', null),
  ('baptist-missionary-association-theological-seminary', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check Baptist Missionary Association Theological Seminary''s admissions pages.', null),
  ('baptist-missionary-association-theological-seminary', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Baptist Missionary Association Theological Seminary''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('baptist-missionary-association-theological-seminary', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Baptist Missionary Association Theological Seminary''s admissions pages.'),
  ('baptist-missionary-association-theological-seminary', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Baptist Missionary Association Theological Seminary''s admissions pages.'),
  ('baptist-missionary-association-theological-seminary', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Baptist Missionary Association Theological Seminary''s admissions pages.'),
  ('baptist-missionary-association-theological-seminary', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check Baptist Missionary Association Theological Seminary''s admissions pages.'),
  ('baptist-missionary-association-theological-seminary', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check Baptist Missionary Association Theological Seminary''s admissions pages.'),
  ('baptist-missionary-association-theological-seminary', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Baptist Missionary Association Theological Seminary''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #69: Hillsdale College (UNITID 170286)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-hillsdale-college', 'College Scorecard — Hillsdale College', 'https://collegescorecard.ed.gov/school/?170286-hillsdale_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('hillsdale-college', 'Hillsdale College', 'Hillsdale, Michigan', 'United States', '🇺🇸', 'Private four-year institution in Hillsdale, Michigan.',
  'Hillsdale College. College Scorecard (2023) reports out-of-state tuition $33,189 / year and a middle-50% SAT range Middle-50% SAT critical reading 680–750; math 640–740 (Scorecard 2023).', 'hillsdale-college', array[]::text[], 'us-scorecard-hillsdale-college', 69, 'us-4prep-ranking-scorecard-2023', 170286)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('hillsdale-college', 'tuition'::public.university_fact_kind, '$33,189 / year (Scorecard 2023)', 33189, 'USD', 'us-scorecard-hillsdale-college', null, null, 'year'),
  ('hillsdale-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Hillsdale College''s admissions / financial-aid pages.', null),
  ('hillsdale-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Hillsdale College''s admissions pages.', null),
  ('hillsdale-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Hillsdale College''s admissions pages.', null),
  ('hillsdale-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Hillsdale College''s financial-aid pages.', null),
  ('hillsdale-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Hillsdale College''s admissions pages.', null),
  ('hillsdale-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Hillsdale College''s admissions pages.', null),
  ('hillsdale-college', 'room_board'::public.university_fact_kind, '$13,600 / year (Scorecard 2023)', 13600, 'USD', 'us-scorecard-hillsdale-college', null, null, 'year'),
  ('hillsdale-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Hillsdale College''s financial-aid pages.', null),
  ('hillsdale-college', 'total_cost_of_attendance'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report academic-year cost of attendance.', 'Check Hillsdale College''s financial-aid pages.', null),
  ('hillsdale-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Hillsdale College''s international admissions / financial-aid pages.', null),
  ('hillsdale-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 680–750; math 640–740 (Scorecard 2023); Middle-50% ACT 30–33 (Scorecard 2023)', null, null, 'us-scorecard-hillsdale-college', null, null, null),
  ('hillsdale-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Hillsdale College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('hillsdale-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Hillsdale College''s admissions pages.'),
  ('hillsdale-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Hillsdale College''s admissions pages.'),
  ('hillsdale-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Hillsdale College''s admissions pages.'),
  ('hillsdale-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 680–750; math 640–740 (Scorecard 2023)', null, 'us-scorecard-hillsdale-college', null, null),
  ('hillsdale-college', 'act'::public.requirement_kind, 'Middle-50% ACT 30–33 (Scorecard 2023)', null, 'us-scorecard-hillsdale-college', null, null),
  ('hillsdale-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Hillsdale College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #70: University of Richmond (UNITID 233374)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-richmond', 'College Scorecard — University of Richmond', 'https://collegescorecard.ed.gov/school/?233374-university_of_richmond', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-richmond', 'University of Richmond', 'University of Richmond, Virginia', 'United States', '🇺🇸', 'Private four-year institution in University of Richmond, Virginia.',
  'University of Richmond. College Scorecard (2023) reports out-of-state tuition $65,230 / year and a middle-50% SAT range Middle-50% SAT critical reading 700–750; math 710–780 (Scorecard 2023).', 'university-of-richmond', array[]::text[], 'us-scorecard-university-of-richmond', 70, 'us-4prep-ranking-scorecard-2023', 233374)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-richmond', 'tuition'::public.university_fact_kind, '$65,230 / year (Scorecard 2023)', 65230, 'USD', 'us-scorecard-university-of-richmond', null, null, 'year'),
  ('university-of-richmond', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of Richmond''s admissions / financial-aid pages.', null),
  ('university-of-richmond', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of Richmond''s admissions pages.', null),
  ('university-of-richmond', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of Richmond''s admissions pages.', null),
  ('university-of-richmond', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of Richmond''s financial-aid pages.', null),
  ('university-of-richmond', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of Richmond''s admissions pages.', null),
  ('university-of-richmond', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of Richmond''s admissions pages.', null),
  ('university-of-richmond', 'room_board'::public.university_fact_kind, '$17,140 / year (Scorecard 2023)', 17140, 'USD', 'us-scorecard-university-of-richmond', null, null, 'year'),
  ('university-of-richmond', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of Richmond''s financial-aid pages.', null),
  ('university-of-richmond', 'total_cost_of_attendance'::public.university_fact_kind, '$80,961 / year (Scorecard 2023)', 80961, 'USD', 'us-scorecard-university-of-richmond', null, null, 'year'),
  ('university-of-richmond', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of Richmond''s international admissions / financial-aid pages.', null),
  ('university-of-richmond', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 700–750; math 710–780 (Scorecard 2023); Middle-50% ACT 33–35 (Scorecard 2023)', null, null, 'us-scorecard-university-of-richmond', null, null, null),
  ('university-of-richmond', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of Richmond''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-richmond', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of Richmond''s admissions pages.'),
  ('university-of-richmond', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of Richmond''s admissions pages.'),
  ('university-of-richmond', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of Richmond''s admissions pages.'),
  ('university-of-richmond', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 700–750; math 710–780 (Scorecard 2023)', null, 'us-scorecard-university-of-richmond', null, null),
  ('university-of-richmond', 'act'::public.requirement_kind, 'Middle-50% ACT 33–35 (Scorecard 2023)', null, 'us-scorecard-university-of-richmond', null, null),
  ('university-of-richmond', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of Richmond''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #71: University of California-Irvine (UNITID 110653)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-california-irvine', 'College Scorecard — University of California-Irvine', 'https://collegescorecard.ed.gov/school/?110653-university_of_california_irvine', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-california-irvine', 'University of California-Irvine', 'Irvine, California', 'United States', '🇺🇸', 'Public four-year institution in Irvine, California.',
  'University of California-Irvine. College Scorecard (2023) reports out-of-state tuition $49,922 / year and a middle-50% SAT range not reported.', 'university-of-california-irvine', array[]::text[], 'us-scorecard-university-of-california-irvine', 71, 'us-4prep-ranking-scorecard-2023', 110653)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-california-irvine', 'tuition'::public.university_fact_kind, '$49,922 / year (Scorecard 2023)', 49922, 'USD', 'us-scorecard-university-of-california-irvine', null, null, 'year'),
  ('university-of-california-irvine', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of California-Irvine''s admissions / financial-aid pages.', null),
  ('university-of-california-irvine', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of California-Irvine''s admissions pages.', null),
  ('university-of-california-irvine', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of California-Irvine''s admissions pages.', null),
  ('university-of-california-irvine', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of California-Irvine''s financial-aid pages.', null),
  ('university-of-california-irvine', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of California-Irvine''s admissions pages.', null),
  ('university-of-california-irvine', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of California-Irvine''s admissions pages.', null),
  ('university-of-california-irvine', 'room_board'::public.university_fact_kind, '$18,991 / year (Scorecard 2023)', 18991, 'USD', 'us-scorecard-university-of-california-irvine', null, null, 'year'),
  ('university-of-california-irvine', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of California-Irvine''s financial-aid pages.', null),
  ('university-of-california-irvine', 'total_cost_of_attendance'::public.university_fact_kind, '$38,632 / year (Scorecard 2023)', 38632, 'USD', 'us-scorecard-university-of-california-irvine', null, null, 'year'),
  ('university-of-california-irvine', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of California-Irvine''s international admissions / financial-aid pages.', null),
  ('university-of-california-irvine', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check University of California-Irvine''s admissions pages.', null),
  ('university-of-california-irvine', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of California-Irvine''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-california-irvine', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of California-Irvine''s admissions pages.'),
  ('university-of-california-irvine', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of California-Irvine''s admissions pages.'),
  ('university-of-california-irvine', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of California-Irvine''s admissions pages.'),
  ('university-of-california-irvine', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check University of California-Irvine''s admissions pages.'),
  ('university-of-california-irvine', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check University of California-Irvine''s admissions pages.'),
  ('university-of-california-irvine', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of California-Irvine''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #72: College of the Holy Cross (UNITID 166124)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-college-of-the-holy-cross', 'College Scorecard — College of the Holy Cross', 'https://collegescorecard.ed.gov/school/?166124-college_of_the_holy_cross', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('college-of-the-holy-cross', 'College of the Holy Cross', 'Worcester, Massachusetts', 'United States', '🇺🇸', 'Private four-year institution in Worcester, Massachusetts.',
  'College of the Holy Cross. College Scorecard (2023) reports out-of-state tuition $64,500 / year and a middle-50% SAT range Middle-50% SAT critical reading 630–710; math 610–700 (Scorecard 2023).', 'college-of-the-holy-cross', array[]::text[], 'us-scorecard-college-of-the-holy-cross', 72, 'us-4prep-ranking-scorecard-2023', 166124)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('college-of-the-holy-cross', 'tuition'::public.university_fact_kind, '$64,500 / year (Scorecard 2023)', 64500, 'USD', 'us-scorecard-college-of-the-holy-cross', null, null, 'year'),
  ('college-of-the-holy-cross', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check College of the Holy Cross''s admissions / financial-aid pages.', null),
  ('college-of-the-holy-cross', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check College of the Holy Cross''s admissions pages.', null),
  ('college-of-the-holy-cross', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check College of the Holy Cross''s admissions pages.', null),
  ('college-of-the-holy-cross', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check College of the Holy Cross''s financial-aid pages.', null),
  ('college-of-the-holy-cross', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check College of the Holy Cross''s admissions pages.', null),
  ('college-of-the-holy-cross', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check College of the Holy Cross''s admissions pages.', null),
  ('college-of-the-holy-cross', 'room_board'::public.university_fact_kind, '$18,820 / year (Scorecard 2023)', 18820, 'USD', 'us-scorecard-college-of-the-holy-cross', null, null, 'year'),
  ('college-of-the-holy-cross', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check College of the Holy Cross''s financial-aid pages.', null),
  ('college-of-the-holy-cross', 'total_cost_of_attendance'::public.university_fact_kind, '$80,334 / year (Scorecard 2023)', 80334, 'USD', 'us-scorecard-college-of-the-holy-cross', null, null, 'year'),
  ('college-of-the-holy-cross', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check College of the Holy Cross''s international admissions / financial-aid pages.', null),
  ('college-of-the-holy-cross', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 630–710; math 610–700 (Scorecard 2023); Middle-50% ACT 27–32 (Scorecard 2023)', null, null, 'us-scorecard-college-of-the-holy-cross', null, null, null),
  ('college-of-the-holy-cross', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask College of the Holy Cross''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('college-of-the-holy-cross', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check College of the Holy Cross''s admissions pages.'),
  ('college-of-the-holy-cross', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check College of the Holy Cross''s admissions pages.'),
  ('college-of-the-holy-cross', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check College of the Holy Cross''s admissions pages.'),
  ('college-of-the-holy-cross', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 630–710; math 610–700 (Scorecard 2023)', null, 'us-scorecard-college-of-the-holy-cross', null, null),
  ('college-of-the-holy-cross', 'act'::public.requirement_kind, 'Middle-50% ACT 27–32 (Scorecard 2023)', null, 'us-scorecard-college-of-the-holy-cross', null, null),
  ('college-of-the-holy-cross', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check College of the Holy Cross''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #73: Vassar College (UNITID 197133)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-vassar-college', 'College Scorecard — Vassar College', 'https://collegescorecard.ed.gov/school/?197133-vassar_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('vassar-college', 'Vassar College', 'Poughkeepsie, New York', 'United States', '🇺🇸', 'Private four-year institution in Poughkeepsie, New York.',
  'Vassar College. College Scorecard (2023) reports out-of-state tuition $71,030 / year and a middle-50% SAT range Middle-50% SAT critical reading 730–770; math 720–780 (Scorecard 2023).', 'vassar-college', array[]::text[], 'us-scorecard-vassar-college', 73, 'us-4prep-ranking-scorecard-2023', 197133)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('vassar-college', 'tuition'::public.university_fact_kind, '$71,030 / year (Scorecard 2023)', 71030, 'USD', 'us-scorecard-vassar-college', null, null, 'year'),
  ('vassar-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Vassar College''s admissions / financial-aid pages.', null),
  ('vassar-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Vassar College''s admissions pages.', null),
  ('vassar-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Vassar College''s admissions pages.', null),
  ('vassar-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Vassar College''s financial-aid pages.', null),
  ('vassar-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Vassar College''s admissions pages.', null),
  ('vassar-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Vassar College''s admissions pages.', null),
  ('vassar-college', 'room_board'::public.university_fact_kind, '$18,240 / year (Scorecard 2023)', 18240, 'USD', 'us-scorecard-vassar-college', null, null, 'year'),
  ('vassar-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Vassar College''s financial-aid pages.', null),
  ('vassar-college', 'total_cost_of_attendance'::public.university_fact_kind, '$87,419 / year (Scorecard 2023)', 87419, 'USD', 'us-scorecard-vassar-college', null, null, 'year'),
  ('vassar-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Vassar College''s international admissions / financial-aid pages.', null),
  ('vassar-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 730–770; math 720–780 (Scorecard 2023); Middle-50% ACT 33–35 (Scorecard 2023)', null, null, 'us-scorecard-vassar-college', null, null, null),
  ('vassar-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Vassar College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('vassar-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Vassar College''s admissions pages.'),
  ('vassar-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Vassar College''s admissions pages.'),
  ('vassar-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Vassar College''s admissions pages.'),
  ('vassar-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 730–770; math 720–780 (Scorecard 2023)', null, 'us-scorecard-vassar-college', null, null),
  ('vassar-college', 'act'::public.requirement_kind, 'Middle-50% ACT 33–35 (Scorecard 2023)', null, 'us-scorecard-vassar-college', null, null),
  ('vassar-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Vassar College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #74: Jewish Theological Seminary of America (UNITID 192040)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-jewish-theological-seminary-of-america', 'College Scorecard — Jewish Theological Seminary of America', 'https://collegescorecard.ed.gov/school/?192040-jewish_theological_seminary_of_america', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('jewish-theological-seminary-of-america', 'Jewish Theological Seminary of America', 'New York, New York', 'United States', '🇺🇸', 'Private four-year institution in New York, New York.',
  'Jewish Theological Seminary of America. College Scorecard (2023) reports out-of-state tuition $67,357 / year and a middle-50% SAT range Middle-50% SAT critical reading 720–790; math 720–790 (Scorecard 2023).', 'jewish-theological-seminary-of-america', array[]::text[], 'us-scorecard-jewish-theological-seminary-of-america', 74, 'us-4prep-ranking-scorecard-2023', 192040)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('jewish-theological-seminary-of-america', 'tuition'::public.university_fact_kind, '$67,357 / year (Scorecard 2023)', 67357, 'USD', 'us-scorecard-jewish-theological-seminary-of-america', null, null, 'year'),
  ('jewish-theological-seminary-of-america', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Jewish Theological Seminary of America''s admissions / financial-aid pages.', null),
  ('jewish-theological-seminary-of-america', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Jewish Theological Seminary of America''s admissions pages.', null),
  ('jewish-theological-seminary-of-america', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Jewish Theological Seminary of America''s admissions pages.', null),
  ('jewish-theological-seminary-of-america', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Jewish Theological Seminary of America''s financial-aid pages.', null),
  ('jewish-theological-seminary-of-america', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Jewish Theological Seminary of America''s admissions pages.', null),
  ('jewish-theological-seminary-of-america', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Jewish Theological Seminary of America''s admissions pages.', null),
  ('jewish-theological-seminary-of-america', 'room_board'::public.university_fact_kind, '$18,608 / year (Scorecard 2023)', 18608, 'USD', 'us-scorecard-jewish-theological-seminary-of-america', null, null, 'year'),
  ('jewish-theological-seminary-of-america', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Jewish Theological Seminary of America''s financial-aid pages.', null),
  ('jewish-theological-seminary-of-america', 'total_cost_of_attendance'::public.university_fact_kind, '$85,945 / year (Scorecard 2023)', 85945, 'USD', 'us-scorecard-jewish-theological-seminary-of-america', null, null, 'year'),
  ('jewish-theological-seminary-of-america', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Jewish Theological Seminary of America''s international admissions / financial-aid pages.', null),
  ('jewish-theological-seminary-of-america', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 720–790; math 720–790 (Scorecard 2023)', null, null, 'us-scorecard-jewish-theological-seminary-of-america', null, null, null),
  ('jewish-theological-seminary-of-america', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Jewish Theological Seminary of America''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('jewish-theological-seminary-of-america', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Jewish Theological Seminary of America''s admissions pages.'),
  ('jewish-theological-seminary-of-america', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Jewish Theological Seminary of America''s admissions pages.'),
  ('jewish-theological-seminary-of-america', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Jewish Theological Seminary of America''s admissions pages.'),
  ('jewish-theological-seminary-of-america', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 720–790; math 720–790 (Scorecard 2023)', null, 'us-scorecard-jewish-theological-seminary-of-america', null, null),
  ('jewish-theological-seminary-of-america', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check Jewish Theological Seminary of America''s admissions pages.'),
  ('jewish-theological-seminary-of-america', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Jewish Theological Seminary of America''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #75: University of North Carolina at Chapel Hill (UNITID 199120)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-north-carolina-at-chapel-hill', 'College Scorecard — University of North Carolina at Chapel Hill', 'https://collegescorecard.ed.gov/school/?199120-university_of_north_carolina_at_chapel_hill', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-north-carolina-at-chapel-hill', 'University of North Carolina at Chapel Hill', 'Chapel Hill, North Carolina', 'United States', '🇺🇸', 'Public four-year institution in Chapel Hill, North Carolina.',
  'University of North Carolina at Chapel Hill. College Scorecard (2023) reports out-of-state tuition $41,203 / year and a middle-50% SAT range Middle-50% SAT critical reading 690–750; math 700–780 (Scorecard 2023).', 'university-of-north-carolina-at-chapel-hill', array[]::text[], 'us-scorecard-university-of-north-carolina-at-chapel-hill', 75, 'us-4prep-ranking-scorecard-2023', 199120)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-north-carolina-at-chapel-hill', 'tuition'::public.university_fact_kind, '$41,203 / year (Scorecard 2023)', 41203, 'USD', 'us-scorecard-university-of-north-carolina-at-chapel-hill', null, null, 'year'),
  ('university-of-north-carolina-at-chapel-hill', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of North Carolina at Chapel Hill''s admissions / financial-aid pages.', null),
  ('university-of-north-carolina-at-chapel-hill', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of North Carolina at Chapel Hill''s admissions pages.', null),
  ('university-of-north-carolina-at-chapel-hill', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of North Carolina at Chapel Hill''s admissions pages.', null),
  ('university-of-north-carolina-at-chapel-hill', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of North Carolina at Chapel Hill''s financial-aid pages.', null),
  ('university-of-north-carolina-at-chapel-hill', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of North Carolina at Chapel Hill''s admissions pages.', null),
  ('university-of-north-carolina-at-chapel-hill', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of North Carolina at Chapel Hill''s admissions pages.', null),
  ('university-of-north-carolina-at-chapel-hill', 'room_board'::public.university_fact_kind, '$13,804 / year (Scorecard 2023)', 13804, 'USD', 'us-scorecard-university-of-north-carolina-at-chapel-hill', null, null, 'year'),
  ('university-of-north-carolina-at-chapel-hill', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of North Carolina at Chapel Hill''s financial-aid pages.', null),
  ('university-of-north-carolina-at-chapel-hill', 'total_cost_of_attendance'::public.university_fact_kind, '$26,055 / year (Scorecard 2023)', 26055, 'USD', 'us-scorecard-university-of-north-carolina-at-chapel-hill', null, null, 'year'),
  ('university-of-north-carolina-at-chapel-hill', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of North Carolina at Chapel Hill''s international admissions / financial-aid pages.', null),
  ('university-of-north-carolina-at-chapel-hill', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 690–750; math 700–780 (Scorecard 2023); Middle-50% ACT 28–34 (Scorecard 2023)', null, null, 'us-scorecard-university-of-north-carolina-at-chapel-hill', null, null, null),
  ('university-of-north-carolina-at-chapel-hill', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of North Carolina at Chapel Hill''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-north-carolina-at-chapel-hill', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of North Carolina at Chapel Hill''s admissions pages.'),
  ('university-of-north-carolina-at-chapel-hill', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of North Carolina at Chapel Hill''s admissions pages.'),
  ('university-of-north-carolina-at-chapel-hill', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of North Carolina at Chapel Hill''s admissions pages.'),
  ('university-of-north-carolina-at-chapel-hill', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 690–750; math 700–780 (Scorecard 2023)', null, 'us-scorecard-university-of-north-carolina-at-chapel-hill', null, null),
  ('university-of-north-carolina-at-chapel-hill', 'act'::public.requirement_kind, 'Middle-50% ACT 28–34 (Scorecard 2023)', null, 'us-scorecard-university-of-north-carolina-at-chapel-hill', null, null),
  ('university-of-north-carolina-at-chapel-hill', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of North Carolina at Chapel Hill''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #76: Trinity College (UNITID 130590)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-trinity-college', 'College Scorecard — Trinity College', 'https://collegescorecard.ed.gov/school/?130590-trinity_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('trinity-college', 'Trinity College', 'Hartford, Connecticut', 'United States', '🇺🇸', 'Private four-year institution in Hartford, Connecticut.',
  'Trinity College. College Scorecard (2023) reports out-of-state tuition $70,770 / year and a middle-50% SAT range Middle-50% SAT critical reading 658–740; math 640–730 (Scorecard 2023).', 'trinity-college', array[]::text[], 'us-scorecard-trinity-college', 76, 'us-4prep-ranking-scorecard-2023', 130590)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('trinity-college', 'tuition'::public.university_fact_kind, '$70,770 / year (Scorecard 2023)', 70770, 'USD', 'us-scorecard-trinity-college', null, null, 'year'),
  ('trinity-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Trinity College''s admissions / financial-aid pages.', null),
  ('trinity-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Trinity College''s admissions pages.', null),
  ('trinity-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Trinity College''s admissions pages.', null),
  ('trinity-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Trinity College''s financial-aid pages.', null),
  ('trinity-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Trinity College''s admissions pages.', null),
  ('trinity-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Trinity College''s admissions pages.', null),
  ('trinity-college', 'room_board'::public.university_fact_kind, '$18,890 / year (Scorecard 2023)', 18890, 'USD', 'us-scorecard-trinity-college', null, null, 'year'),
  ('trinity-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Trinity College''s financial-aid pages.', null),
  ('trinity-college', 'total_cost_of_attendance'::public.university_fact_kind, '$87,840 / year (Scorecard 2023)', 87840, 'USD', 'us-scorecard-trinity-college', null, null, 'year'),
  ('trinity-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Trinity College''s international admissions / financial-aid pages.', null),
  ('trinity-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 658–740; math 640–730 (Scorecard 2023); Middle-50% ACT 30–34 (Scorecard 2023)', null, null, 'us-scorecard-trinity-college', null, null, null),
  ('trinity-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Trinity College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('trinity-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Trinity College''s admissions pages.'),
  ('trinity-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Trinity College''s admissions pages.'),
  ('trinity-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Trinity College''s admissions pages.'),
  ('trinity-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 658–740; math 640–730 (Scorecard 2023)', null, 'us-scorecard-trinity-college', null, null),
  ('trinity-college', 'act'::public.requirement_kind, 'Middle-50% ACT 30–34 (Scorecard 2023)', null, 'us-scorecard-trinity-college', null, null),
  ('trinity-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Trinity College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #77: Stevens Institute of Technology (UNITID 186867)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-stevens-institute-of-technology', 'College Scorecard — Stevens Institute of Technology', 'https://collegescorecard.ed.gov/school/?186867-stevens_institute_of_technology', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('stevens-institute-of-technology', 'Stevens Institute of Technology', 'Hoboken, New Jersey', 'United States', '🇺🇸', 'Private four-year institution in Hoboken, New Jersey.',
  'Stevens Institute of Technology. College Scorecard (2023) reports out-of-state tuition $63,462 / year and a middle-50% SAT range Middle-50% SAT critical reading 670–735; math 710–770 (Scorecard 2023).', 'stevens-institute-of-technology', array[]::text[], 'us-scorecard-stevens-institute-of-technology', 77, 'us-4prep-ranking-scorecard-2023', 186867)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('stevens-institute-of-technology', 'tuition'::public.university_fact_kind, '$63,462 / year (Scorecard 2023)', 63462, 'USD', 'us-scorecard-stevens-institute-of-technology', null, null, 'year'),
  ('stevens-institute-of-technology', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Stevens Institute of Technology''s admissions / financial-aid pages.', null),
  ('stevens-institute-of-technology', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Stevens Institute of Technology''s admissions pages.', null),
  ('stevens-institute-of-technology', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Stevens Institute of Technology''s admissions pages.', null),
  ('stevens-institute-of-technology', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Stevens Institute of Technology''s financial-aid pages.', null),
  ('stevens-institute-of-technology', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Stevens Institute of Technology''s admissions pages.', null),
  ('stevens-institute-of-technology', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Stevens Institute of Technology''s admissions pages.', null),
  ('stevens-institute-of-technology', 'room_board'::public.university_fact_kind, '$19,124 / year (Scorecard 2023)', 19124, 'USD', 'us-scorecard-stevens-institute-of-technology', null, null, 'year'),
  ('stevens-institute-of-technology', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Stevens Institute of Technology''s financial-aid pages.', null),
  ('stevens-institute-of-technology', 'total_cost_of_attendance'::public.university_fact_kind, '$79,790 / year (Scorecard 2023)', 79790, 'USD', 'us-scorecard-stevens-institute-of-technology', null, null, 'year'),
  ('stevens-institute-of-technology', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Stevens Institute of Technology''s international admissions / financial-aid pages.', null),
  ('stevens-institute-of-technology', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 670–735; math 710–770 (Scorecard 2023); Middle-50% ACT 31–34 (Scorecard 2023)', null, null, 'us-scorecard-stevens-institute-of-technology', null, null, null),
  ('stevens-institute-of-technology', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Stevens Institute of Technology''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('stevens-institute-of-technology', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Stevens Institute of Technology''s admissions pages.'),
  ('stevens-institute-of-technology', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Stevens Institute of Technology''s admissions pages.'),
  ('stevens-institute-of-technology', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Stevens Institute of Technology''s admissions pages.'),
  ('stevens-institute-of-technology', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 670–735; math 710–770 (Scorecard 2023)', null, 'us-scorecard-stevens-institute-of-technology', null, null),
  ('stevens-institute-of-technology', 'act'::public.requirement_kind, 'Middle-50% ACT 31–34 (Scorecard 2023)', null, 'us-scorecard-stevens-institute-of-technology', null, null),
  ('stevens-institute-of-technology', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Stevens Institute of Technology''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #78: Bates College (UNITID 160977)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-bates-college', 'College Scorecard — Bates College', 'https://collegescorecard.ed.gov/school/?160977-bates_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('bates-college', 'Bates College', 'Lewiston, Maine', 'United States', '🇺🇸', 'Private four-year institution in Lewiston, Maine.',
  'Bates College. College Scorecard (2023) reports out-of-state tuition $66,590 / year and a middle-50% SAT range Middle-50% SAT critical reading 710–750; math 710–780 (Scorecard 2023).', 'bates-college', array[]::text[], 'us-scorecard-bates-college', 78, 'us-4prep-ranking-scorecard-2023', 160977)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('bates-college', 'tuition'::public.university_fact_kind, '$66,590 / year (Scorecard 2023)', 66590, 'USD', 'us-scorecard-bates-college', null, null, 'year'),
  ('bates-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Bates College''s admissions / financial-aid pages.', null),
  ('bates-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Bates College''s admissions pages.', null),
  ('bates-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Bates College''s admissions pages.', null),
  ('bates-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Bates College''s financial-aid pages.', null),
  ('bates-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Bates College''s admissions pages.', null),
  ('bates-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Bates College''s admissions pages.', null),
  ('bates-college', 'room_board'::public.university_fact_kind, '$18,780 / year (Scorecard 2023)', 18780, 'USD', 'us-scorecard-bates-college', null, null, 'year'),
  ('bates-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Bates College''s financial-aid pages.', null),
  ('bates-college', 'total_cost_of_attendance'::public.university_fact_kind, '$83,532 / year (Scorecard 2023)', 83532, 'USD', 'us-scorecard-bates-college', null, null, 'year'),
  ('bates-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Bates College''s international admissions / financial-aid pages.', null),
  ('bates-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 710–750; math 710–780 (Scorecard 2023); Middle-50% ACT 31–34 (Scorecard 2023)', null, null, 'us-scorecard-bates-college', null, null, null),
  ('bates-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Bates College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('bates-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Bates College''s admissions pages.'),
  ('bates-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Bates College''s admissions pages.'),
  ('bates-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Bates College''s admissions pages.'),
  ('bates-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 710–750; math 710–780 (Scorecard 2023)', null, 'us-scorecard-bates-college', null, null),
  ('bates-college', 'act'::public.requirement_kind, 'Middle-50% ACT 31–34 (Scorecard 2023)', null, 'us-scorecard-bates-college', null, null),
  ('bates-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Bates College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #79: United States Military Academy (UNITID 197036)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-united-states-military-academy', 'College Scorecard — United States Military Academy', 'https://collegescorecard.ed.gov/school/?197036-united_states_military_academy', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('united-states-military-academy', 'United States Military Academy', 'West  Point, New York', 'United States', '🇺🇸', 'Public four-year institution in West  Point, New York.',
  'United States Military Academy. College Scorecard (2023) reports out-of-state tuition not reported and a middle-50% SAT range Middle-50% SAT critical reading 600–710; math 600–720 (Scorecard 2023).', 'united-states-military-academy', array[]::text[], 'us-scorecard-united-states-military-academy', 79, 'us-4prep-ranking-scorecard-2023', 197036)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('united-states-military-academy', 'tuition'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report out-of-state tuition.', 'Check United States Military Academy''s financial-aid pages.', null),
  ('united-states-military-academy', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check United States Military Academy''s admissions / financial-aid pages.', null),
  ('united-states-military-academy', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check United States Military Academy''s admissions pages.', null),
  ('united-states-military-academy', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check United States Military Academy''s admissions pages.', null),
  ('united-states-military-academy', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check United States Military Academy''s financial-aid pages.', null),
  ('united-states-military-academy', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check United States Military Academy''s admissions pages.', null),
  ('united-states-military-academy', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check United States Military Academy''s admissions pages.', null),
  ('united-states-military-academy', 'room_board'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report on-campus room and board.', 'Check United States Military Academy''s financial-aid pages.', null),
  ('united-states-military-academy', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check United States Military Academy''s financial-aid pages.', null),
  ('united-states-military-academy', 'total_cost_of_attendance'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report academic-year cost of attendance.', 'Check United States Military Academy''s financial-aid pages.', null),
  ('united-states-military-academy', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check United States Military Academy''s international admissions / financial-aid pages.', null),
  ('united-states-military-academy', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 600–710; math 600–720 (Scorecard 2023); Middle-50% ACT 27–33 (Scorecard 2023)', null, null, 'us-scorecard-united-states-military-academy', null, null, null),
  ('united-states-military-academy', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask United States Military Academy''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('united-states-military-academy', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check United States Military Academy''s admissions pages.'),
  ('united-states-military-academy', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check United States Military Academy''s admissions pages.'),
  ('united-states-military-academy', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check United States Military Academy''s admissions pages.'),
  ('united-states-military-academy', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 600–710; math 600–720 (Scorecard 2023)', null, 'us-scorecard-united-states-military-academy', null, null),
  ('united-states-military-academy', 'act'::public.requirement_kind, 'Middle-50% ACT 27–33 (Scorecard 2023)', null, 'us-scorecard-united-states-military-academy', null, null),
  ('united-states-military-academy', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check United States Military Academy''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #80: The Cooper Union for the Advancement of Science and Art (UNITID 190372)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-the-cooper-union-for-the-advancement-of-science-and-art', 'College Scorecard — The Cooper Union for the Advancement of Science and Art', 'https://collegescorecard.ed.gov/school/?190372-the_cooper_union_for_the_advancement_of_science_and_art', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'The Cooper Union for the Advancement of Science and Art', 'New York, New York', 'United States', '🇺🇸', 'Private four-year institution in New York, New York.',
  'The Cooper Union for the Advancement of Science and Art. College Scorecard (2023) reports out-of-state tuition $46,820 / year and a middle-50% SAT range Middle-50% SAT critical reading 653–748; math 642–753 (Scorecard 2023).', 'the-cooper-union-for-the-advancement-of-science-and-art', array[]::text[], 'us-scorecard-the-cooper-union-for-the-advancement-of-science-and-art', 80, 'us-4prep-ranking-scorecard-2023', 190372)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'tuition'::public.university_fact_kind, '$46,820 / year (Scorecard 2023)', 46820, 'USD', 'us-scorecard-the-cooper-union-for-the-advancement-of-science-and-art', null, null, 'year'),
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check The Cooper Union for the Advancement of Science and Art''s admissions / financial-aid pages.', null),
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check The Cooper Union for the Advancement of Science and Art''s admissions pages.', null),
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check The Cooper Union for the Advancement of Science and Art''s admissions pages.', null),
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check The Cooper Union for the Advancement of Science and Art''s financial-aid pages.', null),
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check The Cooper Union for the Advancement of Science and Art''s admissions pages.', null),
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check The Cooper Union for the Advancement of Science and Art''s admissions pages.', null),
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'room_board'::public.university_fact_kind, '$19,090 / year (Scorecard 2023)', 19090, 'USD', 'us-scorecard-the-cooper-union-for-the-advancement-of-science-and-art', null, null, 'year'),
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check The Cooper Union for the Advancement of Science and Art''s financial-aid pages.', null),
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'total_cost_of_attendance'::public.university_fact_kind, '$64,190 / year (Scorecard 2023)', 64190, 'USD', 'us-scorecard-the-cooper-union-for-the-advancement-of-science-and-art', null, null, 'year'),
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check The Cooper Union for the Advancement of Science and Art''s international admissions / financial-aid pages.', null),
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 653–748; math 642–753 (Scorecard 2023); Middle-50% ACT 28–34 (Scorecard 2023)', null, null, 'us-scorecard-the-cooper-union-for-the-advancement-of-science-and-art', null, null, null),
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask The Cooper Union for the Advancement of Science and Art''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check The Cooper Union for the Advancement of Science and Art''s admissions pages.'),
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check The Cooper Union for the Advancement of Science and Art''s admissions pages.'),
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check The Cooper Union for the Advancement of Science and Art''s admissions pages.'),
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 653–748; math 642–753 (Scorecard 2023)', null, 'us-scorecard-the-cooper-union-for-the-advancement-of-science-and-art', null, null),
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'act'::public.requirement_kind, 'Middle-50% ACT 28–34 (Scorecard 2023)', null, 'us-scorecard-the-cooper-union-for-the-advancement-of-science-and-art', null, null),
  ('the-cooper-union-for-the-advancement-of-science-and-art', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check The Cooper Union for the Advancement of Science and Art''s admissions pages.')
on conflict (university_id, kind) do nothing;

commit;
