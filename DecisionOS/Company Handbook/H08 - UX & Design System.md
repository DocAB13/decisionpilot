# H08 — UX & Design System
**DecisionOS Company Handbook**
*Version 1.0 Final | June 2026*

---

## Preamble

This document is the authoritative reference for every visual and interaction decision made in DecisionOS. It translates the product philosophy from H01–H07 into concrete, implementable specifications for design and engineering.

H08 does not invent new product features, change business rules, or modify workflows. Everything here derives from what has already been defined. Where this document makes a design choice, that choice exists to serve a requirement already established in H03, H05, or H06.

Before reading H08, engineers and designers should be familiar with:
- **H02 Principle 2** — Simplicity Is the Feature (the governing constraint on all design decisions)
- **H05** — the seven user workflows that every screen must serve
- **H06** — the functional requirements and acceptance criteria that every component must satisfy

The output of H08 is a product that a user can use without reading documentation, without onboarding, and without cognitive effort spent on the interface itself. Every pixel that does not serve the user's Decision is a pixel that should not exist.

---

## 1. Design Philosophy

DecisionOS is a tool for people under cognitive load. A user who comes to this product is already navigating uncertainty — too many options, too much conflicting information, too much at stake. The design must never add to that load.

**Calm over stimulating.** The visual language of DecisionOS is quiet. It does not compete with the user's thinking. Interfaces that demand attention through color, animation, or visual noise fail our users at the moment they most need clarity.

**Structure over freedom.** Blank canvases are intimidating when a person is uncertain. DecisionOS provides structure — a defined path, clear steps, obvious next actions — that reduces the cognitive work of deciding how to use the product, so the user's full attention can go to the decision itself.

**Content over chrome.** The most important thing on any screen is the content that serves the user's Decision — their inputs, the AI's reasoning, the Recommendation. Interface elements (navigation, labels, controls) are secondary to content. They are present only to serve the content, and they are sized, colored, and positioned accordingly.

**Trust through legibility.** Dense, unreadable text is not professional. It is a trust signal in the wrong direction. Every piece of AI reasoning, every Recommendation, every risk assessment must be legible to a non-specialist reading on a phone. Short sentences. Real paragraphs. No bullet-point overload where a sentence would communicate more.

**Transparency as visual principle.** Per H02 Principle 5, the user always knows why we recommended what we recommended. Visually, this means the reasoning is always visible — not hidden behind a toggle, not collapsed by default, not available only to premium users. The design must make transparency feel natural, not effortful.

---

## 2. UX Principles

These six UX principles govern every interaction and layout decision. They are derived directly from H02 and H05. When a design decision is unclear, apply these principles in order.

**UX-P1 — One Primary Action Per Screen.** Every screen has a single most important action. That action is the largest, most prominent interactive element. All other actions are secondary in size, weight, and position. A user who looks at any screen in DecisionOS should know immediately what to do next.

**UX-P2 — Every Question Has a Reason.** Per FR-02.3, every question in the Decision Wizard is accompanied by an explanation of why it matters. Visually, this explanation is present by default — not hidden behind a tooltip or an information icon. It is rendered in a secondary text style beneath the question itself.

**UX-P3 — Progress Is Always Visible.** At every step of the Decision Wizard and every state of a Decision Object, the user knows where they are and what comes next. Progress indicators are persistent, not modal.

**UX-P4 — No Input Is Ever Lost.** Per FR-01.4, auto-save fires after every input. The save state must be subtly communicated — a "Saved" indicator that appears and fades, never a blocking modal. The user should feel confident their work is preserved without having to think about it.

**UX-P5 — Error Messages Are Explanations, Not Codes.** Per WF-7.2 in H05, if a user's input is insufficient, the system explains specifically what is missing and why it matters to the decision. Never a generic red border with "This field is required." Always a specific sentence about the decision consequence.

**UX-P6 — Upgrade Never Interrupts a Decision.** Per BR-06, upgrade prompts never appear during the Decision Wizard, during AI analysis, or during the Recommendation View. When they do appear, they are honest, specific, and non-urgent. The design must make upgrade feel like a natural expansion of value, not a wall.

---

## 3. Navigation

### Global Navigation Structure

DecisionOS uses a persistent top navigation bar on desktop and a bottom navigation bar on mobile. The navigation is minimal by intent — it carries only what is necessary to orient the user and reach their Decision Objects.

**Desktop top navigation — authenticated user:**
- Left: DecisionOS wordmark (links to Dashboard)
- Center: empty (reserved for in-context Decision title on Decision-level screens)
- Right: "New Decision" button (primary), user avatar/account menu

**Desktop top navigation — anonymous user:**
- Left: DecisionOS wordmark (links to homepage)
- Center: empty
- Right: "Sign in" (text link), "Get started" (primary button)

**Mobile bottom navigation — authenticated user:**
- Home (Dashboard)
- New Decision (center, prominent)
- History

**Mobile bottom navigation — anonymous user:**
- Bottom navigation is not shown. A single persistent floating action button — "Start a Decision" — is shown on the homepage.

### In-Context Navigation

Within a Decision Object, the user is always in the context of that Decision. A breadcrumb-style indicator shows:
`[Category] → [Decision title or "Untitled Decision"]`

This indicator is always present on Decision-level screens. It is not a navigation element — clicking it does nothing — but it anchors the user within their Decision.

