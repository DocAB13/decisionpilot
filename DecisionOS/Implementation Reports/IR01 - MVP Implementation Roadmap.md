# IR01 — MVP Implementation Roadmap
**DecisionOS**
*Version 1.0 | Status: Draft | June 2026*

---

## Preamble

This document translates the frozen DecisionOS architecture into a sequenced, task-level implementation plan. Every task references the handbook document that defines its requirements. Nothing in this roadmap invents, simplifies, or deviates from the architecture.

**Source of truth documents (all Frozen):**
- H03 — Decision Object and Domain Model
- H06 — Functional Requirements and Business Rules
- H09 — Technical Architecture
- H10 — Development Standards & Engineering Handbook
- H11 — AI System Specification
- H12 — Database Specification
- H13 — API Specification

**Current codebase state:** The repository at `github.com/DocAB13/decisionpilot` contains a working Next.js 14 application with Supabase Auth, Stripe billing, and a legacy `components/App.jsx` monolith (5,211 lines). Several files from Sprint 1–5 already exist. Tasks in this roadmap are scoped accordingly — they do not re-create what already exists. Files marked `[exists]` require verification or modification only.

**Execution model:** Tasks are ordered by dependency, not calendar time. Each task should be achievable in a single focused work session of two to four hours. Tasks with `Dependencies: none` can begin immediately.

---

## Phase Summary

| Phase | Name | Objective | Tasks |
|---|---|---|---|
| 1 | Foundation | Project configuration, environment, auth verification | IR01-001 – IR01-012 |
| 2 | Database | All migrations, RLS, indexes, scheduled functions | IR01-013 – IR01-026 |
| 3 | API Layer | All twelve endpoints per H13 | IR01-027 – IR01-055 |
| 4 | AI Integration | All four engines, prompts, validation | IR01-056 – IR01-076 |
| 5 | Frontend | Routing, Wizard, Dashboard, History, Chat, Billing UI | IR01-077 – IR01-110 |
| 6 | Testing & Launch | Unit tests, QA flows, production validation | IR01-111 – IR01-130 |

---

## Phase 1 — Foundation

**Objective:** Verify and complete the project skeleton: repository configuration, environment variables, TypeScript setup, design tokens, base folder structure, and existing auth infrastructure.

**Dependencies:** Access to Vercel Dashboard, Supabase Dashboard, Anthropic API, and Stripe Dashboard.

**Expected outputs:** A deployable Next.js application with all environment variables configured, TypeScript compiling without errors, and existing auth pages verified end-to-end.

---

### IR01-001 — Verify repository and deployment pipeline

**Description:** Confirm that `github.com/DocAB13/decisionpilot` is connected to Vercel, that `git push` to `main` triggers a deployment, and that the live site at `decisionpilot.tech` is reachable over HTTPS.

**Files to verify:**
- `.gitignore` — confirm `.env.local` is excluded
- `next.config.js` — confirm no hardcoded secrets
- Vercel Dashboard → Git → repository connection

**Dependencies:** None.

**Complexity:** Low.

**Acceptance criteria:**
- `git push` to `main` triggers a Vercel build visible in the Vercel Dashboard
- `https://decisionpilot.tech` returns HTTP 200 with no certificate errors
- `.env.local` does not appear in `git log` or `git status`

---

### IR01-002 — Audit and set all environment variables

**Description:** Verify all eight environment variables defined in H09 §13 are present in both `.env.local` and Vercel Dashboard → Settings → Environment Variables (Production). Confirm values match the active Supabase project, Stripe account, and Anthropic API key.

**Files to create/modify:**
- `.env.local` — verify all eight keys present

**Required variables (H09 §13):**
```
NEXT_PUBLIC_SUPABASE_URL=https://avljmkkjonvfviyhebkv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from Supabase Dashboard>
SUPABASE_SERVICE_ROLE_KEY=<service role key — never NEXT_PUBLIC_>
ANTHROPIC_API_KEY=<key from Anthropic console>
STRIPE_SECRET_KEY=<sk_live_... or sk_test_...>
STRIPE_WEBHOOK_SECRET=<whsec_... from Stripe Dashboard>
STRIPE_PRO_PRICE_ID=price_1TkAIMFhDaeXj1q8W3BnIuSv
STRIPE_PREMIUM_PRICE_ID=price_1TkXXtFhDaeXj1q8ZUMJqp1M
```

**Dependencies:** IR01-001.

**Complexity:** Low.

**Acceptance criteria:**
- `npm run dev` starts without missing environment variable errors
- `SUPABASE_SERVICE_ROLE_KEY` does not contain `NEXT_PUBLIC_` prefix
- All eight keys visible in Vercel Dashboard under Production environment

---

### IR01-003 — Verify and configure TypeScript

**Description:** Confirm `tsconfig.json` exists with the `@/` path alias configured. Confirm `npm run build` completes without TypeScript errors. Document any errors and resolve them before proceeding.

**Files to verify/modify:**
- `tsconfig.json` — must have `"paths": { "@/*": ["./*"] }` and `"strict": false`

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Dependencies:** IR01-001.

**Complexity:** Low.

**Acceptance criteria:**
- `npm run build` exits with code 0
- `@/hooks/useAuth` resolves correctly in any `.ts` file
- No `TS2307` (cannot find module) errors

---

### IR01-004 — Install and configure testing framework

**Description:** Install Vitest, React Testing Library, and coverage tooling. Add `test`, `test:coverage`, and `test:watch` scripts to `package.json`. Create `vitest.config.ts`. Confirm `npm test` runs (with no tests yet — exit code 0 with 0 tests is acceptable).

**Files to create/modify:**
- `package.json` — add scripts and devDependencies
- `vitest.config.ts` — new file

```bash
npm install --save-dev vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom jsdom
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['core/**/*.ts'],
      thresholds: { lines: 80 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

```typescript
// vitest.setup.ts  (new file)
import '@testing-library/jest-dom'
```

**Dependencies:** IR01-003.

**Complexity:** Low.

**Acceptance criteria:**
- `npm test` runs and exits cleanly
- `npm run test:coverage` generates a coverage report in `.coverage/`
- `vitest.config.ts` resolves `@/` alias correctly

---

### IR01-005 — Create `lib/design-tokens.css`

**Description:** Create the CSS custom properties file containing all H08 design tokens. Import it in `pages/_app.js`. This unblocks all future component styling and resolves H08 Gap G01.

**Files to create:**
- `lib/design-tokens.css`

**Files to modify:**
- `pages/_app.js` — add `import '../lib/design-tokens.css'`

```css
/* lib/design-tokens.css */
:root {
  /* Colors */
  --color-background:    #F8F9FC;
  --color-surface:       #FFFFFF;
  --color-border:        #E8ECF4;
  --color-border-strong: #C8D0E0;
  --color-text-primary:  #0F172A;
  --color-text-secondary:#475569;
  --color-text-muted:    #94A3B8;
  --color-accent:        #1A56DB;
  --color-accent-dark:   #1240A8;
  --color-accent-light:  #EFF4FF;
  --color-accent-border: #BFCFFF;
  --color-success:       #10B981;
  --color-success-light: #ECFDF5;
  --color-warning:       #F59E0B;
  --color-warning-light: #FFFBEB;
  --color-danger:        #EF4444;
  --color-danger-light:  #FEF2F2;

  /* Typography */
  --font-body:    'Inter', system-ui, sans-serif;
  --font-display: 'Plus Jakarta Sans', system-ui, sans-serif;
  --text-xs:   0.6875rem;
  --text-sm:   0.8125rem;
  --text-base: 0.9375rem;
  --text-md:   1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --font-regular: 400;
  --font-medium:  500;
  --font-semibold:600;
  --font-bold:    700;
  --font-black:   900;

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
  --space-12: 48px;--space-16: 64px;--space-20: 80px;

  /* Border radius */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;
  --radius-xl: 20px; --radius-full: 9999px;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm: 0 1px 4px rgba(0,0,0,0.07);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.10);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}

/* Global focus ring — H08 DAC-07 */
*:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Global button press scale — H10 §13 */
button:active {
  transform: scale(0.97);
  transition: transform 100ms ease;
}

