# DecisionOS Changelog

## Performance critical fix: code-split the legacy quiz engine out of the homepage bundle

**Type:** Fix — implements the 1 Critical finding from the read-only performance audit (approved for immediate action; the 4 Recommended and 2 Nice-to-have findings were explicitly left untouched)

**Summary:** `components/App.jsx` (4,812 lines) compiled to a single ~394 KB chunk downloaded by every homepage visitor via the existing `next/dynamic({ ssr: false })` in `pages/index.js`. Most of the file was the legacy quiz engine (`QuestionScreen`, `ResultsScreen`, `ChatScreen`, `FavoritesScreen`, `ProfileModal`, plus ~600 lines of per-category question/product data).

**Correction discovered mid-implementation:** tracing the actual code — not the prior audit summary — showed this code is **not** fully unreachable. The rebuilt `Landing`/legacy `TopNav` still render a live Favorites button (→ `FavoritesScreen` → `QuestionScreen`/`ResultsScreen`), a live Profile button (→ `ProfileModal`), and the always-rendered Ai·sel mascot widget dispatches an `openChat` event `App.jsx` still listens for (→ `ChatScreen`). Deleting this code would have broken three currently-functional buttons on the live homepage. Flagged to the Founder via a clarifying question (recommending code-split over deletion); no response arrived within the wait window, so proceeded on the option consistent with the task's own explicit constraints — preserve all current functionality, do not redesign.

