insert into public.sources (id, origin, url, retrieved_at, verification) values
  ('sample-university-page', 'Sample university page', null, '2026-07-18', 'unverified_sample'),
  ('sample-city-cost-guide', 'Sample city cost guide', null, '2026-07-18', 'unverified_sample'),
  ('sample-scholarship-page', 'Sample scholarship page', null, '2026-07-18', 'unverified_sample');

insert into public.universities
  (id, name, city, country, flag, tagline, description, photo_seed, highlights, source_id)
values
  ('northbridge', 'Northbridge University (sample)', 'Manchester', 'United Kingdom', '🇬🇧',
   'Career-focused study in a lively student city',
   'A fictional composite university used to demonstrate how 4Prep organizes course, cost, and admissions evidence for international applicants.',
   'northbridge', array['City-centre campus', 'Optional placement year', 'International student support'], 'sample-university-page'),
  ('westhaven', 'Westhaven Institute of Technology (sample)', 'Dublin', 'Ireland', '🇮🇪',
   'Applied technology with an international outlook',
   'A fictional composite institution illustrating a practical, technology-led pathway with transparent evidence gaps.',
   'westhaven', array['Applied project modules', 'Industry mentor scheme', 'Central Dublin location'], 'sample-university-page'),
  ('rheinland', 'Rheinland Applied University (sample)', 'Cologne', 'Germany', '🇩🇪',
   'Practice-led learning in the heart of Europe',
   'A fictional composite applied university showing a lower-tuition route with additional language planning considerations.',
   'rheinland', array['Applied sciences focus', 'Intercultural semester', 'Regional employer projects'], 'sample-university-page'),
  ('maple-coast', 'Maple Coast University (sample)', 'Halifax', 'Canada', '🇨🇦',
   'Supportive learning on Canada’s Atlantic coast',
   'A fictional composite Canadian university used to illustrate a supportive pathway with a higher overall cost profile.',
   'maple-coast', array['First-year advising', 'Co-op option', 'Waterfront student city'], 'sample-university-page'),
  ('southern-crossroads', 'Southern Crossroads College (sample)', 'Melbourne', 'Australia', '🇦🇺',
   'A flexible city-campus route into global careers',
   'A fictional composite college demonstrating an accessible pathway with rolling application guidance.',
   'southern-crossroads', array['Multiple intakes', 'City campus', 'Embedded career workshops'], 'sample-university-page'),
  ('tulip', 'Tulip International University (sample)', 'Rotterdam', 'Netherlands', '🇳🇱',
   'Globally minded study in an entrepreneurial port city',
   'A fictional composite Dutch university illustrating an international classroom and an early application cycle.',
   'tulip', array['International classroom', 'Project-based learning', 'Startup community'], 'sample-university-page');

insert into public.university_facts
  (university_id, kind, value, numeric_value, currency, source_id, unknown_reason, suggested_action)
