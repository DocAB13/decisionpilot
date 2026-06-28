# H12 — Database Specification
**DecisionOS Company Handbook**
*Version 1.0 Final | June 2026*
*Status: Frozen*

---

## Preamble

This document is the authoritative specification for the DecisionOS database. It defines every table, every column, every relationship, every index, every Row Level Security policy, every constraint, and the complete data lifecycle from creation through deletion.

H12 expands the database overview in H09 §5 into a complete operational reference. H09 describes the database in the context of the system architecture. H12 is the standalone reference that a database administrator, a backend engineer, or a data engineer needs to understand the full data model without reading any other document.

Before reading H12, engineers should be familiar with:
- **H03** — the Decision Object and its thirteen components (the business model the database implements)
- **H04 §Data Layer** — the architectural role of the database in the system
- **H06 FR-01, FR-09** — functional requirements for data storage, retrieval, and deletion
- **H09 §5** — the database overview (this document expands on it)

**Platform:** Supabase PostgreSQL 15+, hosted in EU West (Frankfurt, `eu-west-1`). Project ID: `avljmkkjonvfviyhebkv`. Project name: `DocAB13's Project`.

---

## 1. Database Architecture

### 1.1 Design Principles

**The Decision Object is the organizing unit.** Every table either is a Decision Object, belongs to a Decision Object, or supports the infrastructure that serves Decision Objects. No table exists for purposes unrelated to serving a user's Decision.

**Data is append-friendly, not update-heavy.** Updates to Decision Object components do not overwrite existing rows. They insert new rows and mark old rows as `is_current = false`. This produces an auditable history of every change, required by H03 §Decision Identity (Version History) and BR-05.

**Privacy by design.** Row Level Security is enabled on every user-data table. The default posture is deny-all — access is granted only by explicit policy. The `anon` key cannot access any user data that RLS has not explicitly permitted.