/* Reduced motion — H08 §14 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Dependencies:** IR01-001.

**Complexity:** Low.

**Acceptance criteria:**
- `var(--color-accent)` resolves to `#1A56DB` in browser DevTools
- `:focus-visible` ring visible when tabbing through the homepage
- `prefers-reduced-motion` disables animations (verifiable in Chrome DevTools → Rendering)

---

### IR01-006 — Create `hooks/useAuth.ts`

**Description:** Create the `useAuth` hook as a thin re-export of the existing `AuthContext`. This establishes the stable import path required by H10 §5 and prevents components from importing directly from `context/AuthContext.tsx`.

**Files to create:**
- `hooks/useAuth.ts`

```typescript
// hooks/useAuth.ts
export { useAuth } from '@/context/AuthContext'
```

**Dependencies:** IR01-003. `context/AuthContext.tsx` must already exist (it does — marked `[exists]` in H09).

**Complexity:** Low.

**Acceptance criteria:**
- `import { useAuth } from '@/hooks/useAuth'` resolves without TypeScript errors
- `npm run build` passes after adding the file

---

### IR01-007 — Verify existing Supabase client files

**Description:** Confirm `lib/supabase/client.ts` and `lib/supabase/server.ts` exist and are implemented correctly using `@supabase/ssr`. Verify `createBrowserClient` is used in `client.ts` and `createServerClient` is used in `server.ts`.

**Files to verify:**
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`

If either file is missing or uses the deprecated `@supabase/auth-helpers-nextjs` package, rewrite it:

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { NextApiRequest, NextApiResponse } from 'next'

export function createClient({ req, res }: { req: NextApiRequest; res: NextApiResponse }) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies[name],
        set: (name: string, value: string, options: CookieOptions) => {
          res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`)
        },
        remove: (name: string, options: CookieOptions) => {
          res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0`)
        },
      },
    }
  )
}
```

**Dependencies:** IR01-002.

**Complexity:** Low.

**Acceptance criteria:**
- `createClient()` (browser) returns a Supabase client that can call `supabase.auth.getUser()` without throwing
- `createClient({ req, res })` (server) returns a Supabase client usable in API routes

---

### IR01-008 — Verify and update `middleware.ts`

**Description:** Confirm `middleware.ts` refreshes the Supabase session on every request. Add auth-based redirect rules: authenticated users visiting `/auth/login` or `/auth/signup` are redirected to `/dashboard`; unauthenticated users visiting `/dashboard`, `/history`, or `/decision/*` are redirected to `/auth/login?return=[original path]`.

**Files to modify:**
- `middleware.ts`

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: name => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({ name, value, ...options })
        },
        remove: (name, options) => {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const protectedPaths = ['/dashboard', '/history', '/decision']
  const authPaths = ['/auth/login', '/auth/signup']

  if (user && authPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!user && protectedPaths.some(p => pathname.startsWith(p))) {
    const returnUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(new URL(`/auth/login?return=${returnUrl}`, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

**Dependencies:** IR01-007.

**Complexity:** Medium.

**Acceptance criteria:**
- Unauthenticated request to `/dashboard` redirects to `/auth/login?return=%2Fdashboard`
- Authenticated request to `/auth/login` redirects to `/dashboard`
- Session cookie is refreshed on every request (verify via Supabase Dashboard → Auth → Users → last sign in updates)

---

### IR01-009 — Verify existing `AuthContext.tsx`

**Description:** Confirm `context/AuthContext.tsx` provides `user`, `session`, `loading`, and `signOut`. Confirm it wraps the app in `pages/_app.js`. If the context does not expose `signOut`, add it.

**Files to verify/modify:**
- `context/AuthContext.tsx`
- `pages/_app.js`

The context must export `useAuth` and an `AuthProvider`. Minimum required shape:

```typescript
interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}
```

**Dependencies:** IR01-007.

**Complexity:** Low.

**Acceptance criteria:**
- `useAuth().user` returns the authenticated user object after login
- `useAuth().loading` is `true` during session fetch, `false` thereafter
- `useAuth().signOut()` clears the session and redirects to `/`

---

### IR01-010 — Verify existing auth pages (`login.tsx`, `signup.tsx`)

**Description:** Confirm both pages exist, call the correct Supabase methods, and redirect correctly on success. Apply H08 design tokens (H08 Gap G16): add `<label>` elements, set input height to 44px, apply focus ring, display errors per H08 §12.

**Files to modify:**
- `pages/auth/login.tsx`
- `pages/auth/signup.tsx`

Both pages must:
1. Use `supabase.auth.signInWithPassword` (login) and `supabase.auth.signUp` (signup)
2. Set the `anon_decision_token` cookie from `localStorage` before submit (for anonymous Decision claim — H13 §2.1)
3. Redirect to `?return=` parameter value or `/dashboard` on success
4. Display errors below inputs using `--color-danger` (not hardcoded `red`)
5. Input height: `44px`. Button height: `48px`.

**Dependencies:** IR01-005, IR01-009.

**Complexity:** Medium.

**Acceptance criteria:**
- User can sign up with email + password and receive a confirmation email
- User can log in and is redirected to `/dashboard` (or `?return=` value)
- Error "Invalid login credentials" appears below the form in `--color-danger` color
- Tab through the form produces visible focus rings on all inputs and the button
- `anon_decision_token` cookie is set before the form submits (inspect Application → Cookies in DevTools)

---

### IR01-011 — Verify `pages/api/auth/callback.ts`

**Description:** Confirm the callback route exchanges the Supabase code for a session, reads the `anon_decision_token` cookie, claims any matching anonymous Decision Objects, clears the cookie, and redirects to `/dashboard` or the `?return=` value. Implement if missing or incomplete.

**Files to modify:**
- `pages/api/auth/callback.ts`

```typescript
// pages/api/auth/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const code = req.query.code as string | undefined
  const returnTo = (req.query.return as string) || '/dashboard'

  if (!code) {
    return void res.redirect('/auth/login?error=confirmation_failed')
  }

  const supabase = createClient({ req, res })
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return void res.redirect('/auth/login?error=confirmation_failed')
  }

  // Claim anonymous Decision Objects (H13 §2.1)
  const anonToken = req.cookies['anon_decision_token']
  if (anonToken) {
    await supabase
      .from('decisions')
      .update({ owner_id: data.user.id, anonymous_token: null, expires_at: null })
      .eq('anonymous_token', anonToken)
      .gt('expires_at', new Date().toISOString())

    res.setHeader('Set-Cookie', 'anon_decision_token=; Path=/; Max-Age=0')
  }

  return void res.redirect(returnTo)
}
```

**Dependencies:** IR01-007, IR01-010.

**Complexity:** Medium.

**Acceptance criteria:**
- Clicking the Supabase confirmation email link logs the user in and redirects to `/dashboard`
- An anonymous Decision Object created before signup appears in the user's account after confirmation
- Invalid or expired code redirects to `/auth/login?error=confirmation_failed`

---

### IR01-012 — Create `lib/stripe/stripe.client.ts`

**Description:** Initialise the Stripe Node.js client once at module scope so it is reused across warm serverless invocations (H09 §16.2). This file is imported by both billing API routes.

**Files to create:**
- `lib/stripe/stripe.client.ts`

```typescript
// lib/stripe/stripe.client.ts
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not configured')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})
```

**Dependencies:** IR01-002, IR01-003.

**Complexity:** Low.

**Acceptance criteria:**
- `import { stripe } from '@/lib/stripe/stripe.client'` resolves without errors
- `npm run build` passes
- The Stripe client is not re-instantiated on every API call (module-level singleton)

---

## Phase 2 — Database

**Objective:** Apply all SQL migrations to the production Supabase project, verify every table, index, RLS policy, trigger, and scheduled function defined in H12.

**Dependencies:** Phase 1 complete. Supabase project `avljmkkjonvfviyhebkv` accessible.

**Expected outputs:** All five tables exist with correct schemas, all RLS policies enabled, all indexes created, `updated_at` trigger active, anonymous Decision cleanup job scheduled.

**Migration files location:** `supabase/migrations/`

**Migration naming convention (H10 §9.2):** `YYYYMMDDHHMMSS_descriptive_name.sql`

---

### IR01-013 — Create migration: `subscriptions` table

**Description:** Write and apply the migration that creates the `subscriptions` table exactly as specified in H12 §4.

**Files to create:**
- `supabase/migrations/20260601000000_create_subscriptions.sql`

Migration content: the complete `CREATE TABLE`, `CHECK` constraints, `UNIQUE` constraint, FK reference to `auth.users`, `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`, the `subscriptions_select_own` policy, and the `idx_subscriptions_stripe_customer_id` index — all copied verbatim from H12 §4.2–4.4.

**Apply command:**
```bash
supabase db push --db-url <production-url>
```

**Dependencies:** IR01-002.

**Complexity:** Low.

**Acceptance criteria:**
- Table `public.subscriptions` visible in Supabase Dashboard → Table Editor
- Column `plan` accepts only `'free'`, `'pro'`, `'premium'` (verify via SQL: `INSERT INTO subscriptions (user_id, plan) VALUES (gen_random_uuid(), 'invalid')` must fail)
- RLS enabled: anon key cannot read another user's subscription

---

### IR01-014 — Create migration: `decisions` table

**Description:** Write and apply the migration that creates the `decisions` table exactly as specified in H12 §5.2.

**Files to create:**
- `supabase/migrations/20260610000000_create_decisions.sql`

Migration content: `CREATE TABLE` with all constraints including `decisions_owner_or_anonymous` CHECK constraint, `decisions_status_check`, `decisions_category_check`, FK to `auth.users` with `ON DELETE CASCADE`, `UNIQUE` on `anonymous_token`.

**Dependencies:** IR01-013.

**Complexity:** Medium.

**Acceptance criteria:**
- Table `public.decisions` visible in Supabase Dashboard
- `INSERT INTO decisions (owner_id, category, status) VALUES (gen_random_uuid(), 'invalid_cat', 'draft')` fails with CHECK violation
- Both `owner_id NOT NULL + anonymous_token NULL` and `owner_id NULL + anonymous_token NOT NULL + expires_at NOT NULL` pass; any other combination fails

---

### IR01-015 — Create migration: `decisions` RLS policies

**Description:** Apply all five RLS policies and enable RLS on the `decisions` table per H12 §5.5.

**Files to create:**
- `supabase/migrations/20260610000001_decisions_rls.sql`

Policies: `decisions_select_own`, `decisions_insert_own`, `decisions_insert_anonymous`, `decisions_update_own`, `decisions_delete_own` — all verbatim from H12 §5.5.

**Dependencies:** IR01-014.

**Complexity:** Medium.

**Acceptance criteria:**
- Using the anon key, a user cannot SELECT decisions owned by another user
- Using the anon key, a user can INSERT an anonymous decision (owner_id NULL, anonymous_token set)
- Using the anon key, a user cannot DELETE another user's decision

---

### IR01-016 — Create migration: `decisions` indexes and `updated_at` trigger

**Description:** Apply the three indexes on `decisions` and create the `updated_at` trigger function per H12 §5.4 and §5.7.

**Files to create:**
- `supabase/migrations/20260610000002_decisions_indexes_trigger.sql`

Indexes: `idx_decisions_owner_status`, `idx_decisions_owner_created`, `idx_decisions_expires_at`.

Trigger: `update_decisions_updated_at()` function and `decisions_updated_at_trigger` — verbatim from H12 §5.7.

**Dependencies:** IR01-015.

**Complexity:** Low.

**Acceptance criteria:**
- `EXPLAIN ANALYZE SELECT * FROM decisions WHERE owner_id = '...' AND status = 'draft'` shows `Index Scan` on `idx_decisions_owner_status`
- `UPDATE decisions SET title = 'test' WHERE id = '...'` automatically updates `updated_at` to current time

---

### IR01-017 — Create migration: `decision_components` table

**Description:** Write and apply the migration for the `decision_components` table per H12 §6.2.

**Files to create:**
- `supabase/migrations/20260610000003_create_decision_components.sql`

Must include: `CREATE TABLE` with `jsonb` content column, `component` CHECK constraint (all thirteen values), `version_positive` CHECK, FK to `decisions` with `ON DELETE CASCADE`, `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.

**Dependencies:** IR01-016.

**Complexity:** Medium.

**Acceptance criteria:**
- `INSERT INTO decision_components (decision_id, component, version, content) VALUES ('...', 'invalid_component', 1, '{}')` fails with CHECK violation
- `DELETE FROM decisions WHERE id = '...'` cascades to remove all related `decision_components` rows

---

### IR01-018 — Create migration: `decision_components` RLS, indexes

**Description:** Apply the three RLS policies and three indexes on `decision_components` per H12 §6.4–6.5.

**Files to create:**
- `supabase/migrations/20260610000004_decision_components_rls_indexes.sql`

Policies: `decision_components_select_own`, `decision_components_insert_own`, `decision_components_update_own`.

Indexes: `idx_decision_components_current` (partial, `is_current = true`), `idx_decision_components_history`, `idx_decision_components_prompt_version`.

**Dependencies:** IR01-017.

**Complexity:** Medium.

**Acceptance criteria:**
- `EXPLAIN ANALYZE SELECT * FROM decision_components WHERE decision_id = '...' AND is_current = true` uses `idx_decision_components_current`
- Anon key cannot select components for a decision owned by another user

---

### IR01-019 — Create migration: `decision_state_transitions` table

**Description:** Write and apply the migration for the `decision_state_transitions` table per H12 §7.2.

**Files to create:**
- `supabase/migrations/20260610000005_create_decision_state_transitions.sql`

Must include: `CREATE TABLE`, FK to `decisions` with `ON DELETE CASCADE`, `to_status` CHECK constraint (seven valid values), `trigger` CHECK constraint, RLS, `idx_decision_state_transitions_decision` index, `decision_state_transitions_select_own` policy.

**Dependencies:** IR01-016.

**Complexity:** Low.

**Acceptance criteria:**
- `INSERT INTO decision_state_transitions (decision_id, to_status, trigger) VALUES ('...', 'invalid_status', 'user_action')` fails with CHECK violation
- `INSERT INTO decision_state_transitions (decision_id, to_status, trigger) VALUES ('...', 'draft', 'invalid_trigger')` fails with CHECK violation

---

### IR01-020 — Create migration: `decision_chat_messages` table

**Description:** Write and apply the migration for the `decision_chat_messages` table per H12 §8.2.

**Files to create:**
- `supabase/migrations/20260610000006_create_decision_chat_messages.sql`

Must include: `CREATE TABLE`, FK to `decisions` with `ON DELETE CASCADE`, `role` CHECK constraint (`'user'`, `'assistant'`), RLS, `idx_decision_chat_messages_decision_order` index, `decision_chat_messages_select_own` and `decision_chat_messages_insert_own` policies.

**Dependencies:** IR01-016.

**Complexity:** Low.

**Acceptance criteria:**
- `INSERT INTO decision_chat_messages (decision_id, role, content) VALUES ('...', 'system', 'hello')` fails with CHECK violation
- `DELETE FROM decisions WHERE id = '...'` cascades to remove all chat messages for that decision

---

### IR01-021 — Create `insert_chat_exchange` database function

**Description:** Create a PostgreSQL function that inserts both the user message and AI response in a single transaction. This is the atomic pair insertion required by H13 §3.6 and FR-07.7.

**Files to create:**
- `supabase/migrations/20260610000007_create_insert_chat_exchange.sql`

```sql
CREATE OR REPLACE FUNCTION public.insert_chat_exchange(
  p_decision_id uuid,
  p_user_content text,
  p_assistant_content text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.decision_chat_messages (decision_id, role, content)
  VALUES (p_decision_id, 'user', p_user_content);

  INSERT INTO public.decision_chat_messages (decision_id, role, content)
  VALUES (p_decision_id, 'assistant', p_assistant_content);
END;
$$;
```

**Dependencies:** IR01-020.

**Complexity:** Low.

**Acceptance criteria:**
- Calling `supabase.rpc('insert_chat_exchange', {...})` inserts exactly two rows atomically
- If either insert fails, neither row is committed (verify by triggering a constraint violation on the second insert)

---

### IR01-022 — Create `updated_at` trigger for `decisions`

**Description:** This trigger was included in IR01-016. This task verifies it is active and correctly updating `decisions.updated_at` when any child `decision_components` row is saved via the API (the API route also calls `UPDATE decisions SET updated_at = now()` explicitly, so the trigger is a safety net). Run the verification query.

**Verification:**
```sql
-- Should return current timestamp after UPDATE
UPDATE decisions SET title = 'verification test' WHERE id = '<test-id>';
SELECT updated_at FROM decisions WHERE id = '<test-id>';
```

**Dependencies:** IR01-016.

**Complexity:** Low.

**Acceptance criteria:**
- `updated_at` changes on every UPDATE to a `decisions` row
- Trigger is visible in Supabase Dashboard → Database → Functions

---

### IR01-023 — Create anonymous Decision cleanup scheduled function

**Description:** Create a pg_cron job that runs every 6 hours and deletes expired anonymous Decision Objects per H12 §10.1 (FR-01.5, BR-04).

**Files to create:**
- `supabase/migrations/20260615000000_create_anonymous_cleanup_cron.sql`

```sql
-- Enable pg_cron extension (run once)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule anonymous Decision cleanup every 6 hours
SELECT cron.schedule(
  'cleanup-expired-anonymous-decisions',
  '0 */6 * * *',
  $$
  DELETE FROM public.decisions
  WHERE owner_id IS NULL
    AND expires_at < now();
  $$
);
```

**Note:** pg_cron must be enabled in Supabase Dashboard → Database → Extensions before this migration runs.

**Dependencies:** IR01-015.

**Complexity:** Low.

**Acceptance criteria:**
- Job visible in Supabase Dashboard → Database → Cron Jobs
- After manual test insert of an anonymous decision with `expires_at = now() - interval '1 minute'`, next cron run removes it (or verify by calling the SQL manually)

---

### IR01-024 — Create stuck `in_analysis` cleanup scheduled function

**Description:** Create a pg_cron job that runs every 5 minutes and reverts any Decision stuck in `in_analysis` for more than 5 minutes to `draft`, per FR-06.3 and H13 §3.4.

**Files to create:**
- `supabase/migrations/20260615000001_create_stuck_analysis_cleanup_cron.sql`

```sql
SELECT cron.schedule(
  'revert-stuck-in-analysis-decisions',
  '*/5 * * * *',
  $$
  UPDATE public.decisions
  SET status = 'draft', updated_at = now()
  WHERE status = 'in_analysis'
    AND updated_at < now() - interval '5 minutes';

  INSERT INTO public.decision_state_transitions (decision_id, from_status, to_status, trigger)
  SELECT id, 'in_analysis', 'draft', 'system_event'
  FROM public.decisions
  WHERE status = 'draft'
    AND updated_at > now() - interval '10 seconds';
  $$
);
```

**Dependencies:** IR01-016, IR01-023.

**Complexity:** Medium.

**Acceptance criteria:**
- A Decision manually set to `in_analysis` with `updated_at = now() - interval '6 minutes'` is reverted to `draft` within 5 minutes
- A `decision_state_transitions` row is inserted for the reversion with `trigger = 'system_event'`

---

### IR01-025 — Verify `subscriptions` table has existing data integrity

**Description:** Run verification queries to confirm the `subscriptions` table is consistent with Stripe data. Confirm existing Pro and Premium subscribers have correct `plan` values. This is a data audit, not a schema change.

**Verification queries:**
```sql
-- Check plan distribution
SELECT plan, count(*) FROM subscriptions GROUP BY plan;

-- Check for orphaned subscriptions (no matching auth.users row)
SELECT s.* FROM subscriptions s
LEFT JOIN auth.users u ON u.id = s.user_id
WHERE u.id IS NULL;

