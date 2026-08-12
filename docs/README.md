# 4Prep documentation

Repository layout:

```
4PrepAI/
├─ app/       Student web app (React 19 + Vite) and Supabase migrations/functions
├─ admin/     Operator console — separate Vite deployable
├─ shared/    Code shared between app and admin
└─ docs/      Everything below
```

## Operational docs — read these before changing anything

These are live and must be kept current. `app/CLAUDE.md` links to them by path.

| File | What it is |
|---|---|
| [`DATABASE_STATE.md`](DATABASE_STATE.md) | Launch source of truth: applied migrations, RLS, row counts, blockers. Regenerate after every task that touches the database |
| [`ADMIN.md`](ADMIN.md) | Admin authorization, grant/revoke, deployment, audit, verification runbook |
| [`SUPPORT_CHAT.md`](SUPPORT_CHAT.md) | Support-chat isolation, offline, audit, retention, and deletion checks |
| [`LEARNING_PORTAL.md`](LEARNING_PORTAL.md) | Learning portal schema, storage policies, module structure |
| [`AUTH_SETUP.md`](AUTH_SETUP.md) | Auth providers, redirect URLs, SMTP |
| [`QA_ENVIRONMENT.md`](QA_ENVIRONMENT.md) | The non-production Supabase project and how to use it |
| [`PROJECT_STATUS_REPORT_2026-07-28.md`](PROJECT_STATUS_REPORT_2026-07-28.md) | Status snapshot, 28 July 2026 |

## `audits/` — point-in-time assessments

Historical. Findings may since have been fixed; check the code before acting on one.

| File | What it is |
|---|---|
| [`QA_LAUNCH_AUDIT_2026-08-03.md`](audits/QA_LAUNCH_AUDIT_2026-08-03.md) | Independent launch QA, 3 Aug. Conditional go signed-out, no-go for accounts. F-02/04/06–12 have since been closed |
| [`PROJECT_ANALYSIS_2026-08-05.md`](audits/PROJECT_ANALYSIS_2026-08-05.md) | Full cold read of the repo, 5 Aug, with build/test/lint executed |

## `planning/` — business and product material

Briefs, proposals, and workbooks. Reference material, not operational state.

| File | What it is |
|---|---|
| `4Prep_AI_Roadmap_Brief.docx` | Founder's v1.0 brief — 4 layers, 4 phases, working rules |
| `4Prep_GroundTruth_Project_Proposal.docx` | ~40-page proposal. Proposes a different stack/scope than the code |
| [`4Prep_Hiring-and-Launch-Plan.md`](planning/4Prep_Hiring-and-Launch-Plan.md) | Team, launch and profitability plan, 1 Aug. **Hiring sections superseded** by the 10 Aug list; §1, §5 and the sources still stand |
| [`4Prep_Hiring-List_2026-08-10.md`](planning/4Prep_Hiring-List_2026-08-10.md) | Revised hiring list, 10 Aug. Reordered after the Academy list came in under 50 |
| [`4Prep_Startup-Gap-Plan_2026-08-10.md`](planning/4Prep_Startup-Gap-Plan_2026-08-10.md) | The 8.5-hour day: honest front door, owned handoff, instrumentation, deploy |
| [`4Prep_Frontend-Designer-Brief.md`](planning/4Prep_Frontend-Designer-Brief.md) | Designer scope — mobile at 375px, honest-gap system |
| `4Prep_Data-Researcher-Brief.pdf` | Data researcher scope — 17 sourced records per university |
| `4Prep_Learning-Portal-Concept.pdf` | Learning portal concept note |
| `4Prep_University-Data-Template.xlsx` | Data-entry template for the researcher |
| `4Prep_3-Week-MVP-Plan.xlsx` | 3-week MVP workbook (Jul 27 – Aug 16) |
| `4Prep_3-Month-Plan.xlsx` | 12-week soft-launch workbook (Jul 27 – Oct 18). **Tracker is stale** — 42/45 tasks read "Not started" for work that is done |
| `4Prep_Plan_Notion_Import/` | Master plan, 24 Jul audit, and weekly-plan CSV formatted for Notion import |

## `prompts/` — build history

The codex prompts that produced the current codebase, in order. A frozen record of what was
asked and why scope was cut — useful for understanding a decision, not for re-running.

`codex-design-prompt` (desktop redesign, **never executed**), then `codex-prompt-2` through
`codex-prompt-12`.
