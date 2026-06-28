# H10 — Development Standards & Engineering Handbook
**DecisionOS Company Handbook**
*Version 1.0 Final | June 2026*
*Status: Frozen*

---

## Preamble

This document defines every engineering standard, convention, and workflow used in the DecisionOS project. It is the reference every engineer consults before writing code, opening a pull request, or shipping a release.

Standards exist not for their own sake but for specific, traceable reasons. Each convention in this document either prevents a class of bugs, reduces the cost of future changes, or makes the codebase readable to someone encountering it for the first time. When a standard is unclear, refer to the reason first, then derive the correct behavior from it.

H10 is written to be self-contained. A new engineer who has read H09 (Technical Architecture) and H10 should be able to contribute to the codebase on day one without asking how things are done.

**Important note on current state:** The DecisionOS codebase is in an active migration from a legacy single-file SPA (`components/App.jsx`) to the layered architecture defined in H04 and H09. Standards in this document apply fully to all new code. Legacy code is migrated to these standards progressively — it is not held to the same bar before migration, but all newly touched files must meet the standards below.

---

## 1. Coding Conventions

### 1.1 Language Rules

**TypeScript is the default for all new files.** New `.ts` and `.tsx` files are created for all new code. The exceptions are: configuration files that require `.js` (e.g., `next.config.js`), and files that are being minimally touched during migration where converting to TypeScript would add scope beyond the task at hand.

The `tsconfig.json` currently has `strict: false`. This is a migration-phase setting. As legacy `.jsx` files are refactored, `strict: true` is applied to the refactored files via a `// @ts-check` directive or a dedicated `tsconfig.strict.json` override. The long-term target is `strict: true` for the entire codebase.

**JavaScript `.js/.jsx` files** are acceptable only for existing legacy files. No new JavaScript files are created under any circumstances. If a task requires modifying a `.js` file, that file is converted to `.ts`/`.tsx` as part of the same task unless the conversion scope would be disproportionate to the original task.

### 1.2 Formatting

The project uses **Prettier** for code formatting with the following configuration:

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid"
}
```

Prettier runs automatically on save in VS Code (recommended editor) and as a pre-commit hook. A file that does not conform to Prettier formatting must not be committed. Formatting disagreements are not discussed — Prettier's output is the standard.

### 1.3 Linting

ESLint is configured with the following rule sets:
- `eslint:recommended`
- `plugin:@typescript-eslint/recommended`
- `plugin:react/recommended`
- `plugin:react-hooks/recommended`
- `next/core-web-vitals`

ESLint errors block the build on Vercel. ESLint warnings do not block the build but are reviewed weekly and cleared as part of ongoing maintenance. A warning that persists for more than two weeks without a resolution plan becomes an error.

**Rules that are explicitly enabled beyond the defaults:**

```json
{
  "no-console": ["warn", { "allow": ["error", "warn"] }],
  "@typescript-eslint/explicit-function-return-type": "error",
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-unused-vars": "error",
  "react/prop-types": "off",
  "react/react-in-jsx-scope": "off",
  "import/order": ["warn", {
    "groups": ["builtin", "external", "internal", "parent", "sibling"],
    "newlines-between": "always"
  }]
}
```

**`no-console`** is set to `warn` with exceptions for `console.error` and `console.warn`. `console.log` is not permitted in committed code. All debugging output must use `console.error` or be removed before commit.

**`@typescript-eslint/no-explicit-any`** is an error. The `any` type defeats the purpose of TypeScript. When a type is genuinely unknown, use `unknown` and narrow it explicitly.

### 1.4 Import Order

All files follow a consistent import order enforced by ESLint `import/order`:

```typescript
// 1. Node.js built-ins
import { readFile } from 'fs'

// 2. External packages
import { createBrowserClient } from '@supabase/ssr'
import type { NextApiRequest, NextApiResponse } from 'next'

// 3. Internal — absolute paths via @/ alias
import { useAuth } from '@/hooks/useAuth'
import type { DecisionObject } from '@/core/decision/Decision.types'

// 4. Internal — relative paths (only when @/ would be awkward)
import { formatComponent } from './utils'

// 5. CSS / styles (none in this project — inline styles only)
```

A blank line separates each group. Imports within a group are sorted alphabetically. Type imports use the `import type` syntax to enable better tree-shaking and to make the intent explicit.

### 1.5 Comments

**Code comments explain why, not what.** Code that requires a comment to explain what it does should be refactored to be self-explanatory. Comments that survive this test explain intent, constraints, and trade-offs.

```typescript
// ✓ explains a non-obvious constraint
// Supabase requires raw body for webhook signature validation.
// bodyParser must be false or constructEvent() will throw.
export const config = { api: { bodyParser: false } }

// ✗ explains the obvious
// Set the status to in_analysis
decision.status = 'in_analysis'
```

**Deprecated code** is marked with `// @deprecated` followed by what to use instead and the sprint in which it will be removed:

```typescript
// @deprecated — use /api/billing/checkout instead. Remove in Sprint 2.
export default async function handler(req, res) { ... }
```

**TODO comments** are not permitted in `core/` or `features/`. In other locations, a TODO must include a sprint reference:

```typescript
// TODO Sprint 3: migrate this to useDecision hook
```

A TODO without a sprint reference is a linting error.

---

## 2. Naming Conventions

All naming in the DecisionOS codebase follows these rules without exception. When in doubt, favor clarity over brevity.

### 2.1 Files and Directories

| Entity | Convention | Example |
|---|---|---|
| React component | `PascalCase.tsx` | `RecommendationView.tsx` |
| React hook | `useCamelCase.ts` | `useDecision.ts` |
| Context | `PascalCaseContext.tsx` | `DecisionContext.tsx` |
| Type definitions | `PascalCase.types.ts` | `Decision.types.ts` |
| Constants | `PascalCase.constants.ts` | `Decision.constants.ts` |
| Utility functions | `PascalCase.utils.ts` | `Decision.utils.ts` |
| API route | `kebab-case.ts` | `analyze.ts`, `create-checkout.ts` |
| Configuration | `kebab-case.config.ts` | `stripe.config.ts` |
| Test file | Same name as file under test + `.test.ts` | `Decision.utils.test.ts` |
| Directory | `kebab-case` | `decision-wizard/`, `decision-chat/` |

