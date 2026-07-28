begin;

-- The old catalogue is intentionally replaced in full. A non-zero saved-plan
-- count would make that destructive to current users, so fail closed if the
-- live precondition changes between verification and execution.
do $$
begin
  if (select count(*) from public.saved_plans) <> 0 then
    raise exception 'US catalogue replacement aborted: saved_plans is not empty';
  end if;
end
$$;

-- A profile score now carries its test scale. This removes the IELTS-only
-- assumption while preserving the existing private-table RLS policies.
alter table public.student_profiles
  add column language_test text;

alter table public.student_profiles
  drop constraint student_profile_language_score_bounds;

alter table public.student_profiles
  add constraint student_profile_language_test
  check (
    (language_score is null and language_test is null)
    or
    (language_test = 'ielts' and language_score between 0 and 9)
    or
    (language_test = 'toefl' and language_score between 0 and 120)
    or
    (language_test = 'duolingo' and language_score between 0 and 160)
  );

delete from public.universities;
delete from public.scholarships;

delete from public.sources s
where not exists (select 1 from public.universities u where u.source_id = s.id)
  and not exists (select 1 from public.university_facts f where f.source_id = s.id)
  and not exists (select 1 from public.programs p where p.source_id = s.id)
  and not exists (select 1 from public.program_facts f where f.source_id = s.id)
  and not exists (select 1 from public.requirements r where r.source_id = s.id)
  and not exists (
    select 1
    from public.scholarships sc
    where sc.source_id = s.id or sc.amount_source_id = s.id
  )
  and not exists (select 1 from public.university_scholarships us where us.source_id = s.id);

