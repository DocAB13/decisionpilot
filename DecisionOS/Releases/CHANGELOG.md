# DecisionOS Changelog

## IR01-071 — Recommendation Screen

**Type:** Feature (new screen)

**Summary:** Built the Recommendation Screen per H08 §9 and H03 component 7 — the AI's output view for a Decision in the `waiting_for_user` state.

**Changes:**
- Added `features/decision-wizard/RecommendationView.tsx` + `RecommendationView.module.css`, wired into the `waiting_for_user` branch of `pages/decision/[id].tsx` (replacing the IR01-069/070 placeholder).
- Recommendation Block: winning alternative as the visual hero (`text-2xl`/`font-black`), primary reasoning, honest trade-offs, "what would change this," and a confidence indicator dot per H11 §11.4 (no dot for high confidence, a dot for medium/low, plus the calibrated information-request sentence for each).
- Alternatives analysis: one `Card` per alternative with "Works for you" / "Worth noting" / "Watch out for" sections (pros/cons/risks from components 5 and 6), recommended alternative first with a "Recommended" badge.
- Handles the edge cases in the Recommendation Contract: a genuine tie (`tie_detected`) and the "all alternatives violate hard constraints" case (`recommended_alternative_id: null`).
- `recommendation_available: false` partial-success state: shows the saved per-alternative analysis with a "Try again" action, without inventing a new retry endpoint (H13 §3.4 notes Recommendation-only retry is post-MVP).
- Chat entry point ("Explore with AI" desktop / "Ask AI a question" mobile), gated on plan via the existing `useSubscription` hook, matching the Free-plan upgrade pattern already used in `History.tsx`.
- "Record My Decision" is pinned above the mobile bottom nav (`position: fixed; bottom: 56px`) so it's visible without scrolling; inline after the alternatives list on desktop.
- Added typed shapes for the AI-generated components — `AIAnalysisContent`, `RisksContent`, `RecommendationContent`, `AnalysisProCon`, `AnalysisRisk`, `ConstraintCompliance` — to `core/decision/Decision.types.ts`, since components 5/6/7 had no type definitions yet.

**Deferred (intentionally, by design):** `onRecordDecision` and `onRetryRecommendation` are optional callback props with no wiring yet. `onRecordDecision` will be wired by IR01-072 (Final Decision capture + `decision_made` transition). `onRetryRecommendation` has no backend endpoint to call yet — Recommendation-only retry is explicitly post-MVP per H13 §3.4.

**Verification:** `npx tsc --noEmit`, `npx next build`, and `npx vitest run` (153 tests) all pass.

**Note for IR01-072:** `DecisionContext.advanceState()` sends `{ status: to }` but `POST /api/decision/state` reads `to_status` — any `advanceState()` call today 400s. Pre-existing, not touched here; flagged for IR01-072 since it will be the first caller of `advanceState('decision_made')`.

---

## IR01-070b — UI Consistency Pass

**Type:** Consistency / cleanup (no new features, no functional change)

**Summary:** Audited every screen shipped through IR01-070 (Dashboard, History, Decision Wizard, Decision Object view, Analysis Loading, Auth) against H08 (UX & Design System) and removed the duplication and token gaps found.

**Changes:**
- Removed a near-byte-identical CSS duplicate between `pages/dashboard.module.css` and `pages/history.module.css` by extracting the shared filter/list layout into `components/layout/FilterLayout.module.css`.
- Tokenized a hardcoded button hover color: added `--color-danger-dark` to `lib/design-tokens.css` (mirrors the existing `--color-accent-dark` pattern) and referenced it from `Button.module.css` instead of a literal `#dc2626`.
- Rebuilt `pages/auth/login.tsx` and `pages/auth/signup.tsx` — previously ~150 lines of duplicated inline-style form/card/button markup each — on the existing `Input` and `Button` components plus one shared `pages/auth/Auth.module.css` page shell. Also switched their submit buttons to the standard `Button` `loading` spinner behavior instead of an ad hoc loading-text swap, aligning them with the rest of the app's button loading pattern.
- Converted `components/ui/SaveIndicator.tsx` from inline `CSSProperties` objects to a `SaveIndicator.module.css` module, matching the CSS Modules convention used by every other component.
- Widened `Input`'s `label` prop from `string` to `React.ReactNode` (backward compatible) to support inline hint text without a one-off component.

**Verification:** `npx tsc --noEmit`, `npx next build`, and `npx vitest run` (153 tests) all pass with no changes to existing test files.

**Not changed (scope boundary):** The public marketing site (`pages/index.js`, `about.js`, `guides/*`, etc.) uses a separate legacy component set (`components/App.jsx`, `AselMascot`, `HeroBanner`, `GuideLayout`) that predates H08 and is outside Phase 5 IR01 scope — left untouched.

---