### No Global Search in MVP

Global search across Decision Objects is deferred to post-MVP. The Dashboard's filter controls (Decision State, Category, date range) serve this function for MVP.

---

## 4. Information Architecture

The information architecture of DecisionOS maps directly to the system layers and workflows defined in H04 and H05.

```
/ (Homepage — anonymous)
├── /decision/new              ← Workflow 1: First Visit / Decision Wizard entry
├── /auth/signup               ← Workflow 6: Account creation
├── /auth/login                ← Workflow 2: Returning user
│
/dashboard (authenticated root)
├── /decision/[id]             ← Decision Object view (any state)
│   ├── /decision/[id]/wizard  ← Decision Wizard (Draft state)
│   ├── /decision/[id]/analysis ← In Analysis state (read-only waiting screen)
│   ├── /decision/[id]/recommendation ← Waiting for User state
│   ├── /decision/[id]/final   ← Final Decision step
│   ├── /decision/[id]/plan    ← Action Plan view (Decision Made / Executing)
│   ├── /decision/[id]/outcome ← Outcome recording (Executing → Completed)
│   ├── /decision/[id]/reflect ← Reflection (post-Outcome)
│   └── /decision/[id]/chat    ← AI Chat Interface
│
├── /history                   ← Decision History (Workflow 4)
├── /account                   ← Account settings, billing
```

### URL Structure Rules

- Decision Object URLs use the Decision ID. The ID is permanent — it never changes even if the Decision title changes.
- No query parameters in primary navigation. State is managed by the application, not by URL parameters.
- Every URL that requires authentication must redirect to `/auth/login` with a `?return=` parameter set to the original URL, so the user arrives at their intended destination after signing in.

---

## 5. Design System

### Color

The DecisionOS color palette is built around two axes: a neutral base that recedes and an accent that signals action and importance. The palette is intentionally small — fewer colors used consistently build more visual clarity than many colors used occasionally.

```
/* Base Palette */
--color-background:     #F8F9FC   /* Page background — cool white */
--color-surface:        #FFFFFF   /* Cards, panels, inputs */
--color-border:         #E8ECF4   /* Dividers, input borders, card edges */
--color-border-strong:  #C8D0E0   /* Focused states, emphasis borders */

/* Text */
--color-text-primary:   #0F172A   /* Body text, headings */
--color-text-secondary: #475569   /* Labels, captions, helper text */
--color-text-muted:     #94A3B8   /* Placeholders, disabled states */

/* Accent — Action Blue */
--color-accent:         #1A56DB   /* Primary buttons, links, focus rings */
--color-accent-dark:    #1240A8   /* Hover state on primary buttons */
--color-accent-light:   #EFF4FF   /* Accent surface backgrounds */
--color-accent-border:  #BFCFFF   /* Accent-tinted borders */

/* Semantic */
--color-success:        #10B981   /* Completed states, checkmarks */
--color-success-light:  #ECFDF5   /* Success backgrounds */
--color-warning:        #F59E0B   /* Caution states, Premium badge */
--color-warning-light:  #FFFBEB   /* Warning backgrounds */
--color-danger:         #EF4444   /* Destructive actions, error states */
--color-danger-light:   #FEF2F2   /* Error backgrounds */

/* Decision State Colors — used in badges and indicators */
--color-state-draft:        #94A3B8   /* Neutral grey */
--color-state-analysis:     #8B5CF6   /* Purple — AI is working */
--color-state-waiting:      #F59E0B   /* Amber — user action needed */
--color-state-made:         #1A56DB   /* Blue — decision taken */
--color-state-executing:    #0EA5E9   /* Sky — in progress */
--color-state-completed:    #10B981   /* Green — done */
--color-state-archived:     #CBD5E1   /* Light grey — inactive */
```

### Typography

```
/* Font Stack */
--font-sans:    'Inter', system-ui, -apple-system, sans-serif
--font-display: 'Plus Jakarta Sans', sans-serif   /* Headings only */

/* Scale */
--text-xs:   11px / 1.4   /* Badges, labels, timestamps */
--text-sm:   13px / 1.5   /* Helper text, captions, secondary labels */
--text-base: 15px / 1.6   /* Body text, Wizard questions */
--text-md:   17px / 1.6   /* Lead paragraphs, Recommendation reasoning */
--text-lg:   20px / 1.4   /* Section headings */
--text-xl:   24px / 1.3   /* Page headings */
--text-2xl:  30px / 1.2   /* Hero headings, Recommendation winner */
--text-3xl:  38px / 1.1   /* Homepage headline only */

/* Weight */
--font-regular: 400
--font-medium:  500
--font-semibold: 600
--font-bold:    700
--font-black:   900   /* Display headings, Recommendation winner label */
```

### Spacing

The spacing scale is based on a 4px base unit. All margins, paddings, gaps, and dimensions use multiples of this unit.

```
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
--space-20:  80px
--space-24:  96px
```

### Border Radius

```
--radius-sm:   6px    /* Badges, tags, small chips */
--radius-md:   10px   /* Buttons, inputs, small cards */
--radius-lg:   16px   /* Cards, panels */
--radius-xl:   20px   /* Large cards, modal containers */
--radius-full: 9999px /* Pills, avatars, circular elements */
```

### Elevation (Box Shadow)