insert into public.sources (id, name, url, retrieved_at, verification) values
  ('us-harvard-cost', 'Harvard College - How Aid Works', 'https://college.harvard.edu/financial-aid/how-aid-works', '2026-07-28', 'verified'),
  ('us-harvard-international', 'Harvard College - International Applicants', 'https://college.harvard.edu/admissions/apply/international-applicants', '2026-07-28', 'verified'),
  ('us-harvard-first-year', 'Harvard College - First-Year Applicants', 'https://college.harvard.edu/admissions/apply/first-year-applicants', '2026-07-28', 'verified'),
  ('us-harvard-requirements', 'Harvard College - Application Requirements', 'https://college.harvard.edu/admissions/apply/application-requirements', '2026-07-28', 'verified'),
  ('us-harvard-cs', 'Harvard SEAS - Bachelor''s Degree in Computer Science', 'https://seas.harvard.edu/computer-science/bachelors-degree-computer-science', '2026-07-28', 'verified'),

  ('us-yale-cost', 'Yale Financial Aid - Cost of Attendance', 'https://finaid.yale.edu/coa', '2026-07-28', 'verified'),
  ('us-yale-international', 'Yale Undergraduate Admissions - International Students', 'https://admissions.yale.edu/international', '2026-07-28', 'verified'),
  ('us-yale-testing', 'Yale Undergraduate Admissions - Standardized Testing', 'https://admissions.yale.edu/standardized-testing', '2026-07-28', 'verified'),
  ('us-yale-apply', 'Yale Undergraduate Admissions - Apply', 'https://admissions.yale.edu/apply', '2026-07-28', 'verified'),
  ('us-yale-cs', 'Yale College Programs of Study - Computer Science', 'https://catalog.yale.edu/ycps/subjects-of-instruction/computer-science/', '2026-07-28', 'verified'),

  ('us-princeton-cost', 'Princeton Admission - Fees and Payment Options', 'https://admission.princeton.edu/cost-aid/fees-payment-options', '2026-07-28', 'verified'),
  ('us-princeton-international', 'Princeton Admission - International Students', 'https://admission.princeton.edu/apply/international-students', '2026-07-28', 'verified'),
  ('us-princeton-testing', 'Princeton Admission - Standardized Testing', 'https://admission.princeton.edu/apply/standardized-testing', '2026-07-28', 'verified'),
  ('us-princeton-counselors', 'Princeton Admission - For Counselors', 'https://admission.princeton.edu/apply/counselors', '2026-07-28', 'verified'),
  ('us-princeton-questbridge', 'Princeton Admission - QuestBridge', 'https://admission.princeton.edu/apply/questbridge', '2026-07-28', 'verified'),
  ('us-princeton-cs', 'Princeton Computer Science - Undergraduate Degrees and Requirements', 'https://www.cs.princeton.edu/ugrad/undergraduate-degrees-requirements', '2026-07-28', 'verified'),

  ('us-berea-cost', 'Berea College - Cost of Attendance 2026-2027', 'https://www.berea.edu/student-financial-aid/berea-college-cost-of-attendance-for-2026-2027-fall-spring', '2026-07-28', 'verified'),
  ('us-berea-aid', 'Berea College - Costs and Financial Aid for International Students', 'https://www.berea.edu/costs-and-financial-aid-for-international-students', '2026-07-28', 'verified'),
  ('us-berea-faq', 'Berea College - International Applicant FAQs', 'https://www.berea.edu/admissions/admission-information/apply/checklist-items/international-faqs', '2026-07-28', 'verified'),
  ('us-berea-cs', 'Berea College - Computer Science', 'https://www.berea.edu/academics/departments-programs/computer-science', '2026-07-28', 'verified'),

  ('us-iwu-tuition', 'Illinois Wesleyan - Tuition and Fees', 'https://www.iwu.edu/business-office/student-accounts/tuition.html', '2026-07-28', 'verified'),
  ('us-iwu-aid', 'Illinois Wesleyan - International Scholarships', 'https://www.iwu.edu/international/scholarships.html', '2026-07-28', 'verified'),
  ('us-iwu-admission', 'Illinois Wesleyan - International Admission', 'https://www.iwu.edu/international/admission.html', '2026-07-28', 'verified'),
  ('us-iwu-majors', 'Illinois Wesleyan - Majors, Minors and Programs', 'https://www.iwu.edu/majors/', '2026-07-28', 'verified'),

  ('us-clark-cost', 'Clark University - Undergraduate Cost and Financial Aid', 'https://www.clarku.edu/undergraduate-admissions/cost-and-financial-aid/', '2026-07-28', 'verified'),
  ('us-clark-international', 'Clark University - International Applicants', 'https://www.clarku.edu/undergraduate-admissions/apply/international-students/', '2026-07-28', 'verified'),
  ('us-clark-process', 'Clark University - Undergraduate Application Process', 'https://www.clarku.edu/undergraduate-admissions/apply/process/', '2026-07-28', 'verified'),
  ('us-clark-cs', 'Clark University - Computer Science BA', 'https://www.clarku.edu/programs/major/computer-science-ba/', '2026-07-28', 'verified'),

  ('us-usm-coa', 'Southern Miss - 2026-2027 Cost of Attendance', 'https://www.usm.edu/financial-aid/cost-of-attendance-future-year.php', '2026-07-28', 'verified'),
  ('us-usm-i20', 'Southern Miss ISSS - Costs and Financial Aid', 'https://www.usm.edu/isss/costsfinancial-aid.php', '2026-07-28', 'verified'),
  ('us-usm-admission', 'Southern Miss - International Undergraduate Admission', 'https://www.usm.edu/undergraduate-admissions/international-admissions/', '2026-07-28', 'verified'),
  ('us-usm-scholarship', 'Southern Miss - Freshman Admission and Scholarships', 'https://www.usm.edu/undergraduate-admissions/freshmen.php', '2026-07-28', 'verified'),
  ('us-usm-cs', 'Southern Miss - Computer Science BS', 'https://www.usm.edu/undergraduate-programs/computer-science.php', '2026-07-28', 'verified'),

  ('us-ua-expenses', 'University of Alabama ISSS - New Student Expenses', 'https://international.ua.edu/isss/future-new-students/expenses/', '2026-07-28', 'verified'),
  ('us-ua-admission', 'University of Alabama - International Freshman Admission', 'https://admissions.ua.edu/international/freshman/', '2026-07-28', 'verified'),
  ('us-ua-english', 'University of Alabama - English Language Proficiency', 'https://admissions.ua.edu/international/english-language-proficiency/', '2026-07-28', 'verified'),
  ('us-ua-apply', 'University of Alabama - Apply', 'https://admissions.ua.edu/apply/', '2026-07-28', 'verified'),
  ('us-ua-scholarship', 'University of Alabama - International Freshman Scholarships', 'https://afford.ua.edu/scholarships/international/', '2026-07-28', 'verified'),
  ('us-ua-cs', 'University of Alabama Catalog - Computer Science BS', 'https://catalog.ua.edu/undergraduate/engineering/computer-science/bs/', '2026-07-28', 'verified'),

  ('us-unk-cost', 'UNK Global - International Costs', 'https://www.unk.edu/international/international-admissions/costs.php', '2026-07-28', 'verified'),
  ('us-unk-scholarship', 'UNK Global - International Student Scholarships', 'https://www.unk.edu/international/international-admissions/scholarship-opportunities.php', '2026-07-28', 'verified'),
  ('us-unk-deadlines', 'UNK Global - Admissions and Deadlines', 'https://www.unk.edu/international/international-admissions/index.php', '2026-07-28', 'verified'),
  ('us-unk-english', 'UNK Global - English Proficiency Requirements', 'https://www.unk.edu/international/international-admissions/admission-requirements.php', '2026-07-28', 'verified'),
  ('us-unk-documents', 'UNK Global - Application Requirements, Documents and Fees', 'https://www.unk.edu/international/international-admissions/application-documents-and-fees.php', '2026-07-28', 'verified'),
  ('us-unk-cs', 'UNK - Computer Science Comprehensive BS', 'https://www.unk.edu/academics/csit/programs/computer-science-comprehensive.php', '2026-07-28', 'verified'),

  ('us-hcc-tuition', 'Houston City College - Tuition and Cost', 'https://www.hccs.edu/paying-for-college/tuition--cost/', '2026-07-28', 'verified'),
  ('us-hcc-faq', 'Houston City College - International Student FAQs', 'https://www.hccs.edu/student-life--services/international-student-services/frequently-asked-questions/', '2026-07-28', 'verified'),
  ('us-hcc-financial', 'Houston City College - Financial Requirements for International Students', 'https://www.hccs.edu/student-life--services/international-student-services/financial-requirements-for-international-students/', '2026-07-28', 'verified'),
  ('us-hcc-admission', 'Houston City College - First-Time F-1 Student', 'https://www.hccs.edu/admissions/apply--enroll/international-student-application/first-time-f-1-student/', '2026-07-28', 'verified'),
  ('us-hcc-cs', 'Houston City College - Computer Science AS', 'https://www.hccs.edu/programs--courses/explore-all-programs/computer-science/', '2026-07-28', 'verified');

