# H09 — Technical Architecture
**DecisionOS Company Handbook**
*Version 1.0 Final | June 2026*

---

## Preamble

This document describes the technical implementation of DecisionOS. It translates the conceptual architecture in H04, the product requirements in H06, the user workflows in H05, and the design system in H08 into concrete technical decisions, conventions, and specifications.

A developer joining the project should be able to read H09 and understand the full technical picture without reading any code. H09 does not invent product features or business rules — it describes how the features already defined in H01–H08 are built.

**Scope:** MVP implementation as defined in H06. Post-MVP capabilities (Learning Pipeline, Knowledge Base, Public API, Embedded Interface, Native Mobile) are noted where relevant but not specified in detail.

Before reading H09, engineers should be familiar with:
- **H03** — the Decision Object, its thirteen components, and its seven Decision States
- **H04** — the six system layers and their responsibilities
- **H06** — the functional requirements and business rules
- **H08** — the design system, CSS tokens, and component specifications

---

## 1. Architecture Overview

DecisionOS is a server-rendered web application with a Next.js frontend, a Supabase backend for data and authentication, the Anthropic API for AI reasoning, and Stripe for subscription billing. It is deployed on Vercel and hosted at `decisionpilot.tech`.

The system follows the six-layer architecture defined in H04:

```
┌──────────────────────────────────────────────┐
│  INTERFACE LAYER    Next.js 14 (Web)          │
├──────────────────────────────────────────────┤
│  EXPERIENCE LAYER   React components          │
│                     features/ modules         │
├──────────────────────────────────────────────┤
│  DECISION LAYER     core/decision/            │
│                     State Machine             │
│                     Decision Engine           │
├──────────────────────────────────────────────┤
│  INTELLIGENCE LAYER Anthropic API             │
│                     core/ai/prompts.ts        │
├──────────────────────────────────────────────┤
│  DATA LAYER         Supabase PostgreSQL       │
│                     decisions table           │
│                     subscriptions table       │
├──────────────────────────────────────────────┤
│  INFRASTRUCTURE     Supabase Auth             │
│                     Stripe                    │
│                     Google Analytics GA4      │
│                     Vercel                    │
└──────────────────────────────────────────────┘
```

Each layer has a single responsibility and communicates only with adjacent layers. No layer bypasses another. The Decision Object defined in H03 is the unit of data that flows through the entire stack.

---

## 2. Tech Stack

### Core

| Technology | Version | Role |
|---|---|---|
| Next.js | 14 (Pages Router) | Full-stack React framework. Handles routing, SSR, API routes, and deployment optimization. |
| React | 18 | UI component library. All UI is built as React functional components with hooks. |
| TypeScript | 5.x | Type safety for all new files. Existing legacy files in JavaScript (.js/.jsx) are migrated progressively. `strict: false` during migration, `strict: true` as target. |

### Backend Services

| Service | Role |
|---|---|
| Supabase | PostgreSQL database + Auth + Row Level Security. Hosted on EU West (Frankfurt). |
| Anthropic API | AI reasoning via `claude-sonnet-4-6` model. Called server-side only via Next.js API routes. |
| Stripe | Subscription billing. Checkout sessions and webhook event processing. |

### Deployment and Observability

| Service | Role |
|---|---|
| Vercel | Deployment platform. Auto-deploys from GitHub `main` branch. Manages environment variables and edge network. |
| GitHub | Version control. Repository: `DocAB13/decisionpilot`. Main branch is production. |
| Google Analytics GA4 | User behavior tracking via `@next/third-parties/google`. GDPR-gated via `CookieBanner`. |

### Key Libraries

| Library | Role |
|---|---|
| `@supabase/supabase-js` | Supabase client SDK |
| `@supabase/ssr` | Supabase SSR helpers for Next.js (session management in middleware and API routes) |
| `stripe` | Stripe Node.js SDK |
| `@next/third-parties` | Google Analytics integration |

### Domain

`decisionpilot.tech` — registered via Namecheap, DNS managed by Namecheap, pointed to Vercel.

---

## 3. Frontend Architecture (Next.js)

### Framework Choice

Next.js 14 with the **Pages Router** (not App Router). The Pages Router was chosen at project inception and all existing routes, API routes, and middleware are built on it. The App Router migration is post-MVP.

### Rendering Strategy

| Page type | Strategy | Reason |
|---|---|---|
| Homepage (`/`) | Client-side only (CSR) | `App.jsx` is dynamically imported with `ssr: false` to avoid server-side rendering of the SPA component. |
| Auth pages (`/auth/*`) | Static + client hydration | No server-side data fetching needed. |
| Dashboard (`/dashboard`) | Server-side rendering (SSR) | Requires authenticated session and initial Decision Object list. |
| Decision pages (`/decision/*`) | Server-side rendering (SSR) | Decision Object content is user-specific and must not be cached publicly. |
| Legal pages, guides | Static generation (SSG) | Content is static. Pre-rendered at build time. |
| API routes (`/api/*`) | Server-side only | All API routes run exclusively on the server. Never exposed to client bundle. |

### Component Architecture

Components are organized in three layers reflecting H04:

**`/features/`** — Business-logic-aware components. Each feature module corresponds to a user workflow from H05. Feature components can import from `core/` and `components/`, but never from other `features/` modules — they communicate through context.

**`/components/`** — Pure UI components with no business logic. Components here do not know what a Decision Object is. They receive props and render UI. They can be used across any feature.

**`/core/`** — Framework-free business logic. No React, no Next.js, no external API calls. Pure TypeScript functions and type definitions. This layer is independently testable.

### CSS and Styling

All styling uses inline JSX styles with design tokens from `lib/design-tokens.css`. The token file defines all colors, spacing, typography, and radius values as CSS custom properties on `:root`. Components reference tokens via `var(--color-accent)` etc. in their inline style objects.

**No CSS frameworks (Tailwind, Bootstrap, etc.) are used.** No CSS modules. No styled-components. The inline style system with CSS custom properties is the established convention for this codebase.

