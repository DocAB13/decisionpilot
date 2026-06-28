# Implementation Gap Report — H08 UX & Design System
**DecisionOS | June 2026**
*Compares the live decisionpilot.tech codebase against H08 v1.0 Final*

---

## Executive Summary

The existing codebase shares the same color values and typographic intent as H08, which means the visual foundation is correctly positioned. However, the implementation method — pure inline JSX styles via the `C` object — systematically prevents several H08 requirements from being met: CSS pseudo-states, focus rings, `prefers-reduced-motion`, `rem`-based font sizing, and `aria-live` regions. These are not cosmetic gaps; they affect accessibility, keyboard navigation, and WCAG AA compliance.

The structural gaps are larger: no Dashboard exists, no Decision Wizard conforming to H03 exists, no Recommendation Screen conforming to H08 §9 exists, no bottom navigation, no skeleton loading states, no Save Indicator, and no empty states meeting the H08 spec. These are Sprint 2–3 work.

The single area of strongest conformance is the color palette and the AI Chat layout, which is close to H08 §11.

---

## Section 1 — Respects H08

Items the current codebase correctly implements.

---

### 1.1 Color Values

**Component:** `const C` in `components/App.jsx`
**Status:** ✅ Respects H08

The C object values match H08 §5 Design System colors with high fidelity:

| H08 Token | H08 Value | Current Value | Match |
|---|---|---|---|
| `--color-background` | `#F8F9FC` | `C.bg: #F8F9FC` | ✓ |
| `--color-surface` | `#FFFFFF` | `C.surface: #FFFFFF` | ✓ |
| `--color-border` | `#E8ECF4` | `C.border: #E8ECF4` | ✓ |
| `--color-text-primary` | `#0F172A` | `C.text: #0F172A` | ✓ |
| `--color-text-secondary` | `#475569` | `C.textSecondary: #475569` | ✓ |
| `--color-text-muted` | `#94A3B8` | `C.muted: #94A3B8` | ✓ |
| `--color-accent` | `#1A56DB` | `C.accent: #1A56DB` | ✓ |
| `--color-accent-dark` | `#1240A8` | `C.accentDark: #1240A8` | ✓ |
| `--color-accent-light` | `#EFF4FF` | `C.accentLight: #EEF3FF` | ~(1 digit off) |

---

### 1.2 Font Families

**Component:** Used throughout `App.jsx` and loaded in `pages/index.js`
**Status:** ✅ Respects H08

Both fonts required by H08 §5 Typography are loaded and applied correctly:
- `'Inter'` is used as the base body font throughout.
- `'Plus Jakarta Sans'` is used for headings and display text via `fontFamily: "'Plus Jakarta Sans', sans-serif"`.
- Both are loaded via Google Fonts in `pages/index.js`.

---

### 1.3 AI Chat Layout

**Component:** `ChatScreen` in `components/App.jsx:4623`
**Status:** ✅ Respects H08

The Chat layout is structurally consistent with H08 §11:
- Scrollable message area with oldest messages at top, newest at bottom.
- User messages right-aligned with accent background.
- AI messages left-aligned with surface background.
- Input pinned to bottom.
- Auto-scroll to latest message via `useRef` + `scrollIntoView`.

---

### 1.4 Box Shadow Scale

**Component:** `const C` in `components/App.jsx`
**Status:** ✅ Respects H08

The three shadow levels in C match the H08 §5 Elevation spec:

| H08 | Value | Current |
|---|---|---|
| `--shadow-sm` | `0 1px 4px rgba(0,0,0,0.07)` | `C.shadow: 0 1px 4px rgba(15,23,42,0.08)` | ~close |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.08)` | `C.shadowMd: 0 4px 16px rgba(15,23,42,0.10)` | ~close |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.10)` | `C.shadowLg: 0 12px 40px rgba(15,23,42,0.13)` | ~close |

---

### 1.5 Loading Screen — Rotating Status Messages

**Component:** `LoadingScreen` in `components/App.jsx:2926`
**Status:** ✅ Respects H08 (partially — see §2 for gaps)

H08 §16 requires rotating status messages during AI analysis, not a spinner. The current `LoadingScreen` already implements this pattern: a list of steps with opacity transitions and an interval that advances through them every 1,200ms. The concept is correct.

---

### 1.6 Border Radius Approximation

**Component:** Used throughout `App.jsx`
**Status:** ✅ Respects H08 (approximately)

Most border-radius values in the codebase are `10px`, `12px`, `16px`, `20px` — all within the H08 §5 radius scale (`--radius-md: 10px`, `--radius-lg: 16px`, `--radius-xl: 20px`).

---

### 1.7 Transition Durations

**Component:** Used throughout `App.jsx`
**Status:** ✅ Respects H08

Transition durations of `0.15s`, `0.18s`, `0.2s`, `0.3s` are used throughout, consistent with the H08 §5 transition tokens (`--transition-fast: 150ms`, `--transition-base: 200ms`, `--transition-slow: 300ms`).

---

