# H16 — Testing & QA
**DecisionOS Company Handbook**
*Version 1.0 Draft | July 2026*
*Status: Draft — pending founder review*

---

## Preamble

This document consolidates DecisionOS's testing and QA process into one reference. It introduces no new process — every practice described here is already specified in H06 (Part 5 — Acceptance Criteria), H09 (§13 — Acceptance Criteria / TAC-01–08), H10 (§11 Testing Strategy, §14 Security Checklist, §16 Definition of Done, §17 Release Checklist), H11 (§14 — AI Acceptance Criteria), or already running in the codebase (`vitest.config.ts`, the six existing `*.test.ts(x)` files, IR01 Phase 6). Where a control is defined in full elsewhere, H16 states it and cites the source. Where H16 found a gap between what the Handbook specifies and what actually exists in the repository, it is recorded in §12 rather than described as done.

Before reading H16, be familiar with:
- **H06 Part 5** — functional acceptance criteria (AC-01–AC-10)
- **H09 §13** — technical acceptance criteria (TAC-01–08)
- **H10 §11, §14, §16, §17** — testing strategy, security checklist, Definition of Done, release checklist
- **H11 §14** — AI acceptance criteria (AAC-01–07)
- **H14 §11** — the security-audit half of the release gate (H14 owns security testing; H16 owns functional/AI/QA testing)

---

## 1. Scope

H16 covers everything that gives confidence a change is correct before it ships: automated tests (unit, integration, AI validation), manual QA (in-browser verification), and the release-time checks (acceptance criteria, regression pass, Definition of Done, release checklist) gating a production deploy. Security testing itself is specified once, in H14 §11, and only cross-referenced here.

---

## 2. Testing Strategy

**Philosophy (H10 §11.1):** tests exist to give confidence to change code without fear of undetected regressions. Every test must answer "what regression does this prevent?" Tests of behavior (inputs → outputs) are kept; tests of implementation details are not written.

**Stack (H10 §11.2):**

| Tool | Purpose | Status in this repo |
|---|---|---|
| Vitest | Unit and integration tests | In use — `vitest.config.ts`, 6 test files, 214 tests passing |
| React Testing Library | React component tests | In use — `context/DecisionContext.test.tsx` |
| MSW (Mock Service Worker) | API mocking in component tests | In use — `msw ^2.14.6`, added in IR01-079 |
| Playwright | End-to-end browser tests | Not installed. Documented in H10 §11.2 as post-MVP; MVP E2E is manual (§5) |

---

## 3. Unit Testing

Per H10 §11.3, `core/` functions are always tested; this is the highest-value, currently-implemented layer.

**Current state (verified by running `npx vitest run --coverage`):**

| File under test | Test file | Line coverage |
|---|---|---|
| `core/ai/validate.ts` | `core/ai/validate.test.ts` | 100% |
| `core/ai/prompts.ts` | `core/ai/prompts.test.ts` | 100% |
| `core/ai/call.ts` | *(none)* | 50% |
| `core/decision/Decision.utils.ts` | `core/decision/Decision.utils.test.ts` | 100% |
| `core/ai/sanitize.ts` | `core/ai/sanitize.test.ts` | covered |
| `core/ai/acceptance-criteria.ts` | `core/ai/acceptance-criteria.test.ts` | covered |

Overall: **95.5% statements / 97.06% lines** across `core/`, against the H10 §11.5 build gate of 80% line coverage. `core/ai/call.ts` (the Anthropic API fetch wrapper) is the one file pulling the average down — see §12.

Test structure and naming follow H10 §11.4 exactly: test files live alongside the code they test (`X.ts` + `X.test.ts`), `describe`/`it` blocks, plain-English behavior names.

---

## 4. Integration Testing

DecisionOS's integration layer is component-plus-mocked-API tests, not a separate test type: `context/DecisionContext.test.tsx` (IR01-079) uses React Testing Library's `renderHook` with MSW's `setupServer` to mock `/api/decision/[id]`, `/api/decision/save`, and `/api/decision/state`, and verifies the real integration seams — optimistic update before the debounced save fires, exactly one `save` call after the 800ms debounce, `saveState` transitions, and all three `advanceState` branches.

H10 §11.3 additionally specifies that API route logic itself must be tested for four critical paths: hard constraint enforcement, state reversion on AI analysis failure, anonymous Decision transfer on signup, and Stripe webhook signature validation. No dedicated `pages/api/**/*.test.ts` files exist for these today — see §12.

