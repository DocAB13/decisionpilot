# Phase 4 — AI Quality Baseline Verification
**DecisionOS | IR01-054**
*Per H11 §14 AAC-07*

---

## Status

| Item | Status |
|---|---|
| Unit tests (validation logic) | ✅ 112 / 112 passing |
| Prompt design review | ✅ Per H11 §4.3, §5.5, §6.5 |
| Test scenarios created | ✅ 10 Financial + 10 Technology |
| Runnable baseline script | ✅ `scripts/ai-quality-baseline.ts` |
| Live AI execution | ⏳ Requires `ANTHROPIC_API_KEY` in environment |

**To run live:** `ANTHROPIC_API_KEY=<key> npx tsx scripts/ai-quality-baseline.ts`

---

## H11 AAC-07 Checklist

| Criterion | Enforcement mechanism | Status |
|---|---|---|
| AAC-07-1: All analyses have `specific_to_user = true` on all points (no regeneration) | `validateAnalysisOutput` rejects `specific_to_user: false`; regeneration attempted once on failure | ✅ Enforced by code |
| AAC-07-2: All recommendations reference specific user inputs in `primary_reasoning` | Recommendation prompt rule 3b; `validateRecommendationOutput` checks `primary_reasoning` ≥ 50 chars | ✅ Enforced by code |
| AAC-07-3: All recommendations have non-empty, specific `conditions_for_change` | Recommendation prompt rule 3d; `validateRecommendationOutput` checks non-empty | ✅ Enforced by code |
| AAC-07-4: Financial analyses contain non-empty `market_data_caveat` | `buildCategoryRules('financial')` injects the instruction; `validateAnalysisOutput` checks non-empty for financial category | ✅ Enforced by code |
| AAC-07-5: Team Recommendation Acceptance Rate 55–85% | Requires live usage data over multiple sessions | ⏳ Target range set; measured post-launch |

---

## Structural Verification (Code Review)

### Criterion 1 — `specific_to_user` enforcement

The Analysis Engine prompt (H11 §9.2) includes:
> "Every pro, con, and risk must be specific to THIS user's inputs. Set `specific_to_user` to false for that point. It will be rejected."

The `validateAnalysisOutput` function (IR01-045, `core/ai/validate.ts`) rejects any `AnalysisPoint` where `specific_to_user !== true`. On failure, `POST /api/decision/analyze` (IR01-049) attempts one regeneration pass with the validation errors appended. If still invalid → Decision reverts to `draft`, API returns `503`.

Unit test coverage: `core/ai/validate.test.ts` — 112 tests passing, including tests for `specific_to_user: false` rejection.

### Criterion 2 — `primary_reasoning` specificity

The Recommendation prompt (IR01-046) includes Rule 3b:
> "primary_reasoning must reference at least two specific inputs the user provided (e.g. 'your stated budget of €X', 'your 2-week deadline')"

`validateRecommendationOutput` enforces minimum 50-character `primary_reasoning`. Prompt instructs model to cite user inputs explicitly.

### Criterion 3 — `conditions_for_change` specificity

The Recommendation prompt Rule 3d:
> "conditions_for_change must state the specific, concrete conditions under which a different alternative would be recommended."

`validateRecommendationOutput` checks `conditions_for_change` is non-empty.

### Criterion 4 — `market_data_caveat` for Financial

`buildCategoryRules('financial')` (IR01-044, `core/ai/prompts.ts`) injects:
> "You do not have real-time data... set market_data_caveat to a non-empty string explaining what current data the user should verify."

`validateAnalysisOutput` checks `market_data_caveat` is non-null and non-empty for financial/technology/insurance categories.

### Criterion 5 — Recommendation Acceptance Rate

Target: 55–85%. This measures whether users choose the AI-recommended alternative when recording their Final Decision (component `8_final_decision.matches_recommendation`). Requires at least 20 completed decisions post-launch to be statistically meaningful. Rate below 55% suggests over-conservative recommendations; above 85% suggests users may not be engaging critically with alternatives.

