# DecisionOS — Codebase Audit & Implementation Plan
**Transformation from DecisionPilot to DecisionOS**
*Generated June 2026*

---

## 1. Project Inventory

### 1.1 Pages

| File | Route | Type | Description |
|---|---|---|---|
| `pages/index.js` | `/` | Page | Homepage shell. Dynamically imports `components/App.jsx` with `ssr: false`. Contains all `<Head>` meta, hreflang, fonts, global CSS. |
| `pages/_app.js` | (global) | App wrapper | Wraps all pages with `AuthProvider`, `CookieBanner`, GA4. |
| `pages/auth/login.tsx` | `/auth/login` | Page | Supabase email+password login form. |
| `pages/auth/signup.tsx` | `/auth/signup` | Page | Supabase email+password signup form. Sends confirmation email. |
| `pages/about.js` | `/about` | Page | Static about page. |
| `pages/contact.js` | `/contact` | Page | Static contact page. |
| `pages/cookies.js` | `/cookies` | Page | Cookie policy. |
| `pages/impressum.js` | `/impressum` | Page | German legal imprint. |
| `pages/privacy.js` | `/privacy` | Page | Privacy policy. |
| `pages/terms.js` | `/terms` | Page | Terms of service. |
| `pages/success.js` | `/success` | Page | Stripe payment success redirect page. |
| `pages/go.js` | `/go` | Page/redirect | Amazon Associates affiliate proxy. Rewrites Amazon URLs with affiliate tag. |
| `pages/guides/` | `/guides/*` | Pages (×17) | SEO guide pages. Use `GuideLayout` component. |
| `pages/api/chat.js` | `/api/chat` | API route | Core AI route. Handles two modes: `tree_result` (structured recommendations) and freeform chat messages. |
| `pages/api/compare.js` | `/api/compare` | API route | AI-powered product comparison. Takes array of product names, returns structured comparison. |
| `pages/api/create-checkout.js` | `/api/create-checkout` | API route | Creates Stripe Checkout session for Pro/Premium upgrade. Accepts `plan` and `user_id` in body. |
| `pages/api/webhook.js` | `/api/webhook` | API route | Stripe webhook handler. Listens to `checkout.session.completed` and `customer.subscription.deleted`. Updates Supabase `subscriptions` table. |
| `pages/api/auth/callback.ts` | `/api/auth/callback` | API route | Supabase auth email confirmation handler. Exchanges code for session. |

### 1.2 Components

| File | Size (approx.) | Description |
|---|---|---|
| `components/App.jsx` | 5,211 lines | **Monolith.** Contains: all data (TREES, CAT_I18N, CATEGORY_GROUPS, MARKETS), all UI components (TopNav, CategoryCard, QuestionScreen, LoadingScreen, RecommendationCard, ResultsScreen, CompareSection, Landing, ChatScreen, ProfileModal, FavoritesScreen), global routing state machine (`screen` useState), and utility functions. |
| `components/HeroBanner.jsx` | ~500 lines | Animated hero banner for homepage. Contains `AnimatedGlobe`, `HeroBanner`, and `WorldwideSection` exports. |
| `components/AselCorner.jsx` | Small | Floating Ai·sel mascot corner element. Appears on Landing, Questions, Results screens. |
| `components/AselMascot.jsx` | Medium | Ai·sel SVG mascot graphic. |
| `components/AselPose.jsx` | Medium | Ai·sel pose variants for different screens. |
| `components/CookieBanner.js` | Small | GDPR cookie consent banner. Calls `onAccept` / `onReject` callbacks. |
| `components/GuideLayout.js` | Small | Shared layout wrapper for the 17 SEO guide pages. |
| `components/LegalLayout.jsx` | Small | Shared layout wrapper for legal pages (privacy, terms, cookies, impressum). |
| `components/translations.js` | Large | UI string translations. Exports `LANGUAGES`, `getTranslation`, `detectLanguage`. |

### 1.3 Context and Hooks

| File | Description |
|---|---|
| `context/AuthContext.tsx` | React context providing `user`, `session`, `loading`, `signOut`. Uses `@supabase/ssr` `createBrowserClient` inside `useEffect`. Wraps entire app via `_app.js`. |
| `hooks/useSubscription.js` | Reads `plan` from Supabase `subscriptions` table for the current user. Returns `{ plan, loading }`. Defaults to `'free'` if no row found. |

### 1.4 Library / Infrastructure

| File | Description |
|---|---|
| `lib/supabase/client.ts` | `createBrowserClient` wrapper for client-side Supabase access. |
| `lib/supabase/server.ts` | `createServerClient` wrapper for API routes and SSR contexts. |
| `middleware.ts` | Next.js middleware. Refreshes Supabase session on every request. Runs on all routes except static assets. |

