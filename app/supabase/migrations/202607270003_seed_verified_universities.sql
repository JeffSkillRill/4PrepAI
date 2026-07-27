begin;

-- Replace prototype composites with the ten-university launch catalogue.
-- Every absent value is an explicit unknown; nothing below is inferred.
delete from public.university_scholarships;
delete from public.scholarships;
delete from public.universities;
delete from public.sources;

insert into public.sources (id, name, url, retrieved_at, verification) values
  ('nu-admissions-2026', 'Nazarbayev University — Regular admissions for international applicants', 'https://nu.edu.kz/admissions/how-to-apply/foundation-undergraduate/regular-admissions/', '2026-07-27', 'verified'),
  ('nu-financial-aid', 'Nazarbayev University — Financial aid and scholarships', 'https://nu.edu.kz/admissions/how-to-apply/foundation-undergraduate/financial-aid-end-scholarships/', '2026-07-27', 'verified'),
  ('nu-cs', 'Nazarbayev University — BSc in Computer Science', 'https://prev.nu.edu.kz/en/academics/program/beng-in-computer-science', '2026-07-27', 'verified'),
  ('wiut-cs', 'Westminster International University in Tashkent — BSc (Hons) Computer Science', 'https://www.wiut.uz/bsc-hons-in-computer-science', '2026-07-27', 'verified'),
  ('wiut-fees-2026', 'Westminster International University in Tashkent — International tuition fees', 'https://www.wiut.uz/tuition-fees-international', '2026-07-27', 'verified'),
  ('wiut-scholarship', 'Westminster International University in Tashkent — Scholarships', 'https://www.wiut.uz/scholarship', '2026-07-27', 'verified'),
  ('newuu-admissions-2026', 'New Uzbekistan University — Undergraduate admissions', 'https://www.newuu.uz/en/undergraduate-admissions', '2026-07-27', 'verified'),
  ('newuu-fees', 'New Uzbekistan University — Tuition fees overview', 'https://www.newuu.uz/en/scholarships/tuition-fees-overview', '2026-07-27', 'verified'),
  ('newuu-scholarship', 'New Uzbekistan University — Four-year scholarships', 'https://www.newuu.uz/en/scholarships/4-year-scholarships', '2026-07-27', 'verified'),
  ('newuu-computing', 'New Uzbekistan University — School of Computing', 'https://www.newuu.uz/en/school-of-computing', '2026-07-27', 'verified'),
  ('aitu-bachelor', 'Astana IT University — Bachelor programmes and 2026–2027 tuition', 'https://astanait.edu.kz/en/bachelor', '2026-07-27', 'verified'),
  ('aitu-se', 'Astana IT University — Software Engineering bachelor', 'https://astanait.edu.kz/en/Software-Engineering-bachelor', '2026-07-27', 'verified'),
  ('aitu-scholarship', 'Astana IT University — Scholarship for foreign citizens', 'https://astanait.edu.kz/en/scholarship-foreign', '2026-07-27', 'verified'),
  ('kbtu-international', 'Kazakh-British Technical University — International admissions', 'https://kbtu.edu.kz/en/internationalization/international-admissions-internationalization', '2026-07-27', 'verified'),
  ('kbtu-ug', 'Kazakh-British Technical University — Undergraduate admission', 'https://kbtu.edu.kz/en/kbtu-admission-undergraduate', '2026-07-27', 'verified'),
  ('kbtu-it-programs', 'Kazakh-British Technical University — School of IT and Engineering bachelor programmes', 'https://kbtu.edu.kz/en/schools/school-of-information-technology-and-engineering/bachelor-s-educational-programs-of-the-school-of-information-technology-and-engineering', '2026-07-27', 'verified'),
  ('debrecen-cs', 'University of Debrecen — Computer Science BSc', 'https://edu.unideb.hu/p/computer-science-bsc', '2026-07-27', 'verified'),
  ('debrecen-fees-2026', 'University of Debrecen — 2026–2027 tuition, application and entrance fees', 'https://edu.unideb.hu/page.php?id=tuition-fee-application-entrance-fee', '2026-07-27', 'verified'),
  ('debrecen-living', 'University of Debrecen — Cost of living', 'https://edu.unideb.hu/p/cost-of-living', '2026-07-27', 'verified'),
  ('debrecen-scholarship', 'University of Debrecen — Scholarships', 'https://edu.unideb.hu/page.php?id=14', '2026-07-27', 'verified'),
  ('elte-cs-2026', 'Eötvös Loránd University — Computer Science BSc', 'https://www.elte.hu/en/computer-science-bsc', '2026-07-27', 'verified'),
  ('elte-funding', 'Eötvös Loránd University — Funding', 'https://www.elte.hu/en/funding', '2026-07-27', 'verified'),
  ('tartu-scitech-2026', 'University of Tartu — Science and Technology BSc', 'https://ut.ee/en/curriculum/science-and-technology', '2026-07-27', 'verified'),
  ('tartu-application-fee', 'University of Tartu — Application fee', 'https://ut.ee/en/content/application-fee', '2026-07-27', 'verified'),
  ('tartu-english', 'University of Tartu — English language requirements', 'https://ut.ee/en/english-language-requirements', '2026-07-27', 'verified'),
  ('constructor-cs-2026', 'Constructor University — Computer Science BSc', 'https://constructor.university/programs/undergraduate-education/computer-science', '2026-07-27', 'verified'),
  ('constructor-apply', 'Constructor University — Undergraduate application information', 'https://constructor.university/admission-aid/application-information-undergraduate', '2026-07-27', 'verified'),
  ('constructor-faq', 'Constructor University — Undergraduate study FAQ', 'https://constructor.university/programs/undergraduate-education/faq-undergraduate-study', '2026-07-27', 'verified'),
  ('constructor-cost-2026', 'Constructor University — 2026–2027 bachelor cost of attendance', 'https://constructor.university/sites/default/files/2026-01/2026-2027%20CU%20Fact%20Sheet_Bachelor_Cost%20of%20Attendance.pdf', '2026-07-27', 'verified'),
  ('sabanci-fees-2026', 'Sabancı University — International undergraduate tuition fee', 'https://iro.sabanciuniv.edu/en/tuition-fee', '2026-07-27', 'verified'),
  ('sabanci-apply-2026', 'Sabancı University — International undergraduate application', 'https://iro.sabanciuniv.edu/en/how-to-apply', '2026-07-27', 'verified'),
  ('sabanci-cs', 'Sabancı University — Computer Science and Engineering', 'https://iro.sabanciuniv.edu/en/computer-science-and-engineering', '2026-07-27', 'verified'),
  ('sabanci-calendar-2026', 'Sabancı University — 2026–2027 academic calendar', 'https://sabanciuniv.edu/en/academic-calendar?b=2026&c=13&d=tr', '2026-07-27', 'verified');

