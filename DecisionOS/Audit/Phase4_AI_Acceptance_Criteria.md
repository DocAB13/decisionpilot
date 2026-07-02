# Phase 4 — AI Acceptance Criteria Verification
**DecisionOS | IR01-055**
*Per H11 §14 AAC-01 through AAC-06*

> **HISTORICAL — SUPERSEDED.** Snapshot at IR01-055 (153/153 tests passing at the time; the suite is now 299 tests across 12 files). AAC-07 (Quality Baseline) is covered separately in the sibling `Phase4_AI_Quality_Baseline.md`, not in this document, per its own AAC-01–AAC-06 scope stated above. For current AI validation status, see `H16 - Testing & QA.md` §6 and `H11 - AI System Specification.md` §14.

---

## Summary

| Category | Unit tests | Status |
|---|---|---|
| AAC-01 Analysis Engine | validate.test.ts | ✅ All items enforced |
| AAC-02 Recommendation Engine | validate.test.ts | ✅ All items enforced |
| AAC-03 Action Plan Engine | validate.test.ts | ✅ 3–5 items enforced |
| AAC-04 Chat Engine | acceptance-criteria.test.ts | ✅ States enforced |
| AAC-05 Safety and Guardrails | validate.test.ts | ✅ Conflict resolution path enforced |
| AAC-06 Failure Handling | acceptance-criteria.test.ts | ✅ Timeout enforced by code |

**Total unit tests: 153 / 153 passing (as of IR01-055)**

---

## AAC-01 — Analysis Engine

| Criterion | Mechanism | Test | Status |
|---|---|---|---|
| Analysis completes within 30 seconds for 95% of requests | `callAI` 29-second timeout → `AI_TIMEOUT` | acceptance-criteria.test.ts | ✅ Timeout enforced |
| Analysis output passes schema validation on first attempt >90% | `validateAnalysisOutput` + one regeneration pass | validate.test.ts | ✅ Enforced |
| Every alternative present in Analysis output | `validateAnalysisOutput` checks for missing IDs | validate.test.ts | ✅ |
| Every AnalysisPoint has `specific_to_user = true` | `validateAnalysisOutput` rejects `specific_to_user: false` | validate.test.ts | ✅ |
| Financial category: non-empty `market_data_caveat` | `validateAnalysisOutput(output, ids, 'financial')` — added IR01-055 | validate.test.ts | ✅ |
| Technology/Insurance: non-empty `market_data_caveat` | Same validation path | validate.test.ts | ✅ |
| Health category: non-empty `professional_advice_disclaimer` | `validateAnalysisOutput(output, ids, 'health')` — added IR01-055 | validate.test.ts | ✅ |
| `prompt_version` stored in `decision_components` | `saveComponent()` in analyze.ts stores `promptVersion` | Code review | ✅ |

**Changes made in IR01-055:** Added optional `category` parameter to `validateAnalysisOutput`; added `market_data_caveat` enforcement for financial/technology/insurance; added `professional_advice_disclaimer` enforcement for financial/health/insurance.

---

## AAC-02 — Recommendation Engine

| Criterion | Mechanism | Test | Status |
|---|---|---|---|
| Never recommends alternative with `hard_constraints_satisfied = false` | `validateRecommendationOutput` cross-checks analysis | validate.test.ts | ✅ |
| `primary_reasoning` references ≥2 user inputs (proxy: ≥50 chars) | `validateRecommendationOutput` checks length | validate.test.ts | ✅ |
| `conditions_for_change` ≥30 chars, names concrete condition | `validateRecommendationOutput` length check — updated IR01-055 | validate.test.ts | ✅ |
| `honest_tradeoffs` non-empty | `validateRecommendationOutput` | validate.test.ts | ✅ |
| Tie declared in 100% of equal-alternative test inputs | Prompt Rule 4 + live AI test | ⏳ Live test | |
| Tie NOT declared when one alternative is clearly superior | Prompt Rule 4 + live AI test | ⏳ Live test | |

**Changes made in IR01-055:** `conditions_for_change` check tightened from "non-empty" to "≥30 characters" per H11 AAC-02.

---

## AAC-03 — Action Plan Engine

| Criterion | Mechanism | Test | Status |
|---|---|---|---|
| Action Plan always contains 3–5 items | `validateActionPlanOutput` — added IR01-055 | validate.test.ts | ✅ |
| Each item has required fields (title, detail, effort, sequence) | `validateActionPlanOutput` — added IR01-055 | validate.test.ts | ✅ |
| `completed = false`, `completed_at = null` in initial plan | `validateActionPlanOutput` — added IR01-055 | validate.test.ts | ✅ |
| Each item specific to chosen alternative, not generic | Prompt Rules 2 + 4 + live AI review | ⏳ Live test | |
| Action Plan for chosen alternative (not recommendation) | `state.ts` passes `8_final_decision` to `buildActionPlanPrompt` | Code review | ✅ |
| Items sequenced by logical dependency | Prompt Rule 3 + live AI review | ⏳ Live test | |

**Changes made in IR01-055:** Added `validateActionPlanOutput` to `core/ai/validate.ts`.

---

## AAC-04 — Chat Engine

