# DecisionOS Changelog

## IR01-075c — Outcome, Reflection, and Lessons Learned capture + Executing → Completed transition

**Type:** Feature (closes the second half of the MVP scope gap identified alongside IR01-075b — see the "Roadmap extension" entry below)

**Summary:** Implemented exactly as scoped in the roadmap. Closes FR-10.1–10.7, AC-07, H05 Workflow 2.3/2.4, and the `executing → completed` leg of FR-06.1. Purely frontend — `POST /api/decision/save` already accepted `10_outcome`/`11_reflection`/`12_lessons_learned` (IR01-027, IR01-033) and `POST /api/decision/state` already accepted the `executing → completed` transition (IR01-027, IR01-034), confirmed before starting; no backend changes.

**Changes:**
- `core/decision/Decision.types.ts` — added `OutcomeContent`, `ReflectionContent`, `LessonsLearnedContent` interfaces for components 10/11/12 per H12.
- `features/decision-outcome/OutcomeForm.tsx` + `OutcomeForm.module.css` — the three required Outcome fields (FR-10.2): free-text description, `goal_achievement` (yes/partially/no) radio group, 1–5 `satisfaction_rating` cards. Submit is disabled until all three are set. On submit: saves `10_outcome` via the existing `updateComponent` auto-save path, then unconditionally calls `advanceState('completed')` (FR-10.6) — the transition happens whether or not Reflection/Lessons Learned follow.
- `features/decision-outcome/ReflectionForm.tsx` + `ReflectionForm.module.css` — Reflection (`process_quality`, `ai_analysis_helpful`, `would_do_differently`; FR-10.4, fully optional) and Lessons Learned (`lessons`; FR-10.5, optional free text) combined into one fully skippable screen. Takes the full `decision` object and pre-fills every field from existing `11_reflection`/`12_lessons_learned` content when present, so the same component serves both the first-time prompt and later in-place editing (FR-10.7) — no separate edit-mode component built. Only calls `updateComponent` for a component that actually has content, so skipping both leaves neither component written.
- `pages/decision/[id].tsx` — `DecisionRouter`'s `executing` case now toggles (via a local `showOutcomeForm` state, matching the existing `showFinalForm`/`showChat` pattern) between the existing read-only `ActionPlanSummary` and `OutcomeForm`, reached through a new "How did it go?" button. Added `case DecisionStatus.COMPLETED`, rendering a new `CompletedView`: an Outcome summary card (description, goal-match label, star rating rendered the same way `History.tsx` already renders `outcome_satisfaction`) plus a Reflection/Lessons Learned card with an "Edit"/"Add" button that reopens `ReflectionForm` in place. `CompletedView` auto-opens `ReflectionForm` the first time it renders with no existing reflection/lessons content (a `useRef` guard ensures this only fires once per mount, not on every re-render) — this covers both the "immediately-following" screen right after Outcome submission and a later revisit where it was previously skipped.
- `pages/decision/[id].module.css` — added `.executingActionRow` and `.summaryCard`/`.summaryHeaderRow`/`.summaryLabel`/`.summaryText`/`.summaryTextMuted`/`.summaryMetaRow`. No new design tokens.

**Reused as-is, not modified:** `hooks/useDecision`'s `updateComponent`/`advanceState`, `components/ui/Button`, `components/ui/Card`, and `pages/api/decision/save.ts`/`state.ts`.