-- Check for duplicate user_id (should be 0 — UNIQUE constraint enforces this)
SELECT user_id, count(*) FROM subscriptions GROUP BY user_id HAVING count(*) > 1;
```

**Dependencies:** IR01-013.

**Complexity:** Low.

**Acceptance criteria:**
- Zero orphaned subscription rows
- Zero duplicate `user_id` rows
- All `plan` values are `'free'`, `'pro'`, or `'premium'`

---

### IR01-026 — Run full database verification

**Description:** Execute the full database acceptance criteria checklist from H09 TAC-02 against the production Supabase project.

**Checklist (H09 TAC-02):**
- [ ] RLS enabled on all five user-data tables
- [ ] Anon key cannot read another user's Decision Objects
- [ ] `ON DELETE CASCADE` verified: deleting a `decisions` row removes all child rows
- [ ] Anonymous Decision Objects deleted after 48h (verify cron job)
- [ ] All indexes exist and are used by the query planner (`EXPLAIN ANALYZE`)

**Dependencies:** IR01-013 through IR01-025.

**Complexity:** Medium.

**Acceptance criteria:** All items in the checklist above pass. Proceed to Phase 3 only after all pass.

---

## Phase 3 — API Layer

**Objective:** Implement all twelve API endpoints defined in H13, in dependency order. Each endpoint is fully implemented and manually tested before moving to the next.

**Dependencies:** Phase 2 complete. All database tables exist.

**Conventions for all API routes (H10 §5.2, H13 §1.5):**
1. Method guard → 405
2. Auth check → 401
3. Input validation → 400
4. Ownership verify → 404
5. Business logic in try/catch
6. Return JSON — never HTML

---

### IR01-027 — Create `core/decision/Decision.constants.ts`

**Description:** Create the Decision Status and Category constants file. These are used by every API route and must exist before any route implementation begins.

**Files to create:**
- `core/decision/Decision.constants.ts`

```typescript
// core/decision/Decision.constants.ts
export const DecisionStatus = {
  DRAFT:            'draft',
  IN_ANALYSIS:      'in_analysis',
  WAITING_FOR_USER: 'waiting_for_user',
  DECISION_MADE:    'decision_made',
  EXECUTING:        'executing',
  COMPLETED:        'completed',
  ARCHIVED:         'archived',
} as const

export type DecisionStatus = typeof DecisionStatus[keyof typeof DecisionStatus]

export const DecisionCategory = {
  FINANCIAL:   'financial',
  TECHNOLOGY:  'technology',
  HEALTH:      'health',
  TRAVEL:      'travel',
  CAREER:      'career',
  INSURANCE:   'insurance',
  HOME:        'home',
  EDUCATION:   'education',
  LIFESTYLE:   'lifestyle',
} as const

export type DecisionCategory = typeof DecisionCategory[keyof typeof DecisionCategory]

export const CLIENT_WRITABLE_COMPONENTS = [
  '0_identity', '1_context', '2_goal', '3_constraints', '4_alternatives',
  '8_final_decision', '10_outcome', '11_reflection', '12_lessons_learned',
] as const

export const SERVER_GENERATED_COMPONENTS = [
  '5_ai_analysis', '6_risks', '7_recommendation', '9_action_plan',
] as const

export const ALL_COMPONENTS = [
  ...CLIENT_WRITABLE_COMPONENTS,
  ...SERVER_GENERATED_COMPONENTS,
] as const

export type ComponentName = typeof ALL_COMPONENTS[number]

export const VALID_USER_TRANSITIONS: Record<string, string[]> = {
  waiting_for_user: ['draft', 'decision_made'],
  decision_made:    ['executing'],
  executing:        ['completed'],
  completed:        ['archived'],
  draft:            ['archived'],
  in_analysis:      ['archived'],
  waiting_for_user_archived: ['archived'],
}

// Any state → archived is always valid
export function isValidUserTransition(from: string, to: string): boolean {
  if (to === 'archived') return true
  return VALID_USER_TRANSITIONS[from]?.includes(to) ?? false
}
```

**Dependencies:** IR01-003.

**Complexity:** Low.

**Acceptance criteria:**
- `DecisionStatus.DRAFT` equals `'draft'`
- `isValidUserTransition('waiting_for_user', 'draft')` returns `true`
- `isValidUserTransition('completed', 'draft')` returns `false`

---

### IR01-028 — Create `core/decision/Decision.types.ts`

**Description:** Create the TypeScript type definitions for the Decision Object and all its component shapes. These types are the contract between API routes, context, and AI engines.

**Files to create:**
- `core/decision/Decision.types.ts`

Key types to define (shapes sourced from H12 §6.7):

```typescript
// core/decision/Decision.types.ts
import type { DecisionStatus, DecisionCategory, ComponentName } from './Decision.constants'

export interface DecisionRow {
  id: string
  owner_id: string | null
  anonymous_token: string | null
  category: DecisionCategory
  status: DecisionStatus
  title: string | null
  created_at: string
  updated_at: string
  expires_at: string | null
}

export interface ComponentRow {
  id: string
  decision_id: string
  component: ComponentName
  version: number
  content: unknown
  is_current: boolean
  created_at: string
  prompt_version: string | null
}

export interface ContextContent {
  background: string
  current_situation: string
  prior_attempts: string | null
  timing_constraints: string | null
  geographic_market: string
  currency: string
}

export interface GoalContent {
  primary: string
  success_criteria: string | null
  time_horizon: string | null
  secondary_goals: string[]
}

export interface ConstraintItem {
  type: 'budget' | 'time' | 'geographic' | 'personal' | 'legal' | 'other'
  description: string
  value: string | null
  unit: string | null
}

export interface ConstraintsContent {
  hard: ConstraintItem[]
  soft: ConstraintItem[]
}

export interface AlternativeItem {
  id: string
  name: string
  source: 'user_provided' | 'ai_suggested' | 'do_nothing'
  user_notes: string | null
  attributes: Record<string, unknown>
}

export interface AlternativesContent {
  alternatives: AlternativeItem[]
  do_nothing_included: boolean
}

export interface FinalDecisionContent {
  chosen_alternative_id: string
  chosen_alternative_name: string
  matches_recommendation: boolean
  divergence_reason: string | null
  confidence: 'confident' | 'uncertain' | 'reluctant'
  recorded_at: string
}

export interface DecisionObject extends DecisionRow {
  components: Partial<Record<ComponentName, { version: number; content: unknown; updated_at: string; prompt_version?: string }>>
  state_transitions: Array<{ from_status: string | null; to_status: string; trigger: string; created_at: string }>
}
```

**Dependencies:** IR01-027.

**Complexity:** Medium.

**Acceptance criteria:**
- `import type { DecisionObject } from '@/core/decision/Decision.types'` resolves
- `npm run build` passes with this file present

---

### IR01-029 — Create `core/decision/Decision.utils.ts` and tests

**Description:** Create pure utility functions for the Decision domain. These are the first functions with mandatory unit tests (H10 §11.3).

**Files to create:**
- `core/decision/Decision.utils.ts`
- `core/decision/Decision.utils.test.ts`

```typescript
// core/decision/Decision.utils.ts
import { isValidUserTransition } from './Decision.constants'
import type { AlternativesContent } from './Decision.types'

export function validateStateTransition(from: string, to: string): boolean {
  return isValidUserTransition(from, to)
}

export function hasMinimumAlternatives(content: AlternativesContent, min = 2): boolean {
  return Array.isArray(content.alternatives) && content.alternatives.length >= min
}

export function isClientWritable(component: string): boolean {
  const CLIENT = ['0_identity','1_context','2_goal','3_constraints','4_alternatives',
                  '8_final_decision','10_outcome','11_reflection','12_lessons_learned']
  return CLIENT.includes(component)
}

export function isServerGenerated(component: string): boolean {
  return ['5_ai_analysis','6_risks','7_recommendation','9_action_plan'].includes(component)
}
```

Test file covers: all valid transitions, all invalid transitions, minimum alternatives check (edge: exactly 2, exactly 1, zero), client-writable and server-generated checks.

**Dependencies:** IR01-027, IR01-028, IR01-004.

**Complexity:** Low.

**Acceptance criteria:**
- `npm test` passes
- `npm run test:coverage` shows ≥ 80% coverage for `core/decision/Decision.utils.ts`

---

### IR01-030 — Implement `POST /api/decision/create`

**Description:** Implement the Decision creation endpoint per H13 §3.1. Handles both authenticated and anonymous users.

**Files to create:**
- `pages/api/decision/create.ts`

Key implementation points:
- Method guard: POST only
- Validate `category` against `DecisionCategory` values
- Authenticated: check `< 100 non-archived decisions` before insert (FR-09.7)
- Anonymous: generate UUID token, insert with `expires_at = now() + interval '48 hours'`
- Insert initial `decision_state_transitions` row: `from_status=NULL, to_status='draft', trigger='user_action'`
- Return `201` with decision object (and `anonymous_token` for anonymous users)

**Dependencies:** IR01-027, IR01-028, IR01-014, IR01-015.

**Complexity:** Medium.

**Acceptance criteria:**
- POST with valid category returns `201` and a decision `id`
- POST with invalid category returns `400 "Invalid category: [value]"`
- POST as authenticated user at 100 non-archived decisions returns `409`
- POST without auth returns `201` with `anonymous_token` in response body

---

### IR01-031 — Implement `GET /api/decision/[id]`

**Description:** Implement the Decision fetch endpoint per H13 §3.2. Returns the full Decision Object with all current components and state transitions.

**Files to create:**
- `pages/api/decision/[id].ts` (handle both GET and DELETE by method check)

Key implementation points:
- If no session and no `anonymous_token` query param → `401`
- Fetch by `owner_id` (authenticated) or `anonymous_token` (anonymous)
- Fetch all components where `is_current = true`
- Fetch all state transitions ordered by `created_at asc`
- If `include_history=true`: fetch all versions per component
- Return assembled `DecisionObject`

**Dependencies:** IR01-028, IR01-030.

**Complexity:** Medium.

**Acceptance criteria:**
- GET returns `200` with `components` object and `state_transitions` array
- GET with valid `anonymous_token` returns the anonymous decision
- GET for another user's decision returns `404`
- GET with `include_history=true` includes `history` arrays on each component

---

### IR01-032 — Implement `DELETE /api/decision/[id]`

**Description:** Implement the Decision deletion endpoint per H13 §3.9 in the same file as IR01-031 (method routing within `pages/api/decision/[id].ts`).

Key implementation points:
- Method guard: DELETE only (combined with GET in the same file via method switch)
- Auth required
- Verify ownership → `404`
- `DELETE FROM decisions WHERE id = $id AND owner_id = $userId`
- Cascade removes all child rows automatically
- Return `204`

**Dependencies:** IR01-031.

**Complexity:** Low.

**Acceptance criteria:**
- DELETE returns `204` and removes the decision and all child rows
- DELETE for another user's decision returns `404`
- Subsequent GET for the deleted decision returns `404`

---

### IR01-033 — Implement `POST /api/decision/save`

**Description:** Implement the component save endpoint per H13 §3.3. Implements the append-only upsert pattern.

**Files to create:**
- `pages/api/decision/save.ts`

Key implementation points:
- Validate `component` is in `CLIENT_WRITABLE_COMPONENTS` → `400`
- If `component` is in `SERVER_GENERATED_COMPONENTS` → `400` with specific message
- Validate `content` schema (basic: must be a non-null object)
- BEGIN TRANSACTION:
  1. `UPDATE decision_components SET is_current = false WHERE decision_id = $id AND component = $component AND is_current = true`
  2. Fetch `max(version)` for `(decision_id, component)`
  3. `INSERT INTO decision_components (..., version = maxVersion + 1, is_current = true)`
  4. `UPDATE decisions SET updated_at = now() WHERE id = $decision_id`
- Return `200` with the new component row

**Dependencies:** IR01-029, IR01-030, IR01-017, IR01-018.

**Complexity:** Medium.

**Acceptance criteria:**
- POST saves a component and returns `200` with `version: 1`
- POST again for the same component returns `version: 2`; previous row has `is_current = false`
- POST with `component = '5_ai_analysis'` returns `400 "Component 5_ai_analysis is server-generated..."`
- POST with missing `decision_id` returns `400 "decision_id is required"`

---

### IR01-034 — Implement `POST /api/decision/state`

**Description:** Implement the state transition endpoint per H13 §3.5. Validates transitions, enforces the `8_final_decision` pre-condition for `decision_made`, and triggers Action Plan generation (implemented in Phase 4 — stub for now).

**Files to create:**
- `pages/api/decision/state.ts`

Key implementation points:
- Validate `to_status` is user-initiatable (not `'in_analysis'` or `'waiting_for_user'`)
- Fetch current status from DB
- Call `validateStateTransition(current, to)` from `Decision.utils.ts`
- If `to_status = 'decision_made'`: verify `8_final_decision` component exists and `is_current = true` → `409` if absent
- BEGIN TRANSACTION: UPDATE decision status + INSERT state transition
- If `to_status = 'decision_made'`: call Action Plan Engine (Phase 4 stub: return `action_plan: null` for now)
- Return `200` with decision + transition + action_plan

**Dependencies:** IR01-029, IR01-031, IR01-033.

**Complexity:** Medium.

**Acceptance criteria:**
- POST `to_status = 'archived'` transitions from any state
- POST `to_status = 'decision_made'` without component 8 returns `409`
- POST `to_status = 'decision_made'` with component 8 returns `200` with `action_plan: null` (stub)
- POST invalid transition (e.g., `completed → draft`) returns `409 "Invalid state transition: completed → draft"`

---

### IR01-035 — Implement `GET /api/decision/history`

**Description:** Implement the Decision history endpoint per H13 §3.8. Enforces Free tier 10-item cap.

**Files to create:**
- `pages/api/decision/history.ts`

Key implementation points:
- Resolve user plan from `subscriptions` table (default `'free'`)
- Free tier: fetch 10 most recent by `created_at desc`, compute `plan_limit = (total > 10)`
- Pro/Premium: apply `status`, `category`, `created_from`, `created_to` filters; paginate
- Fetch summary data in a single query using `IN (decision_id_list)`
- `title` from `decisions.title` column
- `has_recommendation` from presence of `is_current = true` component `7_recommendation`
- `outcome_satisfaction` from `(10_outcome).content->>'satisfaction_rating'`
- Return with `plan_limit` field always present

**Dependencies:** IR01-031, IR01-013.

**Complexity:** Medium.

**Acceptance criteria:**
- Free user with 15 decisions receives 10 results and `plan_limit: true`
- Pro user with 15 decisions receives up to 20 results and `plan_limit: false`
- `?created_from=2026-01-01T00:00:00Z` filters correctly
- `?status=completed` returns only completed decisions
- Empty result set returns `{ decisions: [], total: 0, plan_limit: false }`

---

### IR01-036 — Implement `POST /api/billing/checkout`

**Description:** Implement the Stripe Checkout session creation endpoint per H13 §4.1.

**Files to create:**
- `pages/api/billing/checkout.ts`

Key implementation points:
- Validate `plan` is `'pro'` or `'premium'`
- Call `supabase.auth.getUser()` server-side to get `userId` (null if unauthenticated)
- Select Price ID from env vars
- Create Stripe Checkout session with `metadata: { user_id: userId ?? '', plan }`
- Return `{ url: session.url }`

**Files to modify:**
- `pages/api/create-checkout.js` — add `// @deprecated — use /api/billing/checkout` comment