### 2.2 TypeScript Identifiers

| Entity | Convention | Example |
|---|---|---|
| Interface | `PascalCase`, no `I` prefix | `DecisionObject`, `AnalysisOutput` |
| Type alias | `PascalCase` | `DecisionStatus`, `ComponentName` |
| Enum | `PascalCase` (enum name), `SCREAMING_SNAKE_CASE` (values) | `DecisionStatus.IN_ANALYSIS` |
| Function | `camelCase` | `buildAnalysisPrompt`, `validateOutput` |
| Variable | `camelCase` | `decisionId`, `promptVersion` |
| Constant (module-level) | `SCREAMING_SNAKE_CASE` | `PROMPT_VERSIONS`, `MAX_HISTORY_LENGTH` |
| React component | `PascalCase` | `RecommendationView`, `WizardStep` |
| React prop | `camelCase` | `onSubmit`, `isLoading`, `decisionId` |
| CSS class | `kebab-case` | `.dp-fav-count`, `.nav-stats` |
| CSS variable | `--kebab-case` | `--color-accent`, `--space-4` |
| Database table | `snake_case` | `decision_components`, `subscriptions` |
| Database column | `snake_case` | `user_id`, `prompt_version`, `is_current` |

### 2.3 Boolean Naming

Booleans and boolean-returning functions use a readable prefix:

```typescript
// ✓ correct
const isLoading = true
const hasAnalysis = false
const canSubmit = false
function isValidDecision(d: DecisionObject): boolean
function hasHardConstraints(c: ConstraintsComponent): boolean

// ✗ incorrect
const loading = true
const analysis = false
function validDecision(d: DecisionObject): boolean
```

### 2.4 Event Handler Naming

Event handlers in React components use the `handle` prefix for the function and `on` prefix for the prop:

```typescript
// Component definition
function WizardStep({ onNext, onBack }: Props) {
  const handleNext = () => {
    // logic
    onNext()
  }
  return <button onClick={handleNext}>Continue</button>
}

// Usage
<WizardStep onNext={handleStepComplete} onBack={handleStepBack} />
```

### 2.5 Async Function Naming

Async functions that fetch or mutate data use a verb that describes the operation:

```typescript
async function fetchDecision(id: string): Promise<DecisionObject>
async function saveComponent(input: SaveInput): Promise<void>
async function runAnalysis(input: AnalysisInput): Promise<AnalysisOutput>
async function claimAnonymousDecision(token: string, userId: string): Promise<void>
```

---

## 3. TypeScript Rules

### 3.1 Explicit Return Types

All exported functions and all component definitions have explicit return types. Internal helper functions (not exported, not components) may omit return types when the inference is obvious.

```typescript
// ✓ exported function — explicit return type required
export function buildAnalysisPrompt(input: DecisionAnalysisInput): PromptPair {
  return { system: '...', user: '...' }
}

// ✓ React component — explicit return type required
export function RecommendationView({ decision }: Props): JSX.Element {
  return <div>...</div>
}

// ✓ internal helper — inference acceptable
function formatConstraints(constraints: ConstraintItem[]) {
  return constraints.map(c => `${c.type}: ${c.description}`).join('\n')
}
```

### 3.2 No `any`

The `any` type is an error per the ESLint configuration. Use `unknown` when the type is genuinely indeterminate and narrow it with type guards:

```typescript
// ✗ prohibited
function parseAIResponse(raw: any): AnalysisOutput {
  return raw as AnalysisOutput
}

// ✓ correct
function parseAIResponse(raw: unknown): AnalysisOutput {
  if (!isAnalysisOutput(raw)) {
    throw new Error('AI_RESPONSE_SCHEMA_MISMATCH')
  }
  return raw
}

function isAnalysisOutput(value: unknown): value is AnalysisOutput {
  return (
    typeof value === 'object' &&
    value !== null &&
    'per_alternative' in value &&
    Array.isArray((value as Record<string, unknown>).per_alternative)
  )
}
```

### 3.3 Discriminated Unions Over Optional Fields

Prefer discriminated unions over multiple optional fields that have complex mutual exclusion rules:

```typescript
// ✗ unclear — when is runner_up_id present?
interface RecommendationOutput {
  recommended_alternative_id: string
  runner_up_id?: string
  tie_detected?: boolean
  tie_explanation?: string
}

// ✓ clear — the state determines which fields are present
type RecommendationOutput =
  | {
      tie_detected: false
      recommended_alternative_id: string
      runner_up_id: string | null
      tie_explanation: null
    }
  | {
      tie_detected: true
      recommended_alternative_id: null
      runner_up_id: null
      tie_explanation: string
    }
```

### 3.4 Readonly for Shared Data

Data that flows through multiple layers without modification uses `Readonly<T>` or `readonly` arrays to prevent accidental mutation:

```typescript
export interface DecisionAnalysisInput {
  readonly decision_id: string
  readonly alternatives: readonly AlternativeInput[]
  readonly constraints: {
    readonly hard: readonly ConstraintItem[]
    readonly soft: readonly ConstraintItem[]
  }
}
```

### 3.5 Type Guards Over Type Assertions

Type assertions (`as SomeType`) are prohibited except in two cases: test fixtures and JSON parse results that have been immediately validated by a type guard. Prefer type guards that prove the type at runtime.

### 3.6 Enums

String enums are used for all status fields, category fields, and other values that appear in the database or in API responses. Numeric enums are not used.