insert into public.universities
  (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id)
values
  ('nu', 'Nazarbayev University', 'Astana', 'Kazakhstan', '🇰🇿', 'Research university in Astana', 'An English-medium university with undergraduate study in computer science and other fields.', 'nu', array['English-medium', 'Four-year computer science degree'], 'nu-admissions-2026'),
  ('wiut', 'Westminster International University in Tashkent', 'Tashkent', 'Uzbekistan', '🇺🇿', 'British degree in Tashkent', 'An English-medium international university offering a three-year BSc (Hons) in Computer Science.', 'wiut', array['British degree', 'English-medium'], 'wiut-cs'),
  ('newuu', 'New Uzbekistan University', 'Tashkent', 'Uzbekistan', '🇺🇿', 'Computing and engineering in Tashkent', 'A public university offering English-medium undergraduate programmes including Software Engineering.', 'newuu', array['Software Engineering', 'Merit scholarships'], 'newuu-admissions-2026'),
  ('aitu', 'Astana IT University', 'Astana', 'Kazakhstan', '🇰🇿', 'Technology-focused study in Astana', 'A technology university offering three-year English-medium bachelor programmes including Software Engineering.', 'aitu', array['Three-year bachelor', 'English-medium'], 'aitu-bachelor'),
  ('kbtu', 'Kazakh-British Technical University', 'Almaty', 'Kazakhstan', '🇰🇿', 'Technology and business in Almaty', 'A university offering English-medium four-year bachelor programmes in information technology and engineering.', 'kbtu', array['English-medium', 'Four-year bachelor'], 'kbtu-ug'),
  ('debrecen', 'University of Debrecen', 'Debrecen', 'Hungary', '🇭🇺', 'English-taught computer science in Hungary', 'A Hungarian public university offering a three-year English-taught Computer Science BSc.', 'debrecen', array['English-taught', 'September intake'], 'debrecen-cs'),
  ('elte', 'Eötvös Loránd University', 'Budapest', 'Hungary', '🇭🇺', 'Computer science in Budapest', 'A Hungarian university offering a three-year English-taught Computer Science BSc.', 'elte', array['Budapest', 'Three-year BSc'], 'elte-cs-2026'),
  ('tartu', 'University of Tartu', 'Tartu', 'Estonia', '🇪🇪', 'Science and technology in Estonia', 'An Estonian university offering a three-year English-taught Science and Technology BSc.', 'tartu', array['English-taught', 'Science and Technology'], 'tartu-scitech-2026'),
  ('constructor', 'Constructor University', 'Bremen', 'Germany', '🇩🇪', 'International computer science in Bremen', 'A private English-speaking university offering a three-year Computer Science BSc.', 'constructor', array['English-speaking campus', 'Three-year BSc'], 'constructor-cs-2026'),
  ('sabanci', 'Sabancı University', 'Istanbul', 'Türkiye', '🇹🇷', 'Computer science and engineering in Istanbul', 'An English-medium university offering a four-year Computer Science and Engineering bachelor programme.', 'sabanci', array['English-medium', 'Tuition-waiver scholarships'], 'sabanci-cs');