**Dependencies:** IR01-012, IR01-007.

**Complexity:** Low.

**Acceptance criteria:**
- POST `{ plan: 'pro' }` returns `200` with a valid `url` starting with `https://checkout.stripe.com`
- POST `{ plan: 'invalid' }` returns `400`
- The Stripe Checkout session contains `metadata.user_id` when called by an authenticated user
- `metadata.user_id` is empty string when called without a session

---

### IR01-037 — Implement `POST /api/billing/webhook`

**Description:** Implement the Stripe webhook endpoint per H13 §4.2. Migrate from the existing `pages/api/webhook.js`.

**Files to create:**
- `pages/api/billing/webhook.ts`

```typescript
export const config = { api: { bodyParser: false } }
```

Key implementation points:
- Read raw body from request stream
- `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)` → `400` if invalid
- Handle `checkout.session.completed`: upsert `subscriptions` if `metadata.user_id` is non-empty
- Handle `customer.subscription.deleted`: update plan to `'free'` by `stripe_customer_id`
- Return `200 { received: true }` on success

**Files to modify:**
- `pages/api/webhook.js` — add `// @deprecated` comment

**Dependencies:** IR01-012, IR01-013.

**Complexity:** Medium.

**Acceptance criteria:**
- Stripe CLI `stripe trigger checkout.session.completed` updates the `subscriptions` table
- Request with invalid signature returns `400` with empty body
- Request processed twice produces the same result (idempotency)
- `bodyParser: false` is set (verify by checking that raw body is available)

---

### IR01-038 — Implement `POST /api/decision/chat` (stub)

**Description:** Implement the chat endpoint structure per H13 §3.6, with the AI call stubbed. The stub returns a static response to allow frontend integration in Phase 5 before the AI engine is ready in Phase 4.

**Files to create:**
- `pages/api/decision/chat.ts`

Key implementation points:
- Method guard, auth check
- Verify user plan is Pro or Premium → `403`
- Verify decision state is `draft`, `waiting_for_user`, or `decision_made` → `409`
- Sanitize message
- **Stub AI call:** return a fixed response string
- Insert both messages atomically via `supabase.rpc('insert_chat_exchange', ...)`
- Return response with `material_change_detected: false`

**Dependencies:** IR01-021, IR01-031.

**Complexity:** Medium.

**Acceptance criteria:**
- Free tier user receives `403`
- Decision in `completed` state receives `409`
- Pro user on valid decision receives `200` with stub response
- Both messages appear in `decision_chat_messages`
- Failed DB insert stores neither message

---

### IR01-039 — Implement `GET /api/decision/chat/[id]`

**Description:** Implement the chat history endpoint per H13 §3.7.

**Files to create:**
- `pages/api/decision/chat/[id].ts`

Key implementation points:
- Auth required, ownership check → `404`
- `SELECT * FROM decision_chat_messages WHERE decision_id = $id ORDER BY created_at ASC LIMIT $limit`
- Support `before` cursor for pagination (messages older than message with that ID)
- Return `{ messages, total, has_more }`

**Dependencies:** IR01-038.

**Complexity:** Low.

**Acceptance criteria:**
- GET returns messages in chronological order
- `limit=2` returns 2 messages and `has_more: true` when more exist
- Returns `404` for another user's decision chat

---

### IR01-040 — Phase 3 API verification

**Description:** Run the complete API acceptance criteria from H13 §8 manually, using curl or a REST client (e.g., Insomnia or Postman). Document results. All criteria must pass before Phase 4 begins.

**H13 §8 checklist:**
- [ ] Every endpoint returns `405` for wrong methods
- [ ] Every protected endpoint returns `401` for missing session
- [ ] `DELETE /api/decision/[id]` returns `404` for another user's decision
- [ ] `POST /api/billing/webhook` returns `400` for invalid signature
- [ ] `POST /api/decision/save` with `5_ai_analysis` returns `400` with specific message
- [ ] `POST /api/decision/state` returns `409` for `completed → draft`
- [ ] `POST /api/decision/state` without component 8 returns `409`
- [ ] Free tier user on chat returns `403`
- [ ] History for Free user with >10 decisions returns 10 items and `plan_limit: true`
- [ ] `GET /api/decision/history` returns `[]` not `404` for user with no decisions

**Dependencies:** IR01-030 through IR01-039.

**Complexity:** Medium.

**Acceptance criteria:** All ten checklist items above pass. Zero endpoints return HTML error pages. Zero endpoints expose stack traces.

---

## Phase 4 — AI Integration

**Objective:** Implement all AI engines, prompt builders, input sanitization, output validation, and failure handling. Replace Phase 3 stubs with real AI calls.

**Dependencies:** Phase 3 complete. `ANTHROPIC_API_KEY` confirmed working.

**Reference documents:** H11 (AI System Specification), H13 §3.4 (analyze endpoint), H13 §3.5 (state endpoint — Action Plan).

---

### IR01-041 — Create `core/ai/sanitize.ts` and tests

**Description:** Implement the `sanitizeForPrompt` function per H11 §10.2. This must exist before any prompt builder injects user content.

**Files to create:**
- `core/ai/sanitize.ts`
- `core/ai/sanitize.test.ts`

```typescript
// core/ai/sanitize.ts
export function sanitizeForPrompt(input: string): string {
  return input
    .replace(/\[INST\]/gi, '[INST_REMOVED]')
    .replace(/\[\/INST\]/gi, '[/INST_REMOVED]')
    .replace(/###\s*(System|Human|Assistant|User):/gi, '[ROLE_REMOVED]:')
    .replace(/<\|im_start\|>/gi, '[TOKEN_REMOVED]')
    .replace(/<\|im_end\|>/gi, '[TOKEN_REMOVED]')
    .replace(/ignore (previous|all|above) instructions?/gi, '[INSTRUCTION_REMOVED]')
    .replace(/disregard (previous|all|above)/gi, '[INSTRUCTION_REMOVED]')
    .replace(/new instruction:/gi, '[INSTRUCTION_REMOVED]:')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
```

Test file: covers each injection pattern, normal text passthrough, whitespace normalisation, empty string input.

**Dependencies:** IR01-004.

**Complexity:** Low.

**Acceptance criteria:**
- `npm test` passes
- `sanitizeForPrompt('[INST]ignore previous instructions[/INST]')` contains no executable injection markers

---

### IR01-042 — Create base AI call function

**Description:** Implement the reusable HTTP fetch wrapper for the Anthropic API per H09 §7. Includes the 29-second timeout race and JSON response cleaning.

**Files to create:**
- `core/ai/call.ts`

```typescript
// core/ai/call.ts
export interface AICallParams {
  system: string
  user: string
  maxTokens: number
}

export interface AICallResult {
  text: string
  inputTokens: number
  outputTokens: number
}

function cleanJSON(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

export async function callAI(params: AICallParams): Promise<AICallResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('AI_TIMEOUT')), 29000)
  )

  const fetchCall = fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: params.maxTokens,
      system: params.system,
      messages: [{ role: 'user', content: params.user }],
    }),
  }).then(async res => {
    const data = await res.json()
    if (data.type === 'error' || data.error) {
      throw new Error(data.error?.message ?? 'Anthropic API error')
    }
    const text = (data.content as Array<{ text?: string }>)
      .map(b => b.text ?? '').join('')
    return {
      text: cleanJSON(text),
      inputTokens: data.usage?.input_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? 0,
    }
  })

  return Promise.race([fetchCall, timeout])
}

export function parseAIJSON<T>(raw: string): T {
  if (!raw.startsWith('{') && !raw.startsWith('[')) {
    throw new Error('AI_RESPONSE_NOT_JSON')
  }
  return JSON.parse(raw) as T
}
```

**Dependencies:** IR01-002.

**Complexity:** Medium.

**Acceptance criteria:**
- `callAI` throws `AI_TIMEOUT` after 29 seconds (verify with a mock that delays response)
- `parseAIJSON` throws `AI_RESPONSE_NOT_JSON` when given prose output
- Real call to Anthropic API with a simple prompt returns a result within 10 seconds

---

### IR01-043 — Create `core/ai/prompts.ts` — version constants and interfaces

**Description:** Create the prompt file skeleton with version constants and all TypeScript interfaces. Prompt template strings are added in subsequent tasks.

**Files to create:**
- `core/ai/prompts.ts`

```typescript
// core/ai/prompts.ts
export const PROMPT_VERSIONS = {
  interview_suggestions: 'interview-suggestions-v1.0',
  interview_conflict:    'interview-conflict-v1.0',
  analysis:              'analysis-v1.0',
  recommendation:        'recommendation-v1.0',
  action_plan:           'action-plan-v1.0',
  chat:                  'chat-v1.0',
} as const

export type PromptVersionKey = keyof typeof PROMPT_VERSIONS
export type PromptVersionString = typeof PROMPT_VERSIONS[PromptVersionKey]

export interface PromptPair {
  system: string
  user: string
  version: PromptVersionString
}
```

Input interfaces (`DecisionAnalysisInput`, `RecommendationInput`, `ActionPlanInput`, `SuggestionInput`, `ConflictInput`) are derived from H12 §6.7 component schemas and H11 §5.2.

**Dependencies:** IR01-028, IR01-041.

**Complexity:** Medium.

**Acceptance criteria:**
- `PROMPT_VERSIONS.analysis` equals `'analysis-v1.0'`
- All input interfaces compile without errors

---

### IR01-044 — Implement `buildAnalysisPrompt` in `core/ai/prompts.ts`

**Description:** Implement the Analysis Engine prompt builder per H11 §9.1 (Analysis Prompt Template v1.0). Inject category-specific rules and required disclaimers.

**Files to modify:**
- `core/ai/prompts.ts`

Key implementation:
- Category-specific rules for `financial`, `health`, `insurance`, `legal` per H11 §5.3
- Professional disclaimer strings are constants (verbatim from H11 §8.3)
- All user text fields pass through `sanitizeForPrompt` before injection
- Output schema spec included in system prompt: instructs model to respond with valid JSON only

**Dependencies:** IR01-041, IR01-043.

**Complexity:** High.

**Acceptance criteria:**
- `buildAnalysisPrompt(input)` returns a `PromptPair` with non-empty `system` and `user` strings
- Financial category prompt contains `market_data_caveat` instruction
- Health category prompt contains the exact disclaimer string from H11 §8.3
- No user text appears in the prompt without passing through `sanitizeForPrompt`

---

### IR01-045 — Implement `validateAnalysisOutput` in `core/ai/`

**Description:** Implement the Analysis output validation function per H11 §5.5. This is a pure function — independently testable.

**Files to create:**
- `core/ai/validate.ts`
- `core/ai/validate.test.ts`

```typescript
// core/ai/validate.ts
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateAnalysisOutput(output: unknown, alternativeIds: string[]): ValidationResult {
  const errors: string[] = []
  // Per H11 §5.5 and guardrails H11 §12.2:
  // 1. Every alternative must have an entry
  // 2. Minimum 2 pros per alternative
  // 3. Minimum 2 cons per alternative
  // 4. Minimum 1 risk per alternative
  // 5. All AnalysisPoints must have specific_to_user: true
  // 6. hard_constraints_satisfied = false requires non-empty violations array
  // ... full implementation per H11 §5.5
  return { valid: errors.length === 0, errors }
}

export function validateRecommendationOutput(output: unknown, analysis: unknown): ValidationResult {
  const errors: string[] = []
  // Per H11 §6.5:
  // 1. recommended_alternative must not have hard_constraints_satisfied = false
  // 2. primary_reasoning must be ≥ 50 chars
  // 3. conditions_for_change must be non-empty
  // 4. honest_tradeoffs must be non-empty
  return { valid: errors.length === 0, errors }
}
```

Test file: fixture-based tests — valid output passes, output with generic `specific_to_user: false` fails, output with hard constraint violation in recommendation fails.

**Dependencies:** IR01-043, IR01-004.

**Complexity:** High.

**Acceptance criteria:**
- `npm test` passes
- `validateAnalysisOutput` correctly rejects output with `specific_to_user: false`
- `validateRecommendationOutput` correctly rejects a recommendation for an alternative with `hard_constraints_satisfied: false`

---

### IR01-046 — Implement `buildRecommendationPrompt` in `core/ai/prompts.ts`

**Description:** Implement the Recommendation Engine prompt builder per H11 §9.2 (Recommendation Prompt Template v1.0).

**Files to modify:**
- `core/ai/prompts.ts`

