# H19 — Glossary
**DecisionOS Company Handbook**
*Version 1.0 Draft | July 2026*
*Status: Draft — pending founder review*

---

## Preamble

This is the consolidated glossary for every term used across H00–H18. It defines no new concept — each entry is a concise restatement of a term already defined (or consistently used) elsewhere in the Handbook, with a source citation so the full definition can always be traced back. Where a term is used with a project-specific meaning that differs from its everyday meaning (e.g. "Decision," "Category," "Layer"), that specific meaning is what's given here, not a dictionary definition.

---

## 1. Product Terms

**Decision / Decision Object** — The core object of DecisionOS: a structured, documented process through which a person moves from uncertainty to confident action, composed of thirteen components (0–12). Not a chat, not a session — a persistent, first-class record (H03).

**Decision Identity** — Component 0 of the Decision Object: its permanent ID, owner, timestamps, status, category, and Version History (H03).

**Category** — The decision domain (Financial, Technology, Insurance, Career/Education, Travel/Lifestyle, etc.) that determines which questionnaire framework, AI prompts, and risk patterns apply (H03, H07 Part 2).

**Decision Wizard** — The guided flow that collects Context, Goal, Constraints, and Alternatives one concept at a time; part of the Experience Layer (H04 Layer 5, H05 §1.3–1.5).

**Recommendation / Recommendation View** — The AI's synthesized, reasoned suggestion of which alternative best serves the user's goal within their constraints, shown with full reasoning, pros/cons, risks, and conditions for change (H03 component 7, H05 §1.7).

**Final Decision** — Component 8: what the user actually chose, whether or not it matches the Recommendation, and why if it diverges (H03).

**Action Plan** — Component 9: three to five concrete, sequenced next steps generated for the user's chosen alternative (H03, H05 §1.9).

**Outcome** — Component 10: what actually happened as a result of the decision, recorded after execution (H03, H05 §2.3).

**Reflection** — Component 11: the user's optional retrospective on whether the decision-making *process* was sound, independent of the outcome (H03, H05 §2.4).

**Lessons Learned** — Component 12: reusable knowledge extracted from a completed Decision, surfaced to the same user on a future Decision in the same category (H03, H05 §4.3).

**Decision History** — The authenticated user's structured library of past Decision Objects, filterable by state, category, date, and outcome quality (H05 §4.1).

**Dashboard** — The authenticated user's homepage: a task list organized around Decision Objects requiring action, not a feed (H05 §2.1).