```
--shadow-xs:  0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-sm:  0 1px 4px rgba(0, 0, 0, 0.07)
--shadow-md:  0 4px 16px rgba(0, 0, 0, 0.08)
--shadow-lg:  0 8px 32px rgba(0, 0, 0, 0.10)
--shadow-xl:  0 16px 48px rgba(0, 0, 0, 0.12)
```

### Transition

```
--transition-fast:   150ms ease
--transition-base:   200ms ease
--transition-slow:   300ms ease
```

---

## 6. Layout Rules

### Page Layout

All content pages use a centered max-width container with responsive horizontal padding.

```
Max width:        1200px (wide pages: Dashboard, History)
                  720px  (focused pages: Wizard, Recommendation, Chat)
                  480px  (narrow pages: Auth, Account)
Horizontal pad:   24px (desktop) → 16px (mobile ≤ 768px)
```

Focused pages (Wizard, Recommendation, Final Decision) use the 720px container intentionally. The narrow width reduces distraction and signals to the user that their full attention should be on the content, not on navigating a wide layout.

### Grid System

Desktop layouts use a 12-column grid with 24px gutters. The following column allocations are standard:

```
Full width:         12 col   — splash sections, full-page messages
Content + sidebar:  8 + 4    — Dashboard with filter panel
Centered content:   6 col (offset 3) — Wizard steps, Recommendation
Two equal columns:  6 + 6    — Pros/Cons, alternatives side by side
Three columns:      4 + 4 + 4 — Pricing tiers (homepage)
```

### Vertical Rhythm

Section spacing within a page:

```
Between page sections:    64px (--space-16)
Between related groups:   32px (--space-8)
Between list items:       16px (--space-4)
Between label and input:  6px  (--space-1 + --space-2)
Between input and helper: 4px  (--space-1)
```

### Content Width Discipline

No prose line (paragraph, reasoning text, question text) exceeds 65 characters per line on desktop. This is enforced via `max-width: 65ch` on all prose containers. Text that extends beyond this width is harder to read and signals that the design is not attending to the user's reading experience.

---

## 7. Component Library

### Button

Buttons have four variants and two sizes.

**Variants:**
```
primary    — filled, accent color. Used for the single primary action per screen.
secondary  — outlined, accent color border. Used for secondary actions.
ghost      — no border, accent text color. Used for tertiary actions, back navigation.
danger     — filled, danger red. Used exclusively for destructive actions (delete, cancel subscription).
```

**Sizes:**
```
md  — height 40px, padding 10px 18px, text-sm (13px), font-semibold
lg  — height 48px, padding 12px 24px, text-base (15px), font-semibold
```

**States:**
```
default   — base styles
hover     — accent-dark background (primary), accent-light background (secondary)
focus     — 2px solid accent with 2px offset (all variants)
disabled  — opacity 0.45, cursor not-allowed
loading   — spinner replaces label, width locked to prevent layout shift
```

**Rules:**
- A primary button appears once per screen.
- Danger buttons are always preceded by a confirmation step. They never appear as the only action.
- Button labels are verbs: "Start Decision," "Submit," "Record Outcome." Not nouns, not "OK."

### Input

```
Height:         44px (touch-safe minimum)
Border:         1px solid --color-border
Border-radius:  --radius-md (10px)
Background:     --color-surface (#FFFFFF)
Padding:        0 14px
Font:           text-base, font-regular

Focus:          border-color --color-accent, box-shadow 0 0 0 3px --color-accent-light
Error:          border-color --color-danger, box-shadow 0 0 0 3px --color-danger-light
Success:        border-color --color-success
```

Inputs always have a visible label above them. Placeholder text may be used for examples ("e.g., €350,000") but never as a substitute for a label.

### Textarea

Same rules as Input. Min-height 100px. Resizes vertically as the user types (auto-grow). Max-height 320px before scrolling internally.

### Select

Uses native `<select>` in MVP. Custom styled select dropdown is post-MVP. The native select must be visibly styled to match the Input component.

### Radio Group

Used for the confidence level selection (Confident / Uncertain / Reluctant) on the Final Decision step. Uses a card-style radio: each option is a full-width card with a visible selected state (accent border, accent-light background). Labels are large enough to be tapped on mobile without precision (minimum 44px touch target).

### Card

```
Background:     --color-surface
Border:         1px solid --color-border
Border-radius:  --radius-lg (16px)
Padding:        24px (desktop) / 16px (mobile)
Shadow:         --shadow-sm (default), --shadow-md (hover/elevated)
```

Cards are used for: Decision Object entries in the Dashboard, alternatives in the Recommendation View, Action Plan items, and content sections within a Decision Object.

### Badge

Used for Decision State labels, category tags, and plan tier indicators.

```
Height:         22px
Padding:        2px 8px
Border-radius:  --radius-sm (6px)
Font:           text-xs (11px), font-bold, uppercase, letter-spacing 0.5px
```

Decision State badges use the `--color-state-*` variables defined in Section 5.

### Progress Indicator

Used in the Decision Wizard to show step progress.

```
Style:     Segmented bar (not a percentage number)
Segments:  One per Wizard section (Context, Goal, Constraints, Alternatives)
Height:    4px
Active:    --color-accent
Inactive:  --color-border
Completed: --color-success
Radius:    --radius-full
```

