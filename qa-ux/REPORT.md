# 4Prep UX information-load stress audit

Audit date: 2026-09-02. Scope: a fresh signed-out browser context against local Vite at `127.0.0.1:5174`, plus source review. Screenshots are in [`screens/`](screens/). No app code or copy was changed.

## Verdict

Yes: 4Prep is overloaded in the places where a newcomer needs to decide what to do next. The worst offender is not a single paragraph: it is the default-open counselor panel, which competes with and, at 390px, physically covers the intake, sign-in, dashboard, profile, and Learning Portal. The next-largest load is the university profile, where the same missing-fit and data-gap idea appears in several components before the student reaches the one action that matters. The single biggest lever is to make the counselor a collapsed launcher by default on task-focused routes (intake, auth, dashboard, profile, and Learning); then give each page one primary next action and move repeated evidence/disclaimer detail behind the existing expanders.

## Top 5 things to cut or hide

1. **Default-open counselor panel** — all screens, especially mobile — it overlays the task and creates a second, unrelated primary action; launch it collapsed and expand only on the Counselor route or on request. **P0**
2. **Duplicate “no profile / fit unavailable” blocks** — university profile — the same explanation appears before the content, inside the fit report, and in the sticky sidebar; retain one calm fit card with one intake link. **P0**
3. **Ten locked module cards with ten “Preview with warning” buttons** — Learning Portal — they turn a simple “start Module 0” choice into an 11-way menu; show the next module and collapse later modules into a count/list. **P0**
4. **Three equal first-time dashboard task cards plus progress widgets** — empty authenticated dashboard — they ask a new user to self-prioritize; retain the computed next action and defer the other two steps below it. **P0**
5. **Per-field unknown explanations in addition to a gap cluster** — university profile — the user reads both the aggregate warning and repeated reason/action mini-essays; keep the cluster as the single explanation and expose individual evidence only when a field is opened. **P1**

## Method and evidence boundary