```typescript
// core/decision/Decision.constants.ts
export const DecisionStatus = {
  DRAFT: 'draft',
  IN_ANALYSIS: 'in_analysis',
  WAITING_FOR_USER: 'waiting_for_user',
  DECISION_MADE: 'decision_made',
  EXECUTING: 'executing',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const

export type DecisionStatus = typeof DecisionStatus[keyof typeof DecisionStatus]

// Usage
if (decision.status === DecisionStatus.DRAFT) { ... }
```

Using `as const` with a plain object (rather than TypeScript `enum`) ensures the values are literal string types, compatible with database storage and JSON serialization.

---

## 4. React Rules

### 4.1 Component Structure

Every React component file follows this internal structure in order:

```typescript
// 1. External imports
import { useState, useEffect } from 'react'

// 2. Internal imports
import { useAuth } from '@/hooks/useAuth'
import type { DecisionObject } from '@/core/decision/Decision.types'

// 3. Type definitions (props interface, local types)
interface Props {
  decision: DecisionObject
  onAdvance: (to: DecisionStatus) => Promise<void>
}

// 4. Component constants (values used only in this component)
const SAVE_DEBOUNCE_MS = 800

// 5. Component function
export function RecommendationView({ decision, onAdvance }: Props): JSX.Element {
  // 5a. Hooks — in this order: state, refs, context, custom hooks, effects
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    // side effects
  }, [decision.id])

  // 5b. Derived values (computed from props/state, no side effects)
  const hasRecommendation = decision.recommendation !== null
  const recommendation = decision.recommendation

  // 5c. Event handlers
  const handleRecordDecision = async () => {
    setIsLoading(true)
    await onAdvance(DecisionStatus.DECISION_MADE)
    setIsLoading(false)
  }

  // 5d. Return JSX
  return (
    <div style={{ ... }}>
      {/* content */}
    </div>
  )
}

// 6. Default export (only if the file exports a single component)
export default RecommendationView
```

### 4.2 Hooks Rules

Custom hooks live in `hooks/`. They follow these rules:

- A hook that reads server data must handle three states: loading, error, and data.
- Hooks do not contain JSX. They return data and functions.
- Hooks that call the API use `useCallback` for the fetch function to prevent unnecessary re-creation.
- Hooks that set up subscriptions (e.g., `supabase.auth.onAuthStateChange`) clean up in the `useEffect` return function.

```typescript
// hooks/useDecision.ts
export function useDecision(id: string): UseDecisionResult {
  const [decision, setDecision] = useState<DecisionObject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDecision = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/decision/${id}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setDecision(data.decision)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDecision()
  }, [fetchDecision])

  return { decision, isLoading, error, refetch: fetchDecision }
}
```

### 4.3 Props

- Props are always destructured in the function signature.
- Props interfaces are always defined. Inline prop types are not used.
- Default values are set in the destructuring, not in the props interface.
- Callback props are always typed with their full signature — `() => void` is too generic.

```typescript
// ✓ correct
interface Props {
  label: string
  isDisabled?: boolean
  onSubmit: (values: WizardStepValues) => Promise<void>
}

function WizardStep({ label, isDisabled = false, onSubmit }: Props): JSX.Element { ... }

// ✗ incorrect — inline type, callback too generic
function WizardStep({ label, onClick }: { label: string, onClick: Function }) { ... }
```

### 4.4 Conditional Rendering

Conditional rendering uses the ternary operator or logical `&&` for simple cases. For complex conditions, extract the conditional logic before the return statement:

```typescript
// ✓ simple — ternary in JSX
{isLoading ? <AnalysisLoading /> : <RecommendationBlock recommendation={recommendation} />}

// ✓ complex — extracted before return
const content = (() => {
  if (isLoading) return <AnalysisLoading />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!recommendation) return <EmptyState />
  return <RecommendationBlock recommendation={recommendation} />
})()

return <div>{content}</div>
```

### 4.5 Keys in Lists

Every list-rendered element has a stable, unique `key` prop. The key is never the array index unless the list is static (never reordered, never filtered, never has items removed).

```typescript
// ✓ stable key from data
{alternatives.map(alt => (
  <AlternativeCard key={alt.id} alternative={alt} />
))}

// ✗ index as key — unstable if list changes
{alternatives.map((alt, i) => (
  <AlternativeCard key={i} alternative={alt} />
))}
```

### 4.6 Inline Styles

Per H08 and H09, all styles are inline using design tokens from `lib/design-tokens.css`. The style attribute receives a plain object. Style objects that are reused within a component are extracted to a `const` before the return statement:

```typescript
const styles = {
  container: {
    maxWidth: 720,
    margin: '0 auto',
    padding: 'var(--space-6)',
  },
  heading: {
    fontSize: 'var(--text-2xl)',
    fontWeight: 'var(--font-black)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-display)',
  },
} as const

return (
  <div style={styles.container}>
    <h2 style={styles.heading}>{recommendation.recommended_alternative_name}</h2>
  </div>
)
```

Style objects are not defined inline in the JSX when they contain more than two properties.

---

## 5. Next.js Conventions

### 5.1 Pages

Every page file in `pages/` exports a single default component. The component name matches the file name:

```typescript
// pages/dashboard.tsx
export default function DashboardPage(): JSX.Element { ... }

// pages/decision/[id].tsx
export default function DecisionPage(): JSX.Element { ... }
```

Page components do not contain business logic. They are responsible for:
- Fetching initial server-side data via `getServerSideProps`
- Passing that data to feature components
- Rendering the page layout

```typescript
// pages/decision/[id].tsx
import { DecisionView } from '@/features/decision-wizard/DecisionView'
import { PageLayout } from '@/components/layout/PageLayout'
import type { GetServerSideProps } from 'next'

interface Props {
  decisionId: string
}

export default function DecisionPage({ decisionId }: Props): JSX.Element {
  return (
    <PageLayout>
      <DecisionView decisionId={decisionId} />
    </PageLayout>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const { id } = context.params as { id: string }
  // Auth check — redirect if not authenticated
  return { props: { decisionId: id } }
}
```

