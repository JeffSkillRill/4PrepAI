# 4Prep motion system

Last updated: 7 August 2026 (Asia/Tashkent)

## Principles

Content is readable on first render. Motion only acknowledges an action or explains a user-initiated state change; it never gates content, staggers primary information, or waits for JavaScript before showing a page. Animated properties are transform and opacity, except the existing disclosure pattern that changes `grid-template-rows` between `0fr` and `1fr` as explicitly approved for accessible expansion.

`prefers-reduced-motion: reduce` means no motion. The global CSS block removes all animation and transition, disables smooth scrolling, and removes active-scale feedback. JavaScript-selected View Transitions call `shouldAnimateMotion()` through `runViewTransition()`; when reduction is requested, the screen update happens immediately and `document.startViewTransition` is never called.

## Tokens

| Token | Value | Use |
|---|---:|---|
| `--motion-duration-feedback` | 120 ms | Press, tap, focus-adjacent state feedback |
| `--motion-duration-element` | 200 ms | Disclosure and result resolution |
| `--motion-duration-large` | 300 ms | Maximum for a large transition and skeleton shimmer |
| `--motion-ease-enter` | `cubic-bezier(.2,.8,.2,1)` | Routine transition |
| `--motion-ease-celebrate` | `cubic-bezier(.16,1.18,.3,1)` | Homework-submission celebration only |

## Named motion

- `motion-resolve`: opacity-only result resolution. It may be used for verified counselor facts and stable content replacing a loading state.
- `motion-disclosure`: the existing grid-row expansion for details. The chevron uses transform.
- `motion-progress`: transform-origin progress used by the honest upload indicator.
- `motion-celebrate`: scale and opacity. It remains reserved for successful homework submission; there is exactly one celebration.
- `motion-media`: transform-only media response.
- `counselor-thinking`: three transform/opacity dots beside the accurate “checking sourced records” message. They carry no fake percentage or duration.
- `trust-static`: removes motion from the element and every descendant.

## Static trust states

Refusals, out-of-scope counselor responses, errors, offline messages, honest data gaps, and source chips are static. Source chips appear attached to the resolved answer without an independent animation; provenance is evidence, not decoration. Charts are also intentionally static: no draw-in means their values are readable immediately and the reduced-motion result is identical.

## View and focus behavior

The hand-rolled router uses the View Transitions API only as progressive enhancement. Unsupported browsers and reduced-motion users keep the instant swap. After every view change the page scrolls to the top and focus moves to `#main-content` with `preventScroll`, so keyboard position does not disappear into the old screen.

## Verification

`src/motion/viewTransition.test.ts` proves that the reduced-motion branch performs the update but never calls `startViewTransition`. `src/motion/preference.test.ts` proves the shared media-query gate and SSR fail-closed behavior. Browser verification must additionally emulate reduced motion and inspect animation/transition state on navigation, counselor waiting, disclosures, skeletons, and upload controls.