**Decision Intelligence** — The accumulation and application of knowledge extracted from completed Decisions, at both the individual level (a user's own patterns) and system level (aggregated, anonymized, consented data) (H03).

**Knowledge Base** — The post-MVP store of anonymized, aggregated Decision Intelligence, populated by the Learning Pipeline from completed Decisions' Outcome/Reflection data (H04 Layer 2, H12 §14).

**Learning Pipeline** — The post-MVP process that reads completed, consented Decision Objects, anonymizes them, and writes patterns into the Knowledge Base (H04 Layer 3, H09 §17).

**Anonymous Decision Object** — A Decision created without an account (`owner_id = null`, identified by `anonymous_token`), preserved for 48 hours before deletion unless claimed (H03, H12 §10.1, BR-04).

**Archiving** — Setting a Completed Decision's status to `archived`, removing it from the default Dashboard view while preserving all data; reversible (H03, H12 §10.2).

---

## 2. Decision Lifecycle Terminology

The seven states every Decision Object moves through, in order (H03 §Decision States):

| State | Meaning |
|---|---|
| **Draft** | Created; user is providing Context/Goal/Constraints/Alternatives; no analysis requested yet |
| **In Analysis** | Sufficient input submitted; AI is actively processing |
| **Waiting for User** | Analysis complete, Recommendation generated; decision is in the user's hands |
| **Decision Made** | Final Decision recorded; Action Plan becomes active |
| **Executing** | User is working through the Action Plan |
| **Completed** | Outcome has been recorded; Reflection/Lessons Learned available |
| **Archived** | Closed and stored for long-term reference; still fully accessible |

**Decision Lifecycle** — The full arc from a person first becoming aware they face a choice (IDEA) through Context Collection, AI Analysis, Recommendation, Human Decision, Execution, Outcome, Reflection, to Decision Intelligence — not always linear, but never skippable (H03).

**State transition / `advanceState`** — The act of moving a Decision Object from one state to the next; owned exclusively by the Decision Layer/Decision Engine — no other layer may change a Decision's state directly (H04 Layer 4).

---

## 3. AI Terminology

**AI Analysis** — Component 5: structured reasoning applied to the alternatives given context, goal, and constraints; the intellectual core of the Decision (H03).

**Analysis Engine / Recommendation Engine / Action Plan Engine / Chat Engine / Suggestion Engine / Conflict Detection** — The six AI reasoning functions, each with its own prompt builder in `core/ai/prompts.ts`, all running on a single model (`claude-sonnet-4-6`) in MVP (H11).

**Prompt Version** — A version string (e.g. `analysis-v1.0`) stamped on every AI-generated component, so a Decision may contain analysis from multiple prompt versions over its life without ambiguity (H11 §"Prompt Versioning").

**System Prompt** — The instruction set sent to the model on every request; for Chat, rebuilt fresh from the current Decision Object state on every call rather than stored (H11).

**Structured Input Injection** — Injecting user text into prompts as labeled, structured fields rather than raw concatenation — the primary structural defense against prompt injection (H11 §10, H14 §5).

**`sanitizeForPrompt`** — The function every user-text field passes through before reaching any AI call; strips meta-instruction patterns as a supplementary (not sole) prompt-injection defense (H11 §10).

**Hard Constraint / Soft Constraint** — A hard constraint is an absolute limit an alternative must satisfy (violating it disqualifies the alternative from being recommended); a soft constraint is a preference (H03 component 3, H11 §12).

**Recommendation Contract** — The fixed set of terms every valid Recommendation output must include (e.g. `primary_reasoning`, `conditions_for_change`, `honest_tradeoffs`) — enforced by output validation, not just prompted (H11 §12).

**`specific_to_user`** — A boolean output-validation flag rejecting AI analysis points that are generic rather than traceable to a specific user input (H11 §9, AAC-01).

**`market_data_caveat` / `professional_advice_disclaimer`** — Required non-empty fields for Financial/Technology/Insurance and Financial/Health/Insurance category analyses respectively, disclaiming real-time data or professional advice claims (H11 §8–9).

**Tie Detection** — The Recommendation Engine's logic for identifying when two alternatives are objectively equal rather than forcing a false winner (H11, AAC-02).

**Provider Abstraction Layer** — A post-MVP refactor isolating the Anthropic-specific API call behind a model-agnostic interface, so switching providers touches only the call layer (H11 §13.3).

---

## 4. Technical Terms

**Row Level Security (RLS)** — PostgreSQL policies enabled on every user-data table; default-deny, so the `anon` key can only access rows a policy explicitly permits (H09 §11, H12 §1.1).

**`anon` key / `service_role` key** — Supabase API keys: `anon` is safe for the browser and fully RLS-constrained; `service_role` bypasses RLS entirely and is used only in webhook/background-job routes (H09 §11).

**System Layers** — The six architectural layers each with a strict one-directional contract (H04): **Infrastructure Layer** (billing entitlements, external service connections), **Data Layer** (persistence, source of truth), **Intelligence Layer** (AI reasoning, never stores data), **Decision Layer** (owns the Decision state machine — the only layer that may change a Decision's state), **Experience Layer** (Wizard, Dashboard, Chat — translates the Decision Model into UI), **Interface Layer** (delivers the Experience Layer across web/API/embedded surfaces).

**Decision Engine** — The component within the Decision Layer that is the only thing in the system permitted to advance a Decision Object through its lifecycle (H04 Layer 4).

**`is_current`** — The flag on `decision_components` rows marking the current version of a component; old versions are preserved, never overwritten (H12 §1.1).

**Middleware** (`middleware.ts`) — Runs on every request before any page/API route; refreshes the Supabase session token and enforces auth-based redirects (H09 §4).

**pg_cron job** — A scheduled PostgreSQL job; DecisionOS runs two — anonymous Decision cleanup (every 6 hours) and stuck `in_analysis` reversion (every 5 minutes) (H12 §10.1, H15 §8).

**PITR (Point-in-Time Recovery)** — Supabase's WAL-based recovery mechanism allowing restoration to any point within the 7-day backup retention window (H12 §11).

**RPO / RTO (Recovery Point / Time Objective)** — Target maximum data loss (≤1 hour) and downtime (≤4 hours) in a recovery scenario (H12 §11, H15 §5).

**Architecture Decision Record (ADR)** — A document capturing a significant architectural decision, its status (Draft → Accepted → Superseded), and its rationale; committed to `docs/adr/` (H10, H15 §10).

**Design Tokens** — Named, reusable design values (color, spacing, type) imported globally so all UI stays visually consistent (H08 §5, H09 TAC-08).

---

## 5. Business Terminology

**Free / Pro / Premium** — The three subscription tiers (€0 / €4.99 / €9.99 per month); no step of the Decision Lifecycle is ever gated behind a paid tier (BR-10, H06 FR-11, H18 §3).

**Freemium (DecisionOS's model)** — Paid tiers add *depth and history*, not a different core product — deliberately not the standard freemium pattern of restricting core functionality (H07 Part 4, H18 §3).

**Conversion Trigger** — One of three moments most likely to convert a Free user: post-Recommendation account creation, Decision History limit reached, or attempting Chat on Free tier (H07 Part 4).

**MRR (Monthly Recurring Revenue)** — Subscription revenue per month; DecisionOS's conservative solo-operator projection targets €9,000 MRR by Month 24 (H07 Part 6, H18 §4).

**CAC (Customer Acquisition Cost) / LTV (Lifetime Value)** — Cost to acquire one paying subscriber (target < €15) and a subscriber's projected value (target > €50 at 12 months for Pro); paid spend only increases once LTV:CAC ≥ 3:1 (H07 Part 3, H18 §7).

**Decision Completion Rate / Outcome Recording Rate / 30-Day Return Rate** — DecisionOS's core retention metrics: percentage of started Decisions reaching Decision Made, percentage of those receiving a recorded Outcome, and percentage of users returning within 30 days (H07 Part 5, H18 §7).

**Affiliate Partnership** — A secondary, tightly constrained revenue channel: a link may only point to the product the user's own Final Decision named, never a sponsored alternative, and must never influence the Recommendation (H07 Part 6, H18 §4).

**Layer 1 / Layer 2 / Layer 3 (Markets)** — H07's market tiers: individual consumers (MVP), professional/API licensing for advisors and coaches (post-MVP), and institutional embedding for organizations (post-MVP, long-term) (H07, H17 §6, H18 §2).

**Stage 1 / Stage 2 / Stage 3** — H01's product evolution stages: Individual, Team, and Organizational Decision Intelligence — the long-term vision this Handbook's MVP is Stage 1 of (H01, H17 §1).

---

## 6. Acronyms

| Acronym | Meaning | Source |
|---|---|---|
| **FR** | Functional Requirement | H06 |
| **BR** | Business Rule | H06 Part 4 |
| **AC** | Acceptance Criteria (functional) | H06 Part 5 |
| **TAC** | Technical Acceptance Criteria | H09 |
| **AAC** | AI Acceptance Criteria | H11 §14 |
| **DoD** | Definition of Done | H10 §16 |
| **ADR** | Architecture Decision Record | H10 |
| **RLS** | Row Level Security | H09, H12 |
| **JWT** | JSON Web Token (session format) | H09 §11 |
| **PITR** | Point-in-Time Recovery | H12 §11 |
| **RPO / RTO** | Recovery Point / Time Objective | H12 §11 |
| **GDPR** | General Data Protection Regulation | H12 §13, H14 |
| **PII** | Personally Identifiable Information | H14 |
| **SCC** | Standard Contractual Clauses (EEA data transfer safeguard) | H14 §6 |
| **DPO** | Data Protection Officer | H14 §9 |
| **CAC / LTV / MRR** | Customer Acquisition Cost / Lifetime Value / Monthly Recurring Revenue | H07, H18 |
| **TAM / SAM** | Total / Serviceable Addressable Market | H07 Part 2 |
| **IR01** | The MVP Implementation Roadmap (task-level plan for v1.0) | `Implementation Reports/IR01...` |
| **IR02** | The not-yet-scoped next implementation roadmap, expected after IR01 closes | H17 §8 |
| **CQ1 / CQ2** | Ad hoc "Critical Fix" IDs for audit-driven hotfixes outside IR01 numbering | `CHANGELOG.md` |
| **UX1 / UX2 / UX3** | Ad hoc UX-defect fix IDs, tracked the same way as CQ1/CQ2 | `CHANGELOG.md` |
| **MVP** | Minimum Viable Product (the current, v1.0 scope) | H01, H06 |

---

*DecisionOS Company Handbook | H19 — Glossary*
*Version 1.0 Draft | Status: Draft — pending founder review*