### 5.2 API Routes

Every API route follows this exact structure. No exceptions:

```typescript
// pages/api/decision/analyze.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'

interface AnalyzeRequest {
  decision_id: string
}

interface AnalyzeResponse {
  recommendation?: RecommendationOutput
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzeResponse>
): Promise<void> {
  // 1. Method guard — always first
  if (req.method !== 'POST') {
    return void res.status(405).end()
  }

  // 2. Auth check — always second for protected routes
  const supabase = createClient({ req, res })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user || authError) {
    return void res.status(401).json({ error: 'Authentication required' })
  }

  // 3. Input validation — always third
  const { decision_id } = req.body as AnalyzeRequest
  if (!decision_id) {
    return void res.status(400).json({ error: 'decision_id is required' })
  }

  // 4. Business logic — wrapped in try/catch
  try {
    // ... processing
    return void res.status(200).json({ recommendation })
  } catch (error) {
    console.error('[api/decision/analyze]', error)
    return void res.status(500).json({ error: 'Analysis failed. Please try again.' })
  }
}
```

Note: `return void res.status(...)` is preferred over just `return res.status(...)` to make it explicit that the function returns `void` and that the response has been sent.

### 5.3 `getServerSideProps`

`getServerSideProps` is used for pages that require authentication or user-specific data. It must:

1. Verify the session using `createClient`
2. Redirect to `/auth/login?return=[current path]` if not authenticated
3. Return only serializable props (no class instances, no functions, no `undefined` values)

```typescript
export const getServerSideProps: GetServerSideProps = async context => {
  const supabase = createClient(context)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      redirect: {
        destination: `/auth/login?return=${context.resolvedUrl}`,
        permanent: false,
      },
    }
  }

  return { props: { userId: user.id } }
}
```

### 5.4 Dynamic Imports

Components that are heavy (the legacy `App.jsx`), client-only (use browser APIs), or conditionally rendered are loaded with `next/dynamic`:

```typescript
import dynamic from 'next/dynamic'

// Legacy monolith — SSR disabled
const App = dynamic(() => import('@/components/App'), { ssr: false })

// Heavy feature component — loaded only when needed
const DecisionWizard = dynamic(
  () => import('@/features/decision-wizard/Wizard'),
  { loading: () => <WizardSkeleton /> }
)
```

### 5.5 Environment Variables in Next.js

Variables accessed in browser code must be prefixed `NEXT_PUBLIC_`. Variables accessed only in server-side code must not have this prefix. This is enforced by Next.js at build time — server-only variables throw if accessed in browser code.

If an environment variable is missing, the API route that depends on it must return a clear error rather than failing silently:

```typescript
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('[api/decision/analyze] ANTHROPIC_API_KEY not configured')
  return void res.status(500).json({ error: 'Service not configured. Contact support.' })
}
```

---

## 6. API Conventions

### 6.1 Request and Response Shape

All API routes use JSON for both request and response. The `Content-Type` header is `application/json`.

**Request validation:** All required fields are checked before any processing. Missing fields return `400` with a specific error message naming the missing field.

**Success response:** Always includes the relevant data object at the top level. Never wraps in a `data` key unless the response contains multiple top-level concepts:

```typescript
// ✓ single resource
{ "decision": { ... } }

// ✓ list resource
{ "decisions": [...], "total": 42, "page": 1 }

// ✗ unnecessary wrapper
{ "data": { "decision": { ... } } }
```

**Error response:** Always `{ "error": "string" }`. The error string is human-readable and specific. It does not expose internal implementation details, stack traces, or database error messages.

### 6.2 Status Codes

| Code | When to use |
|---|---|
| `200` | Successful GET, successful POST that returns data |
| `201` | Successful POST that creates a new resource |
| `204` | Successful DELETE or POST that returns no body |
| `400` | Invalid or missing input parameters |
| `401` | Not authenticated (no valid session) |
| `403` | Authenticated but not authorized (user does not own the resource) |
| `404` | Resource not found (or intentionally obscured — see §6.3) |
| `405` | HTTP method not allowed |
| `409` | Conflict (e.g., state transition not permitted) |
| `429` | Rate limited |
| `500` | Internal server error (unexpected exception) |
| `503` | External service unavailable (e.g., Anthropic down) |

### 6.3 404 vs 403 for Unauthorized Resources

When a user requests a resource that exists but belongs to another user, return `404`, not `403`. Returning `403` confirms the resource exists and leaks information. Returning `404` makes the behavior identical to a genuinely missing resource.

```typescript
// ✓ correct — same response whether decision belongs to another user or doesn't exist
const { data: decision } = await supabase
  .from('decisions')
  .select('*')
  .eq('id', decision_id)
  .eq('owner_id', user.id)  // RLS enforces this, but explicit check is clearer
  .single()

if (!decision) {
  return void res.status(404).json({ error: 'Decision not found' })
}
```

### 6.4 Idempotency

API routes that mutate data should be idempotent where possible — calling the same endpoint with the same input twice should produce the same result without creating duplicate records. The `decision_components` table's upsert pattern (mark old as `is_current = false`, insert new) achieves this.

### 6.5 Rate Limiting

MVP does not implement explicit rate limiting at the application level. Vercel's built-in function invocation limits and Anthropic's API rate limits are the effective constraints.

When rate limits are encountered from Anthropic (HTTP 429), the API route returns `503` to the client with the message "The AI service is temporarily busy. Please try again in a moment."

---

## 7. Git Workflow

### 7.1 Current Strategy (Solo Operation)

The DecisionOS project is currently a solo operation. The branch strategy is therefore minimal:

- `main` is the production branch. It is always deployable.
- Feature work is done locally and pushed directly to `main` when ready and manually tested.
- There are no long-lived feature branches.
- There is no staging environment. Local `npm run dev` with `.env.local` is the testing environment.

This strategy is explicitly temporary. It is revisited when a second engineer joins the project.

