# Student dashboard and truthful visualisations

Last updated: 7 August 2026 (Asia/Tashkent)

## Purpose and navigation

The dashboard is the signed-in student’s return point for recorded work: intake, saved universities, lesson progress, homework submissions, and the next action supported by those records. It remains one of six primary navigation items rather than being appended as a seventh. Signed-in visits to `/` land on `/dashboard`; `pendingAuth` still wins when authentication began from a university or Learning Portal destination.

The empty state remains the primary design. It explains that no metrics are available, supplies three useful starting routes, and renders the real module structure with zero completed actions while keeping locked modules visually distinct. Partial and unavailable states never substitute zero for records that could not be loaded.

## Chart implementation decision

Hand-rolled inline SVG and semantic HTML won. An isolated Vite 7 production build of `uPlot@1.6.32` with its required CSS measured 53.12 kB minified JavaScript plus 1.65 kB CSS, or 24.42 kB gzip combined, before a React wrapper or the accessibility/touch layer this product would still need. The hand-rolled path has no runtime dependency, uses token colors and visible values directly, has no mouse tooltip or default animation to fight, and the complete modernization increased application JavaScript by 17.65 kB raw and CSS by 3.08 kB raw (4.58 kB gzip combined) across charts and all other requested surface work.

## Implemented visualisations and exact sources

1. **Learning module map.** `getLearningUserState()` reads `learning_progress.lesson_id`; `deriveLearningModuleStates()` combines those IDs with the real modules and sequential submission gate. Each cell reports completed lesson count, real lesson denominator, and `locked`, `available`, `lessons_in_progress`, or `homework_submitted`; locked never means incomplete.
2. **Homework state.** `learning_submissions.submitted_at` supplies the submitted total. A submitted record with no non-empty `feedback_ref` is counted as awaiting feedback; a submitted record with a non-empty `feedback_ref` is counted as feedback received. The values are labelled, not inferred from color.
3. **Five-stage journey position.** `shared/dashboard-stage.ts` remains the only stage model. The diagram renders the current position among `not_started`, `planning`, `learning`, `homework_submitted`, and `feedback_received`; it explicitly says “not a score.”
4. **Recorded-event timeline.** `learning_progress.completed_at` and `learning_submissions.submitted_at` are returned by the repository and rendered as discrete chronological events. There is no connecting line, interpolation, forecast, or inferred cadence.
5. **Five Φ components.** `FitBreakdown` renders the existing deterministic academic, financial, language, career, and geographic component scores. The visible reason remains beside every component, the screen-reader table repeats every reason, and the overall fit is never presented without the expandable five-part explanation. AI is not involved.
6. **Cost composition.** Tuition, mandatory fees, and room/board use only known `DataPoint` numeric metadata normalized by the existing `annualAmount()` period rules. Bars share a scale only when currencies match; unknown or nonnumeric components become a labelled gap rather than zero, and every plotted row keeps its `SourceChip`.
7. **Saved-university aid-adjusted comparison.** Saved plans are preferred on `/compare`; when none exist, the current three catalogue examples remain. Only numeric `bestPublishedCostScenario()` values in one currency are plotted; individual full-need policies, comprehensive funding, missing numeric values, and currency mismatches stay visibly uncharted with reasons.

Every visualisation has a visible text label, keyboard-focusable chart region, an `aria-label` with actual values, and a visually hidden table. Values are available without hover, so touch and keyboard users do not need a tooltip.

## Deliberately refused charts

- No acceptance likelihood, admission prediction, readiness score, “on track,” “behind,” or performance grade.
- No projected line, interpolated point, synthetic daily/weekly zero, or flattering axis.
- No feedback-arrival timeline: the schema records `feedback_ref` but not a feedback-received timestamp.
- No connected learning trend line: real completion/submission timestamps support discrete events, not a continuous trend between them.
- No deadline countdown because it would imply a personalized plan and current deadline certainty that the dashboard does not hold.
- No counselor-usage score; operational request history is not student progress.
- No bar for a missing cost component, and no saved-university cost bar when currencies or published scenarios are not comparable.
- No chart before private records load successfully; the unavailable state says that the value could not be checked.

## Schema and live-read verification

The configured Production anonymous read on 7 August 2026 returned 1 learning track, 11 modules, and 11 lessons. Anonymous reads of `learning_progress` and `learning_submissions` returned PostgreSQL `42501 permission denied`, which is the correct privacy boundary. Their selected columns and timestamp contracts were verified against `app/supabase/migrations/202607310009_learning_portal.sql` and `app/src/data/repository.ts`; live user-row values remain unverified without a disposable signed-in account.

## Loading and future data

The dashboard skeleton now reserves the real chart card footprint. When genuine additional events exist, the discrete timeline grows with them. A feedback-received event may be added only after the database records an actual received timestamp; outcome visualisations remain out of scope regardless of future usage volume.