For pseudo-states (`:hover`, `:focus-visible`, `:active`), global CSS rules are defined in `lib/design-tokens.css` using class selectors that components apply. For example, all `<button>` elements automatically receive the focus ring from the global `button:focus-visible` rule.

### Routing (Target State per H08 §4)

URL routing follows Next.js Pages Router conventions. Every user-facing view is a page file:

```
/                      → pages/index.js         (Homepage, anonymous)
/dashboard             → pages/dashboard.tsx    (Authenticated user hub)
/decision/new          → pages/decision/new.tsx (Start a Decision)
/decision/[id]         → pages/decision/[id].tsx (Decision Object view)
/auth/login            → pages/auth/login.tsx
/auth/signup           → pages/auth/signup.tsx
/history               → pages/history.tsx
/account               → pages/account.tsx
/success               → pages/success.js       (Stripe redirect)
/guides/*              → pages/guides/*.js      (SEO content)
/about, /contact, etc. → pages/*.js             (Static pages)
```

**Important:** During the current migration period, the homepage still uses the legacy SPA pattern (`useState` screen routing inside `App.jsx`). The target state above is the goal. Pages are created incrementally — existing routes must never break during migration.

### Navigation

**Desktop (≥1024px):** Persistent top navigation bar. Left: wordmark linking to Dashboard (or homepage if anonymous). Center: in-context Decision title on Decision-level screens, empty otherwise. Right: "New Decision" primary button (authenticated) or "Sign in" + "Get started" (anonymous).

**Mobile (≤767px):** Top navigation reduced to wordmark only. Bottom navigation bar with Home, New Decision (prominent center), History.

The `TopNav` component accepts an `anonymous` prop that switches between the two authenticated/anonymous layouts. The mobile bottom navigation is a separate `BottomNav` component rendered conditionally in the page layout, not inside `TopNav`.

---

## 4. Backend Architecture

### API Routes

All backend logic lives in Next.js API routes under `pages/api/`. API routes run on Vercel's serverless functions. Each route is a single file exporting a default `handler(req, res)` function.

**Conventions:**
- Every API route validates the HTTP method first and returns `405` for unsupported methods.
- Every route that requires authentication validates the session before processing.
- Error responses always return JSON: `{ error: "human-readable message" }`.
- Success responses return JSON with the relevant data object.
- No API route imports from `features/` or `components/` — they import only from `core/`, `lib/`, and Node.js built-ins.

### Target API Route Structure (per H04 §API)

```
pages/api/
├── auth/
│   └── callback.ts           ← Supabase email confirmation
├── decision/
│   ├── analyze.js            ← POST: run AI analysis on a Decision Object
│   ├── save.js               ← POST: persist a Decision Object component update
│   └── history.js            ← GET: list Decision Objects for the authenticated user
└── billing/
    ├── checkout.js           ← POST: create Stripe Checkout session
    └── webhook.js            ← POST: handle Stripe webhook events
```

**Current state:** `pages/api/chat.js` and `pages/api/create-checkout.js` and `pages/api/webhook.js` exist at the root of `pages/api/`. These are being migrated to the target structure above. During migration, both paths are active.

### Serverless Constraints

Each API route is a Vercel serverless function with:
- **Maximum execution time:** 30 seconds (matches FR-12.2 AI analysis timeout)
- **No persistent state** between invocations — all state is in Supabase
- **Cold start:** API routes with heavy imports (Stripe, Supabase) may have 200–500ms cold starts on first invocation. This is acceptable for the MVP scale.

### Middleware

`middleware.ts` runs on every request before it reaches any page or API route. Its sole responsibility is refreshing the Supabase session token if it has expired. This keeps the user logged in for 30 days without requiring re-authentication (FR-08.5).

The middleware matcher excludes: `_next/static`, `_next/image`, `favicon.ico`, and all static asset extensions. It runs on all other paths.

Middleware also enforces auth-based redirects:
- Authenticated users visiting `/auth/login` or `/auth/signup` → redirect to `/dashboard`
- Unauthenticated users visiting `/dashboard`, `/history`, `/decision/*` → redirect to `/auth/login?return=[original path]`

---

## 5. Database Structure (Supabase)

### Platform

**Supabase PostgreSQL** hosted on EU West (Frankfurt). Project: `DocAB13's Project` (ID: `avljmkkjonvfviyhebkv`).

Row Level Security (RLS) is enabled on all user-data tables. The `anon` key used in the browser client cannot access data that RLS does not explicitly permit. The `service_role` key (used only in server-side webhook and API routes) bypasses RLS for administrative operations.

### Current Tables (MVP Sprint 1–5)

#### `auth.users` (managed by Supabase)
Created automatically on signup. Contains email, hashed password, confirmation status, and metadata. Never queried directly — accessed via `supabase.auth.getUser()`.

#### `subscriptions`

Stores the subscription status for each user. One row per user.

```sql
create table subscriptions (
  id                      uuid default gen_random_uuid() primary key,
  user_id                 uuid references auth.users(id) on delete cascade,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  plan                    text default 'free',     -- 'free' | 'pro' | 'premium'
  status                  text default 'active',   -- 'active' | 'cancelled'
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

alter table subscriptions enable row level security;

create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);
```

RLS allows users to read their own row. The webhook (running with `service_role` key) writes to this table without RLS restriction.

### Target Tables (Sprint 2 — Decision Object)

The following schema implements the Decision Object defined in H03. It is the target for Sprint 2 implementation.

#### `decisions`

One row per Decision Object. Stores identity and status fields. Component content is stored in a separate `decision_components` table.

```sql
create table decisions (
  id              uuid default gen_random_uuid() primary key,
  owner_id        uuid references auth.users(id) on delete cascade,
  -- owner_id is NULL for anonymous Decision Objects (claimed on signup)
  anonymous_token text unique,
  -- used to identify anonymous Decision Objects before owner claims them
  category        text not null,
  -- e.g., 'financial', 'technology', 'health', 'travel', 'career'
  status          text not null default 'draft',
  -- 'draft' | 'in_analysis' | 'waiting_for_user' | 'decision_made'
  -- | 'executing' | 'completed' | 'archived'
  title           text,
  -- user-defined or auto-generated from category + context
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  expires_at      timestamptz
  -- set to created_at + 48h for anonymous Decision Objects; NULL for owned
);

alter table decisions enable row level security;

create policy "Users can view own decisions"
  on decisions for select
  using (auth.uid() = owner_id);

create policy "Users can insert own decisions"
  on decisions for insert
  with check (auth.uid() = owner_id or owner_id is null);

create policy "Users can update own decisions"
  on decisions for update
  using (auth.uid() = owner_id);

create policy "Service role can claim anonymous decisions"
  on decisions for update
  using (true);  -- service_role bypasses RLS; this is enforced in API logic
```