### 7.2 Future Branch Strategy (Team Operation)

When the team grows beyond one engineer, the following branch strategy is adopted:

```
main          ← production, always deployable
  └── develop ← integration branch, deployed to staging
        ├── feature/[ticket-id]-[short-description]
        ├── fix/[ticket-id]-[short-description]
        └── chore/[ticket-id]-[short-description]
```

**Branch types:**

| Prefix | Purpose | Example |
|---|---|---|
| `feature/` | New functionality | `feature/DOS-42-decision-wizard-context-step` |
| `fix/` | Bug fix | `fix/DOS-51-analysis-timeout-state-revert` |
| `chore/` | Maintenance, refactoring, dependency updates | `chore/DOS-60-migrate-app-jsx-topnav` |
| `hotfix/` | Critical production fix, branched from `main` | `hotfix/DOS-99-webhook-signature-failure` |

**Branch naming rules:**
- All lowercase
- Hyphens to separate words
- Ticket ID always included
- Description is 2–5 words maximum
- No spaces, no special characters beyond hyphens

### 7.3 Commit Message Standards

DecisionOS uses the **Conventional Commits** specification. Every commit message follows this format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | A new feature (correlates to a MINOR version) |
| `fix` | A bug fix (correlates to a PATCH version) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `chore` | Maintenance tasks (dependency updates, tooling) |
| `docs` | Documentation changes only |
| `test` | Adding or correcting tests |
| `perf` | Performance improvement |
| `style` | Formatting changes that do not affect logic |
| `ci` | Changes to CI/CD configuration |

**Scope** is the area of the codebase affected:

| Scope | Area |
|---|---|
| `auth` | Authentication, AuthContext, auth pages |
| `decision` | Decision Object, Decision Engine, Wizard |
| `analysis` | AI Analysis Engine, prompts |
| `recommendation` | Recommendation Engine, Recommendation View |
| `chat` | AI Chat Interface, Chat Engine |
| `billing` | Stripe, webhooks, subscription |
| `db` | Database schema, migrations |
| `api` | API routes |
| `ui` | Shared UI components |
| `deps` | Dependencies |

**Examples:**

```
feat(decision): add do-nothing alternative suggestion in Wizard

Implements FR-02.9. After the user enters their alternatives,
the system checks for an inaction option and prompts to add one
if absent.

fix(analysis): revert Decision to draft state on AI timeout

Previously, a timeout left the Decision in in_analysis state
indefinitely. This commit adds the state reversion in the
catch block of the timeout race condition.

chore(deps): upgrade @supabase/ssr to 0.3.0

Breaking change: createServerClient API signature changed.
Updated lib/supabase/server.ts accordingly.

BREAKING CHANGE: lib/supabase/server.ts requires req/res pair
passed as context object, not separate arguments.
```

**Rules for commit messages:**

- Subject line is 72 characters maximum
- Subject line is imperative mood ("add feature" not "added feature" or "adds feature")
- No period at the end of the subject line
- Body (when present) is wrapped at 100 characters
- Body explains *what* and *why*, not *how*
- Footer references the relevant requirement: `Implements FR-02.9`, `Fixes H09 TAC-04`

### 7.4 Commit Size

Each commit addresses one logical change. Commits that mix refactoring with new features, or bug fixes with formatting changes, are split into separate commits. A reviewer should be able to understand what a commit does without reading the diff.

**Atomic commits are preferred over large commits.** Committing frequently (multiple times per working session) is encouraged. Squashing into a single commit before push is acceptable only when the individual commits were exploratory and the final state represents a clean, single logical change.

---

## 8. Pull Request Standards

### 8.1 When Pull Requests Are Used

In the current solo-operation phase, pull requests are not required. When the team grows, all changes to `main` (or `develop` in the team workflow) require a pull request.

### 8.2 Pull Request Template

Every pull request uses this template:

```markdown
## What
[1–3 sentences describing what this PR does]

## Why
[1–3 sentences describing why this change is needed. Reference the handbook 
section, requirement ID, or bug report that motivates this PR]

## How
[Brief explanation of the implementation approach. Focus on non-obvious decisions]

## Requirements
- [ ] Implements: [FR-XX / H09 TAC-XX / Bug #XX]
- [ ] All new code is TypeScript
- [ ] All new functions have explicit return types
- [ ] No `console.log` in committed code
- [ ] No `any` types introduced
- [ ] No hardcoded colors outside `lib/design-tokens.css`
- [ ] Tests added for new `core/` functions
- [ ] `npm run build` passes locally
- [ ] Manually tested the affected user flow end-to-end

## Screenshots (if UI change)
[Before / After screenshots or recordings]

## Notes for reviewer
[Anything the reviewer should pay special attention to, or known trade-offs]
```

### 8.3 Pull Request Size

A pull request should be reviewable in 30 minutes. If a PR would take longer, it should be split.

As a guideline, a PR that adds more than 500 lines of net new code (excluding generated files, migrations, and lock files) should be examined to see whether it can be split. This is a guideline, not an absolute rule — some features are inherently large.

---

## 9. Code Review Checklist

This checklist is used by the reviewer for every pull request. It is not exhaustive — reviewers exercise judgment — but every item must be considered before approval.

### 9.1 Correctness

- [ ] The change does what the PR description says it does
- [ ] Edge cases are handled (empty arrays, null values, network failures)
- [ ] Error cases return appropriate responses and do not leave the system in an inconsistent state
- [ ] Decision State transitions are valid (no skipped states)
- [ ] RLS policies are not bypassed without documented justification

### 9.2 Architecture

- [ ] The change is in the correct layer (H04 layer boundaries not violated)
- [ ] Features do not import from other features
- [ ] `core/` has no framework dependencies
- [ ] API routes do not import from `features/` or `components/`
- [ ] No new global state introduced without discussion

### 9.3 TypeScript