### 1.5 Configuration

| File | Description |
|---|---|
| `tsconfig.json` | TypeScript config. Includes `@/*` path alias mapped to project root. |
| `.env.local` | Local environment variables (not in Git). |
| `.gitignore` | Excludes `node_modules/`, `.next/`, `.env.local`. |
| `next.config.js` | Next.js config (contents unknown — standard setup assumed). |

### 1.6 Data Structures Inside App.jsx

| Identifier | Lines (approx.) | Description |
|---|---|---|
| `TREES` | 32–628 | Questionnaire data. ~600 lines. Maps category ID → array of questions with options. This is the core "decision wizard" data for the current product. |
| `CAT_I18N` | 629–1689 | Category name translations across 30 languages. ~1,060 lines. |
| `CATEGORY_GROUPS` | 1693–1787 | Category taxonomy: groups (Finance, Tech, Auto...) with subcategory lists, colors, icons. |
| `MARKETS` | 2104–2126 | Market config per language: region, currency, hero tag. |
| `UI_T` | 1835–1890 | UI string translations (buttons, labels) for all 30 languages. |
| `C` | 8–17 | Design token object. Colors and shadows. 90% aligned with H08 spec. |

### 1.7 Inline Components Inside App.jsx (Extractable)

| Component | Lines (approx.) | Reusable? |
|---|---|---|
| `TopNav` | 2160–2345 | Yes — already modified to include Login/Logout/Plan badge |
| `CategoryCard` | 2346–2386 | Yes |
| `QuestionScreen` | 2387–2646 | Refactor — proto-Wizard, wrong data model |
| `LoadingScreen` | 2926–3044 | Yes — refactor to H08 analysis loading spec |
| `Badge` | 1821–1833 | Yes |
| `RecommendationCard` | 3174–3380 | Refactor — proto-Recommendation, different data model |
| `ResultsScreen` | 3381–3645 | Refactor — proto-Recommendation View |
| `CompareSection` | 3646–3852 | Remove — post-MVP per H06 |
| `Landing` | 3853–4622 | Refactor — keep marketing sections, replace SPA routing |
| `ChatScreen` | 4623–4736 | Refactor — not anchored to Decision Object |
| `ProfileModal` | 4797–5000 | Remove — replaced by Supabase auth account |
| `FavoritesScreen` | 5001–5072 | Remove — post-MVP |
| `HomeButton` | 2080–2094 | Keep |

### 1.8 Utility Functions Inside App.jsx

| Function | Status |
|---|---|
| `getDecisionCount()` | Dead code — `FREE_DAILY_LIMIT = Infinity`, never enforced |
| `incrementDecisionCount()` | Dead code — called but has no effect |
| `loadProfile()` / `saveProfile()` | Remove — localStorage profile replaced by Supabase auth |
| `loadFavorites()` / `saveFavorites()` | Remove — Favorites is post-MVP |
| `isFavorited()` / `toggleFavorite()` | Remove — Favorites is post-MVP |
| `handleUpgrade()` | Keep — calls `/api/create-checkout`, already accepts `user_id` |
| `calculateMatchScore()` | Keep — used in QuestionScreen scoring logic |
| `getProductLink()` | Keep — affiliate link generator, used in RecommendationCard |
| `getMarket()` | Keep — used for currency and region context in AI calls |
| `catName()` | Keep — i18n category name lookup |
| `getIcon()` | Keep — category icon renderer |
| `uiT()` | Keep — UI translation lookup |
| `img()` | Keep — Unsplash image URL builder |
| `bkg()` | Keep — Booking.com affiliate URL builder |
| `amz()` | Keep — Amazon affiliate URL builder (via `/go` proxy) |

### 1.9 Supabase Database (Current State)

| Table | Columns | Notes |
|---|---|---|
| `auth.users` | (managed by Supabase) | Created automatically on signup |
| `subscriptions` | `id`, `user_id`, `stripe_customer_id`, `stripe_subscription_id`, `plan`, `status`, `created_at`, `updated_at` | RLS enabled. Users can only read their own row. |

**Missing tables (required by H03/H06):** `decisions`, `decision_components`, `decision_chat_messages`. These are Sprint 2+ scope.

---

## 2. Mapping Table

### 2.1 Pages

