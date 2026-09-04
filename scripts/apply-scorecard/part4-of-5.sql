begin;

-- #121: Worcester Polytechnic Institute (UNITID 168421)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-worcester-polytechnic-institute', 'College Scorecard — Worcester Polytechnic Institute', 'https://collegescorecard.ed.gov/school/?168421-worcester_polytechnic_institute', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('worcester-polytechnic-institute', 'Worcester Polytechnic Institute', 'Worcester, Massachusetts', 'United States', '🇺🇸', 'Private four-year institution in Worcester, Massachusetts.',
  'Worcester Polytechnic Institute. College Scorecard (2023) reports out-of-state tuition $60,965 / year and a middle-50% SAT range not reported.', 'worcester-polytechnic-institute', array[]::text[], 'us-scorecard-worcester-polytechnic-institute', 121, 'us-4prep-ranking-scorecard-2023', 168421)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('worcester-polytechnic-institute', 'tuition'::public.university_fact_kind, '$60,965 / year (Scorecard 2023)', 60965, 'USD', 'us-scorecard-worcester-polytechnic-institute', null, null, 'year'),
  ('worcester-polytechnic-institute', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Worcester Polytechnic Institute''s admissions / financial-aid pages.', null),
  ('worcester-polytechnic-institute', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Worcester Polytechnic Institute''s admissions pages.', null),
  ('worcester-polytechnic-institute', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Worcester Polytechnic Institute''s admissions pages.', null),
  ('worcester-polytechnic-institute', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Worcester Polytechnic Institute''s financial-aid pages.', null),
  ('worcester-polytechnic-institute', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Worcester Polytechnic Institute''s admissions pages.', null),
  ('worcester-polytechnic-institute', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Worcester Polytechnic Institute''s admissions pages.', null),
  ('worcester-polytechnic-institute', 'room_board'::public.university_fact_kind, '$18,386 / year (Scorecard 2023)', 18386, 'USD', 'us-scorecard-worcester-polytechnic-institute', null, null, 'year'),
  ('worcester-polytechnic-institute', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Worcester Polytechnic Institute''s financial-aid pages.', null),
  ('worcester-polytechnic-institute', 'total_cost_of_attendance'::public.university_fact_kind, '$78,679 / year (Scorecard 2023)', 78679, 'USD', 'us-scorecard-worcester-polytechnic-institute', null, null, 'year'),
  ('worcester-polytechnic-institute', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Worcester Polytechnic Institute''s international admissions / financial-aid pages.', null),
  ('worcester-polytechnic-institute', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check Worcester Polytechnic Institute''s admissions pages.', null),
  ('worcester-polytechnic-institute', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Worcester Polytechnic Institute''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('worcester-polytechnic-institute', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Worcester Polytechnic Institute''s admissions pages.'),
  ('worcester-polytechnic-institute', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Worcester Polytechnic Institute''s admissions pages.'),
  ('worcester-polytechnic-institute', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Worcester Polytechnic Institute''s admissions pages.'),
  ('worcester-polytechnic-institute', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check Worcester Polytechnic Institute''s admissions pages.'),
  ('worcester-polytechnic-institute', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check Worcester Polytechnic Institute''s admissions pages.'),
  ('worcester-polytechnic-institute', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Worcester Polytechnic Institute''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #122: Denison University (UNITID 202523)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-denison-university', 'College Scorecard — Denison University', 'https://collegescorecard.ed.gov/school/?202523-denison_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('denison-university', 'Denison University', 'Granville, Ohio', 'United States', '🇺🇸', 'Private four-year institution in Granville, Ohio.',
  'Denison University. College Scorecard (2023) reports out-of-state tuition $67,000 / year and a middle-50% SAT range Middle-50% SAT critical reading 660–730; math 660–760 (Scorecard 2023).', 'denison-university', array[]::text[], 'us-scorecard-denison-university', 122, 'us-4prep-ranking-scorecard-2023', 202523)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('denison-university', 'tuition'::public.university_fact_kind, '$67,000 / year (Scorecard 2023)', 67000, 'USD', 'us-scorecard-denison-university', null, null, 'year'),
  ('denison-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Denison University''s admissions / financial-aid pages.', null),
  ('denison-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Denison University''s admissions pages.', null),
  ('denison-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Denison University''s admissions pages.', null),
  ('denison-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Denison University''s financial-aid pages.', null),
  ('denison-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Denison University''s admissions pages.', null),
  ('denison-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Denison University''s admissions pages.', null),
  ('denison-university', 'room_board'::public.university_fact_kind, '$16,400 / year (Scorecard 2023)', 16400, 'USD', 'us-scorecard-denison-university', null, null, 'year'),
  ('denison-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Denison University''s financial-aid pages.', null),
  ('denison-university', 'total_cost_of_attendance'::public.university_fact_kind, '$81,900 / year (Scorecard 2023)', 81900, 'USD', 'us-scorecard-denison-university', null, null, 'year'),
  ('denison-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Denison University''s international admissions / financial-aid pages.', null),
  ('denison-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 660–730; math 660–760 (Scorecard 2023); Middle-50% ACT 30–33 (Scorecard 2023)', null, null, 'us-scorecard-denison-university', null, null, null),
  ('denison-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Denison University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('denison-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Denison University''s admissions pages.'),
  ('denison-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Denison University''s admissions pages.'),
  ('denison-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Denison University''s admissions pages.'),
  ('denison-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 660–730; math 660–760 (Scorecard 2023)', null, 'us-scorecard-denison-university', null, null),
  ('denison-university', 'act'::public.requirement_kind, 'Middle-50% ACT 30–33 (Scorecard 2023)', null, 'us-scorecard-denison-university', null, null),
  ('denison-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Denison University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #123: University of San Diego (UNITID 122436)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-san-diego', 'College Scorecard — University of San Diego', 'https://collegescorecard.ed.gov/school/?122436-university_of_san_diego', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-san-diego', 'University of San Diego', 'San Diego, California', 'United States', '🇺🇸', 'Private four-year institution in San Diego, California.',
  'University of San Diego. College Scorecard (2023) reports out-of-state tuition $59,486 / year and a middle-50% SAT range not reported.', 'university-of-san-diego', array[]::text[], 'us-scorecard-university-of-san-diego', 123, 'us-4prep-ranking-scorecard-2023', 122436)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-san-diego', 'tuition'::public.university_fact_kind, '$59,486 / year (Scorecard 2023)', 59486, 'USD', 'us-scorecard-university-of-san-diego', null, null, 'year'),
  ('university-of-san-diego', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of San Diego''s admissions / financial-aid pages.', null),
  ('university-of-san-diego', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of San Diego''s admissions pages.', null),
  ('university-of-san-diego', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of San Diego''s admissions pages.', null),
  ('university-of-san-diego', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of San Diego''s financial-aid pages.', null),
  ('university-of-san-diego', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of San Diego''s admissions pages.', null),
  ('university-of-san-diego', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of San Diego''s admissions pages.', null),
  ('university-of-san-diego', 'room_board'::public.university_fact_kind, '$19,918 / year (Scorecard 2023)', 19918, 'USD', 'us-scorecard-university-of-san-diego', null, null, 'year'),
  ('university-of-san-diego', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of San Diego''s financial-aid pages.', null),
  ('university-of-san-diego', 'total_cost_of_attendance'::public.university_fact_kind, '$78,720 / year (Scorecard 2023)', 78720, 'USD', 'us-scorecard-university-of-san-diego', null, null, 'year'),
  ('university-of-san-diego', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of San Diego''s international admissions / financial-aid pages.', null),
  ('university-of-san-diego', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check University of San Diego''s admissions pages.', null),
  ('university-of-san-diego', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of San Diego''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-san-diego', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of San Diego''s admissions pages.'),
  ('university-of-san-diego', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of San Diego''s admissions pages.'),
  ('university-of-san-diego', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of San Diego''s admissions pages.'),
  ('university-of-san-diego', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check University of San Diego''s admissions pages.'),
  ('university-of-san-diego', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check University of San Diego''s admissions pages.'),
  ('university-of-san-diego', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of San Diego''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #124: Providence College (UNITID 217402)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-providence-college', 'College Scorecard — Providence College', 'https://collegescorecard.ed.gov/school/?217402-providence_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('providence-college', 'Providence College', 'Providence, Rhode Island', 'United States', '🇺🇸', 'Private four-year institution in Providence, Rhode Island.',
  'Providence College. College Scorecard (2023) reports out-of-state tuition $63,550 / year and a middle-50% SAT range Middle-50% SAT critical reading 630–700; math 620–690 (Scorecard 2023).', 'providence-college', array[]::text[], 'us-scorecard-providence-college', 124, 'us-4prep-ranking-scorecard-2023', 217402)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('providence-college', 'tuition'::public.university_fact_kind, '$63,550 / year (Scorecard 2023)', 63550, 'USD', 'us-scorecard-providence-college', null, null, 'year'),
  ('providence-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Providence College''s admissions / financial-aid pages.', null),
  ('providence-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Providence College''s admissions pages.', null),
  ('providence-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Providence College''s admissions pages.', null),
  ('providence-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Providence College''s financial-aid pages.', null),
  ('providence-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Providence College''s admissions pages.', null),
  ('providence-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Providence College''s admissions pages.', null),
  ('providence-college', 'room_board'::public.university_fact_kind, '$17,840 / year (Scorecard 2023)', 17840, 'USD', 'us-scorecard-providence-college', null, null, 'year'),
  ('providence-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Providence College''s financial-aid pages.', null),
  ('providence-college', 'total_cost_of_attendance'::public.university_fact_kind, '$80,466 / year (Scorecard 2023)', 80466, 'USD', 'us-scorecard-providence-college', null, null, 'year'),
  ('providence-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Providence College''s international admissions / financial-aid pages.', null),
  ('providence-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 630–700; math 620–690 (Scorecard 2023); Middle-50% ACT 29–32 (Scorecard 2023)', null, null, 'us-scorecard-providence-college', null, null, null),
  ('providence-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Providence College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('providence-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Providence College''s admissions pages.'),
  ('providence-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Providence College''s admissions pages.'),
  ('providence-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Providence College''s admissions pages.'),
  ('providence-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 630–700; math 620–690 (Scorecard 2023)', null, 'us-scorecard-providence-college', null, null),
  ('providence-college', 'act'::public.requirement_kind, 'Middle-50% ACT 29–32 (Scorecard 2023)', null, 'us-scorecard-providence-college', null, null),
  ('providence-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Providence College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #125: Syracuse University (UNITID 196413)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-syracuse-university', 'College Scorecard — Syracuse University', 'https://collegescorecard.ed.gov/school/?196413-syracuse_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('syracuse-university', 'Syracuse University', 'Syracuse, New York', 'United States', '🇺🇸', 'Private four-year institution in Syracuse, New York.',
  'Syracuse University. College Scorecard (2023) reports out-of-state tuition $65,528 / year and a middle-50% SAT range Middle-50% SAT critical reading 640–720; math 630–720 (Scorecard 2023).', 'syracuse-university', array[]::text[], 'us-scorecard-syracuse-university', 125, 'us-4prep-ranking-scorecard-2023', 196413)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('syracuse-university', 'tuition'::public.university_fact_kind, '$65,528 / year (Scorecard 2023)', 65528, 'USD', 'us-scorecard-syracuse-university', null, null, 'year'),
  ('syracuse-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Syracuse University''s admissions / financial-aid pages.', null),
  ('syracuse-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Syracuse University''s admissions pages.', null),
  ('syracuse-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Syracuse University''s admissions pages.', null),
  ('syracuse-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Syracuse University''s financial-aid pages.', null),
  ('syracuse-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Syracuse University''s admissions pages.', null),
  ('syracuse-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Syracuse University''s admissions pages.', null),
  ('syracuse-university', 'room_board'::public.university_fact_kind, '$19,188 / year (Scorecard 2023)', 19188, 'USD', 'us-scorecard-syracuse-university', null, null, 'year'),
  ('syracuse-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Syracuse University''s financial-aid pages.', null),
  ('syracuse-university', 'total_cost_of_attendance'::public.university_fact_kind, '$84,517 / year (Scorecard 2023)', 84517, 'USD', 'us-scorecard-syracuse-university', null, null, 'year'),
  ('syracuse-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Syracuse University''s international admissions / financial-aid pages.', null),
  ('syracuse-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 640–720; math 630–720 (Scorecard 2023); Middle-50% ACT 29–32 (Scorecard 2023)', null, null, 'us-scorecard-syracuse-university', null, null, null),
  ('syracuse-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Syracuse University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('syracuse-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Syracuse University''s admissions pages.'),
  ('syracuse-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Syracuse University''s admissions pages.'),
  ('syracuse-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Syracuse University''s admissions pages.'),
  ('syracuse-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 640–720; math 630–720 (Scorecard 2023)', null, 'us-scorecard-syracuse-university', null, null),
  ('syracuse-university', 'act'::public.requirement_kind, 'Middle-50% ACT 29–32 (Scorecard 2023)', null, 'us-scorecard-syracuse-university', null, null),
  ('syracuse-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Syracuse University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #126: Colorado College (UNITID 126678)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-colorado-college', 'College Scorecard — Colorado College', 'https://collegescorecard.ed.gov/school/?126678-colorado_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('colorado-college', 'Colorado College', 'Colorado Springs, Colorado', 'United States', '🇺🇸', 'Private four-year institution in Colorado Springs, Colorado.',
  'Colorado College. College Scorecard (2023) reports out-of-state tuition $70,734 / year and a middle-50% SAT range Middle-50% SAT critical reading 640–730; math 590–730 (Scorecard 2023).', 'colorado-college', array[]::text[], 'us-scorecard-colorado-college', 126, 'us-4prep-ranking-scorecard-2023', 126678)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('colorado-college', 'tuition'::public.university_fact_kind, '$70,734 / year (Scorecard 2023)', 70734, 'USD', 'us-scorecard-colorado-college', null, null, 'year'),
  ('colorado-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Colorado College''s admissions / financial-aid pages.', null),
  ('colorado-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Colorado College''s admissions pages.', null),
  ('colorado-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Colorado College''s admissions pages.', null),
  ('colorado-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Colorado College''s financial-aid pages.', null),
  ('colorado-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Colorado College''s admissions pages.', null),
  ('colorado-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Colorado College''s admissions pages.', null),
  ('colorado-college', 'room_board'::public.university_fact_kind, '$16,020 / year (Scorecard 2023)', 16020, 'USD', 'us-scorecard-colorado-college', null, null, 'year'),
  ('colorado-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Colorado College''s financial-aid pages.', null),
  ('colorado-college', 'total_cost_of_attendance'::public.university_fact_kind, '$86,921 / year (Scorecard 2023)', 86921, 'USD', 'us-scorecard-colorado-college', null, null, 'year'),
  ('colorado-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Colorado College''s international admissions / financial-aid pages.', null),
  ('colorado-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 640–730; math 590–730 (Scorecard 2023); Middle-50% ACT 29–33 (Scorecard 2023)', null, null, 'us-scorecard-colorado-college', null, null, null),
  ('colorado-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Colorado College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('colorado-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Colorado College''s admissions pages.'),
  ('colorado-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Colorado College''s admissions pages.'),
  ('colorado-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Colorado College''s admissions pages.'),
  ('colorado-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 640–730; math 590–730 (Scorecard 2023)', null, 'us-scorecard-colorado-college', null, null),
  ('colorado-college', 'act'::public.requirement_kind, 'Middle-50% ACT 29–33 (Scorecard 2023)', null, 'us-scorecard-colorado-college', null, null),
  ('colorado-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Colorado College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #127: Clemson University (UNITID 217882)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-clemson-university', 'College Scorecard — Clemson University', 'https://collegescorecard.ed.gov/school/?217882-clemson_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('clemson-university', 'Clemson University', 'Clemson, South Carolina', 'United States', '🇺🇸', 'Public four-year institution in Clemson, South Carolina.',
  'Clemson University. College Scorecard (2023) reports out-of-state tuition $40,866 / year and a middle-50% SAT range Middle-50% SAT critical reading 620–700; math 620–710 (Scorecard 2023).', 'clemson-university', array[]::text[], 'us-scorecard-clemson-university', 127, 'us-4prep-ranking-scorecard-2023', 217882)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('clemson-university', 'tuition'::public.university_fact_kind, '$40,866 / year (Scorecard 2023)', 40866, 'USD', 'us-scorecard-clemson-university', null, null, 'year'),
  ('clemson-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Clemson University''s admissions / financial-aid pages.', null),
  ('clemson-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Clemson University''s admissions pages.', null),
  ('clemson-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Clemson University''s admissions pages.', null),
  ('clemson-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Clemson University''s financial-aid pages.', null),
  ('clemson-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Clemson University''s admissions pages.', null),
  ('clemson-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Clemson University''s admissions pages.', null),
  ('clemson-university', 'room_board'::public.university_fact_kind, '$13,284 / year (Scorecard 2023)', 13284, 'USD', 'us-scorecard-clemson-university', null, null, 'year'),
  ('clemson-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Clemson University''s financial-aid pages.', null),
  ('clemson-university', 'total_cost_of_attendance'::public.university_fact_kind, '$35,015 / year (Scorecard 2023)', 35015, 'USD', 'us-scorecard-clemson-university', null, null, 'year'),
  ('clemson-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Clemson University''s international admissions / financial-aid pages.', null),
  ('clemson-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 620–700; math 620–710 (Scorecard 2023); Middle-50% ACT 28–32 (Scorecard 2023)', null, null, 'us-scorecard-clemson-university', null, null, null),
  ('clemson-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Clemson University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('clemson-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Clemson University''s admissions pages.'),
  ('clemson-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Clemson University''s admissions pages.'),
  ('clemson-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Clemson University''s admissions pages.'),
  ('clemson-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 620–700; math 620–710 (Scorecard 2023)', null, 'us-scorecard-clemson-university', null, null),
  ('clemson-university', 'act'::public.requirement_kind, 'Middle-50% ACT 28–32 (Scorecard 2023)', null, 'us-scorecard-clemson-university', null, null),
  ('clemson-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Clemson University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #128: Gettysburg College (UNITID 212674)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-gettysburg-college', 'College Scorecard — Gettysburg College', 'https://collegescorecard.ed.gov/school/?212674-gettysburg_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('gettysburg-college', 'Gettysburg College', 'Gettysburg, Pennsylvania', 'United States', '🇺🇸', 'Private four-year institution in Gettysburg, Pennsylvania.',
  'Gettysburg College. College Scorecard (2023) reports out-of-state tuition $66,640 / year and a middle-50% SAT range Middle-50% SAT critical reading 640–720; math 630–740 (Scorecard 2023).', 'gettysburg-college', array[]::text[], 'us-scorecard-gettysburg-college', 128, 'us-4prep-ranking-scorecard-2023', 212674)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('gettysburg-college', 'tuition'::public.university_fact_kind, '$66,640 / year (Scorecard 2023)', 66640, 'USD', 'us-scorecard-gettysburg-college', null, null, 'year'),
  ('gettysburg-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Gettysburg College''s admissions / financial-aid pages.', null),
  ('gettysburg-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Gettysburg College''s admissions pages.', null),
  ('gettysburg-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Gettysburg College''s admissions pages.', null),
  ('gettysburg-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Gettysburg College''s financial-aid pages.', null),
  ('gettysburg-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Gettysburg College''s admissions pages.', null),
  ('gettysburg-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Gettysburg College''s admissions pages.', null),
  ('gettysburg-college', 'room_board'::public.university_fact_kind, '$16,110 / year (Scorecard 2023)', 16110, 'USD', 'us-scorecard-gettysburg-college', null, null, 'year'),
  ('gettysburg-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Gettysburg College''s financial-aid pages.', null),
  ('gettysburg-college', 'total_cost_of_attendance'::public.university_fact_kind, '$81,960 / year (Scorecard 2023)', 81960, 'USD', 'us-scorecard-gettysburg-college', null, null, 'year'),
  ('gettysburg-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Gettysburg College''s international admissions / financial-aid pages.', null),
  ('gettysburg-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 640–720; math 630–740 (Scorecard 2023); Middle-50% ACT 29–32 (Scorecard 2023)', null, null, 'us-scorecard-gettysburg-college', null, null, null),
  ('gettysburg-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Gettysburg College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('gettysburg-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Gettysburg College''s admissions pages.'),
  ('gettysburg-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Gettysburg College''s admissions pages.'),
  ('gettysburg-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Gettysburg College''s admissions pages.'),
  ('gettysburg-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 640–720; math 630–740 (Scorecard 2023)', null, 'us-scorecard-gettysburg-college', null, null),
  ('gettysburg-college', 'act'::public.requirement_kind, 'Middle-50% ACT 29–32 (Scorecard 2023)', null, 'us-scorecard-gettysburg-college', null, null),
  ('gettysburg-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Gettysburg College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #129: Rensselaer Polytechnic Institute (UNITID 194824)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-rensselaer-polytechnic-institute', 'College Scorecard — Rensselaer Polytechnic Institute', 'https://collegescorecard.ed.gov/school/?194824-rensselaer_polytechnic_institute', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('rensselaer-polytechnic-institute', 'Rensselaer Polytechnic Institute', 'Troy, New York', 'United States', '🇺🇸', 'Private four-year institution in Troy, New York.',
  'Rensselaer Polytechnic Institute. College Scorecard (2023) reports out-of-state tuition $64,081 / year and a middle-50% SAT range Middle-50% SAT critical reading 670–740; math 705–770 (Scorecard 2023).', 'rensselaer-polytechnic-institute', array[]::text[], 'us-scorecard-rensselaer-polytechnic-institute', 129, 'us-4prep-ranking-scorecard-2023', 194824)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('rensselaer-polytechnic-institute', 'tuition'::public.university_fact_kind, '$64,081 / year (Scorecard 2023)', 64081, 'USD', 'us-scorecard-rensselaer-polytechnic-institute', null, null, 'year'),
  ('rensselaer-polytechnic-institute', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Rensselaer Polytechnic Institute''s admissions / financial-aid pages.', null),
  ('rensselaer-polytechnic-institute', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Rensselaer Polytechnic Institute''s admissions pages.', null),
  ('rensselaer-polytechnic-institute', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Rensselaer Polytechnic Institute''s admissions pages.', null),
  ('rensselaer-polytechnic-institute', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Rensselaer Polytechnic Institute''s financial-aid pages.', null),
  ('rensselaer-polytechnic-institute', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Rensselaer Polytechnic Institute''s admissions pages.', null),
  ('rensselaer-polytechnic-institute', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Rensselaer Polytechnic Institute''s admissions pages.', null),
  ('rensselaer-polytechnic-institute', 'room_board'::public.university_fact_kind, '$18,120 / year (Scorecard 2023)', 18120, 'USD', 'us-scorecard-rensselaer-polytechnic-institute', null, null, 'year'),
  ('rensselaer-polytechnic-institute', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Rensselaer Polytechnic Institute''s financial-aid pages.', null),
  ('rensselaer-polytechnic-institute', 'total_cost_of_attendance'::public.university_fact_kind, '$82,404 / year (Scorecard 2023)', 82404, 'USD', 'us-scorecard-rensselaer-polytechnic-institute', null, null, 'year'),
  ('rensselaer-polytechnic-institute', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Rensselaer Polytechnic Institute''s international admissions / financial-aid pages.', null),
  ('rensselaer-polytechnic-institute', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 670–740; math 705–770 (Scorecard 2023); Middle-50% ACT 30–34 (Scorecard 2023)', null, null, 'us-scorecard-rensselaer-polytechnic-institute', null, null, null),
  ('rensselaer-polytechnic-institute', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Rensselaer Polytechnic Institute''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('rensselaer-polytechnic-institute', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Rensselaer Polytechnic Institute''s admissions pages.'),
  ('rensselaer-polytechnic-institute', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Rensselaer Polytechnic Institute''s admissions pages.'),
  ('rensselaer-polytechnic-institute', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Rensselaer Polytechnic Institute''s admissions pages.'),
  ('rensselaer-polytechnic-institute', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 670–740; math 705–770 (Scorecard 2023)', null, 'us-scorecard-rensselaer-polytechnic-institute', null, null),
  ('rensselaer-polytechnic-institute', 'act'::public.requirement_kind, 'Middle-50% ACT 30–34 (Scorecard 2023)', null, 'us-scorecard-rensselaer-polytechnic-institute', null, null),
  ('rensselaer-polytechnic-institute', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Rensselaer Polytechnic Institute''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #130: Virginia Polytechnic Institute and State University (UNITID 233921)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-virginia-polytechnic-institute-and-state-university', 'College Scorecard — Virginia Polytechnic Institute and State University', 'https://collegescorecard.ed.gov/school/?233921-virginia_polytechnic_institute_and_state_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('virginia-polytechnic-institute-and-state-university', 'Virginia Polytechnic Institute and State University', 'Blacksburg, Virginia', 'United States', '🇺🇸', 'Public four-year institution in Blacksburg, Virginia.',
  'Virginia Polytechnic Institute and State University. College Scorecard (2023) reports out-of-state tuition $37,764 / year and a middle-50% SAT range Middle-50% SAT critical reading 640–710; math 640–740 (Scorecard 2023).', 'virginia-polytechnic-institute-and-state-university', array[]::text[], 'us-scorecard-virginia-polytechnic-institute-and-state-university', 130, 'us-4prep-ranking-scorecard-2023', 233921)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('virginia-polytechnic-institute-and-state-university', 'tuition'::public.university_fact_kind, '$37,764 / year (Scorecard 2023)', 37764, 'USD', 'us-scorecard-virginia-polytechnic-institute-and-state-university', null, null, 'year'),
  ('virginia-polytechnic-institute-and-state-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Virginia Polytechnic Institute and State University''s admissions / financial-aid pages.', null),
  ('virginia-polytechnic-institute-and-state-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Virginia Polytechnic Institute and State University''s admissions pages.', null),
  ('virginia-polytechnic-institute-and-state-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Virginia Polytechnic Institute and State University''s admissions pages.', null),
  ('virginia-polytechnic-institute-and-state-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Virginia Polytechnic Institute and State University''s financial-aid pages.', null),
  ('virginia-polytechnic-institute-and-state-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Virginia Polytechnic Institute and State University''s admissions pages.', null),
  ('virginia-polytechnic-institute-and-state-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Virginia Polytechnic Institute and State University''s admissions pages.', null),
  ('virginia-polytechnic-institute-and-state-university', 'room_board'::public.university_fact_kind, '$16,550 / year (Scorecard 2023)', 16550, 'USD', 'us-scorecard-virginia-polytechnic-institute-and-state-university', null, null, 'year'),
  ('virginia-polytechnic-institute-and-state-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Virginia Polytechnic Institute and State University''s financial-aid pages.', null),
  ('virginia-polytechnic-institute-and-state-university', 'total_cost_of_attendance'::public.university_fact_kind, '$36,951 / year (Scorecard 2023)', 36951, 'USD', 'us-scorecard-virginia-polytechnic-institute-and-state-university', null, null, 'year'),
  ('virginia-polytechnic-institute-and-state-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Virginia Polytechnic Institute and State University''s international admissions / financial-aid pages.', null),
  ('virginia-polytechnic-institute-and-state-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 640–710; math 640–740 (Scorecard 2023); Middle-50% ACT 28–32 (Scorecard 2023)', null, null, 'us-scorecard-virginia-polytechnic-institute-and-state-university', null, null, null),
  ('virginia-polytechnic-institute-and-state-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Virginia Polytechnic Institute and State University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('virginia-polytechnic-institute-and-state-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Virginia Polytechnic Institute and State University''s admissions pages.'),
  ('virginia-polytechnic-institute-and-state-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Virginia Polytechnic Institute and State University''s admissions pages.'),
  ('virginia-polytechnic-institute-and-state-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Virginia Polytechnic Institute and State University''s admissions pages.'),
  ('virginia-polytechnic-institute-and-state-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 640–710; math 640–740 (Scorecard 2023)', null, 'us-scorecard-virginia-polytechnic-institute-and-state-university', null, null),
  ('virginia-polytechnic-institute-and-state-university', 'act'::public.requirement_kind, 'Middle-50% ACT 28–32 (Scorecard 2023)', null, 'us-scorecard-virginia-polytechnic-institute-and-state-university', null, null),
  ('virginia-polytechnic-institute-and-state-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Virginia Polytechnic Institute and State University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #131: Dickinson College (UNITID 212009)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-dickinson-college', 'College Scorecard — Dickinson College', 'https://collegescorecard.ed.gov/school/?212009-dickinson_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('dickinson-college', 'Dickinson College', 'Carlisle, Pennsylvania', 'United States', '🇺🇸', 'Private four-year institution in Carlisle, Pennsylvania.',
  'Dickinson College. College Scorecard (2023) reports out-of-state tuition $65,650 / year and a middle-50% SAT range Middle-50% SAT critical reading 670–740; math 640–720 (Scorecard 2023).', 'dickinson-college', array[]::text[], 'us-scorecard-dickinson-college', 131, 'us-4prep-ranking-scorecard-2023', 212009)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('dickinson-college', 'tuition'::public.university_fact_kind, '$65,650 / year (Scorecard 2023)', 65650, 'USD', 'us-scorecard-dickinson-college', null, null, 'year'),
  ('dickinson-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Dickinson College''s admissions / financial-aid pages.', null),
  ('dickinson-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Dickinson College''s admissions pages.', null),
  ('dickinson-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Dickinson College''s admissions pages.', null),
  ('dickinson-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Dickinson College''s financial-aid pages.', null),
  ('dickinson-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Dickinson College''s admissions pages.', null),
  ('dickinson-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Dickinson College''s admissions pages.', null),
  ('dickinson-college', 'room_board'::public.university_fact_kind, '$17,100 / year (Scorecard 2023)', 17100, 'USD', 'us-scorecard-dickinson-college', null, null, 'year'),
  ('dickinson-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Dickinson College''s financial-aid pages.', null),
  ('dickinson-college', 'total_cost_of_attendance'::public.university_fact_kind, '$82,902 / year (Scorecard 2023)', 82902, 'USD', 'us-scorecard-dickinson-college', null, null, 'year'),
  ('dickinson-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Dickinson College''s international admissions / financial-aid pages.', null),
  ('dickinson-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 670–740; math 640–720 (Scorecard 2023); Middle-50% ACT 30–33 (Scorecard 2023)', null, null, 'us-scorecard-dickinson-college', null, null, null),
  ('dickinson-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Dickinson College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('dickinson-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Dickinson College''s admissions pages.'),
  ('dickinson-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Dickinson College''s admissions pages.'),
  ('dickinson-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Dickinson College''s admissions pages.'),
  ('dickinson-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 670–740; math 640–720 (Scorecard 2023)', null, 'us-scorecard-dickinson-college', null, null),
  ('dickinson-college', 'act'::public.requirement_kind, 'Middle-50% ACT 30–33 (Scorecard 2023)', null, 'us-scorecard-dickinson-college', null, null),
  ('dickinson-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Dickinson College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #132: Colorado School of Mines (UNITID 126775)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-colorado-school-of-mines', 'College Scorecard — Colorado School of Mines', 'https://collegescorecard.ed.gov/school/?126775-colorado_school_of_mines', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('colorado-school-of-mines', 'Colorado School of Mines', 'Golden, Colorado', 'United States', '🇺🇸', 'Public four-year institution in Golden, Colorado.',
  'Colorado School of Mines. College Scorecard (2023) reports out-of-state tuition $45,824 / year and a middle-50% SAT range Middle-50% SAT critical reading 650–730; math 670–750 (Scorecard 2023).', 'colorado-school-of-mines', array[]::text[], 'us-scorecard-colorado-school-of-mines', 132, 'us-4prep-ranking-scorecard-2023', 126775)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('colorado-school-of-mines', 'tuition'::public.university_fact_kind, '$45,824 / year (Scorecard 2023)', 45824, 'USD', 'us-scorecard-colorado-school-of-mines', null, null, 'year'),
  ('colorado-school-of-mines', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Colorado School of Mines''s admissions / financial-aid pages.', null),
  ('colorado-school-of-mines', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Colorado School of Mines''s admissions pages.', null),
  ('colorado-school-of-mines', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Colorado School of Mines''s admissions pages.', null),
  ('colorado-school-of-mines', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Colorado School of Mines''s financial-aid pages.', null),
  ('colorado-school-of-mines', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Colorado School of Mines''s admissions pages.', null),
  ('colorado-school-of-mines', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Colorado School of Mines''s admissions pages.', null),
  ('colorado-school-of-mines', 'room_board'::public.university_fact_kind, '$17,531 / year (Scorecard 2023)', 17531, 'USD', 'us-scorecard-colorado-school-of-mines', null, null, 'year'),
  ('colorado-school-of-mines', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Colorado School of Mines''s financial-aid pages.', null),
  ('colorado-school-of-mines', 'total_cost_of_attendance'::public.university_fact_kind, '$40,560 / year (Scorecard 2023)', 40560, 'USD', 'us-scorecard-colorado-school-of-mines', null, null, 'year'),
  ('colorado-school-of-mines', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Colorado School of Mines''s international admissions / financial-aid pages.', null),
  ('colorado-school-of-mines', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 650–730; math 670–750 (Scorecard 2023); Middle-50% ACT 29–33 (Scorecard 2023)', null, null, 'us-scorecard-colorado-school-of-mines', null, null, null),
  ('colorado-school-of-mines', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Colorado School of Mines''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('colorado-school-of-mines', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Colorado School of Mines''s admissions pages.'),
  ('colorado-school-of-mines', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Colorado School of Mines''s admissions pages.'),
  ('colorado-school-of-mines', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Colorado School of Mines''s admissions pages.'),
  ('colorado-school-of-mines', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 650–730; math 670–750 (Scorecard 2023)', null, 'us-scorecard-colorado-school-of-mines', null, null),
  ('colorado-school-of-mines', 'act'::public.requirement_kind, 'Middle-50% ACT 29–33 (Scorecard 2023)', null, 'us-scorecard-colorado-school-of-mines', null, null),
  ('colorado-school-of-mines', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Colorado School of Mines''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #133: Loyola Marymount University (UNITID 117946)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-loyola-marymount-university', 'College Scorecard — Loyola Marymount University', 'https://collegescorecard.ed.gov/school/?117946-loyola_marymount_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('loyola-marymount-university', 'Loyola Marymount University', 'Los Angeles, California', 'United States', '🇺🇸', 'Private four-year institution in Los Angeles, California.',
  'Loyola Marymount University. College Scorecard (2023) reports out-of-state tuition $62,357 / year and a middle-50% SAT range Middle-50% SAT critical reading 640–720; math 620–710 (Scorecard 2023).', 'loyola-marymount-university', array[]::text[], 'us-scorecard-loyola-marymount-university', 133, 'us-4prep-ranking-scorecard-2023', 117946)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('loyola-marymount-university', 'tuition'::public.university_fact_kind, '$62,357 / year (Scorecard 2023)', 62357, 'USD', 'us-scorecard-loyola-marymount-university', null, null, 'year'),
  ('loyola-marymount-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Loyola Marymount University''s admissions / financial-aid pages.', null),
  ('loyola-marymount-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Loyola Marymount University''s admissions pages.', null),
  ('loyola-marymount-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Loyola Marymount University''s admissions pages.', null),
  ('loyola-marymount-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Loyola Marymount University''s financial-aid pages.', null),
  ('loyola-marymount-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Loyola Marymount University''s admissions pages.', null),
  ('loyola-marymount-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Loyola Marymount University''s admissions pages.', null),
  ('loyola-marymount-university', 'room_board'::public.university_fact_kind, '$22,026 / year (Scorecard 2023)', 22026, 'USD', 'us-scorecard-loyola-marymount-university', null, null, 'year'),
  ('loyola-marymount-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Loyola Marymount University''s financial-aid pages.', null),
  ('loyola-marymount-university', 'total_cost_of_attendance'::public.university_fact_kind, '$83,943 / year (Scorecard 2023)', 83943, 'USD', 'us-scorecard-loyola-marymount-university', null, null, 'year'),
  ('loyola-marymount-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Loyola Marymount University''s international admissions / financial-aid pages.', null),
  ('loyola-marymount-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 640–720; math 620–710 (Scorecard 2023); Middle-50% ACT 28–32 (Scorecard 2023)', null, null, 'us-scorecard-loyola-marymount-university', null, null, null),
  ('loyola-marymount-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Loyola Marymount University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('loyola-marymount-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Loyola Marymount University''s admissions pages.'),
  ('loyola-marymount-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Loyola Marymount University''s admissions pages.'),
  ('loyola-marymount-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Loyola Marymount University''s admissions pages.'),
  ('loyola-marymount-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 640–720; math 620–710 (Scorecard 2023)', null, 'us-scorecard-loyola-marymount-university', null, null),
  ('loyola-marymount-university', 'act'::public.requirement_kind, 'Middle-50% ACT 28–32 (Scorecard 2023)', null, 'us-scorecard-loyola-marymount-university', null, null),
  ('loyola-marymount-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Loyola Marymount University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #134: Whitman College (UNITID 237057)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-whitman-college', 'College Scorecard — Whitman College', 'https://collegescorecard.ed.gov/school/?237057-whitman_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('whitman-college', 'Whitman College', 'Walla Walla, Washington', 'United States', '🇺🇸', 'Private four-year institution in Walla Walla, Washington.',
  'Whitman College. College Scorecard (2023) reports out-of-state tuition $64,050 / year and a middle-50% SAT range Middle-50% SAT critical reading 670–740; math 640–740 (Scorecard 2023).', 'whitman-college', array[]::text[], 'us-scorecard-whitman-college', 134, 'us-4prep-ranking-scorecard-2023', 237057)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('whitman-college', 'tuition'::public.university_fact_kind, '$64,050 / year (Scorecard 2023)', 64050, 'USD', 'us-scorecard-whitman-college', null, null, 'year'),
  ('whitman-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Whitman College''s admissions / financial-aid pages.', null),
  ('whitman-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Whitman College''s admissions pages.', null),
  ('whitman-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Whitman College''s admissions pages.', null),
  ('whitman-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Whitman College''s financial-aid pages.', null),
  ('whitman-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Whitman College''s admissions pages.', null),
  ('whitman-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Whitman College''s admissions pages.', null),
  ('whitman-college', 'room_board'::public.university_fact_kind, '$15,080 / year (Scorecard 2023)', 15080, 'USD', 'us-scorecard-whitman-college', null, null, 'year'),
  ('whitman-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Whitman College''s financial-aid pages.', null),
  ('whitman-college', 'total_cost_of_attendance'::public.university_fact_kind, '$78,092 / year (Scorecard 2023)', 78092, 'USD', 'us-scorecard-whitman-college', null, null, 'year'),
  ('whitman-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Whitman College''s international admissions / financial-aid pages.', null),
  ('whitman-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 670–740; math 640–740 (Scorecard 2023); Middle-50% ACT 29–33 (Scorecard 2023)', null, null, 'us-scorecard-whitman-college', null, null, null),
  ('whitman-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Whitman College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('whitman-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Whitman College''s admissions pages.'),
  ('whitman-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Whitman College''s admissions pages.'),
  ('whitman-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Whitman College''s admissions pages.'),
  ('whitman-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 670–740; math 640–740 (Scorecard 2023)', null, 'us-scorecard-whitman-college', null, null),
  ('whitman-college', 'act'::public.requirement_kind, 'Middle-50% ACT 29–33 (Scorecard 2023)', null, 'us-scorecard-whitman-college', null, null),
  ('whitman-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Whitman College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #135: North Carolina State University at Raleigh (UNITID 199193)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-north-carolina-state-university-at-raleigh', 'College Scorecard — North Carolina State University at Raleigh', 'https://collegescorecard.ed.gov/school/?199193-north_carolina_state_university_at_raleigh', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('north-carolina-state-university-at-raleigh', 'North Carolina State University at Raleigh', 'Raleigh, North Carolina', 'United States', '🇺🇸', 'Public four-year institution in Raleigh, North Carolina.',
  'North Carolina State University at Raleigh. College Scorecard (2023) reports out-of-state tuition $32,847 / year and a middle-50% SAT range Middle-50% SAT critical reading 650–720; math 650–750 (Scorecard 2023).', 'north-carolina-state-university-at-raleigh', array[]::text[], 'us-scorecard-north-carolina-state-university-at-raleigh', 135, 'us-4prep-ranking-scorecard-2023', 199193)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('north-carolina-state-university-at-raleigh', 'tuition'::public.university_fact_kind, '$32,847 / year (Scorecard 2023)', 32847, 'USD', 'us-scorecard-north-carolina-state-university-at-raleigh', null, null, 'year'),
  ('north-carolina-state-university-at-raleigh', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check North Carolina State University at Raleigh''s admissions / financial-aid pages.', null),
  ('north-carolina-state-university-at-raleigh', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check North Carolina State University at Raleigh''s admissions pages.', null),
  ('north-carolina-state-university-at-raleigh', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check North Carolina State University at Raleigh''s admissions pages.', null),
  ('north-carolina-state-university-at-raleigh', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check North Carolina State University at Raleigh''s financial-aid pages.', null),
  ('north-carolina-state-university-at-raleigh', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check North Carolina State University at Raleigh''s admissions pages.', null),
  ('north-carolina-state-university-at-raleigh', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check North Carolina State University at Raleigh''s admissions pages.', null),
  ('north-carolina-state-university-at-raleigh', 'room_board'::public.university_fact_kind, '$14,332 / year (Scorecard 2023)', 14332, 'USD', 'us-scorecard-north-carolina-state-university-at-raleigh', null, null, 'year'),
  ('north-carolina-state-university-at-raleigh', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check North Carolina State University at Raleigh''s financial-aid pages.', null),
  ('north-carolina-state-university-at-raleigh', 'total_cost_of_attendance'::public.university_fact_kind, '$26,425 / year (Scorecard 2023)', 26425, 'USD', 'us-scorecard-north-carolina-state-university-at-raleigh', null, null, 'year'),
  ('north-carolina-state-university-at-raleigh', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check North Carolina State University at Raleigh''s international admissions / financial-aid pages.', null),
  ('north-carolina-state-university-at-raleigh', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 650–720; math 650–750 (Scorecard 2023); Middle-50% ACT 28–32 (Scorecard 2023)', null, null, 'us-scorecard-north-carolina-state-university-at-raleigh', null, null, null),
  ('north-carolina-state-university-at-raleigh', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask North Carolina State University at Raleigh''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('north-carolina-state-university-at-raleigh', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check North Carolina State University at Raleigh''s admissions pages.'),
  ('north-carolina-state-university-at-raleigh', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check North Carolina State University at Raleigh''s admissions pages.'),
  ('north-carolina-state-university-at-raleigh', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check North Carolina State University at Raleigh''s admissions pages.'),
  ('north-carolina-state-university-at-raleigh', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 650–720; math 650–750 (Scorecard 2023)', null, 'us-scorecard-north-carolina-state-university-at-raleigh', null, null),
  ('north-carolina-state-university-at-raleigh', 'act'::public.requirement_kind, 'Middle-50% ACT 28–32 (Scorecard 2023)', null, 'us-scorecard-north-carolina-state-university-at-raleigh', null, null),
  ('north-carolina-state-university-at-raleigh', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check North Carolina State University at Raleigh''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #136: Fordham University (UNITID 191241)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-fordham-university', 'College Scorecard — Fordham University', 'https://collegescorecard.ed.gov/school/?191241-fordham_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('fordham-university', 'Fordham University', 'Bronx, New York', 'United States', '🇺🇸', 'Private four-year institution in Bronx, New York.',
  'Fordham University. College Scorecard (2023) reports out-of-state tuition $64,915 / year and a middle-50% SAT range Middle-50% SAT critical reading 660–730; math 660–750 (Scorecard 2023).', 'fordham-university', array[]::text[], 'us-scorecard-fordham-university', 136, 'us-4prep-ranking-scorecard-2023', 191241)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('fordham-university', 'tuition'::public.university_fact_kind, '$64,915 / year (Scorecard 2023)', 64915, 'USD', 'us-scorecard-fordham-university', null, null, 'year'),
  ('fordham-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Fordham University''s admissions / financial-aid pages.', null),
  ('fordham-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Fordham University''s admissions pages.', null),
  ('fordham-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Fordham University''s admissions pages.', null),
  ('fordham-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Fordham University''s financial-aid pages.', null),
  ('fordham-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Fordham University''s admissions pages.', null),
  ('fordham-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Fordham University''s admissions pages.', null),
  ('fordham-university', 'room_board'::public.university_fact_kind, '$24,090 / year (Scorecard 2023)', 24090, 'USD', 'us-scorecard-fordham-university', null, null, 'year'),
  ('fordham-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Fordham University''s financial-aid pages.', null),
  ('fordham-university', 'total_cost_of_attendance'::public.university_fact_kind, '$82,762 / year (Scorecard 2023)', 82762, 'USD', 'us-scorecard-fordham-university', null, null, 'year'),
  ('fordham-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Fordham University''s international admissions / financial-aid pages.', null),
  ('fordham-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 660–730; math 660–750 (Scorecard 2023); Middle-50% ACT 30–33 (Scorecard 2023)', null, null, 'us-scorecard-fordham-university', null, null, null),
  ('fordham-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Fordham University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('fordham-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Fordham University''s admissions pages.'),
  ('fordham-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Fordham University''s admissions pages.'),
  ('fordham-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Fordham University''s admissions pages.'),
  ('fordham-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 660–730; math 660–750 (Scorecard 2023)', null, 'us-scorecard-fordham-university', null, null),
  ('fordham-university', 'act'::public.requirement_kind, 'Middle-50% ACT 30–33 (Scorecard 2023)', null, 'us-scorecard-fordham-university', null, null),
  ('fordham-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Fordham University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #137: Stony Brook University (UNITID 196097)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-stony-brook-university', 'College Scorecard — Stony Brook University', 'https://collegescorecard.ed.gov/school/?196097-stony_brook_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('stony-brook-university', 'Stony Brook University', 'Stony Brook, New York', 'United States', '🇺🇸', 'Public four-year institution in Stony Brook, New York.',
  'Stony Brook University. College Scorecard (2023) reports out-of-state tuition $32,741 / year and a middle-50% SAT range Middle-50% SAT critical reading 650–730; math 680–770 (Scorecard 2023).', 'stony-brook-university', array[]::text[], 'us-scorecard-stony-brook-university', 137, 'us-4prep-ranking-scorecard-2023', 196097)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('stony-brook-university', 'tuition'::public.university_fact_kind, '$32,741 / year (Scorecard 2023)', 32741, 'USD', 'us-scorecard-stony-brook-university', null, null, 'year'),
  ('stony-brook-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Stony Brook University''s admissions / financial-aid pages.', null),
  ('stony-brook-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Stony Brook University''s admissions pages.', null),
  ('stony-brook-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Stony Brook University''s admissions pages.', null),
  ('stony-brook-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Stony Brook University''s financial-aid pages.', null),
  ('stony-brook-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Stony Brook University''s admissions pages.', null),
  ('stony-brook-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Stony Brook University''s admissions pages.', null),
  ('stony-brook-university', 'room_board'::public.university_fact_kind, '$18,196 / year (Scorecard 2023)', 18196, 'USD', 'us-scorecard-stony-brook-university', null, null, 'year'),
  ('stony-brook-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Stony Brook University''s financial-aid pages.', null),
  ('stony-brook-university', 'total_cost_of_attendance'::public.university_fact_kind, '$30,539 / year (Scorecard 2023)', 30539, 'USD', 'us-scorecard-stony-brook-university', null, null, 'year'),
  ('stony-brook-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Stony Brook University''s international admissions / financial-aid pages.', null),
  ('stony-brook-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 650–730; math 680–770 (Scorecard 2023); Middle-50% ACT 29–33 (Scorecard 2023)', null, null, 'us-scorecard-stony-brook-university', null, null, null),
  ('stony-brook-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Stony Brook University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('stony-brook-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Stony Brook University''s admissions pages.'),
  ('stony-brook-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Stony Brook University''s admissions pages.'),
  ('stony-brook-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Stony Brook University''s admissions pages.'),
  ('stony-brook-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 650–730; math 680–770 (Scorecard 2023)', null, 'us-scorecard-stony-brook-university', null, null),
  ('stony-brook-university', 'act'::public.requirement_kind, 'Middle-50% ACT 29–33 (Scorecard 2023)', null, 'us-scorecard-stony-brook-university', null, null),
  ('stony-brook-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Stony Brook University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #138: Purdue University-Main Campus (UNITID 243780)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-purdue-university-main-campus', 'College Scorecard — Purdue University-Main Campus', 'https://collegescorecard.ed.gov/school/?243780-purdue_university_main_campus', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('purdue-university-main-campus', 'Purdue University-Main Campus', 'West Lafayette, Indiana', 'United States', '🇺🇸', 'Public four-year institution in West Lafayette, Indiana.',
  'Purdue University-Main Campus. College Scorecard (2023) reports out-of-state tuition $28,794 / year and a middle-50% SAT range Middle-50% SAT critical reading 600–720; math 600–760 (Scorecard 2023).', 'purdue-university-main-campus', array[]::text[], 'us-scorecard-purdue-university-main-campus', 138, 'us-4prep-ranking-scorecard-2023', 243780)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('purdue-university-main-campus', 'tuition'::public.university_fact_kind, '$28,794 / year (Scorecard 2023)', 28794, 'USD', 'us-scorecard-purdue-university-main-campus', null, null, 'year'),
  ('purdue-university-main-campus', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Purdue University-Main Campus''s admissions / financial-aid pages.', null),
  ('purdue-university-main-campus', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Purdue University-Main Campus''s admissions pages.', null),
  ('purdue-university-main-campus', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Purdue University-Main Campus''s admissions pages.', null),
  ('purdue-university-main-campus', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Purdue University-Main Campus''s financial-aid pages.', null),
  ('purdue-university-main-campus', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Purdue University-Main Campus''s admissions pages.', null),
  ('purdue-university-main-campus', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Purdue University-Main Campus''s admissions pages.', null),
  ('purdue-university-main-campus', 'room_board'::public.university_fact_kind, '$12,820 / year (Scorecard 2023)', 12820, 'USD', 'us-scorecard-purdue-university-main-campus', null, null, 'year'),
  ('purdue-university-main-campus', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Purdue University-Main Campus''s financial-aid pages.', null),
  ('purdue-university-main-campus', 'total_cost_of_attendance'::public.university_fact_kind, '$24,591 / year (Scorecard 2023)', 24591, 'USD', 'us-scorecard-purdue-university-main-campus', null, null, 'year'),
  ('purdue-university-main-campus', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Purdue University-Main Campus''s international admissions / financial-aid pages.', null),
  ('purdue-university-main-campus', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 600–720; math 600–760 (Scorecard 2023); Middle-50% ACT 27–34 (Scorecard 2023)', null, null, 'us-scorecard-purdue-university-main-campus', null, null, null),
  ('purdue-university-main-campus', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Purdue University-Main Campus''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('purdue-university-main-campus', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Purdue University-Main Campus''s admissions pages.'),
  ('purdue-university-main-campus', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Purdue University-Main Campus''s admissions pages.'),
  ('purdue-university-main-campus', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Purdue University-Main Campus''s admissions pages.'),
  ('purdue-university-main-campus', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 600–720; math 600–760 (Scorecard 2023)', null, 'us-scorecard-purdue-university-main-campus', null, null),
  ('purdue-university-main-campus', 'act'::public.requirement_kind, 'Middle-50% ACT 27–34 (Scorecard 2023)', null, 'us-scorecard-purdue-university-main-campus', null, null),
  ('purdue-university-main-campus', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Purdue University-Main Campus''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #139: Yeshiva University (UNITID 197708)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-yeshiva-university', 'College Scorecard — Yeshiva University', 'https://collegescorecard.ed.gov/school/?197708-yeshiva_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('yeshiva-university', 'Yeshiva University', 'New York, New York', 'United States', '🇺🇸', 'Private four-year institution in New York, New York.',
  'Yeshiva University. College Scorecard (2023) reports out-of-state tuition $51,800 / year and a middle-50% SAT range Middle-50% SAT critical reading 670–740; math 670–770 (Scorecard 2023).', 'yeshiva-university', array[]::text[], 'us-scorecard-yeshiva-university', 139, 'us-4prep-ranking-scorecard-2023', 197708)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('yeshiva-university', 'tuition'::public.university_fact_kind, '$51,800 / year (Scorecard 2023)', 51800, 'USD', 'us-scorecard-yeshiva-university', null, null, 'year'),
  ('yeshiva-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Yeshiva University''s admissions / financial-aid pages.', null),
  ('yeshiva-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Yeshiva University''s admissions pages.', null),
  ('yeshiva-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Yeshiva University''s admissions pages.', null),
  ('yeshiva-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Yeshiva University''s financial-aid pages.', null),
  ('yeshiva-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Yeshiva University''s admissions pages.', null),
  ('yeshiva-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Yeshiva University''s admissions pages.', null),
  ('yeshiva-university', 'room_board'::public.university_fact_kind, '$15,750 / year (Scorecard 2023)', 15750, 'USD', 'us-scorecard-yeshiva-university', null, null, 'year'),
  ('yeshiva-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Yeshiva University''s financial-aid pages.', null),
  ('yeshiva-university', 'total_cost_of_attendance'::public.university_fact_kind, '$70,892 / year (Scorecard 2023)', 70892, 'USD', 'us-scorecard-yeshiva-university', null, null, 'year'),
  ('yeshiva-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Yeshiva University''s international admissions / financial-aid pages.', null),
  ('yeshiva-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 670–740; math 670–770 (Scorecard 2023); Middle-50% ACT 29–33 (Scorecard 2023)', null, null, 'us-scorecard-yeshiva-university', null, null, null),
  ('yeshiva-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Yeshiva University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('yeshiva-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Yeshiva University''s admissions pages.'),
  ('yeshiva-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Yeshiva University''s admissions pages.'),
  ('yeshiva-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Yeshiva University''s admissions pages.'),
  ('yeshiva-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 670–740; math 670–770 (Scorecard 2023)', null, 'us-scorecard-yeshiva-university', null, null),
  ('yeshiva-university', 'act'::public.requirement_kind, 'Middle-50% ACT 29–33 (Scorecard 2023)', null, 'us-scorecard-yeshiva-university', null, null),
  ('yeshiva-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Yeshiva University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #140: Rutgers University-New Brunswick (UNITID 186380)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-rutgers-university-new-brunswick', 'College Scorecard — Rutgers University-New Brunswick', 'https://collegescorecard.ed.gov/school/?186380-rutgers_university_new_brunswick', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('rutgers-university-new-brunswick', 'Rutgers University-New Brunswick', 'New Brunswick, New Jersey', 'United States', '🇺🇸', 'Public four-year institution in New Brunswick, New Jersey.',
  'Rutgers University-New Brunswick. College Scorecard (2023) reports out-of-state tuition $37,441 / year and a middle-50% SAT range Middle-50% SAT critical reading 650–730; math 660–770 (Scorecard 2023).', 'rutgers-university-new-brunswick', array[]::text[], 'us-scorecard-rutgers-university-new-brunswick', 140, 'us-4prep-ranking-scorecard-2023', 186380)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('rutgers-university-new-brunswick', 'tuition'::public.university_fact_kind, '$37,441 / year (Scorecard 2023)', 37441, 'USD', 'us-scorecard-rutgers-university-new-brunswick', null, null, 'year'),
  ('rutgers-university-new-brunswick', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Rutgers University-New Brunswick''s admissions / financial-aid pages.', null),
  ('rutgers-university-new-brunswick', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Rutgers University-New Brunswick''s admissions pages.', null),
  ('rutgers-university-new-brunswick', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Rutgers University-New Brunswick''s admissions pages.', null),
  ('rutgers-university-new-brunswick', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Rutgers University-New Brunswick''s financial-aid pages.', null),
  ('rutgers-university-new-brunswick', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Rutgers University-New Brunswick''s admissions pages.', null),
  ('rutgers-university-new-brunswick', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Rutgers University-New Brunswick''s admissions pages.', null),
  ('rutgers-university-new-brunswick', 'room_board'::public.university_fact_kind, '$15,714 / year (Scorecard 2023)', 15714, 'USD', 'us-scorecard-rutgers-university-new-brunswick', null, null, 'year'),
  ('rutgers-university-new-brunswick', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Rutgers University-New Brunswick''s financial-aid pages.', null),
  ('rutgers-university-new-brunswick', 'total_cost_of_attendance'::public.university_fact_kind, '$36,993 / year (Scorecard 2023)', 36993, 'USD', 'us-scorecard-rutgers-university-new-brunswick', null, null, 'year'),
  ('rutgers-university-new-brunswick', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Rutgers University-New Brunswick''s international admissions / financial-aid pages.', null),
  ('rutgers-university-new-brunswick', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 650–730; math 660–770 (Scorecard 2023); Middle-50% ACT 28–33 (Scorecard 2023)', null, null, 'us-scorecard-rutgers-university-new-brunswick', null, null, null),
  ('rutgers-university-new-brunswick', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Rutgers University-New Brunswick''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('rutgers-university-new-brunswick', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Rutgers University-New Brunswick''s admissions pages.'),
  ('rutgers-university-new-brunswick', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Rutgers University-New Brunswick''s admissions pages.'),
  ('rutgers-university-new-brunswick', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Rutgers University-New Brunswick''s admissions pages.'),
  ('rutgers-university-new-brunswick', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 650–730; math 660–770 (Scorecard 2023)', null, 'us-scorecard-rutgers-university-new-brunswick', null, null),
  ('rutgers-university-new-brunswick', 'act'::public.requirement_kind, 'Middle-50% ACT 28–33 (Scorecard 2023)', null, 'us-scorecard-rutgers-university-new-brunswick', null, null),
  ('rutgers-university-new-brunswick', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Rutgers University-New Brunswick''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #141: Furman University (UNITID 218070)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-furman-university', 'College Scorecard — Furman University', 'https://collegescorecard.ed.gov/school/?218070-furman_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('furman-university', 'Furman University', 'Greenville, South Carolina', 'United States', '🇺🇸', 'Private four-year institution in Greenville, South Carolina.',
  'Furman University. College Scorecard (2023) reports out-of-state tuition $59,770 / year and a middle-50% SAT range Middle-50% SAT critical reading 650–720; math 610–710 (Scorecard 2023).', 'furman-university', array[]::text[], 'us-scorecard-furman-university', 141, 'us-4prep-ranking-scorecard-2023', 218070)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('furman-university', 'tuition'::public.university_fact_kind, '$59,770 / year (Scorecard 2023)', 59770, 'USD', 'us-scorecard-furman-university', null, null, 'year'),
  ('furman-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Furman University''s admissions / financial-aid pages.', null),
  ('furman-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Furman University''s admissions pages.', null),
  ('furman-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Furman University''s admissions pages.', null),
  ('furman-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Furman University''s financial-aid pages.', null),
  ('furman-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Furman University''s admissions pages.', null),
  ('furman-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Furman University''s admissions pages.', null),
  ('furman-university', 'room_board'::public.university_fact_kind, '$16,504 / year (Scorecard 2023)', 16504, 'USD', 'us-scorecard-furman-university', null, null, 'year'),
  ('furman-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Furman University''s financial-aid pages.', null),
  ('furman-university', 'total_cost_of_attendance'::public.university_fact_kind, '$76,798 / year (Scorecard 2023)', 76798, 'USD', 'us-scorecard-furman-university', null, null, 'year'),
  ('furman-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Furman University''s international admissions / financial-aid pages.', null),
  ('furman-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 650–720; math 610–710 (Scorecard 2023); Middle-50% ACT 28–32 (Scorecard 2023)', null, null, 'us-scorecard-furman-university', null, null, null),
  ('furman-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Furman University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('furman-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Furman University''s admissions pages.'),
  ('furman-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Furman University''s admissions pages.'),
  ('furman-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Furman University''s admissions pages.'),
  ('furman-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 650–720; math 610–710 (Scorecard 2023)', null, 'us-scorecard-furman-university', null, null),
  ('furman-university', 'act'::public.requirement_kind, 'Middle-50% ACT 28–32 (Scorecard 2023)', null, 'us-scorecard-furman-university', null, null),
  ('furman-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Furman University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #142: University of Connecticut (UNITID 129020)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-connecticut', 'College Scorecard — University of Connecticut', 'https://collegescorecard.ed.gov/school/?129020-university_of_connecticut', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-connecticut', 'University of Connecticut', 'Storrs, Connecticut', 'United States', '🇺🇸', 'Public four-year institution in Storrs, Connecticut.',
  'University of Connecticut. College Scorecard (2023) reports out-of-state tuition $43,712 / year and a middle-50% SAT range Middle-50% SAT critical reading 610–710; math 600–730 (Scorecard 2023).', 'university-of-connecticut', array[]::text[], 'us-scorecard-university-of-connecticut', 142, 'us-4prep-ranking-scorecard-2023', 129020)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-connecticut', 'tuition'::public.university_fact_kind, '$43,712 / year (Scorecard 2023)', 43712, 'USD', 'us-scorecard-university-of-connecticut', null, null, 'year'),
  ('university-of-connecticut', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of Connecticut''s admissions / financial-aid pages.', null),
  ('university-of-connecticut', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of Connecticut''s admissions pages.', null),
  ('university-of-connecticut', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of Connecticut''s admissions pages.', null),
  ('university-of-connecticut', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of Connecticut''s financial-aid pages.', null),
  ('university-of-connecticut', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of Connecticut''s admissions pages.', null),
  ('university-of-connecticut', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of Connecticut''s admissions pages.', null),
  ('university-of-connecticut', 'room_board'::public.university_fact_kind, '$14,380 / year (Scorecard 2023)', 14380, 'USD', 'us-scorecard-university-of-connecticut', null, null, 'year'),
  ('university-of-connecticut', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of Connecticut''s financial-aid pages.', null),
  ('university-of-connecticut', 'total_cost_of_attendance'::public.university_fact_kind, '$39,426 / year (Scorecard 2023)', 39426, 'USD', 'us-scorecard-university-of-connecticut', null, null, 'year'),
  ('university-of-connecticut', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of Connecticut''s international admissions / financial-aid pages.', null),
  ('university-of-connecticut', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 610–710; math 600–730 (Scorecard 2023); Middle-50% ACT 28–33 (Scorecard 2023)', null, null, 'us-scorecard-university-of-connecticut', null, null, null),
  ('university-of-connecticut', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of Connecticut''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-connecticut', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of Connecticut''s admissions pages.'),
  ('university-of-connecticut', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of Connecticut''s admissions pages.'),
  ('university-of-connecticut', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of Connecticut''s admissions pages.'),
  ('university-of-connecticut', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 610–710; math 600–730 (Scorecard 2023)', null, 'us-scorecard-university-of-connecticut', null, null),
  ('university-of-connecticut', 'act'::public.requirement_kind, 'Middle-50% ACT 28–33 (Scorecard 2023)', null, 'us-scorecard-university-of-connecticut', null, null),
  ('university-of-connecticut', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of Connecticut''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #143: Pepperdine University (UNITID 121150)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-pepperdine-university', 'College Scorecard — Pepperdine University', 'https://collegescorecard.ed.gov/school/?121150-pepperdine_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('pepperdine-university', 'Pepperdine University', 'Malibu, California', 'United States', '🇺🇸', 'Private four-year institution in Malibu, California.',
  'Pepperdine University. College Scorecard (2023) reports out-of-state tuition $69,918 / year and a middle-50% SAT range Middle-50% SAT critical reading 650–710; math 640–740 (Scorecard 2023).', 'pepperdine-university', array[]::text[], 'us-scorecard-pepperdine-university', 143, 'us-4prep-ranking-scorecard-2023', 121150)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('pepperdine-university', 'tuition'::public.university_fact_kind, '$69,918 / year (Scorecard 2023)', 69918, 'USD', 'us-scorecard-pepperdine-university', null, null, 'year'),
  ('pepperdine-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Pepperdine University''s admissions / financial-aid pages.', null),
  ('pepperdine-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Pepperdine University''s admissions pages.', null),
  ('pepperdine-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Pepperdine University''s admissions pages.', null),
  ('pepperdine-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Pepperdine University''s financial-aid pages.', null),
  ('pepperdine-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Pepperdine University''s admissions pages.', null),
  ('pepperdine-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Pepperdine University''s admissions pages.', null),
  ('pepperdine-university', 'room_board'::public.university_fact_kind, '$21,750 / year (Scorecard 2023)', 21750, 'USD', 'us-scorecard-pepperdine-university', null, null, 'year'),
  ('pepperdine-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Pepperdine University''s financial-aid pages.', null),
  ('pepperdine-university', 'total_cost_of_attendance'::public.university_fact_kind, '$93,512 / year (Scorecard 2023)', 93512, 'USD', 'us-scorecard-pepperdine-university', null, null, 'year'),
  ('pepperdine-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Pepperdine University''s international admissions / financial-aid pages.', null),
  ('pepperdine-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 650–710; math 640–740 (Scorecard 2023); Middle-50% ACT 29–32 (Scorecard 2023)', null, null, 'us-scorecard-pepperdine-university', null, null, null),
  ('pepperdine-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Pepperdine University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('pepperdine-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Pepperdine University''s admissions pages.'),
  ('pepperdine-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Pepperdine University''s admissions pages.'),
  ('pepperdine-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Pepperdine University''s admissions pages.'),
  ('pepperdine-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 650–710; math 640–740 (Scorecard 2023)', null, 'us-scorecard-pepperdine-university', null, null),
  ('pepperdine-university', 'act'::public.requirement_kind, 'Middle-50% ACT 29–32 (Scorecard 2023)', null, 'us-scorecard-pepperdine-university', null, null),
  ('pepperdine-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Pepperdine University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #144: Southern Methodist University (UNITID 228246)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-southern-methodist-university', 'College Scorecard — Southern Methodist University', 'https://collegescorecard.ed.gov/school/?228246-southern_methodist_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('southern-methodist-university', 'Southern Methodist University', 'Dallas, Texas', 'United States', '🇺🇸', 'Private four-year institution in Dallas, Texas.',
  'Southern Methodist University. College Scorecard (2023) reports out-of-state tuition $67,040 / year and a middle-50% SAT range Middle-50% SAT critical reading 670–740; math 670–750 (Scorecard 2023).', 'southern-methodist-university', array[]::text[], 'us-scorecard-southern-methodist-university', 144, 'us-4prep-ranking-scorecard-2023', 228246)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('southern-methodist-university', 'tuition'::public.university_fact_kind, '$67,040 / year (Scorecard 2023)', 67040, 'USD', 'us-scorecard-southern-methodist-university', null, null, 'year'),
  ('southern-methodist-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Southern Methodist University''s admissions / financial-aid pages.', null),
  ('southern-methodist-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Southern Methodist University''s admissions pages.', null),
  ('southern-methodist-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Southern Methodist University''s admissions pages.', null),
  ('southern-methodist-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Southern Methodist University''s financial-aid pages.', null),
  ('southern-methodist-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Southern Methodist University''s admissions pages.', null),
  ('southern-methodist-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Southern Methodist University''s admissions pages.', null),
  ('southern-methodist-university', 'room_board'::public.university_fact_kind, '$19,064 / year (Scorecard 2023)', 19064, 'USD', 'us-scorecard-southern-methodist-university', null, null, 'year'),
  ('southern-methodist-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Southern Methodist University''s financial-aid pages.', null),
  ('southern-methodist-university', 'total_cost_of_attendance'::public.university_fact_kind, '$85,606 / year (Scorecard 2023)', 85606, 'USD', 'us-scorecard-southern-methodist-university', null, null, 'year'),
  ('southern-methodist-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Southern Methodist University''s international admissions / financial-aid pages.', null),
  ('southern-methodist-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 670–740; math 670–750 (Scorecard 2023); Middle-50% ACT 30–34 (Scorecard 2023)', null, null, 'us-scorecard-southern-methodist-university', null, null, null),
  ('southern-methodist-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Southern Methodist University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('southern-methodist-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Southern Methodist University''s admissions pages.'),
  ('southern-methodist-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Southern Methodist University''s admissions pages.'),
  ('southern-methodist-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Southern Methodist University''s admissions pages.'),
  ('southern-methodist-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 670–740; math 670–750 (Scorecard 2023)', null, 'us-scorecard-southern-methodist-university', null, null),
  ('southern-methodist-university', 'act'::public.requirement_kind, 'Middle-50% ACT 30–34 (Scorecard 2023)', null, 'us-scorecard-southern-methodist-university', null, null),
  ('southern-methodist-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Southern Methodist University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #145: Reed College (UNITID 209922)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-reed-college', 'College Scorecard — Reed College', 'https://collegescorecard.ed.gov/school/?209922-reed_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('reed-college', 'Reed College', 'Portland, Oregon', 'United States', '🇺🇸', 'Private four-year institution in Portland, Oregon.',
  'Reed College. College Scorecard (2023) reports out-of-state tuition $69,350 / year and a middle-50% SAT range Middle-50% SAT critical reading 680–750; math 610–770 (Scorecard 2023).', 'reed-college', array[]::text[], 'us-scorecard-reed-college', 145, 'us-4prep-ranking-scorecard-2023', 209922)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('reed-college', 'tuition'::public.university_fact_kind, '$69,350 / year (Scorecard 2023)', 69350, 'USD', 'us-scorecard-reed-college', null, null, 'year'),
  ('reed-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Reed College''s admissions / financial-aid pages.', null),
  ('reed-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Reed College''s admissions pages.', null),
  ('reed-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Reed College''s admissions pages.', null),
  ('reed-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Reed College''s financial-aid pages.', null),
  ('reed-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Reed College''s admissions pages.', null),
  ('reed-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Reed College''s admissions pages.', null),
  ('reed-college', 'room_board'::public.university_fact_kind, '$17,660 / year (Scorecard 2023)', 17660, 'USD', 'us-scorecard-reed-college', null, null, 'year'),
  ('reed-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Reed College''s financial-aid pages.', null),
  ('reed-college', 'total_cost_of_attendance'::public.university_fact_kind, '$86,376 / year (Scorecard 2023)', 86376, 'USD', 'us-scorecard-reed-college', null, null, 'year'),
  ('reed-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Reed College''s international admissions / financial-aid pages.', null),
  ('reed-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 680–750; math 610–770 (Scorecard 2023); Middle-50% ACT 30–34 (Scorecard 2023)', null, null, 'us-scorecard-reed-college', null, null, null),
  ('reed-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Reed College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('reed-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Reed College''s admissions pages.'),
  ('reed-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Reed College''s admissions pages.'),
  ('reed-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Reed College''s admissions pages.'),
  ('reed-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 680–750; math 610–770 (Scorecard 2023)', null, 'us-scorecard-reed-college', null, null),
  ('reed-college', 'act'::public.requirement_kind, 'Middle-50% ACT 30–34 (Scorecard 2023)', null, 'us-scorecard-reed-college', null, null),
  ('reed-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Reed College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #146: Florida State University (UNITID 134097)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-florida-state-university', 'College Scorecard — Florida State University', 'https://collegescorecard.ed.gov/school/?134097-florida_state_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('florida-state-university', 'Florida State University', 'Tallahassee, Florida', 'United States', '🇺🇸', 'Public four-year institution in Tallahassee, Florida.',
  'Florida State University. College Scorecard (2023) reports out-of-state tuition $18,786 / year and a middle-50% SAT range Middle-50% SAT critical reading 640–710; math 630–700 (Scorecard 2023).', 'florida-state-university', array[]::text[], 'us-scorecard-florida-state-university', 146, 'us-4prep-ranking-scorecard-2023', 134097)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('florida-state-university', 'tuition'::public.university_fact_kind, '$18,786 / year (Scorecard 2023)', 18786, 'USD', 'us-scorecard-florida-state-university', null, null, 'year'),
  ('florida-state-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Florida State University''s admissions / financial-aid pages.', null),
  ('florida-state-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Florida State University''s admissions pages.', null),
  ('florida-state-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Florida State University''s admissions pages.', null),
  ('florida-state-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Florida State University''s financial-aid pages.', null),
  ('florida-state-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Florida State University''s admissions pages.', null),
  ('florida-state-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Florida State University''s admissions pages.', null),
  ('florida-state-university', 'room_board'::public.university_fact_kind, '$13,474 / year (Scorecard 2023)', 13474, 'USD', 'us-scorecard-florida-state-university', null, null, 'year'),
  ('florida-state-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Florida State University''s financial-aid pages.', null),
  ('florida-state-university', 'total_cost_of_attendance'::public.university_fact_kind, '$25,720 / year (Scorecard 2023)', 25720, 'USD', 'us-scorecard-florida-state-university', null, null, 'year'),
  ('florida-state-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Florida State University''s international admissions / financial-aid pages.', null),
  ('florida-state-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 640–710; math 630–700 (Scorecard 2023); Middle-50% ACT 29–32 (Scorecard 2023)', null, null, 'us-scorecard-florida-state-university', null, null, null),
  ('florida-state-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Florida State University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('florida-state-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Florida State University''s admissions pages.'),
  ('florida-state-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Florida State University''s admissions pages.'),
  ('florida-state-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Florida State University''s admissions pages.'),
  ('florida-state-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 640–710; math 630–700 (Scorecard 2023)', null, 'us-scorecard-florida-state-university', null, null),
  ('florida-state-university', 'act'::public.requirement_kind, 'Middle-50% ACT 29–32 (Scorecard 2023)', null, 'us-scorecard-florida-state-university', null, null),
  ('florida-state-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Florida State University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #147: University of Massachusetts-Amherst (UNITID 166629)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-massachusetts-amherst', 'College Scorecard — University of Massachusetts-Amherst', 'https://collegescorecard.ed.gov/school/?166629-university_of_massachusetts_amherst', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-massachusetts-amherst', 'University of Massachusetts-Amherst', 'Amherst, Massachusetts', 'United States', '🇺🇸', 'Public four-year institution in Amherst, Massachusetts.',
  'University of Massachusetts-Amherst. College Scorecard (2023) reports out-of-state tuition $40,449 / year and a middle-50% SAT range Middle-50% SAT critical reading 650–730; math 660–770 (Scorecard 2023).', 'university-of-massachusetts-amherst', array[]::text[], 'us-scorecard-university-of-massachusetts-amherst', 147, 'us-4prep-ranking-scorecard-2023', 166629)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-massachusetts-amherst', 'tuition'::public.university_fact_kind, '$40,449 / year (Scorecard 2023)', 40449, 'USD', 'us-scorecard-university-of-massachusetts-amherst', null, null, 'year'),
  ('university-of-massachusetts-amherst', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of Massachusetts-Amherst''s admissions / financial-aid pages.', null),
  ('university-of-massachusetts-amherst', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of Massachusetts-Amherst''s admissions pages.', null),
  ('university-of-massachusetts-amherst', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of Massachusetts-Amherst''s admissions pages.', null),
  ('university-of-massachusetts-amherst', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of Massachusetts-Amherst''s financial-aid pages.', null),
  ('university-of-massachusetts-amherst', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of Massachusetts-Amherst''s admissions pages.', null),
  ('university-of-massachusetts-amherst', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of Massachusetts-Amherst''s admissions pages.', null),
  ('university-of-massachusetts-amherst', 'room_board'::public.university_fact_kind, '$16,710 / year (Scorecard 2023)', 16710, 'USD', 'us-scorecard-university-of-massachusetts-amherst', null, null, 'year'),
  ('university-of-massachusetts-amherst', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of Massachusetts-Amherst''s financial-aid pages.', null),
  ('university-of-massachusetts-amherst', 'total_cost_of_attendance'::public.university_fact_kind, '$34,549 / year (Scorecard 2023)', 34549, 'USD', 'us-scorecard-university-of-massachusetts-amherst', null, null, 'year'),
  ('university-of-massachusetts-amherst', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of Massachusetts-Amherst''s international admissions / financial-aid pages.', null),
  ('university-of-massachusetts-amherst', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 650–730; math 660–770 (Scorecard 2023); Middle-50% ACT 30–33 (Scorecard 2023)', null, null, 'us-scorecard-university-of-massachusetts-amherst', null, null, null),
  ('university-of-massachusetts-amherst', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of Massachusetts-Amherst''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-massachusetts-amherst', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of Massachusetts-Amherst''s admissions pages.'),
  ('university-of-massachusetts-amherst', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of Massachusetts-Amherst''s admissions pages.'),
  ('university-of-massachusetts-amherst', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of Massachusetts-Amherst''s admissions pages.'),
  ('university-of-massachusetts-amherst', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 650–730; math 660–770 (Scorecard 2023)', null, 'us-scorecard-university-of-massachusetts-amherst', null, null),
  ('university-of-massachusetts-amherst', 'act'::public.requirement_kind, 'Middle-50% ACT 30–33 (Scorecard 2023)', null, 'us-scorecard-university-of-massachusetts-amherst', null, null),
  ('university-of-massachusetts-amherst', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of Massachusetts-Amherst''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #148: St Olaf College (UNITID 174844)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-st-olaf-college', 'College Scorecard — St Olaf College', 'https://collegescorecard.ed.gov/school/?174844-st_olaf_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('st-olaf-college', 'St Olaf College', 'Northfield, Minnesota', 'United States', '🇺🇸', 'Private four-year institution in Northfield, Minnesota.',
  'St Olaf College. College Scorecard (2023) reports out-of-state tuition $59,760 / year and a middle-50% SAT range Middle-50% SAT critical reading 660–740; math 640–730 (Scorecard 2023).', 'st-olaf-college', array[]::text[], 'us-scorecard-st-olaf-college', 148, 'us-4prep-ranking-scorecard-2023', 174844)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('st-olaf-college', 'tuition'::public.university_fact_kind, '$59,760 / year (Scorecard 2023)', 59760, 'USD', 'us-scorecard-st-olaf-college', null, null, 'year'),
  ('st-olaf-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check St Olaf College''s admissions / financial-aid pages.', null),
  ('st-olaf-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check St Olaf College''s admissions pages.', null),
  ('st-olaf-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check St Olaf College''s admissions pages.', null),
  ('st-olaf-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check St Olaf College''s financial-aid pages.', null),
  ('st-olaf-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check St Olaf College''s admissions pages.', null),
  ('st-olaf-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check St Olaf College''s admissions pages.', null),
  ('st-olaf-college', 'room_board'::public.university_fact_kind, '$13,630 / year (Scorecard 2023)', 13630, 'USD', 'us-scorecard-st-olaf-college', null, null, 'year'),
  ('st-olaf-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check St Olaf College''s financial-aid pages.', null),
  ('st-olaf-college', 'total_cost_of_attendance'::public.university_fact_kind, '$71,843 / year (Scorecard 2023)', 71843, 'USD', 'us-scorecard-st-olaf-college', null, null, 'year'),
  ('st-olaf-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check St Olaf College''s international admissions / financial-aid pages.', null),
  ('st-olaf-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 660–740; math 640–730 (Scorecard 2023); Middle-50% ACT 28–32 (Scorecard 2023)', null, null, 'us-scorecard-st-olaf-college', null, null, null),
  ('st-olaf-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask St Olaf College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('st-olaf-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check St Olaf College''s admissions pages.'),
  ('st-olaf-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check St Olaf College''s admissions pages.'),
  ('st-olaf-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check St Olaf College''s admissions pages.'),
  ('st-olaf-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 660–740; math 640–730 (Scorecard 2023)', null, 'us-scorecard-st-olaf-college', null, null),
  ('st-olaf-college', 'act'::public.requirement_kind, 'Middle-50% ACT 28–32 (Scorecard 2023)', null, 'us-scorecard-st-olaf-college', null, null),
  ('st-olaf-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check St Olaf College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #149: San Diego State University (UNITID 122409)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-san-diego-state-university', 'College Scorecard — San Diego State University', 'https://collegescorecard.ed.gov/school/?122409-san_diego_state_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('san-diego-state-university', 'San Diego State University', 'San Diego, California', 'United States', '🇺🇸', 'Public four-year institution in San Diego, California.',
  'San Diego State University. College Scorecard (2023) reports out-of-state tuition $21,328 / year and a middle-50% SAT range not reported.', 'san-diego-state-university', array[]::text[], 'us-scorecard-san-diego-state-university', 149, 'us-4prep-ranking-scorecard-2023', 122409)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('san-diego-state-university', 'tuition'::public.university_fact_kind, '$21,328 / year (Scorecard 2023)', 21328, 'USD', 'us-scorecard-san-diego-state-university', null, null, 'year'),
  ('san-diego-state-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check San Diego State University''s admissions / financial-aid pages.', null),
  ('san-diego-state-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check San Diego State University''s admissions pages.', null),
  ('san-diego-state-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check San Diego State University''s admissions pages.', null),
  ('san-diego-state-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check San Diego State University''s financial-aid pages.', null),
  ('san-diego-state-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check San Diego State University''s admissions pages.', null),
  ('san-diego-state-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check San Diego State University''s admissions pages.', null),
  ('san-diego-state-university', 'room_board'::public.university_fact_kind, '$23,030 / year (Scorecard 2023)', 23030, 'USD', 'us-scorecard-san-diego-state-university', null, null, 'year'),
  ('san-diego-state-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check San Diego State University''s financial-aid pages.', null),
  ('san-diego-state-university', 'total_cost_of_attendance'::public.university_fact_kind, '$27,780 / year (Scorecard 2023)', 27780, 'USD', 'us-scorecard-san-diego-state-university', null, null, 'year'),
  ('san-diego-state-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check San Diego State University''s international admissions / financial-aid pages.', null),
  ('san-diego-state-university', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check San Diego State University''s admissions pages.', null),
  ('san-diego-state-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask San Diego State University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('san-diego-state-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check San Diego State University''s admissions pages.'),
  ('san-diego-state-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check San Diego State University''s admissions pages.'),
  ('san-diego-state-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check San Diego State University''s admissions pages.'),
  ('san-diego-state-university', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check San Diego State University''s admissions pages.'),
  ('san-diego-state-university', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check San Diego State University''s admissions pages.'),
  ('san-diego-state-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check San Diego State University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #150: Texas Christian University (UNITID 228875)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-texas-christian-university', 'College Scorecard — Texas Christian University', 'https://collegescorecard.ed.gov/school/?228875-texas_christian_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('texas-christian-university', 'Texas Christian University', 'Fort Worth, Texas', 'United States', '🇺🇸', 'Private four-year institution in Fort Worth, Texas.',
  'Texas Christian University. College Scorecard (2023) reports out-of-state tuition $61,740 / year and a middle-50% SAT range Middle-50% SAT critical reading 580–680; math 560–670 (Scorecard 2023).', 'texas-christian-university', array[]::text[], 'us-scorecard-texas-christian-university', 150, 'us-4prep-ranking-scorecard-2023', 228875)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('texas-christian-university', 'tuition'::public.university_fact_kind, '$61,740 / year (Scorecard 2023)', 61740, 'USD', 'us-scorecard-texas-christian-university', null, null, 'year'),
  ('texas-christian-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Texas Christian University''s admissions / financial-aid pages.', null),
  ('texas-christian-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Texas Christian University''s admissions pages.', null),
  ('texas-christian-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Texas Christian University''s admissions pages.', null),
  ('texas-christian-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Texas Christian University''s financial-aid pages.', null),
  ('texas-christian-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Texas Christian University''s admissions pages.', null),
  ('texas-christian-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Texas Christian University''s admissions pages.', null),
  ('texas-christian-university', 'room_board'::public.university_fact_kind, '$16,700 / year (Scorecard 2023)', 16700, 'USD', 'us-scorecard-texas-christian-university', null, null, 'year'),
  ('texas-christian-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Texas Christian University''s financial-aid pages.', null),
  ('texas-christian-university', 'total_cost_of_attendance'::public.university_fact_kind, '$76,604 / year (Scorecard 2023)', 76604, 'USD', 'us-scorecard-texas-christian-university', null, null, 'year'),
  ('texas-christian-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Texas Christian University''s international admissions / financial-aid pages.', null),
  ('texas-christian-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 580–680; math 560–670 (Scorecard 2023); Middle-50% ACT 26–31 (Scorecard 2023)', null, null, 'us-scorecard-texas-christian-university', null, null, null),
  ('texas-christian-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Texas Christian University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('texas-christian-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Texas Christian University''s admissions pages.'),
  ('texas-christian-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Texas Christian University''s admissions pages.'),
  ('texas-christian-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Texas Christian University''s admissions pages.'),
  ('texas-christian-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 580–680; math 560–670 (Scorecard 2023)', null, 'us-scorecard-texas-christian-university', null, null),
  ('texas-christian-university', 'act'::public.requirement_kind, 'Middle-50% ACT 26–31 (Scorecard 2023)', null, 'us-scorecard-texas-christian-university', null, null),
  ('texas-christian-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Texas Christian University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #151: Rhodes College (UNITID 221351)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-rhodes-college', 'College Scorecard — Rhodes College', 'https://collegescorecard.ed.gov/school/?221351-rhodes_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('rhodes-college', 'Rhodes College', 'Memphis, Tennessee', 'United States', '🇺🇸', 'Private four-year institution in Memphis, Tennessee.',
  'Rhodes College. College Scorecard (2023) reports out-of-state tuition $57,110 / year and a middle-50% SAT range Middle-50% SAT critical reading 650–733; math 650–753 (Scorecard 2023).', 'rhodes-college', array[]::text[], 'us-scorecard-rhodes-college', 151, 'us-4prep-ranking-scorecard-2023', 221351)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('rhodes-college', 'tuition'::public.university_fact_kind, '$57,110 / year (Scorecard 2023)', 57110, 'USD', 'us-scorecard-rhodes-college', null, null, 'year'),
  ('rhodes-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Rhodes College''s admissions / financial-aid pages.', null),
  ('rhodes-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Rhodes College''s admissions pages.', null),
  ('rhodes-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Rhodes College''s admissions pages.', null),
  ('rhodes-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Rhodes College''s financial-aid pages.', null),
  ('rhodes-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Rhodes College''s admissions pages.', null),
  ('rhodes-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Rhodes College''s admissions pages.', null),
  ('rhodes-college', 'room_board'::public.university_fact_kind, '$13,620 / year (Scorecard 2023)', 13620, 'USD', 'us-scorecard-rhodes-college', null, null, 'year'),
  ('rhodes-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Rhodes College''s financial-aid pages.', null),
  ('rhodes-college', 'total_cost_of_attendance'::public.university_fact_kind, '$71,136 / year (Scorecard 2023)', 71136, 'USD', 'us-scorecard-rhodes-college', null, null, 'year'),
  ('rhodes-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Rhodes College''s international admissions / financial-aid pages.', null),
  ('rhodes-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 650–733; math 650–753 (Scorecard 2023); Middle-50% ACT 26–32 (Scorecard 2023)', null, null, 'us-scorecard-rhodes-college', null, null, null),
  ('rhodes-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Rhodes College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('rhodes-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Rhodes College''s admissions pages.'),
  ('rhodes-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Rhodes College''s admissions pages.'),
  ('rhodes-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Rhodes College''s admissions pages.'),
  ('rhodes-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 650–733; math 650–753 (Scorecard 2023)', null, 'us-scorecard-rhodes-college', null, null),
  ('rhodes-college', 'act'::public.requirement_kind, 'Middle-50% ACT 26–32 (Scorecard 2023)', null, 'us-scorecard-rhodes-college', null, null),
  ('rhodes-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Rhodes College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #152: Mount Holyoke College (UNITID 166939)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-mount-holyoke-college', 'College Scorecard — Mount Holyoke College', 'https://collegescorecard.ed.gov/school/?166939-mount_holyoke_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('mount-holyoke-college', 'Mount Holyoke College', 'South Hadley, Massachusetts', 'United States', '🇺🇸', 'Private four-year institution in South Hadley, Massachusetts.',
  'Mount Holyoke College. College Scorecard (2023) reports out-of-state tuition $67,018 / year and a middle-50% SAT range Middle-50% SAT critical reading 710–760; math 670–770 (Scorecard 2023).', 'mount-holyoke-college', array[]::text[], 'us-scorecard-mount-holyoke-college', 152, 'us-4prep-ranking-scorecard-2023', 166939)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('mount-holyoke-college', 'tuition'::public.university_fact_kind, '$67,018 / year (Scorecard 2023)', 67018, 'USD', 'us-scorecard-mount-holyoke-college', null, null, 'year'),
  ('mount-holyoke-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Mount Holyoke College''s admissions / financial-aid pages.', null),
  ('mount-holyoke-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Mount Holyoke College''s admissions pages.', null),
  ('mount-holyoke-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Mount Holyoke College''s admissions pages.', null),
  ('mount-holyoke-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Mount Holyoke College''s financial-aid pages.', null),
  ('mount-holyoke-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Mount Holyoke College''s admissions pages.', null),
  ('mount-holyoke-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Mount Holyoke College''s admissions pages.', null),
  ('mount-holyoke-college', 'room_board'::public.university_fact_kind, '$19,684 / year (Scorecard 2023)', 19684, 'USD', 'us-scorecard-mount-holyoke-college', null, null, 'year'),
  ('mount-holyoke-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Mount Holyoke College''s financial-aid pages.', null),
  ('mount-holyoke-college', 'total_cost_of_attendance'::public.university_fact_kind, '$84,926 / year (Scorecard 2023)', 84926, 'USD', 'us-scorecard-mount-holyoke-college', null, null, 'year'),
  ('mount-holyoke-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Mount Holyoke College''s international admissions / financial-aid pages.', null),
  ('mount-holyoke-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 710–760; math 670–770 (Scorecard 2023); Middle-50% ACT 32–35 (Scorecard 2023)', null, null, 'us-scorecard-mount-holyoke-college', null, null, null),
  ('mount-holyoke-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Mount Holyoke College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('mount-holyoke-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Mount Holyoke College''s admissions pages.'),
  ('mount-holyoke-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Mount Holyoke College''s admissions pages.'),
  ('mount-holyoke-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Mount Holyoke College''s admissions pages.'),
  ('mount-holyoke-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 710–760; math 670–770 (Scorecard 2023)', null, 'us-scorecard-mount-holyoke-college', null, null),
  ('mount-holyoke-college', 'act'::public.requirement_kind, 'Middle-50% ACT 32–35 (Scorecard 2023)', null, 'us-scorecard-mount-holyoke-college', null, null),
  ('mount-holyoke-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Mount Holyoke College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #153: United States Merchant Marine Academy (UNITID 197027)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-united-states-merchant-marine-academy', 'College Scorecard — United States Merchant Marine Academy', 'https://collegescorecard.ed.gov/school/?197027-united_states_merchant_marine_academy', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('united-states-merchant-marine-academy', 'United States Merchant Marine Academy', 'Kings Point, New York', 'United States', '🇺🇸', 'Public four-year institution in Kings Point, New York.',
  'United States Merchant Marine Academy. College Scorecard (2023) reports out-of-state tuition $895 / year and a middle-50% SAT range Middle-50% SAT critical reading 560–650; math 550–650 (Scorecard 2023).', 'united-states-merchant-marine-academy', array[]::text[], 'us-scorecard-united-states-merchant-marine-academy', 153, 'us-4prep-ranking-scorecard-2023', 197027)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('united-states-merchant-marine-academy', 'tuition'::public.university_fact_kind, '$895 / year (Scorecard 2023)', 895, 'USD', 'us-scorecard-united-states-merchant-marine-academy', null, null, 'year'),
  ('united-states-merchant-marine-academy', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check United States Merchant Marine Academy''s admissions / financial-aid pages.', null),
  ('united-states-merchant-marine-academy', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check United States Merchant Marine Academy''s admissions pages.', null),
  ('united-states-merchant-marine-academy', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check United States Merchant Marine Academy''s admissions pages.', null),
  ('united-states-merchant-marine-academy', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check United States Merchant Marine Academy''s financial-aid pages.', null),
  ('united-states-merchant-marine-academy', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check United States Merchant Marine Academy''s admissions pages.', null),
  ('united-states-merchant-marine-academy', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check United States Merchant Marine Academy''s admissions pages.', null),
  ('united-states-merchant-marine-academy', 'room_board'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report on-campus room and board.', 'Check United States Merchant Marine Academy''s financial-aid pages.', null),
  ('united-states-merchant-marine-academy', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check United States Merchant Marine Academy''s financial-aid pages.', null),
  ('united-states-merchant-marine-academy', 'total_cost_of_attendance'::public.university_fact_kind, '$9,168 / year (Scorecard 2023)', 9168, 'USD', 'us-scorecard-united-states-merchant-marine-academy', null, null, 'year'),
  ('united-states-merchant-marine-academy', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check United States Merchant Marine Academy''s international admissions / financial-aid pages.', null),
  ('united-states-merchant-marine-academy', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 560–650; math 550–650 (Scorecard 2023); Middle-50% ACT 22–29 (Scorecard 2023)', null, null, 'us-scorecard-united-states-merchant-marine-academy', null, null, null),
  ('united-states-merchant-marine-academy', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask United States Merchant Marine Academy''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('united-states-merchant-marine-academy', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check United States Merchant Marine Academy''s admissions pages.'),
  ('united-states-merchant-marine-academy', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check United States Merchant Marine Academy''s admissions pages.'),
  ('united-states-merchant-marine-academy', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check United States Merchant Marine Academy''s admissions pages.'),
  ('united-states-merchant-marine-academy', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 560–650; math 550–650 (Scorecard 2023)', null, 'us-scorecard-united-states-merchant-marine-academy', null, null),
  ('united-states-merchant-marine-academy', 'act'::public.requirement_kind, 'Middle-50% ACT 22–29 (Scorecard 2023)', null, 'us-scorecard-united-states-merchant-marine-academy', null, null),
  ('united-states-merchant-marine-academy', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check United States Merchant Marine Academy''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #154: Yeshiva Ohr Yisrael (UNITID 486017)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-yeshiva-ohr-yisrael', 'College Scorecard — Yeshiva Ohr Yisrael', 'https://collegescorecard.ed.gov/school/?486017-yeshiva_ohr_yisrael', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('yeshiva-ohr-yisrael', 'Yeshiva Ohr Yisrael', 'Brooklyn, New York', 'United States', '🇺🇸', 'Private four-year institution in Brooklyn, New York.',
  'Yeshiva Ohr Yisrael. College Scorecard (2023) reports out-of-state tuition $9,800 / year and a middle-50% SAT range not reported.', 'yeshiva-ohr-yisrael', array[]::text[], 'us-scorecard-yeshiva-ohr-yisrael', 154, 'us-4prep-ranking-scorecard-2023', 486017)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('yeshiva-ohr-yisrael', 'tuition'::public.university_fact_kind, '$9,800 / year (Scorecard 2023)', 9800, 'USD', 'us-scorecard-yeshiva-ohr-yisrael', null, null, 'year'),
  ('yeshiva-ohr-yisrael', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Yeshiva Ohr Yisrael''s admissions / financial-aid pages.', null),
  ('yeshiva-ohr-yisrael', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Yeshiva Ohr Yisrael''s admissions pages.', null),
  ('yeshiva-ohr-yisrael', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Yeshiva Ohr Yisrael''s admissions pages.', null),
  ('yeshiva-ohr-yisrael', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Yeshiva Ohr Yisrael''s financial-aid pages.', null),
  ('yeshiva-ohr-yisrael', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Yeshiva Ohr Yisrael''s admissions pages.', null),
  ('yeshiva-ohr-yisrael', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Yeshiva Ohr Yisrael''s admissions pages.', null),
  ('yeshiva-ohr-yisrael', 'room_board'::public.university_fact_kind, '$5,900 / year (Scorecard 2023)', 5900, 'USD', 'us-scorecard-yeshiva-ohr-yisrael', null, null, 'year'),
  ('yeshiva-ohr-yisrael', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Yeshiva Ohr Yisrael''s financial-aid pages.', null),
  ('yeshiva-ohr-yisrael', 'total_cost_of_attendance'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report academic-year cost of attendance.', 'Check Yeshiva Ohr Yisrael''s financial-aid pages.', null),
  ('yeshiva-ohr-yisrael', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Yeshiva Ohr Yisrael''s international admissions / financial-aid pages.', null),
  ('yeshiva-ohr-yisrael', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check Yeshiva Ohr Yisrael''s admissions pages.', null),
  ('yeshiva-ohr-yisrael', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Yeshiva Ohr Yisrael''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('yeshiva-ohr-yisrael', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Yeshiva Ohr Yisrael''s admissions pages.'),
  ('yeshiva-ohr-yisrael', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Yeshiva Ohr Yisrael''s admissions pages.'),
  ('yeshiva-ohr-yisrael', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Yeshiva Ohr Yisrael''s admissions pages.'),
  ('yeshiva-ohr-yisrael', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check Yeshiva Ohr Yisrael''s admissions pages.'),
  ('yeshiva-ohr-yisrael', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check Yeshiva Ohr Yisrael''s admissions pages.'),
  ('yeshiva-ohr-yisrael', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Yeshiva Ohr Yisrael''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #155: American University (UNITID 131159)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-american-university', 'College Scorecard — American University', 'https://collegescorecard.ed.gov/school/?131159-american_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('american-university', 'American University', 'Washington, District of Columbia', 'United States', '🇺🇸', 'Private four-year institution in Washington, District of Columbia.',
  'American University. College Scorecard (2023) reports out-of-state tuition $58,771 / year and a middle-50% SAT range Middle-50% SAT critical reading 660–740; math 620–720 (Scorecard 2023).', 'american-university', array[]::text[], 'us-scorecard-american-university', 155, 'us-4prep-ranking-scorecard-2023', 131159)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('american-university', 'tuition'::public.university_fact_kind, '$58,771 / year (Scorecard 2023)', 58771, 'USD', 'us-scorecard-american-university', null, null, 'year'),
  ('american-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check American University''s admissions / financial-aid pages.', null),
  ('american-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check American University''s admissions pages.', null),
  ('american-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check American University''s admissions pages.', null),
  ('american-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check American University''s financial-aid pages.', null),
  ('american-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check American University''s admissions pages.', null),
  ('american-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check American University''s admissions pages.', null),
  ('american-university', 'room_board'::public.university_fact_kind, '$17,982 / year (Scorecard 2023)', 17982, 'USD', 'us-scorecard-american-university', null, null, 'year'),
  ('american-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check American University''s financial-aid pages.', null),
  ('american-university', 'total_cost_of_attendance'::public.university_fact_kind, '$76,058 / year (Scorecard 2023)', 76058, 'USD', 'us-scorecard-american-university', null, null, 'year'),
  ('american-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check American University''s international admissions / financial-aid pages.', null),
  ('american-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 660–740; math 620–720 (Scorecard 2023); Middle-50% ACT 29–32 (Scorecard 2023)', null, null, 'us-scorecard-american-university', null, null, null),
  ('american-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask American University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('american-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check American University''s admissions pages.'),
  ('american-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check American University''s admissions pages.'),
  ('american-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check American University''s admissions pages.'),
  ('american-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 660–740; math 620–720 (Scorecard 2023)', null, 'us-scorecard-american-university', null, null),
  ('american-university', 'act'::public.requirement_kind, 'Middle-50% ACT 29–32 (Scorecard 2023)', null, 'us-scorecard-american-university', null, null),
  ('american-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check American University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #156: Illinois Institute of Technology (UNITID 145725)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-illinois-institute-of-technology', 'College Scorecard — Illinois Institute of Technology', 'https://collegescorecard.ed.gov/school/?145725-illinois_institute_of_technology', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('illinois-institute-of-technology', 'Illinois Institute of Technology', 'Chicago, Illinois', 'United States', '🇺🇸', 'Private four-year institution in Chicago, Illinois.',
  'Illinois Institute of Technology. College Scorecard (2023) reports out-of-state tuition $52,386 / year and a middle-50% SAT range Middle-50% SAT critical reading 590–720; math 590–720 (Scorecard 2023).', 'illinois-institute-of-technology', array[]::text[], 'us-scorecard-illinois-institute-of-technology', 156, 'us-4prep-ranking-scorecard-2023', 145725)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('illinois-institute-of-technology', 'tuition'::public.university_fact_kind, '$52,386 / year (Scorecard 2023)', 52386, 'USD', 'us-scorecard-illinois-institute-of-technology', null, null, 'year'),
  ('illinois-institute-of-technology', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Illinois Institute of Technology''s admissions / financial-aid pages.', null),
  ('illinois-institute-of-technology', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Illinois Institute of Technology''s admissions pages.', null),
  ('illinois-institute-of-technology', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Illinois Institute of Technology''s admissions pages.', null),
  ('illinois-institute-of-technology', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Illinois Institute of Technology''s financial-aid pages.', null),
  ('illinois-institute-of-technology', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Illinois Institute of Technology''s admissions pages.', null),
  ('illinois-institute-of-technology', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Illinois Institute of Technology''s admissions pages.', null),
  ('illinois-institute-of-technology', 'room_board'::public.university_fact_kind, '$17,356 / year (Scorecard 2023)', 17356, 'USD', 'us-scorecard-illinois-institute-of-technology', null, null, 'year'),
  ('illinois-institute-of-technology', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Illinois Institute of Technology''s financial-aid pages.', null),
  ('illinois-institute-of-technology', 'total_cost_of_attendance'::public.university_fact_kind, '$68,164 / year (Scorecard 2023)', 68164, 'USD', 'us-scorecard-illinois-institute-of-technology', null, null, 'year'),
  ('illinois-institute-of-technology', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Illinois Institute of Technology''s international admissions / financial-aid pages.', null),
  ('illinois-institute-of-technology', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 590–720; math 590–720 (Scorecard 2023); Middle-50% ACT 26–32 (Scorecard 2023)', null, null, 'us-scorecard-illinois-institute-of-technology', null, null, null),
  ('illinois-institute-of-technology', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Illinois Institute of Technology''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('illinois-institute-of-technology', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Illinois Institute of Technology''s admissions pages.'),
  ('illinois-institute-of-technology', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Illinois Institute of Technology''s admissions pages.'),
  ('illinois-institute-of-technology', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Illinois Institute of Technology''s admissions pages.'),
  ('illinois-institute-of-technology', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 590–720; math 590–720 (Scorecard 2023)', null, 'us-scorecard-illinois-institute-of-technology', null, null),
  ('illinois-institute-of-technology', 'act'::public.requirement_kind, 'Middle-50% ACT 26–32 (Scorecard 2023)', null, 'us-scorecard-illinois-institute-of-technology', null, null),
  ('illinois-institute-of-technology', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Illinois Institute of Technology''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #157: Illinois Wesleyan University (UNITID 145646)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-illinois-wesleyan', 'College Scorecard — Illinois Wesleyan University', 'https://collegescorecard.ed.gov/school/?145646-illinois_wesleyan_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
-- Existing catalogue row: source, identity, facts, and requirements are intentionally untouched.
-- #158: Stanbridge University (UNITID 446561)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-stanbridge-university', 'College Scorecard — Stanbridge University', 'https://collegescorecard.ed.gov/school/?446561-stanbridge_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('stanbridge-university', 'Stanbridge University', 'Irvine, California', 'United States', '🇺🇸', 'Private four-year institution in Irvine, California.',
  'Stanbridge University. College Scorecard (2023) reports out-of-state tuition not reported and a middle-50% SAT range not reported.', 'stanbridge-university', array[]::text[], 'us-scorecard-stanbridge-university', 158, 'us-4prep-ranking-scorecard-2023', 446561)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('stanbridge-university', 'tuition'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report out-of-state tuition.', 'Check Stanbridge University''s financial-aid pages.', null),
  ('stanbridge-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Stanbridge University''s admissions / financial-aid pages.', null),
  ('stanbridge-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Stanbridge University''s admissions pages.', null),
  ('stanbridge-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Stanbridge University''s admissions pages.', null),
  ('stanbridge-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Stanbridge University''s financial-aid pages.', null),
  ('stanbridge-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Stanbridge University''s admissions pages.', null),
  ('stanbridge-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Stanbridge University''s admissions pages.', null),
  ('stanbridge-university', 'room_board'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report on-campus room and board.', 'Check Stanbridge University''s financial-aid pages.', null),
  ('stanbridge-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Stanbridge University''s financial-aid pages.', null),
  ('stanbridge-university', 'total_cost_of_attendance'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report academic-year cost of attendance.', 'Check Stanbridge University''s financial-aid pages.', null),
  ('stanbridge-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Stanbridge University''s international admissions / financial-aid pages.', null),
  ('stanbridge-university', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check Stanbridge University''s admissions pages.', null),
  ('stanbridge-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Stanbridge University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('stanbridge-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Stanbridge University''s admissions pages.'),
  ('stanbridge-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Stanbridge University''s admissions pages.'),
  ('stanbridge-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Stanbridge University''s admissions pages.'),
  ('stanbridge-university', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check Stanbridge University''s admissions pages.'),
  ('stanbridge-university', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check Stanbridge University''s admissions pages.'),
  ('stanbridge-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Stanbridge University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #159: Auburn University (UNITID 100858)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-auburn-university', 'College Scorecard — Auburn University', 'https://collegescorecard.ed.gov/school/?100858-auburn_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('auburn-university', 'Auburn University', 'Auburn, Alabama', 'United States', '🇺🇸', 'Public four-year institution in Auburn, Alabama.',
  'Auburn University. College Scorecard (2023) reports out-of-state tuition $34,922 / year and a middle-50% SAT range Middle-50% SAT critical reading 630–690; math 630–700 (Scorecard 2023).', 'auburn-university', array[]::text[], 'us-scorecard-auburn-university', 159, 'us-4prep-ranking-scorecard-2023', 100858)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('auburn-university', 'tuition'::public.university_fact_kind, '$34,922 / year (Scorecard 2023)', 34922, 'USD', 'us-scorecard-auburn-university', null, null, 'year'),
  ('auburn-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Auburn University''s admissions / financial-aid pages.', null),
  ('auburn-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Auburn University''s admissions pages.', null),
  ('auburn-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Auburn University''s admissions pages.', null),
  ('auburn-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Auburn University''s financial-aid pages.', null),
  ('auburn-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Auburn University''s admissions pages.', null),
  ('auburn-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Auburn University''s admissions pages.', null),
  ('auburn-university', 'room_board'::public.university_fact_kind, '$16,626 / year (Scorecard 2023)', 16626, 'USD', 'us-scorecard-auburn-university', null, null, 'year'),
  ('auburn-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Auburn University''s financial-aid pages.', null),
  ('auburn-university', 'total_cost_of_attendance'::public.university_fact_kind, '$34,919 / year (Scorecard 2023)', 34919, 'USD', 'us-scorecard-auburn-university', null, null, 'year'),
  ('auburn-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Auburn University''s international admissions / financial-aid pages.', null),
  ('auburn-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 630–690; math 630–700 (Scorecard 2023); Middle-50% ACT 26–31 (Scorecard 2023)', null, null, 'us-scorecard-auburn-university', null, null, null),
  ('auburn-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Auburn University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('auburn-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Auburn University''s admissions pages.'),
  ('auburn-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Auburn University''s admissions pages.'),
  ('auburn-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Auburn University''s admissions pages.'),
  ('auburn-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 630–690; math 630–700 (Scorecard 2023)', null, 'us-scorecard-auburn-university', null, null),
  ('auburn-university', 'act'::public.requirement_kind, 'Middle-50% ACT 26–31 (Scorecard 2023)', null, 'us-scorecard-auburn-university', null, null),
  ('auburn-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Auburn University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #160: Marist University (UNITID 192819)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-marist-university', 'College Scorecard — Marist University', 'https://collegescorecard.ed.gov/school/?192819-marist_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('marist-university', 'Marist University', 'Poughkeepsie, New York', 'United States', '🇺🇸', 'Private four-year institution in Poughkeepsie, New York.',
  'Marist University. College Scorecard (2023) reports out-of-state tuition $47,750 / year and a middle-50% SAT range Middle-50% SAT critical reading 600–680; math 590–660 (Scorecard 2023).', 'marist-university', array[]::text[], 'us-scorecard-marist-university', 160, 'us-4prep-ranking-scorecard-2023', 192819)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('marist-university', 'tuition'::public.university_fact_kind, '$47,750 / year (Scorecard 2023)', 47750, 'USD', 'us-scorecard-marist-university', null, null, 'year'),
  ('marist-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Marist University''s admissions / financial-aid pages.', null),
  ('marist-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Marist University''s admissions pages.', null),
  ('marist-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Marist University''s admissions pages.', null),
  ('marist-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Marist University''s financial-aid pages.', null),
  ('marist-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Marist University''s admissions pages.', null),
  ('marist-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Marist University''s admissions pages.', null),
  ('marist-university', 'room_board'::public.university_fact_kind, '$18,460 / year (Scorecard 2023)', 18460, 'USD', 'us-scorecard-marist-university', null, null, 'year'),
  ('marist-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Marist University''s financial-aid pages.', null),
  ('marist-university', 'total_cost_of_attendance'::public.university_fact_kind, '$67,574 / year (Scorecard 2023)', 67574, 'USD', 'us-scorecard-marist-university', null, null, 'year'),
  ('marist-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Marist University''s international admissions / financial-aid pages.', null),
  ('marist-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 600–680; math 590–660 (Scorecard 2023); Middle-50% ACT 25–31 (Scorecard 2023)', null, null, 'us-scorecard-marist-university', null, null, null),
  ('marist-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Marist University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('marist-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Marist University''s admissions pages.'),
  ('marist-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Marist University''s admissions pages.'),
  ('marist-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Marist University''s admissions pages.'),
  ('marist-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 600–680; math 590–660 (Scorecard 2023)', null, 'us-scorecard-marist-university', null, null),
  ('marist-university', 'act'::public.requirement_kind, 'Middle-50% ACT 25–31 (Scorecard 2023)', null, 'us-scorecard-marist-university', null, null),
  ('marist-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Marist University''s admissions pages.')
on conflict (university_id, kind) do nothing;

commit;