Key points:
- Takes the `AnalysisOutput` as input (the full `per_alternative` array)
- System prompt includes the five Recommendation Contract terms (H11 §12.1)
- Hard constraint enforcement rule stated explicitly in the prompt
- Output schema requires `conditions_for_change`, `honest_tradeoffs`, `confidence_level`, `confidence_rationale`, `recommendation_available: true`

**Dependencies:** IR01-044.

**Complexity:** High.

**Acceptance criteria:**
- `buildRecommendationPrompt(input)` returns a valid `PromptPair`
- System prompt contains the phrase "NEVER recommend an alternative that has hard_constraints_satisfied = false"

---

### IR01-047 — Implement `buildActionPlanPrompt` in `core/ai/prompts.ts`

**Description:** Implement the Action Plan Engine prompt builder per H11 §9.3 (Action Plan Prompt Template v1.0).

**Files to modify:**
- `core/ai/prompts.ts`

Key points:
- Input: category, chosen alternative (from component 8, not component 7 — per BR-03), context summary, goal, constraints
- System prompt enforces 3–5 action items, each specific to the chosen alternative
- Items sequenced by logical dependency
- Output schema per H12 §6.7 component 9

**Dependencies:** IR01-044.

**Complexity:** Medium.

**Acceptance criteria:**
- `buildActionPlanPrompt(input)` returns a valid `PromptPair`
- System prompt references the chosen alternative, not the recommended alternative
- Output schema requires `action_items` array with 3–5 items

---

### IR01-048 — Implement `buildChatSystemPrompt` in `core/ai/prompts.ts`

**Description:** Implement the Chat Engine system prompt builder per H11 §7.2.

**Files to modify:**
- `core/ai/prompts.ts`

Key points:
- Takes the full `DecisionObject` as input
- Injects all populated components: context, goal, constraints, alternatives, current recommendation
- States the Chat Engine rules (H11 §7.2 system prompt verbatim)
- Components that are absent are noted as "Not yet provided"
- All user content passes through `sanitizeForPrompt`

**Dependencies:** IR01-041, IR01-043.

**Complexity:** Medium.

**Acceptance criteria:**
- `buildChatSystemPrompt(decision)` returns a non-empty string
- Absent components produce "Not yet provided" text, not `undefined` or errors
- User content in the decision is sanitized before inclusion

---

### IR01-049 — Implement `POST /api/decision/analyze` — full implementation

**Description:** Replace the Phase 3 stub with the full AI analysis implementation per H13 §3.4 and H11 §5 and §6.

**Files to modify:**
- `pages/api/decision/analyze.ts`

Full processing flow (H13 §3.4 steps 1–16):
1. Verify ownership, state = `draft`, minimum 2 alternatives
2. Transition to `in_analysis`
3. Load all current components
4. Build `DecisionAnalysisInput`
5. Call Analysis Engine via `callAI` (29s timeout)
6. On fail: revert to `draft`, return `503`
7. `validateAnalysisOutput` → regenerate once if invalid → revert and `503` if still invalid
8. Store `5_ai_analysis` and `6_risks` via save pattern
9. Call Recommendation Engine
10. On fail: transition to `waiting_for_user` with `recommendation_available: false`, return `200`
11. `validateRecommendationOutput` → regenerate once → same partial success if still invalid
12. Store `7_recommendation`
13. Transition to `waiting_for_user`
14. Return `{ recommendation, analysis_confidence, decision_status, recommendation_available: true }`

**Dependencies:** IR01-042, IR01-044, IR01-045, IR01-046, IR01-033, IR01-034.

**Complexity:** High.

**Acceptance criteria:**
- Full analysis of a 2-alternative Financial decision completes within 30 seconds
- `5_ai_analysis`, `6_risks`, and `7_recommendation` components are stored after successful run
- Decision transitions to `waiting_for_user` after success
- Timeout causes Decision to revert to `draft` (verify by inspecting decision status after mock timeout)
- Recommendation Engine failure (mocked) produces `200` with `recommendation_available: false` and decision in `waiting_for_user`

---

### IR01-050 — Implement `POST /api/decision/state` — Action Plan Engine

**Description:** Wire the Action Plan Engine into the state endpoint when `to_status = 'decision_made'`, replacing the stub from IR01-034.

**Files to modify:**
- `pages/api/decision/state.ts`

Key points:
- After the state transition commits, call `buildActionPlanPrompt` with the Decision context and the `chosen_alternative` from component `8_final_decision`
- Call `callAI` with the action plan prompt (max 600 tokens)
- Parse and validate: must have `action_items` array with 3–5 items
- Store as `9_action_plan` component via the save pattern
- If AI call fails: log error; return `200` with `action_plan: null` and `action_plan_error` string (the state transition has already committed)

**Dependencies:** IR01-042, IR01-047, IR01-034.

**Complexity:** Medium.

**Acceptance criteria:**
- Transitioning to `decision_made` with component 8 present returns `200` with `action_plan` containing 3–5 items
- Action plan references the `chosen_alternative_name` from component 8
- AI failure after state commit returns `200` with `action_plan: null` (decision correctly in `decision_made`)

---

### IR01-051 — Implement `POST /api/decision/chat` — full AI implementation

**Description:** Replace the Phase 3 stub with the real Chat Engine implementation per H13 §3.6 and H11 §7.

**Files to modify:**
- `pages/api/decision/chat.ts`

Key points:
- Build system prompt via `buildChatSystemPrompt`
- Fetch last 20 messages from `decision_chat_messages`
- Build message history array for the Anthropic API
- Call `callAI` (max 400 tokens per H11 §4.5)
- Parse the structured Chat response (H11 §7.4): extract `visible_response` and `material_change_detected`
- On AI fail: return `503`, store nothing
- On success: `insert_chat_exchange` RPC stores both messages atomically
- Return `{ response, material_change_detected, material_change_summary, component_to_update, message_id, response_id }`

**Dependencies:** IR01-042, IR01-048, IR01-038, IR01-021.

**Complexity:** High.

**Acceptance criteria:**
- Chat response references the Decision Object context in its reply
- Material change in message is detected (test: send a message with a new budget figure not in constraints)
- Failed AI call stores neither message (verify DB row count before and after)
- Response includes `message_id` and `response_id` of the stored messages

---

### IR01-052 — Implement Interview Engine — suggestion prompt

**Description:** Implement `buildSuggestionPrompt` and the suggestion endpoint per H11 §4.2. This is triggered during the Wizard when the user has entered at least one alternative.

**Files to create:**
- `pages/api/decision/suggest.ts`

**Files to modify:**
- `core/ai/prompts.ts` — add `buildSuggestionPrompt`

Key points:
- Input: `category`, `context` summary (first 200 chars of background), `stated_alternatives` array
- Output schema: `{ suggestions: [{ name, one_line_rationale }] }` — max 3 items
- Max output tokens: 300
- Return suggestions array to frontend for display as dashed-border cards (H08)

**Dependencies:** IR01-042, IR01-043, IR01-041.

**Complexity:** Medium.

**Acceptance criteria:**
- Returns 0–3 suggestions that do not duplicate the user's existing alternatives
- Response time < 10 seconds
- All suggestion names pass through `sanitizeForPrompt` before injection context (their names are from the user)

---

### IR01-053 — Implement Interview Engine — conflict detection prompt

**Description:** Implement `buildConflictDetectionPrompt` and the conflict detection endpoint per H11 §4.4.

**Files to create:**
- `pages/api/decision/conflict.ts`

**Files to modify:**
- `core/ai/prompts.ts` — add `buildConflictDetectionPrompt`

Key points:
- Input: `goal` (primary), `hard_constraints` array, `alternatives` array
- Output schema: `{ conflict_detected, conflict_description, conflict_type: 'mathematical' | 'logical' | 'likely' }`
- Max output tokens: 200
- API route returns the conflict assessment to the frontend for display before analysis is triggered

**Dependencies:** IR01-042, IR01-043.

**Complexity:** Medium.

**Acceptance criteria:**
- Goal "minimize monthly cost" + hard constraint "budget > €1000/month" with cheapest alternative at €800 → `conflict_detected: false`
- Goal "fully remote work" + hard constraint "must stay in current in-office role" → `conflict_detected: true`, `conflict_type: 'logical'`
- Budget constraint of €200 with cheapest alternative at €500 → `conflict_detected: true`, `conflict_type: 'mathematical'`

---

### IR01-054 — Phase 4 AI quality baseline verification

**Description:** Run the AI quality baseline per H11 §14 AAC-07. Manually review 10 Analysis + Recommendation pairs for at least 2 active categories (Financial, Technology). Document results.

**Baseline checklist (H11 AAC-07):**
- [ ] All 10 analyses per category: `specific_to_user = true` on all points without regeneration
- [ ] All 10 recommendations reference specific user inputs in `primary_reasoning`
- [ ] All 10 recommendations have non-empty, specific `conditions_for_change`
- [ ] Financial analyses all contain non-empty `market_data_caveat`
- [ ] Team Recommendation Acceptance Rate in test runs: 55–85%

**Dependencies:** IR01-049.

**Complexity:** High.

**Acceptance criteria:** All five checklist items pass. Any failing item requires prompt revision before Phase 5 begins.

---

### IR01-055 — Phase 4 AI acceptance criteria verification

**Description:** Run the full H11 AI Acceptance Criteria checklist (AAC-01 through AAC-06).

**Key tests:**
- Simulate AI timeout (mock 30s delay) → Decision reverts to `draft`
- Recommendation for alternative with `hard_constraints_satisfied: false` is rejected
- Chat on decision in `completed` state returns `409`
- Chat fail stores 0 messages (verify DB count)
- Values-based input (mock) produces values-clarification output

**Dependencies:** IR01-049 through IR01-053.

**Complexity:** High.

**Acceptance criteria:** All AAC-01 through AAC-06 items pass.

---

## Phase 5 — Frontend Integration

**Objective:** Implement all user-facing pages and components: Decision Wizard, Dashboard, History, Chat, and billing UI. Wire frontend to the API layer.

**Dependencies:** Phase 3 complete (API returns correct data). Phase 4 complete (AI engines functional). Design tokens live (IR01-005).

**Reference documents:** H08 (Design System), H05 (User Workflows), H03 (Decision Object).

---

### IR01-056 — Create `core/` type definitions accessible to frontend

**Description:** Confirm that `core/decision/Decision.types.ts` and `core/decision/Decision.constants.ts` are importable from frontend components via the `@/` alias. No new files — this is a verification step.

**Dependencies:** IR01-027, IR01-028.

**Complexity:** Low.

**Acceptance criteria:**
- `import { DecisionStatus } from '@/core/decision/Decision.constants'` works in a `.tsx` file
- `import type { DecisionObject } from '@/core/decision/Decision.types'` works in a `.tsx` file

---

### IR01-057 — Create shared UI components: `Button`, `Input`, `Card`

**Description:** Create the three fundamental H08 UI components per H08 §7. These are used across all feature components.

**Files to create:**
- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/ui/Card.tsx`

`Button` variants: `primary`, `secondary`, `ghost`, `danger`. Sizes: `md` (40px height), `lg` (48px height). States: default, hover, disabled, loading spinner.

`Input`: height 44px, visible `<label>` above, focus ring via CSS `:focus-visible`, error state with `--color-danger` text below.

`Card`: `--radius-lg` border-radius, 24px desktop padding / 16px mobile, `--shadow-sm` default, `--shadow-md` on hover.

**Dependencies:** IR01-005.

**Complexity:** Medium.

**Acceptance criteria:**
- Tab navigation produces visible focus rings on all interactive elements
- Disabled button cannot be clicked (verify `aria-disabled` and `pointer-events: none`)
- Input with `error="..."` prop shows error text in `--color-danger` below the field
- Button `loading` prop shows spinner and prevents double-submit

---

### IR01-058 — Create `components/layout/TopNav.tsx`

**Description:** Extract and refactor the `TopNav` component from `components/App.jsx` per H09 §3 Navigation spec.

**Files to create:**
- `components/layout/TopNav.tsx`

Desktop layout:
- Left: "DecisionOS" wordmark linking to `/dashboard` (authenticated) or `/` (anonymous)
- Center: empty (or Decision title on Decision-level pages)
- Right (authenticated): "New Decision" primary button + user plan badge
- Right (anonymous): "Sign in" ghost + "Get started" primary

Mobile (≤767px): wordmark only in top nav. Bottom nav handles the rest.

**Dependencies:** IR01-006, IR01-057.

**Complexity:** Medium.

**Acceptance criteria:**
- Logo links to `/dashboard` when authenticated and `/` when anonymous
- "New Decision" button navigates to `/decision/new`
- Plan badge shows `PRO` or `PREMIUM` for paid users, nothing for Free
- Mobile: top nav shows wordmark only; desktop: full nav

---

### IR01-059 — Create `components/layout/BottomNav.tsx`

**Description:** Create the mobile bottom navigation per H08 §3 and H09 §3.

**Files to create:**
- `components/layout/BottomNav.tsx`

Three items: Home (links to `/dashboard`), New Decision (center, prominent), History (links to `/history`).
Rendered only on viewports ≤ 767px.
Not shown when anonymous (anonymous users see a floating "Start a Decision" CTA instead — post-MVP).

**Dependencies:** IR01-058.

**Complexity:** Low.

**Acceptance criteria:**
- Bottom nav visible at 375px viewport width
- Bottom nav hidden at 1024px viewport width
- "New Decision" center item navigates to `/decision/new`

---

### IR01-060 — Create `components/layout/PageLayout.tsx`

**Description:** Create the standard page wrapper that renders `TopNav`, the page content, and `BottomNav` (on mobile).

**Files to create:**
- `components/layout/PageLayout.tsx`

```typescript
// components/layout/PageLayout.tsx
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'

interface Props {
  children: React.ReactNode
  decisionTitle?: string  // shown in TopNav center on Decision-level pages
}