**Verification:** `npx tsc --noEmit`, `npx vitest run` (214 tests, unchanged — no new test file, matching this task's file list), and `npx next build` all pass.

**Not done:** IR01-076 (E2E verification) remains blocked on missing environment secrets, untouched by this task.

---

## IR01-075b — Action Plan completion tracking + Decision Made → Executing transition

**Type:** Feature (closes an MVP scope gap identified this session — see the "Roadmap extension" entry below)

**Summary:** Implemented exactly as scoped in the roadmap. Closes FR-05.7 (marking Action Plan items complete) and the `decision_made → executing` leg of FR-06.1.

**Changes:**
- `pages/api/decision/save.ts` — added `isActionPlanCompletionToggle()`, a structural-diff check: the stored `9_action_plan` content and the incoming write must match exactly on `based_on_alternative_id`/`based_on_alternative_name` and every item's `sequence`/`title`/`detail`/`estimated_effort`/`time_estimate`; only `completed` (boolean) and `completed_at` (`null` or string) may differ. `SERVER_GENERATED_COMPONENTS`'s blanket 400-rejection and the `CLIENT_WRITABLE_COMPONENTS` check both get a narrow, explicit `9_action_plan` exception — every other component's validation path is untouched. The exception fetches the current `is_current = true` row, diffs it, and on success falls through to the exact same version-bump-and-insert logic every other component already uses (steps 5–8 of the handler) — no new write path was created.
- `pages/decision/[id].tsx` — `ActionPlanSummary` gained a `readOnly` prop. Not read-only (the `decision_made` case): each item renders in a `<label>` (matching `FinalDecisionForm`'s existing whole-card-clickable radio pattern) with a checkbox calling the existing `updateComponent('9_action_plan', ...)` through the existing debounced auto-save path — no new save mechanism introduced. A "Confirm — Ready to Execute" button, disabled until every item is `completed`, calls the existing `advanceState('executing')`. Added `case DecisionStatus.EXECUTING` to `DecisionRouter`, rendering the same component with `readOnly={true}` (checkbox and confirm button omitted). Also corrected the `default` case's comment, which incorrectly attributed the Outcome/Reflection/Completed gap to "IR01-074–076" — now correctly points to IR01-075c.
- `pages/decision/[id].module.css` — added `.planItemRow`/`.planItemRowInteractive`/`.planItemCheckbox`/`.planItemBody`/`.planItemTitleDone`/`.planConfirmRow`, styled per H08's "Action Plan Item Completion" spec (checkbox `accent-color: var(--color-success)`; completed items get a success-colored strikethrough). No new design tokens.

**Reused as-is, not modified:** `context/DecisionContext.tsx`'s `updateComponent`/`advanceState`, `components/ui/Button`, and every other component's save validation.

**Verification:** `npx tsc --noEmit`, `npx vitest run` (214 tests, unchanged — no new test file, matching this task's file list), and `npx next build` all pass. Live-tested against `next dev`: `/decision/fake-id` still correctly redirects unauthenticated requests (unrelated to this change, confirms no regression); `POST /api/decision/save` with `component: '9_action_plan'` and no session still 401s before reaching the new validation logic, confirming the route compiles and the existing auth/ownership order is unchanged.

**Not done (explicitly out of scope, per instruction):** IR01-075c (Outcome/Reflection/Lessons Learned, `executing → completed`) and IR01-076 (E2E verification) were not touched. Full write-path exercise of the new completion-toggle logic (real toggle → `200`, tampered field → `400`) requires a live decision and is blocked behind IR01-076's missing environment secrets — the same limitation every task has had since IR01-076 was first blocked.

---

## Roadmap extension — IR01-075b, IR01-075c added

**Type:** Roadmap documentation only — no code changed

**Summary:** A chain of read-only work this session (Documentation Consistency Audit → Final Code Quality Audit → MVP UX Audit → MVP v1.0 Scope report → a dedicated investigation) converged on one finding: Outcome, Reflection, Lessons Learned, and the Executing→Completed Decision States are explicitly required for MVP per H05 (Workflow 2.3/2.4), H06 (FR-10, AC-07, listed under "In MVP" in Part 1, absent from the Part 6 out-of-scope list), H08 (dedicated IA routes `/decision/[id]/outcome`, `/decision/[id]/reflect`), and H09 (§17 treats Outcome/Reflection data as already existing ahead of the genuinely-post-MVP Learning Pipeline) — but no IR01 task was ever created to build it. IR01-072's own changelog entry had flagged this in real time ("a later Outcome/Reflection-adjacent task, not yet scoped in IR01") without it ever being scoped.

**Investigation ruled out the alternatives:** not an intentional deferral (genuine deferrals in this roadmap — e.g. IR01-071's `onRetryRecommendation`, IR01-072's Action Plan editing — always carry an explicit Handbook citation; this one carries none), and not a Handbook-internal inconsistency (H05/H06/H08/H09 agree unanimously; the only gap is between the Handbook and the roadmap).

**Changes:** Added `IR01-075b` (Action Plan completion tracking + `decision_made → executing` transition) and `IR01-075c` (Outcome/Reflection/Lessons Learned capture + `executing → completed` transition) to `IR01 - MVP Implementation Roadmap.md`, inserted between IR01-075 and IR01-076 using the same lettered-suffix convention as `IR01-070b` — no completed task renumbered. Updated the roadmap's own Appendix A (dependency graph: `IR01-072 → IR01-075b → IR01-075c`), Appendix B (task count 86 → 88, Medium complexity 29 → 31), and Appendix C (new planned-files note).

**Scope kept minimal by design:** investigation found nearly all required backend surface already exists — `10_outcome`/`11_reflection`/`12_lessons_learned` are already `CLIENT_WRITABLE_COMPONENTS` (IR01-027), `executing`/`completed` are already valid state transitions (IR01-027), and both the generic save (IR01-033) and state (IR01-034) endpoints already accept them. The only new backend surface across both tasks is a narrow exception in `save.ts` for toggling Action Plan item completion (`9_action_plan` is otherwise server-generated and locked). `features/decision-history/History.tsx` was checked directly and already renders `outcome_satisfaction` star ratings and a 30-day-stale "How did your decision go?" prompt (built generically during IR01-063, ahead of these states ever being reachable) — so no third task for "History integration" was needed, tightening the original 3-task estimate to 2.

**Not done:** No code was written. IR01-075b/075c are approved into the roadmap only; implementation is pending separate approval (starting with IR01-075b).

---

## CQ1 + CQ2 — Critical fixes from the Final Code Quality Audit

**Type:** Security/correctness hotfix (not an IR01-numbered task — audit-driven, approved out of band; IR01-076 stays the current/blocked IR01 task)

**Summary:** A read-only Final Code Quality Audit run after IR01-079 surfaced two launch-blocking defects, both empirically confirmed against a running `next dev` instance before any fix was made. Both are now fixed, re-verified live, and covered by the existing test/build gates.

**CQ1 — Anonymous users could never reach their own decision after creating it.**
`features/decision-wizard/Wizard.tsx` navigates to `/decision/{id}?anonymous_token={token}` right after creating an anonymous decision, but `middleware.ts` only exempted the literal `/decision/new` path from its auth gate — every other `/decision/:id` path redirected straight to `/auth/login`, discarding the token. Confirmed live: both a full document request and the `/_next/data/...` request the client router actually issues returned `307`. This broke WF-1 (the entire anonymous "no signup required" funnel, H05) end-to-end; IR01-076's E2E pass never reached it because it was blocked earlier by the missing-secrets 500.

Fix: `middleware.ts` now also exempts `/decision/:id` when the request carries an `anonymous_token` query param — the same param every `/api/decision/*` route already accepts in place of a session (H13 §2.1). Token ownership is still enforced only at the API/DB layer, unchanged. One condition added; no authentication-system changes.

**CQ2 — Legacy billing endpoints let anyone grant a subscription to an arbitrary account.**
`pages/api/create-checkout.js` took `user_id` straight from the request body with no authentication and embedded it in Stripe Checkout session metadata; `pages/api/webhook.js` then blindly trusted that `user_id` to upsert an `active` subscription. Both were still live and reachable (`components/App.jsx`'s own legacy `TopNav` still calls `handleUpgrade()` → `/api/create-checkout`, and the endpoint was callable directly regardless of UI). Net effect: anyone could grant a Pro/Premium subscription to any account they chose.

Fix: both handlers disabled — they now return `410 Gone` immediately, touching neither Stripe nor Supabase. The canonical, authenticated pair (`pages/api/billing/checkout.ts`, `pages/api/billing/webhook.ts`) is untouched and remains the only functional checkout/webhook path. `components/App.jsx`'s legacy upgrade buttons were left as-is (out of scope) — they now fail cleanly on click instead of being exploitable.

**Verification:** `npx tsc --noEmit`, `npx vitest run` (214 tests), and `npx next build` all pass. Both fixes additionally live-tested against `next dev`: anonymous decision access now returns `404` (reaches the page) instead of `307`; unauthenticated access still correctly `307`s; both legacy billing endpoints return `410` with no Stripe/Supabase side effects (tested with an attacker-supplied `user_id`).

**Not done (explicitly out of this fix's scope, per instruction):** `components/App.jsx`'s legacy TopNav and upgrade buttons were not rewired to the canonical billing flow. CQ3–CQ8 from the same audit (legacy `/api/chat.js` sanitization/rate-limiting gaps, missing `AbortController` cleanup, dual-TopNav duplication, Chat.tsx accessibility gaps, two dead files, `checkJs` blind spot) remain unfixed pending separate approval.

---

## IR01-079 — Component tests for `context/DecisionContext.tsx`

**Type:** Test coverage (Phase 6, final task in the chain independent of the still-blocked IR01-076)

**Summary:** Last task in the IR01-077 → IR01-078 → IR01-079 chain (see IR01-077 below for why this proceeds ahead of IR01-076). With this complete, every remaining Phase 6 task (IR01-080 through IR01-085) requires a live/production environment and is genuinely blocked behind IR01-076 — no further roadmap work is available until it's unblocked.

**Changes:** Added `context/DecisionContext.test.tsx` (10 tests) using `@testing-library/react`'s `renderHook` and MSW's `setupServer` to mock `/api/decision/:id`, `/api/decision/save`, and `/api/decision/state`:
- Initial load populates `decision` and clears `isLoading`; a `{ error }` response sets `error` and leaves `decision` null.
- `updateComponent` updates local state optimistically before the debounced save fires.
- The 800ms auto-save debounce: zero `/api/decision/save` calls within the window, exactly one call after (this task's specific acceptance criterion) — plus a supporting test confirming rapid successive updates collapse into a single call.
- `saveState` transitions `'saving'` → `'saved'` on a successful save, and → `'error'` after exactly three consecutive failures (verified via a call counter against `saveWithRetry`'s two-retry policy).
- `advanceState`'s three branches: successful status update, merging a returned `action_plan` into `components['9_action_plan']`, and rejecting with `decision.status` left unchanged on an API error.

**Dependency installed:** `msw` (`^2.14.6`) — the only new dependency, exactly as this task calls for. It was already present transitively via `vitest`'s own tooling, so this added no new top-level dependency tree.

**Timing approach:** debounce/retry tests use real timers rather than `vi.useFakeTimers()` — combining fake timers with MSW's fetch interception across `saveWithRetry`'s recursive retry chain (`await new Promise(setTimeout)`) is a known source of flakiness. Trade-off: this test file takes ~9s of real wall-clock time (the three-failures test spans the full 800ms + 1000ms + 3000ms sequence) in exchange for reliability.

**Necessary test-infrastructure fix (test config only, not production code):** `context/DecisionContext.tsx` is the first `.tsx` file with JSX that any test in this repo has imported. `vitest.config.ts` had no JSX transform configured — combined with `tsconfig.json`'s `"jsx": "preserve"` (correct for Next.js's own SWC pipeline), Vite's transform failed outright on any `.tsx` import, which would have blocked every future component test, not just this one. Fixed by adding `oxc: { jsx: { runtime: 'automatic' } } }` to `vitest.config.ts` (Vite 8 resolves JSX via oxc, not esbuild). Confirmed `npx next build` still succeeds unchanged.

**Verification:** `npx vitest run` (214 tests, up from 204), `npx tsc --noEmit`, and `npx next build` all pass.

---

## IR01-078 — Unit tests for `core/ai/prompts.ts`

**Type:** Test coverage (Phase 6, continuing out of numeric order while IR01-076 remains blocked)

**Summary:** Second task in the unblocked IR01-077 → IR01-078 → IR01-079 chain (see IR01-077 below for why this proceeds ahead of IR01-076). `core/ai/prompts.ts` had 0% coverage and no test file before this task.

**Changes:** Added `core/ai/prompts.test.ts` (48 tests) covering all six prompt builders:
- `buildAnalysisPrompt` — correct `PROMPT_VERSIONS.analysis`, `market_data_caveat` instruction present for financial/technology/insurance and absent otherwise, professional advice disclaimer present for financial/health/insurance and absent for technology, category rules block omitted entirely for categories with neither, sanitization of an injection string in `context.background` and a fake role marker in an alternative name, optional context/goal/soft-constraint fields rendered when present.
- `buildRecommendationPrompt` — correct version, the hard-constraint-enforcement rule text, all five Recommendation Contract terms named in the prompt, the analysis output embedded as JSON, sanitization of goal text.
- `buildActionPlanPrompt` — correct version, prompt scoped to the chosen alternative (not the AI's recommendation), divergence reason included when present, the 3–5 item rule stated, sanitization of the chosen alternative's name.
- `buildSuggestionPrompt` — correct version, existing-alternatives list used for de-duplication vs. "None yet" when empty, optional context summary/goal sections.
- `buildConflictDetectionPrompt` — correct version, "None" shown for empty hard constraints, optional alternatives section.
- `buildChatSystemPrompt` — returns a string (not a `PromptPair`), "Not yet provided" per unpopulated component, populated component content rendered correctly, tie-detected vs. named-winner branches in the recommendation block, final decision block present/absent, sanitization of stored component content.

Tests assert on structural markers and specific injected substrings rather than exact prompt wording, matching this task's own framing ("verify structure, not the exact wording").

**Verification:** `core/ai/prompts.ts` now at 100% line / 99% statement / 88% branch coverage (was 0%). `npx vitest run` (204 tests, up from 156) and `npx tsc --noEmit` both pass. No production code changed — only the new test file was added.

---

## IR01-077 — Unit tests for `core/ai/validate.ts`

**Type:** Test coverage (Phase 6, completed out of numeric order while IR01-076 remains blocked)

**Summary:** IR01-076 is blocked on missing environment secrets (see below) and cannot be advanced. Per the roadmap's own execution model ("tasks are ordered by dependency, not calendar time") and Appendix A's dependency graph, IR01-077 → IR01-078 → IR01-079 is a chain independent of IR01-076 → IR01-080 → ...: all of Phase 6's production-verification tasks (IR01-080 through IR01-085) genuinely need a live environment and stay blocked behind IR01-076, but the unit-test tasks do not. IR01-077 was next in that unblocked chain.

**Findings:** `core/ai/validate.test.ts` already existed at 620 lines (written under IR01-045/IR01-055 alongside the validation functions themselves) and was already at 96% line coverage on `validate.ts` — clearing this task's 80% bar before any new work. Only 3 lines were uncovered, all defensive branches: a non-object entry in `per_alternative`, a non-object entry in `action_items`, and a non-numeric `sequence` field.

**Changes:** Added 3 tests to `core/ai/validate.test.ts` closing those branches. `validate.ts` is now at 100% line / 97% statement / 91% branch coverage. No production code touched — `validate.ts` itself was not modified.

**Gap found, not fixed (explicitly out of scope for a test-only task):** H11 §8.5 and §9.4 both require the output validation layer to reject responses containing a defined list of prohibited phrases (outcome-prediction language, Legal-category phrases, real-time-data phrases). No such check exists anywhere in `core/ai/` — not in `validate.ts`, not as a prompt instruction in `prompts.ts`. Implementing it is new production code, which this task's scope (write unit tests) and this round's explicit instruction (do not modify production code) both exclude. Flagged for a future task.

**Note:** this task's roadmap citation of "H11 §5.5 and §6.5" is stale — those sections are now Prompt Versioning/Deprecation and Conversation Memory in the current Handbook, unrelated to output validation. The actual validation rules (already implemented and now fully tested) live in H11 §7.3, §8.3, §9.2–9.3, §11.1–11.3, and §12.1–12.2.

**Verification:** `npx vitest run` (156 tests, up from 153) and `npx tsc --noEmit` both pass.

---

## IR01-076 — Phase 5 E2E user flow verification

**Type:** Verification only — blocked, no code changes

**Summary:** Attempted to manually drive all five H05 user workflows end-to-end. Started `next dev` and, before opening a browser, confirmed the two write-path endpoints WF-1 and WF-5 need are reachable at all.

**Findings:**
- `POST /api/decision/create` (WF-1 step 1) → HTTP 500: `SUPABASE_SERVICE_ROLE_KEY is not configured`, thrown at import time by `lib/supabase/admin.ts`.
- `POST /api/billing/checkout` (WF-5) → HTTP 500 for the same reason, via `lib/stripe/stripe.client.ts`.
- `.env.local` defines only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Every API route the five workflows touch imports `adminClient`, which requires `SUPABASE_SERVICE_ROLE_KEY`; chat/AI analysis additionally requires `ANTHROPIC_API_KEY`; billing additionally requires `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_PREMIUM_PRICE_ID`.

**Not done:** None of the five workflows were run in a browser (Chrome, 1440px/375px) — all five fail at their first data-writing step before any UI or console-error observation is possible. This is a missing-credential environment gap, not a code defect, so no fix is within this task's scope.

**Verification:** `curl -X POST /api/decision/create` and `curl -X POST /api/billing/checkout` against a local `next dev` server, both reproducing HTTP 500 with the errors above. Dev server stopped after confirming the blocker.

---

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
