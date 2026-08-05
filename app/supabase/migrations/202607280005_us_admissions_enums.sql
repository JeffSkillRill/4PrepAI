-- PostgreSQL enum values must be committed before a later transaction can use
-- them. Keep this migration separate from the US catalogue seed.
alter type public.requirement_kind add value if not exists 'toefl';
alter type public.requirement_kind add value if not exists 'duolingo';
alter type public.requirement_kind add value if not exists 'sat';
alter type public.requirement_kind add value if not exists 'act';
alter type public.requirement_kind add value if not exists 'gpa';

alter type public.university_fact_kind add value if not exists 'room_board';
alter type public.university_fact_kind add value if not exists 'fees';
alter type public.university_fact_kind add value if not exists 'total_cost_of_attendance';
alter type public.university_fact_kind add value if not exists 'aid_international';
alter type public.university_fact_kind add value if not exists 'test_policy';
alter type public.university_fact_kind add value if not exists 'financial_certification';