export function PageLayout({ children, decisionTitle }: Props): JSX.Element {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
      <TopNav decisionTitle={decisionTitle} />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-6)' }}>
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
```

**Dependencies:** IR01-058, IR01-059.

**Complexity:** Low.

**Acceptance criteria:**
- All pages using `PageLayout` render without console errors
- Main content area max-width 1200px, centered

---

### IR01-061 — Create `context/DecisionContext.tsx` and `hooks/useDecision.ts`

**Description:** Create the Decision context and hook per H09 §10 State Management.

**Files to create:**
- `context/DecisionContext.tsx`
- `hooks/useDecision.ts`

`DecisionContext` provides:
- `decision: DecisionObject | null`
- `isLoading: boolean`
- `error: string | null`
- `updateComponent(component, content): Promise<void>` — calls `/api/decision/save`, 800ms debounce, optimistic update
- `advanceState(to): Promise<void>` — calls `/api/decision/state`
- `saveState: 'idle' | 'saving' | 'saved' | 'error'`

Auto-save retry: 3 attempts with exponential backoff (1s, 3s) per H09 §10.3 and FR-12.4.

**Dependencies:** IR01-006, IR01-027, IR01-028, IR01-033, IR01-034.

**Complexity:** High.

**Acceptance criteria:**
- `updateComponent('1_context', content)` calls `/api/decision/save` after 800ms
- Three consecutive save failures set `saveState = 'error'`
- Successful save sets `saveState = 'saved'` for 2 seconds then `'idle'`
- `advanceState` calls `/api/decision/state` and updates `decision.status` in context

---

### IR01-062 — Create `components/ui/SaveIndicator.tsx`

**Description:** Create the Save Indicator component per H08 §7 Save Indicator spec.

**Files to create:**
- `components/ui/SaveIndicator.tsx`

Three states:
- `saving`: spinner + "Saving..." in `--color-text-muted`
- `saved`: checkmark + "Saved" in `--color-success`, disappears after 2 seconds
- `error`: warning icon + "Not saved" in `--color-danger`, persists until next save attempt

Positioned top-right of the Wizard container.

**Dependencies:** IR01-005.

**Complexity:** Low.

**Acceptance criteria:**
- "Saving..." appears within 50ms of a save call
- "Saved" appears after save succeeds and disappears after 2 seconds
- "Not saved" persists after three consecutive failures

---

### IR01-063 — Create `pages/dashboard.tsx` and `features/decision-history/History.tsx`

**Description:** Create the authenticated Dashboard page per H08 §10 and H05 Workflow 2. Uses `GET /api/decision/history`.

**Files to create:**
- `pages/dashboard.tsx`
- `features/decision-history/History.tsx` (the list component — reused in `/history` page)

Dashboard page:
- `getServerSideProps` with auth check → redirect to `/auth/login?return=/dashboard`
- Renders the `History` component with filter set to active decisions (not archived)
- Shows skeleton cards while loading (H08 §16)
- Shows Empty Dashboard state when no decisions (H08 §15)
- Filter panel: Decision State, Category (H06 FR-09.4)

`History` component:
- Accepts `filters` prop: status, category, date range, order
- Calls `GET /api/decision/history` on mount and when filters change
- Renders Decision Object cards grouped by state (Needs attention → Active → Completed → Archived)
- Each card shows: title, category badge, status badge, last updated, alternatives count, has_recommendation flag
- Shows `plan_limit: true` upgrade prompt in context (BR-06)

**Dependencies:** IR01-061, IR01-060, IR01-057, IR01-035.

**Complexity:** High.

**Acceptance criteria:**
- Unauthenticated access redirects to `/auth/login?return=/dashboard`
- Dashboard loads and shows user's decisions grouped by state
- Empty Dashboard shows H08 §15 empty state with "Start a Decision" CTA
- Free tier user with >10 decisions sees upgrade prompt after the 10th card
- Skeleton cards shown during data fetch

---

### IR01-064 — Create `pages/history.tsx`

**Description:** Create the full History page. Reuses the `History` component from IR01-063 with all filters active.

**Files to create:**
- `pages/history.tsx`

Same auth gate as dashboard. Shows all decisions including archived. Includes date range filter (H06 FR-09.4).

**Dependencies:** IR01-063.

**Complexity:** Low.

**Acceptance criteria:**
- Accessible at `/history` by authenticated users
- Shows archived decisions (not shown on Dashboard by default)
- Date range filter input calls history API with `created_from` / `created_to` params

---

### IR01-065 — Create Decision Wizard: `pages/decision/new.tsx`

**Description:** Create the Decision Wizard entry page and container per H08 §8 and H05 Workflow 1. Routes to the Wizard for new Decisions.

**Files to create:**
- `pages/decision/new.tsx`
- `features/decision-wizard/Wizard.tsx` (container)

`pages/decision/new.tsx`:
- On load: call `POST /api/decision/create` with the selected category
- Redirect to `/decision/[id]` immediately after creation
- If user lands here without a category, show `CategorySelect` component first

**Dependencies:** IR01-060, IR01-030.

**Complexity:** Medium.

**Acceptance criteria:**
- Navigating to `/decision/new?category=financial` creates a decision and redirects to `/decision/[id]`
- Anonymous users can reach `/decision/new` without login (no middleware block)
- A decision appears in the database after visiting this page

---

### IR01-066 — Create `features/decision-wizard/CategorySelect.tsx`

**Description:** Create the category selection screen shown when no category is pre-selected.

**Files to create:**
- `features/decision-wizard/CategorySelect.tsx`

Shows the nine decision categories (H06 §Categories) as cards with icon, name, and one-line description. Selecting a category calls `POST /api/decision/create` and redirects to `/decision/[id]`.

**Dependencies:** IR01-057, IR01-030.

**Complexity:** Low.

**Acceptance criteria:**
- All nine categories are shown
- Selecting a category creates a decision and navigates to `/decision/[id]`
- Category cards have visible focus state for keyboard navigation

---

### IR01-067 — Create Wizard steps: Context, Goal, Constraints, Alternatives

**Description:** Create the four Wizard step components per H08 §8 and H03 components 1–4.

**Files to create:**
- `features/decision-wizard/ContextStep.tsx`
- `features/decision-wizard/GoalStep.tsx`
- `features/decision-wizard/ConstraintsStep.tsx`
- `features/decision-wizard/AlternativesStep.tsx`

Each step:
- Receives `decision` and `updateComponent` from `DecisionContext`
- Shows question text, reason text below question, input area
- Shows `SaveIndicator` (top-right)
- Navigation row: [Back] [Skip for now] [Continue] (H08 §8)
- Continue disabled until minimum required input is present

`AlternativesStep` additionally:
- Shows alternative cards with "Add another option" (max 5)
- Triggers `POST /api/decision/suggest` for suggestions after first alternative entered
- Shows "Do nothing?" prompt if no inaction alternative exists
- Triggers `POST /api/decision/conflict` on Continue before allowing analysis

**Dependencies:** IR01-061, IR01-062, IR01-057, IR01-052, IR01-053.

**Complexity:** High.

**Acceptance criteria:**
- Each step auto-saves on input after 800ms debounce
- Back button navigates to the previous step without losing data
- Continue is disabled until at least one non-empty input is present
- AI suggestions appear as dashed-border cards with "Add this" button
- Conflict detection blocks progression and shows the conflict description

---

### IR01-068 — Create `components/ui/ProgressBar.tsx` for Wizard

**Description:** Create the 4-segment progress bar shown above the Wizard per H08 §8.

**Files to create:**
- `components/ui/ProgressBar.tsx`

Four segments: Context, Goal, Constraints, Alternatives.
- Active: `--color-accent`
- Completed: `--color-success`
- Incomplete: `--color-border`
- Always visible above the Wizard container (does not scroll away)

**Dependencies:** IR01-005.

**Complexity:** Low.

**Acceptance criteria:**
- Active segment shows in `--color-accent`
- Completed segments show in `--color-success`
- Progress bar is visible without scrolling on all screen sizes

---

### IR01-069 — Create `pages/decision/[id].tsx` and `DecisionContext` provider

**Description:** Create the Decision Object view page. Wraps the page content in `DecisionContext`. Routes to the correct Wizard step or Recommendation View based on decision status.

**Files to create:**
- `pages/decision/[id].tsx`

Logic:
- `getServerSideProps`: fetch decision via `GET /api/decision/[id]` (or anonymous_token query param)
- Wrap page in `DecisionContext` with the fetched decision
- Route based on status:
  - `draft` → `Wizard` (at the appropriate step based on which components are populated)
  - `in_analysis` → `AnalysisLoading` component
  - `waiting_for_user` → `RecommendationView`
  - `decision_made` + → appropriate post-decision view

**Dependencies:** IR01-061, IR01-060, IR01-031.

**Complexity:** High.

**Acceptance criteria:**
- `/decision/[id]` for a draft decision shows the Wizard at the correct step
- `/decision/[id]` for a `waiting_for_user` decision shows the Recommendation View
- `/decision/[id]` for a non-existent decision returns the Next.js 404 page

---

### IR01-070 — Create `components/ui/AnalysisLoading.tsx`

**Description:** Create the analysis loading screen per H08 §16.

**Files to create:**
- `components/ui/AnalysisLoading.tsx`

Shows rotating status messages every 4–6 seconds. A horizontal progress bar fills progressively. Footer text: "This usually takes 10–20 seconds. Your inputs are saved." (H08 §16)

**Dependencies:** IR01-005.

**Complexity:** Low.

**Acceptance criteria:**
- Message rotates every 4–6 seconds (not 1.2 seconds)
- Progress bar fills smoothly over 20 seconds
- Footer text is always visible
- `prefers-reduced-motion: reduce` stops all animations

---

### IR01-070b — UI Consistency Pass

**Description:** Inserted task, not part of the original roadmap sequence. Audits every screen shipped in IR01-056 through IR01-070 against H08 (colors, typography, spacing, radius, shadows, buttons) and DAC-01/DAC-10, removes duplicated styling, and consolidates repeated markup into existing shared components. No new features, no redesign, no change to existing functionality.

**Files changed:**
- `components/layout/FilterLayout.module.css` (new) — shared `.layout`/`.filterPanel`/`.filterHeading`/`.listColumn`/`.heading` rules, replacing the near-identical `pages/dashboard.module.css` and `pages/history.module.css` (deleted)
- `pages/dashboard.tsx`, `pages/history.tsx` — import the shared module
- `lib/design-tokens.css` — added `--color-danger-dark` (mirrors the existing `--color-accent-dark` pattern)
- `components/ui/Button.module.css` — `.danger:hover` now references `--color-danger-dark` instead of a hardcoded `#dc2626`
- `components/ui/Input.tsx` — widened `label` prop from `string` to `React.ReactNode` (backward compatible) to support inline hint text without duplicating the Input component
- `pages/auth/Auth.module.css` (new), `pages/auth/login.tsx`, `pages/auth/signup.tsx` — replaced two ~150-line pages of duplicated inline-style form/card/button markup with the existing `Input`, `Button` components and one shared page-shell module
- `components/ui/SaveIndicator.tsx`, `components/ui/SaveIndicator.module.css` (new) — converted from inline `CSSProperties` objects to a CSS Module, matching the styling convention used by every other component

**Dependencies:** IR01-070.

**Complexity:** Low.

**Acceptance criteria:**
- No behavior change: `npx tsc --noEmit`, `npx next build`, and `npx vitest run` all pass
- Dashboard and History pages render identically (same grid, same filter panel)
- Login and signup pages preserve all existing behavior (anon token transfer, redirects, loading/error/message states)
- No new hardcoded colors introduced; the two fixed hardcodes are the only token changes

---

### IR01-071 — Create `features/decision-wizard/RecommendationView.tsx`

**Description:** Create the Recommendation Screen per H08 §9 and H03 component 7.

**Files to create:**
- `features/decision-wizard/RecommendationView.tsx`

Recommendation Block (H08 §9):
- Recommended alternative name in `text-2xl font-black`
- Primary reasoning in `text-md`
- Honest trade-offs
- Conditions for change
- Confidence indicator dot (green/yellow/amber per H11 §11.4)
- `information_request` if confidence is medium/low

Below: Alternative cards, each with pros, cons, and risks from component 5 and 6.

Pinned bottom (mobile): "Record My Decision" primary button → opens Final Decision capture form.

"Chat about this" button → navigates to Chat tab (Pro+ only, shows upgrade prompt for Free).

**Dependencies:** IR01-061, IR01-057.

**Complexity:** High.

**Acceptance criteria:**
- Recommended alternative name is displayed as the visual hero of the screen
- `recommendation_available: false` shows the partial-success state (analysis available, retry recommendation)
- "Record My Decision" is always visible on mobile without scrolling

**Status: Complete.** Implemented in `features/decision-wizard/RecommendationView.tsx` + `RecommendationView.module.css`, wired into the `waiting_for_user` branch of `pages/decision/[id].tsx`. Also added the AI-generated component types (`AIAnalysisContent`, `RisksContent`, `RecommendationContent`, etc.) to `core/decision/Decision.types.ts`, since components 5/6/7 had no typed shape yet. `onRecordDecision` / `onRetryRecommendation` are exposed as optional callback props with no wiring yet — IR01-072 (Final Decision capture) and the post-MVP Recommendation-only retry both own that wiring. `npx tsc --noEmit`, `npx next build`, `npx vitest run` (153 tests) all pass.
- Confidence level shows correct indicator color per H11 §11.4

---

### IR01-072 — Create Final Decision capture and state advance

**Description:** Implement the form for recording the Final Decision (component 8) and triggering the `decision_made` state transition.

**Files to create:**
- `features/decision-wizard/FinalDecisionForm.tsx`

Steps:
1. User selects their chosen alternative (defaults to recommended)
2. If choice differs from recommendation: show `divergence_reason` field
3. Confidence selector: `confident`, `uncertain`, `reluctant` (radio group per H08 §7)
4. Submit: save component 8 via `updateComponent`, then call `advanceState('decision_made')`
5. Response includes `action_plan` → navigate to Action Plan view

**Dependencies:** IR01-061, IR01-071.

**Complexity:** Medium.