insert into public.university_facts
  (university_id, kind, value, numeric_value, currency, amount_period, source_id, unknown_reason, suggested_action)
values
  ('nu', 'tuition', 'US$15,000 / year (2026–2027)', 15000, 'USD', 'year', 'nu-admissions-2026', null, null),
  ('nu', 'living_cost', 'About US$400 / month', 400, 'USD', 'month', 'nu-admissions-2026', null, null),
  ('nu', 'application_fee', null, null, null, null, null, 'The official page reviewed does not publish an application fee.', 'Confirm in the NU admissions portal before applying.'),
  ('nu', 'deadline', '17 July 2026 for visa-required international applicants', null, null, null, 'nu-admissions-2026', null, null),
  ('nu', 'scholarship', 'Abay Kunanbayev Scholarship covers tuition and a monthly stipend', null, null, null, 'nu-financial-aid', null, null),
  ('nu', 'language', 'English', null, null, null, 'nu-cs', null, null),
  ('nu', 'intake', '2026–2027 academic year', null, null, null, 'nu-admissions-2026', null, null),
  ('wiut', 'tuition', 'UZS 54,600,000 / year (2026–2027)', 54600000, 'UZS', 'year', 'wiut-fees-2026', null, null),
  ('wiut', 'living_cost', null, null, null, null, null, 'WIUT does not publish a complete student living-cost figure on the pages reviewed.', 'Build a personal Tashkent budget and confirm accommodation costs with WIUT.'),
  ('wiut', 'application_fee', null, null, null, null, null, 'The published mathematics-exam fee is not an application fee, so no application fee is recorded.', 'Check the application portal for any fee before submission.'),
  ('wiut', 'deadline', null, null, null, null, null, 'A current general undergraduate application deadline was not confirmed from the official programme pages reviewed.', 'Check the current WIUT admissions calendar.'),
  ('wiut', 'scholarship', '15% Dean’s List discount for eligible continuing students', 15, null, 'percentage', 'wiut-fees-2026', null, null),
  ('wiut', 'language', 'English', null, null, null, 'wiut-cs', null, null),
  ('wiut', 'intake', 'September (annual)', null, null, null, 'wiut-cs', null, null),
  ('newuu', 'tuition', 'UZS 42,000,000 / year', 42000000, 'UZS', 'year', 'newuu-fees', null, null),
  ('newuu', 'living_cost', null, null, null, null, null, 'A complete student living-cost figure was not published on the official pages reviewed.', 'Ask New Uzbekistan University about housing and prepare a personal Tashkent budget.'),
  ('newuu', 'application_fee', null, null, null, null, null, 'No application fee was confirmed on the official admissions page reviewed.', 'Confirm in the admissions portal before submitting.'),
  ('newuu', 'deadline', '19 June 2026 registration deadline', null, null, null, 'newuu-admissions-2026', null, null),
  ('newuu', 'scholarship', 'Merit scholarships can cover 100%, 70% or 50% of tuition', null, null, 'percentage', 'newuu-fees', null, null),
  ('newuu', 'language', 'English-medium programmes', null, null, null, 'newuu-admissions-2026', null, null),
  ('newuu', 'intake', 'Fall 2026', null, null, null, 'newuu-admissions-2026', null, null),
  ('aitu', 'tuition', 'KZT 2,500,000 / year (2026–2027)', 2500000, 'KZT', 'year', 'aitu-bachelor', null, null),
  ('aitu', 'living_cost', null, null, null, null, null, 'A complete student living-cost figure was not published on the official pages reviewed.', 'Ask AITU about housing and prepare a personal Astana budget.'),
  ('aitu', 'application_fee', null, null, null, null, null, 'The AITU Excellence Test fee is not an application fee, so no application fee is recorded.', 'Confirm in the international admissions portal before submitting.'),
  ('aitu', 'deadline', null, null, null, null, null, 'The page reviewed lists admissions-office availability but not a definitive application deadline.', 'Confirm the current deadline directly with AITU admissions.'),
  ('aitu', 'scholarship', 'Kazakhstan’s foreign-student scholarship covers tuition and a monthly allowance', null, null, null, 'aitu-scholarship', null, null),
  ('aitu', 'language', 'English', null, null, null, 'aitu-bachelor', null, null),
  ('aitu', 'intake', '2026–2027 academic year', null, null, null, 'aitu-bachelor', null, null),
  ('kbtu', 'tuition', null, null, null, null, null, 'A current official international undergraduate tuition figure was not found on the pages reviewed.', 'Request the current fee schedule from KBTU admissions.'),
  ('kbtu', 'living_cost', null, null, null, null, null, 'KBTU does not publish a complete student living-cost figure on the pages reviewed.', 'Build a personal Almaty budget and ask KBTU about housing.'),
  ('kbtu', 'application_fee', null, null, null, null, null, 'No application fee was confirmed on the official admissions pages reviewed.', 'Confirm in the admissions portal before submitting.'),
  ('kbtu', 'deadline', null, null, null, null, null, 'A current general undergraduate application deadline was not confirmed on the official pages reviewed.', 'Ask KBTU international admissions for the current deadline.'),
  ('kbtu', 'scholarship', 'Kazakhstan’s government scholarship covers tuition and a monthly allowance', null, null, null, 'kbtu-international', null, null),
  ('kbtu', 'language', 'English', null, null, null, 'kbtu-ug', null, null),
  ('kbtu', 'intake', null, null, null, null, null, 'A current intake date was not confirmed on the official pages reviewed.', 'Confirm the start date with KBTU admissions.'),
  ('debrecen', 'tuition', 'US$7,000 / year', 7000, 'USD', 'year', 'debrecen-cs', null, null),
  ('debrecen', 'living_cost', 'About US$800 / month, excluding tuition', 800, 'USD', 'month', 'debrecen-living', null, null),
  ('debrecen', 'application_fee', 'US$150 application fee', 150, 'USD', 'one_time', 'debrecen-fees-2026', null, null),
  ('debrecen', 'deadline', '15 June for the September self-financed intake', null, null, null, 'debrecen-cs', null, null),
  ('debrecen', 'scholarship', 'Stipendium Hungaricum application route is available', null, null, null, 'debrecen-scholarship', null, null),
  ('debrecen', 'language', 'English', null, null, null, 'debrecen-cs', null, null),
  ('debrecen', 'intake', 'September', null, null, null, 'debrecen-cs', null, null),
  ('elte', 'tuition', '€3,200 / semester', 3200, 'EUR', 'semester', 'elte-cs-2026', null, null),
  ('elte', 'living_cost', null, null, null, null, null, 'ELTE publishes cost categories, but no single complete living-cost total was confirmed.', 'Use ELTE’s cost categories to build a personal Budapest budget.'),
  ('elte', 'application_fee', '€150 application fee', 150, 'EUR', 'one_time', 'elte-cs-2026', null, null),
  ('elte', 'deadline', '30 April 2026', null, null, null, 'elte-cs-2026', null, null),
  ('elte', 'scholarship', 'Full scholarships are available through listed funding routes', null, null, null, 'elte-funding', null, null),
  ('elte', 'language', 'English', null, null, null, 'elte-cs-2026', null, null),
  ('elte', 'intake', '1 September 2026', null, null, null, 'elte-cs-2026', null, null),
  ('tartu', 'tuition', '€6,000 / year', 6000, 'EUR', 'year', 'tartu-scitech-2026', null, null),
  ('tartu', 'living_cost', null, null, null, null, null, 'The university publishes accommodation ranges but not one complete living-cost total.', 'Build a personal Tartu budget using the university’s housing guidance.'),
  ('tartu', 'application_fee', '€100 application fee', 100, 'EUR', 'one_time', 'tartu-application-fee', null, null),
  ('tartu', 'deadline', '15 April 2026', null, null, null, 'tartu-scitech-2026', null, null),
  ('tartu', 'scholarship', 'Eight admitted students receive a 50% tuition reduction from the second semester', 50, null, 'percentage', 'tartu-scitech-2026', null, null),
  ('tartu', 'language', 'English', null, null, null, 'tartu-scitech-2026', null, null),
  ('tartu', 'intake', '31 August 2026', null, null, null, 'tartu-scitech-2026', null, null),
  ('constructor', 'tuition', '€10,000 / semester', 10000, 'EUR', 'semester', 'constructor-cs-2026', null, null),
  ('constructor', 'living_cost', '€2,500 room + €1,000 meal plan / semester', 3500, 'EUR', 'semester', 'constructor-cost-2026', null, null),
  ('constructor', 'application_fee', 'No application fee', null, null, 'one_time', 'constructor-faq', null, null),
  ('constructor', 'deadline', 'Rolling admission through 15 August 2026', null, null, null, 'constructor-cs-2026', null, null),
  ('constructor', 'scholarship', 'All applicants are considered for scholarships', null, null, null, 'constructor-cs-2026', null, null),
  ('constructor', 'language', 'English', null, null, null, 'constructor-cs-2026', null, null),
  ('constructor', 'intake', 'Early September 2026', null, null, null, 'constructor-cs-2026', null, null),
  ('sabanci', 'tuition', 'US$36,500 / year (2026–2027)', 36500, 'USD', 'year', 'sabanci-fees-2026', null, null),
  ('sabanci', 'living_cost', null, null, null, null, null, 'A complete student living-cost figure was not published on the official pages reviewed.', 'Build a personal Istanbul budget and ask Sabancı about current housing costs.'),
  ('sabanci', 'application_fee', 'US$30 application fee', 30, 'USD', 'one_time', 'sabanci-apply-2026', null, null),
  ('sabanci', 'deadline', '28 August 2026', null, null, null, 'sabanci-apply-2026', null, null),
  ('sabanci', 'scholarship', 'Tuition waivers of 25%, 40%, 50%, 60% or 75%', null, null, 'percentage', 'sabanci-fees-2026', null, null),
  ('sabanci', 'language', 'English', null, null, null, 'sabanci-cs', null, null),
  ('sabanci', 'intake', '28 September 2026', null, null, null, 'sabanci-calendar-2026', null, null);