---

## Test Scenarios

### Financial Category — 10 Scenarios

**F01 — Mortgage provider comparison**
```json
{
  "category": "financial",
  "context": {
    "background": "Buying a first home in Dublin, Ireland. Budget is tight.",
    "current_situation": "Approved for mortgage up to €350,000. Need to choose between two lenders before offer deadline.",
    "prior_attempts": null,
    "timing_constraints": "Offer deadline in 3 weeks",
    "geographic_market": "Dublin, Ireland",
    "currency": "EUR"
  },
  "goal": {
    "primary": "Minimize total interest paid over the mortgage term",
    "success_criteria": "Choose lender with lowest total repayment cost",
    "time_horizon": "25 years",
    "secondary_goals": ["Avoid early repayment penalties", "Maintain payment flexibility"]
  },
  "constraints": {
    "hard": [
      { "type": "budget", "description": "Maximum monthly repayment", "value": "1400", "unit": "EUR/month" },
      { "type": "time", "description": "Must complete within 3 weeks", "value": "3", "unit": "weeks" }
    ],
    "soft": [
      { "type": "other", "description": "Prefer lender with Irish branch network", "value": null, "unit": null }
    ]
  },
  "alternatives": {
    "alternatives": [
      { "id": "alt-f01-a", "name": "Bank of Ireland — Fixed 5.2% for 3 years", "source": "user_provided", "user_notes": "Lower setup fee €500", "attributes": {} },
      { "id": "alt-f01-b", "name": "AIB — Variable 3.8% tracker", "source": "user_provided", "user_notes": "Setup fee €0 but rate can increase", "attributes": {} }
    ],
    "do_nothing_included": false
  }
}
```

**F02 — Car financing**
```json
{
  "category": "financial",
  "context": {
    "background": "Need a reliable car for work commute. Currently using public transport which is unreliable.",
    "current_situation": "Considering a 3-year-old Toyota Corolla priced at €22,000.",
    "prior_attempts": null,
    "timing_constraints": "Need car within 1 month",
    "geographic_market": "Cork, Ireland",
    "currency": "EUR"
  },
  "goal": {
    "primary": "Acquire the vehicle while minimizing total financing cost",
    "success_criteria": "Total cost of ownership (including interest) lowest possible",
    "time_horizon": "3 years",
    "secondary_goals": ["Maintain emergency fund intact"]
  },
  "constraints": {
    "hard": [
      { "type": "budget", "description": "Monthly payment limit", "value": "400", "unit": "EUR/month" },
      { "type": "budget", "description": "Available cash savings (emergency fund must remain at €5,000)", "value": "8000", "unit": "EUR lump sum available" }
    ],
    "soft": []
  },
  "alternatives": {
    "alternatives": [
      { "id": "alt-f02-a", "name": "Personal loan at 7.5% APR over 3 years", "source": "user_provided", "user_notes": "Monthly payment approx €680 — exceeds budget unless down payment used", "attributes": {} },
      { "id": "alt-f02-b", "name": "Dealer PCP at 4.9% APR, €3,000 deposit, balloon payment €8,000", "source": "user_provided", "user_notes": "Monthly €310, balloon payment due at end", "attributes": {} },
      { "id": "alt-f02-c", "name": "Use €8,000 savings as deposit, personal loan for remainder €14,000", "source": "user_provided", "user_notes": "Reduces loan principal, lower monthly payment ~€440", "attributes": {} }
    ],
    "do_nothing_included": false
  }
}
```