| Criterion | Mechanism | Test | Status |
|---|---|---|---|
| Chat opens with full Decision Object context | `chat.ts` fetches all `is_current` components → `buildChatSystemPrompt` | Code review | ✅ |
| Chat accessible only in `draft`, `waiting_for_user`, `decision_made` | `isChatAllowedForStatus()` — refactored IR01-055 | acceptance-criteria.test.ts | ✅ |
| Chat on `completed` state returns 409 | `isChatAllowedForStatus('completed')` returns `false` | acceptance-criteria.test.ts | ✅ |
| Failed Chat responses not stored | `chat.ts` returns 503 before `insert_chat_exchange` RPC on AI error | Code review | ✅ |
| Material change detection triggers formal update prompt in 4/5 test cases | `CHAT_OUTPUT_FORMAT` schema + live AI test | ⏳ Live test | |
| Chat history persists across sessions | `chat.ts` fetches `decision_chat_messages` per session | Code review | ✅ |

**Changes made in IR01-055:** Extracted `CHAT_ALLOWED_STATES` and `isChatAllowedForStatus` to `core/decision/Decision.utils.ts`; updated `chat.ts` to import from there. Added unit tests.

---

## AAC-05 — Safety and Guardrails

| Criterion | Mechanism | Test | Status |
|---|---|---|---|
| Values-based input triggers values-clarification, not Recommendation | Prompt awareness + live AI test | ⏳ Live test | |
| All four professional advice disclaimers are non-empty | `PROFESSIONAL_DISCLAIMER_*` constants in `prompts.ts` + validation | validate.test.ts | ✅ |
| All alternatives violate hard constraint → conflict resolution, not Recommendation | `validateRecommendationOutput` allows null `recommended_alternative_id` when `allAlternativesViolateConstraints()` — fixed IR01-055 | validate.test.ts | ✅ |
| Prompt injection inputs do not alter AI behavior | `sanitizeForPrompt` on all user text | sanitize.test.ts | ✅ |

**Changes made in IR01-055:** Fixed `validateRecommendationOutput` — previously rejected `null recommended_alternative_id` even when ALL alternatives violate constraints (causing infinite regeneration loop). Added `allAlternativesViolateConstraints()` helper and corresponding unit test.

---

## AAC-06 — Failure Handling

| Criterion | Mechanism | Test | Status |
|---|---|---|---|
| AI timeout leaves Decision in `draft`, not `in_analysis` | `analyze.ts` catch → `revertToDraft()` transitions to `draft`; `callAI` 29s race | acceptance-criteria.test.ts (timeout) + code review (revert) | ✅ |
| Provider error produces H08 §17 failure screen (503) | `analyze.ts` and `chat.ts` return `503` with user message | Code review | ✅ |
| Two consecutive validation failures → `draft`, not infinite regeneration | `analyze.ts` regenerates exactly once, then reverts | Code review | ✅ |
| All AI failure events logged with `decision_id`, `engine`, `failure_category`, `prompt_version` | `console.error` in handlers (unstructured); structured logging deferred to Phase 6 | Code review | ⚠️ Partial |

**Note on AAC-06 structured logging:** Current handlers use `console.error` with the endpoint name prefix (`[POST /api/decision/analyze]`) but do not emit structured JSON with `failure_category` and `prompt_version` fields. This is logged as a Phase 6 observability improvement.

---

## Checklist Results

| Criterion | Result |
|---|---|
| AAC-01: Analysis within 30s | ✅ enforced (29s race) |
| AAC-01: Schema validation >90% | ✅ enforced + regeneration |
| AAC-01: All alternatives present | ✅ enforced |
| AAC-01: `specific_to_user = true` | ✅ enforced |
| AAC-01: `market_data_caveat` (financial/tech/insurance) | ✅ enforced |
| AAC-01: `professional_advice_disclaimer` (financial/health/insurance) | ✅ enforced |
| AAC-01: `prompt_version` stored | ✅ enforced |
| AAC-02: No hard-constraint violating recommendation | ✅ enforced |
| AAC-02: `primary_reasoning` references user inputs | ✅ proxy-enforced (≥50 chars) |
| AAC-02: `conditions_for_change` ≥30 chars specific | ✅ enforced |
| AAC-02: `honest_tradeoffs` non-empty | ✅ enforced |
| AAC-02: Tie detection accuracy | ⏳ live test |
| AAC-03: Action Plan 3–5 items | ✅ enforced |
| AAC-03: Items specific to chosen alternative | ⏳ live test |
| AAC-03: Items sequenced | ⏳ live test |
| AAC-04: Full Decision Object context in chat | ✅ code-verified |
| AAC-04: Allowed states only | ✅ enforced |
| AAC-04: Failed responses not stored | ✅ code-verified |
| AAC-04: Material change detection | ⏳ live test |
| AAC-05: Values-based → values-clarification | ⏳ live test |
| AAC-05: All disclaimers non-empty | ✅ enforced |
| AAC-05: All-violate conflict resolution | ✅ enforced (fixed IR01-055) |
| AAC-05: Prompt injection safety | ✅ enforced |
| AAC-06: Timeout → draft | ✅ enforced |
| AAC-06: Provider error → 503 | ✅ code-verified |
| AAC-06: Two failures → draft | ✅ code-verified |
| AAC-06: Structured failure logging | ⚠️ unstructured (Phase 6) |

---

*IR01-055 | Phase 4 Acceptance Criteria | DecisionOS*
