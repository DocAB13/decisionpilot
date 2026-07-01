# H15 — Operations Handbook
**DecisionOS Company Handbook**
*Version 1.0 Draft | July 2026*
*Status: Draft — pending founder review*

---

## Preamble

This document consolidates how DecisionOS is run day to day: environments, secrets, deployment, backups, monitoring, logging, incidents, maintenance, and release. It introduces no new infrastructure — every control described here is already specified in H09 (§12 Deployment, §13 Environment Variables), H10 (§12 Error Logging, §14 Security Checklist, §17 Release Checklist), H12 (§10 Data Lifecycle, §11 Backup and Recovery), H13, or H14 (§10 Incident Response), or is a verified fact about the current infrastructure (existing `supabase/migrations/*cron*.sql` files, `Development Status.md`). Where H15 found a gap between what is specified and what is actually running, it is recorded in §12, not glossed over.

Before reading H15, be familiar with:
- **H09 §12, §13** — deployment pipeline and the complete environment variable reference
- **H10 §12, §14, §17** — logging standard, security checklist, release checklist
- **H12 §10, §11** — data lifecycle/cleanup jobs and backup/recovery
- **H14 §10, §11** — incident response and security audit cadence (H15 does not duplicate these, only cross-references them)

---

## 1. Scope

DecisionOS is a solo-operated, single-environment product: one Vercel project, one Supabase project, no staging environment, one operator (H09 §"Branch Strategy"). Every process below is sized for that reality — it is intentionally lighter than a multi-engineer, multi-environment operations model, and is expected to grow in H17's later tiers, not before.

---

## 2. Environment Management

Two environments only, per H09 §12: **local** (`npm run dev` + `.env.local`) and **production** (Vercel, deployed from `main`). There is no staging environment in MVP — pre-production testing is done locally.

| Environment | Config source | Purpose |
|---|---|---|
| Local | `.env.local` (gitignored, never committed) | Development and pre-push verification |
| Production | Vercel Dashboard → Settings → Environment Variables | Live at `decisionpilot.tech` |

Vercel also supports a Preview scope (per-PR/branch deploys) but MVP does not use pull requests (H09 §"Branch Strategy"), so Preview is not part of the current workflow.

**Adding a new environment variable** (H09 §13): add it to `.env.local` locally, add it in the Vercel Dashboard, and document it in H09 §13's variable reference table. All three steps are required — a variable in only one place is a latent production or local-dev break.

---

## 3. Secrets Management

The complete secret inventory is H09 §13's variable reference table (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_PREMIUM_PRICE_ID`) — not reproduced here to avoid two sources of truth drifting apart.

**Rules (H09 §13, H10 §14.1):**
- Only variables safe for public exposure carry the `NEXT_PUBLIC_` prefix; everything else is server-only.
- Secrets live in Vercel Environment Variables, never in `next.config.js` or any committed file.
- `.env.local` is gitignored; verify with `git log`/`git grep` before pushing that no secret has ever entered history.
- `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` must never appear in a client bundle — checked as part of every `next build` output review and the H14/IR01-083 security audit.

**Rotation (H09 §13):** update the secret in Vercel Dashboard first, then in `.env.local`. Vercel triggers an automatic redeploy if configured to. Rotation is also the primary containment step in incident response (H14 §10 step 2).

---

## 4. Deployment

**Platform:** Vercel, connected to `github.com/DocAB13/decisionpilot`. Every push to `main` triggers an automatic production deployment (H09 §12).

**Pipeline:**
```
push to main → GitHub notifies Vercel → npm install → next build
  → success: deploy to production CDN
  → failure: deployment blocked, previous version stays live
  → Vercel notifies developer (email/dashboard)
```

**Branch strategy:** single `main` branch is always production; no pull requests required at solo-operator scale (H09 §12) — revisited when the team grows.

**Build gate:** `next build` must complete without TypeScript or (if configured) blocking ESLint errors. Warnings are allowed but reviewed weekly (H09 §12).

**Pre-push requirement:** `npm run dev` runs correctly locally; no console errors on homepage, `/auth/login`, `/auth/signup`; Stripe webhook events verified in the Stripe Dashboard (H09 §12).