| Current File | Current Route | Future DecisionOS Route | Action | Notes |
|---|---|---|---|---|
| `pages/index.js` | `/` | `/` | **Refactor** | Keep `<Head>`. Replace `<App />` SPA with proper Next.js page routing. Landing content moves to `features/marketing/`. |
| `pages/_app.js` | (global) | (global) | **Keep** | Already has `AuthProvider`. Add `DecisionContext` provider in Sprint 2. |
| `pages/auth/login.tsx` | `/auth/login` | `/auth/login` | **Refactor** | Functional but unstyled. Apply H08 design tokens. |
| `pages/auth/signup.tsx` | `/auth/signup` | `/auth/signup` | **Refactor** | Functional but unstyled. Apply H08 design tokens. |
| `pages/about.js` | `/about` | `/about` | **Keep** | No changes needed. |
| `pages/contact.js` | `/contact` | `/contact` | **Keep** | No changes needed. |
| `pages/cookies.js` | `/cookies` | `/cookies` | **Keep** | No changes needed. |
| `pages/impressum.js` | `/impressum` | `/impressum` | **Keep** | No changes needed. |
| `pages/privacy.js` | `/privacy` | `/privacy` | **Keep** | No changes needed. |
| `pages/terms.js` | `/terms` | `/terms` | **Keep** | No changes needed. |
| `pages/success.js` | `/success` | `/success` | **Keep** | Stripe redirect. Minor copy update to match DecisionOS branding. |
| `pages/go.js` | `/go` | `/go` | **Keep** | Affiliate proxy. No changes needed. |
| `pages/guides/*` | `/guides/*` | `/guides/*` | **Keep** | SEO value. No changes needed. |
| `pages/api/chat.js` | `/api/chat` | `/api/decision/analyze` | **Refactor** | Rename to match H04 API layer. Split `tree_result` mode into new `analyze` route. Freeform chat moves to `/api/decision/chat`. |
| `pages/api/compare.js` | `/api/compare` | _(removed from MVP)_ | **Remove** | Post-MVP per H06 Out of Scope. |
| `pages/api/create-checkout.js` | `/api/create-checkout` | `/api/billing/checkout` | **Move** | Move to `/api/billing/` per H04 Infrastructure Layer. Logic unchanged. |
| `pages/api/webhook.js` | `/api/webhook` | `/api/billing/webhook` | **Move** | Move to `/api/billing/` per H04. Logic unchanged. |
| `pages/api/auth/callback.ts` | `/api/auth/callback` | `/api/auth/callback` | **Keep** | No changes needed. |
| _(does not exist)_ | — | `/dashboard` | **Create** | Authenticated user dashboard. H05 Workflow 2. |
| _(does not exist)_ | — | `/decision/new` | **Create** | Decision Wizard entry. H05 Workflow 1. |
| _(does not exist)_ | — | `/decision/[id]` | **Create** | Decision Object view (all states). |
| _(does not exist)_ | — | `/history` | **Create** | Decision History. H05 Workflow 4. |

### 2.2 Components

