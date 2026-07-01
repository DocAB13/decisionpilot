# H17 — Product Roadmap
**DecisionOS Company Handbook**
*Version 1.0 Draft | July 2026*
*Status: Draft — pending founder review*

---

## Preamble

This document is the consolidated product roadmap for DecisionOS. It invents no new features and reorders no existing plan — every item here is already specified as a "post-MVP" note somewhere in H01–H16, or is a live status fact pulled from `IR01 - MVP Implementation Roadmap.md`, `DecisionOS/Handoff/Development Status.md`, and `DecisionOS/Releases/CHANGELOG.md`. H17's job is to organize those scattered post-MVP notes into a single sequenced view (v1.1, v1.2, long-term) and state the prioritization logic already implied by H02, H06 Part 7, and H07, rather than to originate new scope. Where the Handbook has not yet said when something happens, this document places it in the nearest sequence tier its stated dependencies allow — it does not assign dates, since none are fixed in any source document.

Before reading H17, be familiar with:
- **H01** — Vision, Mission, and the three-stage long-term vision (Individual → Team → Organizational Decision Intelligence)
- **H02** — the Decision Rule ("does this feature help users make better decisions?") that filters every item on this roadmap
- **H06 Part 6, Part 7** — the current MVP out-of-scope list and the P1/P2/P3 priority scale
- **H07** — market layers, acquisition phasing, and the revenue model this roadmap's sequencing follows
- **IR01** — the task-level roadmap for v1.0 itself; H17 does not duplicate IR01, it picks up where IR01 leaves off

---

## 1. Vision

Per H01: DecisionOS exists to help people and organizations make better decisions. The long-term vision is an **AI Decision Operating System** supporting the full decision lifecycle — from understanding a problem to learning from its outcome — without ever making the decision for the user. Success is defined by better real-world outcomes, not AI usage volume (H01 §Success Definition, H02 §Product Objective).

The vision unfolds in three stages (H01 §Long-Term Vision):

| Stage | Scope |
|---|---|
| 1 — Individual Decision Intelligence | Help individuals make better personal and professional decisions |
| 2 — Team Decision Intelligence | Enable teams to collaborate on structured decision-making |
| 3 — Organizational Decision Intelligence | Become the operating system for decision-making inside companies, preserving institutional knowledge |

Every tier of this roadmap is Stage 1 work except the long-term items in §6, which begin Stage 2/3.

---

## 2. Prioritization Principles

Nothing on this roadmap overrides H02: when a proposed feature's value is unclear, the test is *"does this feature help users make better decisions?"* (H02 §Decision Rule). Beyond that filter, three already-established mechanisms drive sequencing:

1. **H06 Part 7's three-tier scale** — P1 (required for launch), P2 (required for quality), P3 (important but deferrable, scheduled for the sprint immediately after launch). Everything in §3 (MVP) is P1/P2; §4 (v1.1) is where deferred P3 items and the nearest post-MVP notes land first.
2. **H07's phased go-to-market logic** — organic acquisition before paid, retention proof before scaling spend, product-market fit before commercial/institutional investment (H07 Parts 3, 6). Roadmap tiers below follow the same logic: prove the individual-user loop before investing in API/institutional revenue (Layer 2/3).
3. **H02 Principles 9 and 10** — default to simplicity; evolve without rebuilding. A post-MVP item is sequenced earlier when the architecture already accommodates it without structural change (H09 §17 explicitly names several such items), and later when it requires new infrastructure or accumulated data first.

**Dependency-driven placement, not calendar placement.** No date is fixed anywhere in the Handbook for any post-MVP item. Tiers below (v1.1, v1.2, long-term) are ordered by *what has to be true first* — MVP data accrual, revenue proof, or team growth — not by month number.

---

## 3. MVP — v1.0 (Current)

**Status:** 77 of 88 IR01 tasks complete in strict order (80/88 counting the three Phase 6 tasks completed out of order), per `Development Status.md`. Phase 1–4 (Foundation, Database, API, AI) are done. Phase 5 (Frontend) is done except **IR01-076** (manual E2E verification), and Phase 6 (Testing & Launch) has only its three testable-without-a-live-environment tasks done (IR01-077/078/079 — unit and component test coverage, per H16 §3–4).