values
  ('northbridge','tuition','£18,900 / year',18900,'GBP','sample-university-page',null,null),
  ('northbridge','living_cost','£10,200–£12,400 / year',10200,'GBP','sample-city-cost-guide',null,null),
  ('northbridge','application_fee','No fee shown',0,'GBP','sample-university-page',null,null),
  ('northbridge','deadline','30 June 2027',null,null,'sample-university-page',null,null),
  ('northbridge','scholarship','Up to £3,000',3000,'GBP','sample-scholarship-page',null,null),
  ('northbridge','language','English',null,null,'sample-university-page',null,null),
  ('northbridge','intake','September 2027',null,null,'sample-university-page',null,null),
  ('westhaven','tuition','€16,500 / year',16500,'EUR','sample-university-page',null,null),
  ('westhaven','living_cost','€12,000–€15,000 / year',12000,'EUR','sample-city-cost-guide',null,null),
  ('westhaven','application_fee','€45',45,'EUR','sample-university-page',null,null),
  ('westhaven','deadline','1 May 2027',null,null,'sample-university-page',null,null),
  ('westhaven','scholarship',null,null,null,null,'The award amount is not published in the sample.','Ask admissions for the current international award list.'),
  ('westhaven','language','English',null,null,'sample-university-page',null,null),
  ('westhaven','intake','September 2027',null,null,'sample-university-page',null,null),
  ('rheinland','tuition','€3,200 / semester',3200,'EUR','sample-university-page',null,null),
  ('rheinland','living_cost','€11,400–€13,200 / year',11400,'EUR','sample-city-cost-guide',null,null),
  ('rheinland','application_fee','€75',75,'EUR','sample-university-page',null,null),
  ('rheinland','deadline','15 July 2027',null,null,'sample-university-page',null,null),
  ('rheinland','scholarship',null,null,null,null,'No institution award is listed in the sample.','Check DAAD and the university funding page.'),
  ('rheinland','language','English + some German',null,null,'sample-university-page',null,null),
  ('rheinland','intake','October 2027',null,null,'sample-university-page',null,null),
  ('maple-coast','tuition','CA$24,800 / year',24800,'CAD','sample-university-page',null,null),
  ('maple-coast','living_cost','CA$14,000–CA$17,000 / year',14000,'CAD','sample-city-cost-guide',null,null),
  ('maple-coast','application_fee','CA$110',110,'CAD','sample-university-page',null,null),
  ('maple-coast','deadline','1 February 2027',null,null,'sample-university-page',null,null),
  ('maple-coast','scholarship','CA$2,500 entrance award',2500,'CAD','sample-scholarship-page',null,null),
  ('maple-coast','language','English',null,null,'sample-university-page',null,null),
  ('maple-coast','intake','September 2027',null,null,'sample-university-page',null,null),
  ('southern-crossroads','tuition','A$27,600 / year',27600,'AUD','sample-university-page',null,null),
  ('southern-crossroads','living_cost','A$18,000–A$22,000 / year',18000,'AUD','sample-city-cost-guide',null,null),
  ('southern-crossroads','application_fee','A$80',80,'AUD','sample-university-page',null,null),
  ('southern-crossroads','deadline','Rolling; apply early',null,null,'sample-university-page',null,null),
  ('southern-crossroads','scholarship','10% tuition reduction',10,null,'sample-scholarship-page',null,null),
  ('southern-crossroads','language','English',null,null,'sample-university-page',null,null),
  ('southern-crossroads','intake','February 2027',null,null,'sample-university-page',null,null),
  ('tulip','tuition','€12,800 / year',12800,'EUR','sample-university-page',null,null),
  ('tulip','living_cost','€12,600–€15,000 / year',12600,'EUR','sample-city-cost-guide',null,null),
  ('tulip','application_fee','€100',100,'EUR','sample-university-page',null,null),
  ('tulip','deadline','15 January 2027',null,null,'sample-university-page',null,null),
  ('tulip','scholarship','€2,000 first-year award',2000,'EUR','sample-scholarship-page',null,null),
  ('tulip','language','English',null,null,'sample-university-page',null,null),
  ('tulip','intake','September 2027',null,null,'sample-university-page',null,null);

insert into public.requirements (university_id, kind, value, numeric_value, source_id) values
  ('northbridge','ielts','6.0 overall',6.0,'sample-university-page'),
  ('westhaven','ielts','6.0 overall',6.0,'sample-university-page'),
  ('rheinland','ielts','6.5 overall',6.5,'sample-university-page'),
  ('maple-coast','ielts','6.5 overall',6.5,'sample-university-page'),
  ('southern-crossroads','ielts','6.0 overall',6.0,'sample-university-page'),
  ('tulip','ielts','6.5 overall',6.5,'sample-university-page');