| Current Component | Location | Future Component | Action | Notes |
|---|---|---|---|---|
| `App.jsx` (monolith) | `components/` | Dissolved into feature modules | **Dissolve** | Break into `features/` modules per H04 Architecture Sprint 6+. |
| `TopNav` (inside App.jsx) | `components/App.jsx:2160` | `components/layout/TopNav.jsx` | **Extract + Refactor** | Already functional with auth. Extract to own file. Apply H08 design tokens. |
| `Landing` (inside App.jsx) | `components/App.jsx:3853` | `features/marketing/Landing.jsx` | **Extract + Refactor** | Keep marketing sections. Replace SPA screen routing with Next.js `<Link>`. |
| `QuestionScreen` (inside App.jsx) | `components/App.jsx:2387` | `features/decision-wizard/Wizard.jsx` | **Refactor** | Current uses tree-based multiple choice. Must be refactored to H03 Decision Model (Context → Goal → Constraints → Alternatives). Data model changes completely. |
| `LoadingScreen` (inside App.jsx) | `components/App.jsx:2926` | `components/ui/AnalysisLoading.jsx` | **Extract + Refactor** | Refactor to H08 spec: rotating status messages, not a spinner. |
| `ResultsScreen` (inside App.jsx) | `components/App.jsx:3381` | `features/decision-wizard/RecommendationView.jsx` | **Refactor** | Current shows product grid. Must show H03 structured Recommendation: winner + reasoning + pros/cons/risks per alternative. |
| `RecommendationCard` (inside App.jsx) | `components/App.jsx:3174` | `features/decision-wizard/AlternativeCard.jsx` | **Refactor** | Current shows product. Must show H03 Alternative with pros/cons/risks. |
| `ChatScreen` (inside App.jsx) | `components/App.jsx:4623` | `features/decision-chat/Chat.jsx` | **Refactor** | Current is freeform. Must be anchored to a Decision Object per H05 WF-3 and FR-07. |
| `CompareSection` (inside App.jsx) | `components/App.jsx:3646` | _(removed)_ | **Remove** | Post-MVP per H06. |
| `ProfileModal` (inside App.jsx) | `components/App.jsx:4797` | _(removed)_ | **Remove** | localStorage profile replaced by Supabase auth. |
| `FavoritesScreen` (inside App.jsx) | `components/App.jsx:5001` | _(removed)_ | **Remove** | Post-MVP per H06. |
| `Badge` (inside App.jsx) | `components/App.jsx:1821` | `components/ui/Badge.jsx` | **Extract** | Reusable. Extract and apply H08 spec. |
| `CategoryCard` (inside App.jsx) | `components/App.jsx:2346` | `components/ui/CategoryCard.jsx` | **Extract** | Reusable. Extract as-is. |
| `HomeButton` (inside App.jsx) | `components/App.jsx:2080` | _(absorbed into TopNav)_ | **Remove** | TopNav handles navigation. HomeButton is a workaround for the SPA routing model. |
| `HeroBanner.jsx` | `components/` | `features/marketing/HeroBanner.jsx` | **Move** | Move to features/marketing. No logic changes. |
| `AselCorner.jsx` | `components/` | `components/asel/AselCorner.jsx` | **Move** | Move to asel subfolder per H04 folder structure. |
| `AselMascot.jsx` | `components/` | `components/asel/AselMascot.jsx` | **Move** | Move to asel subfolder. |
| `AselPose.jsx` | `components/` | `components/asel/AselPose.jsx` | **Move** | Move to asel subfolder. |
| `CookieBanner.js` | `components/` | `components/CookieBanner.js` | **Keep** | No changes needed. |
| `GuideLayout.js` | `components/` | `components/legal/GuideLayout.js` | **Move** | Move to legal subfolder. |
| `LegalLayout.jsx` | `components/` | `components/legal/LegalLayout.jsx` | **Move** | Move to legal subfolder. |
| `translations.js` | `components/` | `components/translations.js` | **Keep** | No changes needed. Post-MVP: move to `core/i18n/`. |

### 2.3 Context, Hooks, Lib

| Current File | Future File | Action | Notes |
|---|---|---|---|
| `context/AuthContext.tsx` | `context/AuthContext.tsx` | **Keep** | Fully functional. No changes needed in Sprint 1. |
| `hooks/useSubscription.js` | `hooks/useSubscription.js` | **Keep** | Functional. No changes needed in Sprint 1. |
| `lib/supabase/client.ts` | `lib/supabase/client.ts` | **Keep** | No changes needed. |
| `lib/supabase/server.ts` | `lib/supabase/server.ts` | **Keep** | No changes needed. |
| `middleware.ts` | `middleware.ts` | **Keep** | No changes needed. |
| _(does not exist)_ | `core/decision/Decision.types.ts` | **Create** | Sprint 2. H03 Decision Object type definitions. |
| _(does not exist)_ | `core/decision/Decision.constants.ts` | **Create** | Sprint 2. Decision States, categories. |
| _(does not exist)_ | `context/DecisionContext.tsx` | **Create** | Sprint 2. Current Decision Object state. |
| _(does not exist)_ | `hooks/useDecision.ts` | **Create** | Sprint 2. Primary Decision hook. |

---

## 3. Folder Structure Proposal

This structure implements H04 Architecture while preserving all existing working files.