#### `decision_components`

Stores the content of each of the thirteen Decision Object components (H03) as versioned JSONB blobs. One row per component per version. This is the append-only audit trail required by BR-05.

```sql
create table decision_components (
  id            uuid default gen_random_uuid() primary key,
  decision_id   uuid references decisions(id) on delete cascade,
  component     text not null,
  -- '0_identity' | '1_context' | '2_goal' | '3_constraints'
  -- | '4_alternatives' | '5_ai_analysis' | '6_risks'
  -- | '7_recommendation' | '8_final_decision' | '9_action_plan'
  -- | '10_outcome' | '11_reflection' | '12_lessons_learned'
  version       integer not null default 1,
  -- increments on each update; previous version remains in the table
  content       jsonb not null,
  -- component-specific JSON payload (see Component Schemas below)
  is_current    boolean not null default true,
  -- only one row per (decision_id, component) should have is_current = true
  created_at    timestamptz default now(),
  prompt_version text
  -- the version of the AI prompt used to generate this component (for AI components)
);

alter table decision_components enable row level security;

create policy "Users can view own decision components"
  on decision_components for select
  using (
    exists (
      select 1 from decisions d
      where d.id = decision_id and d.owner_id = auth.uid()
    )
  );

create index on decision_components (decision_id, component, is_current);
```

#### `decision_state_transitions`

Audit log of every Decision State change, as required by FR-06.2.

```sql
create table decision_state_transitions (
  id            uuid default gen_random_uuid() primary key,
  decision_id   uuid references decisions(id) on delete cascade,
  from_status   text,          -- NULL for initial creation
  to_status     text not null,
  trigger       text not null, -- 'user_action' | 'system_event' | 'ai_completion'
  created_at    timestamptz default now()
);

alter table decision_state_transitions enable row level security;

create policy "Users can view own transitions"
  on decision_state_transitions for select
  using (
    exists (
      select 1 from decisions d
      where d.id = decision_id and d.owner_id = auth.uid()
    )
  );
```

#### `decision_chat_messages`

Stores all AI Chat messages anchored to a specific Decision Object. Required by FR-07.3 and BR-11.

```sql
create table decision_chat_messages (
  id            uuid default gen_random_uuid() primary key,
  decision_id   uuid references decisions(id) on delete cascade,
  role          text not null check (role in ('user', 'assistant')),
  content       text not null,
  created_at    timestamptz default now()
);

alter table decision_chat_messages enable row level security;

create policy "Users can view own chat messages"
  on decision_chat_messages for select
  using (
    exists (
      select 1 from decisions d
      where d.id = decision_id and d.owner_id = auth.uid()
    )
  );

create policy "Users can insert own chat messages"
  on decision_chat_messages for insert
  with check (
    exists (
      select 1 from decisions d
      where d.id = decision_id and d.owner_id = auth.uid()
    )
  );
```

### Component Content Schemas (JSONB)

Each component in `decision_components.content` follows a defined schema. Examples for key components:

**Component 1 — Context:**
```json
{
  "background": "string",
  "current_situation": "string",
  "prior_attempts": "string | null",
  "timing_constraints": "string | null"
}
```

**Component 4 — Alternatives:**
```json
{
  "alternatives": [
    {
      "id": "string",
      "name": "string",
      "source": "user_provided | ai_suggested | do_nothing",
      "attributes": {}
    }
  ]
}
```

**Component 7 — Recommendation:**
```json
{
  "recommended_alternative_id": "string",
  "primary_reasoning": "string",
  "confidence_level": "high | medium | low",
  "conditions_for_change": "string",
  "runner_up_id": "string | null",
  "margin_description": "string | null"
}
```

**Component 8 — Final Decision:**
```json
{
  "chosen_alternative_id": "string",
  "matches_recommendation": true,
  "divergence_reason": "string | null",
  "confidence": "confident | uncertain | reluctant"
}
```

---

## 6. Authentication

### Provider

Supabase Auth with email/password. No third-party OAuth providers in MVP (FR-08.1).

### Session Management

Supabase issues JWT tokens stored in HTTP-only cookies. The `@supabase/ssr` package manages cookie reading and writing in the Next.js context:

- **Browser (client components):** `createBrowserClient` from `lib/supabase/client.ts`
- **API routes:** `createServerClient` from `lib/supabase/server.ts`, receives `req`/`res` to read/write cookies
- **Middleware:** `createServerClient` with `NextRequest`/`NextResponse` to refresh tokens on every request

Sessions persist for 30 days without re-authentication (FR-08.5). The middleware refreshes the access token automatically on every request if it has expired but the refresh token is still valid.

### Anonymous Sessions

Users can start a Decision Object without an account. The system creates a `decisions` row with `owner_id = NULL` and generates an `anonymous_token` (a UUID stored in browser `localStorage`). The anonymous token is passed with every API request to identify the Decision Object before it is claimed.

When the user creates an account, the API route that handles account creation (or the auth callback) queries `decisions` by `anonymous_token` and sets `owner_id` to the new user's ID. The `anonymous_token` is then cleared (FR-01.6, FR-08.6).

Anonymous Decision Objects that have not been claimed within 48 hours are deleted by a Supabase scheduled function (FR-01.5, BR-04).

### Auth Flow

```
1. User submits email + password on /auth/signup
2. Supabase creates user in auth.users
3. Supabase sends confirmation email with link to /api/auth/callback?code=XXX
4. callback.ts calls supabase.auth.exchangeCodeForSession(code)
5. Supabase sets session cookies; user is now authenticated
6. callback.ts redirects to / (or ?return= value if set)
```