**Single blocker for the remaining nine tasks:** `.env.local` is missing `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and both Stripe Price IDs. Every remaining task (IR01-076, IR01-080 through IR01-085 — E2E verification, TAC/API/AI/security acceptance runs, performance baseline, release checklist) requires a live environment and is blocked on this alone, not on a defect (H16 §5, §12).

**Additional known gaps documented, not yet scoped as IR01 tasks** (recorded in H14 §12 and H16 §12 while authoring those documents — restated here since a roadmap should not omit known pre-launch debt): account-level GDPR erasure has no API route; `/privacy` still describes the pre-pivot legacy product; `core/ai/call.ts` has no test file; no `pages/api/**/*.test.ts` files exist; the H11 §8.5/§9.4 prohibited-phrase output check was never built. None of these block v1.0 functionally, but each should become its own task before or immediately after launch.

v1.0 is, in H01 terms, the seed of **Stage 1 — Individual Decision Intelligence**: one user, one Decision Object, the full lifecycle from Context through Outcome/Reflection.

---

## 4. v1.1 — Immediate Post-Launch

Items already flagged as post-MVP in the Handbook whose dependency is simply "MVP has shipped and is stable" — no new data, revenue, or infrastructure milestone required first:

| Item | Source | Why it's first |
|---|---|---|
| Annual pricing (20% discount) | H07 Part 4 §Pricing Rationale | Explicitly sequenced after monthly billing proves out — "the monthly subscription is the correct starting point... before asking for an annual commitment" |
| Notification system (email/in-app for Outcome prompts, inactivity reminders) | H06 §Not in MVP; H07 Part 5 | Directly improves the two retention metrics H07 already tracks (Outcome Recording Rate, 30-Day Return Rate) using a mechanic (the 30-day Outcome prompt) that already exists as a Dashboard-only surface |
| Error monitoring service (Sentry or equivalent) | H10 §12 | Named as the direct post-MVP upgrade to the current console-only error logging; no product surface change |
| Automated E2E suite (Playwright) | H10 §11.2, H16 §5 | Replaces the manual IR01-076 process with regression coverage once the manual pass has established the workflows are stable |
| Recommendation-only retry (without re-running Analysis) | H13 §"Partial success" note | Named as a scoped, self-contained post-MVP addition to an endpoint that already exists |
| Multi-language UI (translated strings; i18n infra already required in MVP) | H06 §Not in MVP | Directly serves H07's already-defined serviceable market (Germany, France, Spain, Romania, Netherlands) with infrastructure the Handbook requires be MVP-ready |

---

## 5. v1.2 — Deepening the Platform

Items whose stated dependency is accumulated MVP data, proven retention, or a larger engineering investment than a single post-launch sprint:

| Item | Source | Why it waits |
|---|---|---|
| Learning Pipeline & Knowledge Base (cross-Decision Lessons Learned for Premium) | H06 §Not in MVP; H09 §17; H11 §"Across Decision Objects"; H12 §14 | Explicitly requires Outcome/Reflection data collected *during* MVP as its input — "will seed the Knowledge Base when the pipeline is built" (H06) |
| Decision Sharing (share decision type/approach, not content) | H06 §Not in MVP | Feeds H07 Phase 2's word-of-mouth acquisition mechanic, which itself only starts once MVP has real completed Decisions to share |
| Public API v1 (`/api/v1/decision/`, API key auth) | H06 §Not in MVP; H09 §17; H07 Part 6 | Architecture is already ready (H09: "no changes to the data layer are required"), but H06 itself says the auth/rate-limiting/documentation investment is "not justified before product-market fit is established" |
| Global Decision search | H08 §89 | Deferred behind Dashboard filters, which already serve this function at MVP scale; revisit once History volume grows |
| Multi-provider / multi-model AI strategy, provider abstraction layer | H11 §13.3–13.5 | A resilience and cost-optimization investment justified by scale, not by MVP-day usage volume |
| Database read replicas | H09 §17 | Justified by `history` route load once user count grows past MVP scale |

---

## 6. Long-Term Roadmap (Stage 2 / Stage 3, H01)

Items tied to H01's later stages and H07's Layer 2/3 markets — explicitly *not* MVP concerns per their own source documents:

**Stage 2 — Team Decision Intelligence.** No product surface is yet specified beyond the vision statement itself (H01). The nearest existing building block is Decision Sharing (§5), which shares a decision's *type and approach*, not collaborative editing of a single Decision Object — true multi-owner collaboration remains unspecified and is the first thing Stage 2 would need to define.

**Stage 3 / Layer 3 — Organizational Decision Intelligence.**
- **Embedded, white-label interface** (H04 §Interface Layer, H06 §Not in MVP) — DecisionOS scoped to a single domain and deployed inside a partner's product (a bank for mortgage decisions, a healthcare provider for treatment paths).
- **Institutional embedding revenue** (H07 Part 6) — contract-priced, requires "product maturity and a dedicated sales motion," explicitly marked "not an MVP concern."

**Layer 2 — Professional/API market** (H07 Part 6, Part 2 §Secondary Market): API licensing for advisors, coaches, and consultants running the DecisionOS framework on behalf of clients, priced per seat or decision volume — distinct from and later than the general-purpose Public API in §5, which serves developers rather than professional end-users of the framework itself.

**Other long-term, architecture-ready items not yet prioritized within Stage 2/3:** Native mobile application (H06, H09 §17 — API is already stateless/JSON so a React Native or native app calls the same routes); offline mode (H06 §Not in MVP).

---

## 7. Intentionally Deferred vs. Permanently Out of Scope

H06 Part 6 draws an explicit line that this roadmap preserves rather than blurs:

**Deferred (everything in §4–§6 above).** Per H06: "not deferred indefinitely — they are candidates for future versions." Absence from v1.0 must not leave a gap in the core Decision Lifecycle, and none of the deferred items do — the lifecycle (Draft → Analysis → Recommendation → Decision → Execution → Outcome → Reflection) is complete without any of them.

**Permanently out of scope.** **Social features** — community ratings, "what others decided," shared decision templates, any social-proof mechanism — are ruled out not by sequencing but by principle: H02 Principle 7 (Human-Centered Design: "never manipulates, pressures, or nudges users toward specific choices") makes social proof structurally incompatible with the product, not merely unscheduled. This is the one item on the full post-MVP list that should never appear on a future version of this roadmap without a deliberate, documented reversal of that principle.

---

## 8. DecisionOS Evolution

Read together, H01's three stages, H07's three market layers, and this roadmap's tiers describe one continuous path, not three separate plans:

```
v1.0 (MVP)  →  v1.1 / v1.2          →  Long-term
Stage 1        Stage 1, deepened       Stage 2 / Stage 3
Layer 1        Layer 1, retained       Layer 2 / Layer 3
individual     individual, richer      team / organization
              (history, sharing,      (collaboration,
               knowledge, API)         embedding, institutions)
```

The mechanism connecting each tier to the next is already named in the Handbook, not invented for this document: MVP's Outcome/Reflection capture is the raw input the Learning Pipeline (v1.2) needs; the Learning Pipeline's per-user Lessons Learned is the nearest existing precedent for what a Stage 2 team-knowledge feature would generalize; and the Public API (v1.2) proves the API-consumption pattern that Layer 2/3 institutional and professional offerings (long-term) later commercialize.

**Roadmap ownership going forward:** no `IR02` implementation roadmap exists yet (`Development Status.md`). H17 is the qualitative product roadmap; a future `IR02 - <version> Implementation Roadmap.md`, scoped by the Chief Product Architect & Product Manager once IR01 closes, would be the task-level breakdown of whichever v1.1 items are approved next — the same relationship IR01 already has to the MVP scope defined in H06.

---

*DecisionOS Company Handbook | H17 — Product Roadmap*
*Version 1.0 Draft | Status: Draft — pending founder review*