The progress indicator is always visible at the top of the Wizard container. It does not scroll away.

### Divider

```
Style:   1px solid --color-border
Margin:  32px 0 (between major sections)
         16px 0 (between list items or form groups)
```

Dividers are used sparingly. If sections can be separated by white space alone, the divider is omitted.

### Save Indicator

The auto-save state indicator appears in the top-right corner of the Wizard container.

```
Saving:  Spinner icon + "Saving..." text — --color-text-muted
Saved:   Checkmark icon + "Saved" text — --color-success
         Fades out after 2 seconds
Error:   "Not saved" text — --color-danger (persists until retry)
```

---

## 8. Decision Wizard UX

The Decision Wizard is the most important surface in DecisionOS. Its UX must execute flawlessly. Every interaction here is either building or eroding trust.

### Wizard Container Layout

```
Container max-width:  720px, centered
Top:                  Progress Indicator (4px bar, full width)
Below progress:       Section label ("Step 2 of 4 — Goal")
Below section label:  Question text (text-xl, font-bold, display font)
Below question:       Reason text (text-sm, --color-text-secondary)
Below reason:         Input area (varies by question type)
Bottom:               Navigation row (Back | Skip | Continue)
Save indicator:       Top-right corner, persistent
```

### One Question Per Screen

Each Wizard step presents exactly one question at a time. The screen scrolls only if the input area for a single question requires it (e.g., a textarea for Context). The user should never scroll to find the Continue button.

### Question Anatomy

Every question has three parts:

1. **Question text** — rendered in `text-xl, font-bold, --font-display`. Short. A question, not a label. "What is your budget limit?" not "Budget."

2. **Reason text** — rendered in `text-sm, --color-text-secondary`. One to two sentences. Specific to the category, not generic. "We use your budget limit to immediately rule out alternatives that are beyond your means, so the analysis focuses on options that are actually available to you."

3. **Input area** — the appropriate input component for the question type (textarea for Context, input for budget amounts, radio group for constraint types, etc.).

### Navigation Row

```
Layout:      Three positions: [Back] [Skip] [Continue]
Back:        Ghost button, left-aligned. Hidden on first step.
Skip:        Ghost button, center. Hidden on mandatory steps (Alternatives).
Continue:    Primary button, right-aligned. Disabled until input is provided for non-skippable steps.
```

"Skip" is labeled "Skip for now" — not "Skip." The addition of "for now" signals that the information is welcome later, not that it is unwanted.

### Backward Navigation Warning

When a user clicks Back after AI Analysis has been generated, a banner appears at the top of the screen:

> "You are editing inputs that have already been analyzed. If you continue, the current Recommendation will be saved to your Version History and a new analysis will run when you resubmit."

This is not a blocking modal. It is an inline banner. The user can proceed immediately. The warning is informational, not obstructive.

### Conflict Detection Display

When the system detects a conflict between Goal and Constraints (FR-02.10), a conflict banner appears between the Constraints step and the Alternatives step:

```
Background: --color-warning-light
Border-left: 3px solid --color-warning
Icon:        Warning triangle
Text:        "We noticed a possible conflict: [specific description of the conflict].
             You can adjust your goal or constraints, or continue and we will
             note this in the analysis."
Actions:    [Go back to adjust] [Continue anyway]
```

Both actions are always present. The user is never forced to resolve the conflict — they can acknowledge it and continue.

### Alternatives Input

The Alternatives step uses a card-list input pattern:

- Each alternative is entered in a card with a text input
- Two cards are pre-rendered empty as the minimum
- An "Add another option" button adds cards up to five
- A remove icon on each card (visible on hover/focus) removes that alternative
- AI-suggested alternatives appear as lighter, dashed-border cards with an "Add this" button

### Wizard Completion

After the user submits the final step (Alternatives), the Wizard transitions to the Analysis waiting state. The Wizard itself is no longer shown. A separate screen takes its place (see Section 16 — Loading States).

---

## 9. Recommendation Screen

The Recommendation Screen is the output of the AI analysis. It corresponds to the Waiting for User Decision State. This screen must balance information density with readability — it contains the most complex content in the product.

### Layout

```
Container max-width:  720px, centered
Top section:          Decision category breadcrumb + Decision State badge
Recommendation block: Full-width card (elevated, --shadow-md)
Analysis sections:    Below the Recommendation block, full width
Chat entry point:     Sticky or fixed at the bottom on mobile; inline on desktop
Primary CTA:          "Record My Decision" — fixed to bottom of screen on mobile, inline after analysis on desktop
```

### Recommendation Block

The Recommendation Block is the most prominent element on the screen.

```
Background:   --color-accent-light
Border:       1.5px solid --color-accent-border
Border-radius: --radius-xl (20px)
Padding:      32px (desktop) / 24px (mobile)
```

Contents:
1. Label: "Our Recommendation" — `text-xs, font-bold, uppercase, --color-accent`
2. Winning alternative: `text-2xl, font-black, --font-display, --color-text-primary`
3. Primary reasoning: `text-md, font-regular, --color-text-primary` — two to four sentences maximum
4. "What would change this" section: `text-sm, --color-text-secondary` — collapsed by default on mobile, expanded on desktop

### Alternatives Analysis

Below the Recommendation Block, each alternative is presented in a card.