```
decisionpilot/                          ← repo root (name unchanged for now)
│
├── core/                               ← H04 Core Layer (Sprint 2+)
│   ├── decision/
│   │   ├── Decision.types.ts           ← H03 Decision Object type definition
│   │   ├── Decision.constants.ts       ← Decision States, categories enum
│   │   └── Decision.utils.ts           ← Pure scoring/validation functions
│   └── ai/
│       └── prompts.ts                  ← Centralized AI prompt templates
│
├── features/                           ← H04 Experience Layer (Sprint 2+)
│   ├── decision-wizard/
│   │   ├── Wizard.jsx                  ← Container (replaces QuestionScreen)
│   │   ├── CategorySelect.jsx          ← Step: choose category
│   │   ├── Questionnaire.jsx           ← Steps: Context → Goal → Constraints
│   │   ├── AlternativesInput.jsx       ← Step: Alternatives
│   │   └── RecommendationView.jsx      ← Replaces ResultsScreen
│   ├── decision-chat/
│   │   └── Chat.jsx                    ← Refactored ChatScreen (Decision-anchored)
│   ├── decision-history/
│   │   └── History.jsx                 ← New: Decision History list
│   └── marketing/
│       ├── Landing.jsx                 ← Extracted from App.jsx Landing()
│       ├── HeroBanner.jsx              ← Moved from components/
│       └── PricingSection.jsx          ← Extracted from App.jsx
│
├── components/                         ← H04 UI Layer (reusable, no business logic)
│   ├── layout/
│   │   ├── TopNav.jsx                  ← Extracted from App.jsx (already auth-aware)
│   │   └── PageLayout.jsx              ← New: standard page wrapper
│   ├── ui/
│   │   ├── Badge.jsx                   ← Extracted from App.jsx
│   │   ├── CategoryCard.jsx            ← Extracted from App.jsx
│   │   ├── Button.jsx                  ← New: H08 Button component
│   │   ├── Card.jsx                    ← New: H08 Card component
│   │   ├── ProgressBar.jsx             ← New: Wizard progress indicator
│   │   ├── SaveIndicator.jsx           ← New: auto-save status
│   │   ├── AnalysisLoading.jsx         ← Refactored LoadingScreen
│   │   └── SkeletonCard.jsx            ← New: Dashboard loading skeleton
│   ├── asel/
│   │   ├── AselCorner.jsx              ← Moved
│   │   ├── AselMascot.jsx              ← Moved
│   │   └── AselPose.jsx                ← Moved
│   ├── legal/
│   │   ├── GuideLayout.js              ← Moved
│   │   └── LegalLayout.jsx             ← Moved
│   ├── CookieBanner.js                 ← Kept in place
│   └── translations.js                 ← Kept in place
│
├── context/
│   ├── AuthContext.tsx                 ← Existing (keep)
│   ├── DecisionContext.tsx             ← New (Sprint 2)
│   └── AppContext.tsx                  ← New (Sprint 3+, lang/theme)
│
├── hooks/
│   ├── useSubscription.js              ← Existing (keep)
│   ├── useAuth.ts                      ← New: thin wrapper for useContext(AuthContext)
│   ├── useDecision.ts                  ← New (Sprint 2)
│   └── useDecisionHistory.ts           ← New (Sprint 2+)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   ← Existing (keep)
│   │   └── server.ts                   ← Existing (keep)
│   ├── stripe/
│   │   └── stripe.client.ts            ← New: extract Stripe init from routes
│   └── design-tokens.ts                ← New: H08 C object → typed tokens
│
├── pages/
│   ├── _app.js                         ← Existing (keep, add DecisionContext Sprint 2)
│   ├── index.js                        ← Refactor: replace SPA with proper routing
│   ├── dashboard.tsx                   ← New: authenticated Dashboard (Sprint 2)
│   ├── history.tsx                     ← New: Decision History (Sprint 2)
│   ├── decision/
│   │   ├── new.tsx                     ← New: start a Decision (Sprint 2)
│   │   └── [id].tsx                    ← New: Decision Object view (Sprint 2)
│   ├── auth/
│   │   ├── login.tsx                   ← Existing (style Sprint 1)
│   │   └── signup.tsx                  ← Existing (style Sprint 1)
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback.ts             ← Existing (keep)
│   │   ├── decision/
│   │   │   ├── analyze.js              ← Refactored from api/chat.js (Sprint 2)
│   │   │   ├── save.js                 ← New (Sprint 2)
│   │   │   └── history.js              ← New (Sprint 2)
│   │   └── billing/
│   │       ├── checkout.js             ← Moved from api/create-checkout.js
│   │       └── webhook.js              ← Moved from api/webhook.js
│   ├── about.js                        ← Keep
│   ├── contact.js                      ← Keep
│   ├── cookies.js                      ← Keep
│   ├── impressum.js                    ← Keep
│   ├── privacy.js                      ← Keep
│   ├── success.js                      ← Keep
│   ├── terms.js                        ← Keep
│   ├── go.js                           ← Keep
│   └── guides/                         ← Keep (17 pages)
│
├── docs/
│   └── adr/                            ← Architecture Decision Records (H04 Appendix)
│
├── middleware.ts                        ← Existing (keep)
├── tsconfig.json                        ← Existing (keep)
├── .env.local                           ← Existing (keep)
└── .gitignore                           ← Existing (keep)
```

---

## 4. Sprint 1 Implementation Plan — Authentication Polish

### Scope

Sprint 1 has already implemented authentication at the functional level (Supabase Auth, login/signup pages, AuthContext, middleware, webhook). The remaining Sprint 1 work is:

1. Apply H08 design tokens to `login.tsx` and `signup.tsx`
2. Ensure the auth pages are properly connected to the existing `TopNav` Login/Logout state
3. Add a `useAuth` hook wrapper for cleaner imports
4. Move billing API routes to the correct folder structure
5. Validate all P1 auth acceptance criteria from H06 AC-05

### 4.1 Dependencies to Install

No new npm dependencies required for Sprint 1. All auth dependencies are already installed:
- `@supabase/supabase-js` ✓
- `@supabase/ssr` ✓
- `stripe` ✓
- `typescript` ✓
- `@types/react` ✓
- `@types/node` ✓

### 4.2 Files to Create

**`hooks/useAuth.ts`** — thin wrapper that re-exports `useAuth` from `AuthContext`. Provides a stable import path across the codebase so components import from `hooks/useAuth` rather than `context/AuthContext`.

```typescript
// hooks/useAuth.ts
export { useAuth } from '../context/AuthContext'
```

**`lib/design-tokens.ts`** — exports the H08 color and spacing tokens as a typed object. Replaces the informal `C` object in `App.jsx`. Both can coexist during migration.

```typescript
// lib/design-tokens.ts
export const tokens = {
  color: {
    background:     '#F8F9FC',
    surface:        '#FFFFFF',
    border:         '#E8ECF4',
    borderStrong:   '#C8D0E0',
    textPrimary:    '#0F172A',
    textSecondary:  '#475569',
    textMuted:      '#94A3B8',
    accent:         '#1A56DB',
    accentDark:     '#1240A8',
    accentLight:    '#EFF4FF',
    accentBorder:   '#BFCFFF',
    success:        '#10B981',
    successLight:   '#ECFDF5',
    warning:        '#F59E0B',
    warningLight:   '#FFFBEB',
    danger:         '#EF4444',
    dangerLight:    '#FEF2F2',
  },
  space: {
    1: '4px',  2: '8px',  3: '12px', 4: '16px',
    5: '20px', 6: '24px', 8: '32px', 10: '40px',
    12: '48px', 16: '64px', 20: '80px',
  },
  radius: {
    sm: '6px', md: '10px', lg: '16px', xl: '20px', full: '9999px',
  },
  shadow: {
    xs: '0 1px 2px rgba(0,0,0,0.05)',
    sm: '0 1px 4px rgba(0,0,0,0.07)',
    md: '0 4px 16px rgba(0,0,0,0.08)',
    lg: '0 8px 32px rgba(0,0,0,0.10)',
  },
} as const
```

**`pages/api/billing/checkout.js`** — copy of `pages/api/create-checkout.js`. Zero logic changes.

**`pages/api/billing/webhook.js`** — copy of `pages/api/webhook.js`. Zero logic changes.

### 4.3 Files to Modify

**`pages/auth/login.tsx`** — Replace raw inline styles with H08 design tokens. The form logic (Supabase `signInWithPassword`, redirect) is unchanged. Only the visual layer changes.

Key changes:
- Container: max-width 480px centered, `--color-background` page background
- Heading: `text-xl, font-bold, --font-display`
- Input: H08 Input spec (height 44px, `--color-border`, focus ring)
- Button: H08 primary button spec (height 48px, `--color-accent`)
- Error display: H08 error style (below input, `--color-danger`, explanation not code)
- Link to signup: ghost style, `--color-accent`

**`pages/auth/signup.tsx`** — Same treatment as login.tsx. Logic unchanged.

**`pages/_app.js`** — Add redirect logic: if a user lands on `/auth/login` or `/auth/signup` while already authenticated, redirect to `/dashboard`. Add this check using `useAuth` in the App component or via middleware.

**`middleware.ts`** — Add auth-aware redirect rules:
- Authenticated users visiting `/auth/login` or `/auth/signup` → redirect to `/`
- Unauthenticated users visiting `/dashboard`, `/history`, `/decision/*` → redirect to `/auth/login?return=[original path]`

**`pages/api/create-checkout.js`** — Add deprecation comment: `// @deprecated — use /api/billing/checkout.js`. Keep functional for backward compatibility during migration. Remove in Sprint 2.

**`pages/api/webhook.js`** — Same deprecation comment. Keep functional.

### 4.4 Implementation Order

Execute in this exact order to avoid breaking the live site.

**Step 1 — Create `hooks/useAuth.ts`**
No breaking changes. Additive only.

**Step 2 — Create `lib/design-tokens.ts`**
No breaking changes. Additive only.

**Step 3 — Create `pages/api/billing/` directory and copy routes**
```bash
mkdir -p pages/api/billing
cp pages/api/create-checkout.js pages/api/billing/checkout.js
cp pages/api/webhook.js pages/api/billing/webhook.js
```
Test both new routes work before deprecating originals. New routes are active but not yet called by the frontend.