insert into public.universities (
  id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id
) values
  ('harvard', 'Harvard University', 'Cambridge, Massachusetts', 'United States', 'US', 'Need-blind admission and full demonstrated need for international applicants.', 'Harvard College applies the same need-based aid policy regardless of citizenship and requires the SAT or ACT, with limited alternatives when those tests are inaccessible.', 'harvard-yard', array['Need-blind for internationals', 'Meets 100% demonstrated need', 'SAT or ACT required'], 'us-harvard-international'),
  ('yale', 'Yale University', 'New Haven, Connecticut', 'United States', 'US', 'Need-blind admission with full-need aid for international students.', 'Yale evaluates international applicants under its need-blind policy and makes need-based aid available on the same basis as for domestic applicants.', 'yale-old-campus', array['Need-blind for internationals', 'Meets 100% demonstrated need', 'SAT or ACT required'], 'us-yale-international'),
  ('princeton', 'Princeton University', 'Princeton, New Jersey', 'United States', 'US', 'Need-blind international admission backed by grant-only full-need aid.', 'Princeton states that admission is need-blind and that the full demonstrated need of admitted international students is met under the same policy used for U.S. students.', 'princeton-nassau', array['Need-blind for internationals', 'Meets full demonstrated need', 'Grant aid without required loans'], 'us-princeton-international'),
  ('berea', 'Berea College', 'Berea, Kentucky', 'United States', 'US', 'A no-tuition model with published funding for every enrolled international student.', 'Berea publishes 100% funding for 100% of enrolled international students, offsetting tuition, housing, food and fees through institutional aid and work.', 'berea-college', array['100% international-student funding', 'No-Tuition Promise', 'Paid campus work'], 'us-berea-aid'),
  ('illinois-wesleyan', 'Illinois Wesleyan University', 'Bloomington, Illinois', 'United States', 'US', 'Automatic international merit consideration with awards up to $38,000 per year.', 'Illinois Wesleyan automatically considers international applicants for renewable merit scholarships and publishes English-test minimums and a no-fee application.', 'illinois-wesleyan', array['Up to $38,000/year merit aid', 'Automatic scholarship consideration', 'No application fee'], 'us-iwu-aid'),
  ('clark', 'Clark University', 'Worcester, Massachusetts', 'United States', 'US', 'International merit options include a full tuition, housing and meals award.', 'Clark publishes a Presidential Scholarship covering full tuition plus on-campus housing and meals, alongside a test-optional international application.', 'clark-university', array['Presidential full award', 'Test optional', 'No application fee'], 'us-clark-cost'),
  ('usm', 'University of Southern Mississippi', 'Hattiesburg, Mississippi', 'United States', 'US', 'Moderate nonresident tuition with a published international I-20 budget and merit grid.', 'Southern Miss publishes an out-of-state cost of attendance, international financial-support minimum and automatic academic scholarship tiers that use GPA and SAT or ACT.', 'southern-miss', array['Moderate nonresident tuition', 'Published merit grid', 'Published I-20 minimum'], 'us-usm-admission'),
  ('alabama', 'University of Alabama', 'Tuscaloosa, Alabama', 'United States', 'US', 'Published international merit awards up to $28,000 per year on the main award grid.', 'The University of Alabama publishes a current international funding budget, English minimums and automatic merit thresholds for international freshmen.', 'university-alabama', array['Up to $28,000/year merit aid', 'Published I-20 budget', 'Automatic merit consideration'], 'us-ua-admission'),
  ('unk', 'University of Nebraska at Kearney', 'Kearney, Nebraska', 'United States', 'US', 'Every admitted on-campus international undergraduate is eligible for a $4,797 tuition discount.', 'UNK publishes a 2026-27 international budget with and without the International Loper Scholarship and states the award is available to all degree-seeking international undergraduates on campus.', 'unk-campus', array['Automatic $4,797/year award', 'Published aided annual budget', 'Fall, spring and summer entry'], 'us-unk-scholarship'),
  ('hcc', 'Houston City College', 'Houston, Texas', 'United States', 'US', 'A two-year Computer Science transfer route with tuition and I-20 costs published for F-1 students.', 'Houston City College offers a 60-credit Computer Science Associate of Science designed for transfer to a four-year university and publishes F-1 tuition, living and funding requirements.', 'hcc-houston', array['Two-year university-transfer degree', '$7,980 I-20 tuition/fees example', 'Fall, spring and summer entry'], 'us-hcc-cs');

insert into public.university_facts (
  university_id, kind, value, numeric_value, currency, source_id,
  unknown_reason, suggested_action, amount_period
)
select
  v.university_id,
  v.kind::public.university_fact_kind,
  v.value,
  v.numeric_value,
  v.currency,
  v.source_id,
  v.unknown_reason,
  v.suggested_action,
  v.amount_period