**Acceptance criteria:**
- Submitting the form saves component 8 and transitions to `decision_made`
- Divergence reason field appears only when choice differs from recommendation
- Action plan is displayed after successful transition
- Error if `advanceState` fails: decision remains in `waiting_for_user`, error shown

**Status: Complete.** Implemented in `features/decision-wizard/FinalDecisionForm.tsx` + `FinalDecisionForm.module.css`, wired into `pages/decision/[id].tsx` via a local `showFinalForm` toggle on the `waiting_for_user` branch (`RecommendationView.onRecordDecision` opens it, the form's `onCancel` closes it back to `RecommendationView`). Added `ActionPlanContent`/`ActionPlanItem` types (component 9) to `core/decision/Decision.types.ts`. Added an explicit `decision_made` case to the same router that reads `decision.components['9_action_plan']` and displays it inline (falls back to a placeholder message if the Action Plan Engine failed, per H13 §3.5's non-fatal action-plan-failure note) — this works both immediately after transition and on a fresh page load, since `GET /api/decision/[id]` already returns all current components.

**Pre-existing bug fixed as a dependency of this task** (per explicit approval): `context/DecisionContext.tsx`'s `advanceState` posted `{ status: to }` but `pages/api/decision/state.ts` reads `to_status` — every `advanceState()` call 400'd. Fixed the field name only; the function's `Promise<void>` signature is unchanged (frozen by H09 §Technical Architecture). `advanceState` also now merges a returned `action_plan` into local component state the same way `updateComponent` merges other components, which is how `FinalDecisionForm` gets the plan to the router without widening the frozen signature.

`npx tsc --noEmit`, `npx next build`, `npx vitest run` (153 tests) all pass.

---

### IR01-073 — Create `features/decision-chat/Chat.tsx`

**Description:** Create the Chat interface per H08 §11 and H13 §3.6.

**Files to create:**
- `features/decision-chat/Chat.tsx`

Layout:
- Context label at top: category + decision title (always visible, H11 §7)
- Scrollable message area, user messages right, AI messages left
- Input pinned to bottom, max 1000 characters
- Auto-scroll to latest message on new message
- Material change detection UI: when `material_change_detected = true`, show inline card with "Update Decision" and "Keep as context only" options

Pro+ gate: Free tier users see upgrade prompt instead of the chat input.

**Dependencies:** IR01-057, IR01-061, IR01-051.

**Complexity:** High.

**Acceptance criteria:**
- User message appears immediately (optimistic UI)
- AI response loads with a "thinking" indicator
- Failed AI call shows inline retry on the last user message
- Material change prompt appears when `material_change_detected = true`
- Free tier users see upgrade prompt per BR-06

**Status: Complete.** Implemented in `features/decision-chat/Chat.tsx` + `Chat.module.css`. Wired into `pages/decision/[id].tsx` via a `showChat` toggle on `DecisionRouter`: desktop shows a 40/60 split (current view + Chat panel), mobile hides the left pane so Chat takes the full width, approximating H08 §11's full-screen mobile spec without touching `PageLayout`/`TopNav`/`BottomNav`. `RecommendationView`'s existing "Explore with AI" / "Ask AI a question" buttons (from IR01-071) now call the new `onOpenChat` prop instead of `router.push` to a page that never existed — Chat renders in place since only `Chat.tsx` was ever specified as a new file, no new route.

Free-tier gating lives inside `Chat.tsx` itself (checks `useSubscription()`, shows an inline upgrade prompt instead of the message area/input) rather than at the entry point, so the "upgrade never interrupts" (H08 UX-P6) framing holds even if a future task adds more chat entry points elsewhere.

**Adaptations, both minimal and reused from existing architecture:**
- H08 §11's "Update my [component]" action has no dedicated "apply this change" API — none exists in H13. `Update Decision` calls the already-valid `advanceState('draft')` (an existing, allowed transition) and closes the panel, returning the user to the Wizard at their resume step so they can edit the affected component and resubmit — the same backward-edit path H08 §8 already describes, not a new mechanism.
- The API doesn't return a per-message "source component" for ordinary responses (only for `material_change_detected` messages), so the generic "Based on your [component]" source label from H08 §11's Message Anatomy isn't shown on every AI message — showing it would require fabricating data the backend doesn't provide.

`npx tsc --noEmit`, `npx next build`, `npx vitest run` (153 tests) all pass.

---

### IR01-074 — Create billing upgrade flow

**Description:** Implement the upgrade CTA and Stripe Checkout redirect per H13 §4.1.

**Files to create:**
- `features/marketing/PricingSection.tsx` — pricing cards already present in legacy Landing; extract and align with H08

Key flows:
- "Upgrade to Pro" / "Upgrade to Premium" button calls `POST /api/billing/checkout`
- On response, `window.location.href = url` redirects to Stripe
- `pages/success.tsx` handles the return from Stripe (already exists — verify it reads `session_id` from query and shows appropriate messaging)

**Dependencies:** IR01-036, IR01-060.

**Complexity:** Low.

**Acceptance criteria:**
- Clicking "Upgrade to Pro" redirects to Stripe Checkout within 2 seconds
- After successful payment (Stripe test mode), user's plan updates to `pro` on next page load
- `pages/success.tsx` shows a confirmation message with a link to Dashboard