## Section 2 — Partially Respects H08

Items that are directionally correct but incomplete or inconsistently applied.

---

### 2.1 Button Component

**Component:** All buttons throughout `App.jsx`; `pages/auth/login.tsx`; `pages/auth/signup.tsx`
**What exists:** Buttons are styled inline with varied padding, border-radius, and color values. The primary action color (`C.accent`) is used consistently for primary buttons.
**What H08 requires:** A unified Button component with four variants (primary, secondary, ghost, danger), two sizes (md: 40px height, lg: 48px height), defined states (hover, focus, disabled, loading), and a consistent label verb convention.
**Gap:** No component exists. No height enforcement (most buttons use padding only, resulting in heights below 40px). No loading state. No disabled state styling. Multiple "primary" buttons appear on the same screen in some views (violation of UX-P1). Danger variant does not exist; destructive actions use unthemed styles.
**Priority:** High
**Effort:** Medium

---

### 2.2 Progress Indicator (Wizard)

**Component:** `QuestionScreen` in `components/App.jsx:2550`
**What exists:** A segmented bar at the bottom of the immersive hero header. Segments correspond to individual questions (up to ~8), not to the 4 Wizard sections (Context, Goal, Constraints, Alternatives) defined in H08 §8. Segments are white on a dark background overlay. Uses `height: 3–5px` depending on the current step, which matches the H08 4px spec approximately.
**What H08 requires:** Progress bar at the top of the Wizard container (not inside a hero image). Four segments representing the four H03 components (Context, Goal, Constraints, Alternatives). Colors: active = `--color-accent`, completed = `--color-success`, inactive = `--color-border`. Always visible, does not scroll away.
**Gap:** Positioned incorrectly (inside hero, not above content). Number of segments is wrong (per question, not per section). Color scheme is white-on-dark instead of accent/success/border. Not always visible — it is inside a scrollable hero image header.
**Priority:** High
**Effort:** Medium (resolved when Wizard is rebuilt in Sprint 2)

---

### 2.3 Card Component