from (values
  -- Harvard University
  ('harvard', 'tuition', '$62,226 / year (2026-27)', 62226::numeric, 'USD', 'us-harvard-cost', null, null, 'year'),
  ('harvard', 'fees', '$6,216 / year (2026-27)', 6216::numeric, 'USD', 'us-harvard-cost', null, null, 'year'),
  ('harvard', 'room_board', '$14,250 housing + $8,942 food / year (2026-27)', null, 'USD', 'us-harvard-cost', null, null, 'year'),
  ('harvard', 'total_cost_of_attendance', '$95,134-$100,134 / year before health insurance (2026-27)', null, 'USD', 'us-harvard-cost', null, null, 'year'),
  ('harvard', 'application_fee', '$90 one time; fee waiver available', 90, 'USD', 'us-harvard-first-year', null, null, 'one_time'),
  ('harvard', 'deadline', 'Regular Decision: January 1', null, null, 'us-harvard-requirements', null, null, null),
  ('harvard', 'aid_international', 'Need-blind; international students receive the same need-based aid and Harvard meets 100% of demonstrated need', null, null, 'us-harvard-international', null, null, null),
  ('harvard', 'test_policy', 'SAT or ACT required; approved alternatives only when those tests are not accessible', null, null, 'us-harvard-first-year', null, null, null),
  ('harvard', 'financial_certification', null, null, null, null, 'Harvard does not publish a single undergraduate I-20 financial-certification amount on the retrieved admissions or cost pages.', 'Ask Harvard International Office for the current amount required after institutional aid.', null),
  ('harvard', 'intake', 'Fall first-year entry; Regular Decision deadline January 1', null, null, 'us-harvard-requirements', null, null, null),
  ('harvard', 'language', 'English; Harvard states that knowledge of English is necessary for successful study', null, null, 'us-harvard-international', null, null, null),

  -- Yale University
  ('yale', 'tuition', '$72,500 / year (2026-27)', 72500, 'USD', 'us-yale-cost', null, null, 'year'),
  ('yale', 'fees', '$185 student activity fee / year (2026-27)', 185, 'USD', 'us-yale-cost', null, null, 'year'),
  ('yale', 'room_board', '$12,080 housing + $9,520 food / year (2026-27)', null, 'USD', 'us-yale-cost', null, null, 'year'),
  ('yale', 'total_cost_of_attendance', null, null, null, null, 'The retrieved 2026-27 Yale budget lists components but does not publish one total cost-of-attendance figure.', 'Use Yale''s current cost estimator or ask Financial Aid for the official total.', null),
  ('yale', 'application_fee', null, null, null, null, 'The current retrieved first-year application page does not state the application-fee amount.', 'Confirm the current fee in Yale''s application platform before submission.', null),
  ('yale', 'deadline', 'Regular Decision: January 2', null, null, 'us-yale-apply', null, null, null),
  ('yale', 'aid_international', 'Need-blind; Yale meets 100% of demonstrated financial need for admitted international students', null, null, 'us-yale-international', null, null, null),
  ('yale', 'test_policy', 'SAT or ACT required for first-year applicants', null, null, 'us-yale-testing', null, null, null),
  ('yale', 'financial_certification', null, null, null, null, 'Yale does not publish a single undergraduate I-20 financial-certification amount on the retrieved pages.', 'Ask Yale''s Office of International Students and Scholars for the post-aid amount required.', null),
  ('yale', 'intake', 'Fall first-year entry; Regular Decision deadline January 2', null, null, 'us-yale-apply', null, null, null),
  ('yale', 'language', 'English; an English-proficiency test is required when English is not the native language and schooling has not been in English', null, null, 'us-yale-international', null, null, null),

  -- Princeton University
  ('princeton', 'tuition', '$68,140 / year (2026-27)', 68140, 'USD', 'us-princeton-cost', null, null, 'year'),
  ('princeton', 'fees', '$314 / year (2026-27)', 314, 'USD', 'us-princeton-cost', null, null, 'year'),
  ('princeton', 'room_board', '$13,010 housing + $9,110 food / year (2026-27)', null, 'USD', 'us-princeton-cost', null, null, 'year'),
  ('princeton', 'total_cost_of_attendance', '$94,624 / year (2026-27)', 94624, 'USD', 'us-princeton-cost', null, null, 'year'),
  ('princeton', 'application_fee', '$75 one time; fee waiver available', 75, 'USD', 'us-princeton-counselors', null, null, 'one_time'),
  ('princeton', 'deadline', 'Regular Decision: January 1', null, null, 'us-princeton-questbridge', null, null, null),
  ('princeton', 'aid_international', 'Need-blind; full demonstrated need is met for admitted international students under the same policy as U.S. students', null, null, 'us-princeton-international', null, null, null),
  ('princeton', 'test_policy', 'Test optional for fall 2027 entry; SAT or ACT required beginning with fall 2028 entry', null, null, 'us-princeton-testing', null, null, null),
  ('princeton', 'financial_certification', null, null, null, null, 'Princeton does not publish a single undergraduate I-20 financial-certification amount on the retrieved pages.', 'Ask the Davis International Center for the amount required after Princeton grant aid.', null),
  ('princeton', 'intake', 'Fall 2027 first-year entry; Regular Decision deadline January 1', null, null, 'us-princeton-testing', null, null, null),
  ('princeton', 'language', 'English; TOEFL, IELTS Academic or Duolingo is required when English is not native and school instruction is not in English', null, null, 'us-princeton-testing', null, null, null),

  -- Berea College
  ('berea', 'tuition', '$56,900 published tuition; enrolled students pay $0 tuition under the No-Tuition Promise (2026-27)', 56900, 'USD', 'us-berea-cost', null, null, 'year'),
  ('berea', 'fees', null, null, null, null, 'The retrieved 2026-27 cost page does not itemize mandatory student fees separately.', 'Ask Berea Student Financial Aid for the current mandatory-fee schedule.', null),
  ('berea', 'room_board', '$5,000 housing + $4,142 food / year (2026-27)', null, 'USD', 'us-berea-cost', null, null, 'year'),
  ('berea', 'total_cost_of_attendance', '$69,942 / year before institutional funding (2026-27)', 69942, 'USD', 'us-berea-cost', null, null, 'year'),
  ('berea', 'application_fee', '$0; Berea does not charge an international application fee', 0, 'USD', 'us-berea-faq', null, null, 'one_time'),
  ('berea', 'deadline', null, null, null, null, 'Berea''s retrieved international FAQ says the next application opens in August 2026 but does not publish the next deadline.', 'Check the international application after it reopens in August 2026.', null),
  ('berea', 'aid_international', '100% funding to 100% of enrolled international students, offsetting tuition, housing, food and fees', null, null, 'us-berea-aid', null, null, null),
  ('berea', 'test_policy', 'One qualifying IELTS, TOEFL, Duolingo, SAT or ACT score is required; Berea is not test optional', null, null, 'us-berea-faq', null, null, null),
  ('berea', 'financial_certification', null, null, null, null, 'Berea does not publish one I-20 financial-certification amount on the retrieved international aid or FAQ pages.', 'Ask Berea International Student and Scholar Services for the current proof-of-funds amount after aid.', null),
  ('berea', 'intake', null, null, null, null, 'The retrieved international FAQ does not state which term the next application will admit.', 'Confirm the next available entry term when the international application reopens.', null),
  ('berea', 'language', 'English; international applicants must submit a qualifying English or admission test score', null, null, 'us-berea-faq', null, null, null),

  -- Illinois Wesleyan University
  ('illinois-wesleyan', 'tuition', '$61,004 / year (2026-27)', 61004, 'USD', 'us-iwu-tuition', null, null, 'year'),
  ('illinois-wesleyan', 'fees', '$204 student fee + $30 residence-hall activity fee + $1,911 international health insurance / year (2026-27)', null, 'USD', 'us-iwu-tuition', null, null, 'year'),
  ('illinois-wesleyan', 'room_board', '$8,796 standard double room + $5,644 meal plan / year (2026-27)', null, 'USD', 'us-iwu-tuition', null, null, 'year'),
  ('illinois-wesleyan', 'total_cost_of_attendance', null, null, null, null, 'The retrieved current tuition page itemizes 2026-27 charges but does not publish one 2026-27 international total cost of attendance.', 'Ask International Admissions for the current first-year international budget.', null),
  ('illinois-wesleyan', 'application_fee', '$0; there is no application fee', 0, 'USD', 'us-iwu-admission', null, null, 'one_time'),
  ('illinois-wesleyan', 'deadline', 'Preferred international fall deadline: March 15; Early Action: November 15', null, null, 'us-iwu-admission', null, null, null),
  ('illinois-wesleyan', 'aid_international', 'International merit scholarships up to $38,000 / year, renewable for up to four years', 38000, 'USD', 'us-iwu-aid', null, null, 'year'),
  ('illinois-wesleyan', 'test_policy', 'SAT and ACT are optional for international admission', null, null, 'us-iwu-admission', null, null, null),
  ('illinois-wesleyan', 'financial_certification', null, null, null, null, 'The official international budget retrieved is for 2025-26, not 2026-27, so no current certification figure was stored.', 'Request the 2026-27 Certification of Finances amount from International Admissions.', null),
  ('illinois-wesleyan', 'intake', 'Fall semester; preferred application deadline March 15', null, null, 'us-iwu-admission', null, null, null),
  ('illinois-wesleyan', 'language', 'English; published English-proficiency minimums apply to international applicants', null, null, 'us-iwu-admission', null, null, null),

  -- Clark University
  ('clark', 'tuition', '$62,070 / year (2026-27)', 62070, 'USD', 'us-clark-cost', null, null, 'year'),
  ('clark', 'fees', '$460 student activity + $680 health/wellness + $400 first-year orientation (2026-27)', null, 'USD', 'us-clark-cost', null, null, 'year'),
  ('clark', 'room_board', '$8,580 housing + $5,780 standard meal plan / year (2026-27)', null, 'USD', 'us-clark-cost', null, null, 'year'),
  ('clark', 'total_cost_of_attendance', '$82,753 estimated total / year (2026-27)', 82753, 'USD', 'us-clark-cost', null, null, 'year'),
  ('clark', 'application_fee', '$0; Clark does not charge an undergraduate application fee', 0, 'USD', 'us-clark-international', null, null, 'one_time'),
  ('clark', 'deadline', 'Regular Decision: January 15; Early Action: November 1', null, null, 'us-clark-process', null, null, null),
  ('clark', 'aid_international', 'Presidential Scholarship covers full tuition plus on-campus housing and meals for four years', null, null, 'us-clark-cost', null, null, null),
  ('clark', 'test_policy', 'SAT and ACT are optional for all applicants', null, null, 'us-clark-international', null, null, null),
  ('clark', 'financial_certification', null, null, null, null, 'Clark requires a Certification of Finances but the retrieved pages do not publish one exact I-20 amount.', 'Ask Clark ISSO for the current certification amount after any scholarship.', null),
  ('clark', 'intake', 'Fall or spring entry; Regular Decision deadline January 15 for fall', null, null, 'us-clark-process', null, null, null),
  ('clark', 'language', 'English; Clark publishes English-proficiency score indicators for international applicants', null, null, 'us-clark-international', null, null, null),

  -- University of Southern Mississippi
  ('usm', 'tuition', '$12,794 / year for a nonresident undergraduate (2026-27)', 12794, 'USD', 'us-usm-coa', null, null, 'year'),
  ('usm', 'fees', '$300 required fees in the fall 2026 international funding estimate', 300, 'USD', 'us-usm-i20', null, null, 'year'),
  ('usm', 'room_board', '$12,320 housing and food / year for an out-of-state on-campus student (2026-27)', 12320, 'USD', 'us-usm-coa', null, null, 'year'),
  ('usm', 'total_cost_of_attendance', '$30,528 / year for an out-of-state on-campus student (2026-27)', 30528, 'USD', 'us-usm-coa', null, null, 'year'),
  ('usm', 'application_fee', '$45 one time for international applicants', 45, 'USD', 'us-usm-admission', null, null, 'one_time'),
  ('usm', 'deadline', 'Fall international deadline: May 1; spring deadline: October 1', null, null, 'us-usm-admission', null, null, null),
  ('usm', 'aid_international', 'Published merit grid includes a $10,000 / year tier; higher scores can reach full tuition', 10000, 'USD', 'us-usm-scholarship', null, null, 'year'),
  ('usm', 'test_policy', 'SAT or ACT is optional for admission but required for freshman merit scholarship consideration', null, null, 'us-usm-admission', null, null, null),
  ('usm', 'financial_certification', '$34,188 minimum financial support for fall 2026 Form I-20', 34188, 'USD', 'us-usm-i20', null, null, 'year'),
  ('usm', 'intake', 'Fall (August) or spring (January)', null, null, 'us-usm-admission', null, null, null),
  ('usm', 'language', 'English; international applicants must meet an approved English-proficiency minimum', null, null, 'us-usm-admission', null, null, null),

  -- University of Alabama
  ('alabama', 'tuition', '$35,924 / year in the current international funding estimate', 35924, 'USD', 'us-ua-expenses', null, null, 'year'),
  ('alabama', 'fees', '$200 international fee + $800 estimated course/college fees / year', null, 'USD', 'us-ua-expenses', null, null, 'year'),
  ('alabama', 'room_board', '$12,000 housing + $5,850 meals / year in the international estimate', null, 'USD', 'us-ua-expenses', null, null, 'year'),
  ('alabama', 'total_cost_of_attendance', null, null, null, null, 'The retrieved current international page publishes an I-20 funding total, while the university''s retrieved COA page is not for 2026-27.', 'Ask Student Financial Aid for the official 2026-27 nonresident undergraduate COA.', null),
  ('alabama', 'application_fee', '$40 one time for international applicants', 40, 'USD', 'us-ua-apply', null, null, 'one_time'),
  ('alabama', 'deadline', 'Fall priority deadline: December 5', null, null, 'us-ua-admission', null, null, null),
  ('alabama', 'aid_international', '2026 automatic merit grid awards up to $28,000 / year before the Presidential Elite award', 28000, 'USD', 'us-ua-scholarship', null, null, 'year'),
  ('alabama', 'test_policy', 'Test optional through fall 2026; scores remain required for automatic merit awards', null, null, 'us-ua-admission', null, null, null),
  ('alabama', 'financial_certification', '$59,102 estimated funds required for the current Form I-20 budget', 59102, 'USD', 'us-ua-expenses', null, null, 'year'),
  ('alabama', 'intake', 'Fall semester; priority deadline December 5', null, null, 'us-ua-admission', null, null, null),
  ('alabama', 'language', 'English; international applicants must meet a published English-proficiency minimum', null, null, 'us-ua-english', null, null, null),

  -- University of Nebraska at Kearney
  ('unk', 'tuition', '$18,193 international tuition and fees / year before aid (2026-27)', 18193, 'USD', 'us-unk-cost', null, null, 'year'),
  ('unk', 'fees', null, null, null, null, 'UNK''s international budget bundles tuition and mandatory fees at $18,193 and does not separate the fee component.', 'Ask UNK Student Accounts for the international mandatory-fee total within the published bundle.', null),
  ('unk', 'room_board', '$12,294 housing and meal plan / year (2026-27)', 12294, 'USD', 'us-unk-cost', null, null, 'year'),
  ('unk', 'total_cost_of_attendance', '$35,064 / year before aid; $30,267 after the International Loper Scholarship (2026-27)', 35064, 'USD', 'us-unk-cost', null, null, 'year'),
  ('unk', 'application_fee', '$45 one time', 45, 'USD', 'us-unk-documents', null, null, 'one_time'),
  ('unk', 'deadline', 'Fall application: May 15; documents: June 15', null, null, 'us-unk-deadlines', null, null, null),
  ('unk', 'aid_international', 'International Loper Scholarship: $4,797 / year, automatically available after admission', 4797, 'USD', 'us-unk-scholarship', null, null, 'year'),
  ('unk', 'test_policy', 'SAT and ACT are not required for international undergraduate admission', null, null, 'us-unk-english', null, null, null),
  ('unk', 'financial_certification', '$35,064 minimum support before aid for the 2026-27 I-20; published aided total is $30,267', 35064, 'USD', 'us-unk-cost', null, null, 'year'),
  ('unk', 'intake', 'Fall (August), spring (January) or summer (May)', null, null, 'us-unk-deadlines', null, null, null),
  ('unk', 'language', 'English; a published English-proficiency minimum applies for full undergraduate admission', null, null, 'us-unk-english', null, null, null),

  -- Houston City College
  ('hcc', 'tuition', '$151 tuition per credit hour; total international tuition and mandatory academic fees are $227 per credit hour (2026-27)', null, 'USD', 'us-hcc-tuition', null, null, 'year'),
  ('hcc', 'fees', '$50 general + $25 technology + $1 student activity per credit hour, plus $6 recreation fee per semester (2026-27)', null, 'USD', 'us-hcc-tuition', null, null, 'year'),
  ('hcc', 'room_board', '$13,400 living expenses in the one-year F-1 budget', 13400, 'USD', 'us-hcc-faq', null, null, 'year'),
  ('hcc', 'total_cost_of_attendance', '$22,980 one-year F-1 budget: $7,980 tuition/fees, $13,400 living, $1,600 books', 22980, 'USD', 'us-hcc-faq', null, null, 'year'),
  ('hcc', 'application_fee', '$75 one time for a first-time F-1 applicant', 75, 'USD', 'us-hcc-admission', null, null, 'one_time'),
  ('hcc', 'deadline', 'First-time F-1 fall deadline: June 15; spring: October 15; summer: March 15', null, null, 'us-hcc-admission', null, null, null),
  ('hcc', 'aid_international', null, null, null, null, 'HCC''s retrieved scholarship information does not publish an international-student award amount or guarantee eligibility.', 'Ask the HCC Foundation whether first-time F-1 students are eligible and what award amounts are available.', null),
  ('hcc', 'test_policy', 'No TOEFL is required for admission; academic-program students complete English placement or submit an accepted proficiency test', null, null, 'us-hcc-faq', null, null, null),
  ('hcc', 'financial_certification', '$22,980 liquid financial support required for a self-sponsored first-time F-1 student', 22980, 'USD', 'us-hcc-financial', null, null, 'year'),
  ('hcc', 'intake', 'Fall, spring or summer; first-time F-1 fall deadline June 15', null, null, 'us-hcc-admission', null, null, null),
  ('hcc', 'language', 'English; college-level students must demonstrate English proficiency or complete placement', null, null, 'us-hcc-faq', null, null, null)
) as v(
  university_id, kind, value, numeric_value, currency, source_id,
  unknown_reason, suggested_action, amount_period
);