---

## 5. End-to-End Testing

Per H10 §11.2, Playwright-based automated E2E is explicitly post-MVP. For MVP, end-to-end verification is manual, driven by H05's primary workflows and tracked as **IR01-076 — Phase 5 E2E user flow verification**: all five workflows (Anonymous, Returning user, Chat, History, Billing) at 1440px and 375px.

**Current status: blocked**, unchanged since first identified. `.env.local` is missing `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and both Stripe Price IDs. Confirmed at runtime: `POST /api/decision/create` and `POST /api/billing/checkout` both 500 immediately, because `lib/supabase/admin.ts` and `lib/stripe/stripe.client.ts` throw at import time without these. Every one of the five workflows writes decision or billing data as its first step, so none is drivable in a browser until these secrets are added. IR01-076 and everything after it in Phase 6 (IR01-080 through IR01-085) remain blocked on the same cause.

---

## 6. AI Validation

AI-specific correctness is governed by H11 §14's seven acceptance-criteria groups (AAC-01 Analysis, AAC-02 Recommendation, AAC-03 Action Plan, AAC-04 Chat, AAC-05 Safety/Guardrails, AAC-06 Failure Handling, AAC-07 Quality Baseline — 10 manually-reviewed Analysis+Recommendation pairs per category before launch).

Two layers exist today:
- **Unit-level, already running:** `core/ai/validate.test.ts` and `core/ai/prompts.test.ts` test the validation and prompt-construction logic AAC-01–06 depend on (schema validation, hard-constraint cross-checks, tie detection, category-specific disclaimers), at 100% line coverage each.
- **Production acceptance run, not started:** **IR01-082 — Run H11 AI acceptance criteria (production)** executes AAC-01–07 against the live Anthropic API and stores AAC-07's quality baseline as `docs/quality-baseline-launch.md`. Blocked behind IR01-080, itself blocked behind the same missing secrets as §5.

A known gap already on record from IR01-077 (not fixed there — flagged for a future task, restated here since it's a QA gap, not just a code gap): H11 §8.5/§9.4 require the output validator to reject a defined list of prohibited phrases (outcome-prediction language, Legal-category claims, real-time-data claims). No such check exists anywhere in `core/ai/` — not in `validate.ts`, not as a `prompts.ts` instruction. AAC-05's "prompt injection test inputs do not alter AI behavior" criterion cannot be fully exercised until this exists.

---

## 7. Manual QA

Two checklists, both already specified and both run per-change rather than only at release:

**Definition of Done §16.4 (Functionality):** feature works end-to-end in the browser; works at 375px (mobile, Chrome DevTools); error states match H08 §17; a manual regression check of home → Wizard → Recommendation confirms no existing flow broke.

**H09 TAC-08 (Design System):** design tokens imported in `_app.js`; every interactive element has a focus ring; reduced-motion disables animation; no `outline: none` without a replacement.

This is the pattern every completed task in `DecisionOS/Releases/CHANGELOG.md` already follows — e.g. IR01-075b/075c and CQ1/CQ2 were each live-tested against `next dev` in addition to the automated suite, not signed off on `npx vitest run` alone.

---

## 8. Release Testing

H10 §17 defines the full release checklist, executed as **IR01-085** before declaring MVP production-ready:

- **§17.1 Pre-deployment:** all changes on `main`; `npm run build` clean; env vars set in Vercel; DB migrations applied; pg_cron jobs active; Stripe webhook URL correct; AI prompt versions incremented if changed.
- **§17.2 Post-deployment (within 15 minutes):** homepage loads clean; login/signup work; a Decision can be started, analyzed, and a Recommendation produced; Final Decision recorded; Dashboard loads; Stripe Checkout opens; Vercel Functions logs show no new errors.
- **§17.3 Hotfix process:** identify from logs/report → reproduce locally → write a failing test if the bug is in testable code → fix → verify the test passes.

**Current status: not started.** Blocked behind IR01-080 through IR01-084, all of which are blocked behind the IR01-076 missing-secrets issue.

---

## 9. Regression Testing

Two layers, both already in continuous use:

- **Automated:** the full `npx vitest run` suite (214 tests) is run before every task is marked complete, per every entry in `DecisionOS/Releases/CHANGELOG.md` since IR01-077 — a task is not done if it introduces a regression the existing suite would have caught.
- **Manual:** DoD §16.4's "manual regression check on home → Wizard → Recommendation" after any Wizard-, Recommendation-, or routing-adjacent change — this is how CQ1 (middleware blocking the anonymous flow) and CQ2 (legacy billing bypass) were caught by a dedicated audit pass rather than by the automated suite, since neither had an automated test covering that path (see §12).

---

## 10. Acceptance Criteria

Four independent acceptance-criteria sets, each owned by a different Handbook document, none duplicated here:

| Set | Owner | Count | Production run status |
|---|---|---|---|
| Functional (AC-01–AC-10) | H06 Part 5 | 10 groups | Not formally re-run against production; exercised informally per-task via manual QA (§7) |
| Technical (TAC-01–TAC-08) | H09 §13 | 32 individual items | Not started — **IR01-080** |
| API (§8 criteria) | H13 §8 | 17 items | Not started — **IR01-081**, depends on IR01-080 |
| AI (AAC-01–AAC-07) | H11 §14 | 7 groups | Not started — **IR01-082** (§6) |
| Security | H14 §11 (H10 §14 checklist) | — | Not started — **IR01-083** |

A feature is not considered launch-ready on unit tests alone — it must also satisfy the relevant AC/TAC/AAC groups for the area it touches, per DoD §16.5.

---

## 11. Definition of Done

The complete checklist is H10 §16; restated here by category only, not line-by-line:

- **§16.1 Code** — H10 standards followed, TypeScript, ESLint/Prettier clean, no stray `console.log`/`any`/unreferenced `TODO`.
- **§16.2 Tests** — new `core/` functions have unit tests covering at least one failure path; `npm test` passes; `core/` coverage ≥ 80%.
- **§16.3 Build** — `npm run build` clean locally; Vercel deploy green; no browser console errors on the affected flow.
- **§16.4 Functionality** — manual QA per §7 of this document.
- **§16.5 Requirements** — relevant H06 AC met; relevant H11 AAC met if an AI component changed; Handbook updated if the database changed.
- **§16.6 Security** — H10 §14 / H14 checklist passed; no new secrets in code.

---

## 12. Quality Gates & Current Known Gaps

**Enforced gates (block progress today):**
- `vitest.config.ts` sets a hard coverage threshold: `lines: 80` for `core/**/*.ts`. A build that drops `core/` line coverage below 80% fails.
- `npx tsc --noEmit` and `npx next build` must both pass — run and reported in every CHANGELOG entry since IR01-070b.
- `npm audit` — no HIGH/CRITICAL (H10 §14.5), checked as part of the release checklist, not on every commit (no CI exists — H09 §"Branch Strategy": single `main` branch, no PRs required, no staging).

**Gaps found while writing this document (recorded, not fixed — out of scope for authoring H16):**

1. **`core/ai/call.ts` has no test file and sits at 50% line coverage**, well below the 80% target the rest of `core/` clears. It is not currently failing the build because the `vitest.config.ts` threshold is evaluated in aggregate across `core/**/*.ts`, not per-file, and the aggregate (97.06% lines) is comfortably above 80%. A per-file regression in `call.ts` would not be caught by the current gate.
2. **No `pages/api/**/*.test.ts` files exist**, despite H10 §11.3 specifying four API-route behaviors that "must be tested" (hard constraint enforcement, state reversion on AI failure, anonymous transfer, webhook signature validation). These paths are exercised indirectly — `DecisionContext.test.tsx` mocks the API rather than testing the route handlers directly, and CQ1/CQ2 (§9) show that untested route/middleware paths have shipped real defects before being caught by a manual audit rather than the automated suite.
3. **The H11 §8.5/§9.4 prohibited-phrase output check does not exist** (§6) — an explicit Handbook requirement with no corresponding test or production code.
4. **Phase 6 QA tasks are blocked, not failing:** IR01-076 and IR01-080 through IR01-085 (E2E, TAC/API/AI/security acceptance runs, performance baseline, release checklist) are all blocked on the same missing `.env.local` secrets (§5), not on any defect. This is a completeness gap in what has been *verified*, distinct from a defect in what has been *built*.

**Recommendation:** items 1–3 are each scoped-enough to become their own IR01 task, consistent with how IR01-077/078/079 closed similar coverage gaps; item 4 unblocks automatically once the missing secrets are supplied to `.env.local`.

---

*DecisionOS Company Handbook | H16 — Testing & QA*
*Version 1.0 Draft | Status: Draft — pending founder review*
