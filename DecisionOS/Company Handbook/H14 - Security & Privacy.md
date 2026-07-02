# H14 — Security & Privacy
**DecisionOS Company Handbook**
*Version 1.0 Draft | July 2026*
*Status: Draft — pending founder review*

---

## Preamble

This document is the consolidated, authoritative reference for how DecisionOS protects user data and complies with its privacy obligations. It does not introduce new architecture — every control described here is already specified in H09 (Technical Architecture), H10 (Development Standards), H11 (AI System Specification), H12 (Database Specification), or H13 (API Specification). H14's role is to bring those scattered controls together into one place an engineer, auditor, or the Founder can read end to end to answer "is DecisionOS secure and compliant," and to be the canonical checklist referenced by IR01-083 (Security audit) before every production launch.

Where a control is defined in full elsewhere, H14 states the control and cites the source rather than re-deriving it. Where H14 identifies a gap between what the Handbook specifies and what is currently implemented, the gap is stated explicitly in §12 — H14 does not paper over gaps by describing aspirational behavior as fact.

Before reading H14, engineers should be familiar with:
- **H02's Product Objective** — the product is not designed to maximize AI usage or engagement, and data serves the user's own decisions, not third-party interests; the principle this entire document implements
- **H06 FR-08, FR-09** — authentication and Decision Dashboard/deletion requirements
- **H09 §11** — the security controls as implemented in the current architecture
- **H10 §14** — the pre-release Security Checklist (the operational, checkbox form of this document)
- **H11 §10** — AI-specific input sanitization and prompt injection defenses
- **H12 §13** — RLS summary, data classification, GDPR compliance, and encryption at the database layer

---

## 1. Scope

H14 covers every place DecisionOS handles user data: the Next.js application, the Supabase database and auth layer, the Anthropic API integration, Stripe billing, Google Analytics, and the legal-facing pages (`/privacy`, `/terms`, `/cookies`) that describe this handling to users. It applies to every engineer working on authentication, API routes, database schema, AI prompt construction, or third-party integrations — the same trigger conditions as the H10 §14 checklist.

It does not cover physical security or personnel security controls — DecisionOS is a solo-operator company in MVP (H09 §"Branch Strategy"), and those controls are out of scope until the team grows.

---

## 2. Data Inventory & Classification

The complete table lives in H12 §13.2. Summarized here with its transmission path:

| Data | Classification | Stored in | Sent to third parties |
|---|---|---|---|
| Email + password | Personal Data (GDPR Art. 4) | `auth.users` (Supabase-managed, bcrypt-hashed password) | No |
| Decision content (context, goal, constraints, alternatives, etc.) | Personal Data | `decision_components.content` | Anthropic (per-request, to generate Analysis/Recommendation/Chat responses) |
| Chat messages | Personal Data | `decision_chat_messages.content` | Anthropic (per-request) |
| Subscription plan + Stripe customer/subscription IDs | Account data / reference data (no PII) | `subscriptions` | Stripe (originates there; DecisionOS never sees card data) |
| Prompt versions, state transition logs | System metadata | `decision_components.prompt_version`, `decision_state_transitions` | No |
| Page views, device/browser type, approximate location | Usage data | Google Analytics (not in Supabase) | Google, only after cookie consent |

No data in this table is used to build advertising profiles, and no Decision Object content is ever shared with Google Analytics or any other party besides Anthropic (H09 §"Data Privacy").

---

## 3. Identity & Access Management

### 3.1 Authentication

Supabase Auth, email + password only, per FR-08.1–FR-08.2. Passwords are hashed with bcrypt by Supabase; the application never sees or stores a plaintext password (H09 §11, H12 §13.4). Password reset links expire after 24 hours (FR-08.4, Supabase default).

The product must be fully usable without an account — authentication is required only to persist a Decision Object beyond 48 hours or to view Decision History (FR-08.7). This is a privacy control, not just a UX one: it minimizes the amount of personal data tied to an identity by default.

### 3.2 Session Management

Sessions are JWTs issued by Supabase, stored in `HttpOnly` cookies managed by `@supabase/ssr`. `HttpOnly` prevents theft via `document.cookie`/XSS (H09 §11). Sessions persist 30 days without re-authentication (FR-08.5); `middleware.ts` silently refreshes the access token on every request while the refresh token remains valid (H09 §4).

An anonymous user's Decision Objects (identified by `anonymous_token`, not a user ID) are transferred to their account automatically and immediately on signup (FR-08.6), and the anonymous token is cleared afterward (H09 §"Anonymous Session Handling").