insert into public.programs (id, university_id, name, degree, field, source_id) values
  ('harvard-cs-ab', 'harvard', 'Computer Science', 'Bachelor of Arts (A.B.)', 'Computer Science', 'us-harvard-cs'),
  ('yale-cs-bs', 'yale', 'Computer Science', 'Bachelor of Science (B.S.)', 'Computer Science', 'us-yale-cs'),
  ('princeton-cs-bse', 'princeton', 'Computer Science', 'Bachelor of Science in Engineering (B.S.E.)', 'Computer Science', 'us-princeton-cs'),
  ('berea-cs-bs', 'berea', 'Computer Science', 'Bachelor''s degree', 'Computer Science', 'us-berea-cs'),
  ('iwu-cs', 'illinois-wesleyan', 'Computer Science', 'Bachelor''s degree', 'Computer Science', 'us-iwu-majors'),
  ('clark-cs-ba', 'clark', 'Computer Science', 'Bachelor of Arts (B.A.)', 'Computer Science', 'us-clark-cs'),
  ('usm-cs-bs', 'usm', 'Computer Science', 'Bachelor of Science (B.S.)', 'Computer Science', 'us-usm-cs'),
  ('alabama-cs-bs', 'alabama', 'Computer Science', 'Bachelor of Science (B.S.)', 'Computer Science', 'us-ua-cs'),
  ('unk-cs-bs', 'unk', 'Computer Science Comprehensive', 'Bachelor of Science (B.S.)', 'Computer Science', 'us-unk-cs'),
  ('hcc-cs-as', 'hcc', 'Computer Science', 'Associate of Science (A.S.) - university transfer', 'Computer Science', 'us-hcc-cs');

