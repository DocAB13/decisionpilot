# DecisionOS Changelog

## IR01-075 — `useSubscription` plan-gating verification

**Type:** Verification only — no code changes

**Summary:** Per the roadmap's own framing ("Confirm `hooks/useSubscription.js` is wired into all plan-gated components"), audited every plan-gated surface in the app rather than building anything new.

**Findings — all already correctly wired:**
- `hooks/useSubscription.js` returns exactly `{ plan, loading }`.
- `features/decision-chat/Chat.tsx` (IR01-073) gates on `plan === 'pro' || plan === 'premium'`, equivalent to the roadmap's `plan === 'free'` framing.
- `features/decision-history/History.tsx` (IR01-063) reacts to `plan_limit` from `GET /api/decision/history`, which the endpoint computes server-side as `actualTotal > 10` for free-tier users.
- `components/layout/TopNav.tsx` (IR01-058) shows the PRO/PREMIUM badge from `useSubscription`.
- Also checked (not in this task's file list): `RecommendationView.tsx` (IR01-071), `PricingSection.tsx` (IR01-074), and the legacy `App.jsx`'s own separate `TopNav` function — all already use `useSubscription` correctly.

No component was found rendering plan-based content without going through `useSubscription` or the API's `plan_limit`.

**Verification:** `npx tsc --noEmit` and `npx vitest run` (153 tests) re-confirmed green; zero files were changed for this task.

**Noted, not fixed (no user-facing impact — would be unrelated-refactor scope):** `useSubscription.js` queries the `subscriptions` table with `.single()`. Per that table's own migration comment, a row only exists once a user has gone through the Stripe webhook (i.e., first upgrade) — a free user who's never upgraded has no row at all, so this query always resolves with an unchecked "no rows" error for them. `plan` still correctly defaults to `'free'` via `data?.plan || 'free'`, and nothing is thrown or logged, so there's no visible symptom. Left as-is since fixing it means touching a hook used on every page for a purely internal correction outside this task's "confirm it's wired" scope.

---

## IR01-074 — Billing upgrade flow

**Type:** Feature (new component) + bug fix (pre-existing gap in a listed acceptance-criteria file)

**Summary:** Built the Stripe Checkout upgrade flow per H13 §4.1: a reusable, H08-aligned pricing component, and a working post-checkout confirmation page.

**Changes:**
- Added `features/marketing/PricingSection.tsx` + `PricingSection.module.css`: Free/Pro/Premium cards (`Card` component, H08 §6 three-column grid), plan-aware "Current plan" label via the existing `useSubscription` hook, and "Upgrade to Pro"/"Upgrade to Premium" buttons that `POST /api/billing/checkout` and redirect via `window.location.href` on success.
- Replaced the only reachable pricing cards in the app — an inline ~60-line block inside the legacy `components/App.jsx` homepage, wired to the deprecated `/api/create-checkout` — with `<PricingSection />`. No other part of that 5000-line legacy file was touched (its other, unrelated `handleUpgrade` nav-badge buttons are untouched).
- Rebuilt `pages/success.js` + new `pages/success.module.css`: it previously ignored `session_id`/`return` entirely, linked to `/` instead of `/dashboard`, and referenced the old "DecisionPilot" product name — none of which satisfied this task's own acceptance criteria. It now reads `session_id`/`return` from `router.query` (defaulting to `/dashboard` per H13 §4.1), and is built on H08 tokens reusing `Card`/`Button`.

**Verification:** `npx tsc --noEmit`, `npx next build`, and `npx vitest run` (153 tests) all pass. Also smoke-tested the production build with `next start`: homepage and `/success?session_id=...` both return 200 with no server errors.

**Not done (explicitly out of scope for this task):** `pages/account.tsx` still doesn't exist. `History.tsx` (IR01-063) and `Chat.tsx` (IR01-073) both already route their Free-plan upgrade prompts there, so those links still 404. IR01-074's file list only specified `PricingSection.tsx` — a dedicated account/billing page isn't listed until a future task.

---

## IR01-073 — AI Chat Interface

**Type:** Feature (new screen)

**Summary:** Built the AI Chat Interface per H08 §11 and H13 §3.6, anchored to a Decision Object.

**Changes:**
- Added `features/decision-chat/Chat.tsx` + `Chat.module.css`: context label header ("You are discussing your [Category] decision," always visible), scrollable message area (user right/accent-light, AI left/surface), input pinned to the bottom (1000-char max, Enter to send), auto-scroll to the latest message.
- Optimistic send: the user's message appears immediately with a "sending" state; a failed call marks it "Failed to send. Retry" inline rather than losing it.
- "Thinking" indicator while waiting for the AI response.
- Formal Update Prompt (H08 §11): when `material_change_detected` is true, an inline accent-tinted card appears with "Update Decision" / "Keep as context only" actions.
- Pro+ gate lives inside `Chat.tsx` itself (checked via the existing `useSubscription` hook): Free plan sees an inline upgrade prompt instead of the message area and input, never a redirect away from the decision (H08 UX-P6).
- Wired into `pages/decision/[id].tsx` via a `showChat` toggle on `DecisionRouter`: desktop renders a 40/60 split (current view alongside the Chat panel), mobile hides the left pane so Chat takes the full width — approximating H08 §11's full-screen mobile spec without any changes to `PageLayout`, `TopNav`, or `BottomNav`.
- Updated `RecommendationView`'s "Explore with AI" / "Ask AI a question" buttons (added in IR01-071) to call the new `onOpenChat` prop instead of `router.push('/decision/[id]/chat')` — that route was never built and only `features/decision-chat/Chat.tsx` was ever specified as a new file for this task, so Chat renders in place instead of on a separate page.

**Two honest adaptations, not new mechanisms:**
- "Update Decision" calls the already-existing, already-valid `advanceState('draft')` and closes the chat panel, returning the user to the Wizard at their resume step to edit the affected component and resubmit. There's no dedicated "auto-apply this chat-detected change" endpoint in H13, so this reuses the same backward-edit-and-reanalyze path H08 §8 already describes rather than inventing one.
- The API only returns a "source component" for `material_change_detected` responses, not for ordinary ones — so the generic "Based on your [component]" source label from H08 §11's Message Anatomy isn't shown on every AI message, since that data doesn't exist for the general case.

**Verification:** `npx tsc --noEmit`, `npx next build`, and `npx vitest run` (153 tests) all pass.

---

## IR01-072 — Final Decision capture and state advance

**Type:** Feature (new screen) + bug fix (dependency)

**Summary:** Built the Final Decision capture form (component 8) and the `decision_made` state transition, per the roadmap's IR01-072 spec.

**Changes:**
- Added `features/decision-wizard/FinalDecisionForm.tsx` + `FinalDecisionForm.module.css`: alternative selection (radio-card group per H08 §7, defaults to the recommended alternative), a `divergence_reason` field that appears only when the choice differs from the recommendation, and a `confident` / `uncertain` / `reluctant` confidence radio group.
- Submit flow: `updateComponent('8_final_decision', ...)` then `advanceState('decision_made')`, exactly as specified. A failed `advanceState` call is caught and shown inline; the decision stays in `waiting_for_user` (no client-side rollback needed — the context only updates local status after a successful response).
- Wired into `pages/decision/[id].tsx`: a local `showFinalForm` toggle switches the `waiting_for_user` branch between `RecommendationView` (its "Record My Decision" button now opens the form) and `FinalDecisionForm` (its Back button returns to the recommendation).
- Added a `decision_made` router case that reads `decision.components['9_action_plan']` and displays the plan inline (title/detail/time-estimate per item), with a graceful fallback message if the Action Plan Engine failed — matching H13 §3.5's "state transition succeeds even if the action plan generation fails" behavior.
- Added `ActionPlanContent` / `ActionPlanItem` types (component 9) to `core/decision/Decision.types.ts`, matching `ACTION_PLAN_OUTPUT_SCHEMA` in `core/ai/prompts.ts`.

**Bug fix (existing code, a hard dependency of this task):** `context/DecisionContext.tsx`'s `advanceState` posted `{ decision_id, status: to }`, but `pages/api/decision/state.ts` reads `to_status` from the body — every `advanceState()` call 400'd with "to_status is required." This predates IR01-071 (introduced with `DecisionContext` in IR01-061) and had never been exercised until this task's submit flow needed it. Fixed the field name only. `advanceState`'s signature stays `Promise<void>`, unchanged from H09's frozen interface — instead of widening the return type to carry `action_plan`, `advanceState` now merges a returned `action_plan` into local component state the same way `updateComponent` already merges every other component, so `FinalDecisionForm`/the router can read it straight from `decision.components` once the call resolves.

**Verification:** `npx tsc --noEmit`, `npx next build`, and `npx vitest run` (153 tests) all pass.

**Deferred:** No component-completion interactivity (checking off action items, per H08 §18's strikethrough microinteraction) — the roadmap only calls for displaying the plan after the transition, not editing it. That belongs to a later Outcome/Reflection-adjacent task, not yet scoped in IR01.

---

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