insert into public.requirements
  (university_id, kind, value, numeric_value, source_id, unknown_reason, suggested_action)
values
  ('nu', 'ielts', 'IELTS 6.0 overall; 6.0 writing and 5.5 in other sections', 6.0, 'nu-admissions-2026', null, null),
  ('wiut', 'ielts', 'IELTS 6.5 overall with at least 6.0 in writing', 6.5, 'wiut-cs', null, null),
  ('newuu', 'ielts', null, null, null, 'The admissions page publishes different English thresholds by programme and route; one Software Engineering IELTS minimum was not confirmed.', 'Confirm the current Software Engineering requirement with admissions.'),
  ('aitu', 'ielts', null, null, null, 'IELTS 5.5 is published for the foreign-student scholarship, not as a universal programme admission minimum.', 'Confirm the Software Engineering admission requirement with AITU.'),
  ('kbtu', 'ielts', 'IELTS 5.5', 5.5, 'kbtu-international', null, null),
  ('debrecen', 'ielts', 'IELTS 5.5', 5.5, 'debrecen-cs', null, null),
  ('elte', 'ielts', null, null, null, 'The programme publishes a B1 English requirement but no IELTS-specific minimum.', 'Ask ELTE whether your English certificate meets its B1 requirement.'),
  ('tartu', 'ielts', 'IELTS 6.0 overall with no part below 5.5', 6.0, 'tartu-english', null, null),
  ('constructor', 'ielts', 'IELTS 6.5', 6.5, 'constructor-apply', null, null),
  ('sabanci', 'ielts', null, null, null, 'No IELTS-specific minimum was confirmed on the official programme and application pages reviewed.', 'Check Sabancı’s current English proficiency rules for admitted students.');