insert into public.requirements (
  university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action
)
select
  v.university_id,
  v.kind::public.requirement_kind,
  v.value,
  v.numeric_value,
  v.source_id,
  v.unknown_reason,
  v.suggested_action
from (values
  ('harvard', 'toefl', 'Not required; TOEFL may be submitted but Harvard publishes no minimum', null::numeric, 'us-harvard-international', null, null),
  ('harvard', 'ielts', 'Not required; IELTS may be submitted but Harvard publishes no minimum', null, 'us-harvard-international', null, null),
  ('harvard', 'duolingo', 'Not required; Duolingo may be submitted but Harvard publishes no minimum', null, 'us-harvard-international', null, null),
  ('harvard', 'sat', 'Required; no score cutoff is published', null, 'us-harvard-requirements', null, null),
  ('harvard', 'act', 'Required; no score cutoff is published', null, 'us-harvard-requirements', null, null),
  ('harvard', 'gpa', null, null, null, 'Harvard does not publish a minimum first-year GPA on the retrieved requirements page.', 'Review Harvard''s holistic selection guidance and ask admissions how the applicant''s school record will be read.'),

  ('yale', 'toefl', 'Most competitive applicants typically have TOEFL iBT 100 on the old scale or 5 on the new scale; this is not stated as a minimum', 100, 'us-yale-testing', null, null),
  ('yale', 'ielts', 'Most competitive applicants typically have IELTS 7; this is not stated as a minimum', 7, 'us-yale-testing', null, null),
  ('yale', 'duolingo', 'Most competitive applicants typically have Duolingo 120; this is not stated as a minimum', 120, 'us-yale-testing', null, null),
  ('yale', 'sat', 'Required; Yale publishes no minimum SAT score', null, 'us-yale-testing', null, null),
  ('yale', 'act', 'Required; Yale publishes no minimum ACT score', null, 'us-yale-testing', null, null),
  ('yale', 'gpa', null, null, null, 'Yale does not publish a minimum first-year GPA on the retrieved admissions pages.', 'Review Yale''s holistic selection guidance and ask admissions how the applicant''s school record will be evaluated.'),

  ('princeton', 'toefl', 'Required in the stated non-English-medium circumstances; no minimum is published', null, 'us-princeton-testing', null, null),
  ('princeton', 'ielts', 'Required in the stated non-English-medium circumstances; no minimum is published', null, 'us-princeton-testing', null, null),
  ('princeton', 'duolingo', 'Required in the stated non-English-medium circumstances; no minimum is published', null, 'us-princeton-testing', null, null),
  ('princeton', 'sat', 'Optional for fall 2027 entry; required beginning with fall 2028; no minimum', null, 'us-princeton-testing', null, null),
  ('princeton', 'act', 'Optional for fall 2027 entry; required beginning with fall 2028; no minimum', null, 'us-princeton-testing', null, null),
  ('princeton', 'gpa', null, null, null, 'Princeton does not publish a minimum first-year GPA on the retrieved admissions pages.', 'Review Princeton''s holistic review guidance and ask admissions how the applicant''s curriculum will be contextualized.'),

  ('berea', 'toefl', 'Minimum TOEFL iBT 68 or paper 520', 68, 'us-berea-faq', null, null),
  ('berea', 'ielts', 'Minimum IELTS 6.0, with at least 5.0 in each subscore', 6, 'us-berea-faq', null, null),
  ('berea', 'duolingo', 'Minimum Duolingo 95', 95, 'us-berea-faq', null, null),
  ('berea', 'sat', 'Minimum SAT 980 when used as the required test', 980, 'us-berea-faq', null, null),
  ('berea', 'act', 'Minimum ACT 19 when used as the required test', 19, 'us-berea-faq', null, null),
  ('berea', 'gpa', null, null, null, 'Berea does not publish one international first-year GPA minimum on the retrieved FAQ.', 'Ask International Admissions to review the applicant''s secondary-school record.'),

  ('illinois-wesleyan', 'toefl', 'Minimum TOEFL iBT 80', 80, 'us-iwu-admission', null, null),
  ('illinois-wesleyan', 'ielts', 'Minimum IELTS 6.5', 6.5, 'us-iwu-admission', null, null),
  ('illinois-wesleyan', 'duolingo', 'Minimum Duolingo 115', 115, 'us-iwu-admission', null, null),
  ('illinois-wesleyan', 'sat', 'Optional for admission; no minimum is published', null, 'us-iwu-admission', null, null),
  ('illinois-wesleyan', 'act', 'Optional for admission; no minimum is published', null, 'us-iwu-admission', null, null),
  ('illinois-wesleyan', 'gpa', null, null, null, 'Illinois Wesleyan does not publish a minimum international first-year GPA on the retrieved page.', 'Ask International Admissions for a credential-specific academic benchmark.'),

  ('clark', 'toefl', 'General indicator: TOEFL iBT 85 old scale or 4.5 new scale; not stated as a hard minimum', 85, 'us-clark-international', null, null),
  ('clark', 'ielts', 'General indicator: IELTS 6.5; not stated as a hard minimum', 6.5, 'us-clark-international', null, null),
  ('clark', 'duolingo', 'General indicator: Duolingo 120; not stated as a hard minimum', 120, 'us-clark-international', null, null),
  ('clark', 'sat', 'Optional for admission; no minimum is published', null, 'us-clark-international', null, null),
  ('clark', 'act', 'Optional for admission; no minimum is published', null, 'us-clark-international', null, null),
  ('clark', 'gpa', null, null, null, 'Clark does not publish a minimum international first-year GPA on the retrieved page.', 'Ask Undergraduate Admissions for a credential-specific academic benchmark.'),

  ('usm', 'toefl', 'Minimum TOEFL iBT 71 on the old scale or 4 on the new scale', 71, 'us-usm-admission', null, null),
  ('usm', 'ielts', 'Minimum IELTS 6.0', 6, 'us-usm-admission', null, null),
  ('usm', 'duolingo', 'Duolingo is not accepted for undergraduate English proficiency', null, 'us-usm-admission', null, null),
  ('usm', 'sat', 'Optional for admission; SAT 1420 with GPA 3.25 can reach the published full-tuition merit tier', 1420, 'us-usm-scholarship', null, null),
  ('usm', 'act', 'Optional for admission; ACT 32 with GPA 3.25 can reach the published full-tuition merit tier', 32, 'us-usm-scholarship', null, null),
  ('usm', 'gpa', 'A 2.5 GPA is the published strong-applicant benchmark', 2.5, 'us-usm-admission', null, null),

  ('alabama', 'toefl', 'Minimum TOEFL iBT 79 on the old scale or 4.5 on the new scale', 79, 'us-ua-english', null, null),
  ('alabama', 'ielts', 'Minimum IELTS 6.0', 6, 'us-ua-english', null, null),
  ('alabama', 'duolingo', 'Minimum Duolingo 110', 110, 'us-ua-english', null, null),
  ('alabama', 'sat', 'Optional for admission; SAT 1420 begins the published $28,000 merit tier with GPA 3.5', 1420, 'us-ua-scholarship', null, null),
  ('alabama', 'act', 'Optional for admission; ACT 32 begins the published $28,000 merit tier with GPA 3.5', 32, 'us-ua-scholarship', null, null),
  ('alabama', 'gpa', 'Minimum 3.0 cumulative GPA for admission consideration; 3.5 for the $28,000 merit tier', 3, 'us-ua-admission', null, null),

  ('unk', 'toefl', 'Minimum TOEFL iBT 61 on the old scale or 4.0 on the new scale', 61, 'us-unk-english', null, null),
  ('unk', 'ielts', 'Minimum IELTS 5.5', 5.5, 'us-unk-english', null, null),
  ('unk', 'duolingo', 'Minimum Duolingo 100', 100, 'us-unk-english', null, null),
  ('unk', 'sat', 'Not required for admission; SAT 1030 can satisfy English proficiency', 1030, 'us-unk-english', null, null),
  ('unk', 'act', 'Not required for admission; ACT 20 can satisfy English proficiency', 20, 'us-unk-english', null, null),
  ('unk', 'gpa', 'Minimum 3.0 cumulative high-school GPA; lower records may receive admission review', 3, 'us-unk-documents', null, null),

  ('hcc', 'toefl', 'Accepted for English placement; HCC publishes no single admission minimum on the retrieved FAQ', null, 'us-hcc-faq', null, null),
  ('hcc', 'ielts', 'Accepted for English placement; HCC publishes no single admission minimum on the retrieved FAQ', null, 'us-hcc-faq', null, null),
  ('hcc', 'duolingo', null, null, null, 'The retrieved HCC proficiency list does not state whether Duolingo is accepted.', 'Ask HCC Testing Services whether Duolingo is accepted and what score places into college-level English.'),
  ('hcc', 'sat', null, null, null, 'The retrieved HCC international pages do not publish an SAT admission expectation.', 'Ask HCC Enrollment Services whether an SAT score can replace placement testing.'),
  ('hcc', 'act', null, null, null, 'The retrieved HCC international pages do not publish an ACT admission expectation.', 'Ask HCC Enrollment Services whether an ACT score can replace placement testing.'),
  ('hcc', 'gpa', null, null, null, 'The retrieved HCC first-time F-1 page does not publish a minimum GPA.', 'Submit the required credential evaluation and ask HCC for college-level placement requirements.')
) as v(university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action);