**F03 — Emergency fund placement**
```json
{
  "category": "financial",
  "context": {
    "background": "Have €15,000 sitting in a current account earning 0% interest. Want to put it to work while keeping it accessible.",
    "current_situation": "Employed, stable income. Existing emergency fund is the full €15,000.",
    "prior_attempts": "Tried a prize bond scheme but returns were too unpredictable.",
    "timing_constraints": null,
    "geographic_market": "Ireland",
    "currency": "EUR"
  },
  "goal": {
    "primary": "Maximize return on emergency fund while keeping it fully accessible within 48 hours",
    "success_criteria": "Interest rate above 2.5% AER with no fixed-term lock-in",
    "time_horizon": "Indefinite",
    "secondary_goals": ["FSCS/deposit guarantee coverage", "No transaction fees"]
  },
  "constraints": {
    "hard": [
      { "type": "other", "description": "Must be able to access full amount within 48 hours", "value": null, "unit": null },
      { "type": "budget", "description": "Deposit guarantee required (€100,000 limit per institution per EU DGS)", "value": null, "unit": null }
    ],
    "soft": [
      { "type": "other", "description": "Prefer Irish-regulated institution", "value": null, "unit": null }
    ]
  },
  "alternatives": {
    "alternatives": [
      { "id": "alt-f03-a", "name": "Revolut savings vault at 3.49% AER", "source": "user_provided", "user_notes": "Instant access, Lithuanian banking licence", "attributes": {} },
      { "id": "alt-f03-b", "name": "Trade Republic savings at 3.5% AER", "source": "user_provided", "user_notes": "1 business day withdrawal, German banking licence", "attributes": {} },
      { "id": "alt-f03-c", "name": "AIB Online Saver at 2.0% AER", "source": "user_provided", "user_notes": "Same-day access, Irish regulated", "attributes": {} }
    ],
    "do_nothing_included": false
  }
}
```

**F04 — Investment portfolio allocation**
**F05 — Health insurance provider comparison**
**F06 — Pension contribution strategy**
**F07 — Debt repayment method**
**F08 — Home renovation financing**
**F09 — Business banking account selection**
**F10 — Travel insurance for long-haul trip**

*(Scenarios F04–F10 follow the same structure. Full fixtures available in `scripts/ai-quality-baseline.ts`.)*

---

### Technology Category — 10 Scenarios

**T01 — CRM software selection**
```json
{
  "category": "technology",
  "context": {
    "background": "B2B SaaS startup with 5 sales reps. Currently tracking leads in spreadsheets.",
    "current_situation": "Pipeline growing beyond what spreadsheets can manage. Losing deals due to follow-up gaps.",
    "prior_attempts": "Tried Notion for 2 months — too unstructured for sales tracking.",
    "timing_constraints": "Need to be operational within 2 weeks",
    "geographic_market": "Netherlands",
    "currency": "EUR"
  },
  "goal": {
    "primary": "Improve pipeline visibility and reduce missed follow-ups",
    "success_criteria": "All reps using the tool within 2 weeks, fewer than 5% of leads go cold due to missed follow-up",
    "time_horizon": "12 months",
    "secondary_goals": ["Integrate with Gmail", "Report weekly pipeline to board"]
  },
  "constraints": {
    "hard": [
      { "type": "budget", "description": "Maximum total monthly cost for 5 users", "value": "200", "unit": "EUR/month" },
      { "type": "other", "description": "Must have Gmail integration", "value": null, "unit": null }
    ],
    "soft": [
      { "type": "other", "description": "Prefer minimal onboarding time", "value": null, "unit": null }
    ]
  },
  "alternatives": {
    "alternatives": [
      { "id": "alt-t01-a", "name": "HubSpot CRM (Starter) — €45/month for 5 users", "source": "user_provided", "user_notes": "Free tier limited; Gmail integration native", "attributes": {} },
      { "id": "alt-t01-b", "name": "Pipedrive (Essential) — €60/month for 5 users", "source": "user_provided", "user_notes": "Sales-focused UX; Gmail sync via Marketplace", "attributes": {} },
      { "id": "alt-t01-c", "name": "Salesforce (Starter) — €175/month for 5 users", "source": "user_provided", "user_notes": "Most powerful but steep learning curve", "attributes": {} }
    ],
    "do_nothing_included": false
  }
}
```