- [ ] No `any` types
- [ ] All exported functions have explicit return types
- [ ] Type assertions are justified or replaced with type guards
- [ ] New interfaces are in the appropriate `.types.ts` file

### 9.4 Security

- [ ] No secrets, keys, or tokens in code
- [ ] No `NEXT_PUBLIC_` prefix on server-only variables
- [ ] No user data logged with `console.error` (IDs are acceptable, content is not)
- [ ] No RLS bypass without `service_role` being the explicit intent

### 9.5 React and Next.js

- [ ] No `any` prop types
- [ ] Keys in lists are stable and unique
- [ ] useEffect dependencies are correct (no missing or unnecessary dependencies)
- [ ] No state mutations — always `setState` with a new value
- [ ] API routes follow the standard structure (method guard → auth → validate → logic)

### 9.6 AI System (when applicable)

- [ ] Prompts are in `core/ai/prompts.ts`, not in API routes
- [ ] `prompt_version` is set and stored for all AI-generated components
- [ ] Output is validated against schema before persisting
- [ ] Hard constraint enforcement is not bypassed
- [ ] Chat routes write only to `decision_chat_messages`, not to `decision_components`

### 9.7 Style and Standards

- [ ] Prettier formatting is applied
- [ ] No `console.log` in committed code
- [ ] No `TODO`/`FIXME` without sprint reference
- [ ] No `// @ts-ignore` without an explanatory comment
- [ ] Import order is correct

### 9.8 Tests (when applicable)

- [ ] New `core/` functions have unit tests
- [ ] Tests cover the failure path, not only the happy path
- [ ] Test names describe the expected behavior, not the implementation

---

## 10. Folder Ownership

Each top-level directory has a designated owner. The owner is responsible for:
- Reviewing all PRs that substantially modify their area
- Maintaining the conventions within their area
- Flagging when a change in their area violates H04 layer boundaries

In the current solo-operation phase, all folders have a single owner: the founding engineer. When the team grows, ownership is assigned explicitly.

| Directory | Owner (current) | Description |
|---|---|---|
| `core/` | Founding Engineer | Decision types, constants, utils, AI prompts |
| `features/` | Founding Engineer | Feature modules per H04 Experience Layer |
| `components/` | Founding Engineer | Shared UI components |
| `context/` | Founding Engineer | React contexts |
| `hooks/` | Founding Engineer | Custom React hooks |
| `lib/` | Founding Engineer | Infrastructure clients, design tokens |
| `pages/api/` | Founding Engineer | All API routes |
| `pages/` (non-API) | Founding Engineer | Page components |
| `docs/adr/` | Founding Engineer | Architecture Decision Records |

When a PR substantially modifies a directory, the directory owner must be a reviewer. "Substantially modifies" means: new files added, existing interfaces changed, or layer boundaries affected.

---

## 11. Testing Strategy

### 11.1 Testing Philosophy

Tests exist to give the team confidence to change code without fear of undetected regressions. Every test must justify its existence by answering: "What regression does this prevent?"

Tests that test implementation details (private functions, internal state) are not useful — they break when the implementation changes and tell us nothing about whether the behavior is correct. Tests that test behavior (given these inputs, expect these outputs) survive refactoring and catch real regressions.

### 11.2 Test Stack

| Tool | Purpose |
|---|---|
| **Vitest** | Unit and integration tests |
| **React Testing Library** | React component tests |
| **MSW (Mock Service Worker)** | API mocking in component tests |
| **Playwright** | End-to-end browser tests (post-MVP) |

Vitest is preferred over Jest for its native TypeScript support and Vite-compatible configuration.

### 11.3 What Is Tested

**`core/` functions — always tested.** Pure functions with clear inputs and outputs are the highest value test target. Every function in `core/decision/Decision.utils.ts`, `core/decision/Decision.types.ts` (type guards), and `core/ai/prompts.ts` must have unit tests.

**API route logic — tested for critical paths.** The following API route behaviors must be tested:
- Hard constraint enforcement in the Recommendation Engine
- State reversion on AI analysis failure
- Anonymous Decision Object transfer on account creation
- Stripe webhook signature validation (simulated)

**React components — tested for interaction.** Components in `features/` that handle user decisions (Wizard steps, Final Decision recording, confirmation dialogs) must have component tests that simulate user interaction and verify the correct callbacks are invoked.

**What is not tested in MVP:**
- Styling and visual appearance
- Third-party library internals
- Static pages
- Environment variable configuration

### 11.4 Test Structure

Test files live alongside the code they test:

```
core/
  decision/
    Decision.utils.ts
    Decision.utils.test.ts
    Decision.types.ts
    Decision.types.test.ts
```

Each test file uses `describe` blocks to group related tests and `it` (or `test`) for individual test cases. Test names are written in plain English describing the expected behavior:

```typescript
// core/decision/Decision.utils.test.ts
import { describe, it, expect } from 'vitest'
import { validateStateTransition } from './Decision.utils'
import { DecisionStatus } from './Decision.constants'

describe('validateStateTransition', () => {
  it('allows draft → in_analysis', () => {
    expect(validateStateTransition(
      DecisionStatus.DRAFT,
      DecisionStatus.IN_ANALYSIS
    )).toBe(true)
  })

  it('rejects draft → completed (skipped states)', () => {
    expect(validateStateTransition(
      DecisionStatus.DRAFT,
      DecisionStatus.COMPLETED
    )).toBe(false)
  })

  it('rejects completed → decision_made (backwards transition)', () => {
    expect(validateStateTransition(
      DecisionStatus.COMPLETED,
      DecisionStatus.DECISION_MADE
    )).toBe(false)
  })
})
```

### 11.5 Test Coverage Target

MVP target: **80% line coverage for `core/` functions**. Coverage below 80% in `core/` blocks the build.

Coverage for `features/` and `components/` is tracked but not enforced as a build gate in MVP. The target is 60% line coverage for feature components.

Coverage reports are generated with `vitest --coverage` and stored in `.coverage/` (gitignored).