insert into public.programs (id, university_id, name, degree, field, source_id) values
  ('nu-cs-bsc', 'nu', 'Computer Science', 'BSc', 'Computer Science', 'nu-cs'),
  ('wiut-cs-bsc', 'wiut', 'Computer Science', 'BSc (Hons)', 'Computer Science', 'wiut-cs'),
  ('newuu-se-bsc', 'newuu', 'Software Engineering', 'BSc', 'Computer Science', 'newuu-computing'),
  ('aitu-se-bsc', 'aitu', 'Software Engineering', 'Bachelor', 'Computer Science', 'aitu-se'),
  ('kbtu-is-bsc', 'kbtu', 'Information Systems', 'Bachelor', 'Computer Science', 'kbtu-it-programs'),
  ('debrecen-cs-bsc', 'debrecen', 'Computer Science', 'BSc', 'Computer Science', 'debrecen-cs'),
  ('elte-cs-bsc', 'elte', 'Computer Science', 'BSc', 'Computer Science', 'elte-cs-2026'),
  ('tartu-scitech-bsc', 'tartu', 'Science and Technology', 'BSc', 'Computer Science', 'tartu-scitech-2026'),
  ('constructor-cs-bsc', 'constructor', 'Computer Science', 'BSc', 'Computer Science', 'constructor-cs-2026'),
  ('sabanci-cse-bsc', 'sabanci', 'Computer Science and Engineering', 'BSc', 'Computer Science', 'sabanci-cs');

