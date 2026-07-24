# Codex Prompt — 4Prep UI Redesign (Niche.com quality, web platform)

Copy everything below into Codex:

---

You are redesigning the frontend of **4Prep**, a university-pathway platform for international students, located in `app/`. It's React 19 + TypeScript + Vite + Tailwind CSS v4. Everything renders from mock data in `src/mock/sample-data.ts` — keep it that way. **Do NOT push to GitHub, create commits, or touch git at all.** Work on files only. Verify with `npm run dev` and `npm run build`.

## Goal

Convert the current mobile-only UI into a **full desktop web platform** with the polish and feel of **niche.com**: warm, trustworthy, editorial, image-rich. Desktop-first (1280–1440px primary), responsive down to tablet and mobile. This is a visual/UX redesign — do not change the data contract in `src/types/index.ts` or the seven screens' purposes.

## Layout — replace the mobile shell

- **Kill the 375px frame and bottom nav.** Replace with a sticky top navbar: logo left; nav links (Search, Compare, Tools, Saved); a prominent search bar in the header on inner pages; profile/CTA button right. Content in a centered max-width container (~1200px) with generous margins.
- **Search/browse becomes the homepage.** Full-width hero (headline "Find your path abroad", large rounded search input, tappable chips for countries/fields with emoji flags) over a subtle background image or gradient. Below: results as a **responsive card grid (3 columns desktop, 2 tablet, 1 mobile)** with a **left sidebar of filters** on desktop (budget, country, field, language, IELTS, open deadlines) — the existing bottom-sheet filters move into this persistent sidebar; keep a sheet/drawer only on small screens.
- **University profile** becomes a proper page: full-width photo banner with gradient scrim and name/location overlay, then a two-column layout — main content (programs, costs, deadlines, scholarships) left, sticky summary card right (fit badge, key facts, save button). Sticky in-page section tabs like Niche (Overview · Costs · Admissions · Scholarships).
- **Compare** becomes a side-by-side desktop table: universities as columns with photo headers, criteria as rows, sticky header row and first column. Horizontal snap-scroll only below tablet width.
- **Intake** becomes a centered card flow (~640px wide) with a progress bar, one decision per step, an illustrative icon per step.
- **Results** (pathway plan): AI strategy summary at top, ranked university cards in a grid, month-by-month plan as a horizontal timeline on desktop.
- **Tools** and **Saved**: card grids with proper desktop spacing; keep designed empty/logged-out states.

## Design direction (study niche.com's patterns)

1. **Card-first browsing.** University cards get a photo header (16:9), gradient scrim, name + location overlaid, and a prominent grade-style fit badge (like Niche's A+ report-card badges). Rounded-2xl corners, soft shadows, clear hover states (lift + shadow) since this is desktop.
2. **Report-card fit scores.** Style the five-component fit breakdown like Niche's report card: each component gets a letter-style colored badge (green/teal strong, amber medium, red weak), a label, and its one-line reason. Keep the existing rule: fit is never a bare number.
3. **Warm, confident visual language.** Cohesive palette (deep green or indigo primary + warm neutral background like #FAF9F7, not stark white) via Tailwind v4 `@theme` tokens in `src/index.css`. Typography: bold, tight display headings; 16px body; clear hierarchy; 8pt spacing grid.
4. **Images everywhere it helps.**
   - University photos: `https://picsum.photos/seed/{universityId}/800/450` so each fictional university gets a stable, distinct photo. Label "Sample photo" subtly since universities are fictional composites.
   - Country/field chips: emoji flags + simple icons (inline SVG or lucide-react).
   - Empty/error/refusal states: friendly flat inline SVG illustrations instead of plain text.
5. **Polish the details.** Skeleton loaders matching final layouts (test via the dev-state switcher in the amber ribbon: loading/empty/partial/no_results/refusal/error/offline — all states must still look designed at desktop widths). Micro-transitions (150–200ms) on cards, dropdowns, accordions. Visible focus states and keyboard navigability.
6. **Keep the trust system intact — non-negotiable.** `<DataValue>`, `<SourceChip>`, `<MissingValue>`, and the amber SAMPLE-data ribbon must survive the redesign (restyle, don't remove). Every number still carries a source chip; missing data still shows reason + next action; no invented statistics or marketing claims anywhere.

## Constraints

- Desktop-first at 1280–1440px; responsive breakpoints for tablet (768px) and mobile (375px).
- No localStorage/sessionStorage; state stays in React.
- No backend, no auth, no API calls; all content from `src/mock/sample-data.ts`. You may extend the mock data (e.g., add `imageSeed` fields) but every fact stays a `DataPoint<T>`.
- Allowed new deps: lucide-react and one Google Font. Nothing heavier.
- `npm run build` must pass with zero TypeScript errors.

## Deliverable

All seven screens (Intake, Results, University Profile, Search, Compare, Tools, Saved) rebuilt as desktop web pages to the same standard — no screen left in the old mobile style. When done, list what changed per screen in a short summary. Do not commit or push anything.
