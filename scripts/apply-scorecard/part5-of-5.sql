begin;

-- #161: St Lawrence University (UNITID 195216)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-st-lawrence-university', 'College Scorecard — St Lawrence University', 'https://collegescorecard.ed.gov/school/?195216-st_lawrence_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('st-lawrence-university', 'St Lawrence University', 'Canton, New York', 'United States', '🇺🇸', 'Private four-year institution in Canton, New York.',
  'St Lawrence University. College Scorecard (2023) reports out-of-state tuition $65,900 / year and a middle-50% SAT range Middle-50% SAT critical reading 645–710; math 610–710 (Scorecard 2023).', 'st-lawrence-university', array[]::text[], 'us-scorecard-st-lawrence-university', 161, 'us-4prep-ranking-scorecard-2023', 195216)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('st-lawrence-university', 'tuition'::public.university_fact_kind, '$65,900 / year (Scorecard 2023)', 65900, 'USD', 'us-scorecard-st-lawrence-university', null, null, 'year'),
  ('st-lawrence-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check St Lawrence University''s admissions / financial-aid pages.', null),
  ('st-lawrence-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check St Lawrence University''s admissions pages.', null),
  ('st-lawrence-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check St Lawrence University''s admissions pages.', null),
  ('st-lawrence-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check St Lawrence University''s financial-aid pages.', null),
  ('st-lawrence-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check St Lawrence University''s admissions pages.', null),
  ('st-lawrence-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check St Lawrence University''s admissions pages.', null),
  ('st-lawrence-university', 'room_board'::public.university_fact_kind, '$17,000 / year (Scorecard 2023)', 17000, 'USD', 'us-scorecard-st-lawrence-university', null, null, 'year'),
  ('st-lawrence-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check St Lawrence University''s financial-aid pages.', null),
  ('st-lawrence-university', 'total_cost_of_attendance'::public.university_fact_kind, '$82,000 / year (Scorecard 2023)', 82000, 'USD', 'us-scorecard-st-lawrence-university', null, null, 'year'),
  ('st-lawrence-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check St Lawrence University''s international admissions / financial-aid pages.', null),
  ('st-lawrence-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 645–710; math 610–710 (Scorecard 2023); Middle-50% ACT 30–33 (Scorecard 2023)', null, null, 'us-scorecard-st-lawrence-university', null, null, null),
  ('st-lawrence-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask St Lawrence University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('st-lawrence-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check St Lawrence University''s admissions pages.'),
  ('st-lawrence-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check St Lawrence University''s admissions pages.'),
  ('st-lawrence-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check St Lawrence University''s admissions pages.'),
  ('st-lawrence-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 645–710; math 610–710 (Scorecard 2023)', null, 'us-scorecard-st-lawrence-university', null, null),
  ('st-lawrence-university', 'act'::public.requirement_kind, 'Middle-50% ACT 30–33 (Scorecard 2023)', null, 'us-scorecard-st-lawrence-university', null, null),
  ('st-lawrence-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check St Lawrence University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #162: Oberlin College (UNITID 204501)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-oberlin-college', 'College Scorecard — Oberlin College', 'https://collegescorecard.ed.gov/school/?204501-oberlin_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('oberlin-college', 'Oberlin College', 'Oberlin, Ohio', 'United States', '🇺🇸', 'Private four-year institution in Oberlin, Ohio.',
  'Oberlin College. College Scorecard (2023) reports out-of-state tuition $67,366 / year and a middle-50% SAT range Middle-50% SAT critical reading 700–760; math 660–760 (Scorecard 2023).', 'oberlin-college', array[]::text[], 'us-scorecard-oberlin-college', 162, 'us-4prep-ranking-scorecard-2023', 204501)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('oberlin-college', 'tuition'::public.university_fact_kind, '$67,366 / year (Scorecard 2023)', 67366, 'USD', 'us-scorecard-oberlin-college', null, null, 'year'),
  ('oberlin-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Oberlin College''s admissions / financial-aid pages.', null),
  ('oberlin-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Oberlin College''s admissions pages.', null),
  ('oberlin-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Oberlin College''s admissions pages.', null),
  ('oberlin-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Oberlin College''s financial-aid pages.', null),
  ('oberlin-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Oberlin College''s admissions pages.', null),
  ('oberlin-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Oberlin College''s admissions pages.', null),
  ('oberlin-college', 'room_board'::public.university_fact_kind, '$19,510 / year (Scorecard 2023)', 19510, 'USD', 'us-scorecard-oberlin-college', null, null, 'year'),
  ('oberlin-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Oberlin College''s financial-aid pages.', null),
  ('oberlin-college', 'total_cost_of_attendance'::public.university_fact_kind, '$87,404 / year (Scorecard 2023)', 87404, 'USD', 'us-scorecard-oberlin-college', null, null, 'year'),
  ('oberlin-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Oberlin College''s international admissions / financial-aid pages.', null),
  ('oberlin-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 700–760; math 660–760 (Scorecard 2023); Middle-50% ACT 31–34 (Scorecard 2023)', null, null, 'us-scorecard-oberlin-college', null, null, null),
  ('oberlin-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Oberlin College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('oberlin-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Oberlin College''s admissions pages.'),
  ('oberlin-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Oberlin College''s admissions pages.'),
  ('oberlin-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Oberlin College''s admissions pages.'),
  ('oberlin-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 700–760; math 660–760 (Scorecard 2023)', null, 'us-scorecard-oberlin-college', null, null),
  ('oberlin-college', 'act'::public.requirement_kind, 'Middle-50% ACT 31–34 (Scorecard 2023)', null, 'us-scorecard-oberlin-college', null, null),
  ('oberlin-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Oberlin College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #163: Centre College (UNITID 156408)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-centre-college', 'College Scorecard — Centre College', 'https://collegescorecard.ed.gov/school/?156408-centre_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('centre-college', 'Centre College', 'Danville, Kentucky', 'United States', '🇺🇸', 'Private four-year institution in Danville, Kentucky.',
  'Centre College. College Scorecard (2023) reports out-of-state tuition $52,820 / year and a middle-50% SAT range Middle-50% SAT critical reading 590–720; math 570–730 (Scorecard 2023).', 'centre-college', array[]::text[], 'us-scorecard-centre-college', 163, 'us-4prep-ranking-scorecard-2023', 156408)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('centre-college', 'tuition'::public.university_fact_kind, '$52,820 / year (Scorecard 2023)', 52820, 'USD', 'us-scorecard-centre-college', null, null, 'year'),
  ('centre-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Centre College''s admissions / financial-aid pages.', null),
  ('centre-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Centre College''s admissions pages.', null),
  ('centre-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Centre College''s admissions pages.', null),
  ('centre-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Centre College''s financial-aid pages.', null),
  ('centre-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Centre College''s admissions pages.', null),
  ('centre-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Centre College''s admissions pages.', null),
  ('centre-college', 'room_board'::public.university_fact_kind, '$14,640 / year (Scorecard 2023)', 14640, 'USD', 'us-scorecard-centre-college', null, null, 'year'),
  ('centre-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Centre College''s financial-aid pages.', null),
  ('centre-college', 'total_cost_of_attendance'::public.university_fact_kind, '$67,787 / year (Scorecard 2023)', 67787, 'USD', 'us-scorecard-centre-college', null, null, 'year'),
  ('centre-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Centre College''s international admissions / financial-aid pages.', null),
  ('centre-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 590–720; math 570–730 (Scorecard 2023); Middle-50% ACT 25–32 (Scorecard 2023)', null, null, 'us-scorecard-centre-college', null, null, null),
  ('centre-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Centre College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('centre-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Centre College''s admissions pages.'),
  ('centre-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Centre College''s admissions pages.'),
  ('centre-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Centre College''s admissions pages.'),
  ('centre-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 590–720; math 570–730 (Scorecard 2023)', null, 'us-scorecard-centre-college', null, null),
  ('centre-college', 'act'::public.requirement_kind, 'Middle-50% ACT 25–32 (Scorecard 2023)', null, 'us-scorecard-centre-college', null, null),
  ('centre-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Centre College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #164: Clark University (UNITID 165334)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-clark', 'College Scorecard — Clark University', 'https://collegescorecard.ed.gov/school/?165334-clark_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
-- Existing catalogue row: source, identity, facts, and requirements are intentionally untouched.
-- #165: University of Pittsburgh-Pittsburgh Campus (UNITID 215293)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-pittsburgh-pittsburgh-campus', 'College Scorecard — University of Pittsburgh-Pittsburgh Campus', 'https://collegescorecard.ed.gov/school/?215293-university_of_pittsburgh_pittsburgh_campus', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-pittsburgh-pittsburgh-campus', 'University of Pittsburgh-Pittsburgh Campus', 'Pittsburgh, Pennsylvania', 'United States', '🇺🇸', 'Public four-year institution in Pittsburgh, Pennsylvania.',
  'University of Pittsburgh-Pittsburgh Campus. College Scorecard (2023) reports out-of-state tuition $41,430 / year and a middle-50% SAT range Middle-50% SAT critical reading 640–720; math 640–740 (Scorecard 2023).', 'university-of-pittsburgh-pittsburgh-campus', array[]::text[], 'us-scorecard-university-of-pittsburgh-pittsburgh-campus', 165, 'us-4prep-ranking-scorecard-2023', 215293)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-pittsburgh-pittsburgh-campus', 'tuition'::public.university_fact_kind, '$41,430 / year (Scorecard 2023)', 41430, 'USD', 'us-scorecard-university-of-pittsburgh-pittsburgh-campus', null, null, 'year'),
  ('university-of-pittsburgh-pittsburgh-campus', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of Pittsburgh-Pittsburgh Campus''s admissions / financial-aid pages.', null),
  ('university-of-pittsburgh-pittsburgh-campus', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of Pittsburgh-Pittsburgh Campus''s admissions pages.', null),
  ('university-of-pittsburgh-pittsburgh-campus', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of Pittsburgh-Pittsburgh Campus''s admissions pages.', null),
  ('university-of-pittsburgh-pittsburgh-campus', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of Pittsburgh-Pittsburgh Campus''s financial-aid pages.', null),
  ('university-of-pittsburgh-pittsburgh-campus', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of Pittsburgh-Pittsburgh Campus''s admissions pages.', null),
  ('university-of-pittsburgh-pittsburgh-campus', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of Pittsburgh-Pittsburgh Campus''s admissions pages.', null),
  ('university-of-pittsburgh-pittsburgh-campus', 'room_board'::public.university_fact_kind, '$13,620 / year (Scorecard 2023)', 13620, 'USD', 'us-scorecard-university-of-pittsburgh-pittsburgh-campus', null, null, 'year'),
  ('university-of-pittsburgh-pittsburgh-campus', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of Pittsburgh-Pittsburgh Campus''s financial-aid pages.', null),
  ('university-of-pittsburgh-pittsburgh-campus', 'total_cost_of_attendance'::public.university_fact_kind, '$38,105 / year (Scorecard 2023)', 38105, 'USD', 'us-scorecard-university-of-pittsburgh-pittsburgh-campus', null, null, 'year'),
  ('university-of-pittsburgh-pittsburgh-campus', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of Pittsburgh-Pittsburgh Campus''s international admissions / financial-aid pages.', null),
  ('university-of-pittsburgh-pittsburgh-campus', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 640–720; math 640–740 (Scorecard 2023); Middle-50% ACT 29–33 (Scorecard 2023)', null, null, 'us-scorecard-university-of-pittsburgh-pittsburgh-campus', null, null, null),
  ('university-of-pittsburgh-pittsburgh-campus', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of Pittsburgh-Pittsburgh Campus''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-pittsburgh-pittsburgh-campus', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of Pittsburgh-Pittsburgh Campus''s admissions pages.'),
  ('university-of-pittsburgh-pittsburgh-campus', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of Pittsburgh-Pittsburgh Campus''s admissions pages.'),
  ('university-of-pittsburgh-pittsburgh-campus', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of Pittsburgh-Pittsburgh Campus''s admissions pages.'),
  ('university-of-pittsburgh-pittsburgh-campus', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 640–720; math 640–740 (Scorecard 2023)', null, 'us-scorecard-university-of-pittsburgh-pittsburgh-campus', null, null),
  ('university-of-pittsburgh-pittsburgh-campus', 'act'::public.requirement_kind, 'Middle-50% ACT 29–33 (Scorecard 2023)', null, 'us-scorecard-university-of-pittsburgh-pittsburgh-campus', null, null),
  ('university-of-pittsburgh-pittsburgh-campus', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of Pittsburgh-Pittsburgh Campus''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #166: Wofford College (UNITID 218973)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-wofford-college', 'College Scorecard — Wofford College', 'https://collegescorecard.ed.gov/school/?218973-wofford_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('wofford-college', 'Wofford College', 'Spartanburg, South Carolina', 'United States', '🇺🇸', 'Private four-year institution in Spartanburg, South Carolina.',
  'Wofford College. College Scorecard (2023) reports out-of-state tuition $56,005 / year and a middle-50% SAT range Middle-50% SAT critical reading 608–680; math 590–663 (Scorecard 2023).', 'wofford-college', array[]::text[], 'us-scorecard-wofford-college', 166, 'us-4prep-ranking-scorecard-2023', 218973)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('wofford-college', 'tuition'::public.university_fact_kind, '$56,005 / year (Scorecard 2023)', 56005, 'USD', 'us-scorecard-wofford-college', null, null, 'year'),
  ('wofford-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Wofford College''s admissions / financial-aid pages.', null),
  ('wofford-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Wofford College''s admissions pages.', null),
  ('wofford-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Wofford College''s admissions pages.', null),
  ('wofford-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Wofford College''s financial-aid pages.', null),
  ('wofford-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Wofford College''s admissions pages.', null),
  ('wofford-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Wofford College''s admissions pages.', null),
  ('wofford-college', 'room_board'::public.university_fact_kind, '$16,220 / year (Scorecard 2023)', 16220, 'USD', 'us-scorecard-wofford-college', null, null, 'year'),
  ('wofford-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Wofford College''s financial-aid pages.', null),
  ('wofford-college', 'total_cost_of_attendance'::public.university_fact_kind, '$72,441 / year (Scorecard 2023)', 72441, 'USD', 'us-scorecard-wofford-college', null, null, 'year'),
  ('wofford-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Wofford College''s international admissions / financial-aid pages.', null),
  ('wofford-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 608–680; math 590–663 (Scorecard 2023); Middle-50% ACT 27–31 (Scorecard 2023)', null, null, 'us-scorecard-wofford-college', null, null, null),
  ('wofford-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Wofford College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('wofford-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Wofford College''s admissions pages.'),
  ('wofford-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Wofford College''s admissions pages.'),
  ('wofford-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Wofford College''s admissions pages.'),
  ('wofford-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 608–680; math 590–663 (Scorecard 2023)', null, 'us-scorecard-wofford-college', null, null),
  ('wofford-college', 'act'::public.requirement_kind, 'Middle-50% ACT 27–31 (Scorecard 2023)', null, 'us-scorecard-wofford-college', null, null),
  ('wofford-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Wofford College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #167: CUNY Bernard M Baruch College (UNITID 190512)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-cuny-bernard-m-baruch-college', 'College Scorecard — CUNY Bernard M Baruch College', 'https://collegescorecard.ed.gov/school/?190512-cuny_bernard_m_baruch_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('cuny-bernard-m-baruch-college', 'CUNY Bernard M Baruch College', 'New York, New York', 'United States', '🇺🇸', 'Public four-year institution in New York, New York.',
  'CUNY Bernard M Baruch College. College Scorecard (2023) reports out-of-state tuition $15,414 / year and a middle-50% SAT range Middle-50% SAT critical reading 550–690; math 550–710 (Scorecard 2023).', 'cuny-bernard-m-baruch-college', array[]::text[], 'us-scorecard-cuny-bernard-m-baruch-college', 167, 'us-4prep-ranking-scorecard-2023', 190512)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('cuny-bernard-m-baruch-college', 'tuition'::public.university_fact_kind, '$15,414 / year (Scorecard 2023)', 15414, 'USD', 'us-scorecard-cuny-bernard-m-baruch-college', null, null, 'year'),
  ('cuny-bernard-m-baruch-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check CUNY Bernard M Baruch College''s admissions / financial-aid pages.', null),
  ('cuny-bernard-m-baruch-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check CUNY Bernard M Baruch College''s admissions pages.', null),
  ('cuny-bernard-m-baruch-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check CUNY Bernard M Baruch College''s admissions pages.', null),
  ('cuny-bernard-m-baruch-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check CUNY Bernard M Baruch College''s financial-aid pages.', null),
  ('cuny-bernard-m-baruch-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check CUNY Bernard M Baruch College''s admissions pages.', null),
  ('cuny-bernard-m-baruch-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check CUNY Bernard M Baruch College''s admissions pages.', null),
  ('cuny-bernard-m-baruch-college', 'room_board'::public.university_fact_kind, '$18,832 / year (Scorecard 2023)', 18832, 'USD', 'us-scorecard-cuny-bernard-m-baruch-college', null, null, 'year'),
  ('cuny-bernard-m-baruch-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check CUNY Bernard M Baruch College''s financial-aid pages.', null),
  ('cuny-bernard-m-baruch-college', 'total_cost_of_attendance'::public.university_fact_kind, '$14,170 / year (Scorecard 2023)', 14170, 'USD', 'us-scorecard-cuny-bernard-m-baruch-college', null, null, 'year'),
  ('cuny-bernard-m-baruch-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check CUNY Bernard M Baruch College''s international admissions / financial-aid pages.', null),
  ('cuny-bernard-m-baruch-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 550–690; math 550–710 (Scorecard 2023)', null, null, 'us-scorecard-cuny-bernard-m-baruch-college', null, null, null),
  ('cuny-bernard-m-baruch-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask CUNY Bernard M Baruch College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('cuny-bernard-m-baruch-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check CUNY Bernard M Baruch College''s admissions pages.'),
  ('cuny-bernard-m-baruch-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check CUNY Bernard M Baruch College''s admissions pages.'),
  ('cuny-bernard-m-baruch-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check CUNY Bernard M Baruch College''s admissions pages.'),
  ('cuny-bernard-m-baruch-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 550–690; math 550–710 (Scorecard 2023)', null, 'us-scorecard-cuny-bernard-m-baruch-college', null, null),
  ('cuny-bernard-m-baruch-college', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check CUNY Bernard M Baruch College''s admissions pages.'),
  ('cuny-bernard-m-baruch-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check CUNY Bernard M Baruch College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #168: DePauw University (UNITID 150400)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-depauw-university', 'College Scorecard — DePauw University', 'https://collegescorecard.ed.gov/school/?150400-depauw_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('depauw-university', 'DePauw University', 'Greencastle, Indiana', 'United States', '🇺🇸', 'Private four-year institution in Greencastle, Indiana.',
  'DePauw University. College Scorecard (2023) reports out-of-state tuition $59,070 / year and a middle-50% SAT range Middle-50% SAT critical reading 600–690; math 600–720 (Scorecard 2023).', 'depauw-university', array[]::text[], 'us-scorecard-depauw-university', 168, 'us-4prep-ranking-scorecard-2023', 150400)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('depauw-university', 'tuition'::public.university_fact_kind, '$59,070 / year (Scorecard 2023)', 59070, 'USD', 'us-scorecard-depauw-university', null, null, 'year'),
  ('depauw-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check DePauw University''s admissions / financial-aid pages.', null),
  ('depauw-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check DePauw University''s admissions pages.', null),
  ('depauw-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check DePauw University''s admissions pages.', null),
  ('depauw-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check DePauw University''s financial-aid pages.', null),
  ('depauw-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check DePauw University''s admissions pages.', null),
  ('depauw-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check DePauw University''s admissions pages.', null),
  ('depauw-university', 'room_board'::public.university_fact_kind, '$15,330 / year (Scorecard 2023)', 15330, 'USD', 'us-scorecard-depauw-university', null, null, 'year'),
  ('depauw-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check DePauw University''s financial-aid pages.', null),
  ('depauw-university', 'total_cost_of_attendance'::public.university_fact_kind, '$74,320 / year (Scorecard 2023)', 74320, 'USD', 'us-scorecard-depauw-university', null, null, 'year'),
  ('depauw-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check DePauw University''s international admissions / financial-aid pages.', null),
  ('depauw-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 600–690; math 600–720 (Scorecard 2023); Middle-50% ACT 28–32 (Scorecard 2023)', null, null, 'us-scorecard-depauw-university', null, null, null),
  ('depauw-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask DePauw University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('depauw-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check DePauw University''s admissions pages.'),
  ('depauw-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check DePauw University''s admissions pages.'),
  ('depauw-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check DePauw University''s admissions pages.'),
  ('depauw-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 600–690; math 600–720 (Scorecard 2023)', null, 'us-scorecard-depauw-university', null, null),
  ('depauw-university', 'act'::public.requirement_kind, 'Middle-50% ACT 28–32 (Scorecard 2023)', null, 'us-scorecard-depauw-university', null, null),
  ('depauw-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check DePauw University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #169: Baylor University (UNITID 223232)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-baylor-university', 'College Scorecard — Baylor University', 'https://collegescorecard.ed.gov/school/?223232-baylor_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('baylor-university', 'Baylor University', 'Waco, Texas', 'United States', '🇺🇸', 'Private four-year institution in Waco, Texas.',
  'Baylor University. College Scorecard (2023) reports out-of-state tuition $58,100 / year and a middle-50% SAT range Middle-50% SAT critical reading 610–700; math 590–700 (Scorecard 2023).', 'baylor-university', array[]::text[], 'us-scorecard-baylor-university', 169, 'us-4prep-ranking-scorecard-2023', 223232)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('baylor-university', 'tuition'::public.university_fact_kind, '$58,100 / year (Scorecard 2023)', 58100, 'USD', 'us-scorecard-baylor-university', null, null, 'year'),
  ('baylor-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Baylor University''s admissions / financial-aid pages.', null),
  ('baylor-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Baylor University''s admissions pages.', null),
  ('baylor-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Baylor University''s admissions pages.', null),
  ('baylor-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Baylor University''s financial-aid pages.', null),
  ('baylor-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Baylor University''s admissions pages.', null),
  ('baylor-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Baylor University''s admissions pages.', null),
  ('baylor-university', 'room_board'::public.university_fact_kind, '$15,314 / year (Scorecard 2023)', 15314, 'USD', 'us-scorecard-baylor-university', null, null, 'year'),
  ('baylor-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Baylor University''s financial-aid pages.', null),
  ('baylor-university', 'total_cost_of_attendance'::public.university_fact_kind, '$74,226 / year (Scorecard 2023)', 74226, 'USD', 'us-scorecard-baylor-university', null, null, 'year'),
  ('baylor-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Baylor University''s international admissions / financial-aid pages.', null),
  ('baylor-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 610–700; math 590–700 (Scorecard 2023); Middle-50% ACT 27–32 (Scorecard 2023)', null, null, 'us-scorecard-baylor-university', null, null, null),
  ('baylor-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Baylor University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('baylor-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Baylor University''s admissions pages.'),
  ('baylor-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Baylor University''s admissions pages.'),
  ('baylor-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Baylor University''s admissions pages.'),
  ('baylor-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 610–700; math 590–700 (Scorecard 2023)', null, 'us-scorecard-baylor-university', null, null),
  ('baylor-university', 'act'::public.requirement_kind, 'Middle-50% ACT 27–32 (Scorecard 2023)', null, 'us-scorecard-baylor-university', null, null),
  ('baylor-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Baylor University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #170: Milwaukee School of Engineering (UNITID 239318)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-milwaukee-school-of-engineering', 'College Scorecard — Milwaukee School of Engineering', 'https://collegescorecard.ed.gov/school/?239318-milwaukee_school_of_engineering', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('milwaukee-school-of-engineering', 'Milwaukee School of Engineering', 'Milwaukee, Wisconsin', 'United States', '🇺🇸', 'Private four-year institution in Milwaukee, Wisconsin.',
  'Milwaukee School of Engineering. College Scorecard (2023) reports out-of-state tuition $50,480 / year and a middle-50% SAT range not reported.', 'milwaukee-school-of-engineering', array[]::text[], 'us-scorecard-milwaukee-school-of-engineering', 170, 'us-4prep-ranking-scorecard-2023', 239318)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('milwaukee-school-of-engineering', 'tuition'::public.university_fact_kind, '$50,480 / year (Scorecard 2023)', 50480, 'USD', 'us-scorecard-milwaukee-school-of-engineering', null, null, 'year'),
  ('milwaukee-school-of-engineering', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Milwaukee School of Engineering''s admissions / financial-aid pages.', null),
  ('milwaukee-school-of-engineering', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Milwaukee School of Engineering''s admissions pages.', null),
  ('milwaukee-school-of-engineering', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Milwaukee School of Engineering''s admissions pages.', null),
  ('milwaukee-school-of-engineering', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Milwaukee School of Engineering''s financial-aid pages.', null),
  ('milwaukee-school-of-engineering', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Milwaukee School of Engineering''s admissions pages.', null),
  ('milwaukee-school-of-engineering', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Milwaukee School of Engineering''s admissions pages.', null),
  ('milwaukee-school-of-engineering', 'room_board'::public.university_fact_kind, '$13,984 / year (Scorecard 2023)', 13984, 'USD', 'us-scorecard-milwaukee-school-of-engineering', null, null, 'year'),
  ('milwaukee-school-of-engineering', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Milwaukee School of Engineering''s financial-aid pages.', null),
  ('milwaukee-school-of-engineering', 'total_cost_of_attendance'::public.university_fact_kind, '$62,648 / year (Scorecard 2023)', 62648, 'USD', 'us-scorecard-milwaukee-school-of-engineering', null, null, 'year'),
  ('milwaukee-school-of-engineering', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Milwaukee School of Engineering''s international admissions / financial-aid pages.', null),
  ('milwaukee-school-of-engineering', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check Milwaukee School of Engineering''s admissions pages.', null),
  ('milwaukee-school-of-engineering', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Milwaukee School of Engineering''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('milwaukee-school-of-engineering', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Milwaukee School of Engineering''s admissions pages.'),
  ('milwaukee-school-of-engineering', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Milwaukee School of Engineering''s admissions pages.'),
  ('milwaukee-school-of-engineering', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Milwaukee School of Engineering''s admissions pages.'),
  ('milwaukee-school-of-engineering', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check Milwaukee School of Engineering''s admissions pages.'),
  ('milwaukee-school-of-engineering', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check Milwaukee School of Engineering''s admissions pages.'),
  ('milwaukee-school-of-engineering', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Milwaukee School of Engineering''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #171: University of Florida-Online (UNITID 484473)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-florida-online', 'College Scorecard — University of Florida-Online', 'https://collegescorecard.ed.gov/school/?484473-university_of_florida_online', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-florida-online', 'University of Florida-Online', 'Gainesville, Florida', 'United States', '🇺🇸', 'Public four-year institution in Gainesville, Florida.',
  'University of Florida-Online. College Scorecard (2023) reports out-of-state tuition $16,579 / year and a middle-50% SAT range Middle-50% SAT critical reading 640–710; math 610–700 (Scorecard 2023).', 'university-of-florida-online', array[]::text[], 'us-scorecard-university-of-florida-online', 171, 'us-4prep-ranking-scorecard-2023', 484473)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-florida-online', 'tuition'::public.university_fact_kind, '$16,579 / year (Scorecard 2023)', 16579, 'USD', 'us-scorecard-university-of-florida-online', null, null, 'year'),
  ('university-of-florida-online', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of Florida-Online''s admissions / financial-aid pages.', null),
  ('university-of-florida-online', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of Florida-Online''s admissions pages.', null),
  ('university-of-florida-online', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of Florida-Online''s admissions pages.', null),
  ('university-of-florida-online', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of Florida-Online''s financial-aid pages.', null),
  ('university-of-florida-online', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of Florida-Online''s admissions pages.', null),
  ('university-of-florida-online', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of Florida-Online''s admissions pages.', null),
  ('university-of-florida-online', 'room_board'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report on-campus room and board.', 'Check University of Florida-Online''s financial-aid pages.', null),
  ('university-of-florida-online', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of Florida-Online''s financial-aid pages.', null),
  ('university-of-florida-online', 'total_cost_of_attendance'::public.university_fact_kind, '$17,843 / year (Scorecard 2023)', 17843, 'USD', 'us-scorecard-university-of-florida-online', null, null, 'year'),
  ('university-of-florida-online', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of Florida-Online''s international admissions / financial-aid pages.', null),
  ('university-of-florida-online', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 640–710; math 610–700 (Scorecard 2023); Middle-50% ACT 27–31 (Scorecard 2023)', null, null, 'us-scorecard-university-of-florida-online', null, null, null),
  ('university-of-florida-online', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of Florida-Online''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-florida-online', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of Florida-Online''s admissions pages.'),
  ('university-of-florida-online', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of Florida-Online''s admissions pages.'),
  ('university-of-florida-online', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of Florida-Online''s admissions pages.'),
  ('university-of-florida-online', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 640–710; math 610–700 (Scorecard 2023)', null, 'us-scorecard-university-of-florida-online', null, null),
  ('university-of-florida-online', 'act'::public.requirement_kind, 'Middle-50% ACT 27–31 (Scorecard 2023)', null, 'us-scorecard-university-of-florida-online', null, null),
  ('university-of-florida-online', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of Florida-Online''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #172: Texas A&M University-College Station (UNITID 228723)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-texas-a-and-m-university-college-station', 'College Scorecard — Texas A&M University-College Station', 'https://collegescorecard.ed.gov/school/?228723-texas_a_and_m_university_college_station', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('texas-a-and-m-university-college-station', 'Texas A&M University-College Station', 'College Station, Texas', 'United States', '🇺🇸', 'Public four-year institution in College Station, Texas.',
  'Texas A&M University-College Station. College Scorecard (2023) reports out-of-state tuition $40,124 / year and a middle-50% SAT range Middle-50% SAT critical reading 580–690; math 570–710 (Scorecard 2023).', 'texas-a-and-m-university-college-station', array[]::text[], 'us-scorecard-texas-a-and-m-university-college-station', 172, 'us-4prep-ranking-scorecard-2023', 228723)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('texas-a-and-m-university-college-station', 'tuition'::public.university_fact_kind, '$40,124 / year (Scorecard 2023)', 40124, 'USD', 'us-scorecard-texas-a-and-m-university-college-station', null, null, 'year'),
  ('texas-a-and-m-university-college-station', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Texas A&M University-College Station''s admissions / financial-aid pages.', null),
  ('texas-a-and-m-university-college-station', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Texas A&M University-College Station''s admissions pages.', null),
  ('texas-a-and-m-university-college-station', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Texas A&M University-College Station''s admissions pages.', null),
  ('texas-a-and-m-university-college-station', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Texas A&M University-College Station''s financial-aid pages.', null),
  ('texas-a-and-m-university-college-station', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Texas A&M University-College Station''s admissions pages.', null),
  ('texas-a-and-m-university-college-station', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Texas A&M University-College Station''s admissions pages.', null),
  ('texas-a-and-m-university-college-station', 'room_board'::public.university_fact_kind, '$13,008 / year (Scorecard 2023)', 13008, 'USD', 'us-scorecard-texas-a-and-m-university-college-station', null, null, 'year'),
  ('texas-a-and-m-university-college-station', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Texas A&M University-College Station''s financial-aid pages.', null),
  ('texas-a-and-m-university-college-station', 'total_cost_of_attendance'::public.university_fact_kind, '$32,696 / year (Scorecard 2023)', 32696, 'USD', 'us-scorecard-texas-a-and-m-university-college-station', null, null, 'year'),
  ('texas-a-and-m-university-college-station', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Texas A&M University-College Station''s international admissions / financial-aid pages.', null),
  ('texas-a-and-m-university-college-station', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 580–690; math 570–710 (Scorecard 2023); Middle-50% ACT 25–31 (Scorecard 2023)', null, null, 'us-scorecard-texas-a-and-m-university-college-station', null, null, null),
  ('texas-a-and-m-university-college-station', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Texas A&M University-College Station''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('texas-a-and-m-university-college-station', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Texas A&M University-College Station''s admissions pages.'),
  ('texas-a-and-m-university-college-station', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Texas A&M University-College Station''s admissions pages.'),
  ('texas-a-and-m-university-college-station', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Texas A&M University-College Station''s admissions pages.'),
  ('texas-a-and-m-university-college-station', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 580–690; math 570–710 (Scorecard 2023)', null, 'us-scorecard-texas-a-and-m-university-college-station', null, null),
  ('texas-a-and-m-university-college-station', 'act'::public.requirement_kind, 'Middle-50% ACT 25–31 (Scorecard 2023)', null, 'us-scorecard-texas-a-and-m-university-college-station', null, null),
  ('texas-a-and-m-university-college-station', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Texas A&M University-College Station''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #173: Brigham Young University (UNITID 230038)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-brigham-young-university', 'College Scorecard — Brigham Young University', 'https://collegescorecard.ed.gov/school/?230038-brigham_young_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('brigham-young-university', 'Brigham Young University', 'Provo, Utah', 'United States', '🇺🇸', 'Private four-year institution in Provo, Utah.',
  'Brigham Young University. College Scorecard (2023) reports out-of-state tuition $6,688 / year and a middle-50% SAT range Middle-50% SAT critical reading 640–730; math 630–730 (Scorecard 2023).', 'brigham-young-university', array[]::text[], 'us-scorecard-brigham-young-university', 173, 'us-4prep-ranking-scorecard-2023', 230038)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('brigham-young-university', 'tuition'::public.university_fact_kind, '$6,688 / year (Scorecard 2023)', 6688, 'USD', 'us-scorecard-brigham-young-university', null, null, 'year'),
  ('brigham-young-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Brigham Young University''s admissions / financial-aid pages.', null),
  ('brigham-young-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Brigham Young University''s admissions pages.', null),
  ('brigham-young-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Brigham Young University''s admissions pages.', null),
  ('brigham-young-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Brigham Young University''s financial-aid pages.', null),
  ('brigham-young-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Brigham Young University''s admissions pages.', null),
  ('brigham-young-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Brigham Young University''s admissions pages.', null),
  ('brigham-young-university', 'room_board'::public.university_fact_kind, '$10,396 / year (Scorecard 2023)', 10396, 'USD', 'us-scorecard-brigham-young-university', null, null, 'year'),
  ('brigham-young-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Brigham Young University''s financial-aid pages.', null),
  ('brigham-young-university', 'total_cost_of_attendance'::public.university_fact_kind, '$22,690 / year (Scorecard 2023)', 22690, 'USD', 'us-scorecard-brigham-young-university', null, null, 'year'),
  ('brigham-young-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Brigham Young University''s international admissions / financial-aid pages.', null),
  ('brigham-young-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 640–730; math 630–730 (Scorecard 2023); Middle-50% ACT 28–32 (Scorecard 2023)', null, null, 'us-scorecard-brigham-young-university', null, null, null),
  ('brigham-young-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Brigham Young University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('brigham-young-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Brigham Young University''s admissions pages.'),
  ('brigham-young-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Brigham Young University''s admissions pages.'),
  ('brigham-young-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Brigham Young University''s admissions pages.'),
  ('brigham-young-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 640–730; math 630–730 (Scorecard 2023)', null, 'us-scorecard-brigham-young-university', null, null),
  ('brigham-young-university', 'act'::public.requirement_kind, 'Middle-50% ACT 28–32 (Scorecard 2023)', null, 'us-scorecard-brigham-young-university', null, null),
  ('brigham-young-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Brigham Young University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #174: Albany College of Pharmacy and Health Sciences (UNITID 188526)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-albany-college-of-pharmacy-and-health-sciences', 'College Scorecard — Albany College of Pharmacy and Health Sciences', 'https://collegescorecard.ed.gov/school/?188526-albany_college_of_pharmacy_and_health_sciences', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('albany-college-of-pharmacy-and-health-sciences', 'Albany College of Pharmacy and Health Sciences', 'Albany, New York', 'United States', '🇺🇸', 'Private four-year institution in Albany, New York.',
  'Albany College of Pharmacy and Health Sciences. College Scorecard (2023) reports out-of-state tuition $41,475 / year and a middle-50% SAT range Middle-50% SAT critical reading 550–680; math 560–700 (Scorecard 2023).', 'albany-college-of-pharmacy-and-health-sciences', array[]::text[], 'us-scorecard-albany-college-of-pharmacy-and-health-sciences', 174, 'us-4prep-ranking-scorecard-2023', 188526)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('albany-college-of-pharmacy-and-health-sciences', 'tuition'::public.university_fact_kind, '$41,475 / year (Scorecard 2023)', 41475, 'USD', 'us-scorecard-albany-college-of-pharmacy-and-health-sciences', null, null, 'year'),
  ('albany-college-of-pharmacy-and-health-sciences', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Albany College of Pharmacy and Health Sciences''s admissions / financial-aid pages.', null),
  ('albany-college-of-pharmacy-and-health-sciences', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Albany College of Pharmacy and Health Sciences''s admissions pages.', null),
  ('albany-college-of-pharmacy-and-health-sciences', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Albany College of Pharmacy and Health Sciences''s admissions pages.', null),
  ('albany-college-of-pharmacy-and-health-sciences', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Albany College of Pharmacy and Health Sciences''s financial-aid pages.', null),
  ('albany-college-of-pharmacy-and-health-sciences', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Albany College of Pharmacy and Health Sciences''s admissions pages.', null),
  ('albany-college-of-pharmacy-and-health-sciences', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Albany College of Pharmacy and Health Sciences''s admissions pages.', null),
  ('albany-college-of-pharmacy-and-health-sciences', 'room_board'::public.university_fact_kind, '$12,500 / year (Scorecard 2023)', 12500, 'USD', 'us-scorecard-albany-college-of-pharmacy-and-health-sciences', null, null, 'year'),
  ('albany-college-of-pharmacy-and-health-sciences', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Albany College of Pharmacy and Health Sciences''s financial-aid pages.', null),
  ('albany-college-of-pharmacy-and-health-sciences', 'total_cost_of_attendance'::public.university_fact_kind, '$54,899 / year (Scorecard 2023)', 54899, 'USD', 'us-scorecard-albany-college-of-pharmacy-and-health-sciences', null, null, 'year'),
  ('albany-college-of-pharmacy-and-health-sciences', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Albany College of Pharmacy and Health Sciences''s international admissions / financial-aid pages.', null),
  ('albany-college-of-pharmacy-and-health-sciences', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 550–680; math 560–700 (Scorecard 2023); Middle-50% ACT 23–31 (Scorecard 2023)', null, null, 'us-scorecard-albany-college-of-pharmacy-and-health-sciences', null, null, null),
  ('albany-college-of-pharmacy-and-health-sciences', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Albany College of Pharmacy and Health Sciences''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('albany-college-of-pharmacy-and-health-sciences', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Albany College of Pharmacy and Health Sciences''s admissions pages.'),
  ('albany-college-of-pharmacy-and-health-sciences', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Albany College of Pharmacy and Health Sciences''s admissions pages.'),
  ('albany-college-of-pharmacy-and-health-sciences', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Albany College of Pharmacy and Health Sciences''s admissions pages.'),
  ('albany-college-of-pharmacy-and-health-sciences', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 550–680; math 560–700 (Scorecard 2023)', null, 'us-scorecard-albany-college-of-pharmacy-and-health-sciences', null, null),
  ('albany-college-of-pharmacy-and-health-sciences', 'act'::public.requirement_kind, 'Middle-50% ACT 23–31 (Scorecard 2023)', null, 'us-scorecard-albany-college-of-pharmacy-and-health-sciences', null, null),
  ('albany-college-of-pharmacy-and-health-sciences', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Albany College of Pharmacy and Health Sciences''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #175: The University of the South (UNITID 221519)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-the-university-of-the-south', 'College Scorecard — The University of the South', 'https://collegescorecard.ed.gov/school/?221519-the_university_of_the_south', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('the-university-of-the-south', 'The University of the South', 'Sewanee, Tennessee', 'United States', '🇺🇸', 'Private four-year institution in Sewanee, Tennessee.',
  'The University of the South. College Scorecard (2023) reports out-of-state tuition $56,120 / year and a middle-50% SAT range Middle-50% SAT critical reading 640–710; math 620–680 (Scorecard 2023).', 'the-university-of-the-south', array[]::text[], 'us-scorecard-the-university-of-the-south', 175, 'us-4prep-ranking-scorecard-2023', 221519)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('the-university-of-the-south', 'tuition'::public.university_fact_kind, '$56,120 / year (Scorecard 2023)', 56120, 'USD', 'us-scorecard-the-university-of-the-south', null, null, 'year'),
  ('the-university-of-the-south', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check The University of the South''s admissions / financial-aid pages.', null),
  ('the-university-of-the-south', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check The University of the South''s admissions pages.', null),
  ('the-university-of-the-south', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check The University of the South''s admissions pages.', null),
  ('the-university-of-the-south', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check The University of the South''s financial-aid pages.', null),
  ('the-university-of-the-south', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check The University of the South''s admissions pages.', null),
  ('the-university-of-the-south', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check The University of the South''s admissions pages.', null),
  ('the-university-of-the-south', 'room_board'::public.university_fact_kind, '$16,028 / year (Scorecard 2023)', 16028, 'USD', 'us-scorecard-the-university-of-the-south', null, null, 'year'),
  ('the-university-of-the-south', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check The University of the South''s financial-aid pages.', null),
  ('the-university-of-the-south', 'total_cost_of_attendance'::public.university_fact_kind, '$71,986 / year (Scorecard 2023)', 71986, 'USD', 'us-scorecard-the-university-of-the-south', null, null, 'year'),
  ('the-university-of-the-south', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check The University of the South''s international admissions / financial-aid pages.', null),
  ('the-university-of-the-south', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 640–710; math 620–680 (Scorecard 2023); Middle-50% ACT 27–31 (Scorecard 2023)', null, null, 'us-scorecard-the-university-of-the-south', null, null, null),
  ('the-university-of-the-south', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask The University of the South''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('the-university-of-the-south', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check The University of the South''s admissions pages.'),
  ('the-university-of-the-south', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check The University of the South''s admissions pages.'),
  ('the-university-of-the-south', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check The University of the South''s admissions pages.'),
  ('the-university-of-the-south', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 640–710; math 620–680 (Scorecard 2023)', null, 'us-scorecard-the-university-of-the-south', null, null),
  ('the-university-of-the-south', 'act'::public.requirement_kind, 'Middle-50% ACT 27–31 (Scorecard 2023)', null, 'us-scorecard-the-university-of-the-south', null, null),
  ('the-university-of-the-south', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check The University of the South''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #176: New Jersey Institute of Technology (UNITID 185828)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-new-jersey-institute-of-technology', 'College Scorecard — New Jersey Institute of Technology', 'https://collegescorecard.ed.gov/school/?185828-new_jersey_institute_of_technology', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('new-jersey-institute-of-technology', 'New Jersey Institute of Technology', 'Newark, New Jersey', 'United States', '🇺🇸', 'Public four-year institution in Newark, New Jersey.',
  'New Jersey Institute of Technology. College Scorecard (2023) reports out-of-state tuition $37,664 / year and a middle-50% SAT range Middle-50% SAT critical reading 600–710; math 610–750 (Scorecard 2023).', 'new-jersey-institute-of-technology', array[]::text[], 'us-scorecard-new-jersey-institute-of-technology', 176, 'us-4prep-ranking-scorecard-2023', 185828)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('new-jersey-institute-of-technology', 'tuition'::public.university_fact_kind, '$37,664 / year (Scorecard 2023)', 37664, 'USD', 'us-scorecard-new-jersey-institute-of-technology', null, null, 'year'),
  ('new-jersey-institute-of-technology', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check New Jersey Institute of Technology''s admissions / financial-aid pages.', null),
  ('new-jersey-institute-of-technology', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check New Jersey Institute of Technology''s admissions pages.', null),
  ('new-jersey-institute-of-technology', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check New Jersey Institute of Technology''s admissions pages.', null),
  ('new-jersey-institute-of-technology', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check New Jersey Institute of Technology''s financial-aid pages.', null),
  ('new-jersey-institute-of-technology', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check New Jersey Institute of Technology''s admissions pages.', null),
  ('new-jersey-institute-of-technology', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check New Jersey Institute of Technology''s admissions pages.', null),
  ('new-jersey-institute-of-technology', 'room_board'::public.university_fact_kind, '$16,450 / year (Scorecard 2023)', 16450, 'USD', 'us-scorecard-new-jersey-institute-of-technology', null, null, 'year'),
  ('new-jersey-institute-of-technology', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check New Jersey Institute of Technology''s financial-aid pages.', null),
  ('new-jersey-institute-of-technology', 'total_cost_of_attendance'::public.university_fact_kind, '$32,859 / year (Scorecard 2023)', 32859, 'USD', 'us-scorecard-new-jersey-institute-of-technology', null, null, 'year'),
  ('new-jersey-institute-of-technology', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check New Jersey Institute of Technology''s international admissions / financial-aid pages.', null),
  ('new-jersey-institute-of-technology', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 600–710; math 610–750 (Scorecard 2023); Middle-50% ACT 27–34 (Scorecard 2023)', null, null, 'us-scorecard-new-jersey-institute-of-technology', null, null, null),
  ('new-jersey-institute-of-technology', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask New Jersey Institute of Technology''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('new-jersey-institute-of-technology', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check New Jersey Institute of Technology''s admissions pages.'),
  ('new-jersey-institute-of-technology', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check New Jersey Institute of Technology''s admissions pages.'),
  ('new-jersey-institute-of-technology', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check New Jersey Institute of Technology''s admissions pages.'),
  ('new-jersey-institute-of-technology', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 600–710; math 610–750 (Scorecard 2023)', null, 'us-scorecard-new-jersey-institute-of-technology', null, null),
  ('new-jersey-institute-of-technology', 'act'::public.requirement_kind, 'Middle-50% ACT 27–34 (Scorecard 2023)', null, 'us-scorecard-new-jersey-institute-of-technology', null, null),
  ('new-jersey-institute-of-technology', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check New Jersey Institute of Technology''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #177: University of Dayton (UNITID 202480)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-dayton', 'College Scorecard — University of Dayton', 'https://collegescorecard.ed.gov/school/?202480-university_of_dayton', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-dayton', 'University of Dayton', 'Dayton, Ohio', 'United States', '🇺🇸', 'Private four-year institution in Dayton, Ohio.',
  'University of Dayton. College Scorecard (2023) reports out-of-state tuition $49,140 / year and a middle-50% SAT range Middle-50% SAT critical reading 600–690; math 600–690 (Scorecard 2023).', 'university-of-dayton', array[]::text[], 'us-scorecard-university-of-dayton', 177, 'us-4prep-ranking-scorecard-2023', 202480)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-dayton', 'tuition'::public.university_fact_kind, '$49,140 / year (Scorecard 2023)', 49140, 'USD', 'us-scorecard-university-of-dayton', null, null, 'year'),
  ('university-of-dayton', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of Dayton''s admissions / financial-aid pages.', null),
  ('university-of-dayton', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of Dayton''s admissions pages.', null),
  ('university-of-dayton', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of Dayton''s admissions pages.', null),
  ('university-of-dayton', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of Dayton''s financial-aid pages.', null),
  ('university-of-dayton', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of Dayton''s admissions pages.', null),
  ('university-of-dayton', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of Dayton''s admissions pages.', null),
  ('university-of-dayton', 'room_board'::public.university_fact_kind, '$16,800 / year (Scorecard 2023)', 16800, 'USD', 'us-scorecard-university-of-dayton', null, null, 'year'),
  ('university-of-dayton', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of Dayton''s financial-aid pages.', null),
  ('university-of-dayton', 'total_cost_of_attendance'::public.university_fact_kind, '$65,881 / year (Scorecard 2023)', 65881, 'USD', 'us-scorecard-university-of-dayton', null, null, 'year'),
  ('university-of-dayton', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of Dayton''s international admissions / financial-aid pages.', null),
  ('university-of-dayton', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 600–690; math 600–690 (Scorecard 2023); Middle-50% ACT 25–31 (Scorecard 2023)', null, null, 'us-scorecard-university-of-dayton', null, null, null),
  ('university-of-dayton', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of Dayton''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-dayton', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of Dayton''s admissions pages.'),
  ('university-of-dayton', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of Dayton''s admissions pages.'),
  ('university-of-dayton', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of Dayton''s admissions pages.'),
  ('university-of-dayton', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 600–690; math 600–690 (Scorecard 2023)', null, 'us-scorecard-university-of-dayton', null, null),
  ('university-of-dayton', 'act'::public.requirement_kind, 'Middle-50% ACT 25–31 (Scorecard 2023)', null, 'us-scorecard-university-of-dayton', null, null),
  ('university-of-dayton', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of Dayton''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #178: Emerson College (UNITID 165662)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-emerson-college', 'College Scorecard — Emerson College', 'https://collegescorecard.ed.gov/school/?165662-emerson_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('emerson-college', 'Emerson College', 'Boston, Massachusetts', 'United States', '🇺🇸', 'Private four-year institution in Boston, Massachusetts.',
  'Emerson College. College Scorecard (2023) reports out-of-state tuition $57,056 / year and a middle-50% SAT range Middle-50% SAT critical reading 660–720; math 610–700 (Scorecard 2023).', 'emerson-college', array[]::text[], 'us-scorecard-emerson-college', 178, 'us-4prep-ranking-scorecard-2023', 165662)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('emerson-college', 'tuition'::public.university_fact_kind, '$57,056 / year (Scorecard 2023)', 57056, 'USD', 'us-scorecard-emerson-college', null, null, 'year'),
  ('emerson-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Emerson College''s admissions / financial-aid pages.', null),
  ('emerson-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Emerson College''s admissions pages.', null),
  ('emerson-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Emerson College''s admissions pages.', null),
  ('emerson-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Emerson College''s financial-aid pages.', null),
  ('emerson-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Emerson College''s admissions pages.', null),
  ('emerson-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Emerson College''s admissions pages.', null),
  ('emerson-college', 'room_board'::public.university_fact_kind, '$20,920 / year (Scorecard 2023)', 20920, 'USD', 'us-scorecard-emerson-college', null, null, 'year'),
  ('emerson-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Emerson College''s financial-aid pages.', null),
  ('emerson-college', 'total_cost_of_attendance'::public.university_fact_kind, '$80,399 / year (Scorecard 2023)', 80399, 'USD', 'us-scorecard-emerson-college', null, null, 'year'),
  ('emerson-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Emerson College''s international admissions / financial-aid pages.', null),
  ('emerson-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 660–720; math 610–700 (Scorecard 2023); Middle-50% ACT 29–32 (Scorecard 2023)', null, null, 'us-scorecard-emerson-college', null, null, null),
  ('emerson-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Emerson College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('emerson-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Emerson College''s admissions pages.'),
  ('emerson-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Emerson College''s admissions pages.'),
  ('emerson-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Emerson College''s admissions pages.'),
  ('emerson-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 660–720; math 610–700 (Scorecard 2023)', null, 'us-scorecard-emerson-college', null, null),
  ('emerson-college', 'act'::public.requirement_kind, 'Middle-50% ACT 29–32 (Scorecard 2023)', null, 'us-scorecard-emerson-college', null, null),
  ('emerson-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Emerson College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #179: University of San Francisco (UNITID 122612)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-san-francisco', 'College Scorecard — University of San Francisco', 'https://collegescorecard.ed.gov/school/?122612-university_of_san_francisco', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-san-francisco', 'University of San Francisco', 'San Francisco, California', 'United States', '🇺🇸', 'Private four-year institution in San Francisco, California.',
  'University of San Francisco. College Scorecard (2023) reports out-of-state tuition $60,492 / year and a middle-50% SAT range Middle-50% SAT critical reading 610–700; math 580–690 (Scorecard 2023).', 'university-of-san-francisco', array[]::text[], 'us-scorecard-university-of-san-francisco', 179, 'us-4prep-ranking-scorecard-2023', 122612)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-san-francisco', 'tuition'::public.university_fact_kind, '$60,492 / year (Scorecard 2023)', 60492, 'USD', 'us-scorecard-university-of-san-francisco', null, null, 'year'),
  ('university-of-san-francisco', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of San Francisco''s admissions / financial-aid pages.', null),
  ('university-of-san-francisco', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of San Francisco''s admissions pages.', null),
  ('university-of-san-francisco', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of San Francisco''s admissions pages.', null),
  ('university-of-san-francisco', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of San Francisco''s financial-aid pages.', null),
  ('university-of-san-francisco', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of San Francisco''s admissions pages.', null),
  ('university-of-san-francisco', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of San Francisco''s admissions pages.', null),
  ('university-of-san-francisco', 'room_board'::public.university_fact_kind, '$19,764 / year (Scorecard 2023)', 19764, 'USD', 'us-scorecard-university-of-san-francisco', null, null, 'year'),
  ('university-of-san-francisco', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of San Francisco''s financial-aid pages.', null),
  ('university-of-san-francisco', 'total_cost_of_attendance'::public.university_fact_kind, '$80,141 / year (Scorecard 2023)', 80141, 'USD', 'us-scorecard-university-of-san-francisco', null, null, 'year'),
  ('university-of-san-francisco', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of San Francisco''s international admissions / financial-aid pages.', null),
  ('university-of-san-francisco', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 610–700; math 580–690 (Scorecard 2023); Middle-50% ACT 25–30 (Scorecard 2023)', null, null, 'us-scorecard-university-of-san-francisco', null, null, null),
  ('university-of-san-francisco', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of San Francisco''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-san-francisco', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of San Francisco''s admissions pages.'),
  ('university-of-san-francisco', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of San Francisco''s admissions pages.'),
  ('university-of-san-francisco', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of San Francisco''s admissions pages.'),
  ('university-of-san-francisco', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 610–700; math 580–690 (Scorecard 2023)', null, 'us-scorecard-university-of-san-francisco', null, null),
  ('university-of-san-francisco', 'act'::public.requirement_kind, 'Middle-50% ACT 25–30 (Scorecard 2023)', null, 'us-scorecard-university-of-san-francisco', null, null),
  ('university-of-san-francisco', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of San Francisco''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #180: Chapman University (UNITID 111948)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-chapman-university', 'College Scorecard — Chapman University', 'https://collegescorecard.ed.gov/school/?111948-chapman_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('chapman-university', 'Chapman University', 'Orange, California', 'United States', '🇺🇸', 'Private four-year institution in Orange, California.',
  'Chapman University. College Scorecard (2023) reports out-of-state tuition $64,984 / year and a middle-50% SAT range Middle-50% SAT critical reading 630–720; math 630–720 (Scorecard 2023).', 'chapman-university', array[]::text[], 'us-scorecard-chapman-university', 180, 'us-4prep-ranking-scorecard-2023', 111948)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('chapman-university', 'tuition'::public.university_fact_kind, '$64,984 / year (Scorecard 2023)', 64984, 'USD', 'us-scorecard-chapman-university', null, null, 'year'),
  ('chapman-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Chapman University''s admissions / financial-aid pages.', null),
  ('chapman-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Chapman University''s admissions pages.', null),
  ('chapman-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Chapman University''s admissions pages.', null),
  ('chapman-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Chapman University''s financial-aid pages.', null),
  ('chapman-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Chapman University''s admissions pages.', null),
  ('chapman-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Chapman University''s admissions pages.', null),
  ('chapman-university', 'room_board'::public.university_fact_kind, '$17,814 / year (Scorecard 2023)', 17814, 'USD', 'us-scorecard-chapman-university', null, null, 'year'),
  ('chapman-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Chapman University''s financial-aid pages.', null),
  ('chapman-university', 'total_cost_of_attendance'::public.university_fact_kind, '$83,146 / year (Scorecard 2023)', 83146, 'USD', 'us-scorecard-chapman-university', null, null, 'year'),
  ('chapman-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Chapman University''s international admissions / financial-aid pages.', null),
  ('chapman-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 630–720; math 630–720 (Scorecard 2023); Middle-50% ACT 28–31 (Scorecard 2023)', null, null, 'us-scorecard-chapman-university', null, null, null),
  ('chapman-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Chapman University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('chapman-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Chapman University''s admissions pages.'),
  ('chapman-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Chapman University''s admissions pages.'),
  ('chapman-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Chapman University''s admissions pages.'),
  ('chapman-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 630–720; math 630–720 (Scorecard 2023)', null, 'us-scorecard-chapman-university', null, null),
  ('chapman-university', 'act'::public.requirement_kind, 'Middle-50% ACT 28–31 (Scorecard 2023)', null, 'us-scorecard-chapman-university', null, null),
  ('chapman-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Chapman University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #181: Citadel Military College of South Carolina (UNITID 217864)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-citadel-military-college-of-south-carolina', 'College Scorecard — Citadel Military College of South Carolina', 'https://collegescorecard.ed.gov/school/?217864-citadel_military_college_of_south_carolina', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('citadel-military-college-of-south-carolina', 'Citadel Military College of South Carolina', 'Charleston, South Carolina', 'United States', '🇺🇸', 'Public four-year institution in Charleston, South Carolina.',
  'Citadel Military College of South Carolina. College Scorecard (2023) reports out-of-state tuition $38,508 / year and a middle-50% SAT range Middle-50% SAT critical reading 540–640; math 545–645 (Scorecard 2023).', 'citadel-military-college-of-south-carolina', array[]::text[], 'us-scorecard-citadel-military-college-of-south-carolina', 181, 'us-4prep-ranking-scorecard-2023', 217864)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('citadel-military-college-of-south-carolina', 'tuition'::public.university_fact_kind, '$38,508 / year (Scorecard 2023)', 38508, 'USD', 'us-scorecard-citadel-military-college-of-south-carolina', null, null, 'year'),
  ('citadel-military-college-of-south-carolina', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Citadel Military College of South Carolina''s admissions / financial-aid pages.', null),
  ('citadel-military-college-of-south-carolina', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Citadel Military College of South Carolina''s admissions pages.', null),
  ('citadel-military-college-of-south-carolina', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Citadel Military College of South Carolina''s admissions pages.', null),
  ('citadel-military-college-of-south-carolina', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Citadel Military College of South Carolina''s financial-aid pages.', null),
  ('citadel-military-college-of-south-carolina', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Citadel Military College of South Carolina''s admissions pages.', null),
  ('citadel-military-college-of-south-carolina', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Citadel Military College of South Carolina''s admissions pages.', null),
  ('citadel-military-college-of-south-carolina', 'room_board'::public.university_fact_kind, '$9,705 / year (Scorecard 2023)', 9705, 'USD', 'us-scorecard-citadel-military-college-of-south-carolina', null, null, 'year'),
  ('citadel-military-college-of-south-carolina', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Citadel Military College of South Carolina''s financial-aid pages.', null),
  ('citadel-military-college-of-south-carolina', 'total_cost_of_attendance'::public.university_fact_kind, '$33,880 / year (Scorecard 2023)', 33880, 'USD', 'us-scorecard-citadel-military-college-of-south-carolina', null, null, 'year'),
  ('citadel-military-college-of-south-carolina', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Citadel Military College of South Carolina''s international admissions / financial-aid pages.', null),
  ('citadel-military-college-of-south-carolina', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 540–640; math 545–645 (Scorecard 2023); Middle-50% ACT 22–27 (Scorecard 2023)', null, null, 'us-scorecard-citadel-military-college-of-south-carolina', null, null, null),
  ('citadel-military-college-of-south-carolina', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Citadel Military College of South Carolina''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('citadel-military-college-of-south-carolina', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Citadel Military College of South Carolina''s admissions pages.'),
  ('citadel-military-college-of-south-carolina', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Citadel Military College of South Carolina''s admissions pages.'),
  ('citadel-military-college-of-south-carolina', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Citadel Military College of South Carolina''s admissions pages.'),
  ('citadel-military-college-of-south-carolina', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 540–640; math 545–645 (Scorecard 2023)', null, 'us-scorecard-citadel-military-college-of-south-carolina', null, null),
  ('citadel-military-college-of-south-carolina', 'act'::public.requirement_kind, 'Middle-50% ACT 22–27 (Scorecard 2023)', null, 'us-scorecard-citadel-military-college-of-south-carolina', null, null),
  ('citadel-military-college-of-south-carolina', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Citadel Military College of South Carolina''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #182: Washington University of Science and Technology (UNITID 483780)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-washington-university-of-science-and-technology', 'College Scorecard — Washington University of Science and Technology', 'https://collegescorecard.ed.gov/school/?483780-washington_university_of_science_and_technology', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('washington-university-of-science-and-technology', 'Washington University of Science and Technology', 'Alexandria, Virginia', 'United States', '🇺🇸', 'Private four-year institution in Alexandria, Virginia.',
  'Washington University of Science and Technology. College Scorecard (2023) reports out-of-state tuition $13,785 / year and a middle-50% SAT range not reported.', 'washington-university-of-science-and-technology', array[]::text[], 'us-scorecard-washington-university-of-science-and-technology', 182, 'us-4prep-ranking-scorecard-2023', 483780)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('washington-university-of-science-and-technology', 'tuition'::public.university_fact_kind, '$13,785 / year (Scorecard 2023)', 13785, 'USD', 'us-scorecard-washington-university-of-science-and-technology', null, null, 'year'),
  ('washington-university-of-science-and-technology', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Washington University of Science and Technology''s admissions / financial-aid pages.', null),
  ('washington-university-of-science-and-technology', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Washington University of Science and Technology''s admissions pages.', null),
  ('washington-university-of-science-and-technology', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Washington University of Science and Technology''s admissions pages.', null),
  ('washington-university-of-science-and-technology', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Washington University of Science and Technology''s financial-aid pages.', null),
  ('washington-university-of-science-and-technology', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Washington University of Science and Technology''s admissions pages.', null),
  ('washington-university-of-science-and-technology', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Washington University of Science and Technology''s admissions pages.', null),
  ('washington-university-of-science-and-technology', 'room_board'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report on-campus room and board.', 'Check Washington University of Science and Technology''s financial-aid pages.', null),
  ('washington-university-of-science-and-technology', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Washington University of Science and Technology''s financial-aid pages.', null),
  ('washington-university-of-science-and-technology', 'total_cost_of_attendance'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report academic-year cost of attendance.', 'Check Washington University of Science and Technology''s financial-aid pages.', null),
  ('washington-university-of-science-and-technology', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Washington University of Science and Technology''s international admissions / financial-aid pages.', null),
  ('washington-university-of-science-and-technology', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check Washington University of Science and Technology''s admissions pages.', null),
  ('washington-university-of-science-and-technology', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Washington University of Science and Technology''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('washington-university-of-science-and-technology', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Washington University of Science and Technology''s admissions pages.'),
  ('washington-university-of-science-and-technology', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Washington University of Science and Technology''s admissions pages.'),
  ('washington-university-of-science-and-technology', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Washington University of Science and Technology''s admissions pages.'),
  ('washington-university-of-science-and-technology', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check Washington University of Science and Technology''s admissions pages.'),
  ('washington-university-of-science-and-technology', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check Washington University of Science and Technology''s admissions pages.'),
  ('washington-university-of-science-and-technology', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Washington University of Science and Technology''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #183: Stonehill College (UNITID 167996)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-stonehill-college', 'College Scorecard — Stonehill College', 'https://collegescorecard.ed.gov/school/?167996-stonehill_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('stonehill-college', 'Stonehill College', 'Easton, Massachusetts', 'United States', '🇺🇸', 'Private four-year institution in Easton, Massachusetts.',
  'Stonehill College. College Scorecard (2023) reports out-of-state tuition $57,490 / year and a middle-50% SAT range not reported.', 'stonehill-college', array[]::text[], 'us-scorecard-stonehill-college', 183, 'us-4prep-ranking-scorecard-2023', 167996)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('stonehill-college', 'tuition'::public.university_fact_kind, '$57,490 / year (Scorecard 2023)', 57490, 'USD', 'us-scorecard-stonehill-college', null, null, 'year'),
  ('stonehill-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Stonehill College''s admissions / financial-aid pages.', null),
  ('stonehill-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Stonehill College''s admissions pages.', null),
  ('stonehill-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Stonehill College''s admissions pages.', null),
  ('stonehill-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Stonehill College''s financial-aid pages.', null),
  ('stonehill-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Stonehill College''s admissions pages.', null),
  ('stonehill-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Stonehill College''s admissions pages.', null),
  ('stonehill-college', 'room_board'::public.university_fact_kind, '$16,120 / year (Scorecard 2023)', 16120, 'USD', 'us-scorecard-stonehill-college', null, null, 'year'),
  ('stonehill-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Stonehill College''s financial-aid pages.', null),
  ('stonehill-college', 'total_cost_of_attendance'::public.university_fact_kind, '$72,714 / year (Scorecard 2023)', 72714, 'USD', 'us-scorecard-stonehill-college', null, null, 'year'),
  ('stonehill-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Stonehill College''s international admissions / financial-aid pages.', null),
  ('stonehill-college', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check Stonehill College''s admissions pages.', null),
  ('stonehill-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Stonehill College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('stonehill-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Stonehill College''s admissions pages.'),
  ('stonehill-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Stonehill College''s admissions pages.'),
  ('stonehill-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Stonehill College''s admissions pages.'),
  ('stonehill-college', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check Stonehill College''s admissions pages.'),
  ('stonehill-college', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check Stonehill College''s admissions pages.'),
  ('stonehill-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Stonehill College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #184: Bryant University (UNITID 217165)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-bryant-university', 'College Scorecard — Bryant University', 'https://collegescorecard.ed.gov/school/?217165-bryant_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('bryant-university', 'Bryant University', 'Smithfield, Rhode Island', 'United States', '🇺🇸', 'Private four-year institution in Smithfield, Rhode Island.',
  'Bryant University. College Scorecard (2023) reports out-of-state tuition $52,677 / year and a middle-50% SAT range Middle-50% SAT critical reading 610–660; math 580–670 (Scorecard 2023).', 'bryant-university', array[]::text[], 'us-scorecard-bryant-university', 184, 'us-4prep-ranking-scorecard-2023', 217165)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('bryant-university', 'tuition'::public.university_fact_kind, '$52,677 / year (Scorecard 2023)', 52677, 'USD', 'us-scorecard-bryant-university', null, null, 'year'),
  ('bryant-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Bryant University''s admissions / financial-aid pages.', null),
  ('bryant-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Bryant University''s admissions pages.', null),
  ('bryant-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Bryant University''s admissions pages.', null),
  ('bryant-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Bryant University''s financial-aid pages.', null),
  ('bryant-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Bryant University''s admissions pages.', null),
  ('bryant-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Bryant University''s admissions pages.', null),
  ('bryant-university', 'room_board'::public.university_fact_kind, '$17,528 / year (Scorecard 2023)', 17528, 'USD', 'us-scorecard-bryant-university', null, null, 'year'),
  ('bryant-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Bryant University''s financial-aid pages.', null),
  ('bryant-university', 'total_cost_of_attendance'::public.university_fact_kind, '$69,964 / year (Scorecard 2023)', 69964, 'USD', 'us-scorecard-bryant-university', null, null, 'year'),
  ('bryant-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Bryant University''s international admissions / financial-aid pages.', null),
  ('bryant-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 610–660; math 580–670 (Scorecard 2023); Middle-50% ACT 27–28 (Scorecard 2023)', null, null, 'us-scorecard-bryant-university', null, null, null),
  ('bryant-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Bryant University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('bryant-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Bryant University''s admissions pages.'),
  ('bryant-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Bryant University''s admissions pages.'),
  ('bryant-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Bryant University''s admissions pages.'),
  ('bryant-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 610–660; math 580–670 (Scorecard 2023)', null, 'us-scorecard-bryant-university', null, null),
  ('bryant-university', 'act'::public.requirement_kind, 'Middle-50% ACT 27–28 (Scorecard 2023)', null, 'us-scorecard-bryant-university', null, null),
  ('bryant-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Bryant University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #185: Soka University of America (UNITID 399911)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-soka-university-of-america', 'College Scorecard — Soka University of America', 'https://collegescorecard.ed.gov/school/?399911-soka_university_of_america', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('soka-university-of-america', 'Soka University of America', 'Aliso Viejo, California', 'United States', '🇺🇸', 'Private four-year institution in Aliso Viejo, California.',
  'Soka University of America. College Scorecard (2023) reports out-of-state tuition $38,728 / year and a middle-50% SAT range Middle-50% SAT critical reading 620–720; math 713–790 (Scorecard 2023).', 'soka-university-of-america', array[]::text[], 'us-scorecard-soka-university-of-america', 185, 'us-4prep-ranking-scorecard-2023', 399911)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('soka-university-of-america', 'tuition'::public.university_fact_kind, '$38,728 / year (Scorecard 2023)', 38728, 'USD', 'us-scorecard-soka-university-of-america', null, null, 'year'),
  ('soka-university-of-america', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Soka University of America''s admissions / financial-aid pages.', null),
  ('soka-university-of-america', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Soka University of America''s admissions pages.', null),
  ('soka-university-of-america', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Soka University of America''s admissions pages.', null),
  ('soka-university-of-america', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Soka University of America''s financial-aid pages.', null),
  ('soka-university-of-america', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Soka University of America''s admissions pages.', null),
  ('soka-university-of-america', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Soka University of America''s admissions pages.', null),
  ('soka-university-of-america', 'room_board'::public.university_fact_kind, '$14,378 / year (Scorecard 2023)', 14378, 'USD', 'us-scorecard-soka-university-of-america', null, null, 'year'),
  ('soka-university-of-america', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Soka University of America''s financial-aid pages.', null),
  ('soka-university-of-america', 'total_cost_of_attendance'::public.university_fact_kind, '$55,064 / year (Scorecard 2023)', 55064, 'USD', 'us-scorecard-soka-university-of-america', null, null, 'year'),
  ('soka-university-of-america', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Soka University of America''s international admissions / financial-aid pages.', null),
  ('soka-university-of-america', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 620–720; math 713–790 (Scorecard 2023)', null, null, 'us-scorecard-soka-university-of-america', null, null, null),
  ('soka-university-of-america', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Soka University of America''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('soka-university-of-america', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Soka University of America''s admissions pages.'),
  ('soka-university-of-america', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Soka University of America''s admissions pages.'),
  ('soka-university-of-america', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Soka University of America''s admissions pages.'),
  ('soka-university-of-america', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 620–720; math 713–790 (Scorecard 2023)', null, 'us-scorecard-soka-university-of-america', null, null),
  ('soka-university-of-america', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check Soka University of America''s admissions pages.'),
  ('soka-university-of-america', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Soka University of America''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #186: Pennsylvania State University-Main Campus (UNITID 214777)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-pennsylvania-state-university-main-campus', 'College Scorecard — Pennsylvania State University-Main Campus', 'https://collegescorecard.ed.gov/school/?214777-pennsylvania_state_university_main_campus', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('pennsylvania-state-university-main-campus', 'Pennsylvania State University-Main Campus', 'University Park, Pennsylvania', 'United States', '🇺🇸', 'Public four-year institution in University Park, Pennsylvania.',
  'Pennsylvania State University-Main Campus. College Scorecard (2023) reports out-of-state tuition $41,790 / year and a middle-50% SAT range Middle-50% SAT critical reading 620–700; math 620–720 (Scorecard 2023).', 'pennsylvania-state-university-main-campus', array[]::text[], 'us-scorecard-pennsylvania-state-university-main-campus', 186, 'us-4prep-ranking-scorecard-2023', 214777)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('pennsylvania-state-university-main-campus', 'tuition'::public.university_fact_kind, '$41,790 / year (Scorecard 2023)', 41790, 'USD', 'us-scorecard-pennsylvania-state-university-main-campus', null, null, 'year'),
  ('pennsylvania-state-university-main-campus', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Pennsylvania State University-Main Campus''s admissions / financial-aid pages.', null),
  ('pennsylvania-state-university-main-campus', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Pennsylvania State University-Main Campus''s admissions pages.', null),
  ('pennsylvania-state-university-main-campus', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Pennsylvania State University-Main Campus''s admissions pages.', null),
  ('pennsylvania-state-university-main-campus', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Pennsylvania State University-Main Campus''s financial-aid pages.', null),
  ('pennsylvania-state-university-main-campus', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Pennsylvania State University-Main Campus''s admissions pages.', null),
  ('pennsylvania-state-university-main-campus', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Pennsylvania State University-Main Campus''s admissions pages.', null),
  ('pennsylvania-state-university-main-campus', 'room_board'::public.university_fact_kind, '$14,474 / year (Scorecard 2023)', 14474, 'USD', 'us-scorecard-pennsylvania-state-university-main-campus', null, null, 'year'),
  ('pennsylvania-state-university-main-campus', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Pennsylvania State University-Main Campus''s financial-aid pages.', null),
  ('pennsylvania-state-university-main-campus', 'total_cost_of_attendance'::public.university_fact_kind, '$39,694 / year (Scorecard 2023)', 39694, 'USD', 'us-scorecard-pennsylvania-state-university-main-campus', null, null, 'year'),
  ('pennsylvania-state-university-main-campus', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Pennsylvania State University-Main Campus''s international admissions / financial-aid pages.', null),
  ('pennsylvania-state-university-main-campus', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 620–700; math 620–720 (Scorecard 2023); Middle-50% ACT 27–32 (Scorecard 2023)', null, null, 'us-scorecard-pennsylvania-state-university-main-campus', null, null, null),
  ('pennsylvania-state-university-main-campus', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Pennsylvania State University-Main Campus''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('pennsylvania-state-university-main-campus', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Pennsylvania State University-Main Campus''s admissions pages.'),
  ('pennsylvania-state-university-main-campus', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Pennsylvania State University-Main Campus''s admissions pages.'),
  ('pennsylvania-state-university-main-campus', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Pennsylvania State University-Main Campus''s admissions pages.'),
  ('pennsylvania-state-university-main-campus', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 620–700; math 620–720 (Scorecard 2023)', null, 'us-scorecard-pennsylvania-state-university-main-campus', null, null),
  ('pennsylvania-state-university-main-campus', 'act'::public.requirement_kind, 'Middle-50% ACT 27–32 (Scorecard 2023)', null, 'us-scorecard-pennsylvania-state-university-main-campus', null, null),
  ('pennsylvania-state-university-main-campus', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Pennsylvania State University-Main Campus''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #187: Ohio State University-Main Campus (UNITID 204796)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-ohio-state-university-main-campus', 'College Scorecard — Ohio State University-Main Campus', 'https://collegescorecard.ed.gov/school/?204796-ohio_state_university_main_campus', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('ohio-state-university-main-campus', 'Ohio State University-Main Campus', 'Columbus, Ohio', 'United States', '🇺🇸', 'Public four-year institution in Columbus, Ohio.',
  'Ohio State University-Main Campus. College Scorecard (2023) reports out-of-state tuition $40,022 / year and a middle-50% SAT range Middle-50% SAT critical reading 640–720; math 670–760 (Scorecard 2023).', 'ohio-state-university-main-campus', array[]::text[], 'us-scorecard-ohio-state-university-main-campus', 187, 'us-4prep-ranking-scorecard-2023', 204796)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('ohio-state-university-main-campus', 'tuition'::public.university_fact_kind, '$40,022 / year (Scorecard 2023)', 40022, 'USD', 'us-scorecard-ohio-state-university-main-campus', null, null, 'year'),
  ('ohio-state-university-main-campus', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Ohio State University-Main Campus''s admissions / financial-aid pages.', null),
  ('ohio-state-university-main-campus', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Ohio State University-Main Campus''s admissions pages.', null),
  ('ohio-state-university-main-campus', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Ohio State University-Main Campus''s admissions pages.', null),
  ('ohio-state-university-main-campus', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Ohio State University-Main Campus''s financial-aid pages.', null),
  ('ohio-state-university-main-campus', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Ohio State University-Main Campus''s admissions pages.', null),
  ('ohio-state-university-main-campus', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Ohio State University-Main Campus''s admissions pages.', null),
  ('ohio-state-university-main-campus', 'room_board'::public.university_fact_kind, '$14,738 / year (Scorecard 2023)', 14738, 'USD', 'us-scorecard-ohio-state-university-main-campus', null, null, 'year'),
  ('ohio-state-university-main-campus', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Ohio State University-Main Campus''s financial-aid pages.', null),
  ('ohio-state-university-main-campus', 'total_cost_of_attendance'::public.university_fact_kind, '$30,305 / year (Scorecard 2023)', 30305, 'USD', 'us-scorecard-ohio-state-university-main-campus', null, null, 'year'),
  ('ohio-state-university-main-campus', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Ohio State University-Main Campus''s international admissions / financial-aid pages.', null),
  ('ohio-state-university-main-campus', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 640–720; math 670–760 (Scorecard 2023); Middle-50% ACT 28–32 (Scorecard 2023)', null, null, 'us-scorecard-ohio-state-university-main-campus', null, null, null),
  ('ohio-state-university-main-campus', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Ohio State University-Main Campus''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('ohio-state-university-main-campus', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Ohio State University-Main Campus''s admissions pages.'),
  ('ohio-state-university-main-campus', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Ohio State University-Main Campus''s admissions pages.'),
  ('ohio-state-university-main-campus', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Ohio State University-Main Campus''s admissions pages.'),
  ('ohio-state-university-main-campus', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 640–720; math 670–760 (Scorecard 2023)', null, 'us-scorecard-ohio-state-university-main-campus', null, null),
  ('ohio-state-university-main-campus', 'act'::public.requirement_kind, 'Middle-50% ACT 28–32 (Scorecard 2023)', null, 'us-scorecard-ohio-state-university-main-campus', null, null),
  ('ohio-state-university-main-campus', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Ohio State University-Main Campus''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #188: Rochester Institute of Technology (UNITID 195003)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-rochester-institute-of-technology', 'College Scorecard — Rochester Institute of Technology', 'https://collegescorecard.ed.gov/school/?195003-rochester_institute_of_technology', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('rochester-institute-of-technology', 'Rochester Institute of Technology', 'Rochester, New York', 'United States', '🇺🇸', 'Private four-year institution in Rochester, New York.',
  'Rochester Institute of Technology. College Scorecard (2023) reports out-of-state tuition $59,274 / year and a middle-50% SAT range Middle-50% SAT critical reading 650–720; math 650–740 (Scorecard 2023).', 'rochester-institute-of-technology', array[]::text[], 'us-scorecard-rochester-institute-of-technology', 188, 'us-4prep-ranking-scorecard-2023', 195003)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('rochester-institute-of-technology', 'tuition'::public.university_fact_kind, '$59,274 / year (Scorecard 2023)', 59274, 'USD', 'us-scorecard-rochester-institute-of-technology', null, null, 'year'),
  ('rochester-institute-of-technology', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Rochester Institute of Technology''s admissions / financial-aid pages.', null),
  ('rochester-institute-of-technology', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Rochester Institute of Technology''s admissions pages.', null),
  ('rochester-institute-of-technology', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Rochester Institute of Technology''s admissions pages.', null),
  ('rochester-institute-of-technology', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Rochester Institute of Technology''s financial-aid pages.', null),
  ('rochester-institute-of-technology', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Rochester Institute of Technology''s admissions pages.', null),
  ('rochester-institute-of-technology', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Rochester Institute of Technology''s admissions pages.', null),
  ('rochester-institute-of-technology', 'room_board'::public.university_fact_kind, '$16,142 / year (Scorecard 2023)', 16142, 'USD', 'us-scorecard-rochester-institute-of-technology', null, null, 'year'),
  ('rochester-institute-of-technology', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Rochester Institute of Technology''s financial-aid pages.', null),
  ('rochester-institute-of-technology', 'total_cost_of_attendance'::public.university_fact_kind, '$74,626 / year (Scorecard 2023)', 74626, 'USD', 'us-scorecard-rochester-institute-of-technology', null, null, 'year'),
  ('rochester-institute-of-technology', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Rochester Institute of Technology''s international admissions / financial-aid pages.', null),
  ('rochester-institute-of-technology', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 650–720; math 650–740 (Scorecard 2023); Middle-50% ACT 29–33 (Scorecard 2023)', null, null, 'us-scorecard-rochester-institute-of-technology', null, null, null),
  ('rochester-institute-of-technology', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Rochester Institute of Technology''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('rochester-institute-of-technology', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Rochester Institute of Technology''s admissions pages.'),
  ('rochester-institute-of-technology', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Rochester Institute of Technology''s admissions pages.'),
  ('rochester-institute-of-technology', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Rochester Institute of Technology''s admissions pages.'),
  ('rochester-institute-of-technology', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 650–720; math 650–740 (Scorecard 2023)', null, 'us-scorecard-rochester-institute-of-technology', null, null),
  ('rochester-institute-of-technology', 'act'::public.requirement_kind, 'Middle-50% ACT 29–33 (Scorecard 2023)', null, 'us-scorecard-rochester-institute-of-technology', null, null),
  ('rochester-institute-of-technology', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Rochester Institute of Technology''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #189: Rose-Hulman Institute of Technology (UNITID 152318)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-rose-hulman-institute-of-technology', 'College Scorecard — Rose-Hulman Institute of Technology', 'https://collegescorecard.ed.gov/school/?152318-rose_hulman_institute_of_technology', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('rose-hulman-institute-of-technology', 'Rose-Hulman Institute of Technology', 'Terre Haute, Indiana', 'United States', '🇺🇸', 'Private four-year institution in Terre Haute, Indiana.',
  'Rose-Hulman Institute of Technology. College Scorecard (2023) reports out-of-state tuition $58,649 / year and a middle-50% SAT range Middle-50% SAT critical reading 650–730; math 670–770 (Scorecard 2023).', 'rose-hulman-institute-of-technology', array[]::text[], 'us-scorecard-rose-hulman-institute-of-technology', 189, 'us-4prep-ranking-scorecard-2023', 152318)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('rose-hulman-institute-of-technology', 'tuition'::public.university_fact_kind, '$58,649 / year (Scorecard 2023)', 58649, 'USD', 'us-scorecard-rose-hulman-institute-of-technology', null, null, 'year'),
  ('rose-hulman-institute-of-technology', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Rose-Hulman Institute of Technology''s admissions / financial-aid pages.', null),
  ('rose-hulman-institute-of-technology', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Rose-Hulman Institute of Technology''s admissions pages.', null),
  ('rose-hulman-institute-of-technology', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Rose-Hulman Institute of Technology''s admissions pages.', null),
  ('rose-hulman-institute-of-technology', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Rose-Hulman Institute of Technology''s financial-aid pages.', null),
  ('rose-hulman-institute-of-technology', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Rose-Hulman Institute of Technology''s admissions pages.', null),
  ('rose-hulman-institute-of-technology', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Rose-Hulman Institute of Technology''s admissions pages.', null),
  ('rose-hulman-institute-of-technology', 'room_board'::public.university_fact_kind, '$17,727 / year (Scorecard 2023)', 17727, 'USD', 'us-scorecard-rose-hulman-institute-of-technology', null, null, 'year'),
  ('rose-hulman-institute-of-technology', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Rose-Hulman Institute of Technology''s financial-aid pages.', null),
  ('rose-hulman-institute-of-technology', 'total_cost_of_attendance'::public.university_fact_kind, '$77,890 / year (Scorecard 2023)', 77890, 'USD', 'us-scorecard-rose-hulman-institute-of-technology', null, null, 'year'),
  ('rose-hulman-institute-of-technology', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Rose-Hulman Institute of Technology''s international admissions / financial-aid pages.', null),
  ('rose-hulman-institute-of-technology', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 650–730; math 670–770 (Scorecard 2023); Middle-50% ACT 29–34 (Scorecard 2023)', null, null, 'us-scorecard-rose-hulman-institute-of-technology', null, null, null),
  ('rose-hulman-institute-of-technology', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Rose-Hulman Institute of Technology''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('rose-hulman-institute-of-technology', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Rose-Hulman Institute of Technology''s admissions pages.'),
  ('rose-hulman-institute-of-technology', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Rose-Hulman Institute of Technology''s admissions pages.'),
  ('rose-hulman-institute-of-technology', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Rose-Hulman Institute of Technology''s admissions pages.'),
  ('rose-hulman-institute-of-technology', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 650–730; math 670–770 (Scorecard 2023)', null, 'us-scorecard-rose-hulman-institute-of-technology', null, null),
  ('rose-hulman-institute-of-technology', 'act'::public.requirement_kind, 'Middle-50% ACT 29–34 (Scorecard 2023)', null, 'us-scorecard-rose-hulman-institute-of-technology', null, null),
  ('rose-hulman-institute-of-technology', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Rose-Hulman Institute of Technology''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #190: California State University-Long Beach (UNITID 110583)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-california-state-university-long-beach', 'College Scorecard — California State University-Long Beach', 'https://collegescorecard.ed.gov/school/?110583-california_state_university_long_beach', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('california-state-university-long-beach', 'California State University-Long Beach', 'Long Beach, California', 'United States', '🇺🇸', 'Public four-year institution in Long Beach, California.',
  'California State University-Long Beach. College Scorecard (2023) reports out-of-state tuition $19,950 / year and a middle-50% SAT range not reported.', 'california-state-university-long-beach', array[]::text[], 'us-scorecard-california-state-university-long-beach', 190, 'us-4prep-ranking-scorecard-2023', 110583)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('california-state-university-long-beach', 'tuition'::public.university_fact_kind, '$19,950 / year (Scorecard 2023)', 19950, 'USD', 'us-scorecard-california-state-university-long-beach', null, null, 'year'),
  ('california-state-university-long-beach', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check California State University-Long Beach''s admissions / financial-aid pages.', null),
  ('california-state-university-long-beach', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check California State University-Long Beach''s admissions pages.', null),
  ('california-state-university-long-beach', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check California State University-Long Beach''s admissions pages.', null),
  ('california-state-university-long-beach', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check California State University-Long Beach''s financial-aid pages.', null),
  ('california-state-university-long-beach', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check California State University-Long Beach''s admissions pages.', null),
  ('california-state-university-long-beach', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check California State University-Long Beach''s admissions pages.', null),
  ('california-state-university-long-beach', 'room_board'::public.university_fact_kind, '$15,612 / year (Scorecard 2023)', 15612, 'USD', 'us-scorecard-california-state-university-long-beach', null, null, 'year'),
  ('california-state-university-long-beach', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check California State University-Long Beach''s financial-aid pages.', null),
  ('california-state-university-long-beach', 'total_cost_of_attendance'::public.university_fact_kind, '$22,679 / year (Scorecard 2023)', 22679, 'USD', 'us-scorecard-california-state-university-long-beach', null, null, 'year'),
  ('california-state-university-long-beach', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check California State University-Long Beach''s international admissions / financial-aid pages.', null),
  ('california-state-university-long-beach', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check California State University-Long Beach''s admissions pages.', null),
  ('california-state-university-long-beach', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask California State University-Long Beach''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('california-state-university-long-beach', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check California State University-Long Beach''s admissions pages.'),
  ('california-state-university-long-beach', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check California State University-Long Beach''s admissions pages.'),
  ('california-state-university-long-beach', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check California State University-Long Beach''s admissions pages.'),
  ('california-state-university-long-beach', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check California State University-Long Beach''s admissions pages.'),
  ('california-state-university-long-beach', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check California State University-Long Beach''s admissions pages.'),
  ('california-state-university-long-beach', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check California State University-Long Beach''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #191: The University of Tennessee-Knoxville (UNITID 221759)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-the-university-of-tennessee-knoxville', 'College Scorecard — The University of Tennessee-Knoxville', 'https://collegescorecard.ed.gov/school/?221759-the_university_of_tennessee_knoxville', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('the-university-of-tennessee-knoxville', 'The University of Tennessee-Knoxville', 'Knoxville, Tennessee', 'United States', '🇺🇸', 'Public four-year institution in Knoxville, Tennessee.',
  'The University of Tennessee-Knoxville. College Scorecard (2023) reports out-of-state tuition $33,256 / year and a middle-50% SAT range Middle-50% SAT critical reading 600–680; math 600–690 (Scorecard 2023).', 'the-university-of-tennessee-knoxville', array[]::text[], 'us-scorecard-the-university-of-tennessee-knoxville', 191, 'us-4prep-ranking-scorecard-2023', 221759)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('the-university-of-tennessee-knoxville', 'tuition'::public.university_fact_kind, '$33,256 / year (Scorecard 2023)', 33256, 'USD', 'us-scorecard-the-university-of-tennessee-knoxville', null, null, 'year'),
  ('the-university-of-tennessee-knoxville', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check The University of Tennessee-Knoxville''s admissions / financial-aid pages.', null),
  ('the-university-of-tennessee-knoxville', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check The University of Tennessee-Knoxville''s admissions pages.', null),
  ('the-university-of-tennessee-knoxville', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check The University of Tennessee-Knoxville''s admissions pages.', null),
  ('the-university-of-tennessee-knoxville', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check The University of Tennessee-Knoxville''s financial-aid pages.', null),
  ('the-university-of-tennessee-knoxville', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check The University of Tennessee-Knoxville''s admissions pages.', null),
  ('the-university-of-tennessee-knoxville', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check The University of Tennessee-Knoxville''s admissions pages.', null),
  ('the-university-of-tennessee-knoxville', 'room_board'::public.university_fact_kind, '$13,356 / year (Scorecard 2023)', 13356, 'USD', 'us-scorecard-the-university-of-tennessee-knoxville', null, null, 'year'),
  ('the-university-of-tennessee-knoxville', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check The University of Tennessee-Knoxville''s financial-aid pages.', null),
  ('the-university-of-tennessee-knoxville', 'total_cost_of_attendance'::public.university_fact_kind, '$33,678 / year (Scorecard 2023)', 33678, 'USD', 'us-scorecard-the-university-of-tennessee-knoxville', null, null, 'year'),
  ('the-university-of-tennessee-knoxville', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check The University of Tennessee-Knoxville''s international admissions / financial-aid pages.', null),
  ('the-university-of-tennessee-knoxville', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 600–680; math 600–690 (Scorecard 2023); Middle-50% ACT 25–31 (Scorecard 2023)', null, null, 'us-scorecard-the-university-of-tennessee-knoxville', null, null, null),
  ('the-university-of-tennessee-knoxville', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask The University of Tennessee-Knoxville''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('the-university-of-tennessee-knoxville', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check The University of Tennessee-Knoxville''s admissions pages.'),
  ('the-university-of-tennessee-knoxville', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check The University of Tennessee-Knoxville''s admissions pages.'),
  ('the-university-of-tennessee-knoxville', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check The University of Tennessee-Knoxville''s admissions pages.'),
  ('the-university-of-tennessee-knoxville', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 600–680; math 600–690 (Scorecard 2023)', null, 'us-scorecard-the-university-of-tennessee-knoxville', null, null),
  ('the-university-of-tennessee-knoxville', 'act'::public.requirement_kind, 'Middle-50% ACT 25–31 (Scorecard 2023)', null, 'us-scorecard-the-university-of-tennessee-knoxville', null, null),
  ('the-university-of-tennessee-knoxville', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check The University of Tennessee-Knoxville''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #192: The College of New Jersey (UNITID 187134)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-the-college-of-new-jersey', 'College Scorecard — The College of New Jersey', 'https://collegescorecard.ed.gov/school/?187134-the_college_of_new_jersey', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('the-college-of-new-jersey', 'The College of New Jersey', 'Ewing, New Jersey', 'United States', '🇺🇸', 'Public four-year institution in Ewing, New Jersey.',
  'The College of New Jersey. College Scorecard (2023) reports out-of-state tuition $25,752 / year and a middle-50% SAT range Middle-50% SAT critical reading 570–670; math 570–670 (Scorecard 2023).', 'the-college-of-new-jersey', array[]::text[], 'us-scorecard-the-college-of-new-jersey', 192, 'us-4prep-ranking-scorecard-2023', 187134)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('the-college-of-new-jersey', 'tuition'::public.university_fact_kind, '$25,752 / year (Scorecard 2023)', 25752, 'USD', 'us-scorecard-the-college-of-new-jersey', null, null, 'year'),
  ('the-college-of-new-jersey', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check The College of New Jersey''s admissions / financial-aid pages.', null),
  ('the-college-of-new-jersey', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check The College of New Jersey''s admissions pages.', null),
  ('the-college-of-new-jersey', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check The College of New Jersey''s admissions pages.', null),
  ('the-college-of-new-jersey', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check The College of New Jersey''s financial-aid pages.', null),
  ('the-college-of-new-jersey', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check The College of New Jersey''s admissions pages.', null),
  ('the-college-of-new-jersey', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check The College of New Jersey''s admissions pages.', null),
  ('the-college-of-new-jersey', 'room_board'::public.university_fact_kind, '$14,976 / year (Scorecard 2023)', 14976, 'USD', 'us-scorecard-the-college-of-new-jersey', null, null, 'year'),
  ('the-college-of-new-jersey', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check The College of New Jersey''s financial-aid pages.', null),
  ('the-college-of-new-jersey', 'total_cost_of_attendance'::public.university_fact_kind, '$38,860 / year (Scorecard 2023)', 38860, 'USD', 'us-scorecard-the-college-of-new-jersey', null, null, 'year'),
  ('the-college-of-new-jersey', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check The College of New Jersey''s international admissions / financial-aid pages.', null),
  ('the-college-of-new-jersey', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 570–670; math 570–670 (Scorecard 2023); Middle-50% ACT 26–31 (Scorecard 2023)', null, null, 'us-scorecard-the-college-of-new-jersey', null, null, null),
  ('the-college-of-new-jersey', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask The College of New Jersey''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('the-college-of-new-jersey', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check The College of New Jersey''s admissions pages.'),
  ('the-college-of-new-jersey', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check The College of New Jersey''s admissions pages.'),
  ('the-college-of-new-jersey', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check The College of New Jersey''s admissions pages.'),
  ('the-college-of-new-jersey', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 570–670; math 570–670 (Scorecard 2023)', null, 'us-scorecard-the-college-of-new-jersey', null, null),
  ('the-college-of-new-jersey', 'act'::public.requirement_kind, 'Middle-50% ACT 26–31 (Scorecard 2023)', null, 'us-scorecard-the-college-of-new-jersey', null, null),
  ('the-college-of-new-jersey', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check The College of New Jersey''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #193: Methodist College (UNITID 147129)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-methodist-college', 'College Scorecard — Methodist College', 'https://collegescorecard.ed.gov/school/?147129-methodist_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('methodist-college', 'Methodist College', 'Peoria, Illinois', 'United States', '🇺🇸', 'Private four-year institution in Peoria, Illinois.',
  'Methodist College. College Scorecard (2023) reports out-of-state tuition $18,008 / year and a middle-50% SAT range not reported.', 'methodist-college', array[]::text[], 'us-scorecard-methodist-college', 193, 'us-4prep-ranking-scorecard-2023', 147129)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('methodist-college', 'tuition'::public.university_fact_kind, '$18,008 / year (Scorecard 2023)', 18008, 'USD', 'us-scorecard-methodist-college', null, null, 'year'),
  ('methodist-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Methodist College''s admissions / financial-aid pages.', null),
  ('methodist-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Methodist College''s admissions pages.', null),
  ('methodist-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Methodist College''s admissions pages.', null),
  ('methodist-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Methodist College''s financial-aid pages.', null),
  ('methodist-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Methodist College''s admissions pages.', null),
  ('methodist-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Methodist College''s admissions pages.', null),
  ('methodist-college', 'room_board'::public.university_fact_kind, '$17,280 / year (Scorecard 2023)', 17280, 'USD', 'us-scorecard-methodist-college', null, null, 'year'),
  ('methodist-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Methodist College''s financial-aid pages.', null),
  ('methodist-college', 'total_cost_of_attendance'::public.university_fact_kind, '$46,874 / year (Scorecard 2023)', 46874, 'USD', 'us-scorecard-methodist-college', null, null, 'year'),
  ('methodist-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Methodist College''s international admissions / financial-aid pages.', null),
  ('methodist-college', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check Methodist College''s admissions pages.', null),
  ('methodist-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Methodist College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('methodist-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Methodist College''s admissions pages.'),
  ('methodist-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Methodist College''s admissions pages.'),
  ('methodist-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Methodist College''s admissions pages.'),
  ('methodist-college', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check Methodist College''s admissions pages.'),
  ('methodist-college', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check Methodist College''s admissions pages.'),
  ('methodist-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Methodist College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #194: Sacred Heart University (UNITID 130253)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-sacred-heart-university', 'College Scorecard — Sacred Heart University', 'https://collegescorecard.ed.gov/school/?130253-sacred_heart_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('sacred-heart-university', 'Sacred Heart University', 'Fairfield, Connecticut', 'United States', '🇺🇸', 'Private four-year institution in Fairfield, Connecticut.',
  'Sacred Heart University. College Scorecard (2023) reports out-of-state tuition $50,404 / year and a middle-50% SAT range not reported.', 'sacred-heart-university', array[]::text[], 'us-scorecard-sacred-heart-university', 194, 'us-4prep-ranking-scorecard-2023', 130253)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('sacred-heart-university', 'tuition'::public.university_fact_kind, '$50,404 / year (Scorecard 2023)', 50404, 'USD', 'us-scorecard-sacred-heart-university', null, null, 'year'),
  ('sacred-heart-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Sacred Heart University''s admissions / financial-aid pages.', null),
  ('sacred-heart-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Sacred Heart University''s admissions pages.', null),
  ('sacred-heart-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Sacred Heart University''s admissions pages.', null),
  ('sacred-heart-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Sacred Heart University''s financial-aid pages.', null),
  ('sacred-heart-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Sacred Heart University''s admissions pages.', null),
  ('sacred-heart-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Sacred Heart University''s admissions pages.', null),
  ('sacred-heart-university', 'room_board'::public.university_fact_kind, '$19,140 / year (Scorecard 2023)', 19140, 'USD', 'us-scorecard-sacred-heart-university', null, null, 'year'),
  ('sacred-heart-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Sacred Heart University''s financial-aid pages.', null),
  ('sacred-heart-university', 'total_cost_of_attendance'::public.university_fact_kind, '$69,289 / year (Scorecard 2023)', 69289, 'USD', 'us-scorecard-sacred-heart-university', null, null, 'year'),
  ('sacred-heart-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Sacred Heart University''s international admissions / financial-aid pages.', null),
  ('sacred-heart-university', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check Sacred Heart University''s admissions pages.', null),
  ('sacred-heart-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Sacred Heart University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('sacred-heart-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Sacred Heart University''s admissions pages.'),
  ('sacred-heart-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Sacred Heart University''s admissions pages.'),
  ('sacred-heart-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Sacred Heart University''s admissions pages.'),
  ('sacred-heart-university', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check Sacred Heart University''s admissions pages.'),
  ('sacred-heart-university', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check Sacred Heart University''s admissions pages.'),
  ('sacred-heart-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Sacred Heart University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #195: Drake University (UNITID 153269)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-drake-university', 'College Scorecard — Drake University', 'https://collegescorecard.ed.gov/school/?153269-drake_university', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('drake-university', 'Drake University', 'Des Moines, Iowa', 'United States', '🇺🇸', 'Private four-year institution in Des Moines, Iowa.',
  'Drake University. College Scorecard (2023) reports out-of-state tuition $52,130 / year and a middle-50% SAT range Middle-50% SAT critical reading 580–680; math 530–670 (Scorecard 2023).', 'drake-university', array[]::text[], 'us-scorecard-drake-university', 195, 'us-4prep-ranking-scorecard-2023', 153269)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('drake-university', 'tuition'::public.university_fact_kind, '$52,130 / year (Scorecard 2023)', 52130, 'USD', 'us-scorecard-drake-university', null, null, 'year'),
  ('drake-university', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Drake University''s admissions / financial-aid pages.', null),
  ('drake-university', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Drake University''s admissions pages.', null),
  ('drake-university', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Drake University''s admissions pages.', null),
  ('drake-university', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Drake University''s financial-aid pages.', null),
  ('drake-university', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Drake University''s admissions pages.', null),
  ('drake-university', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Drake University''s admissions pages.', null),
  ('drake-university', 'room_board'::public.university_fact_kind, '$12,452 / year (Scorecard 2023)', 12452, 'USD', 'us-scorecard-drake-university', null, null, 'year'),
  ('drake-university', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Drake University''s financial-aid pages.', null),
  ('drake-university', 'total_cost_of_attendance'::public.university_fact_kind, '$64,835 / year (Scorecard 2023)', 64835, 'USD', 'us-scorecard-drake-university', null, null, 'year'),
  ('drake-university', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Drake University''s international admissions / financial-aid pages.', null),
  ('drake-university', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 580–680; math 530–670 (Scorecard 2023); Middle-50% ACT 24–29 (Scorecard 2023)', null, null, 'us-scorecard-drake-university', null, null, null),
  ('drake-university', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Drake University''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('drake-university', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Drake University''s admissions pages.'),
  ('drake-university', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Drake University''s admissions pages.'),
  ('drake-university', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Drake University''s admissions pages.'),
  ('drake-university', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 580–680; math 530–670 (Scorecard 2023)', null, 'us-scorecard-drake-university', null, null),
  ('drake-university', 'act'::public.requirement_kind, 'Middle-50% ACT 24–29 (Scorecard 2023)', null, 'us-scorecard-drake-university', null, null),
  ('drake-university', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Drake University''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #196: Hobart William Smith Colleges (UNITID 191630)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-hobart-william-smith-colleges', 'College Scorecard — Hobart William Smith Colleges', 'https://collegescorecard.ed.gov/school/?191630-hobart_william_smith_colleges', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('hobart-william-smith-colleges', 'Hobart William Smith Colleges', 'Geneva, New York', 'United States', '🇺🇸', 'Private four-year institution in Geneva, New York.',
  'Hobart William Smith Colleges. College Scorecard (2023) reports out-of-state tuition $65,117 / year and a middle-50% SAT range Middle-50% SAT critical reading 610–700; math 580–685 (Scorecard 2023).', 'hobart-william-smith-colleges', array[]::text[], 'us-scorecard-hobart-william-smith-colleges', 196, 'us-4prep-ranking-scorecard-2023', 191630)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('hobart-william-smith-colleges', 'tuition'::public.university_fact_kind, '$65,117 / year (Scorecard 2023)', 65117, 'USD', 'us-scorecard-hobart-william-smith-colleges', null, null, 'year'),
  ('hobart-william-smith-colleges', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Hobart William Smith Colleges''s admissions / financial-aid pages.', null),
  ('hobart-william-smith-colleges', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Hobart William Smith Colleges''s admissions pages.', null),
  ('hobart-william-smith-colleges', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Hobart William Smith Colleges''s admissions pages.', null),
  ('hobart-william-smith-colleges', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Hobart William Smith Colleges''s financial-aid pages.', null),
  ('hobart-william-smith-colleges', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Hobart William Smith Colleges''s admissions pages.', null),
  ('hobart-william-smith-colleges', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Hobart William Smith Colleges''s admissions pages.', null),
  ('hobart-william-smith-colleges', 'room_board'::public.university_fact_kind, '$17,768 / year (Scorecard 2023)', 17768, 'USD', 'us-scorecard-hobart-william-smith-colleges', null, null, 'year'),
  ('hobart-william-smith-colleges', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Hobart William Smith Colleges''s financial-aid pages.', null),
  ('hobart-william-smith-colleges', 'total_cost_of_attendance'::public.university_fact_kind, '$82,602 / year (Scorecard 2023)', 82602, 'USD', 'us-scorecard-hobart-william-smith-colleges', null, null, 'year'),
  ('hobart-william-smith-colleges', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Hobart William Smith Colleges''s international admissions / financial-aid pages.', null),
  ('hobart-william-smith-colleges', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 610–700; math 580–685 (Scorecard 2023); Middle-50% ACT 28–32 (Scorecard 2023)', null, null, 'us-scorecard-hobart-william-smith-colleges', null, null, null),
  ('hobart-william-smith-colleges', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Hobart William Smith Colleges''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('hobart-william-smith-colleges', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Hobart William Smith Colleges''s admissions pages.'),
  ('hobart-william-smith-colleges', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Hobart William Smith Colleges''s admissions pages.'),
  ('hobart-william-smith-colleges', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Hobart William Smith Colleges''s admissions pages.'),
  ('hobart-william-smith-colleges', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 610–700; math 580–685 (Scorecard 2023)', null, 'us-scorecard-hobart-william-smith-colleges', null, null),
  ('hobart-william-smith-colleges', 'act'::public.requirement_kind, 'Middle-50% ACT 28–32 (Scorecard 2023)', null, 'us-scorecard-hobart-william-smith-colleges', null, null),
  ('hobart-william-smith-colleges', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Hobart William Smith Colleges''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #197: Whitworth University-Adult Degree Programs (UNITID 475200)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-whitworth-university-adult-degree-programs', 'College Scorecard — Whitworth University-Adult Degree Programs', 'https://collegescorecard.ed.gov/school/?475200-whitworth_university_adult_degree_programs', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('whitworth-university-adult-degree-programs', 'Whitworth University-Adult Degree Programs', 'Spokane, Washington', 'United States', '🇺🇸', 'Private four-year institution in Spokane, Washington.',
  'Whitworth University-Adult Degree Programs. College Scorecard (2023) reports out-of-state tuition $13,560 / year and a middle-50% SAT range not reported.', 'whitworth-university-adult-degree-programs', array[]::text[], 'us-scorecard-whitworth-university-adult-degree-programs', 197, 'us-4prep-ranking-scorecard-2023', 475200)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('whitworth-university-adult-degree-programs', 'tuition'::public.university_fact_kind, '$13,560 / year (Scorecard 2023)', 13560, 'USD', 'us-scorecard-whitworth-university-adult-degree-programs', null, null, 'year'),
  ('whitworth-university-adult-degree-programs', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Whitworth University-Adult Degree Programs''s admissions / financial-aid pages.', null),
  ('whitworth-university-adult-degree-programs', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Whitworth University-Adult Degree Programs''s admissions pages.', null),
  ('whitworth-university-adult-degree-programs', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Whitworth University-Adult Degree Programs''s admissions pages.', null),
  ('whitworth-university-adult-degree-programs', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Whitworth University-Adult Degree Programs''s financial-aid pages.', null),
  ('whitworth-university-adult-degree-programs', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Whitworth University-Adult Degree Programs''s admissions pages.', null),
  ('whitworth-university-adult-degree-programs', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Whitworth University-Adult Degree Programs''s admissions pages.', null),
  ('whitworth-university-adult-degree-programs', 'room_board'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report on-campus room and board.', 'Check Whitworth University-Adult Degree Programs''s financial-aid pages.', null),
  ('whitworth-university-adult-degree-programs', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Whitworth University-Adult Degree Programs''s financial-aid pages.', null),
  ('whitworth-university-adult-degree-programs', 'total_cost_of_attendance'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report academic-year cost of attendance.', 'Check Whitworth University-Adult Degree Programs''s financial-aid pages.', null),
  ('whitworth-university-adult-degree-programs', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Whitworth University-Adult Degree Programs''s international admissions / financial-aid pages.', null),
  ('whitworth-university-adult-degree-programs', 'test_policy'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a middle-50% SAT or ACT range.', 'Check Whitworth University-Adult Degree Programs''s admissions pages.', null),
  ('whitworth-university-adult-degree-programs', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Whitworth University-Adult Degree Programs''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('whitworth-university-adult-degree-programs', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Whitworth University-Adult Degree Programs''s admissions pages.'),
  ('whitworth-university-adult-degree-programs', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Whitworth University-Adult Degree Programs''s admissions pages.'),
  ('whitworth-university-adult-degree-programs', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Whitworth University-Adult Degree Programs''s admissions pages.'),
  ('whitworth-university-adult-degree-programs', 'sat'::public.requirement_kind, null, null, null, 'College Scorecard does not report an SAT midpoint or range.', 'Check Whitworth University-Adult Degree Programs''s admissions pages.'),
  ('whitworth-university-adult-degree-programs', 'act'::public.requirement_kind, null, null, null, 'College Scorecard does not report an ACT range.', 'Check Whitworth University-Adult Degree Programs''s admissions pages.'),
  ('whitworth-university-adult-degree-programs', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Whitworth University-Adult Degree Programs''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #198: Lake Forest College (UNITID 146481)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-lake-forest-college', 'College Scorecard — Lake Forest College', 'https://collegescorecard.ed.gov/school/?146481-lake_forest_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('lake-forest-college', 'Lake Forest College', 'Lake Forest, Illinois', 'United States', '🇺🇸', 'Private four-year institution in Lake Forest, Illinois.',
  'Lake Forest College. College Scorecard (2023) reports out-of-state tuition $56,402 / year and a middle-50% SAT range Middle-50% SAT critical reading 600–713; math 590–680 (Scorecard 2023).', 'lake-forest-college', array[]::text[], 'us-scorecard-lake-forest-college', 198, 'us-4prep-ranking-scorecard-2023', 146481)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('lake-forest-college', 'tuition'::public.university_fact_kind, '$56,402 / year (Scorecard 2023)', 56402, 'USD', 'us-scorecard-lake-forest-college', null, null, 'year'),
  ('lake-forest-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Lake Forest College''s admissions / financial-aid pages.', null),
  ('lake-forest-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Lake Forest College''s admissions pages.', null),
  ('lake-forest-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Lake Forest College''s admissions pages.', null),
  ('lake-forest-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Lake Forest College''s financial-aid pages.', null),
  ('lake-forest-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Lake Forest College''s admissions pages.', null),
  ('lake-forest-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Lake Forest College''s admissions pages.', null),
  ('lake-forest-college', 'room_board'::public.university_fact_kind, '$12,700 / year (Scorecard 2023)', 12700, 'USD', 'us-scorecard-lake-forest-college', null, null, 'year'),
  ('lake-forest-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Lake Forest College''s financial-aid pages.', null),
  ('lake-forest-college', 'total_cost_of_attendance'::public.university_fact_kind, '$70,655 / year (Scorecard 2023)', 70655, 'USD', 'us-scorecard-lake-forest-college', null, null, 'year'),
  ('lake-forest-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Lake Forest College''s international admissions / financial-aid pages.', null),
  ('lake-forest-college', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 600–713; math 590–680 (Scorecard 2023); Middle-50% ACT 28–32 (Scorecard 2023)', null, null, 'us-scorecard-lake-forest-college', null, null, null),
  ('lake-forest-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Lake Forest College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('lake-forest-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Lake Forest College''s admissions pages.'),
  ('lake-forest-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Lake Forest College''s admissions pages.'),
  ('lake-forest-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Lake Forest College''s admissions pages.'),
  ('lake-forest-college', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 600–713; math 590–680 (Scorecard 2023)', null, 'us-scorecard-lake-forest-college', null, null),
  ('lake-forest-college', 'act'::public.requirement_kind, 'Middle-50% ACT 28–32 (Scorecard 2023)', null, 'us-scorecard-lake-forest-college', null, null),
  ('lake-forest-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Lake Forest College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #199: Gustavus Adolphus College (UNITID 173647)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-gustavus-adolphus-college', 'College Scorecard — Gustavus Adolphus College', 'https://collegescorecard.ed.gov/school/?173647-gustavus_adolphus_college', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('gustavus-adolphus-college', 'Gustavus Adolphus College', 'Saint Peter, Minnesota', 'United States', '🇺🇸', 'Private four-year institution in Saint Peter, Minnesota.',
  'Gustavus Adolphus College. College Scorecard (2023) reports out-of-state tuition $56,076 / year and a middle-50% SAT range not reported.', 'gustavus-adolphus-college', array[]::text[], 'us-scorecard-gustavus-adolphus-college', 199, 'us-4prep-ranking-scorecard-2023', 173647)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('gustavus-adolphus-college', 'tuition'::public.university_fact_kind, '$56,076 / year (Scorecard 2023)', 56076, 'USD', 'us-scorecard-gustavus-adolphus-college', null, null, 'year'),
  ('gustavus-adolphus-college', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check Gustavus Adolphus College''s admissions / financial-aid pages.', null),
  ('gustavus-adolphus-college', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check Gustavus Adolphus College''s admissions pages.', null),
  ('gustavus-adolphus-college', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check Gustavus Adolphus College''s admissions pages.', null),
  ('gustavus-adolphus-college', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check Gustavus Adolphus College''s financial-aid pages.', null),
  ('gustavus-adolphus-college', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check Gustavus Adolphus College''s admissions pages.', null),
  ('gustavus-adolphus-college', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check Gustavus Adolphus College''s admissions pages.', null),
  ('gustavus-adolphus-college', 'room_board'::public.university_fact_kind, '$11,804 / year (Scorecard 2023)', 11804, 'USD', 'us-scorecard-gustavus-adolphus-college', null, null, 'year'),
  ('gustavus-adolphus-college', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check Gustavus Adolphus College''s financial-aid pages.', null),
  ('gustavus-adolphus-college', 'total_cost_of_attendance'::public.university_fact_kind, '$67,613 / year (Scorecard 2023)', 67613, 'USD', 'us-scorecard-gustavus-adolphus-college', null, null, 'year'),
  ('gustavus-adolphus-college', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check Gustavus Adolphus College''s international admissions / financial-aid pages.', null),
  ('gustavus-adolphus-college', 'test_policy'::public.university_fact_kind, 'Middle-50% ACT 24–30 (Scorecard 2023)', null, null, 'us-scorecard-gustavus-adolphus-college', null, null, null),
  ('gustavus-adolphus-college', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask Gustavus Adolphus College''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('gustavus-adolphus-college', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check Gustavus Adolphus College''s admissions pages.'),
  ('gustavus-adolphus-college', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check Gustavus Adolphus College''s admissions pages.'),
  ('gustavus-adolphus-college', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check Gustavus Adolphus College''s admissions pages.'),
  ('gustavus-adolphus-college', 'sat'::public.requirement_kind, 'SAT average 1290 (Scorecard 2023)', null, 'us-scorecard-gustavus-adolphus-college', null, null),
  ('gustavus-adolphus-college', 'act'::public.requirement_kind, 'Middle-50% ACT 24–30 (Scorecard 2023)', null, 'us-scorecard-gustavus-adolphus-college', null, null),
  ('gustavus-adolphus-college', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check Gustavus Adolphus College''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- #200: University of Vermont (UNITID 231174)
insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-scorecard-university-of-vermont', 'College Scorecard — University of Vermont', 'https://collegescorecard.ed.gov/school/?231174-university_of_vermont', '2026-09-04', 'verified')
on conflict (id) do nothing;
insert into public.universities (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id, rank, rank_source_id, unitid) values
  ('university-of-vermont', 'University of Vermont', 'Burlington, Vermont', 'United States', '🇺🇸', 'Public four-year institution in Burlington, Vermont.',
  'University of Vermont. College Scorecard (2023) reports out-of-state tuition $45,502 / year and a middle-50% SAT range Middle-50% SAT critical reading 660–730; math 630–710 (Scorecard 2023).', 'university-of-vermont', array[]::text[], 'us-scorecard-university-of-vermont', 200, 'us-4prep-ranking-scorecard-2023', 231174)
on conflict (id) do nothing;
insert into public.university_facts (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action, amount_period) values
  ('university-of-vermont', 'tuition'::public.university_fact_kind, '$45,502 / year (Scorecard 2023)', 45502, 'USD', 'us-scorecard-university-of-vermont', null, null, 'year'),
  ('university-of-vermont', 'living_cost'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate living-cost amount for this import.', 'Check University of Vermont''s admissions / financial-aid pages.', null),
  ('university-of-vermont', 'application_fee'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application fee.', 'Check University of Vermont''s admissions pages.', null),
  ('university-of-vermont', 'deadline'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report the application deadline.', 'Check University of Vermont''s admissions pages.', null),
  ('university-of-vermont', 'scholarship'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report scholarship terms for this import.', 'Check University of Vermont''s financial-aid pages.', null),
  ('university-of-vermont', 'language'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report English-language requirements.', 'Check University of Vermont''s admissions pages.', null),
  ('university-of-vermont', 'intake'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report admission intakes.', 'Check University of Vermont''s admissions pages.', null),
  ('university-of-vermont', 'room_board'::public.university_fact_kind, '$13,776 / year (Scorecard 2023)', 13776, 'USD', 'us-scorecard-university-of-vermont', null, null, 'year'),
  ('university-of-vermont', 'fees'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report a separate fees amount for this import.', 'Check University of Vermont''s financial-aid pages.', null),
  ('university-of-vermont', 'total_cost_of_attendance'::public.university_fact_kind, '$35,649 / year (Scorecard 2023)', 35649, 'USD', 'us-scorecard-university-of-vermont', null, null, 'year'),
  ('university-of-vermont', 'aid_international'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report international-student aid policy.', 'Check University of Vermont''s international admissions / financial-aid pages.', null),
  ('university-of-vermont', 'test_policy'::public.university_fact_kind, 'Middle-50% SAT critical reading 660–730; math 630–710 (Scorecard 2023); Middle-50% ACT 30–32 (Scorecard 2023)', null, null, 'us-scorecard-university-of-vermont', null, null, null),
  ('university-of-vermont', 'financial_certification'::public.university_fact_kind, null, null, null, null, 'College Scorecard does not report an I-20 proof-of-funds amount.', 'Ask University of Vermont''s international office for the amount after aid.', null)
on conflict (university_id, kind) do nothing;
insert into public.requirements (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action) values
  ('university-of-vermont', 'ielts'::public.requirement_kind, null, null, null, 'College Scorecard does not report an IELTS requirement.', 'Check University of Vermont''s admissions pages.'),
  ('university-of-vermont', 'toefl'::public.requirement_kind, null, null, null, 'College Scorecard does not report a TOEFL requirement.', 'Check University of Vermont''s admissions pages.'),
  ('university-of-vermont', 'duolingo'::public.requirement_kind, null, null, null, 'College Scorecard does not report a Duolingo requirement.', 'Check University of Vermont''s admissions pages.'),
  ('university-of-vermont', 'sat'::public.requirement_kind, 'Middle-50% SAT critical reading 660–730; math 630–710 (Scorecard 2023)', null, 'us-scorecard-university-of-vermont', null, null),
  ('university-of-vermont', 'act'::public.requirement_kind, 'Middle-50% ACT 30–32 (Scorecard 2023)', null, 'us-scorecard-university-of-vermont', null, null),
  ('university-of-vermont', 'gpa'::public.requirement_kind, null, null, null, 'College Scorecard does not report a GPA requirement.', 'Check University of Vermont''s admissions pages.')
on conflict (university_id, kind) do nothing;
-- The only write to the 18 existing four-year catalogue rows: rank provenance and UNITID.
update public.universities as university
set rank = ranked.rank,
    rank_source_id = case when ranked.rank is null then null else 'us-4prep-ranking-scorecard-2023' end,
    unitid = ranked.unitid
from (values
  ('alabama', 100751, null),
  ('berea', 156295, null),
  ('brown', 217156, 11),
  ('clark', 165334, 164),
  ('columbia', 190150, 7),
  ('cornell', 190415, 13),
  ('duke', 198419, 10),
  ('harvard', 166027, 6),
  ('illinois-wesleyan', 145646, 157),
  ('jhu', 162928, 22),
  ('mit', 166683, 1),
  ('northwestern', 147767, 23),
  ('princeton', 186131, 2),
  ('stanford', 243744, 8),
  ('unk', 181215, null),
  ('upenn', 215062, 5),
  ('usm', 176372, null),
  ('yale', 130794, 9)
) as ranked(id, unitid, rank)
where university.id = ranked.id
  and university.id in ('alabama', 'berea', 'brown', 'clark', 'columbia', 'cornell', 'duke', 'harvard', 'illinois-wesleyan', 'jhu', 'mit', 'northwestern', 'princeton', 'stanford', 'unk', 'upenn', 'usm', 'yale');

-- Required because this materialized view has no insert trigger.
refresh materialized view public.university_search_index;

commit;