Login flow:
```
1. User submits email + password on /auth/login
2. supabase.auth.signInWithPassword({ email, password })
3. On success: session cookies set, redirect to /dashboard (or ?return= value)
4. On failure: error message shown (H08 §12 error display spec)
```

### Entitlement Check Pattern

Every server-side route that requires authentication follows this pattern:

```typescript
// In any pages/api/*.ts route
const supabase = createClient({ req, res })
const { data: { user }, error } = await supabase.auth.getUser()

if (!user) {
  return res.status(401).json({ error: 'Authentication required' })
}

// Check subscription plan for tier-restricted features
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('plan')
  .eq('user_id', user.id)
  .single()

const plan = subscription?.plan ?? 'free'
```

---

## 7. AI Integration

### Provider

**Anthropic API** via direct `fetch` to `https://api.anthropic.com/v1/messages`. Model: `claude-sonnet-4-6`.

The Anthropic SDK (`@anthropic-ai/sdk`) is not used — direct HTTP fetch is preferred to avoid a heavy dependency and to maintain explicit control over the request payload.

### Call Pattern

All AI calls are made server-side only, from within Next.js API routes. The `ANTHROPIC_API_KEY` environment variable is never exposed to the browser — it exists only on the server.

Standard request pattern:

```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }]
  })
})

const data = await response.json()
if (data.type === 'error' || data.error) throw new Error(data.error?.message)
const text = data.content.map(b => b.text || '').join('')
```

### Prompt Architecture

All prompts are centralized in `core/ai/prompts.ts`. No prompt strings are embedded in API route files. Each function in `prompts.ts` takes a typed input and returns a `{ system: string, user: string }` object.

This separation exists for three reasons: prompts can be versioned, tested, and changed without touching API route logic; the prompt version can be stored alongside the AI output in `decision_components.prompt_version`; and the Intelligence Layer remains cleanly separated from the API Layer per H04.

**Decision Analysis prompt structure:**

```typescript
// core/ai/prompts.ts
export function buildAnalysisPrompt(input: DecisionAnalysisInput): {
  system: string
  user: string
} {
  return {
    system: `You are DecisionOS, a structured decision support system...`,
    user: `Category: ${input.category}
Context: ${input.context}
Goal: ${input.goal}
Constraints: ${JSON.stringify(input.constraints)}
Alternatives: ${JSON.stringify(input.alternatives)}

Provide a structured analysis following this exact format:
[FORMAT SPECIFICATION]`
  }
}
```

### AI Output Parsing

AI responses for the Decision analysis are structured JSON, not free prose. The system prompt instructs the model to respond only in JSON. The API route parses the response and validates it against the expected schema before persisting it.

```typescript
// In pages/api/decision/analyze.ts
const raw = data.content[0].text
const cleaned = raw.replace(/```json|```/g, '').trim()
const parsed = JSON.parse(cleaned)
// Validate parsed against AnalysisResponse schema before writing to DB
```

### Timeout Handling

AI calls are wrapped in a timeout race:

```typescript
const timeout = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('AI_TIMEOUT')), 29000)
)
const result = await Promise.race([aiCall(), timeout])
```