**Deletion is real.** When a user deletes a Decision Object, the deletion is physical — data is removed from all tables via `ON DELETE CASCADE` within 24 hours (FR-09.6). There is no application-level soft-delete. Archiving (the user's view of "hiding" a Decision) is implemented as a status value change, not a deletion flag.

### 1.2 Database Technology Choices

| Choice | Decision | Reason |
|---|---|---|
| PostgreSQL | Yes | Supabase default; JSONB support for component content; mature RLS implementation |
| JSONB for component content | Yes | Component schemas vary per component type; avoids a wide, sparse table with many nullable columns |
| UUIDs as primary keys | Yes | Required by Supabase Auth; no sequential ID leakage; safe for public-facing use in URLs |
| `timestamptz` for all timestamps | Yes | Timezone-aware; prevents ambiguity across geographic markets |
| Append-only for components | Yes | Required by BR-05 (no silent overwrite); enables Version History |
| Hard delete for Decision Objects | Yes | Required by FR-09.6, BR-08; GDPR compliance |

### 1.3 Schema Overview

```
auth.users                    ← Managed by Supabase Auth
    │
    ├── subscriptions         ← One row per user; Stripe plan state
    │
    └── decisions             ← One row per Decision Object
            │
            ├── decision_components      ← Versioned content rows (13 component types)
            ├── decision_state_transitions ← Append-only audit log of state changes
            └── decision_chat_messages   ← Append-only chat history
```

Post-MVP additions (not in this schema):
```
    knowledge_base            ← Anonymized, aggregated Decision Intelligence
    decision_lessons          ← Extracted patterns from completed Decisions
```

---

## 2. Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  auth.users (managed by Supabase)                                   │
│  ─────────────────────────────────                                  │
│  id              uuid PK                                            │
│  email           text                                               │
│  created_at      timestamptz                                        │
└───────────────┬─────────────────────────────────────────────────────┘
                │ 1
                │ references (on delete cascade)
          ┌─────┴──────────────────────────────────────────────┐
          │                                                     │
          │ N                                                   │ 1
┌─────────▼──────────────────┐            ┌────────────────────▼──────────────────┐
│  decisions                 │            │  subscriptions                        │
│  ─────────────────────     │            │  ──────────────────────────────────── │
│  id              uuid PK   │            │  id                uuid PK            │
│  owner_id        uuid FK?  │            │  user_id           uuid FK            │
│  anonymous_token text UQ?  │            │  stripe_customer_id text              │
│  category        text NN   │            │  stripe_subscription_id text          │
│  status          text NN   │            │  plan              text NN            │
│  title           text      │            │  status            text NN            │
│  created_at      timestamptz│           │  created_at        timestamptz NN     │
│  updated_at      timestamptz│           │  updated_at        timestamptz NN     │
│  expires_at      timestamptz│           └───────────────────────────────────────┘
└─────────┬──────────────────┘
          │ 1
          │ references (on delete cascade)
    ┌─────┼─────────────────┬──────────────────────────────┐
    │     │                 │                              │
    │ N   │ N               │ N                            │ N
┌───▼─────▼──────────┐ ┌───▼─────────────────────┐ ┌─────▼──────────────────────┐
│ decision_components │ │ decision_state_transitions│ │ decision_chat_messages     │
│ ─────────────────── │ │ ─────────────────────────│ │ ──────────────────────     │
│ id          uuid PK │ │ id          uuid PK      │ │ id          uuid PK        │
│ decision_id uuid FK │ │ decision_id uuid FK      │ │ decision_id uuid FK        │
│ component   text NN │ │ from_status text         │ │ role        text NN        │
│ version     int  NN │ │ to_status   text NN      │ │ content     text NN        │
│ content     jsonb NN│ │ trigger     text NN      │ │ created_at  timestamptz NN │
│ is_current  bool NN │ │ created_at  timestamptz  │ └────────────────────────────┘
│ created_at  timestamptz│ └─────────────────────────┘
│ prompt_version text │
└─────────────────────┘

Legend:
PK  = Primary Key
FK  = Foreign Key
NN  = NOT NULL
UQ  = UNIQUE
?   = Nullable
```

---

## 3. Table: `auth.users`

This table is managed by Supabase Auth and is not modified directly by the application. It is documented here because all user-data tables reference it via foreign key.

### 3.1 Description

One row per registered user. Created automatically by Supabase Auth when a user completes signup. The application reads from this table via `supabase.auth.getUser()` — it never queries it directly with SQL from API routes.

### 3.2 Relevant Fields

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` | Primary key. Referenced by `subscriptions.user_id`, `decisions.owner_id`. |
| `email` | `text` | User's email address. Used for authentication and for the login/signup UI. |
| `email_confirmed_at` | `timestamptz` | Null until the user confirms their email. The application does not gate feature access on this field in MVP (FR-08.3). |
| `created_at` | `timestamptz` | Account creation timestamp. |
| `last_sign_in_at` | `timestamptz` | Last authentication timestamp. Managed by Supabase. |

### 3.3 RLS

Row Level Security on `auth.users` is managed entirely by Supabase. Application code never queries this table directly with the `anon` or `service_role` key. Access is always through `supabase.auth.getUser()`.

---

## 4. Table: `subscriptions`

### 4.1 Purpose

Stores the subscription state for each authenticated user. Updated by the Stripe webhook when payments succeed or subscriptions are cancelled. Read by `hooks/useSubscription.js` and by API routes that check entitlements.

One row per user. A user without a row in this table is treated as a Free tier user.

### 4.2 Schema

```sql
create table public.subscriptions (
  id                      uuid        not null default gen_random_uuid(),
  user_id                 uuid        not null,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  plan                    text        not null default 'free',
  status                  text        not null default 'active',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  constraint subscriptions_pkey
    primary key (id),
  constraint subscriptions_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade,
  constraint subscriptions_plan_check
    check (plan in ('free', 'pro', 'premium')),
  constraint subscriptions_status_check
    check (status in ('active', 'cancelled')),
  constraint subscriptions_user_id_key
    unique (user_id)
);
```

### 4.3 Column Reference

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. Randomly generated on insert. |
| `user_id` | `uuid` | No | — | FK to `auth.users.id`. ON DELETE CASCADE — row deleted when user is deleted. Unique constraint enforces one row per user. |
| `stripe_customer_id` | `text` | Yes | `NULL` | Stripe Customer ID (format: `cus_...`). Populated on first successful Stripe Checkout. Null for Free tier users who have never initiated checkout. |
| `stripe_subscription_id` | `text` | Yes | `NULL` | Stripe Subscription ID (format: `sub_...`). Populated when a subscription is created. Null for Free tier users. |
| `plan` | `text` | No | `'free'` | Current subscription plan. Values: `'free'`, `'pro'`, `'premium'`. Constrained by CHECK. |
| `status` | `text` | No | `'active'` | Subscription status. Values: `'active'`, `'cancelled'`. `'cancelled'` does not delete the row — it downgrades the plan to `'free'`. |
| `created_at` | `timestamptz` | No | `now()` | Row creation timestamp. |
| `updated_at` | `timestamptz` | No | `now()` | Last update timestamp. Updated by the webhook handler on every write. |

### 4.4 Indexes

```sql
-- Primary key index (implicit from constraint)
-- Unique index on user_id (implicit from UNIQUE constraint)

-- Index for webhook lookups by Stripe Customer ID
create index idx_subscriptions_stripe_customer_id
  on public.subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;
```

### 4.5 Row Level Security

```sql
alter table public.subscriptions enable row level security;

-- Users can read their own subscription
create policy "subscriptions_select_own"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

-- Users cannot insert or update subscriptions directly.
-- All writes come from the Stripe webhook using the service_role key.
-- No INSERT or UPDATE policies for authenticated users.
```

The webhook handler uses the `service_role` key, which bypasses RLS. The `service_role` key is never available to the browser or to authenticated user routes.

### 4.6 Write Patterns

**On successful payment (`checkout.session.completed`):**
```sql
insert into public.subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan, status, updated_at)
values ($1, $2, $3, $4, 'active', now())
on conflict (user_id) do update set
  stripe_customer_id      = excluded.stripe_customer_id,
  stripe_subscription_id  = excluded.stripe_subscription_id,
  plan                    = excluded.plan,
  status                  = 'active',
  updated_at              = now();
```

**On subscription cancellation (`customer.subscription.deleted`):**
```sql
update public.subscriptions
set
  plan       = 'free',
  status     = 'cancelled',
  updated_at = now()
where stripe_customer_id = $1;
```

### 4.7 Lifecycle

A `subscriptions` row is created on the user's first successful payment. It is never deleted by the application — it downgrades to `plan = 'free'` when a subscription is cancelled. When the user account is deleted, the row is cascade-deleted via `user_id` FK.

---

## 5. Table: `decisions`

### 5.1 Purpose

The central table of the DecisionOS data model. One row per Decision Object. Stores the identity, status, and metadata of a Decision. Component content (the thirteen H03 components) is stored in `decision_components`, not here.

### 5.2 Schema

```sql
create table public.decisions (
  id              uuid        not null default gen_random_uuid(),
  owner_id        uuid,
  anonymous_token text,
  category        text        not null,
  status          text        not null default 'draft',
  title           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  expires_at      timestamptz,

  constraint decisions_pkey
    primary key (id),
  constraint decisions_owner_id_fkey
    foreign key (owner_id) references auth.users(id) on delete cascade,
  constraint decisions_anonymous_token_key
    unique (anonymous_token),
  constraint decisions_status_check
    check (status in (
      'draft',
      'in_analysis',
      'waiting_for_user',
      'decision_made',
      'executing',
      'completed',
      'archived'
    )),
  constraint decisions_category_check
    check (category in (
      'financial',
      'technology',
      'health',
      'travel',
      'career',
      'insurance',
      'home',
      'education',
      'lifestyle'
    )),
  constraint decisions_owner_or_anonymous
    check (
      (owner_id is not null and anonymous_token is null and expires_at is null) or
      (owner_id is null and anonymous_token is not null and expires_at is not null)
    )
);
```

### 5.3 Column Reference

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. Permanent unique identifier for the Decision Object (H03 §Decision Identity — Decision ID). Never changes after creation. Used in URL routing: `/decision/[id]`. |
| `owner_id` | `uuid` | Yes | `NULL` | FK to `auth.users.id`. NULL for anonymous Decision Objects. Set when an anonymous user signs in and claims the Decision (FR-01.6). ON DELETE CASCADE — Decision deleted when user is deleted. |
| `anonymous_token` | `text` | Yes | `NULL` | UUID stored in the browser's `localStorage` for anonymous sessions. Used to identify an unclaimed Decision Object before an owner claims it. Unique. NULL for owned Decision Objects. Mutually exclusive with a non-null `owner_id`. |
| `category` | `text` | No | — | The decision domain. Constrained to the nine MVP categories. Determines which questionnaire framework, AI prompts, and risk patterns apply (H03 §Decision Identity — Category). |
| `status` | `text` | No | `'draft'` | The current Decision State (H03 §Decision States). Constrained to the seven valid values. All transitions are enforced in application code by the State Machine. |
| `title` | `text` | Yes | `NULL` | User-defined or auto-generated short title for display in the Dashboard. NULL until set by the user or derived from the first Alternative name. |
| `created_at` | `timestamptz` | No | `now()` | Decision creation timestamp (H03 §Decision Identity — Created At). Never updated. |
| `updated_at` | `timestamptz` | No | `now()` | Timestamp of the most recent change to the Decision row or any of its components. Updated by a trigger (see §5.7). (H03 §Decision Identity — Updated At). |
| `expires_at` | `timestamptz` | Yes | `NULL` | For anonymous Decision Objects only: set to `created_at + interval '48 hours'` on creation. NULL for owned Decision Objects. The scheduled cleanup function uses this column. (FR-01.5, BR-04). |

### 5.4 Indexes

```sql
-- Primary key index (implicit)
-- Unique index on anonymous_token (implicit from UNIQUE constraint)

-- Dashboard query: all Decisions for a user, by status
create index idx_decisions_owner_status
  on public.decisions (owner_id, status)
  where owner_id is not null;

-- Dashboard query: all active Decisions for a user
create index idx_decisions_owner_created
  on public.decisions (owner_id, created_at desc)
  where owner_id is not null;

-- Cleanup: all expired anonymous Decisions
create index idx_decisions_expires_at
  on public.decisions (expires_at)
  where expires_at is not null and owner_id is null;

-- Anonymous token lookup (for claiming on signup)
-- Covered by the UNIQUE constraint index
```

### 5.5 Row Level Security

```sql
alter table public.decisions enable row level security;

-- Authenticated users can read their own Decisions
create policy "decisions_select_own"
  on public.decisions
  for select
  using (auth.uid() = owner_id);

-- Authenticated users can insert Decisions they own
create policy "decisions_insert_own"
  on public.decisions
  for insert
  with check (auth.uid() = owner_id);

-- Anonymous users can insert anonymous Decisions (owner_id is null)
create policy "decisions_insert_anonymous"
  on public.decisions
  for insert
  with check (owner_id is null and anonymous_token is not null);

-- Authenticated users can update their own Decisions
create policy "decisions_update_own"
  on public.decisions
  for update
  using (auth.uid() = owner_id);

-- Authenticated users can delete their own Decisions
create policy "decisions_delete_own"
  on public.decisions
  for delete
  using (auth.uid() = owner_id);

-- Anonymous Decisions are not directly readable by the browser client.
-- The application reads them via the API route using the service_role key,
-- after validating the anonymous_token from the request.
```

### 5.6 The Owner-Anonymous Invariant

A Decision Object is always in one of two states, enforced by the CHECK constraint `decisions_owner_or_anonymous`:

**Owned:** `owner_id IS NOT NULL`, `anonymous_token IS NULL`, `expires_at IS NULL`

**Anonymous:** `owner_id IS NULL`, `anonymous_token IS NOT NULL`, `expires_at IS NOT NULL`

There is no intermediate state. Claiming an anonymous Decision (when a user signs up) is a single UPDATE that sets `owner_id`, clears `anonymous_token`, and sets `expires_at` to NULL atomically.

### 5.7 `updated_at` Trigger

`updated_at` is kept current by a trigger that fires on any UPDATE to the `decisions` row. It is also updated by the API route whenever a component belonging to the Decision is saved, ensuring the Dashboard's "last updated" display is accurate.

```sql
create or replace function update_decisions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger decisions_updated_at_trigger
  before update on public.decisions
  for each row
  execute function update_decisions_updated_at();
```

### 5.8 MVP Limit

Per FR-09.7, the system supports a maximum of 100 Decision Objects per user account in MVP. This limit is enforced at the API route level (not a database constraint), to allow the limit to be raised per user tier without a schema change:

```typescript
// In pages/api/decision/save.ts — on Decision creation
const { count } = await supabase
  .from('decisions')
  .select('id', { count: 'exact', head: true })
  .eq('owner_id', user.id)
  .neq('status', 'archived')

if (count !== null && count >= 100) {
  return void res.status(409).json({
    error: 'You have reached the maximum of 100 active decisions. Archive or delete some to create new ones.',
  })
}
```

### 5.9 Lifecycle

```
INSERT → owner_id or anonymous_token set at creation
       → status = 'draft', expires_at set for anonymous
       │
       ▼ (state transitions driven by application logic)
       │
       ├── Owned Decision: persists indefinitely
       │   status progresses through: draft → in_analysis → waiting_for_user
       │   → decision_made → executing → completed → archived
       │
       ├── Anonymous Decision: exists for 48 hours
       │   Claimed: UPDATE owner_id, clear anonymous_token, clear expires_at
       │   Not claimed: deleted by scheduled function when expires_at < now()
       │
       └── Deletion: DELETE cascades to decision_components,
           decision_state_transitions, decision_chat_messages
           Completed within 24 hours of user-initiated delete (FR-09.6)
```

---

## 6. Table: `decision_components`

### 6.1 Purpose

Stores the content of each of the thirteen Decision Object components defined in H03. This table is append-only for updates — existing rows are never overwritten. When a component is updated, the previous row is marked `is_current = false` and a new row is inserted with the updated content and an incremented version number. This implements the Version History requirement in H03 §Decision Identity and BR-05.

### 6.2 Schema

```sql
create table public.decision_components (
  id              uuid        not null default gen_random_uuid(),
  decision_id     uuid        not null,
  component       text        not null,
  version         integer     not null default 1,
  content         jsonb       not null,
  is_current      boolean     not null default true,
  created_at      timestamptz not null default now(),
  prompt_version  text,

  constraint decision_components_pkey
    primary key (id),
  constraint decision_components_decision_id_fkey
    foreign key (decision_id) references public.decisions(id) on delete cascade,
  constraint decision_components_component_check
    check (component in (
      '0_identity',
      '1_context',
      '2_goal',
      '3_constraints',
      '4_alternatives',
      '5_ai_analysis',
      '6_risks',
      '7_recommendation',
      '8_final_decision',
      '9_action_plan',
      '10_outcome',
      '11_reflection',
      '12_lessons_learned'
    )),
  constraint decision_components_version_positive
    check (version > 0)
);
```

### 6.3 Column Reference

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `decision_id` | `uuid` | No | — | FK to `decisions.id`. ON DELETE CASCADE. |
| `component` | `text` | No | — | Component identifier. Constrained to the thirteen valid component names (prefixed with their H03 index). |
| `version` | `integer` | No | `1` | Version number, starting at 1. Incremented on each update. The combination of `(decision_id, component, version)` is unique in practice (enforced by application logic, not a DB constraint, to avoid locking). |
| `content` | `jsonb` | No | — | The component payload. Schema varies per component type. See §6.5 for all component schemas. |
| `is_current` | `boolean` | No | `true` | True for the current version of the component. False for all previous versions. Only one row per `(decision_id, component)` should have `is_current = true`. This is enforced by the application's upsert pattern (see §6.4). |
| `created_at` | `timestamptz` | No | `now()` | Timestamp when this version of the component was created. |
| `prompt_version` | `text` | Yes | `NULL` | The version identifier of the AI prompt that produced this component. Non-null for AI-generated components (components 5, 6, 7, 9). Null for user-authored components. Format: e.g., `'analysis-v1.0'`, `'recommendation-v1.1'`. |

### 6.4 Indexes

```sql
-- Primary access pattern: get current version of a component for a Decision
create index idx_decision_components_current
  on public.decision_components (decision_id, component)
  where is_current = true;

-- Version history access: all versions of a component for a Decision
create index idx_decision_components_history
  on public.decision_components (decision_id, component, version desc);

-- Prompt version analysis (for quality monitoring)
create index idx_decision_components_prompt_version
  on public.decision_components (prompt_version)
  where prompt_version is not null;
```

### 6.5 Row Level Security

```sql
alter table public.decision_components enable row level security;

-- Users can read components belonging to their own Decisions
create policy "decision_components_select_own"
  on public.decision_components
  for select
  using (
    exists (
      select 1 from public.decisions d
      where d.id = decision_components.decision_id
        and d.owner_id = auth.uid()
    )
  );

-- Users can insert components for their own Decisions
create policy "decision_components_insert_own"
  on public.decision_components
  for insert
  with check (
    exists (
      select 1 from public.decisions d
      where d.id = decision_components.decision_id
        and d.owner_id = auth.uid()
    )
  );

-- Users can update is_current on their own Decision components
-- (to mark old versions as not current during the upsert pattern)
create policy "decision_components_update_own"
  on public.decision_components
  for update
  using (
    exists (
      select 1 from public.decisions d
      where d.id = decision_components.decision_id
        and d.owner_id = auth.uid()
    )
  );

-- No DELETE policy for users — components are never deleted directly.
-- Deletion only via ON DELETE CASCADE when the parent Decision is deleted.
```

### 6.6 Write Pattern (Upsert)

The append-only upsert pattern preserves version history while keeping the current version identifiable:

```sql
-- Step 1: Mark the existing current version as not current
update public.decision_components
set is_current = false
where decision_id = $decision_id
  and component   = $component
  and is_current  = true;

-- Step 2: Get the next version number
-- (Application resolves this: previous version number + 1)

-- Step 3: Insert the new current version
insert into public.decision_components
  (decision_id, component, version, content, is_current, prompt_version)
values
  ($decision_id, $component, $next_version, $content, true, $prompt_version);

-- Step 4: Update the parent Decision's updated_at
update public.decisions
set updated_at = now()
where id = $decision_id;
```

These four statements run in a single database transaction. If any step fails, the entire transaction is rolled back.

### 6.7 Component Content Schemas

The following defines the JSONB schema for each of the thirteen component types. All schemas are validated by the API route before insertion.

---

**Component 0 — `0_identity`**

Populated at Decision creation. Contains denormalized identity fields for quick access without joining to the `decisions` table. Rarely queried directly — used by the History view's summary display.

```json
{
  "decision_id": "uuid",
  "category": "string",
  "status": "string",
  "created_at": "ISO 8601 timestamp",
  "geographic_market": "string | null",
  "currency": "string | null"
}
```

---

**Component 1 — `1_context`**

User-authored. Populated during the Decision Wizard Context step.

```json
{
  "background": "string",
  "current_situation": "string",
  "prior_attempts": "string | null",
  "timing_constraints": "string | null",
  "geographic_market": "string",
  "currency": "string"
}
```

Required: `background`, `current_situation`, `geographic_market`, `currency`.
Optional: `prior_attempts`, `timing_constraints`.

---

**Component 2 — `2_goal`**

User-authored. Populated during the Decision Wizard Goal step.

```json
{
  "primary": "string",
  "success_criteria": "string | null",
  "time_horizon": "string | null",
  "secondary_goals": ["string"]
}
```

Required: `primary`.
Optional: `success_criteria`, `time_horizon`, `secondary_goals` (empty array if none).

---

**Component 3 — `3_constraints`**

User-authored. Populated during the Decision Wizard Constraints step.

```json
{
  "hard": [
    {
      "type": "budget | time | geographic | personal | legal | other",
      "description": "string",
      "value": "string | null",
      "unit": "string | null"
    }
  ],
  "soft": [
    {
      "type": "budget | time | geographic | personal | legal | other",
      "description": "string",
      "value": "string | null",
      "unit": "string | null"
    }
  ]
}
```

Required: `hard` array and `soft` array (may be empty arrays).
Each item: `type` and `description` required; `value` and `unit` optional.

---

**Component 4 — `4_alternatives`**

User-authored with AI enrichment (AI suggestions are converted to user alternatives if accepted). Populated during the Decision Wizard Alternatives step.

```json
{
  "alternatives": [
    {
      "id": "uuid",
      "name": "string",
      "source": "user_provided | ai_suggested | do_nothing",
      "user_notes": "string | null",
      "attributes": {}
    }
  ],
  "do_nothing_included": true
}
```

Required: `alternatives` array (minimum 2 items per BR-01).
Each item: `id`, `name`, `source` required; `user_notes`, `attributes` optional.
`do_nothing_included`: boolean, true if the user added a do-nothing alternative (from FR-02.9).

---

**Component 5 — `5_ai_analysis`**

AI-generated. Populated by the Analysis Engine. `prompt_version` is always non-null for this component.

```json
{
  "per_alternative": [
    {
      "alternative_id": "uuid",
      "alternative_name": "string",
      "pros": [
        {
          "title": "string",
          "detail": "string",
          "specific_to_user": true
        }
      ],
      "cons": [
        {
          "title": "string",
          "detail": "string",
          "specific_to_user": true
        }
      ],
      "goal_fit_assessment": "string",
      "constraint_compliance": {
        "hard_constraints_satisfied": true,
        "hard_constraint_violations": [],
        "soft_constraints_satisfied": ["string"],
        "soft_constraints_compromised": ["string"]
      }
    }
  ],
  "cross_alternative": {
    "key_differentiators": ["string"],
    "commonly_overlooked_risks": ["string"],
    "information_gaps": [
      {
        "missing_information": "string",
        "impact_on_analysis": "string",
        "component_to_update": "context | goal | constraints | alternatives"
      }
    ]
  },
  "market_data_caveat": "string | null",
  "professional_advice_disclaimer": "string | null",
  "analysis_confidence": "high | medium | low",
  "confidence_rationale": "string",
  "analysis_version": "string"
}
```

---

**Component 6 — `6_risks`**

AI-generated. Populated by the Analysis Engine concurrently with component 5. Stored separately to allow independent querying.

```json
{
  "per_alternative": [
    {
      "alternative_id": "uuid",
      "alternative_name": "string",
      "risks": [
        {
          "title": "string",
          "detail": "string",
          "severity": "low | medium | high",
          "likelihood": "low | medium | high",
          "mitigation": "string | null"
        }
      ]
    }
  ]
}
```

Minimum one risk per alternative (FR-03.4).

---

**Component 7 — `7_recommendation`**

AI-generated. Populated by the Recommendation Engine. `prompt_version` is always non-null.

```json
{
  "recommended_alternative_id": "uuid | null",
  "recommended_alternative_name": "string | null",
  "primary_reasoning": "string",
  "supporting_factors": ["string"],
  "honest_tradeoffs": "string",
  "runner_up_id": "uuid | null",
  "runner_up_name": "string | null",
  "margin_description": "string | null",
  "conditions_for_change": "string",
  "tie_detected": false,
  "tie_explanation": "string | null",
  "confidence_level": "high | medium | low",
  "confidence_rationale": "string",
  "information_request": "string | null"
}
```

When `tie_detected = true`: `recommended_alternative_id` and `recommended_alternative_name` are null; `tie_explanation` is non-null.

---

**Component 8 — `8_final_decision`**

User-authored. Populated when the user explicitly records their Final Decision.

```json
{
  "chosen_alternative_id": "uuid",
  "chosen_alternative_name": "string",
  "matches_recommendation": true,
  "divergence_reason": "string | null",
  "confidence": "confident | uncertain | reluctant",
  "recorded_at": "ISO 8601 timestamp"
}
```

Required: `chosen_alternative_id`, `chosen_alternative_name`, `matches_recommendation`, `confidence`, `recorded_at`.
`divergence_reason`: non-null when `matches_recommendation = false` and the user provided a reason.

---

**Component 9 — `9_action_plan`**

AI-generated. Populated by the Action Plan Engine immediately after the Final Decision is recorded. Based on the chosen alternative, not the recommended one (BR-03).

```json
{
  "based_on_alternative_id": "uuid",
  "based_on_alternative_name": "string",
  "action_items": [
    {
      "sequence": 1,
      "title": "string",
      "detail": "string",
      "estimated_effort": "low | medium | high",
      "time_estimate": "string | null",
      "completed": false,
      "completed_at": "ISO 8601 timestamp | null"
    }
  ]
}
```

`action_items`: 3–5 items per FR-05.5. `completed` and `completed_at` are updated by the user in the Dashboard — they trigger a new version of this component via the append-only pattern.

---

**Component 10 — `10_outcome`**

User-authored. Populated when the user records the Outcome of their decision (after the Decision has been in `executing` state).

```json
{
  "description": "string",
  "goal_achievement": "yes | partially | no",
  "satisfaction_rating": 4,
  "unexpected_developments": "string | null",
  "recorded_at": "ISO 8601 timestamp"
}
```

`satisfaction_rating`: integer 1–5.
Required: `description`, `goal_achievement`, `satisfaction_rating`, `recorded_at`.

---

**Component 11 — `11_reflection`**

User-authored. Optional. Populated after the Outcome is recorded.

```json
{
  "process_quality": "excellent | good | fair | poor | null",
  "information_gaps_identified": "string | null",
  "priority_recalibration": "string | null",
  "ai_analysis_helpful": true,
  "ai_analysis_feedback": "string | null",
  "would_do_differently": "string | null",
  "recorded_at": "ISO 8601 timestamp"
}
```

All fields are optional except `recorded_at`.

---

**Component 12 — `12_lessons_learned`**

User-authored. Optional. A free-text note from the user to their future self.

```json
{
  "lessons": "string",
  "category_tags": ["string"],
  "reusable_heuristics": ["string"],
  "consent_to_anonymized_use": false,
  "recorded_at": "ISO 8601 timestamp"
}
```

`consent_to_anonymized_use`: boolean, default false. When true and the Learning Pipeline is implemented, this component may be anonymized and contributed to the Knowledge Base (H04 §Data Layer).

---

## 7. Table: `decision_state_transitions`

### 7.1 Purpose

An append-only audit log of every Decision State change. Required by FR-06.2 and H03 §Decision Identity (Version History). This table is never updated — only inserted into. It provides the complete history of how a Decision progressed through its lifecycle.

### 7.2 Schema

```sql
create table public.decision_state_transitions (
  id            uuid        not null default gen_random_uuid(),
  decision_id   uuid        not null,
  from_status   text,
  to_status     text        not null,
  trigger       text        not null,
  created_at    timestamptz not null default now(),

  constraint decision_state_transitions_pkey
    primary key (id),
  constraint decision_state_transitions_decision_id_fkey
    foreign key (decision_id) references public.decisions(id) on delete cascade,
  constraint decision_state_transitions_to_status_check
    check (to_status in (
      'draft', 'in_analysis', 'waiting_for_user',
      'decision_made', 'executing', 'completed', 'archived'
    )),
  constraint decision_state_transitions_trigger_check
    check (trigger in ('user_action', 'system_event', 'ai_completion'))
);
```

### 7.3 Column Reference

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary key. |
| `decision_id` | `uuid` | No | FK to `decisions.id`. ON DELETE CASCADE. |
| `from_status` | `text` | Yes | The previous Decision State. NULL for the initial `draft` transition (there is no previous state). |
| `to_status` | `text` | No | The new Decision State. Constrained to valid values. |
| `trigger` | `text` | No | What caused the transition. `'user_action'`: explicit user interaction. `'system_event'`: middleware or scheduled function. `'ai_completion'`: AI analysis completing successfully. |
| `created_at` | `timestamptz` | No | Timestamp of the transition. |

### 7.4 Indexes

```sql
alter table public.decision_state_transitions enable row level security;

-- Primary access pattern: full state history for a Decision
create index idx_decision_state_transitions_decision
  on public.decision_state_transitions (decision_id, created_at asc);
```

### 7.5 Row Level Security

```sql
create policy "decision_state_transitions_select_own"
  on public.decision_state_transitions
  for select
  using (
    exists (
      select 1 from public.decisions d
      where d.id = decision_state_transitions.decision_id
        and d.owner_id = auth.uid()
    )
  );

-- No INSERT policy for authenticated users.
-- All state transitions are written by API routes using the service_role key.
```

### 7.6 Example State History

For a Decision that progressed from creation to completion:

```sql
select from_status, to_status, trigger, created_at
from decision_state_transitions
where decision_id = 'some-uuid'
order by created_at asc;

-- from_status     | to_status        | trigger          | created_at
-- NULL            | draft            | system_event     | 2026-06-15 09:00:00
-- draft           | in_analysis      | user_action      | 2026-06-15 09:05:12
-- in_analysis     | waiting_for_user | ai_completion    | 2026-06-15 09:05:38
-- waiting_for_user| decision_made    | user_action      | 2026-06-17 14:22:09
-- decision_made   | executing        | user_action      | 2026-06-17 14:23:01
-- executing       | completed        | user_action      | 2026-07-20 18:45:33
```

---

## 8. Table: `decision_chat_messages`

### 8.1 Purpose

Stores all AI Chat messages for each Decision Object, in the order they were sent. Required by FR-07.3 (chat history persists across sessions) and BR-11 (chat is anchored to a Decision Object). This table is append-only — messages are never edited or deleted except via ON DELETE CASCADE when the Decision is deleted.

### 8.2 Schema

```sql
create table public.decision_chat_messages (
  id            uuid        not null default gen_random_uuid(),
  decision_id   uuid        not null,
  role          text        not null,
  content       text        not null,
  created_at    timestamptz not null default now(),

  constraint decision_chat_messages_pkey
    primary key (id),
  constraint decision_chat_messages_decision_id_fkey
    foreign key (decision_id) references public.decisions(id) on delete cascade,
  constraint decision_chat_messages_role_check
    check (role in ('user', 'assistant'))
);
```

### 8.3 Column Reference

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `uuid` | No | Primary key. |
| `decision_id` | `uuid` | No | FK to `decisions.id`. ON DELETE CASCADE. All messages deleted when Decision is deleted. |
| `role` | `text` | No | Message author. `'user'`: the human's message. `'assistant'`: the AI's response. |
| `content` | `text` | No | Full message text. User messages are stored as-entered (after sanitization). AI messages are stored as the visible response text only (not the structured JSON wrapper from H11 §7.4). |
| `created_at` | `timestamptz` | No | Message timestamp. Used to order messages chronologically. |

### 8.4 Indexes

```sql
-- Primary access pattern: all messages for a Decision, in order
create index idx_decision_chat_messages_decision_order
  on public.decision_chat_messages (decision_id, created_at asc);
```

### 8.5 Row Level Security

```sql
alter table public.decision_chat_messages enable row level security;

create policy "decision_chat_messages_select_own"
  on public.decision_chat_messages
  for select
  using (
    exists (
      select 1 from public.decisions d
      where d.id = decision_chat_messages.decision_id
        and d.owner_id = auth.uid()
    )
  );

create policy "decision_chat_messages_insert_own"
  on public.decision_chat_messages
  for insert
  with check (
    exists (
      select 1 from public.decisions d
      where d.id = decision_chat_messages.decision_id
        and d.owner_id = auth.uid()
    )
  );
```

### 8.6 Failed Message Rule

Per FR-07.7, if an AI Chat response fails, the failed response is not stored. The user's message is also not stored if the AI response fails — a partial exchange (user message without AI response) would corrupt the conversation history by making the AI's next response respond to a message it has no record of.

The API route stores the user message and the AI response in a single transaction. If the AI call fails, neither row is committed.

```typescript
// In pages/api/decision/chat.ts
// Both inserts happen in the same transaction
const { error } = await supabase.rpc('insert_chat_exchange', {
  p_decision_id: decisionId,
  p_user_content: userMessage,
  p_assistant_content: aiResponse,
})
// If error, neither message is stored
```

---

## 9. Migrations

### 9.1 Migration Philosophy

Database schema changes are managed as versioned SQL migration files. Each migration is a forward-only change — there are no rollback scripts, because rollback of a database schema change that has been applied to production data is almost always destructive and unreliable.

If a migration must be reversed, a new "forward" migration is written that undoes the previous change. This new migration is applied and becomes part of the permanent history.

### 9.2 Migration File Format

Migration files are stored in `supabase/migrations/`. Supabase CLI manages the migration state.

**File naming:** `YYYYMMDDHHMMSS_descriptive_name.sql`

**Examples:**
```
supabase/migrations/
  20260601000000_create_subscriptions.sql
  20260610000000_create_decisions.sql
  20260610000001_create_decision_components.sql
  20260610000002_create_decision_state_transitions.sql
  20260610000003_create_decision_chat_messages.sql
  20260610000004_add_decisions_indexes.sql
  20260615000000_add_decisions_expires_at_index.sql
```

**File contents:** Each file contains one logical schema change with a comment explaining why the change is being made:

```sql
-- Migration: 20260610000001_create_decision_components.sql
-- Purpose: Create the decision_components table for storing versioned
-- Decision Object component content as per H03 and H09.
-- This implements the append-only version history required by BR-05.

create table public.decision_components (
  ...
);

alter table public.decision_components enable row level security;

create policy ...

create index ...
```

### 9.3 Migration Process

**Local development:**
```bash
# Apply all pending migrations to local Supabase
supabase db push

# Generate a new migration from local schema changes
supabase db diff --use-migra -f descriptive_name
```

**Production deployment:**
Migrations are applied to the production Supabase project before or during the Vercel deployment. The sequence is:

1. Apply migration to production Supabase: `supabase db push --db-url [production-url]`
2. Verify migration succeeded (no error in Supabase Dashboard → Database → Migrations)
3. Deploy to Vercel (`git push` to `main`)

A Vercel deployment that requires a migration is never pushed to `main` before the migration is applied. The application code must be compatible with the post-migration schema.

### 9.4 Additive-Only Rule

In MVP, all migrations are additive — they add tables, columns, or indexes, but do not remove or rename existing ones. Removing a column or table in production requires a two-migration sequence:

1. **Migration 1:** Mark the column as deprecated in a comment; remove all application references to the column.
2. **Migration 2:** After confirming no application code references the column (verified over one release cycle), drop the column.

---

## 10. Data Lifecycle and Retention

### 10.1 Anonymous Decision Object Lifecycle

Anonymous Decision Objects are created when an unauthenticated user starts a Decision. They expire after 48 hours if not claimed (FR-01.5, BR-04).

**Creation:** Decision created with `owner_id = NULL`, `anonymous_token = [uuid]`, `expires_at = created_at + interval '48 hours'`.

**Claim:** When the user signs in or creates an account, the API route updates:
```sql
update public.decisions
set
  owner_id        = $user_id,
  anonymous_token = null,
  expires_at      = null
where anonymous_token = $token
  and expires_at > now();
```

**Expiry and cleanup:** A Supabase scheduled function (or pg_cron job) runs every 6 hours and deletes expired anonymous Decisions:

```sql
-- Runs every 6 hours via pg_cron
delete from public.decisions
where owner_id is null
  and expires_at < now();
```

The cascade deletes all associated rows in `decision_components`, `decision_state_transitions`, and `decision_chat_messages`.

### 10.2 Owned Decision Object Lifecycle

Owned Decision Objects persist indefinitely until explicitly deleted or the user account is deleted.

**Status progression:** `draft` → `in_analysis` → `waiting_for_user` → `decision_made` → `executing` → `completed` → `archived`

**Archiving:** Setting `status = 'archived'` removes the Decision from the user's default Dashboard view. All data is preserved. The Decision can be un-archived by the user.

**Deletion:** When the user deletes a Decision from the Dashboard:
1. A confirmation dialog is shown (BR-08)
2. On confirmation, `DELETE FROM decisions WHERE id = $id AND owner_id = $user_id`
3. ON DELETE CASCADE removes all associated rows immediately
4. The operation is irreversible (FR-09.6, BR-08)

The deletion is committed within one database transaction. There is no soft-delete, no recycling bin, and no recovery window. The requirement that "Deleted Decision Objects are removed from all views and all data stores within 24 hours" (FR-09.6) is satisfied because the DELETE is immediate.

### 10.3 User Account Deletion

When a user deletes their account:
1. All `decisions` rows with `owner_id = user.id` are cascade-deleted (takes all components, transitions, and chat messages with them)
2. The `subscriptions` row with `user_id = user.id` is cascade-deleted
3. Supabase Auth deletes the `auth.users` row

All three deletions happen via FK cascade from the `auth.users` deletion. The application triggers the `auth.users` deletion via `supabase.auth.admin.deleteUser(userId)` from a server-side route using the `service_role` key.

Post-deletion, no personally identifiable information remains in the database. This satisfies GDPR Article 17 (Right to Erasure).

### 10.4 Subscription Data Retention

`subscriptions` rows are cascade-deleted with the user account. For compliance and financial record-keeping, Stripe retains its own record of payments and subscriptions independently of the DecisionOS database. Stripe data is not subject to the GDPR erasure request for the DecisionOS database.

### 10.5 Audit Log Retention

`decision_state_transitions` rows are cascade-deleted with the Decision Object. There is no separate audit log retention policy in MVP. Post-MVP, a separate audit log table with independent retention (e.g., 7-year retention for financial category decisions) may be introduced for compliance purposes.

---

## 11. Backup and Recovery

### 11.1 Backup Strategy

**Supabase managed backups:** Supabase Pro plan provides daily backups with 7-day point-in-time recovery (PITR). Backups are stored in AWS S3 in the same region (EU West / Frankfurt).

**Backup schedule:** Automatic daily backup at approximately 02:00 UTC. Retention: 7 days.

**Point-in-time recovery:** Available for any point within the 7-day retention window. Minimum recovery granularity: approximately 5 minutes (WAL-based PITR).

### 11.2 Recovery Objectives

| Metric | Target | Mechanism |
|---|---|---|
| Recovery Point Objective (RPO) | ≤ 1 hour | PITR within 7-day window |
| Recovery Time Objective (RTO) | ≤ 4 hours | Supabase restore to new project + DNS update |
| Data loss in worst case | ≤ 24 hours | Daily backup if PITR unavailable |

### 11.3 Recovery Process

Recovery is initiated through the Supabase Dashboard:
1. Navigate to the project → Database → Backups
2. Select the restore point (specific time or daily backup)
3. Restore to the existing project (destructive) or to a new project
4. If restoring to a new project: update `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel environment variables
5. Verify application connectivity with a test login and Decision Object read

### 11.4 What Is Not Backed Up by Supabase

Supabase backups cover the PostgreSQL database. They do not cover:
- Vercel environment variables (documented in H09 §13 and the `.env.local` file kept offline)
- Stripe data (maintained by Stripe independently)
- Anthropic prompt versions (stored in `core/ai/prompts.ts` in the GitHub repository)

---

## 12. Performance and Capacity

### 12.1 Query Performance Targets

| Query type | Target response time | Index used |
|---|---|---|
| Fetch current component for a Decision | ≤ 10ms | `idx_decision_components_current` |
| Fetch all Decisions for a user (Dashboard) | ≤ 50ms | `idx_decisions_owner_status` |
| Fetch chat history for a Decision | ≤ 20ms | `idx_decision_chat_messages_decision_order` |
| State transition insert | ≤ 10ms | (write, no index needed) |
| Webhook subscription upsert | ≤ 20ms | `subscriptions_user_id_key` (unique) |

All target response times are measured from the API route perspective (database round-trip only, excluding network latency from Vercel to Supabase). Since both are deployed in EU West, round-trip latency is approximately 5–15ms.

### 12.2 Capacity Estimates (MVP)

The following estimates are based on conservative user growth projections from H07 §6.1:

| Entity | 6-month estimate | 24-month estimate |
|---|---|---|
| `auth.users` rows | 2,000 | 15,000 |
| `decisions` rows | 10,000 | 75,000 |
| `decision_components` rows | 120,000 (12 per Decision avg) | 900,000 |
| `decision_chat_messages` rows | 50,000 | 375,000 |
| `decision_state_transitions` rows | 60,000 (6 per Decision avg) | 450,000 |
| `subscriptions` rows | 2,000 | 15,000 |

At 24-month estimates, the total database size is approximately 5–10 GB including indexes and JSONB component content. This is well within Supabase Pro plan capacity and does not require any architectural changes.

### 12.3 JSONB Performance Considerations

JSONB columns are used for `decision_components.content`. JSONB is stored in a decomposed binary format in PostgreSQL, making field extraction efficient. Queries that filter or sort on JSONB fields use GIN indexes for performance.

In MVP, no filtering on JSONB content is required — all queries filter by `decision_id` and `component` only. GIN indexes on JSONB content are not required in MVP.

Post-MVP, if the Learning Pipeline needs to query component content directly (e.g., "all completed Decisions in the Financial category with high satisfaction ratings"), GIN indexes will be added at that time.

---

## 13. Security and Compliance

### 13.1 Row Level Security Summary

| Table | `anon` key access | `service_role` access |
|---|---|---|
| `subscriptions` | SELECT own row only | Full access (webhook) |
| `decisions` | SELECT, INSERT, UPDATE, DELETE own rows | Full access (claiming, cleanup) |
| `decision_components` | SELECT, INSERT, UPDATE own rows | Full access |
| `decision_state_transitions` | SELECT own rows | Full access (all writes) |
| `decision_chat_messages` | SELECT, INSERT own rows | Full access |

No table grants `anon` key access to other users' rows under any condition.

### 13.2 Data Classification

| Data | Classification | Storage |
|---|---|---|
| User email | Personal Data (GDPR Art. 4) | `auth.users` — managed by Supabase |
| Decision content (context, goal, etc.) | Personal Data | `decision_components.content` |
| Chat messages | Personal Data | `decision_chat_messages.content` |
| Subscription plan | User account data | `subscriptions.plan` |
| Stripe IDs | Reference data (no PII) | `subscriptions.stripe_*` |
| AI prompt versions | System metadata | `decision_components.prompt_version` |
| State transition logs | System audit data | `decision_state_transitions` |

### 13.3 GDPR Compliance

**Right to Access (Art. 15):** The API route `GET /api/decision/history` returns all of the user's Decision Objects. The `GET /api/decision/[id]` route returns a complete Decision Object including all components. Together, these satisfy the right of access.

**Right to Erasure (Art. 17):** User account deletion via `supabase.auth.admin.deleteUser()` cascade-deletes all user data. Implemented in the account settings API route.

**Data Minimization (Art. 5):** Only data necessary for the Decision Object is collected. No behavioral profiles, no advertising data, no third-party data sharing. See H02 Principle 8.

**Storage Limitation (Art. 5):** Anonymous Decision Objects are deleted after 48 hours. User account deletion removes all associated data. No indefinite retention of personal data.

**Data Location:** All data stored in EU West (Frankfurt). Compliant with GDPR data residency requirements for EU users.

### 13.4 Encryption

All data at rest is encrypted by Supabase using AES-256. All data in transit is encrypted via TLS 1.3 (enforced by Supabase and Vercel). The application does not implement additional encryption layers at the application level — database-level encryption by the platform is sufficient for the MVP data classification levels.

Passwords are hashed by Supabase Auth using bcrypt. The application never sees or stores plaintext passwords.

---

## 14. Post-MVP Database Extensions

These tables are not part of the MVP schema but are defined here for awareness. The MVP schema is designed to be compatible with these extensions without structural changes.

### 14.1 `knowledge_base`

```sql
-- Post-MVP: stores anonymized, aggregated Decision Intelligence
-- populated by the Learning Pipeline from completed, consented Decisions
create table public.knowledge_base (
  id                  uuid primary key default gen_random_uuid(),
  category            text not null,
  constraint_profile  jsonb,
  pattern_type        text not null,  -- 'risk' | 'alternative' | 'constraint' | 'lesson'
  pattern_content     jsonb not null,
  outcome_quality_avg numeric(3,2),   -- average satisfaction rating from source decisions
  sample_size         integer not null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
```

This table contains no personal data — it is the anonymized, aggregated output of the Learning Pipeline. No RLS is required — it is readable by the AI Analysis Engine via the `service_role` key.

### 14.2 `decision_lessons` (Knowledge Base Source Tracking)

```sql
-- Post-MVP: tracks which completed Decision Objects have been
-- processed by the Learning Pipeline
create table public.decision_lessons (
  id              uuid primary key default gen_random_uuid(),
  decision_id     uuid references public.decisions(id) on delete set null,
  processed_at    timestamptz not null default now(),
  consent_given   boolean not null,
  patterns_extracted integer not null default 0
);
```

`decision_id` uses `on delete set null` rather than `on delete cascade` so that the processing record is retained even if the user later deletes their Decision. This allows the Learning Pipeline to avoid re-processing already-processed Decisions.

---

*DecisionOS Company Handbook | H12 — Database Specification*
*Version 1.0 Final | Status: Frozen*
*Owner: Founding Team | Next review: Q4 2026*