insert into public.program_facts
  (program_id, kind, value, numeric_value, currency, amount_period, source_id, unknown_reason, suggested_action)
values
  ('nu-cs-bsc', 'duration', '4 years', 4, null, 'year', 'nu-cs', null, null),
  ('nu-cs-bsc', 'tuition', 'US$15,000 / year (2026–2027)', 15000, 'USD', 'year', 'nu-admissions-2026', null, null),
  ('wiut-cs-bsc', 'duration', '3 years', 3, null, 'year', 'wiut-cs', null, null),
  ('wiut-cs-bsc', 'tuition', 'UZS 54,600,000 / year (2026–2027)', 54600000, 'UZS', 'year', 'wiut-fees-2026', null, null),
  ('newuu-se-bsc', 'duration', null, null, null, null, null, 'A programme-specific duration was not confirmed on the official page reviewed.', 'Confirm the current Software Engineering curriculum length.'),
  ('newuu-se-bsc', 'tuition', 'UZS 42,000,000 / year', 42000000, 'UZS', 'year', 'newuu-fees', null, null),
  ('aitu-se-bsc', 'duration', '3 years', 3, null, 'year', 'aitu-se', null, null),
  ('aitu-se-bsc', 'tuition', 'KZT 2,500,000 / year (2026–2027)', 2500000, 'KZT', 'year', 'aitu-bachelor', null, null),
  ('kbtu-is-bsc', 'duration', '4 years', 4, null, 'year', 'kbtu-ug', null, null),
  ('kbtu-is-bsc', 'tuition', null, null, null, null, null, 'A current official tuition figure was not found on the pages reviewed.', 'Request the current fee schedule from KBTU admissions.'),
  ('debrecen-cs-bsc', 'duration', '3 years (6 semesters)', 3, null, 'year', 'debrecen-cs', null, null),
  ('debrecen-cs-bsc', 'tuition', 'US$7,000 / year', 7000, 'USD', 'year', 'debrecen-cs', null, null),
  ('elte-cs-bsc', 'duration', '3 years (6 semesters)', 3, null, 'year', 'elte-cs-2026', null, null),
  ('elte-cs-bsc', 'tuition', '€3,200 / semester', 3200, 'EUR', 'semester', 'elte-cs-2026', null, null),
  ('tartu-scitech-bsc', 'duration', '3 years', 3, null, 'year', 'tartu-scitech-2026', null, null),
  ('tartu-scitech-bsc', 'tuition', '€6,000 / year', 6000, 'EUR', 'year', 'tartu-scitech-2026', null, null),
  ('constructor-cs-bsc', 'duration', '3 years', 3, null, 'year', 'constructor-cs-2026', null, null),
  ('constructor-cs-bsc', 'tuition', '€10,000 / semester', 10000, 'EUR', 'semester', 'constructor-cs-2026', null, null),
  ('sabanci-cse-bsc', 'duration', '4 years', 4, null, 'year', 'sabanci-cs', null, null),
  ('sabanci-cse-bsc', 'tuition', 'US$36,500 / year (2026–2027)', 36500, 'USD', 'year', 'sabanci-fees-2026', null, null);