**Fix implemented:** exhaustively mapped every one of `App.jsx`'s 16 module-scope data constants and 29 functions to determine exactly what the 5 legacy screens use exclusively versus what the real `Landing`/`TopNav` also depend on. Extracted the legacy-exclusive ~2,700 lines into a new file, `components/legacy/QuizEngine.jsx`, lazy-loaded from `App.jsx` via five `next/dynamic(..., { ssr: false })` calls pointing at the same module (so all five load together, once, only on first click of Favorites/Profile/the mascot chat trigger). Five identifiers genuinely shared between the real landing page and the legacy engine (`C`, `catName`, `CATEGORIES_LIST`, `STATUSES`, `getIcon`) were exported from `App.jsx` and imported by the new file rather than duplicated. No component's rendering logic, props, or behavior was changed — every moved function is verbatim from its original location. Two latent extraction bugs (a boundary off-by-one orphaning `ASEL_ACCESSORY_Q`'s closing brace, and `BUDGET_RANGES`/`TECH_LEVELS` initially left behind despite being `ProfileModal`-exclusive) were caught during a full cross-reference verification pass before the build, not left for the build to surface.

**Measured result:**
- `App.jsx`'s own chunk: 403,509 → 231,848 bytes (≈42.5% smaller, ≈168 KB saved)
- New `QuizEngine.jsx` chunk: 173,262 bytes, fetched only on-demand
- Homepage's reported "First Load JS": unchanged at 152 kB (already deferred behind the outer dynamic import)

**Verification:** `npx next build` succeeds; confirmed via string-level inspection of the compiled chunks that quiz-only content (a distinctive question-option string) is present exclusively in the new chunk and absent from `App.jsx`'s. `npx vitest run` (299 tests, 12 files) and `npx tsc --noEmit` both pass, unaffected. **Live browser click-verification was attempted but not completed** — no browser-automation tool (`chromium-cli`, Playwright) was available without installing a new dependency, judged out of scope for this task. A manual smoke test (click Favorites, Profile, and the Ai·sel chat trigger once) is recommended before treating this as fully verified.

**Not done, per explicit instruction:** no other performance finding (Context re-render memoization, `useSubscription` caching, triplicated save-component logic, `analyze.ts`'s double alternatives-fetch, `history.ts`'s free-tier sequential queries) was touched.

**Files changed:** `components/App.jsx` (modified), `components/legacy/QuizEngine.jsx` (new).

---

## Accessibility critical fixes: text contrast + skip-to-content link

**Type:** Fix — implements 2 of the 9 findings from the read-only accessibility audit (approved for immediate action; the other 7 were explicitly left untouched)

**Summary:** Following a read-only accessibility audit against H08 §14's WCAG 2.1 AA target, implemented exactly the two fixes approved: shared design-token contrast and a skip-to-content link. No other accessibility improvement was made, per instruction.

**Fix 1 — Text color contrast (`lib/design-tokens.css`):** three shared tokens, used as actual text color in 15+ components (`SaveIndicator`, `Input`, `BottomNav`, `History`, `WizardStep`, `Chat`, `RecommendationView`, form validation/success messages, and more), failed WCAG AA's 4.5:1 ratio for normal text:
- `--color-text-muted`: `#94A3B8` (≈2.56:1) → `#5B6B80` (≈5.16–5.44:1)
- `--color-success`: `#10B981` (≈2.54:1) → `#047857` (≈5.2–5.5:1)
- `--color-danger`: `#EF4444` (≈3.76:1) → `#B91C1C` (≈6.1–6.5:1)

Each new value was chosen with a comfortable margin above 4.5:1 rather than a bare pass, since a hairline margin is fragile to rendering/rounding differences. Only the three token values were edited — no component or CSS-module file was touched, so every usage site (30+, including badges/borders/accents) picks up the fix automatically. `--color-danger-dark` (`#DC2626`, used only for a button hover background) was left unchanged; it is now numerically slightly lighter than the new base `--color-danger`, a cosmetic nuance visible only in a direct swatch comparison, not a functional regression — redesigning that relationship was out of scope.

**Fix 2 — Skip to Content link (`components/layout/PageLayout.tsx`):** added a standard skip-link pattern (visually hidden until keyboard-focused) as the first element inside the one shared layout component the audit identified, targeting a new `id="main-content"` added to the existing `<main>`. The CSS lives in `lib/design-tokens.css` alongside the existing global focus-ring and reduced-motion rules — no new CSS file was created. Addresses WCAG 2.4.1 (Bypass Blocks). Not added to `pages/auth/login.tsx`/`signup.tsx` or the legacy homepage, since neither uses `PageLayout` and the task named only "the shared layout."

**Explicitly not done (7 remaining audit findings, left untouched per instruction):** Chat panel's missing Escape-to-close/focus management, `Button`'s contradictory `role="status"` + `aria-hidden="true"` on its loading spinner, missing `<main>` landmark on auth pages, the `SaveIndicator` spinner's SMIL animation ignoring `prefers-reduced-motion`, multiple `<h1>`s per Wizard flow, the legacy quiz engine's 2 clickable `<div>`s, and the still-unbuilt Decision-deletion confirmation dialog (no client-side delete UI exists yet at all).

**Verification:** `npx vitest run` (299 tests, 12 files, unchanged), `npx tsc --noEmit`, `npx next build` all pass. `git diff` confirms exactly two files changed.

**Files changed:** `lib/design-tokens.css`, `components/layout/PageLayout.tsx`.

---

## Investigation: anonymous → account transfer flow is unimplemented

**Type:** Investigation only — no code changed, no tests added

**Summary:** H10 §11.3's third named testing requirement is "anonymous Decision Object transfer on account creation." Rather than assume `pages/api/auth/callback.ts` was responsible (it had already been ruled out in the prior API-routes task as just 12 lines calling `exchangeCodeForSession` and redirecting), traced the actual execution path end to end: `features/decision-wizard/Wizard.tsx` stores the anonymous token in `localStorage`; `pages/auth/login.tsx` and `signup.tsx` both copy it into a `document.cookie` before authenticating, each under a comment citing "H13 §2.1" and claiming this transfers ownership. **Nothing ever reads that cookie.** Checked exhaustively: `callback.ts` (no cookie access at all), `middleware.ts` (only touches the Supabase session cookie and an unrelated `anonymous_token` URL query param), `pages/api/decision/create.ts` (always inserts a fresh row, never checks for a prior anonymous one to link), every route under `pages/api/` (`req.cookies` grep, no hits), and the `decisions` table's migrations (schema constraint only — no trigger or function that ever moves a decision from anonymous to owned).

**Conclusion:** the anonymous-to-account transfer feature does not exist — the code writes a cookie nobody consumes. This is the same class of Handbook-vs-reality gap CQ1/CQ2 and the H14/H16 Known Gaps sections already documented, not a new pattern.

**Why no tests were added:** per instruction, tests are only added for the real implementation. There is no server-side claim logic to test — a test asserting `callback.ts` does nothing with the cookie would not be a meaningful regression test. Building the missing claim step itself would be a production-behavior change outside this task's scope ("do not modify production behavior unless strictly necessary").

**Verification:** `npx vitest run` (299 tests, 12 files, unchanged) and `npx next build` both pass, confirming this investigation made no code changes.

**Recommendation:** scope a dedicated future task to build the actual claim step (most naturally: `callback.ts` reading the `anon_decision_token` cookie and running the `UPDATE decisions SET owner_id = ..., anonymous_token = null, expires_at = null WHERE anonymous_token = ... AND expires_at > now()` update H09 already describes), then add its tests as part of that same task.

**Files changed:** none.

---

## Unit tests added for the four critical Decision API routes + test-location fix

**Type:** Test coverage, plus a build-hygiene correction — closes the remainder of the H10 §11.3 / H16 §12 gap

**Summary:** Added unit tests for `pages/api/decision/analyze.ts`, `save.ts`, `[id].ts`, and `state.ts` — the four priority routes named in this task, on top of the `webhook.ts` tests added previously. 60 new tests (225 → 299 total, 8 → 12 files). No production route file was modified in any of the five.

**`analyze.ts` (13 tests)** — the most complex route in the app, and H10 §11.3's second named requirement: state reversion to `draft` on AI Analysis failure. `callAI` is mocked (the network boundary); `parseAIJSON`, `buildAnalysisPrompt`/`buildRecommendationPrompt`, and `validateAnalysisOutput`/`validateRecommendationOutput` are the real, already-100%-tested `core/ai/` functions — only the AI call itself is a test double. Covers guards, revert-to-draft-and-`503` on missing components or an Analysis Engine failure (the named requirement), one-regeneration recovery, the full first-try happy path, and partial success (`recommendation_available: false`) when the Recommendation Engine fails or stays invalid after regeneration. 0% → 87.5% line coverage.

**`save.ts` (18 tests)** — all input-validation branches, ownership, the successful write path (version increment, parent-decision touch), `500`s on write failure, and all three branches of the IR01-075b Action Plan completion-toggle exception. 0% → 100% line coverage.

**`[id].ts` (13 tests)** — `GET`'s auth/404/success (with and without `include_history`)/`500` paths for both the authenticated-owner and anonymous-token cases, and `DELETE`'s auth/404/204/500 paths. 0% → 100% line coverage.

**`state.ts` (16 tests)** — transition validation (using the real `validateStateTransition`), the decision_made-without-Final-Decision precondition, and the Action Plan Engine's success path plus four distinct failure modes, all correctly resulting in `200` + `action_plan_error` rather than failing the whole request. 0% → 100% line coverage.

**Architectural correction found and fixed along the way:** Next.js's Pages Router treats every file under `pages/` as a route. `next build` was building (and would have shipped) `pages/api/billing/webhook.test.ts` and the four new `pages/api/decision/*.test.ts` files as live, empty production API routes (`/api/billing/webhook.test`, `/api/decision/analyze.test`, etc.) — confirmed by checking `next build`'s own route listing. `webhook.test.ts` had never actually been committed, so nothing had shipped. Fixed by moving all five test files and their shared `testHelpers.ts` to `__tests__/api/...` (mirroring `pages/api/...`, outside Next's routing scope), importing each handler via a relative path back into `pages/`. This is a deliberate, documented deviation from H10 §11.4's "test files live alongside the code they test" for `pages/api/` specifically — `core/`/`context/` tests are unaffected. Deleted the stale `.next/` build cache that still contained pre-move compiled test-route artifacts.

**Verification:** `npx vitest run` (299 tests, 12 files), `npx tsc --noEmit`, `npx next build` all pass; confirmed via the build's route list that no `.test` routes are present.

**Not done yet — next priority, pending approval:** H10 §11.3's fourth named requirement — anonymous Decision transfer on signup — still needs its actual implementation located; `pages/api/auth/callback.ts` (12 lines) only calls `exchangeCodeForSession` and redirects, and does not contain the transfer logic itself.

**Files changed:** `__tests__/api/billing/webhook.test.ts`, `__tests__/api/decision/{analyze,save,state,[id]}.test.ts`, `__tests__/api/decision/testHelpers.ts` (all new; the `pages/api/` originals were removed since they were never committed).

---

## Unit tests added for `pages/api/billing/webhook.ts` (first API route test)

**Type:** Test coverage — closes the H10 §11.3 / H16 §12 gap (no `pages/api/**/*.test.ts` file existed anywhere in the repo)

**Summary:** Added `pages/api/billing/webhook.test.ts`, the highest-priority target among the API routes H10 §11.3 requires tests for: Stripe webhook signature validation, the same class of route CQ2 found a real vulnerability in. `@/lib/supabase/admin` is mocked (it throws at import time without real Supabase credentials); Stripe signature verification is **not** mocked — tests use the real `stripe` SDK's `webhooks.generateTestHeaderString()` to sign real payloads with a real HMAC secret, so the signature-rejection tests exercise the actual `stripe.webhooks.constructEvent()` logic. No production code was changed — `webhook.ts` itself was not touched.

**Coverage:** 14 tests covering the `405` method guard; all three signature-rejection paths (missing header, tampered body, wrong secret) plus confirmation the verification error is never echoed to the client; `checkout.session.completed` (upsert with `user_id`, `plan` defaulting to `'pro'`, the no-`user_id` warning path, and a `500` on upsert failure); `customer.subscription.deleted` (downgrade to free/cancelled, the no-matching-row warning path, and a `500` on update failure); an unhandled event type falling through to `200`; and the string-vs-Buffer branch in `readRawBody`. `webhook.ts`: 0% → 100% statements/branches/functions/lines (measured via a one-off `--coverage.include` CLI override, not a persisted `vitest.config.ts` change, since broadening the coverage scope to all of `pages/api/` before more routes are tested would fail the existing 80% threshold gate on the untested remainder).

**Verification:** `npx vitest run` (239 tests, 8 files, was 225/7), `npx tsc --noEmit`, `npx next build` all pass.

**Next priorities (not started, pending approval):** `pages/api/decision/analyze.ts` (state reversion to `draft` on AI failure — H10 §11.3's second named requirement), `pages/api/decision/save.ts` (component write validation), `pages/api/decision/[id].ts`/`state.ts` (ownership/404-vs-403 checks). H10 §11.3's third named requirement — anonymous Decision transfer on signup — needs its actual implementation located first: `pages/api/auth/callback.ts` (12 lines) only calls `exchangeCodeForSession` and redirects; the transfer logic itself lives elsewhere.

**Files changed:** `pages/api/billing/webhook.test.ts` (new file only).

---

## Documentation sync — IR01 Roadmap and Development Status before push

**Type:** Documentation only — no code changed

**Summary:** Pre-push verification pass. Confirmed IR01-076 still correctly states `Status: Blocked — environment missing required secrets` with the missing Stripe/Supabase/Anthropic variables explicitly listed — no change needed. `IR01 - MVP Implementation Roadmap.md` was missing dedicated sections for three "outside IR01 numbering" efforts that already had CHANGELOG entries but no roadmap-level record (unlike CQ1/CQ2 and UX1–UX3, which already had both): added "Handbook Documentation — H14 through H19," "Legal Pages Rewrite — Privacy, Terms, Cookies," and "Test Coverage — `core/ai/call.ts`" sections, in the same spot and style as the existing Critical Fixes / UX Critical Fixes sections (between IR01-079 and IR01-080). Updated `DecisionOS/Handoff/Development Status.md`'s "Most recent work" summary and Repository section, and added matching "Legal Pages Rewrite" and "Test Coverage" sections there too, mirroring its existing "Handbook Documentation" section.

**Files changed:** `DecisionOS/Implementation Reports/IR01 - MVP Implementation Roadmap.md`, `DecisionOS/Handoff/Development Status.md`.

---

## Unit tests added for `core/ai/call.ts`

**Type:** Test coverage — closes the gap flagged in H16 §12 (no test file, 50% line coverage)

**Summary:** `core/ai/call.ts` (the Anthropic API fetch wrapper) had no dedicated test file; only its 29-second timeout path and `parseAIJSON` were incidentally covered by `acceptance-criteria.test.ts` (AAC-06). Added `core/ai/call.test.ts` covering the remaining `callAI` paths: the missing-API-key guard, request construction (URL, headers, body shape), the successful response path (including `cleanJSON`'s markdown-fence stripping, multi-block text concatenation, and default token-usage-to-0 when `usage` is absent), and Anthropic's error-response shapes (`type: "error"`, a bare `error` field, and the no-message fallback). No production code was changed — `call.ts` itself was not touched, only the new test file was added.

**Coverage impact:** `core/ai/call.ts` moved from 50% to 100% line coverage. Overall `core/` coverage: statements 95.5% → 98.26%, branches 86.2% → 90.68%, lines 97.06% → 100%. Test count: 214 → 225 (11 new tests, all in the new file).

**Verification:** `npx vitest run --coverage` (225 tests passing, 7 files), `npx tsc --noEmit`, and `npx next build` all pass.

**Files changed:** `core/ai/call.test.ts` (new file only).

---

## Cookie Policy rewritten to match the actual DecisionOS product

**Type:** Content fix — closes the last of the three legacy-copy drifts flagged across the Privacy Policy and Terms of Service tasks

**Summary:** `pages/cookies.js` described "your daily Free-plan decision count" and "language preference" as strictly-necessary cookies (neither exists — Free tier is unlimited Decisions with a History cap, not a daily count, and DecisionOS is English-only in MVP with no language switcher), and listed the same fictional affiliate partners (AutoScout24, CHECK24, Booking.com) as third-party cookie setters. Rewrote against H12 §13 and H14 (§3.2 session cookies, §9.3 consent gating, §6 subprocessor register) — no legal statement invented beyond what those documents establish.

**Changes:**
- §2 (cookies we use) corrected to describe what's actually necessary: the Supabase session cookie (HttpOnly, up to 30 days per H09 §11) and the cookie-consent choice (stored via `localStorage`, per the real `CookieBanner.js` implementation) — removed the non-existent daily-count and language-preference items.
- §4 (third-party cookies) replaced the fictional partner list with the real affiliate networks (Amazon Associates, CJ Affiliate, Awin), and corrected the trigger condition to match Terms/Privacy: only when the user's own Final Decision maps to a purchasable product.
- §5 (cookie duration) corrected to state the actual 30-day session length and consent-choice persistence (until browser data is cleared), removing the stale "daily Free-plan limits" reference.
- Intro line broadened to "cookies and similar technologies (such as local storage)" since the consent choice itself is `localStorage`, not a cookie — technically accurate rather than glossing over the mechanism.
- Rebranded "DecisionPilot" → "DecisionOS" in the page's own content and `<title>`, matching the Privacy Policy and Terms of Service. Shared `LegalLayout` chrome not touched — out of scope.

**Verification:** `npx next build` passes; `/cookies` compiles cleanly (2.38 kB), no errors. No other files were touched.

**Files changed:** `pages/cookies.js` (content rewritten in full; layout/props unchanged).

---

## Terms of Service rewritten to match the actual DecisionOS product

**Type:** Content fix — same legacy-copy drift as the Privacy Policy, flagged as out of scope in that task's CHANGELOG entry

**Summary:** `pages/terms.js` still described DecisionOS as "an AI-assisted comparison and recommendation tool" for "vacations, cars, electronics," referenced a legacy in-app persona ("the Ai·sel character"), listed the same fictional affiliate partners as the old Privacy Policy (AutoScout24, CHECK24, Booking.com, Wayfair, Sixt, Europcar), and described Free-tier billing as "limited daily decisions" at USD pricing — none of which match the real product or business model. Rewrote the page's content in full against H12 §13, H14 (§6 subprocessor register), and H18 (§3 pricing tiers, §4 affiliate constraints) — no legal statement invented beyond what those documents already establish.

**Changes:**
- §1 rewritten to describe the actual Decision Object flow (context/goal/constraints/alternatives → AI analysis/recommendation/action plan → outcome tracking) instead of a category-comparison tool.
- §2 (Not professional advice) broadened from "AI chat responses" to cover recommendations, analysis, and action plans generally — same disclaimer intent, correct scope.
- §3 (Plans and billing) corrected to the real tiers and pricing from H18 §3/H06 FR-11: Free is unlimited Decisions with a 10-item History cap (not "limited daily decisions"), Pro €4.99/month and Premium €9.99/month (was USD), and added BR-10's rule that no step of the Decision process is ever gated behind a paid plan. Cancellation wording corrected to state the account reverts to Free with no data loss (H07/H18 §5), not just "access continues until period end."
- §4 (Affiliate disclosure) replaced the fictional retailer list with the real affiliate networks (Amazon Associates, CJ Affiliate, Awin) and the actual constraint that a link only ever points to the option the user's own Final Decision named, never a sponsored alternative — matching the Privacy Policy's equivalent section.
- §5 (Acceptable use) — "abuse the Free plan's limits" (a daily-cap concept that no longer applies) generalized to "circumvent plan limits."
- §6 (Intellectual property) — removed the reference to the legacy "Ai·sel" chat persona, which belongs to the unreachable legacy quiz engine UX1 left in place, not the current product surface.
- Rebranded "DecisionPilot" → "DecisionOS" in the page's own content and `<title>`, matching the Privacy Policy and UX1's earlier site rebrand. Shared `LegalLayout` chrome not touched — out of scope.

**Not changed (explicitly out of scope):** `pages/cookies.js` has the same legacy affiliate-list drift and was left untouched — flagged for a future task, not fixed in this pass.

**Verification:** `npx next build` passes; `/terms` compiles cleanly (3.44 kB). No other files were touched.

**Files changed:** `pages/terms.js` (content rewritten in full; layout/props unchanged).

---

## Privacy Policy rewritten to match the actual DecisionOS product

**Type:** Content fix — closes the legal-copy drift flagged in H14 §12.2

**Summary:** `pages/privacy.js` still described the pre-pivot legacy product — "Decision answers" from category quizzes (vacation, car, phone) and an "Affiliate partners" list naming AutoScout24, CHECK24, Booking.com, Wayfair, Sixt, and Europcar, none of which DecisionOS has any relationship with. Rewrote the page's content in full against H12 §13 (data classification/GDPR), H14 (§2 data inventory, §6 subprocessor register, §9 privacy program), and H18 (§3 pricing tiers) — no legal statement invented beyond what those documents already establish.

**Changes:**
- Replaced the legacy quiz/comparison-marketplace description with an accurate summary of the real product (Decision Object: context/goal/constraints/alternatives → AI analysis/recommendation → outcome/reflection tracking).
- Added a dedicated "Anonymous and authenticated use" section (§2) explaining the 48-hour anonymous-Decision window (BR-04) and automatic transfer on signup.
- Added a dedicated "How AI processing works" section (§4) describing what's sent to Anthropic, the structured/sanitized injection defense, and that the AI never acts on or accesses the account.
- Replaced the fictional retailer partner list with the real subprocessor register from H14 §6: Supabase, Anthropic, Stripe, Vercel, Google Analytics, and the three real affiliate networks (Amazon Associates, CJ Affiliate, Awin) — described with the actual constraint that they only apply to the user's own chosen option and never influence the recommendation (H07/H18).
- Rewrote data-retention language (§7) to state accurately what's self-service today (per-Decision deletion from the Dashboard, live) versus what requires contacting support (full account erasure — no self-service route exists yet, per H14 §12.1). This makes the policy honest about current capability rather than promising a route that doesn't exist.
- Rebranded "DecisionPilot" → "DecisionOS" throughout the page's own content and `<title>`, matching UX1's earlier rebrand of the marketing site. The shared `LegalLayout` chrome (nav wordmark, footer) was not touched — out of this task's scope.

**Not changed (explicitly out of scope):** `pages/terms.js` and `pages/cookies.js` have the same legacy-product drift (comparison-marketplace framing, the same fictional affiliate list, USD pricing) and were left untouched — flagged here for a future task, not fixed in this pass. No GDPR account-deletion endpoint was implemented; §7/§8 direct users to contact support for full account erasure, per this task's explicit instruction to wait for approval before building that endpoint.

**Verification:** `npx next build` passes; `/privacy` compiles cleanly (4.51 kB). No other files were touched.

**Files changed:** `pages/privacy.js` (content rewritten in full; layout/props unchanged).

---

## H19 — Glossary handbook document written

**Type:** Documentation only — no code changed

**Summary:** `DecisionOS/Company Handbook/H19 - Glossary.md` was a 3-line stub, the last of the six placeholder documents (H14–H19) now completed. Wrote the full glossary by reading H03 (The Decision Model) and H05 (Product Workflow) in full for the first time this session — the two documents defining the thirteen Decision components and the seven-state lifecycle precisely — plus H04's six System Layers (Infrastructure, Data, Intelligence, Decision, Experience, Interface), and consolidating terminology already surfaced while authoring H14/H16/H17/H18. No term was invented; every entry cites the Handbook section it restates.

**Sections added:** Product Terms; Decision Lifecycle Terminology (the seven states plus lifecycle/transition vocabulary); AI Terminology; Technical Terms; Business Terminology; Acronyms (including the project's own ad hoc tracking IDs — CQ1/CQ2, UX1–3, IR01/IR02 — alongside standard ones like GDPR, RLS, JWT).

**Files changed:** `DecisionOS/Company Handbook/H19 - Glossary.md` (written in full).

---

## H18 — Business Model handbook document written

**Type:** Documentation only — no code changed

**Summary:** `DecisionOS/Company Handbook/H18 - Business Model.md` was a 3-line stub (title + `Status: Draft`, same state as H19). Wrote the full document by consolidating the commercial model already specified across H01 (vision), H02 (principles), H06 Part 4/FR-11 (subscription tiers and business rules), and H07 (positioning, pricing rationale, acquisition, retention, revenue) into an executive-level reference — H07 remains the detailed source; H18 does not replace it. No new pricing, tier, or revenue mechanism was introduced.

**Sections added:** Value Proposition; Customer Segments; Pricing Model (Free/Pro/Premium, BR-10's no-core-flow-gating rule); Revenue Model (subscriptions, affiliate, future API/institutional); Growth Strategy (acquisition phasing, retention mechanics); Cost Structure; Success Metrics; Risks; Assumptions; Known Gaps.

**Known Gaps section (§10) — findings surfaced while writing, not fixed in this pass:**
- No unit-economics/COGS document exists anywhere in the Handbook — §6 (Cost Structure) is qualitative only; no Vercel/Supabase/Anthropic/Stripe cost figures are documented, so gross margin cannot currently be calculated from Handbook sources.
- No live production revenue yet — H07's own pre-launch criteria require production (not test-mode) payments before launch is complete, so §4's projections remain entirely forward-looking.
- Cross-document principle-number drift: H07 (and other already-written documents) cite H02 principles by number that don't match H02's actual current numbering — a pre-existing inconsistency, flagged rather than silently renumbered.

**Risks and Assumptions sections** were built from realities already on record elsewhere (solo-operator concentration risk per H14/H15; Anthropic dependency; the blocked pre-launch verification tasks per H16/H17; the `/privacy` legacy-copy drift already flagged in H14 §12.2) rather than speculative additions.

**Files changed:** `DecisionOS/Company Handbook/H18 - Business Model.md` (written in full).

---

## H15 — Operations Handbook document written

**Type:** Documentation only — no code changed

**Summary:** `DecisionOS/Company Handbook/H15 - Operations Handbook.md` was a 3-line stub (title + `Status: Draft`, same state as H18/H19). Wrote the full document, consolidating operations already specified across H09 (§12 Deployment, §13 Environment Variables), H10 (§12 Error Logging, §14 Security Checklist, §17 Release Checklist), H12 (§10 Data Lifecycle, §11 Backup and Recovery), and H14 (§10 Incident Response), citing rather than duplicating. Verified against the live repo, not assumption: confirmed both pg_cron migration files exist in `supabase/migrations/` (`20260615000000_create_anonymous_cleanup_cron.sql`, `20260615000001_create_stuck_analysis_cleanup_cron.sql`) and re-checked `DecisionOS/Handoff/Development Status.md`'s repository sync note.

**Sections added:** Scope; Environment Management; Secrets Management; Deployment; Backups and Recovery; Monitoring; Logging; Scheduled Jobs and Maintenance; Incident Handling; Release Process; Operational Checklist; Known Gaps.

**Known Gaps section (§12) — findings surfaced while writing, not fixed in this pass:**
- Vercel production is behind GitHub `main` — GitHub synced through IR01-070 (`fa4a636`) with IR01-070b–075c committed but not pushed; Vercel synced only through IR01-060. Production does not yet include Phase 5 frontend work from IR01-061 onward.
- No monitoring/alerting service is live — the Sentry integration and 2%-failure-rate AI alert are specified (H10 §12.3) but not built; incident detection currently depends on manually checking Vercel/Supabase/Stripe dashboards.
- `docs/adr/`, referenced by H10 §17.1's release checklist, does not exist yet.
- No independent check that the two live pg_cron jobs are actually firing on schedule (vs. merely scheduled) has been performed.

**Files changed:** `DecisionOS/Company Handbook/H15 - Operations Handbook.md` (written in full).

---

## H17 — Product Roadmap handbook document written

**Type:** Documentation only — no code changed

**Summary:** `DecisionOS/Company Handbook/H17 - Product Roadmap.md` was a 3-line stub (title + `Status: Draft`, same state as H15/H18/H19). Wrote the full document by collecting every "post-MVP" note already scattered across H01–H16 (grep-verified, not invented — H06 Part 6, H07 Parts 2/4/6, H09 §17, H10 §11/§12, H11 §13, H12 §14, H13) and sequencing them into v1.1/v1.2/long-term tiers using dependency logic already stated in those sources (e.g. Learning Pipeline explicitly needs MVP-collected Outcome/Reflection data first; Public API explicitly waits on product-market fit per H06 itself). No feature not already named somewhere in H01–H16 was added.

**Sections added:** Vision (H01 condensed); Prioritization Principles (H02 Decision Rule, H06 Part 7 P1/P2/P3, H07 phased go-to-market logic); MVP v1.0 (live IR01 status: 77/88 tasks, single missing-secrets blocker for the remaining nine, cross-referencing the H14 §12/H16 §12 known gaps); v1.1 Immediate Post-Launch; v1.2 Deepening the Platform; Long-Term Roadmap (H01 Stage 2/3, H07 Layer 2/3); Intentionally Deferred vs. Permanently Out of Scope (Social features called out as the one *permanent* exclusion, per H02 Principle 7, distinct from every other deferred item); DecisionOS Evolution (ties stages/layers/tiers together, notes no `IR02` roadmap exists yet).

**Files changed:** `DecisionOS/Company Handbook/H17 - Product Roadmap.md` (written in full).

---

## H16 — Testing & QA handbook document written

**Type:** Documentation only — no code changed

**Summary:** `DecisionOS/Company Handbook/H16 - Testing & QA.md` was a 3-line stub (title + `Status: Draft`, same state as H15/H17/H18/H19). Wrote the full document, consolidating the testing/QA process already specified across H06 Part 5 (AC-01–10), H09 §13 (TAC-01–08), H10 §11/§14/§16/§17 (testing strategy, security checklist, Definition of Done, release checklist), and H11 §14 (AAC-01–07), into one reference — matching H14's citation-over-duplication style. Grounded against the live repo rather than assumed: ran `npx vitest run --coverage` (214 tests, 6 files, 97.06% line coverage on `core/`) and checked IR01 Phase 6 (IR01-076 through IR01-085) status directly.

**Sections added:** Scope; Testing Strategy; Unit Testing; Integration Testing; End-to-End Testing; AI Validation; Manual QA; Release Testing; Regression Testing; Acceptance Criteria; Definition of Done; Quality Gates & Current Known Gaps.

**Known Gaps section (§12) — findings surfaced while writing, not fixed in this pass:**
- `core/ai/call.ts` has no test file (50% line coverage) — hidden by the aggregate 80% threshold in `vitest.config.ts`, which is evaluated across all of `core/` rather than per-file.
- No `pages/api/**/*.test.ts` files exist, despite H10 §11.3 requiring tests for four specific API-route behaviors (hard constraint enforcement, state reversion on AI failure, anonymous transfer, webhook signature validation) — CQ1/CQ2 are cited as evidence that untested route/middleware paths have shipped real defects before.
- The H11 §8.5/§9.4 prohibited-phrase output-validation check still doesn't exist (previously flagged in IR01-077 and restated in H14 §12); this is a QA gap, not just a code gap — AAC-05's prompt-injection criterion can't be fully exercised without it.
- Phase 6 QA tasks (IR01-076, IR01-080–085) remain blocked on missing `.env.local` secrets, not on any defect — restated as a distinct "verified vs. built" completeness gap.

**Recommendation:** the three coverage/test gaps are each scoped-enough for their own IR01 task, matching the IR01-077/078/079 precedent; the Phase 6 blocker resolves automatically once the missing secrets are supplied.

**Files changed:** `DecisionOS/Company Handbook/H16 - Testing & QA.md` (written in full).

---

## H14 — Security & Privacy handbook document written

**Type:** Documentation only — no code changed

**Summary:** `DecisionOS/Company Handbook/H14 - Security & Privacy.md` was a 3-line stub (title + `Status: Draft`, same as the still-unwritten H15–H19). Wrote the full document, consolidating the security and privacy controls already specified across H09 §11, H10 §14, H11 §10, H12 §13, and H13, into the single standalone reference H00's reading order calls for — matching the depth and citation style of the completed H12/H13 documents rather than duplicating their content verbatim.

**Sections added:** Scope; Data Inventory & Classification; Identity & Access Management (authentication, session management, authorization/RLS model, service-role key boundaries); Transport Security & Encryption; AI System Data Handling; Third-Party Subprocessors register; Data Retention & Deletion; Application Security Controls; Privacy Program (GDPR legal bases, data subject rights, consent, residency, data controller, children's privacy); Incident Response; Security Testing & Audit Cadence; Known Gaps.

**Known Gaps section (§12) — findings surfaced while writing, not fixed in this pass:**
- **§12.1** H12 §13.3 claims GDPR Art. 17 account-level erasure is implemented "in the account settings API route" — no such route exists in `pages/api/`, and `pages/account.tsx` doesn't exist (consistent with UX3's earlier finding). Per-Decision deletion (FR-09.6, `DELETE /api/decision/[id]`) is real; full-account erasure is currently manual only.
- **§12.2** `pages/privacy.js` still describes the pre-UX1 legacy affiliate-quiz product ("Decision answers" from vacation/car/phone quizzes, an "Affiliate partners" subprocessor list including AutoScout24/CHECK24/Booking.com/Wayfair/Sixt/Europcar) rather than the actual DecisionOS Decision Object model or subprocessor list (Supabase, Vercel, Anthropic, Stripe, Google Analytics). Legal copy was out of scope for UX1 and was never updated to match.
- **§12.3 / §12.4** No application-level rate limiting and no independent security audit/pen test — both pre-existing, accepted MVP tradeoffs (H13, H10 §14), restated here as security-relevant rather than fixed.

**Recommendation:** §12.1 and §12.2 should each become their own IR01/CQ-style task — neither was in scope for authoring H14 itself.

**Files changed:** `DecisionOS/Company Handbook/H14 - Security & Privacy.md` (written in full).

---

## UX Critical Fixes — UX1, UX2, UX3 (outside IR01 numbering)

**Type:** Fix (three UX defects requested directly by the Founder, same tracking pattern as CQ1/CQ2)

**UX1 — Landing page rewritten to match the actual DecisionOS MVP:**
- `components/HeroBanner.jsx` — replaced the rotating product-comparison carousel (stock photos, fake "4.8/5 · Trusted by 50,000+ people", per-slide affiliate-quiz CTAs) with a static, honest hero: one headline, one description of the real wizard flow, one "Start a Decision →" CTA into `/decision/new`.
- `components/App.jsx` — rewrote the "why DecisionOS" positioning copy and the 4-step "How it works" section to describe the real flow (context/goal/constraints/alternatives → AI recommendation → action plan → outcome tracking). Replaced the legacy 66+ product-category tree with a new `DECISIONOS_CATEGORIES` constant (the real 9 categories from `core/decision/Decision.constants.ts`), each linking to `/decision/new?category=...` (a param `pages/decision/new.tsx` already accepted — no new backend surface). Removed entirely: fake promo banners, fake phone/loan comparison cards with invented review counts and rates, fake tourism destination cards, fake Google/Trustpilot ratings, a "Global Vision" section with false 30+languages/66+categories/no-account claims and a decorative country-flag list, an animated-globe section with fabricated "190+ Countries · 1M+ Decisions" stats, three invented named testimonials, and a "Trusted partners" strip naming AutoScout24/CHECK24/Booking.com/Wayfair/Sixt/Europcar. Rewrote the FAQ with accurate answers (real Free/Pro/Premium pricing, no affiliate-link claims, real category list, real post-recommendation flow). Fixed the footer (brand, tagline, category links, copyright; removed four dead "#"-href social icons). Rebranded "DecisionPilot" → "DecisionOS" throughout, including `pages/index.js`'s title/meta/OG tags.
- **Left in place, not deleted:** the legacy per-category quiz engine (`QuestionScreen`, `ResultsScreen` + its affiliate-link resolver, `ChatScreen` "Ai·sel", `FavoritesScreen`, the profile-personalization modal) — thousands of lines, a distinct feature. It's no longer linked to from the repositioned landing content, so it's unreachable from the main flow rather than removed, per explicit confirmation this session.

**UX2 — "Update Decision" chat prompt no longer promises functionality that doesn't happen:**
- `features/decision-chat/Chat.tsx` — the material-change card claimed clicking "Update Decision" would apply the chat-mentioned change and "trigger a new analysis." In reality it only called `advanceState('draft')` and closed the chat (no dedicated "apply this change" endpoint exists, per H13). Corrected the copy to state what actually happens, and renamed the button to "Reopen to edit" (handler renamed `handleReopenForEditing`). No behavior change.

**UX3 — Broken `/account` upgrade links replaced with the real upgrade flow:**
- `features/decision-history/History.tsx` and `features/decision-chat/Chat.tsx` — "Upgrade plan" buttons called `router.push('/account')`, which 404s (`pages/account.tsx` doesn't exist). Both now call `router.push('/#pricing')`. Added `id="pricing"` to `App.jsx`'s `<PricingSection />` wrapper — the only place a plan can actually be chosen (real Stripe checkout via `/api/billing/checkout`, IR01-074) — so the anchor lands correctly. No new page or component.

**Verification:** `npx tsc --noEmit`, `npx vitest run` (214 tests, unchanged — no test file exists for `Chat.tsx` or the legacy landing components), and `npx next build` all pass.

---

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