### 3.3 Authorization Model

Two layers, both required — neither is sufficient alone:

1. **Database layer — Row Level Security.** Enabled on every user-data table (`decisions`, `decision_components`, `decision_chat_messages`, `decision_state_transitions`, `subscriptions`). Default posture is deny-all; the `anon` key can only read/write rows matching `auth.uid()` because a policy explicitly says so (H12 §1.1, §13.1). No policy grants one user's `anon`-key session access to another user's rows under any condition.
2. **Application layer — explicit ownership checks.** Every API route that touches user data validates the session via `supabase.auth.getUser()` and then verifies the requested resource belongs to that user before reading or writing it (H09 §11, H13 §1). This is deliberately redundant with RLS: RLS is the backstop if an application check is ever missed, and the application check is what lets the route return the correct error.

A resource that exists but belongs to another user returns `404`, not `403` (H10 §14.3) — this avoids confirming to an attacker that a given decision ID exists at all.

### 3.4 Service-Role Key Boundaries

`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS entirely and is used only in the two places that legitimately require cross-user access: the Stripe webhook handler and the anonymous-Decision cleanup job (H09 §11, H09 §"Environment Variables"). It is never included in a `NEXT_PUBLIC_` variable and never reaches the browser bundle — verified as part of every security audit (IR01-083).

---

## 4. Transport Security & Encryption

- All traffic is HTTPS; HTTP requests are rejected/redirected by Vercel (H13 §Preamble, H09 TAC-03).
- Data in transit is encrypted via TLS 1.3, enforced by Supabase and Vercel (H12 §13.4).
- Data at rest is encrypted by Supabase using AES-256. DecisionOS does not layer additional application-level encryption on top — platform-level encryption is judged sufficient for the MVP data classification (H12 §13.4). This is revisited if a future data class (e.g., payment instrument data) required it, which is not currently the case since Stripe holds all card data.
- Session cookies are `HttpOnly`; verified manually in browser DevTools as part of the release checklist (H10 §14.2, IR01-083).

---

## 5. AI System Data Handling

The Anthropic API is the only third party that receives Decision Object content, and only the content necessary to answer the specific request being made (H11 §"Model Configuration"). Three properties of this integration are the backbone of DecisionOS's AI privacy posture:

**Structured injection, not raw concatenation.** User-provided text (Context, Goal, Constraints, Alternative descriptions, Chat messages) is injected into prompts as labeled, structured fields — never as raw text spliced into an instruction string (H11 §"Structured Input Injection"). This is a security control, not a formatting choice: it is what makes prompt injection detectable and bounded.

**Sanitization before injection.** Every user-text field passes through `sanitizeForPrompt()` before it reaches any AI call (H11 §10, H13 §"Input Validation"). This strips meta-instruction patterns; it is explicitly documented as a supplementary defense, not a complete one — the primary defense against prompt injection is architectural: the AI has no ability to execute code, modify the database directly, or reach any external system regardless of what a prompt persuades it to "want" to do (H11 §10).

**No model-side persistence DecisionOS relies on.** DecisionOS calls the Anthropic API directly (`https://api.anthropic.com/v1/messages`) server-side only; the API key is never in the client bundle (H11 §"Provider Architecture"). The Chat system prompt is rebuilt from the current Decision Object on every call rather than stored and reused (H11 §"Chat Context Reconstruction"), so DecisionOS's own retention of AI conversation content is governed entirely by the database rules in §7, not by anything on the model provider's side.

Data volume sent per request is bounded and estimated in H11 §"Context Window Budget" (roughly 3–5k tokens per Analysis or Chat call) — there is no bulk export of a user's full history to the model in a single call.

---

## 6. Third-Party Subprocessors

| Subprocessor | Purpose | Data received | Location / safeguard |
|---|---|---|---|
| Supabase | Database, authentication | All personal data in §2 | EU West (Frankfurt) — in-EU, no transfer mechanism needed |
| Vercel | Hosting, CDN, serverless execution | Request/response traffic (in transit only; no independent data store) | Edge/global; API routes execute in the Supabase region |
| Anthropic | AI inference (Analysis, Recommendation, Chat, Suggestions engines) | Decision content and Chat messages, per-request | Governed by Anthropic's commercial API terms |
| Stripe | Subscription billing | Payment details (collected directly by Stripe, never transits DecisionOS servers), plan/customer/subscription IDs | PCI-DSS compliant by Stripe; DecisionOS is out of PCI scope for card data |
| Google Analytics | Aggregated usage statistics | Page views, device/browser type, approximate location — never Decision content | Consent-gated via `CookieBanner`; disclosed in `/privacy` |