- Captured six routes at **390×844** and **1440×1000** in fresh, signed-out Chrome. All 12 screenshots loaded with no browser console/page errors and no horizontal overflow (`scrollWidth === clientWidth` at both widths).
- Tested routes: `/universities`, `/intake`, `/dashboard`, `/universities/harvard`, `/learn`, and `/login`.
- The signed-out dashboard is a real rendered state. The authenticated dashboard and its true new-account empty state were reviewed from code, not fabricated with a production sign-in: [`DashboardScreen.tsx:127-148`](../app/src/screens/DashboardScreen.tsx#L127) and [`DashboardScreen.tsx:322-359`](../app/src/screens/DashboardScreen.tsx#L322). No real account was created or changed.
- The local development-only Production-target safety banner is visible in every capture. It does not ship in a production build (`EnvironmentBanner` exits when `!import.meta.env.DEV`), so it is reported as test-environment clutter rather than a production UX finding. The counselor overlay **does** ship as normal UI and is a product finding.
- “Words” below are rough rendered-body counts, not accessibility labels or hidden text. “Blocks” count visible top-level cards/panels/callouts before scroll; header/footer/navigation are listed separately as actions rather than inflated into content blocks.

## Cross-screen finding: the counselor steals focus

**P0 — default-open counselor panel**

Screenshot evidence: it is visible in every file under [`screens/`](screens/), including [`mobile-390-intake.png`](screens/mobile-390-intake.png), [`mobile-390-dashboard.png`](screens/mobile-390-dashboard.png), [`mobile-390-profile.png`](screens/mobile-390-profile.png), and [`mobile-390-auth.png`](screens/mobile-390-auth.png). At 390px it spans almost the full width, covers the lower half of the intake/auth/dashboard card, and sits above the primary task. On desktop it still takes over the right side of profile, learning, and auth.

The implementation deliberately opens it on mount and fixes it at `z-50`: [`CounselorWidget.tsx:8-10`](../app/src/components/CounselorWidget.tsx#L8), [`CounselorWidget.tsx:26-27`](../app/src/components/CounselorWidget.tsx#L26). Its header offers “Open chat”, close, a question field, send, and “Hide counselor” in addition to the host page’s actions.

Why this hurts: it makes “ask a counselor” visually equal to “continue your intake”, “sign in”, “open module”, or “save university”. A first-time user must dismiss an unrelated product feature to see or use their current task.

Fix: default to the small launcher on task routes; preserve the full open panel on `/counselor` and when deliberately opened. Do not remove counselor access or its sourced-answer commitments.

## Per-screen findings

### 1. University search

Screenshots: [`mobile-390-search.png`](screens/mobile-390-search.png) · [`desktop-1440-search.png`](screens/desktop-1440-search.png)

| Measure | 390px | 1440px |
| --- | ---: | ---: |
| Rendered words, whole page | 936 | 1,006 |
| Visible content blocks before scroll | 3 | 5 |
| Longest paragraph | 15 words | 35 words |
| Explicit caveat phrases found | 0 exact matches | 0 exact matches |
| Horizontal overflow / browser errors | none / none | none / none |

The first visual task is reasonably clear: search by name. But desktop presents the hero/search field, a full filter card, “Kept visible on purpose” callout, and two dense result cards before a user has chosen one university. Header actions (University List, Admission, Sign in, Build my plan), card actions (Cost details, Explore university), and the counselor create several competing paths. Mobile hides filters behind one button, which is better, but the fixed counselor still dominates the first result.

The 35-word “Budget meaning” paragraph is documentation-style explanation in [`SearchScreen.tsx:35-45`](../app/src/screens/SearchScreen.tsx#L35); the unknown-cost callout appears separately in [`SearchScreen.tsx:131`](../app/src/screens/SearchScreen.tsx#L131). Both are honest, but a first-time searcher does not need both before selecting a school.

**P1 — defer filtering rationale.** Keep the unknown-cost status and the filters. Move “Budget meaning” behind an info toggle beside the budget control, and make the unknown-cost callout a one-line count with “Why?” disclosure. Preserve the fact that non-computable costs remain visible.

**P2 — reduce result-card competing actions.** Make the card itself or “Explore university” the only primary target; place “Cost details” inside the profile. This reduces action scanning without concealing evidence.

**Edge stress:** current long content does not overflow at either viewport. Long university names were not injected into live data; code review should add an explicit long-name visual fixture before claiming that path is proven.

### 2. Intake: Build my plan

Screenshots: [`mobile-390-intake.png`](screens/mobile-390-intake.png) · [`desktop-1440-intake.png`](screens/desktop-1440-intake.png)

| Measure | 390px | 1440px |
| --- | ---: | ---: |
| Rendered words, step 1 | 103 | 111 |
| Visible content blocks before scroll | 1 | 1 |
| Longest paragraph | 15 words | 15 words |
| Explicit caveat phrases found | 0 | 0 |
| Main task actions | destination choice, Continue | destination choice, Continue |

This is the clearest screen in the audit: one question, one selected answer, one Continue button, and an eight-step progress cue. The actual flow is one question per step in [`FlowScreens.tsx:81-100`](../app/src/screens/FlowScreens.tsx#L81), with eight scoped questions in [`intake/definition.ts:97-105`](../app/src/intake/definition.ts#L97). Do not turn this into a long form.

**P0 — remove the competing overlay here.** At 390px the counselor covers the selected option and Continue region in the captured screen. The task itself needs no content cut; the fix is the global collapsed-counselor rule.

**P2 — combine the two progress labels.** “Build your pathway”, “Step 1 of 8”, and the progress bar all express progress. Keep the bar plus “Step 1 of 8”; make the heading a quieter label or remove it. This is a small reduction, not a core problem.

### 3. Dashboard

Screenshots: [`mobile-390-dashboard.png`](screens/mobile-390-dashboard.png) · [`desktop-1440-dashboard.png`](screens/desktop-1440-dashboard.png). These are the real signed-out state.

| Measure | 390px | 1440px |
| --- | ---: | ---: |
| Rendered words, signed-out state | 102 | 110 |
| Visible content blocks before scroll | 1 | 1 |
| Longest paragraph | 26 words | 26 words |
| Explicit caveat phrases found | 0 | 0 |
| Main task actions | Sign in; Browse without signing in | Sign in; Browse without signing in |

The signed-out state is not text-heavy, but it offers two equal visual buttons. “Sign in” is the likely next step for a dashboard visitor; “Browse without signing in” is useful but should be a lower-weight text link. At 390px the open counselor hides the button region, making this an active task failure.

The bigger load appears in the authenticated first-time branch. `DashboardEmpty` renders a hero plus three equal numbered cards and, when the track is present, a fourth learning-progress card containing three chart/timeline components ([`DashboardScreen.tsx:338-357`](../app/src/screens/DashboardScreen.tsx#L338)). The normal signed-in dashboard adds a hero/next-action card, stage card, study-goal card, saved-plans card, and learning card before their internal charts ([`DashboardScreen.tsx:202-315`](../app/src/screens/DashboardScreen.tsx#L202)). That is a lot of status interpretation immediately after the app has already computed `NextAction`.

The same idea is repeated: the hero says recorded actions are not a grade/prediction ([`DashboardScreen.tsx:208-210`](../app/src/screens/DashboardScreen.tsx#L208)); the stage card repeats that actions are not chances of admission ([`DashboardScreen.tsx:228-230`](../app/src/screens/DashboardScreen.tsx#L228)); `JourneyPositionChart` adds “This is not a score” to its accessible label ([`ProgressCharts.tsx:225`](../app/src/dashboard/ProgressCharts.tsx#L225)). Keep one calm sentence in the hero; the chart’s accessible description can remain for non-visual clarity without adding another visible banner.

**P0 — make “Next recorded action” the empty dashboard.** Show the single computed next action and one short reason. Put “review evidence” and “course” in a later “More ways to continue” disclosure; defer charts until there is recorded activity.

**P1 — consolidate caveats.** Keep the hero sentence once, in sentence case. Do not delete the no-prediction commitment; remove/rewrite the duplicate visible stage sentence.

### 4. University profile (Harvard with real missing fields)

Screenshots: [`mobile-390-profile.png`](screens/mobile-390-profile.png) · [`desktop-1440-profile.png`](screens/desktop-1440-profile.png)

| Measure | 390px | 1440px |
| --- | ---: | ---: |
| Rendered words, whole page | 623 | 749 |
| Visible content blocks before scroll | 1 hero, then stacked evidence cards | 3 major blocks plus sticky sidebar |
| Longest paragraph | 30 words | 30 words |
| Explicit caveat phrases found | 1 (“not guaranteed”) | 1 (“not guaranteed”) |
| First-page actions | 4 section tabs; counselor | 4 section tabs; Save university; counselor |

This is the most overloaded content page. Before a profile exists, the same “fit unavailable” fact appears in three places: the top `MissingValue`, the “4Prep fit report” inside Overview, and “Your route here” in the sidebar. The implementation is visible at [`ProfileScreen.tsx:42-50`](../app/src/screens/ProfileScreen.tsx#L42), [`ProfileScreen.tsx:73`](../app/src/screens/ProfileScreen.tsx#L73), and [`ProfileScreen.tsx:110`](../app/src/screens/ProfileScreen.tsx#L110). None adds a new action or decision.

The profile also puts a collapsed aggregate “published-data coverage” cluster ahead of the content, then renders individual field-level `MissingValue` cards in the admissions grid. The cluster is the right consolidation mechanism ([`Trust.tsx:94-135`](../app/src/components/Trust.tsx#L94)); the per-field fallback component carries a reason and suggested action each time ([`Trust.tsx:50-85`](../app/src/components/Trust.tsx#L50)). On mobile, the result is a long wall of small cards, sources, and “not published” explanations. The screenshot is 6,890px tall at 390px.

There is additional duplication in the cost/funding explanation: the Costs section says the displayed net figure does not assume receipt ([`ProfileScreen.tsx:88-93`](../app/src/screens/ProfileScreen.tsx#L88)), while Scholarships says awards are not guaranteed and lists three confirmation actions ([`ProfileScreen.tsx:106`](../app/src/screens/ProfileScreen.tsx#L106)). This is the same caution at two nearby stops.

**P0 — one fit state, one location.** Before intake, retain the top “Complete intake to see fit” card; remove the two downstream duplicates. After intake, retain one collapsed `ExpandableFit`; show full five-component detail only when opened.

**P1 — make evidence progressive.** Keep the top-level coverage count and the individual values. Put each unknown reason/action behind “Why unavailable?” within its field, and do not repeat the cluster explanation beside every field. Keep source chips and unknown status visible; do not replace gaps with blank cells or invented values.

**P1 — merge funding caveats.** Put the single calm statement “Published aid is not your personal offer; confirm eligibility and ask for an offer” beside the net-cost scenario. The Scholarship section can link to it rather than repeat it.

**Edge stress:** the rendered Harvard profile is a real missing-data case and shows the text pile-up. No horizontal overflow appeared. `DataValue` uses `break-words` ([`Trust.tsx:77-85`](../app/src/components/Trust.tsx#L77)); very long university names still need a deliberate browser fixture.

### 5. Learning Portal

Screenshots: [`mobile-390-learning.png`](screens/mobile-390-learning.png) · [`desktop-1440-learning.png`](screens/desktop-1440-learning.png)

| Measure | 390px | 1440px |
| --- | ---: | ---: |
| Rendered words, whole page | 382 | 390 |
| Visible content blocks before scroll | 2 | 2 |
| Longest module summary | 23 words | 23 words |
| Explicit caveat phrases found | 0 | 0 |
| Repeated choice count | 10 locked previews | 10 locked previews |

The top section is good: title, a single “Continue where you left off” action, and a concise sign-in explanation. The overload starts immediately below it: all 11 modules are fully expanded as cards; ten are locked but each has the same “Preview with warning” button. The component maps every module into a card with a summary, status, and action at [`LearningScreens.tsx:245-271`](../app/src/screens/LearningScreens.tsx#L245). On mobile that is 3,790px of repeated, largely unavailable choices; the default counselor covers the first locked card and its action.

“Locked” appears ten times and “Preview with warning” appears ten times. That is not an honesty disclaimer, but it creates the same cognitive effect: repeated friction text rather than a single clear next step.

**P0 — disclose future modules progressively.** Keep Module 0 and the computed continue module as cards. Replace the rest with a compact “10 later modules” list or accordion showing title/status only; open a module only after the user asks to preview. Preserve the sequence warning when they choose a later module (`SequenceGate` at [`LearningScreens.tsx:280-297`](../app/src/screens/LearningScreens.tsx#L280)).

**P2 — trim card summaries in the initial list.** One line per module is enough. Keep full summaries on the module screen.

### 6. Auth / registration

Screenshots: [`mobile-390-auth.png`](screens/mobile-390-auth.png) · [`desktop-1440-auth.png`](screens/desktop-1440-auth.png)

| Measure | 390px | 1440px |
| --- | ---: | ---: |
| Rendered words, sign-in state | 105 | 113 |
| Visible content blocks before scroll | 1 | 1 |
| Longest visible paragraph | 15 words | 15 words |
| Explicit caveat phrases found | 0 | 0 |
| Main actions | Google, email sign-in, create account | Google, email sign-in, create account |

The sign-in card is conventional and not inherently overloaded. Google and email sign-in are legitimate alternatives, and the privacy consent is necessary. The default-open counselor is again the problem: on mobile it covers the lower form and creates another question field; on desktop it steals the empty right side that could otherwise keep the form calm.

Registration mode adds display name, optional avatar, email, password, and consent in one first-pass form ([`AuthPrivacyScreens.tsx:593-667`](../app/src/screens/AuthPrivacyScreens.tsx#L593)). The optional avatar is low-value before a student has saved anything; it adds a choice, explanation, error path, and storage expectation at the moment the user is trying to create an account.

**P0 — collapse counselor here.** It should not compete with consent and credential entry.

**P1 — defer optional avatar to account settings.** Keep display name if it is required for identity. Offer photo upload after account creation in the existing Profile area rather than during registration. This does not weaken privacy consent or account ownership.

## Caveat and honesty policy

The right response is **not** to remove the honesty contract. The app correctly exposes source chips, unknown published figures, and the fact that fit is guidance. The problem is placement and repetition:

- `HonestGapCluster` is the preferred pattern: one aggregated “what is missing” statement with optional detail ([`Trust.tsx:94-135`](../app/src/components/Trust.tsx#L94)). Use it instead of repeating a mini-essay in every tile.
- `ExpandableFit` is the right pattern for five scoring reasons ([`Trust.tsx:181-201`](../app/src/components/Trust.tsx#L181)). Keep the detailed components behind it; do not repeat “fit unavailable” in three locations.
- Use one visible, plain-sentence caveat per screen: e.g. “This is guidance based on recorded information, not an admission prediction.” Do not use all-caps warning banners for normal uncertainty.
- Keep source chips and “Not published” visible at the point of a fact. Do not hide unknown status, convert it to an empty cell, or replace it with a guessed value merely to make the page shorter.

## Keep this

- **One-question intake** is the best information-density decision in the product. It has a real next action and should remain one step at a time.
- **The Learning Portal’s top card** clearly states the course, the next module, and how sign-in affects saving. Keep that hierarchy; reduce the catalogue below it.
- **The aggregate published-data coverage expander** is a strong honest-empty-state pattern. Consolidate toward it rather than deleting data gaps.
- **Source-backed values and source chips** are useful evidence, not ornamental density. Trim duplicated explanation around them, not the evidence itself.
- **Signed-out dashboard copy** is appropriately short. Make its Sign in action primary and preserve browse access as secondary.

## Prioritized P0 implementation queue

1. **Counselor:** default `CounselorWidget` closed on intake, auth, dashboard, profile, and Learning Portal at both widths; retain the launcher and full Counselor page. Verify the primary CTA is not covered at 390px.
2. **Profile:** render exactly one pre-intake fit-state component. Remove the redundant Overview and sidebar `MissingValue` variants; regression-test one intake CTA and one fit explainer.
3. **Learning:** render only the next available module card and a collapsed later-module list by default. Keep explicit sequence warning after the user opens a later module; verify no loss of locked-state honesty.
4. **Dashboard:** in `DashboardEmpty`, lead with the computed/first next action and defer the other two cards plus zero-progress visualizations. In the signed-in dashboard, remove the duplicate visible no-prediction sentence while keeping one calm statement and the accessible chart label.
5. **Mobile regression:** retake 390px screenshots of intake, login, signed-out dashboard, profile, and learning. Pass only if the launcher never overlaps a host page’s primary CTA, text is not obscured, and `scrollWidth === clientWidth`.
