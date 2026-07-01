# DecisionOS Changelog

## IR01-070b — UI Consistency Pass

**Type:** Consistency / cleanup (no new features, no functional change)

**Summary:** Audited every screen shipped through IR01-070 (Dashboard, History, Decision Wizard, Decision Object view, Analysis Loading, Auth) against H08 (UX & Design System) and removed the duplication and token gaps found.

**Changes:**
- Removed a near-byte-identical CSS duplicate between `pages/dashboard.module.css` and `pages/history.module.css` by extracting the shared filter/list layout into `components/layout/FilterLayout.module.css`.
- Tokenized a hardcoded button hover color: added `--color-danger-dark` to `lib/design-tokens.css` (mirrors the existing `--color-accent-dark` pattern) and referenced it from `Button.module.css` instead of a literal `#dc2626`.
- Rebuilt `pages/auth/login.tsx` and `pages/auth/signup.tsx` — previously ~150 lines of duplicated inline-style form/card/button markup each — on the existing `Input` and `Button` components plus one shared `pages/auth/Auth.module.css` page shell. Also switched their submit buttons to the standard `Button` `loading` spinner behavior instead of an ad hoc loading-text swap, aligning them with the rest of the app's button loading pattern.
- Converted `components/ui/SaveIndicator.tsx` from inline `CSSProperties` objects to a `SaveIndicator.module.css` module, matching the CSS Modules convention used by every other component.
- Widened `Input`'s `label` prop from `string` to `React.ReactNode` (backward compatible) to support inline hint text without a one-off component.

**Verification:** `npx tsc --noEmit`, `npx next build`, and `npx vitest run` (153 tests) all pass with no changes to existing test files.

**Not changed (scope boundary):** The public marketing site (`pages/index.js`, `about.js`, `guides/*`, etc.) uses a separate legacy component set (`components/App.jsx`, `AselMascot`, `HeroBanner`, `GuideLayout`) that predates H08 and is outside Phase 5 IR01 scope — left untouched.

---