Where a subprocessor is based outside the EEA, DecisionOS relies on that subprocessor's own standard safeguards (e.g., Standard Contractual Clauses) as disclosed in `/privacy` §4. This table is the internal register that `/privacy` §4 must stay in sync with — see §12.2 for a currently open discrepancy between the two.

---

## 7. Data Retention & Deletion

| Data | Retention rule | Source |
|---|---|---|
| Anonymous Decision Object | Deleted if unclaimed within 48 hours, by a scheduled Supabase function | BR-04, H09 §"Anonymous Session Handling" |
| Deleted Decision Object (user-initiated) | Physically removed from all tables within 24 hours via `ON DELETE CASCADE`; no soft-delete flag | FR-09.6, H12 §1.1 |
| Full account deletion | Cascades to all associated Decision Objects, components, chat messages, and subscription rows via `auth.users` FK cascade | H12 §13.3 — see §12.1 for implementation status |
| Billing records | Retained per statutory requirement (up to 10 years for German tax law) | `/privacy` §6 |
| Analytics data | Google Analytics standard retention settings | `/privacy` §6 |

A user can never accumulate silent, indefinite personal data: every table holding personal content has an explicit deletion path, and Decision Object history (H03 §Decision Identity) is a versioning mechanism for audit, not a reason to retain data past a user's deletion request.

---

## 8. Application Security Controls

- **Input validation:** all queries against Supabase use SDK parameter binding, which precludes SQL injection by construction (H13 §"Input Validation"). No route uses `eval()` or `Function()` (H10 §14.4).
- **File uploads:** not accepted anywhere in MVP — there is no upload attack surface to secure (H10 §14.4).
- **Rate limiting:** MVP does not implement application-level rate limiting. Vercel's serverless invocation limits and Anthropic's own `429` responses (surfaced to the user as `503`) are the only backstops. Per-user/per-IP rate limiting is deferred until an actual abuse pattern is observed (H13 §"Rate Limiting") — this is a known, accepted MVP tradeoff, not an oversight; see §12.3.
- **Secrets management:** all secrets live in Vercel Environment Variables, never in a committed file. `NEXT_PUBLIC_` is used only for values safe to expose in the browser (H09 §"Environment Variables", H10 §14.1).
- **Dependency hygiene:** `npm audit` must show no HIGH or CRITICAL findings before release; dependencies are pinned via `package-lock.json` (H10 §14.5). Verified as part of IR01-083.
- **Webhook integrity:** the Stripe webhook validates `stripe-signature` via `stripe.webhooks.constructEvent()` before processing; a request without a valid signature is rejected with `400` (H09 §"Stripe Security", H13 §"Webhook Handling").

---

## 9. Privacy Program (GDPR)

### 9.1 Legal bases (Art. 6)

- **Consent** — analytics cookies and any non-essential tracking.
- **Contract** — providing the Service, including paid subscriptions.
- **Legitimate interest** — keeping the Service secure, preventing abuse, improving recommendation quality.

### 9.2 Data subject rights

| Right | Mechanism |
|---|---|
| Access (Art. 15) | `GET /api/decision/history` + `GET /api/decision/[id]` return the complete set of a user's Decision Objects and components |
| Erasure (Art. 17) | Per-Decision deletion is live (`DELETE /api/decision/[id]`); full-account erasure is specified but not yet implemented — see §12.1 |
| Rectification | Users edit their own Decision Object inputs directly; no separate correction flow needed since data is user-authored |
| Portability | Same `GET` routes above return complete JSON; no separate export format exists yet |
| Objection / restriction | Cookie consent withdrawal via `CookieBanner`; no other processing currently runs without a lawful basis that would require a separate objection path |

Requests outside these self-service mechanisms are handled manually via `contact@decisionpilot.tech` (`/privacy` §7, §10).

### 9.3 Consent

`CookieBanner` gates Google Analytics behind an explicit accept/reject choice, persisted in `localStorage` (`cookie-consent`). No analytics fire before consent is given. Decision content, chat messages, and authentication cookies are treated as strictly necessary and are not gated behind this consent — they are required for the Service to function at all, consistent with the "Contract" legal basis in §9.1.

### 9.4 Data residency

All Supabase data is stored in EU West (Frankfurt) — the primary control satisfying GDPR data residency expectations for EU users (H09 §11, H12 §"Platform").

### 9.5 Data controller

DecisionPilot, Owner N. A. Bolos-Ardeleanu, Dresden, Germany — `contact@decisionpilot.tech`. No Data Protection Officer is designated; not required at current processing scale and headcount under Art. 37.

