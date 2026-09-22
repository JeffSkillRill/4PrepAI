begin;

alter table public.universities
  add column if not exists state text;

alter table public.universities
  drop constraint if exists universities_state_usps_code_check;

alter table public.universities
  add constraint universities_state_usps_code_check
  check (state is null or state ~ '^[A-Z]{2}$');

-- Each array position is the same College Scorecard STABBR value preserved in
-- scripts/top200-ranked.csv for ranks 1 through 200. This deliberately uses
-- the reviewed source-record output, never text parsed from universities.city.
update public.universities as university
set state = scorecard.states[university.rank]
from (
  select array[
    'MA','NJ','CA','PA','PA','MA','NY','CA','CT','NC','RI','NH','NY','IL','PA','CA','CA','CA','IN','TX',
    'TN','MD','IL','MA','CA','MA','DC','MA','VA','ME','MO','MA','CA','GA','PA','MA','CA','MA','NY','MA',
    'MA','CA','NY','GA','VA','NY','ME','CA','PA','PA','MA','MI','VT','NY','PA','NY','NC','NY','MN','OH',
    'CT','CA','NC','CA','PA','CA','PA','TX','MI','VA','CA','MA','NY','NY','NC','CT','NJ','ME','NY','NY',
    'CA','VA','CA','CO','NY','MD','MD','FL','RI','TX','CT','MA','FL','IL','DC','NY','PA','MA','WA','CA',
    'CA','NY','CT','PA','MA','OH','CT','NY','CA','TX','CA','TX','WI','NY','CA','IA','LA','GA','NY','MN',
    'MA','OH','CA','RI','NY','CO','SC','PA','NY','VA','PA','CO','CA','WA','NC','NY','NY','IN','NY','NJ',
    'SC','CT','CA','TX','OR','FL','MA','MN','CA','TX','TN','MA','NY','NY','DC','IL','IL','CA','AL','NY',
    'NY','OH','KY','MA','PA','SC','NY','IN','TX','WI','FL','TX','UT','NY','TN','NJ','OH','MA','CA','CA',
    'SC','VA','MA','RI','CA','PA','OH','NY','IN','CA','TN','NJ','IL','CT','IA','NY','WA','IL','MN','VT'
  ]::text[] as states
) as scorecard
where university.rank_source_id = 'us-4prep-ranking-scorecard-2023'
  and university.rank between 1 and cardinality(scorecard.states);

comment on column public.universities.state is
  'Nullable two-letter USPS code copied from the university source record; College Scorecard imports use STABBR (school.state).';

commit;