insert into public.programs (id, university_id, name, degree, field, source_id) values
  ('northbridge-cs','northbridge','Computer Science','BSc (Hons)','Computer Science','sample-university-page'),
  ('northbridge-ba','northbridge','Business Analytics','BSc (Hons)','Data & Analytics','sample-university-page'),
  ('westhaven-se','westhaven','Software Engineering','BEng','Computer Science','sample-university-page'),
  ('westhaven-db','westhaven','Digital Business','BSc','Business & Management','sample-university-page'),
  ('rheinland-iis','rheinland','International Information Systems','BSc','Computer Science','sample-university-page'),
  ('rheinland-se','rheinland','Sustainable Engineering','BEng','Engineering','sample-university-page'),
  ('maple-ds','maple-coast','Data Science','BSc','Data & Analytics','sample-university-page'),
  ('maple-im','maple-coast','International Management','BCom','Business & Management','sample-university-page'),
  ('southern-it','southern-crossroads','Information Technology','Bachelor','Computer Science','sample-university-page'),
  ('southern-commerce','southern-crossroads','Commerce','Bachelor','Business & Management','sample-university-page'),
  ('tulip-ib','tulip','International Business','BSc','Business & Management','sample-university-page'),
  ('tulip-ed','tulip','Economics & Data','BSc','Data & Analytics','sample-university-page');

insert into public.program_facts (program_id, kind, value, numeric_value, currency, source_id) values
  ('northbridge-cs','duration','3 years',3,null,'sample-university-page'),
  ('northbridge-cs','tuition','£18,900 / year',18900,'GBP','sample-university-page'),
  ('northbridge-ba','duration','3 years',3,null,'sample-university-page'),
  ('northbridge-ba','tuition','£18,400 / year',18400,'GBP','sample-university-page'),
  ('westhaven-se','duration','4 years',4,null,'sample-university-page'),
  ('westhaven-se','tuition','€16,500 / year',16500,'EUR','sample-university-page'),
  ('westhaven-db','duration','3 years',3,null,'sample-university-page'),
  ('westhaven-db','tuition','€15,900 / year',15900,'EUR','sample-university-page'),
  ('rheinland-iis','duration','3.5 years',3.5,null,'sample-university-page'),
  ('rheinland-iis','tuition','€3,200 / semester',3200,'EUR','sample-university-page'),
  ('rheinland-se','duration','3.5 years',3.5,null,'sample-university-page'),
  ('rheinland-se','tuition','€3,200 / semester',3200,'EUR','sample-university-page'),
  ('maple-ds','duration','4 years',4,null,'sample-university-page'),
  ('maple-ds','tuition','CA$24,800 / year',24800,'CAD','sample-university-page'),
  ('maple-im','duration','4 years',4,null,'sample-university-page'),
  ('maple-im','tuition','CA$23,900 / year',23900,'CAD','sample-university-page'),
  ('southern-it','duration','3 years',3,null,'sample-university-page'),
  ('southern-it','tuition','A$27,600 / year',27600,'AUD','sample-university-page'),
  ('southern-commerce','duration','3 years',3,null,'sample-university-page'),
  ('southern-commerce','tuition','A$26,900 / year',26900,'AUD','sample-university-page'),
  ('tulip-ib','duration','3 years',3,null,'sample-university-page'),
  ('tulip-ib','tuition','€12,800 / year',12800,'EUR','sample-university-page'),
  ('tulip-ed','duration','3 years',3,null,'sample-university-page'),
  ('tulip-ed','tuition','€13,200 / year',13200,'EUR','sample-university-page');

insert into public.scholarships
  (id, name, amount_value, amount_numeric, currency, amount_source_id, source_id)
values
  ('northbridge-award','Northbridge international award (sample)','Up to £3,000',3000,'GBP','sample-scholarship-page','sample-scholarship-page'),
  ('maple-entrance','Maple Coast entrance award (sample)','CA$2,500 entrance award',2500,'CAD','sample-scholarship-page','sample-scholarship-page'),
  ('southern-reduction','Southern Crossroads tuition reduction (sample)','10% tuition reduction',10,null,'sample-scholarship-page','sample-scholarship-page'),
  ('tulip-award','Tulip first-year award (sample)','€2,000 first-year award',2000,'EUR','sample-scholarship-page','sample-scholarship-page');

insert into public.university_scholarships (university_id, scholarship_id) values
  ('northbridge','northbridge-award'),
  ('maple-coast','maple-entrance'),
  ('southern-crossroads','southern-reduction'),
  ('tulip','tulip-award');