```
Card header:     Alternative name + "Recommended" badge (if applicable)
Pros section:    Label "Works for you" — items in green-tinted list
Cons section:    Label "Worth noting" — items in neutral list
Risks section:   Label "Watch out for" — items in amber-tinted list
```

The recommended alternative's card is presented first. All other alternatives follow in the order provided by the user.

The language used in pros/cons/risks is always addressed to the user directly: "Works well for your irregular income" — not "Good for irregular income."

### Chat Entry Point

On desktop: an inline button labeled "Explore with AI" appears beneath the Recommendation Block and above the alternatives analysis.

On mobile: a persistent footer bar with "Ask AI a question" that opens the Chat Interface as a slide-up sheet.

### Primary CTA

"Record My Decision" is always visible. On desktop, it appears after the alternatives analysis as a full-width primary button. On mobile, it is pinned to the bottom of the screen above the chat entry footer.

The button label is "Record My Decision" — not "Continue" or "Next." The deliberate language signals that this is a meaningful human act, not a navigation step.

---

## 10. Dashboard UX

The Dashboard is the authenticated user's primary surface. It is a task manager organized around Decision Objects, not a social feed or an analytics view.

### Layout

```
Page width:         1200px max
Left column (3/12): Filter panel (Decision State, Category, date range)
Right column (9/12): Decision Object list
```

On mobile, the filter panel collapses to a filter button that opens a bottom sheet.

### Decision Object List

Each Decision Object entry is a card:

```
Card height:     auto (content-driven)
Left accent:     4px colored border using --color-state-* for the current Decision State
Content:         Category name (text-sm, font-semibold, --color-text-secondary)
                 Decision title or "Untitled Decision" (text-base, font-semibold)
                 Created/updated timestamp (text-xs, --color-text-muted)
                 Decision State badge
                 For Completed: Outcome satisfaction stars (1–5)
Right action:    Context menu (⋮) — Archive, Delete
```

### Priority Indicators

Decision Objects that require user action are visually distinguished with a colored left accent and a brief action prompt beneath the Decision State badge:

```
Waiting for User:       Amber accent — "Review your Recommendation"
Executing (30+ days):   Blue accent  — "How did your decision go?"
Draft (7+ days idle):   Grey accent  — "Resume this decision"
```

These prompts use plain language, not system language.

### Empty Dashboard

See Section 15 — Empty States.

### Grouping

Decision Objects are grouped by status group:

```
Group 1: "Needs your attention" — Decision Objects with a priority indicator
Group 2: "Active" — Draft, In Analysis, Waiting for User, Decision Made, Executing (no priority flag)
Group 3: "Completed" — Completed Decision Objects
Group 4: "Archived" — Archived (collapsed by default, expandable)
```

Group headers are `text-xs, font-bold, uppercase, --color-text-muted`. They serve as visual separators, not as clickable elements.

---

## 11. AI Chat UX

The AI Chat Interface is always anchored to a specific Decision Object. It is never a standalone chat surface.

### Layout

On desktop, Chat opens as a right-side panel that slides in alongside the Decision Object view. The Decision Object context remains visible on the left at 40% width. The Chat panel occupies 60% width.

On mobile, Chat opens as a full-screen view. A persistent header bar shows the Decision context ("Discussing: [Category] decision") and a back button.

### Chat Panel Components

```
Header:         Context label — "You are discussing your [Category] decision"
                Close button (desktop) / Back button (mobile)
Message area:   Scrollable, most recent message at the bottom
                User messages: right-aligned, accent-light background
                AI messages: left-aligned, surface background
Input area:     Textarea (single-line expanding) + Send button
                Pinned to bottom of panel
```

### Message Anatomy

AI messages are structured, not free-form.

```
AI message:
  Body:     Response text, plain language, max 200 words per response
  Source:   "Based on your [component name]" — small label linking response
            to the specific Decision Object component it references
  Actions:  Optional — "Update my [Constraints/Goal/Alternatives]" button
            if the response suggests a change to the Decision Object
```

### Formal Update Prompt

Per FR-07.4, if the user provides new material information in Chat, the system surfaces a formal update prompt as an AI message:

```
Prompt card:
  Background: --color-accent-light
  Border:     1px solid --color-accent-border
  Text:       "You mentioned [new information]. Would you like to update your
              [component name] with this? This will trigger a new analysis."
  Actions:    [Update Decision] [Keep as context only]
```

### Chat Context Label

The context label "You are discussing your [Category] decision" is always visible at the top of the Chat panel. It never scrolls away. On desktop it is in the panel header. On mobile it is pinned below the navigation bar.

---

## 12. Forms & Validation

### Validation Timing

- **Inline validation fires on blur** (when the user leaves a field), not on keystroke.
- **Form-level validation fires on submit**, not before.
- A field with an error is never marked as an error before the user has interacted with it.

### Error Display

Per UX-P5, error messages explain the decision consequence, not the input rule.

```
Error container:
  Position:     Below the input, above the next field
  Color:        --color-danger
  Font:         text-sm, font-regular
  Icon:         Small danger circle icon, left of text

Correct:   "Without a budget, we cannot rule out options that exceed your
           means. Please add an approximate upper limit."

Incorrect: "This field is required."
```

### Required vs Optional Fields

Required fields are not marked with an asterisk. Instead, optional fields are labeled "(optional)" in `text-xs, --color-text-muted` to the right of the label. The default assumption is required; the exception is labeled.