**Component:** Used throughout `App.jsx` and in pricing section
**What exists:** Card-like containers are built inline with `background: C.card`, `borderRadius: 16–20px`, `border: 1px solid C.border`, and various shadow values. Consistent enough to be recognizable.
**What H08 requires:** A unified Card component at `--radius-lg (16px)`, `24px` padding desktop / `16px` mobile, `--shadow-sm` default with `--shadow-md` on hover. No nested cards.
**Gap:** No extraction into a component. Padding values vary widely (12px to 36px). No hover elevation transition defined. Some views nest card-like elements inside other card-like elements (RecommendationCard inside ResultsScreen's outer container).
**Priority:** Medium
**Effort:** Small (component extraction) + Medium (padding audit)

---

### 2.4 Badge Component

**Component:** `Badge` function in `App.jsx:1821`; plan badge in `TopNav`
**What exists:** A `Badge` function exists and renders a `<span>` with inline styles. The plan badge (PRO/PREMIUM) in TopNav uses hardcoded colors (`#F59E0B`, `#1A56DB`).
**What H08 requires:** Badge with `height: 22px`, `padding: 2px 8px`, `--radius-sm (6px)`, `text-xs (11px)`, `font-bold`, uppercase, `letter-spacing: 0.5px`. Decision State badges must use the `--color-state-*` token set.
**Gap:** Existing `Badge` uses `font-size: 11px` and `font-weight: 700` correctly, but `border-radius: 6px` is not consistently applied. No Decision State color tokens exist in the codebase yet (`--color-state-draft`, `--color-state-analysis`, etc.) — these are entirely new. Plan badges use direct hex values, not tokens.
**Priority:** Medium
**Effort:** Small

---

### 2.5 Recommendation / Results Screen

**Component:** `ResultsScreen` in `App.jsx:3381`; `RecommendationCard` in `App.jsx:3174`
**What exists:** A results screen that shows a product grid (up to 3 picks) with product name, brand, scores, pros/cons, affiliate links, and an Ai·sel tip. The data comes from the AI and is displayed as cards.
**What H08 requires:** A structured Recommendation Block as the primary element (accent-light background, recommended alternative as `text-2xl font-black`, primary reasoning in `text-md`, conditions for change visible by default). Below it: alternative cards each showing pros/cons/risks. "Record My Decision" CTA pinned to bottom on mobile. Chat entry point visible without scrolling.
**Gap:** The current design shows a product grid, not a H08 Recommendation Block. The winning pick is not prominently called out as `text-2xl font-black`. "Conditions for change" is not shown. There is no "Record My Decision" CTA (no Final Decision step exists). No chat entry point within the results view.
**Priority:** High
**Effort:** Large (requires both UI refactor and data model change in Sprint 2)

---

### 2.6 Responsive Layout (Mobile)

**Component:** Throughout `App.jsx`; `pages/index.js` global styles
**What exists:** Some media queries exist in inline `<style>` blocks targeting `640px`, `768px`, `900px`, `1024px` breakpoints. The Landing and ResultsScreen have responsive grid columns. The Wizard hero scales with `clamp()`.
**What H08 requires:** Breakpoints at exactly `375px`, `768px`, `1024px`. Bottom navigation on mobile (375px–767px). All interactive elements `44px` minimum touch target. Font sizes in `rem` (not `px`). One question per full screen on mobile in Wizard.
**Gap:** No `375px` breakpoint anywhere. No bottom navigation. Touch targets are not enforced — many buttons use `padding: 6px 12px` which falls below 44px in height. All font sizes are in `px`, not `rem`. The Wizard does not present one question per full screen on mobile — the hero header and question card scroll together.
**Priority:** High
**Effort:** Large

---

### 2.7 TopNav — Authenticated State

**Component:** `TopNav` in `App.jsx:2160`
**What exists:** Shows Login button (anonymous) or `email · Logout` with optional PRO/PREMIUM badge (authenticated). Uses `C.accent` background for Login, ghost style for Logout. Plan badge uses correct colors.
**What H08 requires:** Right side: "New Decision" button (primary) + user avatar/account menu (authenticated). Left: wordmark linking to Dashboard. Center: empty or in-context Decision title.
**Gap:** Current nav shows category row (second row of pills) which H08 §3 does not include in the global nav structure. Logo name still reads "DecisionPilot" not "DecisionOS". No "New Decision" primary button. No user avatar menu — just email text + Logout. Center has a search bar, not a Decision title (search is not in H08 MVP nav structure). The category pill row is a current-product feature not in H08 nav spec — it will need to be reconsidered when routing is moved to Next.js pages.
**Priority:** Medium (branding) / High (structural — after routing migration)
**Effort:** Medium

---

### 2.8 Information Architecture / URL Structure

**Component:** `pages/` directory; routing in `App.jsx` via `useState('screen')`
**What exists:** All product views (Landing, Questions, Results, Chat, Favorites) are rendered by a single SPA state machine inside `components/App.jsx`. The URL never changes as the user navigates between screens.
**What H08 requires:** URL-based routing per §4: `/decision/new`, `/decision/[id]`, `/decision/[id]/recommendation`, `/dashboard`, `/history`, with `?return=` parameter support on auth pages.
**Gap:** Complete absence of URL routing for product views. No `/dashboard`, `/decision/*`, `/history` routes exist. Auth pages (`/auth/login`, `/auth/signup`) exist correctly.
**Priority:** High
**Effort:** Large (foundational — Sprint 2)

---

### 2.9 Form Inputs — Auth Pages

**Component:** `pages/auth/login.tsx`; `pages/auth/signup.tsx`
**What exists:** Raw `<input>` elements with `padding: 8px`, `display: block`, `width: 100%`, `marginBottom: 12`. No labels. No focus styling. Error shown as `<p style={{ color: 'red' }}>`.
**What H08 requires:** `height: 44px`, `border: 1px solid --color-border`, `--radius-md (10px)`, `padding: 0 14px`. Visible `<label>` above each input. Focus state: `border-color --color-accent`, `box-shadow: 0 0 0 3px --color-accent-light`. Error state: below the input, `--color-danger`, `text-sm`. Optional fields labeled "(optional)" — required is the default assumption.
**Gap:** No labels. No H08 height enforcement. No focus ring. No H08 error display. No aria attributes.
**Priority:** High
**Effort:** Small

---

### 2.10 LoadingScreen — Analysis State

**Component:** `LoadingScreen` in `App.jsx:2926`
**What exists:** Rotating step messages (conceptually correct), category-specific animation, progress through steps every 1,200ms.
**What H08 requires:** Full-screen container (720px max-width centered), rotating messages every 4–6 seconds (not 1,200ms), a horizontal progress bar that fills progressively (not step circles), footer text confirming "This usually takes 10–20 seconds. Your inputs are saved."
**Gap:** Step interval is 1,200ms (too fast). Uses numbered circles with checkmarks, not a horizontal fill bar. No footer confirmation text. Uses a category animation (good for polish but not specified in H08). Max-width not constrained to 720px — it is centered but unbounded at 520px.
**Priority:** Medium
**Effort:** Small

---

## Section 3 — Does Not Respect H08

Items that are entirely absent or fundamentally different from H08 requirements.

---

### 3.1 CSS Variables / Design Token System

**Component:** Global
**What exists:** All design values are in the `C` JavaScript object. No CSS custom properties (`var(--*)`) exist for color, spacing, radius, or shadow. The only CSS variables used are ad-hoc local ones in inline `<style>` blocks for category pill colors (`--pill-color`, `--pill-bg`).
**What H08 requires:** All tokens from §5 defined as CSS custom properties on `:root`. Usage via `var(--color-accent)` etc., enabling pseudo-states, media queries, and theming without JavaScript.
**Impact:** Without CSS variables, CSS pseudo-states (`:hover`, `:focus-visible`, `:disabled`) cannot use design tokens. Every hover and focus state currently requires JavaScript `onMouseEnter`/`onMouseLeave` handlers — this breaks keyboard navigation because `:focus` is not visually indicated.
**Priority:** High
**Effort:** Medium (create the token file; migrate progressively as components are extracted)

---

### 3.2 Focus Rings / Keyboard Navigation

**Component:** All interactive elements throughout `App.jsx`
**What exists:** `outline: "none"` on inputs (explicit suppression). Hover states implemented via JS event handlers. No `:focus-visible` styles anywhere.
**What H08 requires (§14 Accessibility):** `2px solid --color-accent` with `2px offset` on all focused elements. Never `outline: none` without a custom replacement. All interactive elements reachable and operable by keyboard (Tab, Shift+Tab, Enter, Space, Escape, Arrow keys).
**Impact:** This is a WCAG 2.1 AA failure. Any user navigating by keyboard or using a screen reader cannot see which element is focused. This directly fails H08 DAC-07.
**Priority:** High
**Effort:** Medium (requires CSS variable system first, then CSS `:focus-visible` rules)

---

### 3.3 Font Sizes in rem

**Component:** All text throughout `App.jsx`, `pages/auth/login.tsx`, `pages/auth/signup.tsx`
**What exists:** All `fontSize` values are in `px` (e.g., `fontSize: 13`, `fontSize: 14`, `fontSize: 16`).
**What H08 requires (§13 Mobile):** All font sizes in `rem` with root `font-size: 16px`. This is required to respect the user's system font size settings.
**Impact:** Users who increase their device font size (common for accessibility) receive no benefit. This fails H08 DAC-06.
**Priority:** High
**Effort:** Medium (systematic change across all components)

---

### 3.4 `prefers-reduced-motion`

**Component:** All animations in `App.jsx` (fadeUp, aselLoadPulse, loadFloat, loadBounce, etc.)
**What exists:** Multiple `@keyframes` animations defined in inline `<style>` blocks. None are wrapped in `@media (prefers-reduced-motion: no-preference)` or suppressed by `@media (prefers-reduced-motion: reduce)`.
**What H08 requires (§14 Accessibility, §18 Microinteractions):** All animations and transitions must respect `prefers-reduced-motion`. When set to `reduce`, transitions are instant (0ms) and no animations play.
**Priority:** High
**Effort:** Small (one CSS media query block added per `<style>` element; global CSS rule added to `index.js`)

---

### 3.5 Dashboard

**Component:** Does not exist
**What exists:** When authenticated, the user lands on the same homepage (`/`) as an anonymous user. There is no authenticated-specific starting screen.
**What H08 requires (§10 Dashboard UX):** 1200px max-width layout, left filter panel (Decision State, Category, date range), Decision Object list grouped by Active/Completed/Archived, priority indicators on objects requiring action, skeleton cards during load.
**Priority:** High
**Effort:** Large (Sprint 2 — new page + new data model)

---

### 3.6 Decision Wizard per H03

**Component:** `QuestionScreen` in `App.jsx:2387` exists but does not conform
**What exists:** A questionnaire screen driven by the `TREES` data structure. Each question offers multiple-choice options. The user taps an option and the next question appears automatically (no explicit Continue button). No text inputs. No free-form context collection.
**What H08 requires (§8 Decision Wizard UX):** Four sections (Context → Goal → Constraints → Alternatives). One question per screen. Visible reason text beneath each question. Navigation row with [Back] [Skip for now] [Continue]. Auto-save indicator (top-right, "Saving..." / "Saved"). Backward navigation warning when AI analysis exists. Conflict detection display. Alternatives as a card-list input with "Add another option" up to five. "Do nothing" alternative prompt.
**Gap:** Completely different data model. Current Wizard is tree-based multiple choice; H08 Wizard collects open-ended H03 components. The current QuestionScreen is the legacy product — it will coexist until Sprint 2 replaces it.
**Priority:** High
**Effort:** Large (Sprint 2 — new component, new data model, new API)

---

### 3.7 Save Indicator

**Component:** Does not exist
**What exists:** No auto-save feedback mechanism anywhere in the product.
**What H08 requires (§7 Component Library — Save Indicator, §8 Decision Wizard UX):** Top-right corner of Wizard container shows "Saving..." (spinner + text, `--color-text-muted`) while saving, then "Saved" (checkmark + text, `--color-success`) fading out after 2 seconds. "Not saved" in `--color-danger` if save fails.
**Priority:** High (UX trust signal)
**Effort:** Small (component creation) + Medium (wiring to auto-save logic in Sprint 2)

---

### 3.8 Bottom Navigation (Mobile)

**Component:** Does not exist
**What exists:** No bottom navigation bar. On mobile, the top navigation (with search bar and language picker) is shown. For anonymous users, a floating "Start a Decision" button is not present.
**What H08 requires (§3 Navigation, §13 Mobile):** On mobile (375px–767px): bottom navigation bar with Home, New Decision (center, prominent), History. For anonymous users: bottom nav not shown; a single floating action button "Start a Decision" on homepage.
**Priority:** High
**Effort:** Medium (Sprint 2 — new component, conditional rendering)

---

### 3.9 Skeleton Loading States (Dashboard)

**Component:** Does not exist (Dashboard doesn't exist yet)
**What exists:** `LoadingScreen` shows a full-page animated category illustration while AI analysis runs. No skeleton cards for list/grid loading.
**What H08 requires (§16 Loading States):** Dashboard uses skeleton cards (animated shimmer placeholders) while Decision Objects load. Skeletons match the size and shape of real Decision Object cards. Page transitions use a 2px progress bar at the top of the viewport.
**Priority:** Medium (Sprint 2 — part of Dashboard implementation)
**Effort:** Small

---

### 3.10 Empty States

**Component:** Does not exist per H08 spec
**What exists:** `FavoritesScreen` shows an "empty" message when no favorites exist ("No saved favorites yet."). This is post-MVP per H06 and will be removed.
**What H08 requires (§15 Empty States):** Three specific empty states: Empty Dashboard (heading, illustration, single CTA "Start a Decision"), Empty History (heading, explanation, no CTA), Empty filter result ("No decisions match this filter" + "Clear filters" ghost button). Each must not use apology language, not use error language, always explain what will appear and when.
**Priority:** Medium (Sprint 2 — part of Dashboard and History implementation)
**Effort:** Small

---

### 3.11 Error States per H08 Spec

**Component:** Auth pages, `ResultsScreen`, `ChatScreen`
**What exists:** Error messages in auth pages use `<p style={{ color: 'red' }}>`. `ResultsScreen` shows a centered emoji + text + retry button on AI failure. `ChatScreen` appends an error message to the chat.
**What H08 requires (§17 Error States):** AI Analysis failure: specific screen with warning illustration (not red), heading, body confirming data is preserved, [Try again] primary + [Save and come back later] ghost. Network error: bottom-center toast, 320px wide, auto-dismiss 6 seconds, "Retry" text button within the toast. Validation error: below the field, `--color-danger`, specific explanation of decision consequence. 404: specific heading and CTA per user type. Session expired: full-page overlay with sign-in redirect.
**Gap:** No toast system. No session expired overlay. Error colors are hardcoded (`red`) not using `--color-danger`. Error messages do not explain decision consequences. No distinction between AI failure screen and generic error.
**Priority:** High (AI failure) / Medium (others)
**Effort:** Medium

---

### 3.12 Confirmation Dialogs

**Component:** Does not exist per H08 spec
**What exists:** No confirmation dialogs for destructive actions. The Delete Decision Object action (from Dashboard) does not exist yet, so there is no confirmation to evaluate. The "Cancel subscription" flow goes to Stripe directly.
**What H08 requires (§12 Forms & Validation):** Inline card overlay confirmation (not `window.confirm()`), with specific title, body explaining irreversibility, [Cancel] ghost left / [Yes, delete] danger right.
**Priority:** Medium (Sprint 2 — with Dashboard)
**Effort:** Small

---

### 3.13 Inline Validation Timing

**Component:** Auth pages; `QuestionScreen`; `CompareSection`
**What exists:** Auth page validation fires on submit (correct for form-level). `QuestionScreen` has no validation — it is all tap-to-select. `CompareSection` validates inline with a `setErr()` call that replaces the entire result.
**What H08 requires (§12 Forms & Validation):** Inline validation fires on blur (not on keystroke). Form-level validation on submit. Fields never pre-marked as error before user interaction.
**Gap:** Auth pages fire correctly. Other forms not yet built. The main gap is the auth pages missing blur-based inline validation and H08-spec error display. Pre-marking is not an issue currently.
**Priority:** Medium
**Effort:** Small

---

### 3.14 Microinteraction — Button Press Scale

**Component:** All buttons
**What exists:** Hover states via JS event handlers. No press/active state animation.
**What H08 requires (§18 Microinteractions):** `transform: scale(0.97)` on button press with `transition: 100ms ease`. This applies to all buttons.
**Priority:** Low
**Effort:** Small (one CSS rule: `button:active { transform: scale(0.97); transition: 100ms ease; }`)

---

### 3.15 Microinteraction — Chat Message Optimistic UI

**Component:** `ChatScreen` in `App.jsx:4623`
**What exists:** User message appears in state after the `setMessages` call. AI response appears only after the `fetch` completes. While loading, a "..." animation is shown as a separate message.
**What H08 requires (§18 Microinteractions):** Optimistic UI — user message appears immediately. AI response position shows a loading indicator. If AI response fails, the user message shows "Failed to send. Retry" state (not a generic error appended as a new message).
**Gap:** The message appears correctly (state update before fetch). The error handling appends a new AI message instead of marking the user message as failed. No retry within the failed message.
**Priority:** Low
**Effort:** Small

---

### 3.16 One Primary Action Per Screen (UX-P1)

**Component:** `Landing` in `App.jsx:3853`; `ResultsScreen`
**What exists:** The Landing page has multiple prominent actions: "Decide now →", "Chat with Ai·sel →", and category cards all appear at high visual weight. The ResultsScreen has no "Record My Decision" CTA at all.
**What H08 requires (UX-P1, §8, §9):** Every screen has exactly one primary action. All other actions are secondary in size, weight, and position. "Record My Decision" is always visible on the Recommendation Screen.
**Gap:** Landing has multiple equally prominent CTAs (by design for the current marketing page — this will be resolved when the routing architecture changes). ResultsScreen is entirely missing its primary CTA.
**Priority:** High (ResultsScreen CTA) / Medium (Landing — post-routing-migration)
**Effort:** Small (ResultsScreen CTA) / Medium (Landing restructure post-Sprint 2)

---

### 3.17 Content Width Discipline (65ch)

**Component:** All prose throughout the product
**What exists:** Prose text (AI reasoning, Ai·sel tips, description text) is not constrained to a maximum line length. On wide desktop screens, text in the Loading and Landing sections can span the full container width.
**What H08 requires (§6 Layout Rules):** No prose line exceeds 65 characters per line. Enforced via `max-width: 65ch` on all prose containers.
**Priority:** Low
**Effort:** Small

---

### 3.18 `aria-live` Regions

**Component:** Auth pages; `ChatScreen`; `LoadingScreen`
**What exists:** One `aria-label` found on social footer links. No `aria-live` regions. No dynamic content update announcements.
**What H08 requires (§14 Accessibility):** `aria-live="polite"` on save state and non-urgent status updates. `aria-live="assertive"` on error states and validation messages. Decision State badges use `aria-label` with full text.
**Priority:** High (accessibility requirement)
**Effort:** Small

---

### 3.19 Label Elements on Inputs

**Component:** `pages/auth/login.tsx`; `pages/auth/signup.tsx`; `ChatScreen` input; `CompareSection` inputs
**What exists:** Inputs use `placeholder` text only. No `<label>` elements. No `htmlFor`/`id` associations.
**What H08 requires (§7 Component Library — Input):** Inputs always have a visible label above them. Placeholder text may be used for examples but never as a substitute for a label.
**Priority:** High (accessibility — screen readers)
**Effort:** Small

---

### 3.20 Success Color Mismatch

**Component:** `const C` in `App.jsx`
**What exists:** `C.success: #059669`
**What H08 requires:** `--color-success: #10B981`
**Impact:** Minor visual difference (slightly different green). Not a WCAG failure. Inconsistency between the C object and the H08 spec.
**Priority:** Low
**Effort:** Trivial (one value change)

---

## Section 4 — Comprehensive Gap Summary Table

| # | H08 Section | Component/Area | Current State | H08 Requirement | Priority | Effort |
|---|---|---|---|---|---|---|
| G01 | §5 Colors | C object | JS object, no CSS vars | CSS custom properties on `:root` | High | Medium |
| G02 | §14 Accessibility | All buttons/inputs | `outline: none`, no `:focus-visible` | 2px accent focus ring via CSS | High | Medium |
| G03 | §13 Mobile | All text | `fontSize` in `px` | `fontSize` in `rem` | High | Medium |
| G04 | §14 Accessibility | All animations | No reduced-motion query | `prefers-reduced-motion: reduce` support | High | Small |
| G05 | §10 Dashboard | — | Does not exist | Full Dashboard per H08 §10 | High | Large |
| G06 | §8 Wizard | `QuestionScreen` | Tree-based multiple choice | H03-conforming Wizard (Context→Goal→Constraints→Alternatives) | High | Large |
| G07 | §9 Recommendation | `ResultsScreen` | Product grid | H08 Recommendation Block + Alternative cards | High | Large |
| G08 | §3 Navigation | TopNav | Search bar center, category pills | WordMark left, "New Decision" right, Decision title center | High | Medium |
| G09 | §4 Information Architecture | `App.jsx` routing | `useState('screen')` SPA | Next.js URL routing per H08 §4 | High | Large |
| G10 | §7 Save Indicator | — | Does not exist | Auto-save indicator in Wizard (top-right) | High | Small |
| G11 | §3 Navigation (mobile) | — | No bottom nav | Bottom nav on 375–767px | High | Medium |
| G12 | §17 Error States | Auth pages, ResultsScreen | Raw red color, generic messages | H08 error screen specs, `--color-danger`, consequence-based messages | High | Medium |
| G13 | §14 Accessibility | Auth pages, all inputs | No `<label>` elements | Visible `<label>` above every input | High | Small |
| G14 | §14 Accessibility | Dynamic content | No `aria-live` | `aria-live` on save state, errors, status updates | High | Small |
| G15 | §7 Button | All buttons | No height enforcement, no variants | Button component: 4 variants, 2 sizes, 40–48px height | High | Medium |
| G16 | §7 Input | Auth pages, Chat | No labels, no focus ring, wrong height | Input component: 44px, label, focus ring, error state | High | Small |
| G17 | §2 UX-P1 | Landing, ResultsScreen | Multiple primary CTAs, missing "Record My Decision" | One primary action per screen | High | Medium |
| G18 | §8 Wizard progress | `QuestionScreen` | Per-question segments inside hero image | 4-segment bar above Wizard, always visible | High | Medium |
| G19 | §15 Empty States | — | Absent or wrong language | H08 empty state specs for Dashboard, History, Filter | Medium | Small |
| G20 | §16 Skeleton Loading | — | Does not exist | Skeleton cards for Dashboard loading | Medium | Small |
| G21 | §10 Dashboard groups | — | Does not exist | Grouped list: Needs attention / Active / Completed / Archived | Medium | Large |
| G22 | §12 Confirmation Dialogs | — | `window.confirm()` or absent | Inline card overlay with Cancel/danger action pair | Medium | Small |
| G23 | §11 Chat | `ChatScreen` | Free-form, not Decision-anchored | Chat anchored to Decision Object, shows Decision context label | Medium | Medium |
| G24 | §7 Card | Throughout | No component, varying padding | Card component: 16–24px padding, `--radius-lg`, hover elevation | Medium | Small |
| G25 | §7 Badge | `Badge` fn, plan badges | Partially conforming | Badge component with Decision State color tokens | Medium | Small |
| G26 | §16 Loading — progress bar | Page transitions | None | 2px top-of-viewport progress bar on page transitions | Medium | Small |
| G27 | §12 Validation timing | Auth pages | On submit only | Inline on blur for field errors; submit for form errors | Medium | Small |
| G28 | §8 Wizard — reason text | `QuestionScreen` | "Ai·sel tip" below options | Reason text between question and input, above options | Medium | Medium |
| G29 | §8 Wizard — nav row | `QuestionScreen` | Auto-advance on tap, no Continue | [Back] [Skip for now] [Continue] navigation row | Medium | Medium |
| G30 | §6 Content width | Prose text | Unconstrained | `max-width: 65ch` on all prose containers | Low | Small |
| G31 | §18 Button press | All buttons | No active state | `transform: scale(0.97)` on `:active` | Low | Small |
| G32 | §18 Chat optimistic UI | `ChatScreen` | Error appended as new message | Failed message shows "Retry" inline | Low | Small |
| G33 | §5 Success color | `C.success` | `#059669` | `#10B981` | Low | Trivial |
| G34 | §7 Radio Group | — | Does not exist | Card-style radio for confidence level in Final Decision | High | Small |
| G35 | §5 Branding | TopNav logo | "DecisionPilot" text | "DecisionOS" text | High | Trivial |

---

## Section 5 — Proposed Implementation Sprint Plan

Sequenced to achieve H08 conformance incrementally without breaking the live product at any step.

---

### Sprint 1 — Foundation (Auth Polish + Token System)

**Goal:** Establish the CSS token system and fix all auth-related H08 gaps. No new features. No risk to existing functionality.

| Gap | Item | Notes |
|---|---|---|
| G01 | Create `lib/design-tokens.css` with all `:root` CSS variables | Imported in `pages/_app.js`. Does not affect existing inline styles yet. |
| G35 | Update TopNav logo text from "DecisionPilot" to "DecisionOS" | One-line change. |
| G33 | Fix `C.success` from `#059669` to `#10B981` | One-line change. |
| G16 | Restyle `pages/auth/login.tsx` and `pages/auth/signup.tsx` | Add labels, H08 input height (44px), H08 focus ring, H08 error display. |
| G13 | Add `<label>` elements to auth inputs | Accessibility fix, part of G16. |
| G14 | Add `aria-live` to auth error messages | Trivial addition. |
| G04 | Add global `prefers-reduced-motion` CSS rule | One rule in `lib/design-tokens.css`. |
| G31 | Add `button:active { transform: scale(0.97) }` | Global CSS rule. |

**Deliverable:** Auth pages fully conform to H08. Token file ready for Sprint 2 migration.

---

### Sprint 2 — Routing + Decision Object Foundation

**Goal:** Replace SPA routing with Next.js URL routing. Create the Dashboard and the Decision Object data structure. This sprint enables all future H08 screens.

| Gap | Item | Notes |
|---|---|---|
| G09 | Migrate `App.jsx` SPA routing to Next.js pages | Create `/pages/dashboard.tsx`, `/pages/decision/new.tsx`, `/pages/decision/[id].tsx`. Landing stays at `/`. |
| G05, G21 | Build `/pages/dashboard.tsx` | Decision Object list grouped by state, filter panel, priority indicators. |
| G11 | Add bottom navigation component for mobile | Conditional on viewport width, authenticated state. |
| G08 | Refactor TopNav for DecisionOS structure | Remove search bar and category pills from nav. Add "New Decision" primary button. Add in-context Decision title. |
| G10 | Build Save Indicator component | Wire to auto-save logic in Wizard (Sprint 3). |
| G19 | Build Empty State components | Empty Dashboard, Empty History, Empty Filter Result. |
| G20 | Build SkeletonCard component | Used in Dashboard loading. |
| G02 | Implement focus rings via CSS | Now possible with CSS token file from Sprint 1. Add `:focus-visible` to extracted components. |
| G22 | Build Confirmation Dialog component | Used for Delete in Dashboard. |

**Deliverable:** Dashboard live at `/dashboard`. URL routing active. All structural nav gaps resolved.

---

### Sprint 3 — Decision Wizard (H03-Conforming)

**Goal:** Build the Decision Wizard that conforms to H08 §8 and the H03 Decision Object model. This replaces `QuestionScreen` for new H03-based decisions while preserving the legacy `QuestionScreen` for existing category browsing.

| Gap | Item | Notes |
|---|---|---|
| G06 | Build `features/decision-wizard/Wizard.jsx` | Context → Goal → Constraints → Alternatives. One question per screen. |
| G18 | Implement H08 progress bar | 4 segments, correct colors, always visible above Wizard. |
| G28 | Implement reason text in each Wizard step | Between question heading and input. |
| G29 | Implement navigation row | [Back] [Skip for now] [Continue]. Continue disabled until input. |
| G10 | Wire Save Indicator to Wizard auto-save | Fires on every input event, 800ms debounce. |
| G34 | Build Radio Group component | For Final Decision confidence level step. |
| G03 | Begin rem migration | All new components use rem. Legacy components migrated in this sprint. |

**Deliverable:** New Decision Wizard functional at `/decision/new`. Full Draft → In Analysis flow working.

---

### Sprint 4 — Recommendation Screen + AI Chat Anchoring

**Goal:** Build the H08-conforming Recommendation Screen and anchor Chat to a Decision Object.

| Gap | Item | Notes |
|---|---|---|
| G07 | Build `features/decision-wizard/RecommendationView.jsx` | Recommendation Block, Alternative cards with pros/cons/risks, "Conditions for change" visible. |
| G17 | Add "Record My Decision" CTA pinned to bottom on mobile | Primary action per screen, always visible. |
| G23 | Refactor `ChatScreen` to be Decision-anchored | Chat opens with Decision context, shows context label always, stores messages in Decision Object. |
| G26 | Add top-of-viewport progress bar for page transitions | 2px bar on Next.js route change. |
| G12 | Implement H08 error screens | AI analysis failure screen, network toast, session expired overlay. |

**Deliverable:** Complete Recommendation → Final Decision → Action Plan flow. Chat anchored to Decision Object.

---

### Sprint 5 — Mobile Polish + Accessibility Completion

**Goal:** Achieve full H08 DAC-06 and DAC-07 compliance. Complete rem migration. Complete reduced-motion coverage.

| Gap | Item | Notes |
|---|---|---|
| G03 | Complete rem migration for all remaining components | Audit and replace all remaining `px` font sizes. |
| G02 | Audit and verify focus rings on all interactive elements | Every button, input, link, select must show H08 focus ring. |
| G14 | Complete `aria-live` coverage | All dynamic regions: save state, AI status, error messages, state transitions. |
| G30 | Add `max-width: 65ch` to all prose containers | Global prose constraint. |
| G32 | Implement Chat optimistic UI with inline retry | Replace error-as-new-message with failed-message-with-retry. |
| G27 | Implement blur-based inline validation | Auth pages and new Wizard inputs. |
| G15 | Complete Button component with all variants and states | Loading state, disabled state, danger variant. |
| G24 | Complete Card component extraction | Consistent padding, hover elevation, no nesting. |
| G25 | Complete Badge component with Decision State tokens | All seven `--color-state-*` tokens applied. |

**Deliverable:** Full WCAG 2.1 AA compliance per H08 §14. DAC-06 and DAC-07 pass.

---

### Post-Sprint — Remaining Low Priority

| Gap | Item |
|---|---|
| G31 | Button press scale (already done in Sprint 1 global CSS) |
| G33 | Success color fix (Sprint 1) |
| G17 | Landing page primary action restructure (after routing migration is stable) |

---

## Conformance Projection by Sprint

| After Sprint | H08 Gaps Resolved | Remaining |
|---|---|---|
| Sprint 1 | G01, G04, G13, G14 (auth), G16, G31, G33, G35 | 27 |
| Sprint 2 | G05, G08, G09, G10, G11, G19, G20, G21, G22 | 18 |
| Sprint 3 | G06, G18, G28, G29, G34 + G03 partial | 13 |
| Sprint 4 | G07, G12, G17 (ResultsScreen CTA), G23, G26 | 8 |
| Sprint 5 | G02, G03 (complete), G14 (complete), G15, G24, G25, G27, G30, G32 | 0 |

**Full H08 conformance: Sprint 5.**

---

*Implementation Gap Report | DecisionOS | June 2026*
*Source of truth: H08 UX & Design System v1.0 Final*
*Codebase analyzed: decisionpilot.tech (components/App.jsx v5211 lines, pages/auth/login.tsx, pages/auth/signup.tsx, pages/index.js, context/AuthContext.tsx, hooks/useSubscription.js)*