insert into public.scholarships
  (id, name, amount_value, amount_numeric, currency, amount_period, amount_source_id, amount_unknown_reason, amount_suggested_action, source_id)
values
  ('nu-abay', 'Abay Kunanbayev Scholarship', 'Tuition fee and monthly stipend', null, null, null, 'nu-financial-aid', null, null, 'nu-financial-aid'),
  ('wiut-deans-list', 'Dean’s List discount', '15% tuition discount', 15, null, 'percentage', 'wiut-fees-2026', null, null, 'wiut-fees-2026'),
  ('newuu-merit', 'NewUU merit scholarship', '100%, 70% or 50% tuition coverage', null, null, 'percentage', 'newuu-fees', null, null, 'newuu-scholarship'),
  ('aitu-foreign', 'Scholarship Program for Foreign Citizens', 'Full tuition and monthly allowance', null, null, null, 'aitu-scholarship', null, null, 'aitu-scholarship'),
  ('kbtu-government', 'Kazakhstan government scholarship', 'Full tuition and monthly allowance', null, null, null, 'kbtu-international', null, null, 'kbtu-international'),
  ('debrecen-stipendium', 'Stipendium Hungaricum', null, null, null, null, null, 'The scholarship value depends on the current call and was not captured in the verified records.', 'Review the current Stipendium Hungaricum call.', 'debrecen-scholarship'),
  ('elte-stipendium', 'Stipendium Hungaricum', null, null, null, null, null, 'The scholarship value depends on the current call and was not captured in the verified records.', 'Review the current Stipendium Hungaricum call.', 'elte-funding'),
  ('tartu-reduction', 'Science and Technology tuition reduction', '50% tuition reduction from the second semester', 50, null, 'percentage', 'tartu-scitech-2026', null, null, 'tartu-scitech-2026'),
  ('constructor-scholarship', 'Constructor University scholarship', null, null, null, null, null, 'All applicants are considered, but no single guaranteed award amount is published on the programme page.', 'Review the award in your admission offer.', 'constructor-cs-2026'),
  ('sabanci-waiver', 'Sabancı international tuition waiver', '25%, 40%, 50%, 60% or 75% tuition waiver', null, null, 'percentage', 'sabanci-fees-2026', null, null, 'sabanci-fees-2026');

insert into public.university_scholarships (university_id, scholarship_id, source_id) values
  ('nu', 'nu-abay', 'nu-financial-aid'),
  ('wiut', 'wiut-deans-list', 'wiut-fees-2026'),
  ('newuu', 'newuu-merit', 'newuu-scholarship'),
  ('aitu', 'aitu-foreign', 'aitu-scholarship'),
  ('kbtu', 'kbtu-government', 'kbtu-international'),
  ('debrecen', 'debrecen-stipendium', 'debrecen-scholarship'),
  ('elte', 'elte-stipendium', 'elte-funding'),
  ('tartu', 'tartu-reduction', 'tartu-scitech-2026'),
  ('constructor', 'constructor-scholarship', 'constructor-cs-2026'),
  ('sabanci', 'sabanci-waiver', 'sabanci-fees-2026');

commit;