### 11.6 Running Tests

```bash
# All tests
npm test

# Tests with coverage
npm run test:coverage

# Tests in watch mode (development)
npm run test:watch

# Single file
npm test -- Decision.utils.test.ts
```

---

## 12. Error Logging

### 12.1 Logging Standard

All error logging uses `console.error`. `console.log` and `console.info` are not permitted in committed code. `console.warn` is permitted for deprecation notices and non-critical warnings.

Every `console.error` call follows this format:

```typescript
console.error('[module-name]', error, { context_key: context_value })
```

The first argument is always a string identifying the module or function. This makes logs searchable by source. The error object is always the second argument. Additional context (IDs, inputs) is the third argument as a plain object.

```typescript
// ✓ correct
console.error('[api/decision/analyze]', error, { decision_id, user_id: user.id })

// ✗ incorrect — no module identifier, context mixed in
console.error('Analysis failed:', error.message, decision_id)
```

### 12.2 What Is Logged

**Always log:**
- Unhandled exceptions in API routes (with decision_id and user_id)
- AI analysis failures (with engine name, prompt version, failure category)
- Webhook validation failures
- Database write failures

**Never log:**
- User-provided content (decision context, chat messages, personal information)
- Authentication tokens, session tokens, or secrets
- Full request/response bodies from external APIs

**Log with care (IDs only, not content):**
- Decision IDs
- User IDs
- Subscription plan names

### 12.3 Log Retrieval

In MVP, logs are accessed via the Vercel Dashboard → Functions → Logs. Logs are retained for 30 days on the Vercel Pro plan. For incidents older than 30 days, Supabase audit logs (for database events) and the `decision_state_transitions` table are the primary forensic tools.

Post-MVP: an error monitoring service (Sentry or equivalent) is integrated. AI failure events trigger alerts when the failure rate exceeds 2% in any 1-hour window.

---

## 13. Performance Practices

### 13.1 Frontend Performance

**Minimize bundle size.** Every added dependency must justify its bundle size impact. Use `next build` output and Vercel's build analytics to monitor bundle size after each dependency addition. A new dependency that adds more than 50KB to the client bundle requires explicit sign-off.

**Code splitting is automatic.** Next.js code-splits by page. Additional splits are made with `next/dynamic` for heavy components (the `App.jsx` monolith, the Decision Wizard, the Recommendation View).

**Images.** All local images use `next/image`. All external images use explicit `width` and `height` to prevent layout shift. Lazy loading is the default.

**Fonts.** Google Fonts are loaded with `display=swap` to prevent invisible text. Only the weights actually used are loaded.

**Core Web Vitals.** The target is Lighthouse Performance score ≥ 80 in mobile simulation. LCP < 2.5s, CLS < 0.1, FID < 100ms.

### 13.2 API Performance

**Database query efficiency.** All queries use indexed columns. `EXPLAIN ANALYZE` is run on any query that touches tables with more than 1,000 expected rows before the query is deployed. Results are included in the ADR if a new index is required.

**Supabase client initialization.** The Supabase client for server-side use is initialized once per module (outside the handler function) to be reused across warm serverless invocations:

```typescript
// lib/supabase/server.ts
// The client is created per-request because it needs req/res cookies.
// The configuration is module-level to avoid re-reading env vars.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
```

**Stripe and Anthropic clients** are initialized once at module scope in the respective route files.

**AI request timeout.** All Anthropic API calls are wrapped in a 29-second timeout race, leaving 1 second for response overhead within Vercel's 30-second function limit. A response that exceeds 29 seconds fails gracefully — the Decision Object is not left in `in_analysis` state.

### 13.3 Performance Anti-Patterns

The following patterns are explicitly prohibited because they have caused performance issues:

- **Nested Supabase queries** (N+1): All list fetches use joins or a single query with `.in()`.
- **Unindexed filter columns**: Any new `WHERE` clause on a table with >1,000 rows must have a corresponding index.
- **Blocking imports**: Imports of heavy modules (the full `App.jsx`, large data files) at the page level instead of via `next/dynamic`.
- **`useEffect` without dependency arrays**: Causes infinite re-renders.
- **`useState` for derived values**: If a value can be computed from props or other state, it should not be state.

---

## 14. Security Checklist

This checklist is applied before every release and on any PR that touches authentication, API routes, database schema, or external service integrations.

### 14.1 Secrets

- [ ] No secrets in source code
- [ ] No secrets in git history (use `git log` and `git grep` to verify before pushing)
- [ ] `.env.local` is in `.gitignore`
- [ ] All secrets are in Vercel Environment Variables, not in `next.config.js` or any committed file
- [ ] `NEXT_PUBLIC_` prefix is absent from server-only secrets
- [ ] Stripe webhook secret is validated on every webhook request

### 14.2 Authentication

- [ ] Session cookie is HTTP-only (verified in browser DevTools)
- [ ] All protected API routes check `supabase.auth.getUser()` before processing
- [ ] Anonymous Decision Objects are not accessible after their 48-hour expiry
- [ ] Password reset tokens expire after 24 hours (Supabase default)

### 14.3 Authorization

- [ ] RLS is enabled on all user-data tables
- [ ] An API route that accesses user data verifies resource ownership explicitly, even when RLS is active
- [ ] Resources belonging to another user return `404`, not `403`
- [ ] `service_role` key is used only in webhook and background job routes

### 14.4 Input

- [ ] All user-provided text is sanitized before injection into AI prompts
- [ ] SQL injection is not possible (all queries use Supabase SDK parameter binding)
- [ ] No `eval()` or `Function()` calls
- [ ] File uploads are not accepted in MVP (no attack surface)

### 14.5 Dependencies

- [ ] `npm audit` shows no HIGH or CRITICAL vulnerabilities
- [ ] All dependencies are pinned to exact versions in `package-lock.json`
- [ ] No unmaintained packages (last published >2 years ago)

---

## 15. Documentation Rules