**Step 4 — Update Stripe webhook URL in Stripe Dashboard**
Change webhook destination from `decisionpilot.tech/api/webhook` to `decisionpilot.tech/api/billing/webhook`. Old route stays active until confirmed.

**Step 5 — Restyle `pages/auth/login.tsx`**
Apply H08 tokens. Test login flow end-to-end before touching signup.

**Step 6 — Restyle `pages/auth/signup.tsx`**
Apply H08 tokens. Test signup + email confirmation + anonymous Decision transfer flow.

**Step 7 — Update `middleware.ts`** with auth redirect rules.
Test unauthenticated access to protected routes. Test authenticated users are not shown login page.

**Step 8 — Add deprecation comments to old billing routes**
```javascript
// pages/api/create-checkout.js
// @deprecated Use /api/billing/checkout instead. Remove in Sprint 2.
```

**Step 9 — Commit and push**
```bash
git add .
git commit -m "Sprint 1 polish: H08 auth styles, billing route migration, useAuth hook"
git push
```

**Step 10 — Verify on Vercel**
Confirm green deploy. Test login, signup, and subscription upgrade end-to-end on production.

### 4.5 Sprint 1 Acceptance Criteria Checklist (H06 AC-05)

- [ ] User can create account with email and password only (no other fields)
- [ ] User can sign in and out
- [ ] User can reset password via email
- [ ] Session persists 30 days without re-authentication
- [ ] Anonymous Decision Objects transfer to new account on signup (already implemented — verify)
- [ ] Auth can be bypassed entirely for Decision creation and viewing (verify login page is not shown mid-flow)
- [ ] `/auth/login` and `/auth/signup` pages are visually consistent with H08 design tokens
- [ ] Input focus states show H08 focus ring (2px solid accent, 2px offset)
- [ ] Error messages are specific, not generic ("Invalid email or password" not "Error 401")
- [ ] `/auth/login?return=` redirect works correctly after sign-in

---

## 5. Technical Debt

The following items are real issues identified in the codebase. Each one maps to a specific conflict with H01–H08. No improvements outside the handbook scope are included.

### TD-01 — Monolith Component (Critical)

`components/App.jsx` is 5,211 lines. It contains data, logic, routing, and UI for the entire product in one file. This directly violates H04 Separation of Concerns (the primary architectural principle). It makes every future feature change risky and slow — editing one section can silently break another.

**Impact:** Every Sprint 2+ feature (Decision Wizard, Dashboard, History) requires extracting from this file. The extraction is non-trivial.

**Resolution:** Dissolve progressively over Sprint 2–4 per the folder structure in Section 3. Do not attempt a full rewrite in one sprint.

### TD-02 — Client-Side Routing via useState (High)

The current product uses `useState('screen')` to manage navigation between Landing, Questions, Results, Chat, and Favorites. This is a single-page app pattern implemented inside Next.js — it bypasses the router entirely. Consequences: no deep linking, no browser back button support (currently hacked with `window.history.pushState`), no server-side rendering of individual screens, no sharable URLs for Decision Objects.

**Impact:** All H05 workflows require URL-based routing (e.g., `/decision/[id]`, `/dashboard`). This debt must be resolved in Sprint 2 before any new Decision screens are built.

**Resolution:** Migrate to Next.js Pages Router. Each screen in H05 becomes a `/pages/` route. The `Landing` component remains as the `/` page. `QuestionScreen` → `/decision/new`. `ResultsScreen` → `/decision/[id]/recommendation`.

### TD-03 — Inline Styles Without Design Token System (Medium)

All styling is done via inline JSX using the `C` constant object. The `C` object partially matches the H08 token spec (8 of 10 primary colors align), but:
- It uses camelCase JS object access instead of CSS variables
- It is not accessible to CSS — pseudo-states (`:hover`, `:focus`) require JS event handlers
- Focus rings are implemented via `onMouseEnter`/`onMouseLeave`, not CSS `:focus-visible` — this breaks keyboard navigation accessibility (H08 Section 14)
- No spacing scale exists — all margins and paddings are hardcoded

**Impact:** Fails H08 DAC-07 Accessibility requirement (focus indicators). Fails H06 FR-12.5 (mobile usability).

**Resolution:** Introduce `lib/design-tokens.ts` (Sprint 1, Step 2 above). Migrate focus states to CSS `:focus-visible` when extracting components into separate files. Full migration happens progressively as components are extracted.

### TD-04 — Dead Code: Decision Counter (Low)