### 9.6 Children's privacy

DecisionOS is not directed at children under 16 and does not knowingly collect data from them (`/privacy` §8).

---

## 10. Incident Response

DecisionOS is a solo-operator company in MVP (H09 §"Branch Strategy"); incident response is correspondingly lightweight but not absent:

1. **Detection:** Vercel deployment/runtime logs, Supabase project logs, and the Stripe Dashboard are the available signal sources. There is no dedicated SIEM or alerting pipeline in MVP.
2. **Containment:** revoke/rotate the affected credential in Vercel Environment Variables (Supabase service role key, Anthropic API key, or Stripe secret key) and redeploy. Rotating the Supabase `anon`/service keys or Stripe keys is done from each provider's dashboard.
3. **Notification:** a confirmed breach involving personal data triggers the GDPR 72-hour supervisory authority notification clock (Art. 33) and, where risk to individuals is high, direct notification to affected users (Art. 34) via `contact@decisionpilot.tech`'s outbound channel.
4. **Post-incident:** the fix and its root cause are recorded in `DecisionOS/Releases/CHANGELOG.md`, consistent with how CQ1/CQ2 and other audit-driven fixes are already tracked.

This process is intentionally minimal for MVP scale and is revisited (formal runbook, on-call rotation) once the team grows beyond a single operator — tracked as a post-MVP item in H15 (Operations Handbook) once that document is written.

---

## 11. Security Testing & Audit Cadence

The operational, checkbox-level version of this document is H10 §14 (Security Checklist), executed in full as IR01-083 before the initial production launch and reused on every subsequent release that touches authentication, API routes, database schema, or an external service integration (H10 §14 preamble). It covers: secrets hygiene, `HttpOnly` cookie verification, webhook signature rejection testing, dual-account RLS verification (user A cannot reach user B's decisions), and HTTPS enforcement.

`npm audit` is run as part of that same checklist rather than on a separate schedule. There is no independent penetration test or bug bounty program at MVP scale (see §12.4).

---

## 12. Known Gaps

Consistent with how this codebase tracks discovered gaps (see `DecisionOS/Releases/CHANGELOG.md`'s "Roadmap extension" entries), the following discrepancies were found while writing this document and are recorded here rather than silently assumed away:

### 12.1 Account-level erasure is not yet implemented

H12 §13.3 states GDPR Art. 17 erasure is "implemented in the account settings API route." No such route exists in `pages/api/` today, and `pages/account.tsx` does not exist (confirmed independently during UX3, `DecisionOS/Releases/CHANGELOG.md`). Per-Decision deletion (FR-09.6) is real and live; full-account deletion is currently only possible manually, via the data controller contact in §9.2. This should be scoped as an IR01 task before launch, since Art. 17 compliance currently depends on a manual process rather than the self-service mechanism the Handbook describes.

### 12.2 `/privacy` describes the legacy affiliate-quiz product, not DecisionOS

`pages/privacy.js` currently describes "Decision answers" from category quizzes (vacation, car, phone) and lists "Affiliate partners (AutoScout24, CHECK24, Booking.com, Wayfair, Sixt, Europcar...)" as a subprocessor category. This reflects the pre-UX1 legacy landing page, which UX1 (`DecisionOS/Releases/CHANGELOG.md`) already repositioned to the real DecisionOS product while explicitly leaving the legacy quiz engine unreachable but not deleted. The legal copy was not part of UX1's scope and was not updated, so it no longer matches either the actual data model (H03/H12: Decision Objects with thirteen components, not quiz answers) or the actual subprocessor list in §6 of this document. This is a legal-copy remediation item, not a H14 authoring task — flagged here for a follow-up IR01/CQ task, not fixed in this pass.

### 12.3 No application-level rate limiting

Accepted MVP tradeoff per H13 §"Rate Limiting," reiterated here because it is a security control, not just a performance one: without it, a single user or script can issue an unbounded number of Analysis/Chat requests bounded only by Anthropic's own `429` responses. Acceptable at current scale; revisit if abuse is observed.

### 12.4 No independent security audit or penetration test

The checklist in H10 §14 is self-administered. No third-party audit, penetration test, or bug bounty exists at MVP scale. Acceptable for a solo-operator pre-revenue-scale product; should be revisited alongside the first significant funding or enterprise customer, whichever comes first.

---

*DecisionOS Company Handbook | H14 — Security & Privacy*
*Version 1.0 Draft | Status: Draft — pending founder review*