**Current deployment sync status (verified against `Development Status.md`):** GitHub `main` is ahead of the last Vercel deploy — GitHub is synced through commit `fa4a636` (IR01-070) with IR01-070b through IR01-075c committed locally but not yet pushed, while Vercel is synced only through IR01-060. This gap is expected at a mid-sprint checkpoint (work is pushed in batches, not every commit), but it means production does not yet reflect Phase 5's frontend work — see §12.

---

## 5. Backups and Recovery

Fully specified in H12 §11; summarized here as the operational reference:

| Aspect | Detail |
|---|---|
| Mechanism | Supabase Pro managed backups, daily + 7-day point-in-time recovery (PITR), stored in AWS S3, EU West (Frankfurt) |
| Schedule | Automatic daily backup at ~02:00 UTC; 7-day retention |
| RPO | ≤ 1 hour (via PITR within the 7-day window) |
| RTO | ≤ 4 hours (Supabase restore to new project + DNS/env update) |
| Worst-case data loss | ≤ 24 hours (daily backup if PITR unavailable) |

**Recovery process (H12 §11.3):** Supabase Dashboard → Database → Backups → select restore point → restore in place or to a new project → if a new project, update `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel → verify with a test login and Decision Object read.

**What Supabase backups do not cover (H12 §11.4):** Vercel environment variables (documented in H09 §13; `.env.local` is the offline copy), Stripe's own transaction/subscription records (Stripe retains these independently), and AI prompt versions (versioned in `core/ai/prompts.ts` in the Git repository itself, not the database). Recovering the application fully after a catastrophic loss requires the Supabase restore *and* the Vercel env vars *and* the Git history — no single backup covers all three.

---

## 6. Monitoring

**Current state: no dedicated monitoring or alerting service is integrated.** The only live signal sources are the Vercel Dashboard (deployment status, Function invocation logs) and the Stripe Dashboard (payment/webhook event history) — both are pull-based (someone has to look), not push-based (nothing pages anyone).

**Specified but not yet built (H10 §12.3, H17 v1.1):** an error monitoring service (Sentry or equivalent), with AI failure events alerting when the failure rate exceeds 2% in any 1-hour window. This is the first monitoring investment on the roadmap (H17 §4) — until it lands, failure-rate awareness depends entirely on someone manually reading Vercel Function logs.

---

## 7. Logging

**Standard (H10 §12.1):** all error logging uses `console.error` in the fixed format `console.error('[module-name]', error, { context })` — a string module identifier first, the error object second, plain-object context third. `console.log`/`console.info` are not permitted in committed code; `console.warn` is reserved for deprecation notices.

**Always logged (H10 §12.2):** unhandled API route exceptions (with `decision_id`/`user_id`), AI analysis failures (engine, prompt version, failure category), webhook validation failures, database write failures.

**Never logged:** user-provided content (Decision context, chat messages, personal information), authentication/session tokens or secrets, full request/response bodies from external APIs. IDs (decision, user, plan name) are logged; content is not.

**Retrieval (H10 §12.3):** Vercel Dashboard → Functions → Logs, retained 30 days on the Vercel Pro plan. For anything older, `decision_state_transitions` and Supabase's own audit logs are the forensic fallback — this is why that table is never truncated ahead of its normal cascade-delete lifecycle (H12 §10.5).

---

## 8. Scheduled Jobs and Maintenance

**Two pg_cron jobs are live**, confirmed present as applied migrations in `supabase/migrations/`:

| Job | Schedule | Action | Migration |
|---|---|---|---|
| `cleanup-expired-anonymous-decisions` | Every 6 hours (`0 */6 * * *`) | Deletes anonymous Decisions past their 48-hour `expires_at` (H12 §10.1, BR-04) | `20260615000000_create_anonymous_cleanup_cron.sql` |
| `revert-stuck-in-analysis-decisions` | Every 5 minutes (`*/5 * * * *`) | Reverts any Decision stuck in `in_analysis` for over 5 minutes back to `draft` (FR-06.3, H13 §3.4) | `20260615000001_create_stuck_analysis_cleanup_cron.sql` |

Both should be spot-checked as part of every release (H10 §17.1: "pg_cron jobs active") since a silently-failed cron job produces no error a user reports — it just leaves stale rows accumulating.

**Dependency maintenance:** `npm audit` shows no HIGH/CRITICAL findings and dependencies are pinned via `package-lock.json`, checked at release time (H10 §14.5), not on a separate schedule — there is no CI to run it continuously (§1). Build warnings are reviewed weekly (H09 §12).

---

## 9. Incident Handling

Fully specified in H14 §10; not duplicated here. Summary for operational reference: detection via Vercel/Supabase logs and the Stripe Dashboard (§6 above — the same pull-based sources, since no alerting exists yet) → containment by rotating the affected credential (§3) and redeploying → GDPR-triggered notification if personal data is involved (72-hour authority notification, direct user notification if high risk) → the fix and root cause recorded in `DecisionOS/Releases/CHANGELOG.md`, the same place CQ1/CQ2 and every audit-driven fix are already tracked.

**Hotfix process (H10 §17.3):** identify the issue from logs or a user report → reproduce locally → write a failing test if the bug is in testable code → fix → verify the test passes → deploy through the normal pipeline (§4) — there is no separate hotfix deployment path.

---

## 10. Release Process

Fully specified in H10 §17 and restated operationally in H16 §8; not duplicated in full here.

- **Pre-deployment (H10 §17.1):** all changes on `main`; `npm run build` clean; env vars set in Vercel; DB migrations applied to production; the two pg_cron jobs active (§8); Stripe webhook URL correct; AI prompt versions incremented if changed; new ADRs (if any) committed to `docs/adr/`.
- **Post-deployment, within 15 minutes (H10 §17.2):** homepage loads clean; login/signup work; a Decision can be started, analyzed, and produce a Recommendation; Final Decision recorded; Dashboard loads; Stripe Checkout opens; Vercel Functions logs show no new errors.

This is a manual checklist, not an automated gate — there is no CI pipeline enforcing it (§1); it depends on the operator running through it deliberately before and after each deploy.

---

## 11. Operational Checklist

A single consolidated list, pulling together §2–§10 into what actually needs checking and when:

**Before every push to `main`:**
- [ ] `npm run dev` runs cleanly; no console errors on homepage/`/auth/login`/`/auth/signup` (H09 §12)
- [ ] `npx tsc --noEmit`, `npx vitest run`, `npx next build` all pass (H16 §9, every CHANGELOG entry)

**Before every release that touches auth, API routes, schema, or an external integration:**
- [ ] H10 §14 Security Checklist passed (H14 §11)
- [ ] `npm audit` clean of HIGH/CRITICAL (§8)
- [ ] Relevant H06 AC / H09 TAC / H11 AAC satisfied (H16 §10)

**At every deploy:**
- [ ] H10 §17.1 pre-deployment checklist (§10)
- [ ] H10 §17.2 post-deployment verification within 15 minutes (§10)
- [ ] Both pg_cron jobs confirmed active (§8)

**Weekly:**
- [ ] Build warnings reviewed (H09 §12)
- [ ] Vercel Function logs skimmed for recurring errors not yet triaged (§6, in the absence of alerting)

**On any incident:**
- [ ] H14 §10 process followed: detect → contain (rotate secret, §3) → notify if personal data affected → record in CHANGELOG (§9)

---

## 12. Known Gaps

Recorded here rather than assumed resolved, consistent with how H14 §12 and H16 §12 handled the same question for their domains:

1. **Vercel production is behind GitHub `main`.** Per `Development Status.md`, GitHub is synced through IR01-070 (commit `fa4a636`) with IR01-070b–075c committed locally but not pushed, while Vercel is synced only through IR01-060 — production does not yet include any Phase 5 frontend work from IR01-061 onward. Not a defect; a normal batching gap, but worth stating precisely rather than assuming production matches the repository.
2. **No monitoring or alerting is live** (§6). The 2%-failure-rate AI alert and Sentry integration are both specified (H10 §12.3) but not built — first item on H17's v1.1 tier. Until then, incident detection depends entirely on someone checking the Vercel/Supabase/Stripe dashboards.
3. **`docs/adr/` does not exist yet**, though H10 §17.1's pre-deployment checklist already references committing new ADRs there. No ADR has been required to date, so this has not blocked a release, but the directory should exist before the first one is needed.
4. **No independent verification that the two pg_cron jobs are actually executing on schedule** (as opposed to merely being scheduled at migration time) has been performed — `cron.job_run_details` in the Supabase project has not been checked as part of this document's research. This should be a concrete step the first time §11's release checklist is run for real.

---

*DecisionOS Company Handbook | H15 — Operations Handbook*
*Version 1.0 Draft | Status: Draft — pending founder review*
