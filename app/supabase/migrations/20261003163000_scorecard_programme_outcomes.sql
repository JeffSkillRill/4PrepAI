-- Promote the four programme outcomes College Scorecard publishes into columns.
--
-- They already live in the earnings/debt jsonb, verbatim. These are generated
-- columns over that same jsonb, so there is no second copy to drift: the payload
-- stays the source of truth and Postgres derives these from it.
--
-- Why columns at all: the catalogue list query embeds programmes for all 204
-- universities at once. Shipping the full earnings and debt objects for 25,935
-- rows would be tens of megabytes per page load. These four integers are what
-- the UI actually renders, and having them as columns also makes "sort by
-- highest earnings" and "lowest debt" cheap later.

alter table public.university_scorecard_programs
  add column if not exists median_earnings_4yr integer
    generated always as (nullif(earnings #>> '{4_yr,overall_median_earnings}', '')::integer) stored,
  add column if not exists median_earnings_4yr_national integer
    generated always as (nullif(earnings #>> '{4_yr,overall_median_earnings_national}', '')::integer) stored,
  add column if not exists median_debt integer
    generated always as (nullif(debt #>> '{staff_grad_plus,all,all_inst,median}', '')::integer) stored,
  add column if not exists median_monthly_payment integer
    generated always as (nullif(debt #>> '{staff_grad_plus,all,all_inst,median_payment}', '')::integer) stored;

comment on column public.university_scorecard_programs.median_earnings_4yr is
  'Median earnings of this programme''s graduates 4 years after completion, at this institution. Scorecard suppresses small cohorts, so null means not reported.';
comment on column public.university_scorecard_programs.median_earnings_4yr_national is
  'Median earnings 4 years after completion for this CIP code and credential level nationally. A benchmark, not this institution''s figure.';
comment on column public.university_scorecard_programs.median_debt is
  'Median federal loan debt at completion (Stafford plus Grad PLUS). Null means not reported, never zero.';
comment on column public.university_scorecard_programs.median_monthly_payment is
  'Median monthly repayment on that debt, as Scorecard reports it.';

create index if not exists university_scorecard_programs_earnings_idx
  on public.university_scorecard_programs (median_earnings_4yr desc nulls last);
create index if not exists university_scorecard_programs_debt_idx
  on public.university_scorecard_programs (median_debt asc nulls last);