### Character Counts

Textareas for open-ended inputs (Context, Lessons Learned) show a character count only when the user is within 20% of the maximum. The count appears in `text-xs, --color-text-muted` below the textarea, right-aligned.

### Confirmation Dialogs

Destructive actions (Delete Decision Object, Cancel subscription) require a confirmation step. The confirmation is an inline dialog, not a browser `confirm()`.

```
Confirmation dialog:
  Style:      Card overlay, --shadow-xl
  Title:      "Delete this Decision?" (text-lg, font-bold)
  Body:       "This cannot be undone. Your Decision Object, analysis, and
              all recorded Outcomes will be permanently removed."
  Actions:    [Cancel] (ghost) | [Yes, delete] (danger)
```

The destructive action is always on the right and uses the danger button variant. Cancel is always on the left and is the visually less prominent option.

---

## 13. Mobile Experience

The mobile experience is a first-class concern in MVP, not a responsive afterthought.

### Breakpoints

```
Mobile:   375px – 767px    (single column, bottom navigation)
Tablet:   768px – 1023px   (adaptive, top navigation)
Desktop:  1024px and above (full layout, top navigation)
```

### Mobile-Specific Rules

**Touch targets.** All interactive elements have a minimum touch target of 44px × 44px, regardless of visual size. Small icons with large invisible tap areas are acceptable. Small icons with small tap areas are not.

**Bottom navigation.** On mobile, primary navigation is at the bottom, within thumb reach. The top of the screen is used only for the page title and context indicators.

**Wizard on mobile.** The Wizard presents one question per full screen, with the progress indicator at the top and the navigation row pinned to the bottom. There is no visible content above the fold except the question. The input area is between the question and the navigation row.

**Recommendation on mobile.** The Recommendation Block occupies the full screen width. The alternatives analysis cards scroll vertically below it. "Record My Decision" is pinned to the bottom. "Ask AI a question" is in a smaller bar above the pinned button.

**Chat on mobile.** Chat is full-screen. The decision context label is pinned to the top. The input area is pinned to the bottom. The keyboard pushes the input area up and the message area adjusts accordingly — it does not obscure the input.

**Font scaling.** The application respects the user's system font size settings. No text is set in `px` that would override user preferences — use `rem` for all text sizes, with the root `font-size` set to 16px.

---

## 14. Accessibility

DecisionOS targets WCAG 2.1 Level AA compliance for all MVP screens.

### Color Contrast

```
Normal text (≤ 18px):     Minimum 4.5:1 contrast ratio
Large text (> 18px bold): Minimum 3:1 contrast ratio
Interactive elements:     Minimum 3:1 against adjacent colors
```

The color pairs defined in Section 5 have been selected to meet these ratios. Any deviation from the defined palette requires a contrast check before implementation.

### Keyboard Navigation

All interactive elements are reachable and operable by keyboard alone.

```
Tab:        Move focus forward through interactive elements
Shift+Tab:  Move focus backward
Enter:      Activate buttons, submit forms, select options
Space:      Toggle checkboxes, activate buttons
Escape:     Close modals, dismiss overlays, cancel ongoing actions
Arrow keys: Navigate within radio groups, select components
```

Focus order follows visual reading order (left to right, top to bottom). Focus is never trapped except in modal dialogs, where it cycles within the dialog until the dialog is dismissed.

### Focus Indicators

Focus indicators are always visible and must not be hidden via `outline: none` without a custom replacement.

```
Focus ring:   2px solid --color-accent, 2px offset
Focus ring must be visible against both light and dark backgrounds.
```

### Screen Reader Support

All images have descriptive `alt` text. Icon buttons have `aria-label`. Dynamic content updates (AI analysis completion, save state, error messages) use `aria-live` regions appropriate to urgency:

```
aria-live="polite":    Save state, non-urgent status updates
aria-live="assertive": Error states, validation messages
```

Decision State badges use `aria-label` that includes both the icon meaning and the text label: `aria-label="Decision state: Waiting for your review"`.

### Motion

All animations and transitions respect the user's `prefers-reduced-motion` media query setting. When reduced motion is preferred, transitions are instant (0ms duration) and no animations play.

---

## 15. Empty States

Empty states are screens where no content yet exists. They are not error states — they are invitations.

### Empty Dashboard (First-Time Authenticated User)

```
Illustration:  Simple geometric illustration (no photography, no stock images)
               Represents "a decision waiting to be made" — abstract, not literal
Heading:       "Your first decision is waiting."
Body:          "Start here and DecisionOS will guide you through the rest.
               No setup. No onboarding."
CTA:           [Start a Decision] — primary button
```

### Empty History (No Completed Decisions)

```
Heading:       "No completed decisions yet."
Body:          "When you complete a decision and record the outcome,
               it appears here."
CTA:           None — the user should complete a Decision first
```

### Empty Search / Filter Result

```
Heading:       "No decisions match this filter."
Body:          "Try adjusting your filters or clearing them to see all your decisions."
CTA:           [Clear filters] — ghost button
```

### Empty State Rules

- Never apologize in empty state copy ("Sorry, nothing here yet").
- Never use error language for empty states ("No results found").
- Always explain what will appear here and when.
- Only include a CTA if there is a direct action the user can take to fill the space.

---

## 16. Loading States

