# H18 — Business Model
**DecisionOS Company Handbook**
*Version 1.0 Draft | July 2026*
*Status: Draft — pending founder review*

---

## Preamble

This document consolidates DecisionOS's business model into one reference. It invents no new model — every element here is already specified in H01 (Vision), H02 (Product Principles), H06 (Product Requirements — subscription tiers, business rules), or H07 (Go-to-Market Strategy — positioning, pricing rationale, acquisition, retention, revenue). H18's role is to bring the commercial logic scattered across those documents into one place a founder, investor, or new hire can read end to end, and to state plainly where the model rests on an assumption or has a gap rather than a settled answer.

Before reading H18, be familiar with:
- **H01** — mission and the three-stage long-term vision this model monetizes over time
- **H02** — the principles that constrain commercial decisions (AI never decides; no social proof; simplicity)
- **H06 Part 4, FR-11** — subscription business rules and tier feature requirements
- **H07** — the full go-to-market strategy this document summarizes; H07 remains the detailed source, H18 is the executive view

---

## 1. Value Proposition

Per H07 Part 1: DecisionOS occupies a position no current product holds — *structured, personalized, AI-powered decision support for individuals facing choices that matter.* It is deliberately not a general-purpose AI assistant (optimized for no specific decision), not a comparison engine (optimized for affiliate clicks, not outcomes), and not a search-and-summarize tool (finds information but doesn't reason about personal fit).

**Positioning statement (H07):** *"For individuals facing important life decisions... DecisionOS is the structured decision engine that transforms uncertainty into confident action... guides you through a complete decision process, remembers what you decide, and makes your next decision better."*

**Competitive moat (H07 Part 1) — not the AI model itself, which is a commodity:**
1. **The Decision Object** — a structured, persistent record of a complete decision from context to lessons learned, which no competitor builds or stores.
2. **Decision Intelligence over time** — each completed Decision makes the next one better, an accumulating advantage no comparison site or general AI assistant replicates.
3. **Trust through transparency** — reasoning is shown, risks are surfaced, uncertainty is admitted (H02 Principles 3–5), which is the rarest differentiator in a market where every product claims to be "AI-powered."

---

## 2. Customer Segments

**Primary market — MVP (H07 Part 2):** individual consumers in English-speaking and major European markets facing high-stakes, high-frequency decisions in five categories: **financial** (mortgages, loans, credit, investments), **technology** (phones, laptops, appliances, software), **insurance** (health, car, home, travel), **career and education** (job offers, courses, transitions), and **travel and lifestyle** (hotels, flights, destinations, rentals).

**Serviceable market:** English-speaking adults (US, UK, Australia, Canada, Ireland) and major European markets (Germany, France, Spain, Romania, Netherlands) who have researched a significant purchase or life decision online in the last 12 months — a population in the hundreds of millions, of which DecisionOS needs only a small, highly satisfied share (H07 Part 2).

**Secondary market — post-MVP (H07 Part 2, H17 §6):** financial advisors and consultants, HR/career coaches, and organizations (banks, insurers, healthcare providers) wanting to embed structured decision support in their own customer journeys. This is Layer 2/3 of the long-term vision (H01 Stage 2/3) and is explicitly not an MVP concern.

---

## 3. Pricing Model — Free / Pro / Premium

| Tier | Price | Includes (FR-11.2–11.4) |
|---|---|---|
| **Free** | €0 | Unlimited Decision Objects, full Wizard, AI Recommendations, Outcome/Reflection recording, Decision History for the most recent 10 Decisions |
| **Pro** | €4.99/month | Everything in Free, plus unlimited full Decision History, AI Chat Interface, Action Plan editing, priority AI response times |
| **Premium** | €9.99/month | Everything in Pro, plus deeper Recommendation analysis (expanded pros/cons and risk assessment), cross-decision Lessons Learned surfacing, premium support |

**Structural rule (BR-10, H06 Part 4):** no step of the Decision Lifecycle is ever gated behind a paid tier. A Free or anonymous user can go from Draft through Decision Made and receive an Action Plan without hitting an upgrade prompt mid-flow. This is the model's core commercial constraint: tiers restrict *depth and history*, not the core decision experience (H07 Part 4) — deliberately not standard freemium, which typically restricts core functionality to force upgrades.

**Pricing rationale (H07 Part 4):** Pro at €4.99 sits at the "I'll try it for a month" impulse-decision threshold; above €7 it competes unfavorably against other subscriptions. Premium at €9.99 targets power users and high-stakes decisions (e.g., a €300,000 mortgage) where the subscription cost is trivial relative to the decision's value. Annual pricing (20% discount) is deliberately deferred to post-MVP (H17 §4) so monthly billing proves out first.

---

## 4. Revenue Model

**Primary: subscriptions.** The intended and primary revenue source, chosen because it aligns company incentives with user outcomes — paid when the product is valuable enough to keep using, not when a user clicks an affiliate link (H07 Part 6).

**Conservative solo-operator projection (H07 Part 6, explicitly framed as a minimum viable trajectory, not a target, assuming organic growth only):**

| Month | Paid users | MRR (avg €6/user) |
|---|---|---|
| 3 | 10 | €60 |
| 6 | 50 | €300 |
| 12 | 200 | €1,200 |
| 18 | 500 | €3,000 |
| 24 | 1,500 | €9,000 |

**Secondary: affiliate partnerships**, permitted only under strict conditions (H07 Part 6, H02 principles on trust and user-first data use): a link may only point to the product the user actually chose in their Final Decision, never a sponsored alternative, and must be disclosed. Affiliate relationships must never influence a Recommendation. Infrastructure exists (Amazon Associates, CJ Affiliate, Awin) but is expected to remain a single-digit percentage of revenue at maturity — a passive complement, not a strategy.

**Future: API and institutional revenue (post-MVP, H07 Part 6, H17 §6)** — per-seat/per-volume API licensing for advisors and consultants (Layer 2), and contract-priced institutional embedding for banks/insurers/healthcare providers (Layer 3). Both are explicitly gated behind product maturity and a dedicated sales motion; neither is an MVP concern.

---

## 5. Growth Strategy

**Acquisition, sequenced in three phases (H07 Part 3), each gated behind proof from the previous phase:**
1. **Organic search (launch → Month 6)** — decision-specific content ("How to choose between a fixed and variable mortgage rate...") built on the existing SEO base (17 guide pages, GA4, sitemap). Target: 50 organic sessions/day by Month 3, 500/day by Month 6.
2. **Word of mouth (Month 3+)** — earned via product quality, not manufactured; the Reflection/Lessons Learned components double as the moment a user crystallizes a shareable story. Target: 15% of completed Decisions produce a share or referral by Month 6.
3. **Targeted paid acquisition (Month 6+)** — only after retention is understood; search ads and retargeting only, explicitly excluding broad-awareness or social display advertising. Gate: CAC < €15/subscriber, LTV of a Pro subscriber > €50 at 12 months, minimum 3:1 LTV:CAC before spend increases.

**Retention (H07 Part 5):** driven by the same mechanics that define product value — the completed-Decision loop (Outcome recording is the strongest single retention signal), a growing Decision History as a pull factor, and personalized Lessons Learned surfacing on repeat use. Retention is deliberately benchmarked against episodic high-value tools (Notion, 1Password, legal software), not daily-use consumer apps — comparing DecisionOS to a daily-use app's retention curve is treated as a category error.

---

## 6. Cost Structure

The Handbook does not specify a unit-economics or COGS document, so this section states only what is already named elsewhere, not invented figures:

- **Fixed platform costs:** Vercel (Pro plan, per H10 §12.3) and Supabase (Pro plan, per H12 §11.1) — both named as paid tiers already in use for their production features (log retention, managed backups), but no specific monthly cost is documented anywhere in the Handbook.
- **Variable cost:** Anthropic API usage, metered per request/token and scaling directly with AI analysis, recommendation, chat, and suggestion calls (H11) — no per-request cost figure is documented.
- **Payment processing:** Stripe's standard transaction fee on every subscription charge — rate not specified in the Handbook.
- **Labor:** none budgeted — DecisionOS is solo-operated in MVP (H09 §"Branch Strategy", H14 §10, H15 §1); the revenue projection in §4 assumes no salary draw.

This is a genuine documentation gap, not a business-model choice — see §10.

---

## 7. Success Metrics

Consolidated from H07 Parts 3, 5, 6 (no new metric introduced):

| Metric | Target |
|---|---|
| Decision Completion Rate (started → Decision Made) | 60% by Month 6 |
| Outcome Recording Rate (Decision Made → recorded Outcome) | 30% by Month 6 — the most important genuine-value signal |
| 30-Day Return Rate | 40% by Month 6 |
| 12-Month Pro Subscriber Retention | 60% by Month 12 |
| CAC | < €15 per paying subscriber |
| LTV (Pro, 12-month) | > €50 |
| LTV:CAC ratio | ≥ 3:1 before increasing paid spend |

Per H01/H02: the ultimate success definition is not measured by AI interaction volume but by whether users make consistently better real-world decisions — every metric above is a proxy for that, not the goal itself.

---

## 8. Risks

Derived from realities already documented elsewhere in the Handbook, not speculative additions:

- **Single-operator concentration risk.** DecisionOS has one operator and no on-call rotation (H14 §10, H15 §1). Incident response, deployment, and support all depend on one person's availability.
- **Third-party AI dependency.** The core value proposition depends entirely on the Anthropic API (H11) — both its availability (H09/H11's `429`/failure handling) and its pricing, which DecisionOS does not control and does not document a cost model for (§6).
- **Pre-launch verification gap.** Nine of the remaining IR01 tasks — including the security audit, AI acceptance criteria, and performance baseline — are blocked on missing production secrets, not defects (H16 §5, H17 §3). The business model's launch assumptions have not yet been verified end-to-end in production.
- **Legal-copy/product drift.** `/privacy` currently describes the pre-pivot legacy affiliate-quiz product rather than the actual DecisionOS Decision Object model (flagged in H14 §12.2) — a live discrepancy between what is legally disclosed and what the product (and this business model) actually does.
- **Affiliate model boundary risk.** Affiliate revenue is only acceptable under strict non-influence conditions (§4); the same page (`/privacy`) currently over-describes affiliate partnerships beyond what the actual product does, which is a reputational as well as legal risk if not corrected before scaling acquisition.
- **Market risk.** The category (AI-assisted decision-making) is easy to describe and easy for well-funded general-purpose AI assistants to approximate at a shallow level; the moat (§1) depends on accumulated Decision Object data and trust, both of which take real user volume and time to build.

---

## 9. Assumptions

Made explicit here because the model depends on them, per H07's own framing:

- Retention should be benchmarked against episodic, high-switching-cost tools (Notion, 1Password), not daily-use apps (H07 Part 5) — if this comparison is wrong, the stated retention targets may be miscalibrated.
- The revenue projection in §4 is a **minimum viable trajectory for a solo, organic-only operation** — explicitly not a target, and explicitly excluding paid acquisition, partnerships, or viral growth (H07 Part 6).
- Paid acquisition and the Public API/institutional revenue streams are gated behind proof of retention and product-market fit respectively (H07 Parts 3, 6) — the model assumes these gates will in fact be checked before capital is committed to them, not skipped under growth pressure.
- The three conversion triggers (post-Recommendation account creation, History limit, Chat attempt — H07 Part 4) are assumed to be the highest-probability conversion moments; this has not yet been measured against real user behavior, since the product has not yet completed its production launch checklist (H16 §8, H17 §3).

---

## 10. Known Gaps

1. **No unit-economics/COGS document exists.** §6's cost structure is qualitative only — no monthly Vercel/Supabase spend, no Anthropic per-request cost, and no Stripe fee rate is documented anywhere in the Handbook. Gross margin cannot currently be calculated from Handbook sources alone.
2. **No live production revenue yet.** H07's pre-launch completion criteria require subscription payments to process correctly in production, not test mode, before launch is considered complete — the projections in §4 are therefore entirely forward-looking, not validated against actual conversions.
3. **Cross-document principle-number drift.** H07 and other Handbook documents cite H02 principles by number (e.g., "Principle 6," "Principle 8") that do not match H02's actual current numbering (1. AI Never Decides through 10. Evolution Without Rebuilding). This is a pre-existing citation drift, not introduced here — flagged for a Handbook consistency pass rather than silently re-numbered in this document.

---

*DecisionOS Company Handbook | H18 — Business Model*
*Version 1.0 Draft | Status: Draft — pending founder review*