**Status: Complete.** Implemented `features/marketing/PricingSection.tsx` + `PricingSection.module.css`: Free/Pro/Premium cards rebuilt on H08 tokens (Card component, H08 §6 three-column grid), plan-aware via the existing `useSubscription` hook (shows "Current plan" on the user's actual tier instead of a static label), "Upgrade to Pro"/"Upgrade to Premium" buttons that `POST /api/billing/checkout` and redirect via `window.location.href`.

The legacy Landing page (`components/App.jsx`) had the only reachable pricing cards in the app, wired to the deprecated `/api/create-checkout` endpoint — replaced just that block (~60 lines) with `<PricingSection />`, leaving the rest of the 5000-line legacy file (including its other, unrelated `handleUpgrade` nav-badge buttons) untouched.

`pages/success.js` didn't actually satisfy this task's own acceptance criteria going in: it ignored `session_id`/`return` entirely, linked to `/` instead of `/dashboard`, and referenced the old "DecisionPilot" product name. Rebuilt on H08 tokens (reusing `Card`/`Button`), now reads `session_id` and `return` from `router.query`, defaulting the destination to `/dashboard` per H13 §4.1.

`npx tsc --noEmit`, `npx next build`, `npx vitest run` (153 tests) all pass; smoke-tested the built homepage and `/success?session_id=...` against a local `next start` — both 200, no server errors.

**Not done (out of scope for this task):** No `pages/account.tsx` exists yet — `History.tsx` (IR01-063) and `Chat.tsx` (IR01-073) already route their upgrade prompts to `/account`, which still 404s. IR01-074's file list only specified `PricingSection.tsx`; a dedicated account/billing page isn't listed until a future task.

---

### IR01-075 — Integrate `useSubscription` hook into plan-gated features

**Description:** Confirm `hooks/useSubscription.js` (existing) is wired into all plan-gated components. Any component that shows different content based on plan must use this hook.

**Files to verify/modify:**
- `hooks/useSubscription.js` — verify returns `{ plan, loading }`
- `features/decision-chat/Chat.tsx` — uses `plan === 'free'` to show upgrade prompt
- `features/decision-history/History.tsx` — uses `plan_limit` from API response

**Dependencies:** IR01-073, IR01-063.

**Complexity:** Low.

**Acceptance criteria:**
- Free user sees upgrade prompt in Chat interface
- Free user with >10 decisions sees upgrade prompt in History
- Plan badge in TopNav reflects current plan from `useSubscription`

**Status: Complete — verification only, no code changes.** Checked every plan-gated surface in the app against `hooks/useSubscription.js`:
- `hooks/useSubscription.js` returns exactly `{ plan, loading }` — confirmed.
- `features/decision-chat/Chat.tsx` (IR01-073): `canChat = plan === 'pro' || plan === 'premium'`; the inline upgrade prompt renders on `!canChat`, which is logically equivalent to the roadmap's `plan === 'free'` check (plan is always `'free' | 'pro' | 'premium'`) — same behavior, already correct.
- `features/decision-history/History.tsx` (IR01-063): reads `plan_limit` from `GET /api/decision/history`, which computes it server-side as `actualTotal > 10` for free-tier users (`pages/api/decision/history.ts`) — confirmed correct end to end.
- `components/layout/TopNav.tsx` (IR01-058): reads `plan` from `useSubscription`, shows the PRO/PREMIUM badge only for those tiers — confirmed.
- Also checked, not in this task's file list but relevant: `features/decision-wizard/RecommendationView.tsx` (IR01-071) and `features/marketing/PricingSection.tsx` (IR01-074) both already use `useSubscription` correctly; the legacy `components/App.jsx` has its own unrelated `TopNav` function that also already uses `useSubscription` correctly (predates this roadmap).

No component was found doing plan-based conditional rendering without `useSubscription` or the API's `plan_limit`. `npx tsc --noEmit` and `npx vitest run` (153 tests) re-confirmed green with zero files touched.

**Observed but not changed (out of scope — no behavioral impact):** `useSubscription.js` queries `subscriptions` with `.single()` rather than `.maybeSingle()`. Per the table's own migration comment, a `subscriptions` row is only written by the Stripe webhook on first upgrade — a user who has never upgraded has no row at all, so this query resolves with a Postgrest "no rows" error every time for every free user. The code doesn't check the `error` field, so `plan` still correctly falls back to `'free'` via `data?.plan || 'free'` — no user-facing symptom, nothing thrown, nothing logged. Fixing it would touch a hook used on every page in the app for a purely internal, invisible correction, which is outside "confirm it's wired" and risked being the kind of unrelated refactor this task explicitly said not to do.

---

### IR01-076 — Phase 5 E2E user flow verification

**Description:** Manually execute all five primary user workflows from H05, end-to-end in the browser.

**Workflows to test:**
1. **WF-1 (Anonymous):** Visit `/`, start a decision, complete wizard, view recommendation, record final decision
2. **WF-2 (Returning user):** Log in, view dashboard, open an existing decision, resume from correct step
3. **WF-3 (Chat):** Log in as Pro user, open decision in `waiting_for_user`, send a chat message, verify AI response
4. **WF-4 (History):** Log in, navigate to `/history`, filter by category, verify correct decisions shown
5. **WF-5 (Billing):** Click "Upgrade to Pro", complete Stripe test checkout, verify plan badge updates

**Dependencies:** IR01-065 through IR01-075.

**Complexity:** High.

**Acceptance criteria:** All five workflows complete without console errors or UI breakage. Verify in Chrome at 1440px (desktop) and 375px (mobile).

**Status: Blocked — environment missing required secrets.** Started `next dev` and drove the two server-side surfaces WF-1 and WF-5 depend on before touching a browser:
- `POST /api/decision/create` (WF-1's first step, "start a decision") → HTTP 500, `SUPABASE_SERVICE_ROLE_KEY is not configured`, thrown at import time in `lib/supabase/admin.ts`.
- `POST /api/billing/checkout` (WF-5) → HTTP 500 for the same reason (`stripe.client.ts` throws without `STRIPE_SECRET_KEY`).

`.env.local` currently defines only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Every route the five workflows exercise (`create`, `[id]`, `save`, `state`, `history`, `chat`, `chat/[id]`, `analyze`, `suggest`, `conflict`, `billing/checkout`, `billing/webhook`) imports `adminClient` (needs `SUPABASE_SERVICE_ROLE_KEY`); chat/analyze additionally need `ANTHROPIC_API_KEY`; billing additionally needs `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_PREMIUM_PRICE_ID`. None of the five workflows can progress past their first data-writing step without these. This is a missing-credential gap, not a code defect — no fix is in scope.

**Not run:** all five workflows in Chrome at 1440px/375px, since none can get past step one.

**Needed to unblock:** `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_PREMIUM_PRICE_ID` added to `.env.local` (test/sandbox values are sufficient for Stripe/Supabase).

---

## Phase 6 — Testing and Production Launch

**Objective:** Complete unit test coverage, verify all handbook acceptance criteria, perform production validation, and prepare for launch.

**Dependencies:** All previous phases complete.

---

### IR01-077 — Write unit tests for `core/ai/validate.ts`

**Description:** Expand the test suite for the AI output validation functions. Cover every validation rule in H11 §5.5 and §6.5.

**Files to create/modify:**
- `core/ai/validate.test.ts`

Test fixtures: one valid analysis output, variations that fail each specific rule (missing pros, generic point with `specific_to_user: false`, hard constraint violated in recommendation, missing `conditions_for_change`).

**Dependencies:** IR01-045, IR01-004.

**Complexity:** Medium.

**Acceptance criteria:**
- `npm test` passes
- Coverage for `core/ai/validate.ts` ≥ 80%
- Each validation rule has at least one test that triggers it

**Status: Complete.** `core/ai/validate.test.ts` already carried 620 lines of tests from IR01-045/IR01-055 (built alongside the validation functions themselves), covering `specific_to_user` rejection, minimum pros/cons/risks, hard-constraint-violation cross-checks, information-gap length, all five Recommendation Contract terms, tie detection, the all-alternatives-violate conflict path, category-specific fields, and Action Plan item-count/field rules — already at 96% line coverage against this task's 80% bar. This task closed the three remaining uncovered branches: a non-object entry in `per_alternative`, a non-object entry in `action_items`, and a non-numeric `sequence` field. `validate.ts` is now at 100% line / 97% statement / 91% branch coverage. 3 tests added (153 → 156 total), `npx vitest run` and `npx tsc --noEmit` both pass. No production code changed — `validate.ts` itself was not touched, only its test file.

**Note (H11 section numbers stale, not a defect):** this task's citation of "H11 §5.5 and §6.5" no longer matches the current Handbook — those sections are now Prompt Versioning/Deprecation and Conversation Memory, unrelated to output validation. The actual validation rules live in H11 §7.3 (information gaps), §8.3 (professional advice disclaimer), §9.2–9.3 (`specific_to_user`, `market_data_caveat`), §11.1–11.3 (confidence), and §12.1–12.2 (Recommendation Contract, hard constraints) — all of which are implemented and now fully tested.

**Gap found, not fixed (out of scope — would be new production code, not a test):** H11 §8.5 and §9.4 both specify that the output validation layer must reject responses containing a defined list of prohibited phrases (outcome-prediction language like "will result in," "you will find," "this guarantees," plus Legal-category phrases like "you should sue," "this is legally binding," and real-time-data phrases like "current price is," "as of today"). No such check exists anywhere in `core/ai/` today — not in `validate.ts`, not as a prompt instruction in `prompts.ts`. This task only writes tests for existing validation logic; adding the missing check itself is new production code and was left untouched per this round's scope. Flagging for a future IR01 task (or as part of IR01-078, which touches `prompts.ts`) since it's an explicit Handbook requirement, not a nice-to-have.

`npx vitest run` (156 tests) and `npx tsc --noEmit` pass.

---

### IR01-078 — Write unit tests for `core/ai/prompts.ts`

**Description:** Test that prompt builders return the expected structural elements. Tests verify structure, not the exact wording (which can change on minor version increments).

**Files to create:**
- `core/ai/prompts.test.ts`

Tests: `buildAnalysisPrompt` includes disclaimer for financial category; includes `market_data_caveat` instruction for financial; sanitizes user input; returns correct `version` string. `buildRecommendationPrompt` includes hard constraint rule. `buildChatSystemPrompt` includes populated component content.

**Dependencies:** IR01-044, IR01-046, IR01-048, IR01-004.

**Complexity:** Medium.

**Acceptance criteria:**
- `npm test` passes
- Coverage for `core/ai/prompts.ts` ≥ 80%

---

### IR01-079 — Write component tests for `DecisionContext`

**Description:** Test the auto-save debounce, retry logic, and save state transitions using React Testing Library and MSW.

**Files to create:**
- `context/DecisionContext.test.tsx`

Tests: `updateComponent` debounces calls by 800ms; calls `/api/decision/save` after debounce; `saveState` transitions to `'saving'` then `'saved'`; three consecutive failures produce `saveState = 'error'`.

**Dependencies:** IR01-061, IR01-004.

**Complexity:** High.

**Acceptance criteria:**
- `npm test` passes
- Auto-save debounce test confirms no API call within 800ms, exactly one call after

---

### IR01-080 — Run full H09 TAC checklist

**Description:** Execute every item in H09 Technical Acceptance Criteria (TAC-01 through TAC-08) against the production deployment.

**TAC checklist:**
- [ ] TAC-01: Build and deploy — `npm run build` clean, Vercel green, no console errors, all env vars set
- [ ] TAC-02: Database — RLS on all tables, CASCADE verified, anonymous cleanup active, indexes verified
- [ ] TAC-03: Authentication — session cookie HTTP-only, service role key not in bundle, `?return=` redirect works, anonymous transfer works
- [ ] TAC-04: API — 405 for wrong methods, 401 for missing session, no HTML error pages, webhook signature validation, analyze timeout reverts to draft
- [ ] TAC-05: Performance — Lighthouse ≥ 80 mobile, Wizard loads ≤ 2s, AI completes ≤ 30s for 10 consecutive requests
- [ ] TAC-06: Security — `npm audit` no HIGH/CRITICAL, HTTPS enforced, UUIDs not sequential integers in URLs
- [ ] TAC-07: Code quality — no TODO without sprint ref in `core/` or `features/`, all exported functions have return types, `@/` alias used throughout
- [ ] TAC-08: Design system — `lib/design-tokens.css` imported in `_app.js`, all interactive elements have focus rings, reduced-motion disables animations, no `outline: none` without replacement

**Dependencies:** All previous phases.

**Complexity:** High.

**Acceptance criteria:** All 32 individual TAC items pass. Document any that fail as post-launch issues with severity rating.

---

### IR01-081 — Run H13 API acceptance criteria (production)

**Description:** Execute the 17 acceptance criteria from H13 §8 against the production environment.

**Dependencies:** IR01-040, IR01-080.

**Complexity:** Medium.

**Acceptance criteria:** All 17 H13 §8 items pass against `https://decisionpilot.tech`.

---

### IR01-082 — Run H11 AI acceptance criteria (production)

**Description:** Execute the AI acceptance criteria AAC-01 through AAC-07 against the production Anthropic API.

**Dependencies:** IR01-055, IR01-080.

**Complexity:** High.

**Acceptance criteria:** All AAC items pass. Quality baseline (AAC-07) documented and stored in repository as `docs/quality-baseline-launch.md`.

---

### IR01-083 — Security audit

**Description:** Execute the H10 §14 Security Checklist in full against the production deployment.

**Checklist includes:**
- `npm audit` — no HIGH or CRITICAL
- Verify `SUPABASE_SERVICE_ROLE_KEY` not in browser bundle (Vercel build output)
- Verify `ANTHROPIC_API_KEY` not in browser bundle
- Verify session cookie is `HttpOnly` (browser DevTools → Application → Cookies)
- Verify `stripe-signature` header is validated on webhook (attempt request without header → must return 400)
- Verify RLS with two test accounts: user A cannot access user B's decisions
- Verify HTTPS enforced (HTTP → HTTPS redirect active)

**Dependencies:** IR01-080.

**Complexity:** Medium.

**Acceptance criteria:** All security checklist items pass. Any failure blocks launch.

---

### IR01-084 — Performance baseline

**Description:** Run Lighthouse and manual performance tests per H09 TAC-05.

**Tests:**
- Lighthouse on `/` and `/dashboard` in Chrome Incognito, Mobile simulation: score ≥ 80
- Wizard page load ≤ 2 seconds on simulated Fast 3G (Chrome DevTools → Network)
- AI analysis: 10 consecutive test requests, all complete ≤ 30 seconds

**Dependencies:** IR01-080.

**Complexity:** Medium.

**Acceptance criteria:**
- Lighthouse Performance ≥ 80 on both pages
- No single AI analysis request exceeds 30 seconds
- No console errors on any tested page

---

### IR01-085 — Execute H10 Release Checklist

**Description:** Run the complete release checklist from H10 §17 before declaring the MVP production-ready.

**Pre-deployment checklist (H10 §17.1):**
- [ ] All changes committed to `main`
- [ ] `npm run build` passes locally
- [ ] All environment variables set in Vercel Dashboard
- [ ] Database migrations applied to production Supabase
- [ ] pg_cron jobs active (anonymous cleanup + in_analysis cleanup)
- [ ] Stripe webhook URL points to `decisionpilot.tech/api/billing/webhook`
- [ ] AI prompt versions documented in `core/ai/prompts.ts`

**Post-deployment verification (H10 §17.2):**
- [ ] Homepage loads without console errors
- [ ] Login and signup work end-to-end
- [ ] Decision can be started, wizard completed, analysis run
- [ ] Recommendation displayed
- [ ] Final Decision can be recorded
- [ ] Dashboard loads for authenticated user
- [ ] Stripe Checkout can be opened (not completed in production verification)
- [ ] Vercel Functions logs show no new errors

**Dependencies:** All previous phases.

**Complexity:** Medium.

**Acceptance criteria:** All pre-deployment and post-deployment items pass. MVP is production-ready.

---

## Appendix A — Task Dependency Graph

```
Phase 1 (Foundation)
IR01-001 → IR01-002 → IR01-003 → IR01-004
IR01-001 → IR01-005
IR01-002 → IR01-007 → IR01-008
IR01-007 → IR01-009 → IR01-010
IR01-009 → IR01-011
IR01-002 → IR01-012

Phase 2 (Database) — requires Phase 1
IR01-013 → IR01-014 → IR01-015 → IR01-016 → IR01-017 → IR01-018
IR01-016 → IR01-019
IR01-016 → IR01-020 → IR01-021
IR01-016 → IR01-022
IR01-015 → IR01-023 → IR01-024
IR01-013 → IR01-025
All Phase 2 → IR01-026

Phase 3 (API) — requires Phase 2
IR01-027 → IR01-028 → IR01-029
IR01-029 → IR01-030 → IR01-031 → IR01-032
IR01-029 → IR01-033 → IR01-034
IR01-031 → IR01-035
IR01-012 → IR01-036
IR01-012 → IR01-037
IR01-021 → IR01-038 → IR01-039
All Phase 3 → IR01-040

Phase 4 (AI) — requires Phase 3
IR01-041 → IR01-042 → IR01-043
IR01-043 → IR01-044 → IR01-045 → IR01-046
IR01-044 → IR01-047
IR01-041 → IR01-048
IR01-044 → IR01-049 (replaces IR01-038 stub)
IR01-047 → IR01-050 (replaces IR01-034 stub)
IR01-048 → IR01-051 (replaces IR01-038 stub)
IR01-052 → IR01-053
IR01-049 → IR01-054 → IR01-055

Phase 5 (Frontend) — requires Phase 3 complete, Phase 4 stubs
IR01-056 → IR01-057 → IR01-058 → IR01-059 → IR01-060
IR01-060 → IR01-061 → IR01-062
IR01-057 → IR01-063 → IR01-064
IR01-060 → IR01-065 → IR01-066 → IR01-067
IR01-067 → IR01-068
IR01-061 → IR01-069 → IR01-070 → IR01-070b → IR01-071 → IR01-072
IR01-072 → IR01-073 → IR01-074 → IR01-075
All Phase 5 → IR01-076

Phase 6 (Launch) — requires Phase 5
IR01-077 → IR01-078 → IR01-079
IR01-076 → IR01-080 → IR01-081 → IR01-082
IR01-080 → IR01-083 → IR01-084 → IR01-085
```

---

## Appendix B — Complexity Summary

| Complexity | Task count |
|---|---|
| Low | 39 |
| Medium | 29 |
| High | 18 |
| **Total** | **86** (85 original + IR01-070b, inserted) |

---

## Appendix C — Files Created by This Roadmap

**New files (not existing in codebase):**

`lib/design-tokens.css` · `hooks/useAuth.ts` · `lib/stripe/stripe.client.ts` · `core/decision/Decision.constants.ts` · `core/decision/Decision.types.ts` · `core/decision/Decision.utils.ts` · `core/decision/Decision.utils.test.ts` · `core/ai/sanitize.ts` · `core/ai/sanitize.test.ts` · `core/ai/call.ts` · `core/ai/prompts.ts` · `core/ai/validate.ts` · `core/ai/validate.test.ts` · `core/ai/prompts.test.ts` · `vitest.config.ts` · `vitest.setup.ts` · `context/DecisionContext.tsx` · `context/DecisionContext.test.tsx` · `hooks/useDecision.ts` · `components/layout/TopNav.tsx` · `components/layout/BottomNav.tsx` · `components/layout/PageLayout.tsx` · `components/ui/Button.tsx` · `components/ui/Input.tsx` · `components/ui/Card.tsx` · `components/ui/SaveIndicator.tsx` · `components/ui/ProgressBar.tsx` · `components/ui/AnalysisLoading.tsx` · `features/decision-wizard/Wizard.tsx` · `features/decision-wizard/CategorySelect.tsx` · `features/decision-wizard/ContextStep.tsx` · `features/decision-wizard/GoalStep.tsx` · `features/decision-wizard/ConstraintsStep.tsx` · `features/decision-wizard/AlternativesStep.tsx` · `features/decision-wizard/RecommendationView.tsx` · `features/decision-wizard/FinalDecisionForm.tsx` · `features/decision-chat/Chat.tsx` · `features/decision-history/History.tsx` · `features/marketing/PricingSection.tsx` · `pages/dashboard.tsx` · `pages/history.tsx` · `pages/decision/new.tsx` · `pages/decision/[id].tsx` · `pages/api/decision/create.ts` · `pages/api/decision/[id].ts` · `pages/api/decision/save.ts` · `pages/api/decision/analyze.ts` · `pages/api/decision/state.ts` · `pages/api/decision/chat.ts` · `pages/api/decision/chat/[id].ts` · `pages/api/decision/history.ts` · `pages/api/decision/suggest.ts` · `pages/api/decision/conflict.ts` · `pages/api/billing/checkout.ts` · `pages/api/billing/webhook.ts` · `components/layout/FilterLayout.module.css` · `pages/auth/Auth.module.css` · `components/ui/SaveIndicator.module.css` (IR01-070b) · `features/decision-wizard/RecommendationView.module.css` (IR01-071) · `features/decision-wizard/FinalDecisionForm.module.css` (IR01-072) · `features/decision-chat/Chat.module.css` (IR01-073) · `features/marketing/PricingSection.module.css` · `pages/success.module.css` (IR01-074)

**Migration files:**
`supabase/migrations/20260601000000_create_subscriptions.sql` · `20260610000000_create_decisions.sql` · `20260610000001_decisions_rls.sql` · `20260610000002_decisions_indexes_trigger.sql` · `20260610000003_create_decision_components.sql` · `20260610000004_decision_components_rls_indexes.sql` · `20260610000005_create_decision_state_transitions.sql` · `20260610000006_create_decision_chat_messages.sql` · `20260610000007_create_insert_chat_exchange.sql` · `20260615000000_create_anonymous_cleanup_cron.sql` · `20260615000001_create_stuck_analysis_cleanup_cron.sql`

**Files modified (existing):**
`pages/_app.js` · `middleware.ts` · `tsconfig.json` · `package.json` · `lib/supabase/client.ts` · `lib/supabase/server.ts` · `context/AuthContext.tsx` · `pages/auth/login.tsx` · `pages/auth/signup.tsx` · `pages/api/auth/callback.ts` · `pages/api/create-checkout.js` (deprecation comment) · `pages/api/webhook.js` (deprecation comment)

---

*DecisionOS | IR01 — MVP Implementation Roadmap*
*Version 1.0 | Status: Draft | June 2026*
*Source of truth: H03, H06, H09, H10, H11, H12, H13 (all Frozen)*