Loading states communicate that the system is working. They are never generic — each loading state is specific to the operation in progress.

### Decision Wizard Auto-Save

Per Section 7 (Save Indicator): a small "Saving..." indicator in the top-right corner of the Wizard container. No blocking. No overlay. The user can continue interacting.

### AI Analysis (In Analysis State)

This is the most important loading state in the product. Per FR-03.7, if analysis takes longer than 10 seconds, a meaningful progress indicator must be shown — not a spinner.

The AI Analysis loading screen occupies the full content area (720px container) and contains:

```
Top:     Decision category and title
Center:  Animated progress area:
         A sequence of three to four status messages that rotate every 4–6 seconds:
         — "Reading your context..."
         — "Evaluating your alternatives..."
         — "Assessing risks for each option..."
         — "Building your recommendation..."
         Each message is accompanied by a subtle progress animation
         (a horizontal bar that fills progressively, not a spinner)
Bottom:  "This usually takes 10–20 seconds. Your inputs are saved."
```

The rotating messages make the wait feel purposeful. They communicate what the system is doing, not just that it is doing something.

### Dashboard Loading

The Dashboard uses skeleton cards (animated shimmer placeholders) while Decision Objects load. Skeleton cards match the size and shape of real Decision Object cards. They are removed as real content loads, progressively — earlier items replace skeletons as they arrive.

### General Page Loading

For any page transition that requires a server round-trip, a 2px progress bar appears at the very top of the viewport (above the navigation bar), animating from left to right. This is never a blocking overlay.

---

## 17. Error States

Error states are specific. They explain what happened, what the user can do, and — when relevant — that their work has been preserved.

### AI Analysis Failure

```
Container:   Same 720px centered container as the analysis loading screen
Icon:        Warning illustration (not red, not alarming)
Heading:     "The analysis did not complete."
Body:        "This sometimes happens with complex decisions or when our AI is
             under heavy load. Your inputs have been saved.
             You can try again now or come back later."
Actions:     [Try again] (primary) | [Save and come back later] (ghost)
```

### Network Error (General)

```
Type:        Toast notification (bottom center, 320px wide, auto-dismiss after 6 seconds)
Icon:        Small wifi-off icon
Text:        "Connection issue. Changes may not have saved — check your
             connection and try again."
Action:      [Retry] text button within the toast
```

### Validation Error (Form)

See Section 12 — Forms & Validation.

### 404 — Decision Not Found

```
Heading:     "This decision doesn't exist or has been deleted."
Body:        "If you had a link to someone else's decision, it may have been
             removed. If this was your own decision, it may have expired."
CTA:         [Go to Dashboard] (primary, for authenticated users)
             [Start a new decision] (primary, for anonymous users)
```

### Session Expired

```
Type:        Full-page overlay (not dismissible)
Heading:     "Your session has ended."
Body:        "For your security, you were signed out after a period of
             inactivity. Your decision has been saved."
CTA:         [Sign in again] — redirects to login with return URL set
```

### Error State Rules

- Never show a raw error code or stack trace to the user.
- Always confirm that user data has been preserved when relevant.
- Always provide a next action. An error state with no CTA is a dead end.
- Use calm visual language. Danger red is reserved for destructive action confirmations. Error states use the warning amber palette or neutral grey, not alarming red.

---

## 18. Microinteractions

Microinteractions are small, purposeful feedback moments that confirm user actions and make the interface feel responsive. They are not decorative — each one serves a specific functional purpose.

### Auto-Save Feedback

On every Wizard input, after the user stops typing for 800ms, the auto-save fires. The Save Indicator transitions from idle → "Saving..." → "Saved" (fades out after 2 seconds). This is the user's confirmation that their work is protected. The animation is subtle: opacity transition, no movement.

### Alternative Card Selection (Alternatives Step)

When the user adds an alternative, the card slides in from below with a 200ms ease-out. When removed, it collapses with a 150ms ease-in. The list reflows smoothly. No hard jumps.

### Decision State Badge Transition

When a Decision Object's state changes (e.g., In Analysis → Waiting for User), the badge color transitions with a 300ms cross-fade. The user sees the badge change without a page reload.

### Recommendation Block Entry

When the Recommendation Screen loads for the first time, the Recommendation Block fades in with a 400ms ease. The alternatives cards below it stagger in at 100ms intervals. This sequence communicates that content is arriving in order of importance — the Recommendation first, the detail below.

### Action Plan Item Completion

When a user marks an Action Plan item as complete, the item's text receives a strikethrough animation (200ms) and the checkmark icon fills with the success color. The item is not removed — it stays visible as evidence of progress.

### Button Press Feedback

All buttons have a subtle scale transform on press: `transform: scale(0.97)` with `transition: 100ms ease`. This gives tactile feedback that the button has been activated, particularly important on mobile.

### Chat Message Send

When the user sends a Chat message, the message appears immediately in the chat area (optimistic UI). A loading indicator appears in the AI response position. When the AI response arrives, it replaces the loader. If the response fails, the optimistic message displays a "Failed to send. Retry" state.

### Microinteraction Rules

- All microinteractions respect `prefers-reduced-motion` (see Section 14).
- No microinteraction blocks user interaction. They are all non-blocking.
- Duration guide: acknowledgment (50–100ms), state change (150–200ms), content arrival (300–400ms). Nothing visible to the user exceeds 500ms except the AI analysis loading sequence.

