-- Interim catalogue guardrails, until the new university dataset replaces the
-- College Scorecard import.
--
-- 1. Public-university cost of attendance becomes an honest unknown.
--    The Scorecard import stored latest.cost.attendance.academic_year as the
--    total cost. For public universities that figure is built on IN-STATE
--    tuition, while the tuition fact beside it is OUT-OF-STATE tuition, which
--    is what international students pay. Example (2023): University of
--    Michigan tuition $60,946, stored total $34,654 (in-state tuition $17,736).
--    Out-of-state tuition is higher at 47 of the 52 public universities, by
--    about $23,000 a year on average; 44 of them carry a Scorecard total, and
--    those 44 rows were understated in the UI, in fit scoring and in the
--    counselor. Only Scorecard-sourced rows where out-of-state tuition exceeds
--    in-state tuition change; hand-sourced rows and private universities keep
--    their values. The Scorecard payload is untouched, so nothing is lost.
--
-- 2. Institutions that cannot serve a 4Prep student leave the public catalogue
--    list. They stay in the database and their profile URLs keep working; they
--    are only excluded from catalogue lists, search and counselor matching.

begin;

update public.university_facts as fact
set value = null,
    numeric_value = null,
    currency = null,
    amount_period = null,
    source_id = null,
    unknown_reason = 'College Scorecard''s published cost of attendance for this public university is based on in-state tuition, so it understates what an international student pays.',
    suggested_action = 'Use the university''s own cost-of-attendance page for out-of-state or international students, or ask its financial aid office for the international budget.'
from public.university_scorecard as scorecard
where fact.university_id = scorecard.university_id
  and fact.kind = 'total_cost_of_attendance'
  and fact.value is not null
  and fact.source_id like 'us-scorecard-%'
  and scorecard.payload #>> '{school,ownership}' = '1'
  and (scorecard.payload #>> '{latest,cost,tuition,out_of_state}')::numeric
    > (scorecard.payload #>> '{latest,cost,tuition,in_state}')::numeric;

alter table public.universities
  add column if not exists listed boolean not null default true;

comment on column public.universities.listed is
  'False hides the university from public catalogue lists, search and counselor matching. Its row and profile URL remain.';

-- Reviewed 2026-10-08. Carnegie "special focus: faith-related" seminaries and
-- yeshivas (39-172 undergraduates), an unclassified institution with 6
-- undergraduates, and an online-only campus that cannot issue an I-20.
-- Yeshiva University (2,852 undergraduates) and Curtis Institute of Music stay.
update public.universities
set listed = false
where id in (
  'baptist-missionary-association-theological-seminary',
  'bais-medrash-elyon',
  'jewish-theological-seminary-of-america',
  'redeemers-university-north-america',
  'university-of-florida-online',
  'yeshiva-of-ocean',
  'yeshiva-ohr-yisrael',
  'yeshiva-zichron-aryeh'
);

commit;