`FREE_DAILY_LIMIT = Infinity`, `getDecisionCount()`, and `incrementDecisionCount()` are present in `App.jsx`. The counter is incremented on every decision start but the limit is never enforced (it is `Infinity`). `showLimitModal` state exists but the modal content says "All decisions are free."

**Impact:** Confusing. `incrementDecisionCount()` writes to `localStorage` on every decision start for no purpose.

**Resolution:** Remove `getDecisionCount`, `incrementDecisionCount`, `FREE_DAILY_LIMIT`, `showLimitModal` state, and the limit modal JSX in Sprint 2 when `App.jsx` is being refactored.

### TD-05 — Dead Code: localStorage Profile and Favorites (Low)

`loadProfile()`, `saveProfile()`, `loadFavorites()`, `saveFavorites()`, `ProfileModal`, and `FavoritesScreen` implement a localStorage-based user profile and favorites system. These are not connected to Supabase. Favorites is explicitly post-MVP per H06. The Profile system is superseded by Supabase auth.

**Impact:** Code that runs in production and writes to `localStorage` without purpose.

**Resolution:** Remove in Sprint 2 when `App.jsx` is refactored. Before removal, verify no other component reads `dp_profile` or `dp_favorites` from localStorage.

### TD-06 — Missing `return` URL on Auth Redirect (Medium)

`middleware.ts` currently handles session refresh but does not implement the `?return=` redirect pattern specified in H08 Section 4 (Information Architecture). A user who is sent to `/auth/login` from a protected route currently lands on `/` after login, not on their intended destination.

**Impact:** Violates H06 AC-05 (`/auth/login?return=` redirect works correctly after sign-in) and H05 WF-1.8 (user who creates account mid-flow is returned to their Decision).

**Resolution:** Implement in Sprint 1 Step 7 (middleware update above).

### TD-07 — `pages/api/compare.js` Is Active but Post-MVP (Low)

The compare API route is live and callable. It is explicitly post-MVP per H06 Out of Scope. No frontend currently calls it (CompareSection was for `compare.js`, but it should not be reachable in the current navigation flow).

**Impact:** Minimal. Route exists but nothing calls it.

**Resolution:** Add a `// @deprecated — post-MVP` comment. Do not remove yet as it costs nothing to keep. Formal removal in the sprint when the API layer is restructured.

### TD-08 — `@supabase/ssr` API Mismatch with Supabase Dashboard Version (Medium)

The Supabase Dashboard now uses a new API key format (Publishable key / Secret key) instead of the legacy anon / service_role format. The `lib/supabase/client.ts` and `lib/supabase/server.ts` files use `NEXT_PUBLIC_SUPABASE_ANON_KEY` which maps to the legacy key tab in the dashboard. This works currently but may break if Supabase deprecates legacy keys.

**Impact:** Not an immediate problem. The legacy keys are still active and functional.

**Resolution:** Monitor Supabase deprecation notices. When legacy keys are deprecated, update environment variables to use Publishable key for `client.ts` and Secret key for `server.ts`. No code change required — only environment variable values change.

### TD-09 — No Type Safety on Decision Data (Medium)

The TREES object, CATEGORY_GROUPS, and all questionnaire data are plain JavaScript with no TypeScript types. The existing `.ts` and `.tsx` files have `strict: false` in `tsconfig.json` (set during Sprint 1 to avoid compilation errors from the existing codebase).

**Impact:** As the codebase adds TypeScript files for the DecisionOS architecture, the boundary between typed and untyped code will cause friction. `strict: false` is a short-term workaround.

**Resolution:** Sprint 2 — add types in `core/decision/Decision.types.ts`. Enable `strict: true` progressively as components are migrated to TypeScript. Do not force this before component extraction begins.

### TD-10 — `_app.tsx` and `_app.js` Coexistence Risk

During Sprint 1, a `_app.tsx` was accidentally created alongside the existing `_app.js`. It was subsequently deleted. If it reappears (e.g., via a template generator or accidental file creation), Next.js will use the `.tsx` version and silently ignore the `.js` version, breaking `AuthProvider`, `CookieBanner`, and GA4.

**Impact:** Potential silent breakage.

**Resolution:** Add a note to the project README: "Do not create `pages/_app.tsx`. The authoritative app wrapper is `pages/_app.js`." Consider renaming `_app.js` to `_app.tsx` in Sprint 2 when the auth components are already TypeScript.

---

*DecisionOS Codebase Audit | June 2026*
*Based on: conversation history, uploaded source files (App.jsx, HeroBanner.jsx, index.js), Architecture Summary from Sprint 1–5, and H01–H08 Company Handbook.*