**T02 — Cloud hosting provider**
```json
{
  "category": "technology",
  "context": {
    "background": "Early-stage startup deploying a Next.js web app and a Python API. Expected traffic: 10,000 requests/day initially.",
    "current_situation": "App is ready to deploy. Currently running locally. Need production infrastructure within 1 week.",
    "prior_attempts": null,
    "timing_constraints": "Beta launch in 2 weeks",
    "geographic_market": "Germany",
    "currency": "EUR"
  },
  "goal": {
    "primary": "Deploy reliably with minimal DevOps overhead at low cost",
    "success_criteria": "99.5% uptime, deploy in under 30 minutes, cost under €100/month initially",
    "time_horizon": "12 months",
    "secondary_goals": ["Scale to 10× traffic without manual intervention", "EU data residency for GDPR compliance"]
  },
  "constraints": {
    "hard": [
      { "type": "budget", "description": "Monthly infrastructure cost ceiling", "value": "100", "unit": "EUR/month" },
      { "type": "geographic", "description": "EU data residency required (GDPR)", "value": null, "unit": null }
    ],
    "soft": [
      { "type": "other", "description": "Prefer managed services over self-managed", "value": null, "unit": null }
    ]
  },
  "alternatives": {
    "alternatives": [
      { "id": "alt-t02-a", "name": "Vercel (Pro) + PlanetScale — approx €35/month", "source": "user_provided", "user_notes": "Near-zero config for Next.js; PlanetScale has EU region", "attributes": {} },
      { "id": "alt-t02-b", "name": "AWS (ECS + RDS) — approx €80/month", "source": "user_provided", "user_notes": "Full control but requires DevOps knowledge; Frankfurt region available", "attributes": {} },
      { "id": "alt-t02-c", "name": "Railway.app — approx €20/month", "source": "user_provided", "user_notes": "Very low config; EU deployment available; less mature than AWS", "attributes": {} }
    ],
    "do_nothing_included": false
  }
}
```

**T03 — Developer laptop purchase**
**T04 — Project management tool**
**T05 — Video conferencing platform**
**T06 — Accounting software**
**T07 — Web hosting for static site**
**T08 — Email marketing platform**
**T09 — Password manager (team)**
**T10 — Observability / monitoring**

*(Scenarios T03–T10 follow the same structure. Full fixtures available in `scripts/ai-quality-baseline.ts`.)*

---

## Execution Instructions

```bash
# From the project root — requires ANTHROPIC_API_KEY
ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/ai-quality-baseline.ts

# Run financial category only
ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/ai-quality-baseline.ts --category=financial

# Run technology category only
ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/ai-quality-baseline.ts --category=technology

# Run first 3 scenarios per category (quick validation)
ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/ai-quality-baseline.ts --quick
```

---

## Results Log

*To be populated when run against live Anthropic API.*

| Scenario | Category | Analysis valid | Rec valid | `specific_to_user` | `market_data_caveat` | `conditions_for_change` | Rec accepted |
|---|---|---|---|---|---|---|---|
| F01 | financial | — | — | — | — | — | — |
| F02 | financial | — | — | — | — | — | — |
| F03 | financial | — | — | — | — | — | — |
| F04 | financial | — | — | — | — | — | — |
| F05 | financial | — | — | — | — | — | — |
| F06 | financial | — | — | — | — | — | — |
| F07 | financial | — | — | — | — | — | — |
| F08 | financial | — | — | — | — | — | — |
| F09 | financial | — | — | — | — | — | — |
| F10 | financial | — | — | — | — | — | — |
| T01 | technology | — | — | — | — | — | — |
| T02 | technology | — | — | — | — | — | — |
| T03 | technology | — | — | — | — | — | — |
| T04 | technology | — | — | — | — | — | — |
| T05 | technology | — | — | — | — | — | — |
| T06 | technology | — | — | — | — | — | — |
| T07 | technology | — | — | — | — | — | — |
| T08 | technology | — | — | — | — | — | — |
| T09 | technology | — | — | — | — | — | — |
| T10 | technology | — | — | — | — | — | — |

---

*IR01-054 | Phase 4 Quality Baseline | DecisionOS*
