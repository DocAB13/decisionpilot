# DecisionOS Development Status

## Current Status

**Project:** DecisionOS

**Current Phase:** Phase 5 — Frontend (in progress) / Phase 6 — Testing & Launch (started out of numeric order, see note)

**Current IR01 Task:** IR01-076 — Phase 5 E2E user flow verification — **BLOCKED** (missing env secrets, see below). Remains open and untouched.

**Last Completed Task:** IR01-075c — Outcome, Reflection, and Lessons Learned capture (components 10–12) + `executing → completed` transition. Implemented exactly as scoped in the roadmap (`core/decision/Decision.types.ts`, `features/decision-outcome/OutcomeForm.tsx`+`.module.css`, `features/decision-outcome/ReflectionForm.tsx`+`.module.css`, `pages/decision/[id].tsx`, `pages/decision/[id].module.css` only). IR01-076 remains blocked and untouched.

**Most recent work (outside IR01 numbering):** (-2) Ran a read-only performance audit and implemented the one approved Critical fix: `components/App.jsx`'s ~394 KB legacy-quiz-engine chunk (downloaded by every homepage visitor) was code-split into a new, on-demand-only file, `components/legacy/QuizEngine.jsx`. Mid-implementation discovery: the quiz engine is not actually unreachable — it's still live via the Favorites button, Profile button, and the Ai·sel mascot's chat trigger, all rendered by the current homepage — so it was code-split (preserving 100% of functionality) rather than deleted. `App.jsx`'s chunk: 403,509 → 231,848 bytes (≈42.5% smaller); the new chunk (173,262 bytes) only loads if one of those three is clicked. See the "Performance Audit + Critical Fix #1" section below. (-1) Ran a read-only accessibility audit (WCAG 2.1 AA per H08 §14) and implemented the two fixes approved for immediate action: darkened `--color-text-muted`/`--color-success`/`--color-danger` in `lib/design-tokens.css` (all three previously failed 4.5:1 text contrast; all three now clear 5:1+) and added a skip-to-content link to `components/layout/PageLayout.tsx`. Only these two changes were made — every other finding (Chat panel focus/Escape handling, `Button`'s `role="status"`/`aria-hidden` conflict, missing `<main>` on auth pages, etc.) was left untouched per instruction. See the "Accessibility Audit + Critical Fixes" section below. (0) Traced H10 §11.3's third named testing requirement — anonymous Decision transfer on signup — and found it is **not actually implemented**: `pages/auth/login.tsx`/`signup.tsx` copy the anonymous token from `localStorage` into a cookie, but nothing anywhere (`callback.ts`, `middleware.ts`, `create.ts`, or any DB trigger) ever reads that cookie to perform the claim. No tests added (nothing real to test); no code changed. See the "Anonymous → account transfer" section below. (1) Added unit tests for all five priority API routes — `pages/api/billing/webhook.ts`, `pages/api/decision/analyze.ts`, `save.ts`, `[id].ts`, and `state.ts` — closing the H10 §11.3 / H16 §12 gap (no `pages/api/**/*.test.ts` file existed before this). 60 new tests this round on top of the 14 for `webhook.ts`; suite: 225 → 299. **Architectural correction along the way:** discovered that Next.js's Pages Router builds every file under `pages/` as a route — test files included — so all five test files (plus a shared helper) were moved to `__tests__/api/...` outside Next's routing scope; confirmed via `next build` that no `.test` routes remain. `webhook.test.ts` had never been committed, so nothing shipped. See the "Test Coverage — API Routes" section below. (2) Added `core/ai/call.test.ts`, closing the H16 §12 gap for `call.ts` — 50% → 100% line coverage, 214 → 225 tests. (3) Rewrote `pages/privacy.js`, `pages/terms.js`, and `pages/cookies.js` to remove the legacy "DecisionPilot" comparison-marketplace content flagged in H14 §12.2. (4) Authored the six previously-stub Company Handbook documents — H14 (Security & Privacy), H15 (Operations Handbook), H16 (Testing & QA), H17 (Product Roadmap), H18 (Business Model), H19 (Glossary). See the "Handbook Documentation" and "Legal Pages Rewrite" sections below. Before all of that: UX Critical Fixes UX1–UX3 — see the "UX Critical Fixes" section below.

**Roadmap extended, IR01-075b and IR01-075c both implemented:** `IR01-075b` and `IR01-075c` were added to the roadmap following a Documentation Consistency Audit, a Final Code Quality Audit, an MVP UX Audit, an MVP v1.0 Scope report, and a dedicated investigation that together established Outcome/Reflection/Lessons Learned/Executing→Completed were explicitly required by H05/H06/H08/H09 but had no IR01 task ever scoped for them. Inserted per the `IR01-070b` precedent — no completed task renumbered. Both are now done.

**IR01 Progress:** 77 / 88 tasks complete in strict numeric-plus-lettered order, plus IR01-077, IR01-078, and IR01-079 (Phase 6) — see `IR01 - MVP Implementation Roadmap.md` Appendix B for the full task count (88 total: 85 original + IR01-070b, IR01-075b, IR01-075c, inserted). IR01-076 not yet completable — blocked on missing environment secrets. IR01-075c is now complete.

**IR01-076 blocker:** `.env.local` is missing `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_PREMIUM_PRICE_ID`. Confirmed at runtime: `POST /api/decision/create` and `POST /api/billing/checkout` both 500 immediately (`lib/supabase/admin.ts` and `lib/stripe/stripe.client.ts` throw at import time without these). All five E2E workflows write decision/billing data as their first step, so none can be driven in a browser until these are added.

**Repository:**
- GitHub: Last confirmed push was commit `f2e0862` ("fix(legal): rewrite Privacy/Terms/Cookies for real product; test(ai): cover core/ai/call.ts"). This update adds one more round of work on top — `pages/api/billing/webhook.test.ts` and this roadmap/status sync — staged for the next commit and push.
- Vercel: A production deploy should trigger automatically on every push to `main` per H09 §12 — not independently re-verified against the Vercel dashboard this session. Last confirmed sync point was IR01-060; the pushes since (`b2c71d5`, `4052686`, `f2e0862`) were the first opportunities for Vercel to pick up IR01-061 through IR01-075c's frontend work and the Privacy/Terms/Cookies rewrite, still not independently re-checked.

---

## Sprints

| Sprint | Scope | Status |
|---|---|---|
| Sprint 3 | IR01-063, IR01-064 | Completed |
| Sprint 4 | IR01-065 – IR01-070, IR01-070b, IR01-071 – IR01-075c (in progress, task-by-task) | In progress |

---

## Completed Phases

- Phase 1 — Foundation ✅
- Phase 2 — Database ✅
- Phase 3 — API ✅
- Phase 4 — AI ✅
- Phase 5 — Frontend — in progress (IR01-056 – IR01-075c done; IR01-076 remaining, blocked)
- Phase 6 — Testing & Launch — started out of order: IR01-077, IR01-078, IR01-079 done (the full unblocked chain per Appendix A's dependency graph); IR01-080 onward all require a live/production environment and remain blocked behind IR01-076

---

## IR01: In Progress (77 / 88 tasks in numeric-plus-lettered order; 80 / 88 also counting IR01-077/078/079)

### Phase 1 — Foundation
- IR01-001 through IR01-012 ✅

### Phase 2 — Database
- IR01-013 — subscriptions table
- IR01-014 — decisions table
- IR01-015 — decisions RLS policies
- IR01-016 — decisions indexes and updated_at trigger
- IR01-017 — decision_components table
- IR01-018 — decision_components RLS policies and indexes
- IR01-019 — decision_state_transitions table
- IR01-020 — decision_chat_messages table
- IR01-021 — insert_chat_exchange database function
- IR01-022 — updated_at trigger verification
- IR01-023 — anonymous Decision cleanup cron job
- IR01-024 — stuck in_analysis cleanup cron job
- IR01-025 — subscriptions data integrity audit
- IR01-026 — full database verification

### Phase 3 — API
- IR01-027 — Supabase server client
- IR01-028 — Supabase admin client
- IR01-029 — Decision domain types, constants, and utilities
- IR01-030 — POST /api/decision/create
- IR01-031 — GET /api/decision/[id]
- IR01-032 — DELETE /api/decision/[id]
- IR01-033 — POST /api/decision/save
- IR01-034 — POST /api/decision/state
- IR01-035 — GET /api/decision/history
- IR01-036 — POST /api/billing/checkout
- IR01-037 — POST /api/billing/webhook
- IR01-038 — POST /api/decision/chat (stub)
- IR01-039 — GET /api/decision/chat/[id]
- IR01-040 — Phase 3 API verification

### Phase 4 — AI
- IR01-041 through IR01-055 ✅

### Phase 5 — Frontend
- IR01-056 — core/ type definitions accessible to frontend
- IR01-057 — shared UI components: Button, Input, Card
- IR01-058 — TopNav layout component
- IR01-059 — BottomNav mobile layout component
- IR01-060 — PageLayout wrapper component
- IR01-061 — `context/DecisionContext.tsx` and `hooks/useDecision.ts` — commit `0ad6cc9`
- IR01-062 — `components/ui/SaveIndicator.tsx` — commit `eada52a`
- IR01-063 — `pages/dashboard.tsx` and `features/decision-history/History.tsx` — commit `d15f159`
- IR01-064 — `pages/history.tsx` — commit `33b0dad`
- IR01-065 — Decision Wizard entry page and container: `pages/decision/new.tsx`, `features/decision-wizard/Wizard.tsx` — commit `341a933`
- IR01-066 — `features/decision-wizard/CategorySelect.tsx` — commit `740453e`
- IR01-067 — Wizard steps: `ContextStep.tsx`, `GoalStep.tsx`, `ConstraintsStep.tsx`, `AlternativesStep.tsx` — commit `16f52df`
- IR01-068 — `components/ui/ProgressBar.tsx` — commit `62b2dbc`
- IR01-069 — `pages/decision/[id].tsx` (Decision Object view page; minor Wizard.tsx update to pass `anonymous_token` through) — commit `4ac315c`
- IR01-070 — `components/ui/AnalysisLoading.tsx` (wired into the `in_analysis` branch of `pages/decision/[id].tsx`) — commit `9d07c19`
- IR01-070b — UI Consistency Pass: extracted the duplicate dashboard/history filter-layout CSS into `components/layout/FilterLayout.module.css`; tokenized the hardcoded Button danger-hover color (`--color-danger-dark`); rebuilt `pages/auth/login.tsx` and `pages/auth/signup.tsx` on the existing `Input`/`Button` components and a shared `Auth.module.css` shell instead of ~150 duplicated inline-style lines each; converted `SaveIndicator` from inline `CSSProperties` to a CSS Module
- IR01-071 — `features/decision-wizard/RecommendationView.tsx` (Recommendation Screen per H08 §9/H03 component 7; wired into the `waiting_for_user` branch of `pages/decision/[id].tsx`). Added typed shapes for components 5/6/7 (`AIAnalysisContent`, `RisksContent`, `RecommendationContent`, etc.) to `core/decision/Decision.types.ts`, since none existed yet. `onRecordDecision`/`onRetryRecommendation` are optional callback props with no backend wiring yet — deferred to IR01-072 and to the post-MVP Recommendation-only retry endpoint (H13 §3.4 note) respectively.
- IR01-072 — `features/decision-wizard/FinalDecisionForm.tsx` (component 8 capture + `decision_made` transition). Wired into `pages/decision/[id].tsx` via a local `showFinalForm` toggle; added a `decision_made` router case that displays the Action Plan (component 9) from `decision.components['9_action_plan']`. Added `ActionPlanContent`/`ActionPlanItem` types. Fixed the pre-existing `advanceState` field-name bug (`status` → `to_status`) in `context/DecisionContext.tsx` that this task depended on, and taught `advanceState` to merge a returned `action_plan` into local component state (keeping its `Promise<void>` signature, per H09).
- IR01-073 — `features/decision-chat/Chat.tsx` (AI Chat per H08 §11/H13 §3.6). Wired into `pages/decision/[id].tsx` via a `showChat` toggle: desktop 40/60 split (current view + Chat panel), mobile hides the left pane so Chat takes the full width. `RecommendationView`'s "Explore with AI"/"Ask AI a question" buttons now call the new `onOpenChat` prop instead of `router.push` to a route that was never built. Free-tier gating lives inside `Chat.tsx` (inline upgrade prompt, no navigation away). "Update Decision" on a material-change prompt calls the existing `advanceState('draft')` rather than a new endpoint, since none exists for auto-applying a chat-detected change.
- IR01-074 — `features/marketing/PricingSection.tsx` (billing upgrade flow per H13 §4.1). Replaced the only reachable pricing cards in the app — a ~60-line block in the legacy `components/App.jsx` homepage wired to the deprecated `/api/create-checkout` — with `<PricingSection />`, now calling `/api/billing/checkout`. Rebuilt `pages/success.js`, which had never actually read `session_id`/`return` or linked to `/dashboard` despite the roadmap assuming it did; it now does both, on H08 tokens.
- IR01-075 — Verification-only, no code changes. Confirmed `useSubscription.js` returns `{ plan, loading }`; confirmed `Chat.tsx`, `History.tsx` (via API `plan_limit`), and `TopNav.tsx` all correctly gate on plan; also spot-checked `RecommendationView.tsx`, `PricingSection.tsx`, and the legacy `App.jsx`'s own `TopNav` — all correct. No component found gating on plan without going through `useSubscription` or the API's `plan_limit`. Noted (not fixed, no behavioral impact): `useSubscription.js` uses `.single()` against a `subscriptions` table that per its own migration comment only gets a row on first Stripe upgrade, so every free user's query resolves with an ignored "no rows" error — `plan` still correctly falls back to `'free'`, no user-facing symptom.
- IR01-075b — Action Plan completion tracking + `decision_made → executing` transition. `pages/api/decision/save.ts` gained a narrow, structural exception (`isActionPlanCompletionToggle`) letting the owner toggle `completed`/`completed_at` on existing `9_action_plan` items — every other field, and every other component, is validated exactly as before. `ActionPlanSummary` in `pages/decision/[id].tsx` now takes a `readOnly` prop: `false` (in `decision_made`) renders a checkbox per item via the existing `updateComponent`/auto-save path plus a "Confirm — Ready to Execute" button (disabled until all items complete) calling the existing `advanceState('executing')`; `true` (new `case DecisionStatus.EXECUTING`) renders the same list without the interactive controls. No changes to `DecisionContext.tsx`, `Button.tsx`, or any hook — both reused as-is. Styled per H08's "Action Plan Item Completion" spec in `pages/decision/[id].module.css` (new CSS only, no new tokens). `npx tsc --noEmit`, `npx vitest run` (214 tests, unchanged), and `npx next build` all pass; live-tested against `next dev` (route compiles, auth/ownership order unchanged, 401 still returned before the new validation runs). Full write-path exercise needs a live decision and remains blocked behind IR01-076, same limitation as every task since IR01-076 was first blocked.
- IR01-075c — Outcome (`10_outcome`), Reflection (`11_reflection`), and Lessons Learned (`12_lessons_learned`) capture + `executing → completed` transition. No backend changes — both endpoints already accepted these components/transitions, confirmed before starting. Added `OutcomeContent`/`ReflectionContent`/`LessonsLearnedContent` to `Decision.types.ts`. New `features/decision-outcome/OutcomeForm.tsx` (the three required Outcome fields; saves `10_outcome` then unconditionally calls `advanceState('completed')` per FR-10.6) and `features/decision-outcome/ReflectionForm.tsx` (Reflection + Lessons Learned on one skippable screen, pre-filled from existing content so it doubles as the FR-10.7 in-place editor). `pages/decision/[id].tsx`'s `executing` case gained a "How did it go?" toggle into `OutcomeForm`; new `case DecisionStatus.COMPLETED` renders a `CompletedView` summary (Outcome card + Reflection/Lessons Learned card with an Edit/Add button), auto-opening `ReflectionForm` the first time it renders with no existing reflection/lessons content. `npx tsc --noEmit`, `npx vitest run` (214 tests, unchanged), and `npx next build` all pass.

**Remaining in Phase 5:** IR01-076 (Phase 5 E2E verification, blocked).

### Phase 6 — Testing & Launch
- IR01-077 — Unit tests for `core/ai/validate.ts` (H11 §7.3/§8.3/§9.2–9.3/§11.1–11.3/§12.1–12.2). `validate.test.ts` already had 620 lines of tests from IR01-045/055; this task closed the 3 remaining uncovered branches (non-object entries in `per_alternative` and `action_items`, non-numeric `sequence`). `validate.ts` now at 100% line / 97% statement coverage, 156 tests passing (was 153). No production code changed. Gap found, not fixed (out of this task's scope — would be new production code): H11 §8.5/§9.4 prohibited-phrase output validation doesn't exist anywhere in `core/ai/` — flagged for a future task.
- IR01-078 — Unit tests for `core/ai/prompts.ts` (all six prompt builders: analysis, recommendation, action plan, suggestion, conflict detection, chat system). `prompts.ts` had 0% coverage and no test file before this task. Added `core/ai/prompts.test.ts` (48 tests): correct `version` per builder, financial/technology/insurance `market_data_caveat` and disclaimer rules, injection-string sanitization, Recommendation Contract terms, hard-constraint rule text, chat prompt's populated-vs-"Not yet provided" component blocks, tie-detected vs. named-winner branches. `prompts.ts` now at 100% line / 99% statement coverage, 204 tests passing (was 156). No production code changed.
- IR01-079 — Component tests for `context/DecisionContext.tsx` (auto-save debounce, retry, saveState transitions, advanceState). Added `context/DecisionContext.test.tsx` (10 tests) using `@testing-library/react`'s `renderHook` + MSW's `setupServer`. Covers initial load/load-error, `updateComponent`'s optimistic update and 800ms debounce (zero calls within the window, exactly one after — this task's specific acceptance criterion), `saveState` `'saving'` → `'saved'` and → `'error'` after three consecutive failures, and all three `advanceState` branches. Installed `msw` (`^2.14.6`) as the only new dependency. Also fixed a pre-existing test-infrastructure gap this task exposed: `vitest.config.ts` had no JSX transform configured, so any test importing a `.tsx` file with JSX would fail outright — added `oxc: { jsx: { runtime: 'automatic' } } }` to `vitest.config.ts` (test config only; confirmed `npx next build` unaffected).
- IR01-080 through IR01-085 — not started. All require a live/production environment (H09 TAC checklist, H13/H11 acceptance criteria against production, security audit, performance baseline, release checklist) and remain blocked behind IR01-076.

---

## Critical Fixes — Code Quality Audit (outside IR01 numbering)

A read-only Final Code Quality Audit run after IR01-079 found two launch-blocking defects, both fixed with explicit approval and verified live against `next dev`. Not IR01 tasks — no task ID assigned, no roadmap renumbering — but tracked here since IR01-076 stays the current/blocked IR01 task throughout. Full detail in `IR01 - MVP Implementation Roadmap.md`'s "Critical Fixes" section.

- **CQ1** — `middleware.ts` was redirecting anonymous users straight to `/auth/login` the instant the Wizard navigated them to `/decision/{id}?anonymous_token=...`, since only the literal `/decision/new` path was exempted from the auth gate. This broke the entire anonymous funnel (WF-1) end-to-end — confirmed live via `next dev` before and after. Fixed by exempting `/decision/:id` when an `anonymous_token` query param is present, matching the same param every `/api/decision/*` route already accepts. One condition added to `middleware.ts`; no auth-system changes.
- **CQ2** — `pages/api/create-checkout.js` trusted a client-supplied `user_id` with no authentication, and `pages/api/webhook.js` blindly trusted that same `user_id` to grant an active subscription — together allowing anyone to grant a Pro/Premium subscription to an arbitrary account. Both endpoints disabled (return `410 Gone`, touch neither Stripe nor Supabase); the canonical `pages/api/billing/checkout.ts` + `pages/api/billing/webhook.ts` pair (session-cookie-derived `user_id`, unchanged) remains the only functional billing path. `components/App.jsx`'s legacy upgrade buttons were left untouched (out of scope) — they now fail cleanly instead of being exploitable.

**Verification:** `npx tsc --noEmit`, `npx vitest run` (214 tests), and `npx next build` all pass. Both fixes additionally live-tested against a running `next dev` instance (anonymous decision access, unauthenticated redirect still intact, both legacy billing endpoints returning `410` with no side effects).

---

## UX Critical Fixes (outside IR01 numbering)

Three UX defects requested directly by the Founder, fixed and tracked the same way as CQ1/CQ2. Full detail in `IR01 - MVP Implementation Roadmap.md`'s "UX Critical Fixes" section.

- **UX1** — The landing page (`components/App.jsx`, `components/HeroBanner.jsx`, rendered by `pages/index.js`) was still the legacy pre-pivot "DecisionPilot" product: a comparison-shopping quiz with fabricated review counts, fake bank loan rates, a fake animated user counter, fake ratings, invented testimonials, a fake partners strip, and false scale claims (66+ categories, 30 languages, 190+ countries). Rebuilt the hero, positioning copy, "how it works" steps, categories (now the real 9 from `Decision.constants.ts`, linking to `/decision/new?category=...`), FAQ, and footer to honestly describe DecisionOS; removed the fabricated-data sections entirely; rebranded to "DecisionOS" throughout. The legacy quiz engine (`QuestionScreen`/`ResultsScreen`/`ChatScreen`/`FavoritesScreen`) was left in place, just no longer linked to from the landing content — not deleted (confirmed with the Founder before starting; a fresh discovery of the fabricated-data scope also prompted a follow-up confirmation mid-task).
- **UX2** — `features/decision-chat/Chat.tsx`'s "Update Decision" prompt claimed clicking it would update the decision and "trigger a new analysis." It only called the existing `advanceState('draft')` and closed the chat — no content was applied, no analysis was triggered. Corrected the copy and renamed the button to "Reopen to edit" to match what actually happens; no behavior change. Note: this intentionally deviates from H08 §11's literal "Update Decision" label, per this session's explicit instruction — flagged rather than silently diverged.
- **UX3** — `History.tsx` and `Chat.tsx`'s "Upgrade plan" buttons called `router.push('/account')`, a 404 (previously flagged here as a known gap). Both now route to `/#pricing`; added `id="pricing"` to the existing `<PricingSection />` wrapper in `App.jsx` so the anchor lands on the real, already-functional Stripe checkout flow.

**Verification:** `npx tsc --noEmit`, `npx vitest run` (214 tests, unchanged), and `npx next build` all pass for all three.

---

## Handbook Documentation — H14–H19 (outside IR01 numbering)

The six remaining stub Company Handbook documents (title + `Status: Draft` only, no content) were authored in full, one at a time with approval between each: **H14** (Security & Privacy), **H16** (Testing & QA), **H17** (Product Roadmap), **H15** (Operations Handbook), **H18** (Business Model), **H19** (Glossary). Each consolidates and cross-references controls, processes, or terminology already specified across H01–H13 rather than introducing new scope, and each carries its own "Known Gaps" section recording discrepancies found against the live repo instead of describing them as resolved (e.g., H14: no GDPR account-erasure route exists; H16: `core/ai/call.ts` has no test file; H15: Vercel was behind GitHub at time of writing; H18: no unit-economics document exists in the Handbook). Full detail in each document and in `DecisionOS/Releases/CHANGELOG.md`.

**Verification:** documentation only — no code changed, no test/build verification applicable.

---

## Legal Pages Rewrite — Privacy, Terms, Cookies (outside IR01 numbering)

All three legal pages still described the pre-pivot legacy "DecisionPilot" comparison-marketplace product (category quizzes, a fictional affiliate partner list, the legacy "Ai·sel" persona, USD pricing, a "daily Free-plan limit" that never matched the real Free tier) — first flagged as a known gap while authoring H14 §12.2. Fixed as three sequential, separately-approved passes against H12 §13, H14, and H18.

- **`pages/privacy.js`** — real Decision Object data model, new anonymous-vs-authenticated-use and AI-processing sections, real subprocessor register (Supabase, Anthropic, Stripe, Vercel, Google Analytics, Amazon Associates/CJ Affiliate/Awin), and honest retention language (self-service per-Decision deletion vs. contact-support for full account erasure, since no self-service GDPR route exists yet).
- **`pages/terms.js`** — real product description, real Free/Pro/Premium tiers at €-pricing (was USD), BR-10's no-core-flow-gating rule, corrected affiliate disclosure, removed the "Ai·sel" reference.
- **`pages/cookies.js`** — corrected necessary-cookies description (Supabase session cookie, `localStorage` consent choice), removed the fictional daily-count/language-preference items, corrected the third-party cookie section to the real affiliate networks.

Rebranded "DecisionPilot" → "DecisionOS" in all three pages' own content/`<title>`. Shared `LegalLayout` chrome untouched each time — out of scope.

**Verification:** `npx next build` passes after each change; `/privacy`, `/terms`, `/cookies` all compile cleanly.

---

## Test Coverage — `core/ai/call.ts` (outside IR01 numbering)

`core/ai/call.ts` had no dedicated test file and sat at 50% line coverage — flagged while authoring H16 §12. Added `core/ai/call.test.ts` covering the missing-API-key guard, request construction, the successful response path (`cleanJSON` fence-stripping, multi-block concatenation, default-to-0 usage), and all three Anthropic error-response shapes — the paths `acceptance-criteria.test.ts` (timeout, `parseAIJSON`) didn't already cover. No production code changed.

`call.ts`: 50% → 100% line coverage. Overall `core/`: 97.06% → 100% lines. Tests: 214 → 225.

**Verification:** `npx vitest run --coverage` (225 tests, 7 files), `npx tsc --noEmit`, `npx next build` all pass.

---

## Test Coverage — API Routes (outside IR01 numbering, in progress)

H10 §11.3 requires four specific API route behaviors to be tested; no `pages/api/**/*.test.ts` file existed anywhere in the repo (H16 §12). Being closed one route at a time, starting with the most security-critical.

**`pages/api/billing/webhook.ts`** (14 tests) — `@/lib/supabase/admin` is mocked; Stripe signature verification is **not** mocked — tests sign real payloads with the real `stripe` SDK's `generateTestHeaderString()`. Covers the method guard, all three signature-rejection paths, both handled event types including their warning-only and 500-on-error branches, and an unhandled event type. 0% → 100% coverage.

**`pages/api/decision/analyze.ts`** (13 tests) — the AI Analysis/Recommendation Engine orchestration route, and H10 §11.3's second named requirement (state reversion to `draft` on AI failure). `callAI` is mocked; `parseAIJSON`, `buildAnalysisPrompt`/`buildRecommendationPrompt`, and `validateAnalysisOutput`/`validateRecommendationOutput` are the real, already-tested `core/ai/` functions. Covers auth/ownership/state guards, revert-to-draft-and-503 on missing components or an Analysis Engine failure, one-regeneration recovery, the full happy path, and partial success when the Recommendation Engine fails. 0% → 87.5% lines.

**`pages/api/decision/save.ts`** (18 tests) — all input-validation branches, ownership, the successful write path with version increment, and all three IR01-075b Action Plan completion-toggle branches. 0% → 100% lines.

**`pages/api/decision/[id].ts`** (13 tests) — `GET`'s auth/404/success/history-merge paths and `DELETE`'s auth/404/204/500 paths. 0% → 100% lines.

**`pages/api/decision/state.ts`** (16 tests) — transition validation, the decision_made precondition, and the Action Plan Engine's success path plus four distinct failure modes (all resulting in `200` + `action_plan_error`, per the route's own design). 0% → 100% lines.

**Architectural correction:** Next.js's Pages Router builds every file under `pages/` as a route — `next build` was building `webhook.test.ts` and the four new `pages/api/decision/*.test.ts` files as live, empty production routes (e.g. `/api/decision/analyze.test`). Caught before any push (`webhook.test.ts` had never been committed). Fixed by moving all five test files plus their shared helper to `__tests__/api/...`, mirroring the `pages/api/...` structure outside Next's routing scope — a documented, deliberate deviation from H10 §11.4 for `pages/api/` specifically. Confirmed via `next build` that no `.test` routes remain, and cleared the stale `.next/` cache.

**Combined result:** suite 225 → 299 tests (12 files). No production route file was modified.

**Not done yet — next priority, pending approval:** H10 §11.3's fourth named requirement, anonymous transfer on signup, needs its actual implementation located first — `pages/api/auth/callback.ts` (12 lines) only calls `exchangeCodeForSession` and redirects; it does not contain the transfer logic itself.

**Verification:** `npx vitest run` (299 tests, 12 files), `npx tsc --noEmit`, `npx next build` all pass; confirmed no `.test` routes appear in the build output.

---

## Anonymous → account transfer: traced, and found to be unimplemented (outside IR01 numbering)

Traced the full execution path per instruction, not assuming `pages/api/auth/callback.ts` was responsible:

- `Wizard.tsx` creates an anonymous Decision and stores its `anonymous_token` in `localStorage['anon_decision_token']`.
- `pages/auth/login.tsx` and `signup.tsx` both read that key and write it into a cookie before calling Supabase Auth, each citing "H13 §2.1" in a comment claiming this transfers ownership.
- **Nothing reads that cookie.** `callback.ts` only exchanges the auth code and redirects; `middleware.ts` only touches the Supabase session cookie and the unrelated `anonymous_token` URL query param; `create.ts` always inserts a fresh row and never checks for a prior anonymous one; no route reads `req.cookies['anon_decision_token']` anywhere; the `decisions` table migrations define the owned-XOR-anonymous constraint but contain no trigger that ever flips one into the other.

**The feature does not exist** — the code writes a cookie nobody consumes. Same class of Handbook-vs-reality gap as CQ1/CQ2 and the existing H14/H16 Known Gaps, not a new pattern. No tests were added (nothing real to test) and no code was changed (building the missing claim step is a production-behavior change out of this task's scope). Full detail, including every file checked, is in `IR01 - MVP Implementation Roadmap.md`'s matching section.

**Verification:** `npx vitest run` (299 tests, unchanged) and `npx next build` both pass, confirming no code was touched during this investigation.

**Recommendation:** a future task should build the actual claim step (most naturally in `callback.ts`, reading the cookie and running the `UPDATE decisions ... WHERE anonymous_token = ...` H09 already describes) and add its tests in that same task.

---

## Accessibility Audit + Critical Fixes (outside IR01 numbering)

A read-only audit against H08 §14's WCAG 2.1 AA target found 9 issues (3 Critical, 4 Recommended, 2 Nice to have; estimated ≈80% overall). Two were approved for immediate fix; the rest were explicitly left untouched per instruction.

**Fix 1 — Contrast (`lib/design-tokens.css`):** three shared tokens used as text color across 15+ components failed WCAG AA 4.5:1 — `--color-text-muted` (`#94A3B8`, ≈2.56:1), `--color-success` (`#10B981`, ≈2.54:1), `--color-danger` (`#EF4444`, ≈3.76:1). Darkened to `#5B6B80` (≈5.2–5.4:1), `#047857` (≈5.2–5.5:1), and `#B91C1C` (≈6.1–6.5:1) respectively — each with a comfortable safety margin, not a bare pass. Only the token values changed; no component files touched, so all 30+ usage sites pick up the fix automatically. `--color-danger-dark` (button hover) was left as-is — a cosmetic-only nuance, not a functional issue.

**Fix 2 — Skip link (`components/layout/PageLayout.tsx`):** added a standard skip-to-content link (hidden until keyboard-focused) as the first element in the one shared layout component identified in the audit, targeting a new `id="main-content"` on the existing `<main>`. CSS added alongside the existing global focus-ring/reduced-motion rules in `design-tokens.css` — no new file created. Not added to `pages/auth/*` or the legacy homepage, since neither uses `PageLayout`.

**Verification:** `npx vitest run` (299 tests, unchanged), `npx tsc --noEmit`, `npx next build` all pass. Exactly two files changed — confirmed via `git diff`.

**Files changed:** `lib/design-tokens.css`, `components/layout/PageLayout.tsx`.

---

## Performance Audit + Critical Fix #1 (outside IR01 numbering)

A read-only performance audit found 1 Critical, 4 Recommended, 2 Nice-to-have issues (≈78% overall). Only the Critical fix was approved.

**Finding:** `App.jsx` (4,812 lines) compiled to a single ~394 KB chunk downloaded by every homepage visitor. Most of it was the legacy quiz engine (`QuestionScreen`/`ResultsScreen`/`ChatScreen`/`FavoritesScreen`/`ProfileModal`).

**Correction found mid-implementation:** the quiz engine is not actually unreachable — the current homepage still renders a live Favorites button, Profile button, and an Ai·sel mascot chat trigger, all of which lead into that code. Deleting it would have broken those three currently-working buttons. Flagged to the Founder; no response in the wait window; proceeded with the option consistent with the task's own constraints (preserve functionality, no redesign).

**Fix:** code-split (not deleted). Exhaustively mapped all 16 module-scope constants and 29 functions in `App.jsx` to separate what only the legacy screens use from what the real `Landing`/`TopNav` also need. Moved the legacy-exclusive ~2,700 lines to a new `components/legacy/QuizEngine.jsx`, lazy-loaded via five `next/dynamic({ ssr: false })` calls — loaded together, once, only if Favorites/Profile/the mascot chat is actually clicked. 5 genuinely shared identifiers (`C`, `catName`, `CATEGORIES_LIST`, `STATUSES`, `getIcon`) were exported from `App.jsx` rather than duplicated. Two latent extraction bugs (an off-by-one orphaning `ASEL_ACCESSORY_Q`'s closing brace; `BUDGET_RANGES`/`TECH_LEVELS` initially left behind) were caught during verification, before the build.

**Result:** `App.jsx`'s chunk 403,509 → 231,848 bytes (≈42.5% smaller); new on-demand chunk 173,262 bytes; homepage's own "First Load JS" unchanged at 152 kB (already deferred behind the outer dynamic import).

**Verification:** `npx next build`, `npx vitest run` (299 tests, unchanged), `npx tsc --noEmit` all pass. Confirmed via string-level chunk inspection that quiz-only content is exclusively in the new chunk. **Live browser click-testing was not completed** — no browser-automation tool was available without installing a new dependency, judged out of scope. Recommend a manual smoke test (click Favorites/Profile/Ai·sel-chat once) before treating this as fully verified.

**Not done, per instruction:** no other performance finding was touched.

**Files changed:** `components/App.jsx` (modified), `components/legacy/QuizEngine.jsx` (new).

---

## Next Task

IR01-075b and IR01-075c are both complete, and the UX1–UX3 critical fixes above are done. The only remaining Phase 5 task is:

**IR01-076 — Phase 5 E2E user flow verification** (blocked, unchanged this round)
Manual, in-browser verification of all five H05 primary workflows (Anonymous, Returning user, Chat, History, Billing) at 1440px and 375px, per the roadmap's acceptance criteria — not a code-writing task. Requires a running app instance with real Supabase/Stripe test-mode credentials and an actual browser session (login, Stripe Checkout test card, etc.), unlike IR01-065–075c which were all static code changes.

IR01-076 itself, and IR01-080 through IR01-085, remain blocked on the missing environment secrets and cannot proceed regardless. The Final Code Quality Audit that produced CQ1/CQ2 also found several Recommended/Nice-to-have findings (CQ3–CQ8) not yet approved for a fix — those remain available as further audit-driven work if approved.

## Next Milestone

IR02 has not been scoped yet — no `IR02` roadmap document exists in `DecisionOS/Implementation Reports/`. The current milestone remains completing IR01: finishing Phase 5 (Decision Wizard through Billing UI, IR01-065 – IR01-076, now including the inserted IR01-075b/075c) and then Phase 6 (Testing & Launch, IR01-077 – IR01-085). IR02 scope is expected to come from the Chief Product Architect & Product Manager once IR01 is closed out.

---

## Working Rules

- Handbook is the source of truth.
- IR01 defines implementation order.
- One task at a time.
- Commit after every task.
- Stop for approval after every task.