### 15.1 What Requires Documentation

**Code documentation (JSDoc)** is required for:
- All exported functions in `core/`
- All exported TypeScript interfaces that are not self-documenting from their field names
- All functions that implement non-obvious algorithms or business rules

**Handbook updates** are required for:
- Any change to the folder structure defined in H09
- Any new environment variable
- Any change to the database schema
- Any new AI prompt or prompt version increment
- Any new external dependency

**ADRs** are required per H04 Appendix:
- Any change to the layer boundaries defined in H04
- Any change to the database schema that adds or removes a table
- Any change to the AI prompt major version

### 15.2 JSDoc Standard

```typescript
/**
 * Validates a Decision State transition against the allowed transitions
 * defined in H03 §Decision States.
 *
 * @param from - The current Decision State
 * @param to - The proposed new Decision State
 * @returns true if the transition is valid, false otherwise
 *
 * @example
 * validateStateTransition('draft', 'in_analysis') // true
 * validateStateTransition('completed', 'draft')   // false
 */
export function validateStateTransition(
  from: DecisionStatus,
  to: DecisionStatus
): boolean { ... }
```

### 15.3 README

The project root `README.md` contains:
- A one-paragraph description of the project
- Prerequisites (Node.js version, npm version)
- Setup instructions (clone, install, `.env.local` setup)
- Development commands (`npm run dev`, `npm test`, `npm run build`)
- Links to the handbook (H09 for architecture, H10 for this document)
- A note that `pages/_app.tsx` must not be created (known footgun from migration)

---

## 16. Definition of Done

A feature or change is **Done** when all of the following are true:

### 16.1 Code

- [ ] All code follows the standards in this document (H10)
- [ ] All new code is TypeScript
- [ ] ESLint passes with no errors
- [ ] Prettier formatting applied
- [ ] No `console.log`, no `any` types, no `TODO` without sprint reference
- [ ] All exported functions in `core/` have JSDoc
- [ ] No `TODO` or `FIXME` in `core/` or `features/`

### 16.2 Tests

- [ ] Unit tests written for all new `core/` functions
- [ ] Tests cover at least one failure path
- [ ] `npm test` passes
- [ ] Coverage for `core/` is ≥ 80%

### 16.3 Build

- [ ] `npm run build` passes locally with no TypeScript errors
- [ ] Vercel deployment is green
- [ ] No console errors in the browser on the affected user flow

### 16.4 Functionality

- [ ] The feature works end-to-end in the browser
- [ ] The feature works on mobile (375px width, tested in Chrome DevTools)
- [ ] Error states are handled and displayed per H08 §17
- [ ] The feature does not break any existing flow (manual regression check on home → Wizard → Recommendation)

### 16.5 Requirements

- [ ] All relevant acceptance criteria from H06 are met
- [ ] If an AI component was changed: all relevant AAC criteria from H10 (AI System Specification) are met
- [ ] If a database change was made: the handbook is updated

### 16.6 Security

- [ ] Security checklist (§14) passed
- [ ] No new secrets introduced in code

---

## 17. Release Checklist

This checklist is completed before every production deployment that includes new features or changes to the database schema. Hotfixes follow an abbreviated version (§17.3).

### 17.1 Pre-Deployment

- [ ] All changes are committed to `main`
- [ ] `npm run build` passes locally
- [ ] All required environment variables are set in Vercel Dashboard
- [ ] If database schema changed: migration has been applied to the production Supabase project
- [ ] If new Stripe products/prices were added: Price IDs in Vercel env vars are updated
- [ ] If AI prompts changed: prompt version constants in `core/ai/prompts.ts` are incremented
- [ ] If new ADR was written: it is committed to `docs/adr/`

### 17.2 Post-Deployment Verification

Run within 15 minutes of every production deployment:

- [ ] Homepage loads without console errors
- [ ] Login and signup work end-to-end
- [ ] A Decision Object can be started (Category selected, Wizard opens)
- [ ] AI analysis completes successfully for one test Decision
- [ ] A Recommendation is displayed
- [ ] Final Decision can be recorded
- [ ] Dashboard loads for an authenticated user
- [ ] Stripe Checkout can be opened (but not completed — no test payment in production)
- [ ] Vercel Functions logs show no new errors

### 17.3 Hotfix Process

For critical production bugs:

1. Identify the issue from Vercel logs or user report
2. Reproduce locally
3. Write a failing test that captures the bug (if the bug is in testable code)
4. Fix the bug
5. Verify the fix passes the test
6. Push directly to `main`
7. Verify the abbreviated post-deployment checklist:
   - Homepage loads
   - The specific broken flow works
   - No new errors in Vercel logs

A hotfix ADR is written within 24 hours if the fix touches architecture, database schema, or AI behavior.

---

## 18. Engineering Principles

These principles summarize the philosophy behind the specific rules in this document. When a situation arises that is not covered by a specific rule, apply these principles to derive the correct behavior.

**Correctness before performance.** A slow feature that works correctly is preferable to a fast feature with subtle bugs. Optimize only after measuring — and only for measured bottlenecks.

**Explicit over implicit.** Explicit type annotations, explicit return statements, explicit error handling. When code can be interpreted in two ways, it should be written so that only one interpretation is possible.

**Layer boundaries are not suggestions.** The H04 layer architecture is the organizing principle of the codebase. Violating a layer boundary for convenience is technical debt with compound interest. Every violation makes the next violation easier to justify.

**The handbook is the source of truth, not the code.** When the code diverges from the handbook, the code is wrong. When the handbook needs to change, write an ADR and update the handbook — do not silently update the code.

**New engineers should feel confident on day one.** Every standard in this document exists to make the codebase predictable. Predictability is what allows a new engineer to contribute without fear of breaking something they do not understand.

---

*DecisionOS Company Handbook | H10 — Development Standards & Engineering Handbook*
*Version 1.0 Final | Status: Frozen*
*Owner: Founding Team | Next review: Q4 2026*