---

## 19. Visual Consistency Rules

### What Must Always Be True

**One accent color.** `--color-accent` (#1A56DB) is used for all primary interactive elements — primary buttons, links, focus rings, and selected states. It is never used for decorative purposes.

**Typography hierarchy is never violated.** The font scale in Section 5 is the complete scale. No one-off font sizes are introduced for individual components. If a size does not exist in the scale, the nearest scale size is used.

**Icons are from one family.** DecisionOS uses a single icon library across all components. Icons are never mixed from multiple sources. Icon size is 16px (small, inline), 20px (standard), or 24px (prominent). Icon color always matches the text or interactive color of the context.

**Cards are not nested.** A card does not appear inside another card. If a layout requires nested content, the inner content uses a divider or a background color change, not a card with its own border and shadow.

**No horizontal scrolling on any screen.** All content reflows to fit the viewport width at all breakpoints defined in Section 13.

**State colors are not reused for other purposes.** The `--color-state-*` variables are used exclusively for Decision State indicators. They do not appear in unrelated contexts (e.g., using `--color-state-completed` green for a success toast).

### What Must Never Happen

- Multiple primary buttons on one screen
- Tooltips that contain information necessary to complete a task (necessary information is always visible)
- Animations that play more than once per user action
- Modal dialogs that the user cannot dismiss (except session expiry)
- Text rendered below `--text-xs` (11px) in any context
- Interactive elements smaller than 44px in touch target on mobile
- Any use of `!important` in component CSS that overrides a design token

---

## 20. Design Acceptance Criteria

These criteria define when a design implementation is considered complete and correct. They supplement the functional acceptance criteria in H06 Part 5.

### DAC-01 — Design Token Compliance

- [ ] All colors in the implementation match the defined CSS variables from Section 5
- [ ] No hardcoded color values exist outside the design token file
- [ ] All font sizes, weights, and families match the typography scale
- [ ] All spacing values are multiples of 4px

### DAC-02 — One Primary Action Per Screen

- [ ] Each screen has exactly one element using the `primary` button variant
- [ ] No screen presents two equally prominent call-to-action elements
- [ ] Secondary and ghost button variants are used for all non-primary actions

### DAC-03 — Wizard UX

- [ ] Each Wizard step presents exactly one question
- [ ] Progress indicator is visible at all times during the Wizard
- [ ] Each question is accompanied by a visible reason (not in a tooltip)
- [ ] Navigation row shows Back, Skip (where applicable), and Continue
- [ ] Continue button is disabled until required input is provided
- [ ] Auto-save indicator is visible and functional

### DAC-04 — Recommendation Screen

- [ ] Recommended alternative is the largest text element on the screen
- [ ] Primary reasoning is visible without scrolling on desktop
- [ ] Pros/Cons/Risks are visible for all alternatives
- [ ] "Conditions for change" section is visible (not collapsed by default on desktop)
- [ ] Chat entry point is visible without scrolling
- [ ] "Record My Decision" CTA is always visible on screen

### DAC-05 — Error and Validation Messages

- [ ] No validation message uses generic language ("This field is required")
- [ ] All error messages reference the decision consequence of the missing input
- [ ] Error messages appear below the relevant field, not in a separate area
- [ ] AI failure screen confirms that user data has been preserved

### DAC-06 — Mobile Compliance

- [ ] All interactive elements have a minimum 44px touch target
- [ ] No horizontal scrolling at 375px viewport width
- [ ] Bottom navigation is present and functional on mobile
- [ ] Wizard presents one question per full screen on mobile
- [ ] All font sizes use `rem` units
- [ ] The application is fully operable at both 375px and 768px viewport widths

### DAC-07 — Accessibility

- [ ] All color combinations meet WCAG 2.1 AA contrast ratios
- [ ] All interactive elements are reachable and operable by keyboard
- [ ] Focus indicators are visible on all interactive elements
- [ ] All images have descriptive `alt` text
- [ ] All icon-only buttons have `aria-label`
- [ ] Dynamic content updates use appropriate `aria-live` regions
- [ ] The application is fully operable with `prefers-reduced-motion: reduce`

### DAC-08 — Loading States

- [ ] AI analysis loading screen displays rotating status messages (not a spinner)
- [ ] Dashboard uses skeleton cards during load
- [ ] Page transitions use a top progress bar, not a blocking overlay
- [ ] No loading state blocks user interaction with already-loaded content

### DAC-09 — Empty States

- [ ] Empty Dashboard shows an invitation to start a Decision (not an apology)
- [ ] Empty History explains what will appear and when (no CTA)
- [ ] Empty filter result includes a "Clear filters" action
- [ ] No empty state uses error language or apologetic framing

### DAC-10 — Consistency

- [ ] No color values appear outside the defined token set
- [ ] Icon library is consistent across all screens (single source)
- [ ] No cards are nested within other cards
- [ ] No screen produces horizontal scrolling at any supported breakpoint
- [ ] All animations respect `prefers-reduced-motion`

---

*DecisionOS Company Handbook | H08 — UX & Design System*
*Version 1.0 Final | Status: Frozen*
*Owner: Founding Team | Next review: Q4 2026*
*Every visual and interaction decision must trace to a requirement in H06 or a principle in H02.*
