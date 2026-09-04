begin;

-- #81: Santa Clara University (UNITID 122931)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-santa-clara-university', 'College Scorecard — Santa Clara University', 'https://collegescorecard.ed.gov/school/?122931-santa_clara_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('santa-clara-university', 'Santa Clara University', 'Santa Clara, California', 'United States', '🇺🇸', 'Private four-year institution in Santa Clara, California.',
  'Santa Clara University. College Scorecard (2023) reports out-of-state tuition $61,293 / year and a middle-50% SAT range Middle-50% SAT critical reading 670–730; math 680–760 (Scorecard 2023).', 'santa-clara-university', array[]::text[], 'us-scorecard-santa-clara-university', 81, 'us-4prep-ranking-scorecard-2023', 122931)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('santa-clara-university', 'tuition'::public.university_fact_kind, '$61,293 / year (Scorecard 2023)', 61293, 'USD', 'us-scorecard-santa-clara-university', null, null, 'year'),
  ('santa-clara-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Santa Clara University''s admissions / financial-aid pages.', null),
  ('santa-clara-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Santa Clara University''s admissions pages.', null),
  ('santa-clara-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Santa Clara University''s admissions pages.', null),
  ('santa-clara-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Santa Clara University''s financial-aid pages.', null),
  ('santa-clara-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Santa Clara University''s admissions pages.', null),
  ('santa-clara-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Santa Clara University''s admissions pages.', null),
  ('santa-clara-university', 'room_board'::public.university_fact_kind, '$19,893 / year (Scorecard 2023)', 19893, 'USD', 'us-scorecard-santa-clara-university', null, null, 'year'),
  ('santa-clara-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Santa Clara University''s financial-aid pages.', null),
  ('santa-clara-university', 'total_cost_of_attendance'::public.university_fact_kind, '$82,026 / year (Scorecard 2023)', 82026, 'USD', 'us-scorecard-santa-clara-university', null, null, 'year'),
  ('santa-clara-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Santa Clara University''s international admissions / financial-aid pages.', null),
  ('santa-clara-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 670–730; math 680–760 (Scorecard 2023); Middle-50% ACT 31–33 (Scorecard 2023)', null, null, 'us-scorecard-santa-clara-university', null, null, null),
  ('santa-clara-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Santa Clara University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('santa-clara-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Santa Clara University''s admissions pages.'),
  ('santa-clara-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Santa Clara University''s admissions pages.'),
  ('santa-clara-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Santa Clara University''s admissions pages.'),
  ('santa-clara-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 670–730; math 680–760 (Scorecard 2023)', null, 'us-scorecard-santa-clara-university', null, null),
  ('santa-clara-university', 'act'::public.requirement_kind, 'Middle-50% ACT 31–33 (Scorecard 2023)', null, 'us-scorecard-santa-clara-university', null, null),
  ('santa-clara-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Santa Clara University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #82: William & Mary (UNITID 231624)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-william-and-mary', 'College Scorecard — William & Mary', 'https://collegescorecard.ed.gov/school/?231624-william_and_mary', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('william-and-mary', 'William & Mary', 'Williamsburg, Virginia', 'United States', '🇺🇸', 'Public four-year institution in Williamsburg, Virginia.',
  'William & Mary. College Scorecard (2023) reports out-of-state tuition $51,038 / year and a middle-50% SAT range Middle-50% SAT critical reading 710–760; math 690–770 (Scorecard 2023).', 'william-and-mary', array[]::text[], 'us-scorecard-william-and-mary', 82, 'us-4prep-ranking-scorecard-2023', 231624)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('william-and-mary', 'tuition'::public.university_fact_kind, '$51,038 / year (Scorecard 2023)', 51038, 'USD', 'us-scorecard-william-and-mary', null, null, 'year'),
  ('william-and-mary', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check William & Mary''s admissions / financial-aid pages.', null),
  ('william-and-mary', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check William & Mary''s admissions pages.', null),
  ('william-and-mary', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check William & Mary''s admissions pages.', null),
  ('william-and-mary', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check William & Mary''s financial-aid pages.', null),
  ('william-and-mary', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check William & Mary''s admissions pages.', null),
  ('william-and-mary', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check William & Mary''s admissions pages.', null),
  ('william-and-mary', 'room_board'::public.university_fact_kind, '$16,182 / year (Scorecard 2023)', 16182, 'USD', 'us-scorecard-william-and-mary', null, null, 'year'),
  ('william-and-mary', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check William & Mary''s financial-aid pages.', null),
  ('william-and-mary', 'total_cost_of_attendance'::public.university_fact_kind, '$43,035 / year (Scorecard 2023)', 43035, 'USD', 'us-scorecard-william-and-mary', null, null, 'year'),
  ('william-and-mary', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check William & Mary''s international admissions / financial-aid pages.', null),
  ('william-and-mary', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 710–760; math 690–770 (Scorecard 2023); Middle-50% ACT 32–34 (Scorecard 2023)', null, null, 'us-scorecard-william-and-mary', null, null, null),
  ('william-and-mary', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask William & Mary''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('william-and-mary', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check William & Mary''s admissions pages.'),
  ('william-and-mary', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check William & Mary''s admissions pages.'),
  ('william-and-mary', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check William & Mary''s admissions pages.'),
  ('william-and-mary', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 710–760; math 690–770 (Scorecard 2023)', null, 'us-scorecard-william-and-mary', null, null),
  ('william-and-mary', 'act'::public.requirement_kind, 'Middle-50% ACT 32–34 (Scorecard 2023)', null, 'us-scorecard-william-and-mary', null, null),
  ('william-and-mary', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check William & Mary''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #83: Scripps College (UNITID 123165)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-scripps-college', 'College Scorecard — Scripps College', 'https://collegescorecard.ed.gov/school/?123165-scripps_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('scripps-college', 'Scripps College', 'Claremont, California', 'United States', '🇺🇸', 'Private four-year institution in Claremont, California.',
  'Scripps College. College Scorecard (2023) reports out-of-state tuition $65,950 / year and a middle-50% SAT range Middle-50% SAT critical reading 720–770; math 720–770 (Scorecard 2023).', 'scripps-college', array[]::text[], 'us-scorecard-scripps-college', 83, 'us-4prep-ranking-scorecard-2023', 123165)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('scripps-college', 'tuition'::public.university_fact_kind, '$65,950 / year (Scorecard 2023)', 65950, 'USD', 'us-scorecard-scripps-college', null, null, 'year'),
  ('scripps-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Scripps College''s admissions / financial-aid pages.', null),
  ('scripps-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Scripps College''s admissions pages.', null),
  ('scripps-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Scripps College''s admissions pages.', null),
  ('scripps-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Scripps College''s financial-aid pages.', null),
  ('scripps-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Scripps College''s admissions pages.', null),
  ('scripps-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Scripps College''s admissions pages.', null),
  ('scripps-college', 'room_board'::public.university_fact_kind, '$22,136 / year (Scorecard 2023)', 22136, 'USD', 'us-scorecard-scripps-college', null, null, 'year'),
  ('scripps-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Scripps College''s financial-aid pages.', null),
  ('scripps-college', 'total_cost_of_attendance'::public.university_fact_kind, '$87,564 / year (Scorecard 2023)', 87564, 'USD', 'us-scorecard-scripps-college', null, null, 'year'),
  ('scripps-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Scripps College''s international admissions / financial-aid pages.', null),
  ('scripps-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 720–770; math 720–770 (Scorecard 2023); Middle-50% ACT 31–34 (Scorecard 2023)', null, null, 'us-scorecard-scripps-college', null, null, null),
  ('scripps-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Scripps College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('scripps-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Scripps College''s admissions pages.'),
  ('scripps-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Scripps College''s admissions pages.'),
  ('scripps-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Scripps College''s admissions pages.'),
  ('scripps-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 720–770; math 720–770 (Scorecard 2023)', null, 'us-scorecard-scripps-college', null, null),
  ('scripps-college', 'act'::public.requirement_kind, 'Middle-50% ACT 31–34 (Scorecard 2023)', null, 'us-scorecard-scripps-college', null, null),
  ('scripps-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Scripps College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #84: United States Air Force Academy (UNITID 128328)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-united-states-air-force-academy', 'College Scorecard — United States Air Force Academy', 'https://collegescorecard.ed.gov/school/?128328-united_states_air_force_academy', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('united-states-air-force-academy', 'United States Air Force Academy', 'USAF Academy, Colorado', 'United States', '🇺🇸', 'Public four-year institution in USAF Academy, Colorado.',
  'United States Air Force Academy. College Scorecard (2023) reports out-of-state tuition not reported and a middle-50% SAT range Middle-50% SAT critical reading 620–710; math 610–730 (Scorecard 2023).', 'united-states-air-force-academy', array[]::text[], 'us-scorecard-united-states-air-force-academy', 84, 'us-4prep-ranking-scorecard-2023', 128328)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('united-states-air-force-academy', 'tuition'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report out-of-state tuition.', 'Check United States Air Force Academy''s financial-aid pages.', null),
  ('united-states-air-force-academy', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check United States Air Force Academy''s admissions / financial-aid pages.', null),
  ('united-states-air-force-academy', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check United States Air Force Academy''s admissions pages.', null),
  ('united-states-air-force-academy', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check United States Air Force Academy''s admissions pages.', null),
  ('united-states-air-force-academy', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check United States Air Force Academy''s financial-aid pages.', null),
  ('united-states-air-force-academy', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check United States Air Force Academy''s admissions pages.', null),
  ('united-states-air-force-academy', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check United States Air Force Academy''s admissions pages.', null),
  ('united-states-air-force-academy', 'room_board'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report on-campus room and board.', 'Check United States Air Force Academy''s financial-aid pages.', null),
  ('united-states-air-force-academy', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check United States Air Force Academy''s financial-aid pages.', null),
  ('united-states-air-force-academy', 'total_cost_of_attendance'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report academic-year cost of attendance.', 'Check United States Air Force Academy''s financial-aid pages.', null),
  ('united-states-air-force-academy', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check United States Air Force Academy''s international admissions / financial-aid pages.', null),
  ('united-states-air-force-academy', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 620–710; math 610–730 (Scorecard 2023); Middle-50% ACT 26–33 (Scorecard 2023)', null, null, 'us-scorecard-united-states-air-force-academy', null, null, null),
  ('united-states-air-force-academy', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask United States Air Force Academy''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('united-states-air-force-academy', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check United States Air Force Academy''s admissions pages.'),
  ('united-states-air-force-academy', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check United States Air Force Academy''s admissions pages.'),
  ('united-states-air-force-academy', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check United States Air Force Academy''s admissions pages.'),
  ('united-states-air-force-academy', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 620–710; math 610–730 (Scorecard 2023)', null, 'us-scorecard-united-states-air-force-academy', null, null),
  ('united-states-air-force-academy', 'act'::public.requirement_kind, 'Middle-50% ACT 26–33 (Scorecard 2023)', null, 'us-scorecard-united-states-air-force-academy', null, null),
  ('united-states-air-force-academy', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check United States Air Force Academy''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #85: University of Rochester (UNITID 195030)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-rochester', 'College Scorecard — University of Rochester', 'https://collegescorecard.ed.gov/school/?195030-university_of_rochester', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-rochester', 'University of Rochester', 'Rochester, New York', 'United States', '🇺🇸', 'Private four-year institution in Rochester, New York.',
  'University of Rochester. College Scorecard (2023) reports out-of-state tuition $67,080 / year and a middle-50% SAT range Middle-50% SAT critical reading 680–750; math 730–790 (Scorecard 2023).', 'university-of-rochester', array[]::text[], 'us-scorecard-university-of-rochester', 85, 'us-4prep-ranking-scorecard-2023', 195030)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-rochester', 'tuition'::public.university_fact_kind, '$67,080 / year (Scorecard 2023)', 67080, 'USD', 'us-scorecard-university-of-rochester', null, null, 'year'),
  ('university-of-rochester', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of Rochester''s admissions / financial-aid pages.', null),
  ('university-of-rochester', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of Rochester''s admissions pages.', null),
  ('university-of-rochester', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of Rochester''s admissions pages.', null),
  ('university-of-rochester', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of Rochester''s financial-aid pages.', null),
  ('university-of-rochester', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of Rochester''s admissions pages.', null),
  ('university-of-rochester', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of Rochester''s admissions pages.', null),
  ('university-of-rochester', 'room_board'::public.university_fact_kind, '$19,792 / year (Scorecard 2023)', 19792, 'USD', 'us-scorecard-university-of-rochester', null, null, 'year'),
  ('university-of-rochester', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of Rochester''s financial-aid pages.', null),
  ('university-of-rochester', 'total_cost_of_attendance'::public.university_fact_kind, '$85,962 / year (Scorecard 2023)', 85962, 'USD', 'us-scorecard-university-of-rochester', null, null, 'year'),
  ('university-of-rochester', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of Rochester''s international admissions / financial-aid pages.', null),
  ('university-of-rochester', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 680–750; math 730–790 (Scorecard 2023); Middle-50% ACT 31–34 (Scorecard 2023)', null, null, 'us-scorecard-university-of-rochester', null, null, null),
  ('university-of-rochester', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of Rochester''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-rochester', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of Rochester''s admissions pages.'),
  ('university-of-rochester', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of Rochester''s admissions pages.'),
  ('university-of-rochester', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of Rochester''s admissions pages.'),
  ('university-of-rochester', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 680–750; math 730–790 (Scorecard 2023)', null, 'us-scorecard-university-of-rochester', null, null),
  ('university-of-rochester', 'act'::public.requirement_kind, 'Middle-50% ACT 31–34 (Scorecard 2023)', null, 'us-scorecard-university-of-rochester', null, null),
  ('university-of-rochester', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of Rochester''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #86: University of Maryland-College Park (UNITID 163286)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-maryland-college-park', 'College Scorecard — University of Maryland-College Park', 'https://collegescorecard.ed.gov/school/?163286-university_of_maryland_college_park', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-maryland-college-park', 'University of Maryland-College Park', 'College Park, Maryland', 'United States', '🇺🇸', 'Public four-year institution in College Park, Maryland.',
  'University of Maryland-College Park. College Scorecard (2023) reports out-of-state tuition $41,186 / year and a middle-50% SAT range Middle-50% SAT critical reading 690–750; math 710–780 (Scorecard 2023).', 'university-of-maryland-college-park', array[]::text[], 'us-scorecard-university-of-maryland-college-park', 86, 'us-4prep-ranking-scorecard-2023', 163286)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-maryland-college-park', 'tuition'::public.university_fact_kind, '$41,186 / year (Scorecard 2023)', 41186, 'USD', 'us-scorecard-university-of-maryland-college-park', null, null, 'year'),
  ('university-of-maryland-college-park', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of Maryland-College Park''s admissions / financial-aid pages.', null),
  ('university-of-maryland-college-park', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of Maryland-College Park''s admissions pages.', null),
  ('university-of-maryland-college-park', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of Maryland-College Park''s admissions pages.', null),
  ('university-of-maryland-college-park', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of Maryland-College Park''s financial-aid pages.', null),
  ('university-of-maryland-college-park', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of Maryland-College Park''s admissions pages.', null),
  ('university-of-maryland-college-park', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of Maryland-College Park''s admissions pages.', null),
  ('university-of-maryland-college-park', 'room_board'::public.university_fact_kind, '$15,958 / year (Scorecard 2023)', 15958, 'USD', 'us-scorecard-university-of-maryland-college-park', null, null, 'year'),
  ('university-of-maryland-college-park', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of Maryland-College Park''s financial-aid pages.', null),
  ('university-of-maryland-college-park', 'total_cost_of_attendance'::public.university_fact_kind, '$29,299 / year (Scorecard 2023)', 29299, 'USD', 'us-scorecard-university-of-maryland-college-park', null, null, 'year'),
  ('university-of-maryland-college-park', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of Maryland-College Park''s international admissions / financial-aid pages.', null),
  ('university-of-maryland-college-park', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 690–750; math 710–780 (Scorecard 2023); Middle-50% ACT 32–35 (Scorecard 2023)', null, null, 'us-scorecard-university-of-maryland-college-park', null, null, null),
  ('university-of-maryland-college-park', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of Maryland-College Park''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-maryland-college-park', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of Maryland-College Park''s admissions pages.'),
  ('university-of-maryland-college-park', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of Maryland-College Park''s admissions pages.'),
  ('university-of-maryland-college-park', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of Maryland-College Park''s admissions pages.'),
  ('university-of-maryland-college-park', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 690–750; math 710–780 (Scorecard 2023)', null, 'us-scorecard-university-of-maryland-college-park', null, null),
  ('university-of-maryland-college-park', 'act'::public.requirement_kind, 'Middle-50% ACT 32–35 (Scorecard 2023)', null, 'us-scorecard-university-of-maryland-college-park', null, null),
  ('university-of-maryland-college-park', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of Maryland-College Park''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #87: United States Naval Academy (UNITID 164155)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-united-states-naval-academy', 'College Scorecard — United States Naval Academy', 'https://collegescorecard.ed.gov/school/?164155-united_states_naval_academy', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('united-states-naval-academy', 'United States Naval Academy', 'Annapolis, Maryland', 'United States', '🇺🇸', 'Public four-year institution in Annapolis, Maryland.',
  'United States Naval Academy. College Scorecard (2023) reports out-of-state tuition not reported and a middle-50% SAT range Middle-50% SAT critical reading 610–700; math 600–710 (Scorecard 2023).', 'united-states-naval-academy', array[]::text[], 'us-scorecard-united-states-naval-academy', 87, 'us-4prep-ranking-scorecard-2023', 164155)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('united-states-naval-academy', 'tuition'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report out-of-state tuition.', 'Check United States Naval Academy''s financial-aid pages.', null),
  ('united-states-naval-academy', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check United States Naval Academy''s admissions / financial-aid pages.', null),
  ('united-states-naval-academy', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check United States Naval Academy''s admissions pages.', null),
  ('united-states-naval-academy', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check United States Naval Academy''s admissions pages.', null),
  ('united-states-naval-academy', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check United States Naval Academy''s financial-aid pages.', null),
  ('united-states-naval-academy', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check United States Naval Academy''s admissions pages.', null),
  ('united-states-naval-academy', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check United States Naval Academy''s admissions pages.', null),
  ('united-states-naval-academy', 'room_board'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report on-campus room and board.', 'Check United States Naval Academy''s financial-aid pages.', null),
  ('united-states-naval-academy', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check United States Naval Academy''s financial-aid pages.', null),
  ('united-states-naval-academy', 'total_cost_of_attendance'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report academic-year cost of attendance.', 'Check United States Naval Academy''s financial-aid pages.', null),
  ('united-states-naval-academy', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check United States Naval Academy''s international admissions / financial-aid pages.', null),
  ('united-states-naval-academy', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 610–700; math 600–710 (Scorecard 2023); Middle-50% ACT 25–31 (Scorecard 2023)', null, null, 'us-scorecard-united-states-naval-academy', null, null, null),
  ('united-states-naval-academy', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask United States Naval Academy''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('united-states-naval-academy', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check United States Naval Academy''s admissions pages.'),
  ('united-states-naval-academy', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check United States Naval Academy''s admissions pages.'),
  ('united-states-naval-academy', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check United States Naval Academy''s admissions pages.'),
  ('united-states-naval-academy', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 610–700; math 600–710 (Scorecard 2023)', null, 'us-scorecard-united-states-naval-academy', null, null),
  ('united-states-naval-academy', 'act'::public.requirement_kind, 'Middle-50% ACT 25–31 (Scorecard 2023)', null, 'us-scorecard-united-states-naval-academy', null, null),
  ('united-states-naval-academy', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check United States Naval Academy''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #88: University of Miami (UNITID 135726)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-miami', 'College Scorecard — University of Miami', 'https://collegescorecard.ed.gov/school/?135726-university_of_miami', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-miami', 'University of Miami', 'Coral Gables, Florida', 'United States', '🇺🇸', 'Private four-year institution in Coral Gables, Florida.',
  'University of Miami. College Scorecard (2023) reports out-of-state tuition $62,616 / year and a middle-50% SAT range Middle-50% SAT critical reading 660–730; math 660–750 (Scorecard 2023).', 'university-of-miami', array[]::text[], 'us-scorecard-university-of-miami', 88, 'us-4prep-ranking-scorecard-2023', 135726)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-miami', 'tuition'::public.university_fact_kind, '$62,616 / year (Scorecard 2023)', 62616, 'USD', 'us-scorecard-university-of-miami', null, null, 'year'),
  ('university-of-miami', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of Miami''s admissions / financial-aid pages.', null),
  ('university-of-miami', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of Miami''s admissions pages.', null),
  ('university-of-miami', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of Miami''s admissions pages.', null),
  ('university-of-miami', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of Miami''s financial-aid pages.', null),
  ('university-of-miami', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of Miami''s admissions pages.', null),
  ('university-of-miami', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of Miami''s admissions pages.', null),
  ('university-of-miami', 'room_board'::public.university_fact_kind, '$23,790 / year (Scorecard 2023)', 23790, 'USD', 'us-scorecard-university-of-miami', null, null, 'year'),
  ('university-of-miami', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of Miami''s financial-aid pages.', null),
  ('university-of-miami', 'total_cost_of_attendance'::public.university_fact_kind, '$86,078 / year (Scorecard 2023)', 86078, 'USD', 'us-scorecard-university-of-miami', null, null, 'year'),
  ('university-of-miami', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of Miami''s international admissions / financial-aid pages.', null),
  ('university-of-miami', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 660–730; math 660–750 (Scorecard 2023); Middle-50% ACT 30–33 (Scorecard 2023)', null, null, 'us-scorecard-university-of-miami', null, null, null),
  ('university-of-miami', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of Miami''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-miami', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of Miami''s admissions pages.'),
  ('university-of-miami', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of Miami''s admissions pages.'),
  ('university-of-miami', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of Miami''s admissions pages.'),
  ('university-of-miami', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 660–730; math 660–750 (Scorecard 2023)', null, 'us-scorecard-university-of-miami', null, null),
  ('university-of-miami', 'act'::public.requirement_kind, 'Middle-50% ACT 30–33 (Scorecard 2023)', null, 'us-scorecard-university-of-miami', null, null),
  ('university-of-miami', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of Miami''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #89: Rhode Island School of Design (UNITID 217493)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-rhode-island-school-of-design', 'College Scorecard — Rhode Island School of Design', 'https://collegescorecard.ed.gov/school/?217493-rhode_island_school_of_design', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('rhode-island-school-of-design', 'Rhode Island School of Design', 'Providence, Rhode Island', 'United States', '🇺🇸', 'Private four-year institution in Providence, Rhode Island.',
  'Rhode Island School of Design. College Scorecard (2023) reports out-of-state tuition $62,688 / year and a middle-50% SAT range Middle-50% SAT critical reading 688–750; math 708–780 (Scorecard 2023).', 'rhode-island-school-of-design', array[]::text[], 'us-scorecard-rhode-island-school-of-design', 89, 'us-4prep-ranking-scorecard-2023', 217493)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('rhode-island-school-of-design', 'tuition'::public.university_fact_kind, '$62,688 / year (Scorecard 2023)', 62688, 'USD', 'us-scorecard-rhode-island-school-of-design', null, null, 'year'),
  ('rhode-island-school-of-design', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Rhode Island School of Design''s admissions / financial-aid pages.', null),
  ('rhode-island-school-of-design', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Rhode Island School of Design''s admissions pages.', null),
  ('rhode-island-school-of-design', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Rhode Island School of Design''s admissions pages.', null),
  ('rhode-island-school-of-design', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Rhode Island School of Design''s financial-aid pages.', null),
  ('rhode-island-school-of-design', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Rhode Island School of Design''s admissions pages.', null),
  ('rhode-island-school-of-design', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Rhode Island School of Design''s admissions pages.', null),
  ('rhode-island-school-of-design', 'room_board'::public.university_fact_kind, '$16,626 / year (Scorecard 2023)', 16626, 'USD', 'us-scorecard-rhode-island-school-of-design', null, null, 'year'),
  ('rhode-island-school-of-design', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Rhode Island School of Design''s financial-aid pages.', null),
  ('rhode-island-school-of-design', 'total_cost_of_attendance'::public.university_fact_kind, '$81,727 / year (Scorecard 2023)', 81727, 'USD', 'us-scorecard-rhode-island-school-of-design', null, null, 'year'),
  ('rhode-island-school-of-design', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Rhode Island School of Design''s international admissions / financial-aid pages.', null),
  ('rhode-island-school-of-design', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 688–750; math 708–780 (Scorecard 2023); Middle-50% ACT 31–34 (Scorecard 2023)', null, null, 'us-scorecard-rhode-island-school-of-design', null, null, null),
  ('rhode-island-school-of-design', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Rhode Island School of Design''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('rhode-island-school-of-design', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Rhode Island School of Design''s admissions pages.'),
  ('rhode-island-school-of-design', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Rhode Island School of Design''s admissions pages.'),
  ('rhode-island-school-of-design', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Rhode Island School of Design''s admissions pages.'),
  ('rhode-island-school-of-design', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 688–750; math 708–780 (Scorecard 2023)', null, 'us-scorecard-rhode-island-school-of-design', null, null),
  ('rhode-island-school-of-design', 'act'::public.requirement_kind, 'Middle-50% ACT 31–34 (Scorecard 2023)', null, 'us-scorecard-rhode-island-school-of-design', null, null),
  ('rhode-island-school-of-design', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Rhode Island School of Design''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #90: The University of Texas at Austin (UNITID 228778)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-the-university-of-texas-at-austin', 'College Scorecard — The University of Texas at Austin', 'https://collegescorecard.ed.gov/school/?228778-the_university_of_texas_at_austin', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('the-university-of-texas-at-austin', 'The University of Texas at Austin', 'Austin, Texas', 'United States', '🇺🇸', 'Public four-year institution in Austin, Texas.',
  'The University of Texas at Austin. College Scorecard (2023) reports out-of-state tuition $44,908 / year and a middle-50% SAT range Middle-50% SAT critical reading 630–740; math 620–770 (Scorecard 2023).', 'the-university-of-texas-at-austin', array[]::text[], 'us-scorecard-the-university-of-texas-at-austin', 90, 'us-4prep-ranking-scorecard-2023', 228778)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('the-university-of-texas-at-austin', 'tuition'::public.university_fact_kind, '$44,908 / year (Scorecard 2023)', 44908, 'USD', 'us-scorecard-the-university-of-texas-at-austin', null, null, 'year'),
  ('the-university-of-texas-at-austin', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check The University of Texas at Austin''s admissions / financial-aid pages.', null),
  ('the-university-of-texas-at-austin', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check The University of Texas at Austin''s admissions pages.', null),
  ('the-university-of-texas-at-austin', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check The University of Texas at Austin''s admissions pages.', null),
  ('the-university-of-texas-at-austin', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check The University of Texas at Austin''s financial-aid pages.', null),
  ('the-university-of-texas-at-austin', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check The University of Texas at Austin''s admissions pages.', null),
  ('the-university-of-texas-at-austin', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check The University of Texas at Austin''s admissions pages.', null),
  ('the-university-of-texas-at-austin', 'room_board'::public.university_fact_kind, '$14,828 / year (Scorecard 2023)', 14828, 'USD', 'us-scorecard-the-university-of-texas-at-austin', null, null, 'year'),
  ('the-university-of-texas-at-austin', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check The University of Texas at Austin''s financial-aid pages.', null),
  ('the-university-of-texas-at-austin', 'total_cost_of_attendance'::public.university_fact_kind, '$31,247 / year (Scorecard 2023)', 31247, 'USD', 'us-scorecard-the-university-of-texas-at-austin', null, null, 'year'),
  ('the-university-of-texas-at-austin', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check The University of Texas at Austin''s international admissions / financial-aid pages.', null),
  ('the-university-of-texas-at-austin', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 630–740; math 620–770 (Scorecard 2023); Middle-50% ACT 27–33 (Scorecard 2023)', null, null, 'us-scorecard-the-university-of-texas-at-austin', null, null, null),
  ('the-university-of-texas-at-austin', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask The University of Texas at Austin''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('the-university-of-texas-at-austin', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check The University of Texas at Austin''s admissions pages.'),
  ('the-university-of-texas-at-austin', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check The University of Texas at Austin''s admissions pages.'),
  ('the-university-of-texas-at-austin', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check The University of Texas at Austin''s admissions pages.'),
  ('the-university-of-texas-at-austin', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 630–740; math 620–770 (Scorecard 2023)', null, 'us-scorecard-the-university-of-texas-at-austin', null, null),
  ('the-university-of-texas-at-austin', 'act'::public.requirement_kind, 'Middle-50% ACT 27–33 (Scorecard 2023)', null, 'us-scorecard-the-university-of-texas-at-austin', null, null),
  ('the-university-of-texas-at-austin', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check The University of Texas at Austin''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #91: United States Coast Guard Academy (UNITID 130624)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-united-states-coast-guard-academy', 'College Scorecard — United States Coast Guard Academy', 'https://collegescorecard.ed.gov/school/?130624-united_states_coast_guard_academy', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('united-states-coast-guard-academy', 'United States Coast Guard Academy', 'New London, Connecticut', 'United States', '🇺🇸', 'Public four-year institution in New London, Connecticut.',
  'United States Coast Guard Academy. College Scorecard (2023) reports out-of-state tuition not reported and a middle-50% SAT range Middle-50% SAT critical reading 620–700; math 620–700 (Scorecard 2023).', 'united-states-coast-guard-academy', array[]::text[], 'us-scorecard-united-states-coast-guard-academy', 91, 'us-4prep-ranking-scorecard-2023', 130624)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('united-states-coast-guard-academy', 'tuition'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report out-of-state tuition.', 'Check United States Coast Guard Academy''s financial-aid pages.', null),
  ('united-states-coast-guard-academy', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check United States Coast Guard Academy''s admissions / financial-aid pages.', null),
  ('united-states-coast-guard-academy', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check United States Coast Guard Academy''s admissions pages.', null),
  ('united-states-coast-guard-academy', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check United States Coast Guard Academy''s admissions pages.', null),
  ('united-states-coast-guard-academy', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check United States Coast Guard Academy''s financial-aid pages.', null),
  ('united-states-coast-guard-academy', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check United States Coast Guard Academy''s admissions pages.', null),
  ('united-states-coast-guard-academy', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check United States Coast Guard Academy''s admissions pages.', null),
  ('united-states-coast-guard-academy', 'room_board'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report on-campus room and board.', 'Check United States Coast Guard Academy''s financial-aid pages.', null),
  ('united-states-coast-guard-academy', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check United States Coast Guard Academy''s financial-aid pages.', null),
  ('united-states-coast-guard-academy', 'total_cost_of_attendance'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report academic-year cost of attendance.', 'Check United States Coast Guard Academy''s financial-aid pages.', null),
  ('united-states-coast-guard-academy', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check United States Coast Guard Academy''s international admissions / financial-aid pages.', null),
  ('united-states-coast-guard-academy', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 620–700; math 620–700 (Scorecard 2023); Middle-50% ACT 27–32 (Scorecard 2023)', null, null, 'us-scorecard-united-states-coast-guard-academy', null, null, null),
  ('united-states-coast-guard-academy', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask United States Coast Guard Academy''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('united-states-coast-guard-academy', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check United States Coast Guard Academy''s admissions pages.'),
  ('united-states-coast-guard-academy', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check United States Coast Guard Academy''s admissions pages.'),
  ('united-states-coast-guard-academy', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check United States Coast Guard Academy''s admissions pages.'),
  ('united-states-coast-guard-academy', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 620–700; math 620–700 (Scorecard 2023)', null, 'us-scorecard-united-states-coast-guard-academy', null, null),
  ('united-states-coast-guard-academy', 'act'::public.requirement_kind, 'Middle-50% ACT 27–32 (Scorecard 2023)', null, 'us-scorecard-united-states-coast-guard-academy', null, null),
  ('united-states-coast-guard-academy', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check United States Coast Guard Academy''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #92: Brandeis University (UNITID 165015)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-brandeis-university', 'College Scorecard — Brandeis University', 'https://collegescorecard.ed.gov/school/?165015-brandeis_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('brandeis-university', 'Brandeis University', 'Waltham, Massachusetts', 'United States', '🇺🇸', 'Private four-year institution in Waltham, Massachusetts.',
  'Brandeis University. College Scorecard (2023) reports out-of-state tuition $68,080 / year and a middle-50% SAT range Middle-50% SAT critical reading 690–750; math 700–770 (Scorecard 2023).', 'brandeis-university', array[]::text[], 'us-scorecard-brandeis-university', 92, 'us-4prep-ranking-scorecard-2023', 165015)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('brandeis-university', 'tuition'::public.university_fact_kind, '$68,080 / year (Scorecard 2023)', 68080, 'USD', 'us-scorecard-brandeis-university', null, null, 'year'),
  ('brandeis-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Brandeis University''s admissions / financial-aid pages.', null),
  ('brandeis-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Brandeis University''s admissions pages.', null),
  ('brandeis-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Brandeis University''s admissions pages.', null),
  ('brandeis-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Brandeis University''s financial-aid pages.', null),
  ('brandeis-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Brandeis University''s admissions pages.', null),
  ('brandeis-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Brandeis University''s admissions pages.', null),
  ('brandeis-university', 'room_board'::public.university_fact_kind, '$19,944 / year (Scorecard 2023)', 19944, 'USD', 'us-scorecard-brandeis-university', null, null, 'year'),
  ('brandeis-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Brandeis University''s financial-aid pages.', null),
  ('brandeis-university', 'total_cost_of_attendance'::public.university_fact_kind, '$86,448 / year (Scorecard 2023)', 86448, 'USD', 'us-scorecard-brandeis-university', null, null, 'year'),
  ('brandeis-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Brandeis University''s international admissions / financial-aid pages.', null),
  ('brandeis-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 690–750; math 700–770 (Scorecard 2023); Middle-50% ACT 31–34 (Scorecard 2023)', null, null, 'us-scorecard-brandeis-university', null, null, null),
  ('brandeis-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Brandeis University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('brandeis-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Brandeis University''s admissions pages.'),
  ('brandeis-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Brandeis University''s admissions pages.'),
  ('brandeis-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Brandeis University''s admissions pages.'),
  ('brandeis-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 690–750; math 700–770 (Scorecard 2023)', null, 'us-scorecard-brandeis-university', null, null),
  ('brandeis-university', 'act'::public.requirement_kind, 'Middle-50% ACT 31–34 (Scorecard 2023)', null, 'us-scorecard-brandeis-university', null, null),
  ('brandeis-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Brandeis University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #93: University of Florida (UNITID 134130)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-florida', 'College Scorecard — University of Florida', 'https://collegescorecard.ed.gov/school/?134130-university_of_florida', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-florida', 'University of Florida', 'Gainesville, Florida', 'United States', '🇺🇸', 'Public four-year institution in Gainesville, Florida.',
  'University of Florida. College Scorecard (2023) reports out-of-state tuition $28,659 / year and a middle-50% SAT range Middle-50% SAT critical reading 660–730; math 660–750 (Scorecard 2023).', 'university-of-florida', array[]::text[], 'us-scorecard-university-of-florida', 93, 'us-4prep-ranking-scorecard-2023', 134130)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-florida', 'tuition'::public.university_fact_kind, '$28,659 / year (Scorecard 2023)', 28659, 'USD', 'us-scorecard-university-of-florida', null, null, 'year'),
  ('university-of-florida', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of Florida''s admissions / financial-aid pages.', null),
  ('university-of-florida', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of Florida''s admissions pages.', null),
  ('university-of-florida', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of Florida''s admissions pages.', null),
  ('university-of-florida', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of Florida''s financial-aid pages.', null),
  ('university-of-florida', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of Florida''s admissions pages.', null),
  ('university-of-florida', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of Florida''s admissions pages.', null),
  ('university-of-florida', 'room_board'::public.university_fact_kind, '$12,120 / year (Scorecard 2023)', 12120, 'USD', 'us-scorecard-university-of-florida', null, null, 'year'),
  ('university-of-florida', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of Florida''s financial-aid pages.', null),
  ('university-of-florida', 'total_cost_of_attendance'::public.university_fact_kind, '$22,523 / year (Scorecard 2023)', 22523, 'USD', 'us-scorecard-university-of-florida', null, null, 'year'),
  ('university-of-florida', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of Florida''s international admissions / financial-aid pages.', null),
  ('university-of-florida', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 660–730; math 660–750 (Scorecard 2023); Middle-50% ACT 29–33 (Scorecard 2023)', null, null, 'us-scorecard-university-of-florida', null, null, null),
  ('university-of-florida', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of Florida''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-florida', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of Florida''s admissions pages.'),
  ('university-of-florida', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of Florida''s admissions pages.'),
  ('university-of-florida', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of Florida''s admissions pages.'),
  ('university-of-florida', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 660–730; math 660–750 (Scorecard 2023)', null, 'us-scorecard-university-of-florida', null, null),
  ('university-of-florida', 'act'::public.requirement_kind, 'Middle-50% ACT 29–33 (Scorecard 2023)', null, 'us-scorecard-university-of-florida', null, null),
  ('university-of-florida', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of Florida''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #94: University of Illinois Urbana-Champaign (UNITID 145637)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-illinois-urbana-champaign', 'College Scorecard — University of Illinois Urbana-Champaign', 'https://collegescorecard.ed.gov/school/?145637-university_of_illinois_urbana_champaign', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-illinois-urbana-champaign', 'University of Illinois Urbana-Champaign', 'Champaign, Illinois', 'United States', '🇺🇸', 'Public four-year institution in Champaign, Illinois.',
  'University of Illinois Urbana-Champaign. College Scorecard (2023) reports out-of-state tuition $35,124 / year and a middle-50% SAT range Middle-50% SAT critical reading 650–740; math 660–780 (Scorecard 2023).', 'university-of-illinois-urbana-champaign', array[]::text[], 'us-scorecard-university-of-illinois-urbana-champaign', 94, 'us-4prep-ranking-scorecard-2023', 145637)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-illinois-urbana-champaign', 'tuition'::public.university_fact_kind, '$35,124 / year (Scorecard 2023)', 35124, 'USD', 'us-scorecard-university-of-illinois-urbana-champaign', null, null, 'year'),
  ('university-of-illinois-urbana-champaign', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of Illinois Urbana-Champaign''s admissions / financial-aid pages.', null),
  ('university-of-illinois-urbana-champaign', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of Illinois Urbana-Champaign''s admissions pages.', null),
  ('university-of-illinois-urbana-champaign', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of Illinois Urbana-Champaign''s admissions pages.', null),
  ('university-of-illinois-urbana-champaign', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of Illinois Urbana-Champaign''s financial-aid pages.', null),
  ('university-of-illinois-urbana-champaign', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of Illinois Urbana-Champaign''s admissions pages.', null),
  ('university-of-illinois-urbana-champaign', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of Illinois Urbana-Champaign''s admissions pages.', null),
  ('university-of-illinois-urbana-champaign', 'room_board'::public.university_fact_kind, '$14,522 / year (Scorecard 2023)', 14522, 'USD', 'us-scorecard-university-of-illinois-urbana-champaign', null, null, 'year'),
  ('university-of-illinois-urbana-champaign', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of Illinois Urbana-Champaign''s financial-aid pages.', null),
  ('university-of-illinois-urbana-champaign', 'total_cost_of_attendance'::public.university_fact_kind, '$33,642 / year (Scorecard 2023)', 33642, 'USD', 'us-scorecard-university-of-illinois-urbana-champaign', null, null, 'year'),
  ('university-of-illinois-urbana-champaign', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of Illinois Urbana-Champaign''s international admissions / financial-aid pages.', null),
  ('university-of-illinois-urbana-champaign', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 650–740; math 660–780 (Scorecard 2023); Middle-50% ACT 30–34 (Scorecard 2023)', null, null, 'us-scorecard-university-of-illinois-urbana-champaign', null, null, null),
  ('university-of-illinois-urbana-champaign', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of Illinois Urbana-Champaign''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-illinois-urbana-champaign', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of Illinois Urbana-Champaign''s admissions pages.'),
  ('university-of-illinois-urbana-champaign', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of Illinois Urbana-Champaign''s admissions pages.'),
  ('university-of-illinois-urbana-champaign', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of Illinois Urbana-Champaign''s admissions pages.'),
  ('university-of-illinois-urbana-champaign', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 650–740; math 660–780 (Scorecard 2023)', null, 'us-scorecard-university-of-illinois-urbana-champaign', null, null),
  ('university-of-illinois-urbana-champaign', 'act'::public.requirement_kind, 'Middle-50% ACT 30–34 (Scorecard 2023)', null, 'us-scorecard-university-of-illinois-urbana-champaign', null, null),
  ('university-of-illinois-urbana-champaign', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of Illinois Urbana-Champaign''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #95: George Washington University (UNITID 131469)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-george-washington-university', 'College Scorecard — George Washington University', 'https://collegescorecard.ed.gov/school/?131469-george_washington_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('george-washington-university', 'George Washington University', 'Washington, District of Columbia', 'United States', '🇺🇸', 'Private four-year institution in Washington, District of Columbia.',
  'George Washington University. College Scorecard (2023) reports out-of-state tuition $67,710 / year and a middle-50% SAT range Middle-50% SAT critical reading 680–750; math 670–750 (Scorecard 2023).', 'george-washington-university', array[]::text[], 'us-scorecard-george-washington-university', 95, 'us-4prep-ranking-scorecard-2023', 131469)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('george-washington-university', 'tuition'::public.university_fact_kind, '$67,710 / year (Scorecard 2023)', 67710, 'USD', 'us-scorecard-george-washington-university', null, null, 'year'),
  ('george-washington-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check George Washington University''s admissions / financial-aid pages.', null),
  ('george-washington-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check George Washington University''s admissions pages.', null),
  ('george-washington-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check George Washington University''s admissions pages.', null),
  ('george-washington-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check George Washington University''s financial-aid pages.', null),
  ('george-washington-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check George Washington University''s admissions pages.', null),
  ('george-washington-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check George Washington University''s admissions pages.', null),
  ('george-washington-university', 'room_board'::public.university_fact_kind, '$16,920 / year (Scorecard 2023)', 16920, 'USD', 'us-scorecard-george-washington-university', null, null, 'year'),
  ('george-washington-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check George Washington University''s financial-aid pages.', null),
  ('george-washington-university', 'total_cost_of_attendance'::public.university_fact_kind, '$83,856 / year (Scorecard 2023)', 83856, 'USD', 'us-scorecard-george-washington-university', null, null, 'year'),
  ('george-washington-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check George Washington University''s international admissions / financial-aid pages.', null),
  ('george-washington-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 680–750; math 670–750 (Scorecard 2023); Middle-50% ACT 31–34 (Scorecard 2023)', null, null, 'us-scorecard-george-washington-university', null, null, null),
  ('george-washington-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask George Washington University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('george-washington-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check George Washington University''s admissions pages.'),
  ('george-washington-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check George Washington University''s admissions pages.'),
  ('george-washington-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check George Washington University''s admissions pages.'),
  ('george-washington-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 680–750; math 670–750 (Scorecard 2023)', null, 'us-scorecard-george-washington-university', null, null),
  ('george-washington-university', 'act'::public.requirement_kind, 'Middle-50% ACT 31–34 (Scorecard 2023)', null, 'us-scorecard-george-washington-university', null, null),
  ('george-washington-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check George Washington University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #96: Bais Medrash Elyon (UNITID 245777)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-bais-medrash-elyon', 'College Scorecard — Bais Medrash Elyon', 'https://collegescorecard.ed.gov/school/?245777-bais_medrash_elyon', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('bais-medrash-elyon', 'Bais Medrash Elyon', 'Monsey, New York', 'United States', '🇺🇸', 'Private four-year institution in Monsey, New York.',
  'Bais Medrash Elyon. College Scorecard (2023) reports out-of-state tuition $8,600 / year and a middle-50% SAT range not reported.', 'bais-medrash-elyon', array[]::text[], 'us-scorecard-bais-medrash-elyon', 96, 'us-4prep-ranking-scorecard-2023', 245777)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('bais-medrash-elyon', 'tuition'::public.university_fact_kind, '$8,600 / year (Scorecard 2023)', 8600, 'USD', 'us-scorecard-bais-medrash-elyon', null, null, 'year'),
  ('bais-medrash-elyon', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Bais Medrash Elyon''s admissions / financial-aid pages.', null),
  ('bais-medrash-elyon', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Bais Medrash Elyon''s admissions pages.', null),
  ('bais-medrash-elyon', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Bais Medrash Elyon''s admissions pages.', null),
  ('bais-medrash-elyon', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Bais Medrash Elyon''s financial-aid pages.', null),
  ('bais-medrash-elyon', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Bais Medrash Elyon''s admissions pages.', null),
  ('bais-medrash-elyon', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Bais Medrash Elyon''s admissions pages.', null),
  ('bais-medrash-elyon', 'room_board'::public.university_fact_kind, '$2,800 / year (Scorecard 2023)', 2800, 'USD', 'us-scorecard-bais-medrash-elyon', null, null, 'year'),
  ('bais-medrash-elyon', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Bais Medrash Elyon''s financial-aid pages.', null),
  ('bais-medrash-elyon', 'total_cost_of_attendance'::public.university_fact_kind, '$19,500 / year (Scorecard 2023)', 19500, 'USD', 'us-scorecard-bais-medrash-elyon', null, null, 'year'),
  ('bais-medrash-elyon', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Bais Medrash Elyon''s international admissions / financial-aid pages.', null),
  ('bais-medrash-elyon', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check Bais Medrash Elyon''s admissions pages.', null),
  ('bais-medrash-elyon', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Bais Medrash Elyon''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('bais-medrash-elyon', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Bais Medrash Elyon''s admissions pages.'),
  ('bais-medrash-elyon', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Bais Medrash Elyon''s admissions pages.'),
  ('bais-medrash-elyon', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Bais Medrash Elyon''s admissions pages.'),
  ('bais-medrash-elyon', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check Bais Medrash Elyon''s admissions pages.'),
  ('bais-medrash-elyon', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check Bais Medrash Elyon''s admissions pages.'),
  ('bais-medrash-elyon', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Bais Medrash Elyon''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #97: Franklin and Marshall College (UNITID 212577)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-franklin-and-marshall-college', 'College Scorecard — Franklin and Marshall College', 'https://collegescorecard.ed.gov/school/?212577-franklin_and_marshall_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('franklin-and-marshall-college', 'Franklin and Marshall College', 'Lancaster, Pennsylvania', 'United States', '🇺🇸', 'Private four-year institution in Lancaster, Pennsylvania.',
  'Franklin and Marshall College. College Scorecard (2023) reports out-of-state tuition $70,794 / year and a middle-50% SAT range Middle-50% SAT critical reading 660–730; math 650–733 (Scorecard 2023).', 'franklin-and-marshall-college', array[]::text[], 'us-scorecard-franklin-and-marshall-college', 97, 'us-4prep-ranking-scorecard-2023', 212577)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('franklin-and-marshall-college', 'tuition'::public.university_fact_kind, '$70,794 / year (Scorecard 2023)', 70794, 'USD', 'us-scorecard-franklin-and-marshall-college', null, null, 'year'),
  ('franklin-and-marshall-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Franklin and Marshall College''s admissions / financial-aid pages.', null),
  ('franklin-and-marshall-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Franklin and Marshall College''s admissions pages.', null),
  ('franklin-and-marshall-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Franklin and Marshall College''s admissions pages.', null),
  ('franklin-and-marshall-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Franklin and Marshall College''s financial-aid pages.', null),
  ('franklin-and-marshall-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Franklin and Marshall College''s admissions pages.', null),
  ('franklin-and-marshall-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Franklin and Marshall College''s admissions pages.', null),
  ('franklin-and-marshall-college', 'room_board'::public.university_fact_kind, '$16,188 / year (Scorecard 2023)', 16188, 'USD', 'us-scorecard-franklin-and-marshall-college', null, null, 'year'),
  ('franklin-and-marshall-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Franklin and Marshall College''s financial-aid pages.', null),
  ('franklin-and-marshall-college', 'total_cost_of_attendance'::public.university_fact_kind, '$85,776 / year (Scorecard 2023)', 85776, 'USD', 'us-scorecard-franklin-and-marshall-college', null, null, 'year'),
  ('franklin-and-marshall-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Franklin and Marshall College''s international admissions / financial-aid pages.', null),
  ('franklin-and-marshall-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 660–730; math 650–733 (Scorecard 2023); Middle-50% ACT 30–33 (Scorecard 2023)', null, null, 'us-scorecard-franklin-and-marshall-college', null, null, null),
  ('franklin-and-marshall-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Franklin and Marshall College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('franklin-and-marshall-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Franklin and Marshall College''s admissions pages.'),
  ('franklin-and-marshall-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Franklin and Marshall College''s admissions pages.'),
  ('franklin-and-marshall-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Franklin and Marshall College''s admissions pages.'),
  ('franklin-and-marshall-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 660–730; math 650–733 (Scorecard 2023)', null, 'us-scorecard-franklin-and-marshall-college', null, null),
  ('franklin-and-marshall-college', 'act'::public.requirement_kind, 'Middle-50% ACT 30–33 (Scorecard 2023)', null, 'us-scorecard-franklin-and-marshall-college', null, null),
  ('franklin-and-marshall-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Franklin and Marshall College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #98: Bentley University (UNITID 164739)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-bentley-university', 'College Scorecard — Bentley University', 'https://collegescorecard.ed.gov/school/?164739-bentley_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('bentley-university', 'Bentley University', 'Waltham, Massachusetts', 'United States', '🇺🇸', 'Private four-year institution in Waltham, Massachusetts.',
  'Bentley University. College Scorecard (2023) reports out-of-state tuition $61,000 / year and a middle-50% SAT range Middle-50% SAT critical reading 630–700; math 650–730 (Scorecard 2023).', 'bentley-university', array[]::text[], 'us-scorecard-bentley-university', 98, 'us-4prep-ranking-scorecard-2023', 164739)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('bentley-university', 'tuition'::public.university_fact_kind, '$61,000 / year (Scorecard 2023)', 61000, 'USD', 'us-scorecard-bentley-university', null, null, 'year'),
  ('bentley-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Bentley University''s admissions / financial-aid pages.', null),
  ('bentley-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Bentley University''s admissions pages.', null),
  ('bentley-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Bentley University''s admissions pages.', null),
  ('bentley-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Bentley University''s financial-aid pages.', null),
  ('bentley-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Bentley University''s admissions pages.', null),
  ('bentley-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Bentley University''s admissions pages.', null),
  ('bentley-university', 'room_board'::public.university_fact_kind, '$20,140 / year (Scorecard 2023)', 20140, 'USD', 'us-scorecard-bentley-university', null, null, 'year'),
  ('bentley-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Bentley University''s financial-aid pages.', null),
  ('bentley-university', 'total_cost_of_attendance'::public.university_fact_kind, '$79,548 / year (Scorecard 2023)', 79548, 'USD', 'us-scorecard-bentley-university', null, null, 'year'),
  ('bentley-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Bentley University''s international admissions / financial-aid pages.', null),
  ('bentley-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 630–700; math 650–730 (Scorecard 2023); Middle-50% ACT 28–31 (Scorecard 2023)', null, null, 'us-scorecard-bentley-university', null, null, null),
  ('bentley-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Bentley University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('bentley-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Bentley University''s admissions pages.'),
  ('bentley-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Bentley University''s admissions pages.'),
  ('bentley-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Bentley University''s admissions pages.'),
  ('bentley-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 630–700; math 650–730 (Scorecard 2023)', null, 'us-scorecard-bentley-university', null, null),
  ('bentley-university', 'act'::public.requirement_kind, 'Middle-50% ACT 28–31 (Scorecard 2023)', null, 'us-scorecard-bentley-university', null, null),
  ('bentley-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Bentley University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #99: University of Washington-Seattle Campus (UNITID 236948)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-washington-seattle-campus', 'College Scorecard — University of Washington-Seattle Campus', 'https://collegescorecard.ed.gov/school/?236948-university_of_washington_seattle_campus', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-washington-seattle-campus', 'University of Washington-Seattle Campus', 'Seattle, Washington', 'United States', '🇺🇸', 'Public four-year institution in Seattle, Washington.',
  'University of Washington-Seattle Campus. College Scorecard (2023) reports out-of-state tuition $43,209 / year and a middle-50% SAT range not reported.', 'university-of-washington-seattle-campus', array[]::text[], 'us-scorecard-university-of-washington-seattle-campus', 99, 'us-4prep-ranking-scorecard-2023', 236948)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-washington-seattle-campus', 'tuition'::public.university_fact_kind, '$43,209 / year (Scorecard 2023)', 43209, 'USD', 'us-scorecard-university-of-washington-seattle-campus', null, null, 'year'),
  ('university-of-washington-seattle-campus', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of Washington-Seattle Campus''s admissions / financial-aid pages.', null),
  ('university-of-washington-seattle-campus', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of Washington-Seattle Campus''s admissions pages.', null),
  ('university-of-washington-seattle-campus', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of Washington-Seattle Campus''s admissions pages.', null),
  ('university-of-washington-seattle-campus', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of Washington-Seattle Campus''s financial-aid pages.', null),
  ('university-of-washington-seattle-campus', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of Washington-Seattle Campus''s admissions pages.', null),
  ('university-of-washington-seattle-campus', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of Washington-Seattle Campus''s admissions pages.', null),
  ('university-of-washington-seattle-campus', 'room_board'::public.university_fact_kind, '$18,405 / year (Scorecard 2023)', 18405, 'USD', 'us-scorecard-university-of-washington-seattle-campus', null, null, 'year'),
  ('university-of-washington-seattle-campus', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of Washington-Seattle Campus''s financial-aid pages.', null),
  ('university-of-washington-seattle-campus', 'total_cost_of_attendance'::public.university_fact_kind, '$32,446 / year (Scorecard 2023)', 32446, 'USD', 'us-scorecard-university-of-washington-seattle-campus', null, null, 'year'),
  ('university-of-washington-seattle-campus', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of Washington-Seattle Campus''s international admissions / financial-aid pages.', null),
  ('university-of-washington-seattle-campus', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check University of Washington-Seattle Campus''s admissions pages.', null),
  ('university-of-washington-seattle-campus', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of Washington-Seattle Campus''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-washington-seattle-campus', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of Washington-Seattle Campus''s admissions pages.'),
  ('university-of-washington-seattle-campus', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of Washington-Seattle Campus''s admissions pages.'),
  ('university-of-washington-seattle-campus', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of Washington-Seattle Campus''s admissions pages.'),
  ('university-of-washington-seattle-campus', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check University of Washington-Seattle Campus''s admissions pages.'),
  ('university-of-washington-seattle-campus', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check University of Washington-Seattle Campus''s admissions pages.'),
  ('university-of-washington-seattle-campus', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of Washington-Seattle Campus''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #100: University of California-Davis (UNITID 110644)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-california-davis', 'College Scorecard — University of California-Davis', 'https://collegescorecard.ed.gov/school/?110644-university_of_california_davis', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-california-davis', 'University of California-Davis', 'Davis, California', 'United States', '🇺🇸', 'Public four-year institution in Davis, California.',
  'University of California-Davis. College Scorecard (2023) reports out-of-state tuition $50,974 / year and a middle-50% SAT range not reported.', 'university-of-california-davis', array[]::text[], 'us-scorecard-university-of-california-davis', 100, 'us-4prep-ranking-scorecard-2023', 110644)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-california-davis', 'tuition'::public.university_fact_kind, '$50,974 / year (Scorecard 2023)', 50974, 'USD', 'us-scorecard-university-of-california-davis', null, null, 'year'),
  ('university-of-california-davis', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of California-Davis''s admissions / financial-aid pages.', null),
  ('university-of-california-davis', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of California-Davis''s admissions pages.', null),
  ('university-of-california-davis', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of California-Davis''s admissions pages.', null),
  ('university-of-california-davis', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of California-Davis''s financial-aid pages.', null),
  ('university-of-california-davis', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of California-Davis''s admissions pages.', null),
  ('university-of-california-davis', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of California-Davis''s admissions pages.', null),
  ('university-of-california-davis', 'room_board'::public.university_fact_kind, '$19,426 / year (Scorecard 2023)', 19426, 'USD', 'us-scorecard-university-of-california-davis', null, null, 'year'),
  ('university-of-california-davis', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of California-Davis''s financial-aid pages.', null),
  ('university-of-california-davis', 'total_cost_of_attendance'::public.university_fact_kind, '$41,238 / year (Scorecard 2023)', 41238, 'USD', 'us-scorecard-university-of-california-davis', null, null, 'year'),
  ('university-of-california-davis', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of California-Davis''s international admissions / financial-aid pages.', null),
  ('university-of-california-davis', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check University of California-Davis''s admissions pages.', null),
  ('university-of-california-davis', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of California-Davis''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-california-davis', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of California-Davis''s admissions pages.'),
  ('university-of-california-davis', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of California-Davis''s admissions pages.'),
  ('university-of-california-davis', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of California-Davis''s admissions pages.'),
  ('university-of-california-davis', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check University of California-Davis''s admissions pages.'),
  ('university-of-california-davis', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check University of California-Davis''s admissions pages.'),
  ('university-of-california-davis', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of California-Davis''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #101: University of California-Santa Barbara (UNITID 110705)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-california-santa-barbara', 'College Scorecard — University of California-Santa Barbara', 'https://collegescorecard.ed.gov/school/?110705-university_of_california_santa_barbara', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-california-santa-barbara', 'University of California-Santa Barbara', 'Santa Barbara, California', 'United States', '🇺🇸', 'Public four-year institution in Santa Barbara, California.',
  'University of California-Santa Barbara. College Scorecard (2023) reports out-of-state tuition $50,614 / year and a middle-50% SAT range not reported.', 'university-of-california-santa-barbara', array[]::text[], 'us-scorecard-university-of-california-santa-barbara', 101, 'us-4prep-ranking-scorecard-2023', 110705)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-california-santa-barbara', 'tuition'::public.university_fact_kind, '$50,614 / year (Scorecard 2023)', 50614, 'USD', 'us-scorecard-university-of-california-santa-barbara', null, null, 'year'),
  ('university-of-california-santa-barbara', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of California-Santa Barbara''s admissions / financial-aid pages.', null),
  ('university-of-california-santa-barbara', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of California-Santa Barbara''s admissions pages.', null),
  ('university-of-california-santa-barbara', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of California-Santa Barbara''s admissions pages.', null),
  ('university-of-california-santa-barbara', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of California-Santa Barbara''s financial-aid pages.', null),
  ('university-of-california-santa-barbara', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of California-Santa Barbara''s admissions pages.', null),
  ('university-of-california-santa-barbara', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of California-Santa Barbara''s admissions pages.', null),
  ('university-of-california-santa-barbara', 'room_board'::public.university_fact_kind, '$20,279 / year (Scorecard 2023)', 20279, 'USD', 'us-scorecard-university-of-california-santa-barbara', null, null, 'year'),
  ('university-of-california-santa-barbara', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of California-Santa Barbara''s financial-aid pages.', null),
  ('university-of-california-santa-barbara', 'total_cost_of_attendance'::public.university_fact_kind, '$41,573 / year (Scorecard 2023)', 41573, 'USD', 'us-scorecard-university-of-california-santa-barbara', null, null, 'year'),
  ('university-of-california-santa-barbara', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of California-Santa Barbara''s international admissions / financial-aid pages.', null),
  ('university-of-california-santa-barbara', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check University of California-Santa Barbara''s admissions pages.', null),
  ('university-of-california-santa-barbara', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of California-Santa Barbara''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-california-santa-barbara', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of California-Santa Barbara''s admissions pages.'),
  ('university-of-california-santa-barbara', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of California-Santa Barbara''s admissions pages.'),
  ('university-of-california-santa-barbara', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of California-Santa Barbara''s admissions pages.'),
  ('university-of-california-santa-barbara', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check University of California-Santa Barbara''s admissions pages.'),
  ('university-of-california-santa-barbara', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check University of California-Santa Barbara''s admissions pages.'),
  ('university-of-california-santa-barbara', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of California-Santa Barbara''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #102: Binghamton University (UNITID 196079)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-binghamton-university', 'College Scorecard — Binghamton University', 'https://collegescorecard.ed.gov/school/?196079-binghamton_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('binghamton-university', 'Binghamton University', 'Vestal, New York', 'United States', '🇺🇸', 'Public four-year institution in Vestal, New York.',
  'Binghamton University. College Scorecard (2023) reports out-of-state tuition $30,447 / year and a middle-50% SAT range Middle-50% SAT critical reading 670–740; math 670–760 (Scorecard 2023).', 'binghamton-university', array[]::text[], 'us-scorecard-binghamton-university', 102, 'us-4prep-ranking-scorecard-2023', 196079)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('binghamton-university', 'tuition'::public.university_fact_kind, '$30,447 / year (Scorecard 2023)', 30447, 'USD', 'us-scorecard-binghamton-university', null, null, 'year'),
  ('binghamton-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Binghamton University''s admissions / financial-aid pages.', null),
  ('binghamton-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Binghamton University''s admissions pages.', null),
  ('binghamton-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Binghamton University''s admissions pages.', null),
  ('binghamton-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Binghamton University''s financial-aid pages.', null),
  ('binghamton-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Binghamton University''s admissions pages.', null),
  ('binghamton-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Binghamton University''s admissions pages.', null),
  ('binghamton-university', 'room_board'::public.university_fact_kind, '$18,809 / year (Scorecard 2023)', 18809, 'USD', 'us-scorecard-binghamton-university', null, null, 'year'),
  ('binghamton-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Binghamton University''s financial-aid pages.', null),
  ('binghamton-university', 'total_cost_of_attendance'::public.university_fact_kind, '$30,345 / year (Scorecard 2023)', 30345, 'USD', 'us-scorecard-binghamton-university', null, null, 'year'),
  ('binghamton-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Binghamton University''s international admissions / financial-aid pages.', null),
  ('binghamton-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 670–740; math 670–760 (Scorecard 2023); Middle-50% ACT 30–32 (Scorecard 2023)', null, null, 'us-scorecard-binghamton-university', null, null, null),
  ('binghamton-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Binghamton University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('binghamton-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Binghamton University''s admissions pages.'),
  ('binghamton-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Binghamton University''s admissions pages.'),
  ('binghamton-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Binghamton University''s admissions pages.'),
  ('binghamton-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 670–740; math 670–760 (Scorecard 2023)', null, 'us-scorecard-binghamton-university', null, null),
  ('binghamton-university', 'act'::public.requirement_kind, 'Middle-50% ACT 30–32 (Scorecard 2023)', null, 'us-scorecard-binghamton-university', null, null),
  ('binghamton-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Binghamton University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #103: Fairfield University (UNITID 129242)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-fairfield-university', 'College Scorecard — Fairfield University', 'https://collegescorecard.ed.gov/school/?129242-fairfield_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('fairfield-university', 'Fairfield University', 'Fairfield, Connecticut', 'United States', '🇺🇸', 'Private four-year institution in Fairfield, Connecticut.',
  'Fairfield University. College Scorecard (2023) reports out-of-state tuition $58,350 / year and a middle-50% SAT range Middle-50% SAT critical reading 630–700; math 630–690 (Scorecard 2023).', 'fairfield-university', array[]::text[], 'us-scorecard-fairfield-university', 103, 'us-4prep-ranking-scorecard-2023', 129242)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('fairfield-university', 'tuition'::public.university_fact_kind, '$58,350 / year (Scorecard 2023)', 58350, 'USD', 'us-scorecard-fairfield-university', null, null, 'year'),
  ('fairfield-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Fairfield University''s admissions / financial-aid pages.', null),
  ('fairfield-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Fairfield University''s admissions pages.', null),
  ('fairfield-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Fairfield University''s admissions pages.', null),
  ('fairfield-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Fairfield University''s financial-aid pages.', null),
  ('fairfield-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Fairfield University''s admissions pages.', null),
  ('fairfield-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Fairfield University''s admissions pages.', null),
  ('fairfield-university', 'room_board'::public.university_fact_kind, '$19,838 / year (Scorecard 2023)', 19838, 'USD', 'us-scorecard-fairfield-university', null, null, 'year'),
  ('fairfield-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Fairfield University''s financial-aid pages.', null),
  ('fairfield-university', 'total_cost_of_attendance'::public.university_fact_kind, '$76,074 / year (Scorecard 2023)', 76074, 'USD', 'us-scorecard-fairfield-university', null, null, 'year'),
  ('fairfield-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Fairfield University''s international admissions / financial-aid pages.', null),
  ('fairfield-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 630–700; math 630–690 (Scorecard 2023); Middle-50% ACT 29–32 (Scorecard 2023)', null, null, 'us-scorecard-fairfield-university', null, null, null),
  ('fairfield-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Fairfield University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('fairfield-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Fairfield University''s admissions pages.'),
  ('fairfield-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Fairfield University''s admissions pages.'),
  ('fairfield-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Fairfield University''s admissions pages.'),
  ('fairfield-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 630–700; math 630–690 (Scorecard 2023)', null, 'us-scorecard-fairfield-university', null, null),
  ('fairfield-university', 'act'::public.requirement_kind, 'Middle-50% ACT 29–32 (Scorecard 2023)', null, 'us-scorecard-fairfield-university', null, null),
  ('fairfield-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Fairfield University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #104: Bryn Mawr College (UNITID 211273)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-bryn-mawr-college', 'College Scorecard — Bryn Mawr College', 'https://collegescorecard.ed.gov/school/?211273-bryn_mawr_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('bryn-mawr-college', 'Bryn Mawr College', 'Bryn Mawr, Pennsylvania', 'United States', '🇺🇸', 'Private four-year institution in Bryn Mawr, Pennsylvania.',
  'Bryn Mawr College. College Scorecard (2023) reports out-of-state tuition $65,920 / year and a middle-50% SAT range Middle-50% SAT critical reading 660–750; math 620–760 (Scorecard 2023).', 'bryn-mawr-college', array[]::text[], 'us-scorecard-bryn-mawr-college', 104, 'us-4prep-ranking-scorecard-2023', 211273)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('bryn-mawr-college', 'tuition'::public.university_fact_kind, '$65,920 / year (Scorecard 2023)', 65920, 'USD', 'us-scorecard-bryn-mawr-college', null, null, 'year'),
  ('bryn-mawr-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Bryn Mawr College''s admissions / financial-aid pages.', null),
  ('bryn-mawr-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Bryn Mawr College''s admissions pages.', null),
  ('bryn-mawr-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Bryn Mawr College''s admissions pages.', null),
  ('bryn-mawr-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Bryn Mawr College''s financial-aid pages.', null),
  ('bryn-mawr-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Bryn Mawr College''s admissions pages.', null),
  ('bryn-mawr-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Bryn Mawr College''s admissions pages.', null),
  ('bryn-mawr-college', 'room_board'::public.university_fact_kind, '$19,400 / year (Scorecard 2023)', 19400, 'USD', 'us-scorecard-bryn-mawr-college', null, null, 'year'),
  ('bryn-mawr-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Bryn Mawr College''s financial-aid pages.', null),
  ('bryn-mawr-college', 'total_cost_of_attendance'::public.university_fact_kind, '$83,250 / year (Scorecard 2023)', 83250, 'USD', 'us-scorecard-bryn-mawr-college', null, null, 'year'),
  ('bryn-mawr-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Bryn Mawr College''s international admissions / financial-aid pages.', null),
  ('bryn-mawr-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 660–750; math 620–760 (Scorecard 2023); Middle-50% ACT 29–33 (Scorecard 2023)', null, null, 'us-scorecard-bryn-mawr-college', null, null, null),
  ('bryn-mawr-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Bryn Mawr College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('bryn-mawr-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Bryn Mawr College''s admissions pages.'),
  ('bryn-mawr-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Bryn Mawr College''s admissions pages.'),
  ('bryn-mawr-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Bryn Mawr College''s admissions pages.'),
  ('bryn-mawr-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 660–750; math 620–760 (Scorecard 2023)', null, 'us-scorecard-bryn-mawr-college', null, null),
  ('bryn-mawr-college', 'act'::public.requirement_kind, 'Middle-50% ACT 29–33 (Scorecard 2023)', null, 'us-scorecard-bryn-mawr-college', null, null),
  ('bryn-mawr-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Bryn Mawr College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #105: Smith College (UNITID 167835)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-smith-college', 'College Scorecard — Smith College', 'https://collegescorecard.ed.gov/school/?167835-smith_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('smith-college', 'Smith College', 'Northampton, Massachusetts', 'United States', '🇺🇸', 'Private four-year institution in Northampton, Massachusetts.',
  'Smith College. College Scorecard (2023) reports out-of-state tuition $65,178 / year and a middle-50% SAT range Middle-50% SAT critical reading 720–760; math 700–780 (Scorecard 2023).', 'smith-college', array[]::text[], 'us-scorecard-smith-college', 105, 'us-4prep-ranking-scorecard-2023', 167835)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('smith-college', 'tuition'::public.university_fact_kind, '$65,178 / year (Scorecard 2023)', 65178, 'USD', 'us-scorecard-smith-college', null, null, 'year'),
  ('smith-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Smith College''s admissions / financial-aid pages.', null),
  ('smith-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Smith College''s admissions pages.', null),
  ('smith-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Smith College''s admissions pages.', null),
  ('smith-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Smith College''s financial-aid pages.', null),
  ('smith-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Smith College''s admissions pages.', null),
  ('smith-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Smith College''s admissions pages.', null),
  ('smith-college', 'room_board'::public.university_fact_kind, '$22,570 / year (Scorecard 2023)', 22570, 'USD', 'us-scorecard-smith-college', null, null, 'year'),
  ('smith-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Smith College''s financial-aid pages.', null),
  ('smith-college', 'total_cost_of_attendance'::public.university_fact_kind, '$86,030 / year (Scorecard 2023)', 86030, 'USD', 'us-scorecard-smith-college', null, null, 'year'),
  ('smith-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Smith College''s international admissions / financial-aid pages.', null),
  ('smith-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 720–760; math 700–780 (Scorecard 2023); Middle-50% ACT 32–35 (Scorecard 2023)', null, null, 'us-scorecard-smith-college', null, null, null),
  ('smith-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Smith College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('smith-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Smith College''s admissions pages.'),
  ('smith-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Smith College''s admissions pages.'),
  ('smith-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Smith College''s admissions pages.'),
  ('smith-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 720–760; math 700–780 (Scorecard 2023)', null, 'us-scorecard-smith-college', null, null),
  ('smith-college', 'act'::public.requirement_kind, 'Middle-50% ACT 32–35 (Scorecard 2023)', null, 'us-scorecard-smith-college', null, null),
  ('smith-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Smith College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #106: Kenyon College (UNITID 203535)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-kenyon-college', 'College Scorecard — Kenyon College', 'https://collegescorecard.ed.gov/school/?203535-kenyon_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('kenyon-college', 'Kenyon College', 'Gambier, Ohio', 'United States', '🇺🇸', 'Private four-year institution in Gambier, Ohio.',
  'Kenyon College. College Scorecard (2023) reports out-of-state tuition $71,520 / year and a middle-50% SAT range Middle-50% SAT critical reading 680–743; math 678–760 (Scorecard 2023).', 'kenyon-college', array[]::text[], 'us-scorecard-kenyon-college', 106, 'us-4prep-ranking-scorecard-2023', 203535)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('kenyon-college', 'tuition'::public.university_fact_kind, '$71,520 / year (Scorecard 2023)', 71520, 'USD', 'us-scorecard-kenyon-college', null, null, 'year'),
  ('kenyon-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Kenyon College''s admissions / financial-aid pages.', null),
  ('kenyon-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Kenyon College''s admissions pages.', null),
  ('kenyon-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Kenyon College''s admissions pages.', null),
  ('kenyon-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Kenyon College''s financial-aid pages.', null),
  ('kenyon-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Kenyon College''s admissions pages.', null),
  ('kenyon-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Kenyon College''s admissions pages.', null),
  ('kenyon-college', 'room_board'::public.university_fact_kind, '$15,640 / year (Scorecard 2023)', 15640, 'USD', 'us-scorecard-kenyon-college', null, null, 'year'),
  ('kenyon-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Kenyon College''s financial-aid pages.', null),
  ('kenyon-college', 'total_cost_of_attendance'::public.university_fact_kind, '$87,590 / year (Scorecard 2023)', 87590, 'USD', 'us-scorecard-kenyon-college', null, null, 'year'),
  ('kenyon-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Kenyon College''s international admissions / financial-aid pages.', null),
  ('kenyon-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 680–743; math 678–760 (Scorecard 2023); Middle-50% ACT 31–33 (Scorecard 2023)', null, null, 'us-scorecard-kenyon-college', null, null, null),
  ('kenyon-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Kenyon College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('kenyon-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Kenyon College''s admissions pages.'),
  ('kenyon-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Kenyon College''s admissions pages.'),
  ('kenyon-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Kenyon College''s admissions pages.'),
  ('kenyon-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 680–743; math 678–760 (Scorecard 2023)', null, 'us-scorecard-kenyon-college', null, null),
  ('kenyon-college', 'act'::public.requirement_kind, 'Middle-50% ACT 31–33 (Scorecard 2023)', null, 'us-scorecard-kenyon-college', null, null),
  ('kenyon-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Kenyon College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #107: Connecticut College (UNITID 128902)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-connecticut-college', 'College Scorecard — Connecticut College', 'https://collegescorecard.ed.gov/school/?128902-connecticut_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('connecticut-college', 'Connecticut College', 'New London, Connecticut', 'United States', '🇺🇸', 'Private four-year institution in New London, Connecticut.',
  'Connecticut College. College Scorecard (2023) reports out-of-state tuition $67,242 / year and a middle-50% SAT range Middle-50% SAT critical reading 690–760; math 660–740 (Scorecard 2023).', 'connecticut-college', array[]::text[], 'us-scorecard-connecticut-college', 107, 'us-4prep-ranking-scorecard-2023', 128902)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('connecticut-college', 'tuition'::public.university_fact_kind, '$67,242 / year (Scorecard 2023)', 67242, 'USD', 'us-scorecard-connecticut-college', null, null, 'year'),
  ('connecticut-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Connecticut College''s admissions / financial-aid pages.', null),
  ('connecticut-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Connecticut College''s admissions pages.', null),
  ('connecticut-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Connecticut College''s admissions pages.', null),
  ('connecticut-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Connecticut College''s financial-aid pages.', null),
  ('connecticut-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Connecticut College''s admissions pages.', null),
  ('connecticut-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Connecticut College''s admissions pages.', null),
  ('connecticut-college', 'room_board'::public.university_fact_kind, '$18,558 / year (Scorecard 2023)', 18558, 'USD', 'us-scorecard-connecticut-college', null, null, 'year'),
  ('connecticut-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Connecticut College''s financial-aid pages.', null),
  ('connecticut-college', 'total_cost_of_attendance'::public.university_fact_kind, '$84,623 / year (Scorecard 2023)', 84623, 'USD', 'us-scorecard-connecticut-college', null, null, 'year'),
  ('connecticut-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Connecticut College''s international admissions / financial-aid pages.', null),
  ('connecticut-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 690–760; math 660–740 (Scorecard 2023); Middle-50% ACT 30–33 (Scorecard 2023)', null, null, 'us-scorecard-connecticut-college', null, null, null),
  ('connecticut-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Connecticut College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('connecticut-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Connecticut College''s admissions pages.'),
  ('connecticut-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Connecticut College''s admissions pages.'),
  ('connecticut-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Connecticut College''s admissions pages.'),
  ('connecticut-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 690–760; math 660–740 (Scorecard 2023)', null, 'us-scorecard-connecticut-college', null, null),
  ('connecticut-college', 'act'::public.requirement_kind, 'Middle-50% ACT 30–33 (Scorecard 2023)', null, 'us-scorecard-connecticut-college', null, null),
  ('connecticut-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Connecticut College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #108: Union College (UNITID 196866)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-union-college', 'College Scorecard — Union College', 'https://collegescorecard.ed.gov/school/?196866-union_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('union-college', 'Union College', 'Schenectady, New York', 'United States', '🇺🇸', 'Private four-year institution in Schenectady, New York.',
  'Union College. College Scorecard (2023) reports out-of-state tuition $69,039 / year and a middle-50% SAT range Middle-50% SAT critical reading 660–720; math 650–760 (Scorecard 2023).', 'union-college', array[]::text[], 'us-scorecard-union-college', 108, 'us-4prep-ranking-scorecard-2023', 196866)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('union-college', 'tuition'::public.university_fact_kind, '$69,039 / year (Scorecard 2023)', 69039, 'USD', 'us-scorecard-union-college', null, null, 'year'),
  ('union-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Union College''s admissions / financial-aid pages.', null),
  ('union-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Union College''s admissions pages.', null),
  ('union-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Union College''s admissions pages.', null),
  ('union-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Union College''s financial-aid pages.', null),
  ('union-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Union College''s admissions pages.', null),
  ('union-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Union College''s admissions pages.', null),
  ('union-college', 'room_board'::public.university_fact_kind, '$17,010 / year (Scorecard 2023)', 17010, 'USD', 'us-scorecard-union-college', null, null, 'year'),
  ('union-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Union College''s financial-aid pages.', null),
  ('union-college', 'total_cost_of_attendance'::public.university_fact_kind, '$84,561 / year (Scorecard 2023)', 84561, 'USD', 'us-scorecard-union-college', null, null, 'year'),
  ('union-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Union College''s international admissions / financial-aid pages.', null),
  ('union-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 660–720; math 650–760 (Scorecard 2023); Middle-50% ACT 29–33 (Scorecard 2023)', null, null, 'us-scorecard-union-college', null, null, null),
  ('union-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Union College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('union-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Union College''s admissions pages.'),
  ('union-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Union College''s admissions pages.'),
  ('union-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Union College''s admissions pages.'),
  ('union-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 660–720; math 650–760 (Scorecard 2023)', null, 'us-scorecard-union-college', null, null),
  ('union-college', 'act'::public.requirement_kind, 'Middle-50% ACT 29–33 (Scorecard 2023)', null, 'us-scorecard-union-college', null, null),
  ('union-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Union College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #109: American University of Health Sciences (UNITID 433004)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-american-university-of-health-sciences', 'College Scorecard — American University of Health Sciences', 'https://collegescorecard.ed.gov/school/?433004-american_university_of_health_sciences', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('american-university-of-health-sciences', 'American University of Health Sciences', 'Signal Hill, California', 'United States', '🇺🇸', 'Private four-year institution in Signal Hill, California.',
  'American University of Health Sciences. College Scorecard (2023) reports out-of-state tuition $24,575 / year and a middle-50% SAT range not reported.', 'american-university-of-health-sciences', array[]::text[], 'us-scorecard-american-university-of-health-sciences', 109, 'us-4prep-ranking-scorecard-2023', 433004)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('american-university-of-health-sciences', 'tuition'::public.university_fact_kind, '$24,575 / year (Scorecard 2023)', 24575, 'USD', 'us-scorecard-american-university-of-health-sciences', null, null, 'year'),
  ('american-university-of-health-sciences', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check American University of Health Sciences''s admissions / financial-aid pages.', null),
  ('american-university-of-health-sciences', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check American University of Health Sciences''s admissions pages.', null),
  ('american-university-of-health-sciences', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check American University of Health Sciences''s admissions pages.', null),
  ('american-university-of-health-sciences', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check American University of Health Sciences''s financial-aid pages.', null),
  ('american-university-of-health-sciences', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check American University of Health Sciences''s admissions pages.', null),
  ('american-university-of-health-sciences', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check American University of Health Sciences''s admissions pages.', null),
  ('american-university-of-health-sciences', 'room_board'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report on-campus room and board.', 'Check American University of Health Sciences''s financial-aid pages.', null),
  ('american-university-of-health-sciences', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check American University of Health Sciences''s financial-aid pages.', null),
  ('american-university-of-health-sciences', 'total_cost_of_attendance'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report academic-year cost of attendance.', 'Check American University of Health Sciences''s financial-aid pages.', null),
  ('american-university-of-health-sciences', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check American University of Health Sciences''s international admissions / financial-aid pages.', null),
  ('american-university-of-health-sciences', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check American University of Health Sciences''s admissions pages.', null),
  ('american-university-of-health-sciences', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask American University of Health Sciences''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('american-university-of-health-sciences', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check American University of Health Sciences''s admissions pages.'),
  ('american-university-of-health-sciences', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check American University of Health Sciences''s admissions pages.'),
  ('american-university-of-health-sciences', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check American University of Health Sciences''s admissions pages.'),
  ('american-university-of-health-sciences', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check American University of Health Sciences''s admissions pages.'),
  ('american-university-of-health-sciences', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check American University of Health Sciences''s admissions pages.'),
  ('american-university-of-health-sciences', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check American University of Health Sciences''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #110: Trinity University (UNITID 229267)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-trinity-university', 'College Scorecard — Trinity University', 'https://collegescorecard.ed.gov/school/?229267-trinity_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('trinity-university', 'Trinity University', 'San Antonio, Texas', 'United States', '🇺🇸', 'Private four-year institution in San Antonio, Texas.',
  'Trinity University. College Scorecard (2023) reports out-of-state tuition $53,676 / year and a middle-50% SAT range Middle-50% SAT critical reading 680–750; math 660–750 (Scorecard 2023).', 'trinity-university', array[]::text[], 'us-scorecard-trinity-university', 110, 'us-4prep-ranking-scorecard-2023', 229267)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('trinity-university', 'tuition'::public.university_fact_kind, '$53,676 / year (Scorecard 2023)', 53676, 'USD', 'us-scorecard-trinity-university', null, null, 'year'),
  ('trinity-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Trinity University''s admissions / financial-aid pages.', null),
  ('trinity-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Trinity University''s admissions pages.', null),
  ('trinity-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Trinity University''s admissions pages.', null),
  ('trinity-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Trinity University''s financial-aid pages.', null),
  ('trinity-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Trinity University''s admissions pages.', null),
  ('trinity-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Trinity University''s admissions pages.', null),
  ('trinity-university', 'room_board'::public.university_fact_kind, '$14,750 / year (Scorecard 2023)', 14750, 'USD', 'us-scorecard-trinity-university', null, null, 'year'),
  ('trinity-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Trinity University''s financial-aid pages.', null),
  ('trinity-university', 'total_cost_of_attendance'::public.university_fact_kind, '$68,224 / year (Scorecard 2023)', 68224, 'USD', 'us-scorecard-trinity-university', null, null, 'year'),
  ('trinity-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Trinity University''s international admissions / financial-aid pages.', null),
  ('trinity-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 680–750; math 660–750 (Scorecard 2023); Middle-50% ACT 31–34 (Scorecard 2023)', null, null, 'us-scorecard-trinity-university', null, null, null),
  ('trinity-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Trinity University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('trinity-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Trinity University''s admissions pages.'),
  ('trinity-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Trinity University''s admissions pages.'),
  ('trinity-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Trinity University''s admissions pages.'),
  ('trinity-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 680–750; math 660–750 (Scorecard 2023)', null, 'us-scorecard-trinity-university', null, null),
  ('trinity-university', 'act'::public.requirement_kind, 'Middle-50% ACT 31–34 (Scorecard 2023)', null, 'us-scorecard-trinity-university', null, null),
  ('trinity-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Trinity University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #111: Occidental College (UNITID 120254)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-occidental-college', 'College Scorecard — Occidental College', 'https://collegescorecard.ed.gov/school/?120254-occidental_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('occidental-college', 'Occidental College', 'Los Angeles, California', 'United States', '🇺🇸', 'Private four-year institution in Los Angeles, California.',
  'Occidental College. College Scorecard (2023) reports out-of-state tuition $66,274 / year and a middle-50% SAT range Middle-50% SAT critical reading 690–750; math 690–770 (Scorecard 2023).', 'occidental-college', array[]::text[], 'us-scorecard-occidental-college', 111, 'us-4prep-ranking-scorecard-2023', 120254)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('occidental-college', 'tuition'::public.university_fact_kind, '$66,274 / year (Scorecard 2023)', 66274, 'USD', 'us-scorecard-occidental-college', null, null, 'year'),
  ('occidental-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Occidental College''s admissions / financial-aid pages.', null),
  ('occidental-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Occidental College''s admissions pages.', null),
  ('occidental-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Occidental College''s admissions pages.', null),
  ('occidental-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Occidental College''s financial-aid pages.', null),
  ('occidental-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Occidental College''s admissions pages.', null),
  ('occidental-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Occidental College''s admissions pages.', null),
  ('occidental-college', 'room_board'::public.university_fact_kind, '$19,252 / year (Scorecard 2023)', 19252, 'USD', 'us-scorecard-occidental-college', null, null, 'year'),
  ('occidental-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Occidental College''s financial-aid pages.', null),
  ('occidental-college', 'total_cost_of_attendance'::public.university_fact_kind, '$84,800 / year (Scorecard 2023)', 84800, 'USD', 'us-scorecard-occidental-college', null, null, 'year'),
  ('occidental-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Occidental College''s international admissions / financial-aid pages.', null),
  ('occidental-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 690–750; math 690–770 (Scorecard 2023); Middle-50% ACT 31–34 (Scorecard 2023)', null, null, 'us-scorecard-occidental-college', null, null, null),
  ('occidental-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Occidental College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('occidental-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Occidental College''s admissions pages.'),
  ('occidental-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Occidental College''s admissions pages.'),
  ('occidental-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Occidental College''s admissions pages.'),
  ('occidental-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 690–750; math 690–770 (Scorecard 2023)', null, 'us-scorecard-occidental-college', null, null),
  ('occidental-college', 'act'::public.requirement_kind, 'Middle-50% ACT 31–34 (Scorecard 2023)', null, 'us-scorecard-occidental-college', null, null),
  ('occidental-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Occidental College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #112: Redeemers University North America (UNITID 497462)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-redeemers-university-north-america', 'College Scorecard — Redeemers University North America', 'https://collegescorecard.ed.gov/school/?497462-redeemers_university_north_america', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('redeemers-university-north-america', 'Redeemers University North America', 'Greenville, Texas', 'United States', '🇺🇸', 'Private four-year institution in Greenville, Texas.',
  'Redeemers University North America. College Scorecard (2023) reports out-of-state tuition $7,000 / year and a middle-50% SAT range not reported.', 'redeemers-university-north-america', array[]::text[], 'us-scorecard-redeemers-university-north-america', 112, 'us-4prep-ranking-scorecard-2023', 497462)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('redeemers-university-north-america', 'tuition'::public.university_fact_kind, '$7,000 / year (Scorecard 2023)', 7000, 'USD', 'us-scorecard-redeemers-university-north-america', null, null, 'year'),
  ('redeemers-university-north-america', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Redeemers University North America''s admissions / financial-aid pages.', null),
  ('redeemers-university-north-america', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Redeemers University North America''s admissions pages.', null),
  ('redeemers-university-north-america', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Redeemers University North America''s admissions pages.', null),
  ('redeemers-university-north-america', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Redeemers University North America''s financial-aid pages.', null),
  ('redeemers-university-north-america', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Redeemers University North America''s admissions pages.', null),
  ('redeemers-university-north-america', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Redeemers University North America''s admissions pages.', null),
  ('redeemers-university-north-america', 'room_board'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report on-campus room and board.', 'Check Redeemers University North America''s financial-aid pages.', null),
  ('redeemers-university-north-america', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Redeemers University North America''s financial-aid pages.', null),
  ('redeemers-university-north-america', 'total_cost_of_attendance'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report academic-year cost of attendance.', 'Check Redeemers University North America''s financial-aid pages.', null),
  ('redeemers-university-north-america', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Redeemers University North America''s international admissions / financial-aid pages.', null),
  ('redeemers-university-north-america', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check Redeemers University North America''s admissions pages.', null),
  ('redeemers-university-north-america', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Redeemers University North America''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('redeemers-university-north-america', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Redeemers University North America''s admissions pages.'),
  ('redeemers-university-north-america', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Redeemers University North America''s admissions pages.'),
  ('redeemers-university-north-america', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Redeemers University North America''s admissions pages.'),
  ('redeemers-university-north-america', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check Redeemers University North America''s admissions pages.'),
  ('redeemers-university-north-america', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check Redeemers University North America''s admissions pages.'),
  ('redeemers-university-north-america', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Redeemers University North America''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #113: University of Wisconsin-Madison (UNITID 240444)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-wisconsin-madison', 'College Scorecard — University of Wisconsin-Madison', 'https://collegescorecard.ed.gov/school/?240444-university_of_wisconsin_madison', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-wisconsin-madison', 'University of Wisconsin-Madison', 'Madison, Wisconsin', 'United States', '🇺🇸', 'Public four-year institution in Madison, Wisconsin.',
  'University of Wisconsin-Madison. College Scorecard (2023) reports out-of-state tuition $42,103 / year and a middle-50% SAT range Middle-50% SAT critical reading 670–740; math 710–780 (Scorecard 2023).', 'university-of-wisconsin-madison', array[]::text[], 'us-scorecard-university-of-wisconsin-madison', 113, 'us-4prep-ranking-scorecard-2023', 240444)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-wisconsin-madison', 'tuition'::public.university_fact_kind, '$42,103 / year (Scorecard 2023)', 42103, 'USD', 'us-scorecard-university-of-wisconsin-madison', null, null, 'year'),
  ('university-of-wisconsin-madison', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of Wisconsin-Madison''s admissions / financial-aid pages.', null),
  ('university-of-wisconsin-madison', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of Wisconsin-Madison''s admissions pages.', null),
  ('university-of-wisconsin-madison', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of Wisconsin-Madison''s admissions pages.', null),
  ('university-of-wisconsin-madison', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of Wisconsin-Madison''s financial-aid pages.', null),
  ('university-of-wisconsin-madison', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of Wisconsin-Madison''s admissions pages.', null),
  ('university-of-wisconsin-madison', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of Wisconsin-Madison''s admissions pages.', null),
  ('university-of-wisconsin-madison', 'room_board'::public.university_fact_kind, '$14,124 / year (Scorecard 2023)', 14124, 'USD', 'us-scorecard-university-of-wisconsin-madison', null, null, 'year'),
  ('university-of-wisconsin-madison', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of Wisconsin-Madison''s financial-aid pages.', null),
  ('university-of-wisconsin-madison', 'total_cost_of_attendance'::public.university_fact_kind, '$28,679 / year (Scorecard 2023)', 28679, 'USD', 'us-scorecard-university-of-wisconsin-madison', null, null, 'year'),
  ('university-of-wisconsin-madison', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of Wisconsin-Madison''s international admissions / financial-aid pages.', null),
  ('university-of-wisconsin-madison', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 670–740; math 710–780 (Scorecard 2023); Middle-50% ACT 29–33 (Scorecard 2023)', null, null, 'us-scorecard-university-of-wisconsin-madison', null, null, null),
  ('university-of-wisconsin-madison', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of Wisconsin-Madison''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-wisconsin-madison', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of Wisconsin-Madison''s admissions pages.'),
  ('university-of-wisconsin-madison', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of Wisconsin-Madison''s admissions pages.'),
  ('university-of-wisconsin-madison', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of Wisconsin-Madison''s admissions pages.'),
  ('university-of-wisconsin-madison', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 670–740; math 710–780 (Scorecard 2023)', null, 'us-scorecard-university-of-wisconsin-madison', null, null),
  ('university-of-wisconsin-madison', 'act'::public.requirement_kind, 'Middle-50% ACT 29–33 (Scorecard 2023)', null, 'us-scorecard-university-of-wisconsin-madison', null, null),
  ('university-of-wisconsin-madison', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of Wisconsin-Madison''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #114: Skidmore College (UNITID 195526)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-skidmore-college', 'College Scorecard — Skidmore College', 'https://collegescorecard.ed.gov/school/?195526-skidmore_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('skidmore-college', 'Skidmore College', 'Saratoga Springs, New York', 'United States', '🇺🇸', 'Private four-year institution in Saratoga Springs, New York.',
  'Skidmore College. College Scorecard (2023) reports out-of-state tuition $67,290 / year and a middle-50% SAT range Middle-50% SAT critical reading 680–750; math 660–730 (Scorecard 2023).', 'skidmore-college', array[]::text[], 'us-scorecard-skidmore-college', 114, 'us-4prep-ranking-scorecard-2023', 195526)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('skidmore-college', 'tuition'::public.university_fact_kind, '$67,290 / year (Scorecard 2023)', 67290, 'USD', 'us-scorecard-skidmore-college', null, null, 'year'),
  ('skidmore-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Skidmore College''s admissions / financial-aid pages.', null),
  ('skidmore-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Skidmore College''s admissions pages.', null),
  ('skidmore-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Skidmore College''s admissions pages.', null),
  ('skidmore-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Skidmore College''s financial-aid pages.', null),
  ('skidmore-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Skidmore College''s admissions pages.', null),
  ('skidmore-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Skidmore College''s admissions pages.', null),
  ('skidmore-college', 'room_board'::public.university_fact_kind, '$17,940 / year (Scorecard 2023)', 17940, 'USD', 'us-scorecard-skidmore-college', null, null, 'year'),
  ('skidmore-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Skidmore College''s financial-aid pages.', null),
  ('skidmore-college', 'total_cost_of_attendance'::public.university_fact_kind, '$85,270 / year (Scorecard 2023)', 85270, 'USD', 'us-scorecard-skidmore-college', null, null, 'year'),
  ('skidmore-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Skidmore College''s international admissions / financial-aid pages.', null),
  ('skidmore-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 680–750; math 660–730 (Scorecard 2023); Middle-50% ACT 31–33 (Scorecard 2023)', null, null, 'us-scorecard-skidmore-college', null, null, null),
  ('skidmore-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Skidmore College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('skidmore-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Skidmore College''s admissions pages.'),
  ('skidmore-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Skidmore College''s admissions pages.'),
  ('skidmore-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Skidmore College''s admissions pages.'),
  ('skidmore-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 680–750; math 660–730 (Scorecard 2023)', null, 'us-scorecard-skidmore-college', null, null),
  ('skidmore-college', 'act'::public.requirement_kind, 'Middle-50% ACT 31–33 (Scorecard 2023)', null, 'us-scorecard-skidmore-college', null, null),
  ('skidmore-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Skidmore College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #115: Pitzer College (UNITID 121257)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-pitzer-college', 'College Scorecard — Pitzer College', 'https://collegescorecard.ed.gov/school/?121257-pitzer_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('pitzer-college', 'Pitzer College', 'Claremont, California', 'United States', '🇺🇸', 'Private four-year institution in Claremont, California.',
  'Pitzer College. College Scorecard (2023) reports out-of-state tuition $65,192 / year and a middle-50% SAT range not reported.', 'pitzer-college', array[]::text[], 'us-scorecard-pitzer-college', 115, 'us-4prep-ranking-scorecard-2023', 121257)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('pitzer-college', 'tuition'::public.university_fact_kind, '$65,192 / year (Scorecard 2023)', 65192, 'USD', 'us-scorecard-pitzer-college', null, null, 'year'),
  ('pitzer-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Pitzer College''s admissions / financial-aid pages.', null),
  ('pitzer-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Pitzer College''s admissions pages.', null),
  ('pitzer-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Pitzer College''s admissions pages.', null),
  ('pitzer-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Pitzer College''s financial-aid pages.', null),
  ('pitzer-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Pitzer College''s admissions pages.', null),
  ('pitzer-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Pitzer College''s admissions pages.', null),
  ('pitzer-college', 'room_board'::public.university_fact_kind, '$22,150 / year (Scorecard 2023)', 22150, 'USD', 'us-scorecard-pitzer-college', null, null, 'year'),
  ('pitzer-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Pitzer College''s financial-aid pages.', null),
  ('pitzer-college', 'total_cost_of_attendance'::public.university_fact_kind, '$86,466 / year (Scorecard 2023)', 86466, 'USD', 'us-scorecard-pitzer-college', null, null, 'year'),
  ('pitzer-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Pitzer College''s international admissions / financial-aid pages.', null),
  ('pitzer-college', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check Pitzer College''s admissions pages.', null),
  ('pitzer-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Pitzer College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('pitzer-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Pitzer College''s admissions pages.'),
  ('pitzer-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Pitzer College''s admissions pages.'),
  ('pitzer-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Pitzer College''s admissions pages.'),
  ('pitzer-college', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check Pitzer College''s admissions pages.'),
  ('pitzer-college', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check Pitzer College''s admissions pages.'),
  ('pitzer-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Pitzer College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #116: Grinnell College (UNITID 153384)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-grinnell-college', 'College Scorecard — Grinnell College', 'https://collegescorecard.ed.gov/school/?153384-grinnell_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('grinnell-college', 'Grinnell College', 'Grinnell, Iowa', 'United States', '🇺🇸', 'Private four-year institution in Grinnell, Iowa.',
  'Grinnell College. College Scorecard (2023) reports out-of-state tuition $68,106 / year and a middle-50% SAT range Middle-50% SAT critical reading 700–750; math 710–790 (Scorecard 2023).', 'grinnell-college', array[]::text[], 'us-scorecard-grinnell-college', 116, 'us-4prep-ranking-scorecard-2023', 153384)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('grinnell-college', 'tuition'::public.university_fact_kind, '$68,106 / year (Scorecard 2023)', 68106, 'USD', 'us-scorecard-grinnell-college', null, null, 'year'),
  ('grinnell-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Grinnell College''s admissions / financial-aid pages.', null),
  ('grinnell-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Grinnell College''s admissions pages.', null),
  ('grinnell-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Grinnell College''s admissions pages.', null),
  ('grinnell-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Grinnell College''s financial-aid pages.', null),
  ('grinnell-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Grinnell College''s admissions pages.', null),
  ('grinnell-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Grinnell College''s admissions pages.', null),
  ('grinnell-college', 'room_board'::public.university_fact_kind, '$16,842 / year (Scorecard 2023)', 16842, 'USD', 'us-scorecard-grinnell-college', null, null, 'year'),
  ('grinnell-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Grinnell College''s financial-aid pages.', null),
  ('grinnell-college', 'total_cost_of_attendance'::public.university_fact_kind, '$83,440 / year (Scorecard 2023)', 83440, 'USD', 'us-scorecard-grinnell-college', null, null, 'year'),
  ('grinnell-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Grinnell College''s international admissions / financial-aid pages.', null),
  ('grinnell-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 700–750; math 710–790 (Scorecard 2023); Middle-50% ACT 31–34 (Scorecard 2023)', null, null, 'us-scorecard-grinnell-college', null, null, null),
  ('grinnell-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Grinnell College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('grinnell-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Grinnell College''s admissions pages.'),
  ('grinnell-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Grinnell College''s admissions pages.'),
  ('grinnell-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Grinnell College''s admissions pages.'),
  ('grinnell-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 700–750; math 710–790 (Scorecard 2023)', null, 'us-scorecard-grinnell-college', null, null),
  ('grinnell-college', 'act'::public.requirement_kind, 'Middle-50% ACT 31–34 (Scorecard 2023)', null, 'us-scorecard-grinnell-college', null, null),
  ('grinnell-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Grinnell College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #117: Tulane University of Louisiana (UNITID 160755)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-tulane-university-of-louisiana', 'College Scorecard — Tulane University of Louisiana', 'https://collegescorecard.ed.gov/school/?160755-tulane_university_of_louisiana', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('tulane-university-of-louisiana', 'Tulane University of Louisiana', 'New Orleans, Louisiana', 'United States', '🇺🇸', 'Private four-year institution in New Orleans, Louisiana.',
  'Tulane University of Louisiana. College Scorecard (2023) reports out-of-state tuition $68,678 / year and a middle-50% SAT range Middle-50% SAT critical reading 700–750; math 700–770 (Scorecard 2023).', 'tulane-university-of-louisiana', array[]::text[], 'us-scorecard-tulane-university-of-louisiana', 117, 'us-4prep-ranking-scorecard-2023', 160755)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('tulane-university-of-louisiana', 'tuition'::public.university_fact_kind, '$68,678 / year (Scorecard 2023)', 68678, 'USD', 'us-scorecard-tulane-university-of-louisiana', null, null, 'year'),
  ('tulane-university-of-louisiana', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Tulane University of Louisiana''s admissions / financial-aid pages.', null),
  ('tulane-university-of-louisiana', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Tulane University of Louisiana''s admissions pages.', null),
  ('tulane-university-of-louisiana', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Tulane University of Louisiana''s admissions pages.', null),
  ('tulane-university-of-louisiana', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Tulane University of Louisiana''s financial-aid pages.', null),
  ('tulane-university-of-louisiana', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Tulane University of Louisiana''s admissions pages.', null),
  ('tulane-university-of-louisiana', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Tulane University of Louisiana''s admissions pages.', null),
  ('tulane-university-of-louisiana', 'room_board'::public.university_fact_kind, '$18,868 / year (Scorecard 2023)', 18868, 'USD', 'us-scorecard-tulane-university-of-louisiana', null, null, 'year'),
  ('tulane-university-of-louisiana', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Tulane University of Louisiana''s financial-aid pages.', null),
  ('tulane-university-of-louisiana', 'total_cost_of_attendance'::public.university_fact_kind, '$87,004 / year (Scorecard 2023)', 87004, 'USD', 'us-scorecard-tulane-university-of-louisiana', null, null, 'year'),
  ('tulane-university-of-louisiana', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Tulane University of Louisiana''s international admissions / financial-aid pages.', null),
  ('tulane-university-of-louisiana', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 700–750; math 700–770 (Scorecard 2023); Middle-50% ACT 31–34 (Scorecard 2023)', null, null, 'us-scorecard-tulane-university-of-louisiana', null, null, null),
  ('tulane-university-of-louisiana', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Tulane University of Louisiana''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('tulane-university-of-louisiana', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Tulane University of Louisiana''s admissions pages.'),
  ('tulane-university-of-louisiana', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Tulane University of Louisiana''s admissions pages.'),
  ('tulane-university-of-louisiana', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Tulane University of Louisiana''s admissions pages.'),
  ('tulane-university-of-louisiana', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 700–750; math 700–770 (Scorecard 2023)', null, 'us-scorecard-tulane-university-of-louisiana', null, null),
  ('tulane-university-of-louisiana', 'act'::public.requirement_kind, 'Middle-50% ACT 31–34 (Scorecard 2023)', null, 'us-scorecard-tulane-university-of-louisiana', null, null),
  ('tulane-university-of-louisiana', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Tulane University of Louisiana''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #118: University of Georgia (UNITID 139959)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-georgia', 'College Scorecard — University of Georgia', 'https://collegescorecard.ed.gov/school/?139959-university_of_georgia', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-georgia', 'University of Georgia', 'Athens, Georgia', 'United States', '🇺🇸', 'Public four-year institution in Athens, Georgia.',
  'University of Georgia. College Scorecard (2023) reports out-of-state tuition $31,688 / year and a middle-50% SAT range Middle-50% SAT critical reading 640–730; math 630–750 (Scorecard 2023).', 'university-of-georgia', array[]::text[], 'us-scorecard-university-of-georgia', 118, 'us-4prep-ranking-scorecard-2023', 139959)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-georgia', 'tuition'::public.university_fact_kind, '$31,688 / year (Scorecard 2023)', 31688, 'USD', 'us-scorecard-university-of-georgia', null, null, 'year'),
  ('university-of-georgia', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of Georgia''s admissions / financial-aid pages.', null),
  ('university-of-georgia', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of Georgia''s admissions pages.', null),
  ('university-of-georgia', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of Georgia''s admissions pages.', null),
  ('university-of-georgia', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of Georgia''s financial-aid pages.', null),
  ('university-of-georgia', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of Georgia''s admissions pages.', null),
  ('university-of-georgia', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of Georgia''s admissions pages.', null),
  ('university-of-georgia', 'room_board'::public.university_fact_kind, '$11,672 / year (Scorecard 2023)', 11672, 'USD', 'us-scorecard-university-of-georgia', null, null, 'year'),
  ('university-of-georgia', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of Georgia''s financial-aid pages.', null),
  ('university-of-georgia', 'total_cost_of_attendance'::public.university_fact_kind, '$27,993 / year (Scorecard 2023)', 27993, 'USD', 'us-scorecard-university-of-georgia', null, null, 'year'),
  ('university-of-georgia', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of Georgia''s international admissions / financial-aid pages.', null),
  ('university-of-georgia', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 640–730; math 630–750 (Scorecard 2023); Middle-50% ACT 29–34 (Scorecard 2023)', null, null, 'us-scorecard-university-of-georgia', null, null, null),
  ('university-of-georgia', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of Georgia''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-georgia', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of Georgia''s admissions pages.'),
  ('university-of-georgia', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of Georgia''s admissions pages.'),
  ('university-of-georgia', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of Georgia''s admissions pages.'),
  ('university-of-georgia', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 640–730; math 630–750 (Scorecard 2023)', null, 'us-scorecard-university-of-georgia', null, null),
  ('university-of-georgia', 'act'::public.requirement_kind, 'Middle-50% ACT 29–34 (Scorecard 2023)', null, 'us-scorecard-university-of-georgia', null, null),
  ('university-of-georgia', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of Georgia''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #119: Yeshiva of Ocean (UNITID 493594)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-yeshiva-of-ocean', 'College Scorecard — Yeshiva of Ocean', 'https://collegescorecard.ed.gov/school/?493594-yeshiva_of_ocean', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('yeshiva-of-ocean', 'Yeshiva of Ocean', 'Greenfield Park, New York', 'United States', '🇺🇸', 'Private four-year institution in Greenfield Park, New York.',
  'Yeshiva of Ocean. College Scorecard (2023) reports out-of-state tuition $9,000 / year and a middle-50% SAT range not reported.', 'yeshiva-of-ocean', array[]::text[], 'us-scorecard-yeshiva-of-ocean', 119, 'us-4prep-ranking-scorecard-2023', 493594)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('yeshiva-of-ocean', 'tuition'::public.university_fact_kind, '$9,000 / year (Scorecard 2023)', 9000, 'USD', 'us-scorecard-yeshiva-of-ocean', null, null, 'year'),
  ('yeshiva-of-ocean', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Yeshiva of Ocean''s admissions / financial-aid pages.', null),
  ('yeshiva-of-ocean', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Yeshiva of Ocean''s admissions pages.', null),
  ('yeshiva-of-ocean', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Yeshiva of Ocean''s admissions pages.', null),
  ('yeshiva-of-ocean', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Yeshiva of Ocean''s financial-aid pages.', null),
  ('yeshiva-of-ocean', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Yeshiva of Ocean''s admissions pages.', null),
  ('yeshiva-of-ocean', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Yeshiva of Ocean''s admissions pages.', null),
  ('yeshiva-of-ocean', 'room_board'::public.university_fact_kind, '$2,500 / year (Scorecard 2023)', 2500, 'USD', 'us-scorecard-yeshiva-of-ocean', null, null, 'year'),
  ('yeshiva-of-ocean', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Yeshiva of Ocean''s financial-aid pages.', null),
  ('yeshiva-of-ocean', 'total_cost_of_attendance'::public.university_fact_kind, '$17,300 / year (Scorecard 2023)', 17300, 'USD', 'us-scorecard-yeshiva-of-ocean', null, null, 'year'),
  ('yeshiva-of-ocean', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Yeshiva of Ocean''s international admissions / financial-aid pages.', null),
  ('yeshiva-of-ocean', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check Yeshiva of Ocean''s admissions pages.', null),
  ('yeshiva-of-ocean', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Yeshiva of Ocean''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('yeshiva-of-ocean', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Yeshiva of Ocean''s admissions pages.'),
  ('yeshiva-of-ocean', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Yeshiva of Ocean''s admissions pages.'),
  ('yeshiva-of-ocean', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Yeshiva of Ocean''s admissions pages.'),
  ('yeshiva-of-ocean', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check Yeshiva of Ocean''s admissions pages.'),
  ('yeshiva-of-ocean', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check Yeshiva of Ocean''s admissions pages.'),
  ('yeshiva-of-ocean', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Yeshiva of Ocean''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #120: Macalester College (UNITID 173902)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-macalester-college', 'College Scorecard — Macalester College', 'https://collegescorecard.ed.gov/school/?173902-macalester_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('macalester-college', 'Macalester College', 'Saint Paul, Minnesota', 'United States', '🇺🇸', 'Private four-year institution in Saint Paul, Minnesota.',
  'Macalester College. College Scorecard (2023) reports out-of-state tuition $68,104 / year and a middle-50% SAT range Middle-50% SAT critical reading 680–750; math 670–760 (Scorecard 2023).', 'macalester-college', array[]::text[], 'us-scorecard-macalester-college', 120, 'us-4prep-ranking-scorecard-2023', 173902)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('macalester-college', 'tuition'::public.university_fact_kind, '$68,104 / year (Scorecard 2023)', 68104, 'USD', 'us-scorecard-macalester-college', null, null, 'year'),
  ('macalester-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Macalester College''s admissions / financial-aid pages.', null),
  ('macalester-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Macalester College''s admissions pages.', null),
  ('macalester-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Macalester College''s admissions pages.', null),
  ('macalester-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Macalester College''s financial-aid pages.', null),
  ('macalester-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Macalester College''s admissions pages.', null),
  ('macalester-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Macalester College''s admissions pages.', null),
  ('macalester-college', 'room_board'::public.university_fact_kind, '$15,760 / year (Scorecard 2023)', 15760, 'USD', 'us-scorecard-macalester-college', null, null, 'year'),
  ('macalester-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Macalester College''s financial-aid pages.', null),
  ('macalester-college', 'total_cost_of_attendance'::public.university_fact_kind, '$82,991 / year (Scorecard 2023)', 82991, 'USD', 'us-scorecard-macalester-college', null, null, 'year'),
  ('macalester-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Macalester College''s international admissions / financial-aid pages.', null),
  ('macalester-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 680–750; math 670–760 (Scorecard 2023); Middle-50% ACT 30–34 (Scorecard 2023)', null, null, 'us-scorecard-macalester-college', null, null, null),
  ('macalester-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Macalester College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('macalester-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Macalester College''s admissions pages.'),
  ('macalester-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Macalester College''s admissions pages.'),
  ('macalester-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Macalester College''s admissions pages.'),
  ('macalester-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 680–750; math 670–760 (Scorecard 2023)', null, 'us-scorecard-macalester-college', null, null),
  ('macalester-college', 'act'::public.requirement_kind, 'Middle-50% ACT 30–34 (Scorecard 2023)', null, 'us-scorecard-macalester-college', null, null),
  ('macalester-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Macalester College''s admissions pages.')
on conflict (university_id, kind) do nothing;

commit;