The 29-second timeout (leaving 1 second for response overhead within Vercel's 30-second function limit) ensures the API route always returns before the serverless function is killed. On timeout, the Decision Object remains in `Draft` state and the user is shown the H08 §17 AI failure screen (FR-03.8, FR-06.3).

### Chat Integration

The AI Chat Interface sends the full Decision Object context as the system prompt on every request. Chat messages are stored in `decision_chat_messages` and included in subsequent API calls as the conversation history. The API route never sends more than the last 20 messages to avoid exceeding the model's context window.

---

## 8. API Structure

### Conventions

All API routes follow these conventions without exception:

1. **Method guard first.** `if (req.method !== 'POST') return res.status(405).end()`
2. **Auth check second** (for protected routes). Return 401 before any data access.
3. **Input validation third.** Validate required fields before any external call.
4. **External calls last.** Database writes and AI calls happen only after all validation passes.
5. **No raw card data.** Stripe Checkout is the only payment path. The server never handles card numbers.
6. **Structured error responses.** Always `{ error: "message" }` — never HTML error pages from API routes.

### Billing Routes

**`POST /api/billing/checkout`**

Creates a Stripe Checkout session. Requires: `plan` (string: 'pro' | 'premium'). Optional: `user_id` (passed as metadata for webhook correlation).

Returns: `{ url: string }` — the Stripe Checkout URL the frontend redirects to.

Stripe Checkout handles all payment UI. The server never sees card data.

**`POST /api/billing/webhook`**

Receives Stripe webhook events. Validates the `stripe-signature` header using `STRIPE_WEBHOOK_SECRET`. Processes two event types:

- `checkout.session.completed` → writes/updates row in `subscriptions` table
- `customer.subscription.deleted` → sets `subscriptions.plan = 'free'` and `status = 'cancelled'`

This route must use `bodyParser: false` (raw body required for Stripe signature validation).

### Decision Routes

**`POST /api/decision/analyze`**

Runs the AI analysis on a Decision Object. Requires authentication. Requires a Decision Object in `draft` state with at least two Alternatives.

Flow:
1. Validate session
2. Fetch Decision Object from DB (verify ownership)
3. Validate state is `draft` and alternatives count ≥ 2 (BR-01)
4. Update state to `in_analysis`
5. Call AI via `buildAnalysisPrompt`
6. Parse and validate AI response
7. Write AI Analysis, Risks, and Recommendation to `decision_components`
8. Update Decision state to `waiting_for_user`
9. Return the Recommendation to the client

**`POST /api/decision/save`**

Persists a single component update to a Decision Object. Requires authentication.

Body: `{ decision_id, component, content }`. Validates component name against allowed list. Increments version, marks previous version `is_current = false`, inserts new row with `is_current = true`.

**`GET /api/decision/history`**

Returns paginated list of Decision Objects for the authenticated user. Supports query params: `status` (filter by Decision State), `category`, `page`, `limit` (max 50).

Returns: `{ decisions: DecisionSummary[], total: number, page: number }`.

### Auth Routes

**`GET /api/auth/callback`**

Handles Supabase email confirmation. Receives `code` query parameter. Calls `supabase.auth.exchangeCodeForSession(code)`. Claims any anonymous Decision Objects from the current session. Redirects to `/dashboard` or `?return=` value.

---

## 9. Folder Structure

The target folder structure for the DecisionOS MVP. Files marked `[exists]` are in the current codebase. Files marked `[target]` are to be created.

```
decisionpilot/
│
├── core/                                    [target Sprint 2]
│   ├── decision/
│   │   ├── Decision.types.ts               ← H03 TypeScript types
│   │   ├── Decision.constants.ts           ← Decision States, category enum
│   │   └── Decision.utils.ts               ← Pure validation functions
│   └── ai/
│       └── prompts.ts                      ← All AI prompt builders
│
├── features/                               [target Sprint 2–4]
│   ├── decision-wizard/
│   │   ├── Wizard.tsx                      ← Container orchestrator
│   │   ├── CategorySelect.tsx
│   │   ├── ContextStep.tsx
│   │   ├── GoalStep.tsx
│   │   ├── ConstraintsStep.tsx
│   │   ├── AlternativesStep.tsx
│   │   └── RecommendationView.tsx
│   ├── decision-chat/
│   │   └── Chat.tsx
│   ├── decision-history/
│   │   └── History.tsx
│   └── marketing/
│       ├── Landing.tsx                     ← Extracted from App.jsx
│       ├── HeroBanner.tsx                  ← Moved from components/
│       └── PricingSection.tsx
│
├── components/                             [partial exists, target Sprint 2–5]
│   ├── layout/
│   │   ├── TopNav.tsx                      ← Extract from App.jsx [target]
│   │   ├── BottomNav.tsx                   ← New mobile nav [target]
│   │   └── PageLayout.tsx                  ← Standard page wrapper [target]
│   ├── ui/
│   │   ├── Button.tsx                      ← H08 §7 Button [target]
│   │   ├── Input.tsx                       ← H08 §7 Input [target]
│   │   ├── Card.tsx                        ← H08 §7 Card [target]
│   │   ├── Badge.tsx                       ← Extract from App.jsx [target]
│   │   ├── ProgressBar.tsx                 ← H08 §7 Progress [target]
│   │   ├── SaveIndicator.tsx               ← H08 §7 Save Indicator [target]
│   │   ├── SkeletonCard.tsx                ← H08 §16 [target]
│   │   └── AnalysisLoading.tsx             ← Refactor LoadingScreen [target]
│   ├── asel/
│   │   ├── AselCorner.jsx                  ← Move from components/ [target]
│   │   ├── AselMascot.jsx                  ← Move [target]
│   │   └── AselPose.jsx                    ← Move [target]
│   ├── legal/
│   │   ├── GuideLayout.js                  ← Move [target]
│   │   └── LegalLayout.jsx                 ← Move [target]
│   ├── CookieBanner.js                     [exists]
│   └── translations.js                     [exists]
│
├── context/
│   ├── AuthContext.tsx                     [exists]
│   ├── DecisionContext.tsx                 [target Sprint 2]
│   └── AppContext.tsx                      [target Sprint 3+]
│
├── hooks/
│   ├── useAuth.ts                          [target Sprint 1]
│   ├── useSubscription.js                  [exists]
│   ├── useDecision.ts                      [target Sprint 2]
│   └── useDecisionHistory.ts              [target Sprint 2+]
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       [exists]
│   │   └── server.ts                       [exists]
│   ├── stripe/
│   │   └── stripe.client.ts               [target Sprint 2]
│   └── design-tokens.css                  [target Sprint 1]
│
├── pages/
│   ├── _app.js                             [exists]
│   ├── index.js                            [exists — legacy SPA]
│   ├── dashboard.tsx                       [target Sprint 2]
│   ├── history.tsx                         [target Sprint 2]
│   ├── account.tsx                         [target Sprint 3]
│   ├── decision/
│   │   ├── new.tsx                         [target Sprint 2]
│   │   └── [id].tsx                        [target Sprint 2]
│   ├── auth/
│   │   ├── login.tsx                       [exists — restyling Sprint 1]
│   │   └── signup.tsx                      [exists — restyling Sprint 1]
│   ├── api/
│   │   ├── auth/callback.ts               [exists]
│   │   ├── decision/
│   │   │   ├── analyze.js                 [target Sprint 2]
│   │   │   ├── save.js                    [target Sprint 2]
│   │   │   └── history.js                 [target Sprint 2]
│   │   ├── billing/
│   │   │   ├── checkout.js               [target Sprint 1 — copy of create-checkout]
│   │   │   └── webhook.js                [target Sprint 1 — copy of webhook]
│   │   ├── chat.js                        [exists — legacy, migrate Sprint 2]
│   │   ├── create-checkout.js             [exists — deprecated Sprint 1]
│   │   └── webhook.js                    [exists — deprecated Sprint 1]
│   ├── about.js, contact.js, etc.         [exists — keep unchanged]
│   └── guides/                            [exists — keep unchanged]
│
├── docs/
│   └── adr/                               [target — per H04 Appendix]
│
├── components/
│   └── App.jsx                            [exists — legacy monolith, dissolve Sprint 2–4]
│
├── middleware.ts                           [exists]
├── tsconfig.json                           [exists]
├── .env.local                              [exists — not in Git]
└── .gitignore                              [exists]
```

---

## 10. State Management

### Philosophy

State is kept as local as possible. Global state is introduced only when data genuinely needs to be shared across distant components. There are three levels:

**Local component state** — `useState` and `useReducer` for UI state (form values, toggle states, loading indicators). Used in individual components.

**React Context** — for data that needs to be available application-wide without prop drilling. Three contexts:

| Context | Data | Scope |
|---|---|---|
| `AuthContext` | `user`, `session`, `loading`, `signOut` | Available to all components via `useAuth()` hook |
| `DecisionContext` | Current active Decision Object and its state | Available within Decision-level pages |
| `AppContext` | `lang`, theme preferences | Available to all components (Sprint 3+) |

**Server state** — Decision Objects, History lists, subscription data are fetched from the server and not stored in global client state. Each page fetches its own data via Next.js `getServerSideProps` or via `useSWR`-style client fetching.

### No External State Library

Redux, Zustand, Jotai, and similar libraries are not used. The combination of React Context, local state, and server-side data fetching covers all MVP needs. This is revisited post-MVP if complexity demands it.

### Decision Object State in Context

`DecisionContext` provides the current Decision Object to all components within a `/decision/[id]` page:

```typescript
type DecisionContextValue = {
  decision: DecisionObject | null
  updateComponent: (component: ComponentName, content: unknown) => Promise<void>
  advanceState: (to: DecisionStatus) => Promise<void>
  loading: boolean
  error: string | null
}
```

`updateComponent` calls `/api/decision/save` and updates local state optimistically. `advanceState` calls `/api/decision/save` and validates the transition against the State Machine rules before committing.

### Auto-Save

The Decision Wizard auto-saves after every input event with an 800ms debounce. The pattern:

1. User types or selects in the Wizard.
2. Component calls `updateComponent(componentName, newValue)` from context.
3. Context sets `saveState: 'saving'` — Save Indicator shows "Saving..."
4. After 800ms debounce, API call fires to `/api/decision/save`.
5. On success: `saveState: 'saved'` — Save Indicator shows "Saved" for 2 seconds, then hides.
6. On failure: `saveState: 'error'` — Save Indicator shows "Not saved" (persists until retry).

The auto-save fires a minimum of three retries before showing the error state (FR-12.4).

---

## 11. Security

### Authentication Security

- Passwords are hashed by Supabase using bcrypt. The application never sees plaintext passwords.
- Session tokens are JWTs stored in HTTP-only cookies. Not accessible to JavaScript (`document.cookie`), preventing XSS theft.
- The `SUPABASE_SERVICE_ROLE_KEY` is used only in server-side API routes. It is never in the client bundle.
- `NEXT_PUBLIC_` prefix is used only for variables safe to expose in the browser (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). All other keys are server-only.

### Stripe Security

- The Stripe Secret Key (`STRIPE_SECRET_KEY`) is server-side only.
- Webhook signature validation uses `stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)`. A webhook without a valid signature returns 400 and is discarded.
- The raw request body is preserved for webhook validation (`bodyParser: false`).
- The application never handles raw card data at any point. All payment UI is hosted by Stripe.

### Row Level Security (RLS)

All user-data tables have RLS enabled. The client-side Supabase client (using the `anon` key) can only access rows that the authenticated user owns. RLS policies enforce this at the database level — API routes do not need to add `WHERE user_id = auth.uid()` clauses because RLS does it automatically for the `anon` key.

The `service_role` key bypasses RLS. It is used only in webhook handlers and background jobs that legitimately need cross-user access.

### API Route Authorization

Every API route that operates on user data:
1. Validates the session via `supabase.auth.getUser()`
2. Verifies the requested resource belongs to the authenticated user before reading or writing

No resource is returned or modified based solely on a URL parameter without verifying ownership.

### Data Privacy (H02 Product Objective)

- Decision Object content is not shared between users.
- No behavioral profiling for advertising.
- No third-party analytics receive Decision Object content.
- GA4 tracks page views and events only — not Decision content.
- When a user deletes a Decision Object, all related rows (`decision_components`, `decision_chat_messages`, `decision_state_transitions`) are deleted via `ON DELETE CASCADE`.
- Anonymous Decision Objects are deleted after 48 hours by a scheduled Supabase function.

### GDPR Compliance

- The `CookieBanner` component gates GA4 analytics behind explicit user consent.
- Users can delete their account and all data via the account settings page.
- The privacy policy at `/privacy` is the authoritative record of what data is collected and why.
- Data is stored in Supabase EU West (Frankfurt) — within the EU.

---

## 12. Deployment

### Platform

**Vercel** — connected to the GitHub repository `DocAB13/decisionpilot`. Every push to the `main` branch triggers an automatic production deployment.

### Deployment Pipeline

```
Developer pushes to main
        ↓
GitHub notifies Vercel
        ↓
Vercel pulls latest commit
        ↓
Vercel runs: npm install → next build
        ↓
Build success? → Deploy to production CDN
Build failure? → Deployment blocked; previous version stays live
        ↓
Vercel notifies developer (email / dashboard)
```

No staging environment in MVP. Pre-production testing is done locally with `npm run dev` and `.env.local`.

### Branch Strategy

Single branch: `main` is always production. Feature work is done locally and pushed directly to `main` when ready. Pull requests are not required in MVP given the solo operation. This is revisited when the team grows.

### Build Requirements

`next build` must complete without errors. TypeScript type errors and ESLint errors (if configured) block deployment. Warnings are allowed but reviewed weekly.

The following must pass before any `git push`:
- The application runs correctly with `npm run dev` locally
- No console errors on the homepage, `/auth/login`, and `/auth/signup`
- Stripe webhook receives events correctly (verifiable in Stripe Dashboard)

### CDN and Edge

Vercel serves static assets (JS bundles, images, fonts) from its global CDN. API routes and SSR pages run on Vercel's serverless infrastructure in the closest available region to the user.

The Supabase database is in EU West (Frankfurt). All server-side API routes that communicate with Supabase run in the same region to minimize latency.

---

## 13. Environment Variables

All environment variables are configured in two places: `.env.local` (local development, not in Git) and Vercel Dashboard → Settings → Environment Variables (production and preview).

### Complete Variable Reference

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + Server | Supabase project URL. Example: `https://avljmkkjonvfviyhebkv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + Server | Supabase anonymous key. Safe for browser. RLS enforces access control. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Supabase service role key. Bypasses RLS. Never expose to browser. Used in webhook only. |
| `ANTHROPIC_API_KEY` | Server only | Anthropic API key. Never expose to browser. Used in AI analysis API routes. |
| `STRIPE_SECRET_KEY` | Server only | Stripe secret key. Used to create Checkout sessions and verify webhooks. |
| `STRIPE_WEBHOOK_SECRET` | Server only | Stripe webhook signing secret. Used in `/api/billing/webhook` to validate event signatures. |
| `STRIPE_PRO_PRICE_ID` | Server only | Stripe Price ID for the Pro plan (€4.99/month). Current: `price_1TkAIMFhDaeXj1q8W3BnIuSv` |
| `STRIPE_PREMIUM_PRICE_ID` | Server only | Stripe Price ID for the Premium plan (€9.99/month). Current: `price_1TkXXtFhDaeXj1q8ZUMJqp1M` |

### Rules

- Variables prefixed `NEXT_PUBLIC_` are included in the browser JavaScript bundle. Only add `NEXT_PUBLIC_` to variables that are safe to expose publicly.
- Never commit `.env.local` to Git. It is listed in `.gitignore`.
- When adding a new environment variable: add it to `.env.local` locally, add it in Vercel Dashboard, and document it in this section.
- Rotating a secret (e.g., ANTHROPIC_API_KEY): update in Vercel Dashboard first, then in `.env.local`. Vercel will trigger a redeploy automatically if configured to do so.

---

## 14. Coding Standards

### Language

New files use TypeScript (`.ts`, `.tsx`). Legacy files remain in JavaScript (`.js`, `.jsx`) until they are refactored. TypeScript `strict: false` is set in `tsconfig.json` during the migration period to prevent type errors from legacy `.jsx` files blocking builds.

When a `.jsx` file is refactored to `.tsx`, strict typing is applied to that file at minimum.

### File Naming

| Type | Convention | Example |
|---|---|---|
| React components | PascalCase `.tsx` | `RecommendationView.tsx` |
| Hooks | camelCase with `use` prefix `.ts` | `useDecision.ts` |
| Utility functions | camelCase `.ts` | `Decision.utils.ts` |
| API routes | kebab-case `.ts` or `.js` | `analyze.ts` |
| Types | PascalCase `.types.ts` | `Decision.types.ts` |
| Constants | PascalCase `.constants.ts` | `Decision.constants.ts` |

### Import Paths

Use the `@/` alias for all imports referencing the project root:

```typescript
// ✓ correct
import { useAuth } from '@/hooks/useAuth'
import { tokens } from '@/lib/design-tokens'
import type { DecisionObject } from '@/core/decision/Decision.types'

// ✗ incorrect
import { useAuth } from '../../../hooks/useAuth'
```

The `@/` alias is configured in `tsconfig.json` as `"paths": { "@/*": ["./*"] }`.

### Component Structure

Every React component follows this internal structure order:

```typescript
// 1. Imports (external, then internal)
// 2. Type definitions (props interface)
// 3. Component function
//    a. Hooks (useState, useEffect, context hooks)
//    b. Derived values (no side effects)
//    c. Event handlers
//    d. Return JSX
// 4. Export
```

### Inline Style Convention

Components use inline styles referencing CSS custom properties:

```typescript
// ✓ reference design tokens
<button style={{ background: 'var(--color-accent)', color: '#fff' }} />

// ✓ reference legacy C object (during migration)
<button style={{ background: C.accent, color: '#fff' }} />

// ✗ hardcode values that exist in the token system
<button style={{ background: '#1A56DB', color: '#fff' }} />
```

During migration, both `var(--color-*)` and `C.*` references are acceptable. The target is full migration to CSS custom properties.

### Async / Error Handling

All async functions use `try/catch`. API routes never let uncaught exceptions propagate — they are caught and returned as `{ error: "message" }` with an appropriate status code.

```typescript
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    // ... logic
    return res.status(200).json({ data })
  } catch (error) {
    console.error('[route-name]', error)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
```

---

## 15. Error Handling

### Levels

**User-visible errors** — shown in the UI using H08 §17 error state components. Always plain language. Never technical codes or stack traces.

**Server errors** — logged to Vercel's log system via `console.error()`. Never exposed to the client beyond a generic message.

**AI errors** — handled specifically per FR-03.8:
- Timeout (29s): Decision Object stays in current state; user shown H08 AI failure screen with retry.
- Parse failure (malformed JSON): treated as AI failure.
- API error from Anthropic: treated as AI failure.

### Error Response Contract

All API routes return errors in this format:

```json
{ "error": "Human-readable message explaining what happened" }
```

Client code checks `if (data.error)` — not HTTP status codes — to determine if a response is an error. Status codes are still set correctly but the `error` field is the primary signal.

### Client-Side Error Boundaries

Each major feature module (Decision Wizard, Recommendation View, Dashboard) is wrapped in a React Error Boundary. If an uncaught JavaScript error occurs in a feature, it shows the H08 §17 generic error state rather than a broken UI.

Error Boundary catch phrases are logged to the console. In post-MVP, these are routed to an error monitoring service (e.g., Sentry).

### Auto-Retry (Save Operations)

Per FR-12.4, save operations retry automatically a minimum of three times before showing an error to the user. The retry logic uses exponential backoff:

```
Attempt 1: immediate
Attempt 2: 1 second delay
Attempt 3: 3 second delay
Failure after 3 attempts: show "Not saved" in Save Indicator
```

---

## 16. Performance

### Targets (from H06 FR-12)

| Metric | Target |
|---|---|
| Decision Wizard load time | ≤ 2 seconds (standard broadband) |
| AI analysis completion | ≤ 30 seconds (95th percentile) |
| System uptime | ≥ 99.5% |
| Input preservation | 100% — no user input lost due to system error |

### Frontend Performance

**Code splitting:** Next.js automatically code-splits by page. The `App.jsx` monolith is dynamically imported with `ssr: false` to prevent it from blocking the initial page load. As components are extracted from `App.jsx` into `features/`, they become individually code-split.

**Image optimization:** Next.js `<Image>` component is used for all local images. External images (Unsplash, product images) are loaded with lazy loading and explicit `width`/`height` attributes to avoid layout shift.

**Font loading:** Google Fonts (`Inter`, `Plus Jakarta Sans`) are loaded via `<link>` in `pages/index.js` `<Head>`. `display=swap` is used to avoid invisible text during load.

**Bundle size discipline:** No UI component libraries are introduced. Each added npm dependency must be justified against its bundle size impact. Dependencies are evaluated with `npm run build` and Vercel's bundle analysis.

### API Performance

**Serverless cold starts:** Minimized by keeping API route imports lean. Supabase and Stripe clients are initialized outside the handler function (module scope) so they are reused across invocations within the same warm instance.

**Database queries:** All queries use indexed columns. The `decisions` table is indexed on `owner_id` and `status`. The `decision_components` table is indexed on `(decision_id, component, is_current)`. No N+1 queries — history list fetches use a single query with joins.

**AI concurrency:** AI analysis requests are not queued. Each request to Anthropic is independent. If concurrent load causes Anthropic to throttle, requests return 429 errors which are caught and shown as the H08 AI failure screen. This is acceptable for MVP scale.

---

## 17. Future Scalability

These items are out of scope for MVP but the architecture is designed to accommodate them without requiring fundamental changes.

**Public API (H04 §Interface Layer):** The existing API route structure under `pages/api/decision/` can be versioned (`/api/v1/decision/`) and exposed with API key authentication. The Decision Object schema is already JSON-native. No changes to the data layer are required.

**Knowledge Base and Learning Pipeline (H04 §Data Layer):** The `decision_components` table already stores Outcome and Reflection data (components 10–12). When the Learning Pipeline is built, it reads from this table, anonymizes, and writes to a new `knowledge_base` table. No changes to existing tables.

**Native Mobile (H04 §Interface Layer):** All business logic lives in Next.js API routes, not in the frontend. A React Native or Swift/Kotlin app would call the same API routes. The API is already stateless and JSON-based.

**Database scaling:** Supabase PostgreSQL scales vertically via plan upgrades and horizontally via read replicas. The current schema has no denormalization — all reads go to the primary. Read replicas can be added for the `/api/decision/history` route without schema changes.

**Multiple AI providers:** The AI integration is isolated to `core/ai/prompts.ts` and the `pages/api/decision/analyze.ts` route. Switching from Anthropic to another provider, or adding a fallback, requires changes only to these two files.

---

## 18. Technical Acceptance Criteria

These criteria define when the MVP technical implementation is complete and production-ready. They supplement H06 functional acceptance criteria.

### TAC-01 — Build and Deploy

- [ ] `next build` completes without TypeScript errors or ESLint blocking errors
- [ ] Production deployment on Vercel is green after every merge to `main`
- [ ] No `console.error` output on homepage, `/auth/login`, `/auth/signup` in a clean browser session
- [ ] All environment variables are set in Vercel Dashboard and verified functional

### TAC-02 — Database

- [ ] RLS is enabled on all user-data tables (`decisions`, `decision_components`, `decision_state_transitions`, `decision_chat_messages`, `subscriptions`)
- [ ] An authenticated user cannot read or write another user's Decision Objects via the browser client
- [ ] `ON DELETE CASCADE` is verified: deleting a `decisions` row removes all related component, chat, and transition rows
- [ ] Anonymous Decision Objects are deleted after 48 hours (Supabase scheduled function or cron)
- [ ] All indexes on `decisions` and `decision_components` are created and verified via `EXPLAIN ANALYZE`

### TAC-03 — Authentication

- [ ] Session cookie is HTTP-only (verifiable in browser DevTools → Application → Cookies)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` does not appear in any client-side bundle (verifiable via `next build` output and bundle analyzer)
- [ ] `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` do not appear in any client-side bundle
- [ ] Auth redirect with `?return=` works correctly: user landing on a protected route is redirected to login and returned to original destination after sign-in
- [ ] Anonymous Decision Object transfer on signup works: objects created before signup appear in the authenticated user's Dashboard

### TAC-04 — API

- [ ] All API routes return 405 for unsupported HTTP methods
- [ ] All protected API routes return 401 for unauthenticated requests
- [ ] No API route returns an HTML error page — all errors are JSON `{ error: "message" }`
- [ ] The Stripe webhook returns 400 for requests with invalid signatures
- [ ] The AI analysis route times out gracefully at 29 seconds and returns an appropriate error (not a 500 from Vercel killing the function)
- [ ] Save operations retry 3 times on failure before returning an error to the client

### TAC-05 — Performance

- [ ] Lighthouse Performance score ≥ 80 on the homepage in mobile simulation
- [ ] Decision Wizard loads within 2 seconds on simulated Fast 3G in Chrome DevTools
- [ ] No JavaScript errors in the console on any primary user flow (homepage → Wizard → Recommendation → Final Decision)
- [ ] AI analysis completes within 30 seconds for 10 consecutive test requests

### TAC-06 — Security

- [ ] `npm audit` shows no HIGH or CRITICAL vulnerabilities in production dependencies
- [ ] HTTPS is enforced — HTTP requests are redirected (managed by Vercel automatically)
- [ ] No sensitive data in URL parameters (Decision IDs in URLs are UUIDs, not sequential integers)
- [ ] CORS is not manually loosened — Next.js default CORS policy is in effect

### TAC-07 — Code Quality

- [ ] No `TODO` or `FIXME` comments in any file under `core/` or `features/`
- [ ] All new TypeScript files have explicit return types on exported functions
- [ ] The `@/` import alias is used for all cross-module imports in new files
- [ ] No hardcoded color values in new components — all colors via CSS custom properties or `C` object

### TAC-08 — H08 Design System

- [ ] `lib/design-tokens.css` is imported in `pages/_app.js`
- [ ] All interactive elements have visible focus rings on keyboard navigation (manually verifiable by pressing Tab through any page)
- [ ] `prefers-reduced-motion: reduce` disables all CSS animations (verifiable in Chrome DevTools → Rendering → Emulate prefers-reduced-motion)
- [ ] No `outline: none` without a custom focus indicator replacement

---

*DecisionOS Company Handbook | H09 — Technical Architecture*
*Version 1.0 Final | Status: Frozen*
*Owner: Founding Team | Next review: Q4 2026*
*A developer reading this document should be able to understand the full technical architecture of DecisionOS without reading any source code.*