insert into public.scholarships (
  id, name, amount_value, amount_numeric, currency, amount_source_id,
  amount_unknown_reason, amount_suggested_action, source_id, amount_period
) values
  ('harvard-need-aid', 'Harvard need-based grant aid', null, null, null, null, 'The award is individualized from demonstrated need, so Harvard publishes no single amount.', 'Complete Harvard''s financial-aid application for a personal award.', 'us-harvard-international', null),
  ('yale-need-aid', 'Yale need-based grant aid', null, null, null, null, 'The award is individualized from demonstrated need, so Yale publishes no single amount.', 'Complete Yale''s financial-aid application for a personal award.', 'us-yale-international', null),
  ('princeton-need-aid', 'Princeton need-based grant aid', null, null, null, null, 'The award is individualized from demonstrated need, so Princeton publishes no single amount.', 'Complete Princeton''s financial-aid application for a personal award.', 'us-princeton-international', null),
  ('berea-no-tuition', 'Berea No-Tuition Promise', '$56,900 published tuition reduced to $0 for enrolled students (2026-27)', 56900, 'USD', 'us-berea-cost', null, null, 'us-berea-cost', 'year'),
  ('iwu-merit', 'Illinois Wesleyan International Merit Scholarship', 'Up to $38,000 / year', 38000, 'USD', 'us-iwu-aid', null, null, 'us-iwu-aid', 'year'),
  ('clark-presidential', 'Clark Presidential Scholarship', 'Full tuition plus on-campus housing and meals for four years', null, 'USD', 'us-clark-cost', null, null, 'us-clark-cost', 'year'),
  ('usm-academic', 'Southern Miss Academic Excellence Scholarship', '$10,000 / year published tier; higher scores can reach full tuition', 10000, 'USD', 'us-usm-scholarship', null, null, 'us-usm-scholarship', 'year'),
  ('alabama-automatic', 'Alabama Automatic Merit Scholarship', 'Up to $28,000 / year on the 2026 international grid', 28000, 'USD', 'us-ua-scholarship', null, null, 'us-ua-scholarship', 'year'),
  ('unk-loper', 'UNK International Loper Scholarship', '$4,797 / year (2026-27)', 4797, 'USD', 'us-unk-scholarship', null, null, 'us-unk-scholarship', 'year'),
  ('hcc-foundation', 'HCC Foundation scholarships', null, null, null, null, 'HCC does not publish a guaranteed international award amount on the retrieved page.', 'Ask the HCC Foundation about F-1 eligibility and current awards.', 'us-hcc-faq', null);

insert into public.university_scholarships (university_id, scholarship_id, source_id) values
  ('harvard', 'harvard-need-aid', 'us-harvard-international'),
  ('yale', 'yale-need-aid', 'us-yale-international'),
  ('princeton', 'princeton-need-aid', 'us-princeton-international'),
  ('berea', 'berea-no-tuition', 'us-berea-aid'),
  ('illinois-wesleyan', 'iwu-merit', 'us-iwu-aid'),
  ('clark', 'clark-presidential', 'us-clark-cost'),
  ('usm', 'usm-academic', 'us-usm-scholarship'),
  ('alabama', 'alabama-automatic', 'us-ua-scholarship'),
  ('unk', 'unk-loper', 'us-unk-scholarship'),
  ('hcc', 'hcc-foundation', 'us-hcc-faq');

insert into supabase_migrations.schema_migrations (version, statements, name)
values (
  '202607280006',
  array['Applied from the checked-in migration through Supabase SQL Editor.'],
  'us_catalogue'
)
on conflict (version) do update
set statements = excluded.statements,
    name = excluded.name;

commit;
