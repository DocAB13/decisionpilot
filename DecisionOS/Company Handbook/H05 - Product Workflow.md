# H05 — Product Workflow
**DecisionOS Company Handbook**
*Version 1.0 Final | June 2026*

---

## Preamble

H03 defines what a Decision is. H04 defines how the system is built to support it. H05 defines what the user actually experiences — from the moment they arrive at DecisionOS for the first time, to the moment a completed Decision becomes reusable knowledge.

This document is the primary reference for UX design, UI implementation, and product flow decisions. Every screen, every interaction, every transition in the product must be traceable to a workflow defined here. If a proposed feature cannot be located within one of these workflows, it requires explicit justification before it is built.

H05 does not describe visual design, color, or typography. It describes structure, sequence, and intent. The "what happens" and "why" — not the "how it looks."

Before reading H05, readers should be familiar with:
- **H01** — the target users this workflow serves
- **H03** — the Decision Object and its thirteen components
- **H04** — the system layers that execute these workflows

---

## Core Workflow Principles

Before defining the flows, four principles govern every workflow decision in DecisionOS.

**Every screen belongs to a Decision.** A user is always either starting a Decision, working on one, reviewing one, or learning from one. There are no screens in DecisionOS that exist outside of this relationship.

**No dead ends.** Every state the user can reach has a clear next action. If a user is confused about what to do next, the product has failed, not the user.

**Progress is always preserved.** A user who closes the browser mid-flow, loses connection, or switches devices should return to exactly where they left off. Nothing is lost. Nothing needs to be repeated.

**The user is always in control.** The product guides, but it does not force. A user can pause, go back, change their mind, or abandon a Decision at any point. The system remembers, but it never pressures.

---

## User Entry Points

A user arrives at DecisionOS from one of four entry points. Each entry point leads into one of the core workflows, but the experience must feel coherent regardless of how the user arrived.

### Entry Point 1 — Direct Navigation
The user types the URL or clicks a bookmark. They arrive at the homepage. This is the most common entry point for returning users.

### Entry Point 2 — Search or Referral
The user arrives from a search result, a shared link, or an external referral. They may land on the homepage, a category page, or a specific guide. The product must orient them immediately — they may not know what DecisionOS is yet.

### Entry Point 3 — Deep Link to a Decision
The user clicks a link that takes them directly to a specific Decision Object they own or have been invited to. This requires authentication. If the user is not authenticated, they are asked to sign in before the Decision is revealed.

### Entry Point 4 — Returning via Notification
The user receives a notification — email or in-app — prompting them to return to an active Decision Object. The notification links directly to the relevant Decision Object and the specific action awaiting them.

---

## Workflow 1 — First Visit (Anonymous User)

This workflow describes the experience of a user who arrives at DecisionOS for the first time without an account.

### 1.1 — Landing

The user arrives at the homepage. Within five seconds, they must understand:
- What DecisionOS does
- That they can start immediately, without signing up
- What kinds of decisions it supports

The homepage is not a marketing brochure. It is an entry point to a Decision. The primary call to action is "Start a Decision" — not "Sign up," not "Learn more," not "Watch a demo."

The homepage may show categories, recent examples of decision types, or a brief explanation of how it works. It must not require scrolling to reach the primary action.

### 1.2 — Category Selection

The user selects the category of decision they want to make. Categories are organized clearly — Finance, Technology, Health, Travel, Career, Home, and others as defined in the product roadmap.

Selection can happen via:
- Browsing the category grid
- Using the search bar to describe their decision in their own words
- Clicking a suggested decision type displayed on the homepage

If the user does not find their category, they can describe it in natural language. The system maps this to the closest category or routes them to the AI Chat Interface.

### 1.3 — Decision Wizard — Context Collection

The user enters the Decision Wizard. The Wizard begins with the Context component of the Decision Object as defined in H03.

The Wizard asks structured questions, one concept at a time. It does not present a long form. Each question is clearly tied to the decision being made — the user always understands why they are being asked.

Questions cover:
- Background and current situation
- What has already been considered
- Any prior attempts to resolve the question

The user can skip optional questions. Progress is shown. The Wizard communicates clearly how many steps remain.

### 1.4 — Decision Wizard — Goal and Constraints

The Wizard continues to the Goal and Constraints components. These are the most important inputs — they determine the shape of the AI analysis.

For Goal: the user is asked what a good outcome looks like for them. The Wizard may offer structured prompts to help users articulate goals they have not fully formed.

For Constraints: the user defines their hard limits — budget, timeline, geography, personal restrictions. The Wizard distinguishes between hard constraints (absolute) and soft constraints (preferences).

### 1.5 — Decision Wizard — Alternatives

The user provides the options they are currently considering. The Wizard accepts two or more alternatives. If the user provides only one, the Wizard prompts them to consider what else they might be choosing between — including the option of doing nothing.

The AI may suggest additional alternatives based on the category and context. The user can accept or reject these suggestions.

### 1.6 — AI Analysis (In Progress)

The user submits their inputs. The Decision Object transitions to IN ANALYSIS state. The system communicates that analysis is underway. This must not feel like a loading spinner — it should feel like a knowledgeable colleague is reviewing the information and thinking it through.

Analysis typically completes in seconds. For complex or multi-alternative decisions, it may take longer. The product handles both cases gracefully, without making the user feel abandoned.

### 1.7 — Recommendation View

The analysis is complete. The Decision Object transitions to WAITING FOR USER state. The Recommendation is presented.

The Recommendation View shows:
- The recommended alternative, stated clearly
- The primary reasoning in plain language
- Pros and cons for each alternative
- Risks associated with each alternative
- The conditions under which this Recommendation would change

The user can explore the reasoning in depth. They can challenge specific assumptions. They can ask follow-up questions through the AI Chat Interface. The Recommendation does not disappear — it remains available as long as the Decision Object is active.

### 1.8 — Account Prompt

At this point, the user has received real value. This is the natural moment to invite them to create an account — not before.

The prompt is clear and honest: "Save this Decision and track the outcome. Your analysis is preserved for 48 hours without an account." The user can:
- Create an account (recommended path)
- Continue without an account (Decision is preserved temporarily)
- Return later via a link sent to their email (no account required, temporary)

The account prompt is never a wall. A user who declines can still record their Final Decision and receive an Action Plan. They simply will not have long-term access to the Decision History.

### 1.9 — Final Decision and Action Plan

The user records their Final Decision. This is a deliberate, explicit act — not an implicit click. The Wizard asks: "What have you decided?" and gives the user space to state this in their own words, alongside selecting from the alternatives presented.

If the user's Final Decision differs from the Recommendation, the Wizard asks a single optional question: "What influenced your decision?" This input is valuable to the system but is never required.

The Action Plan is generated. It presents the three to five most important next steps the user should take given their decision. Each step is concrete and actionable.

The Decision Object transitions to DECISION MADE state.

---

## Workflow 2 — Returning User (Authenticated)

This workflow describes the experience of a user who has an account and returns to DecisionOS.

### 2.1 — Dashboard

The authenticated user's homepage is their Decision Dashboard. It shows:
- Active Decision Objects and their current Decision State
- Decision Objects awaiting a next action from the user
- Recently completed Decision Objects
- A prompt to start a new Decision

The Dashboard is not a feed. It is a task list organized around Decision Objects. The user sees immediately what needs their attention.

### 2.2 — Resuming an Active Decision

A user who left a Decision in Draft or Waiting for User state can resume it from the Dashboard. They return to exactly the state where they left off. The Wizard remembers their inputs. The AI remembers the context. Nothing is repeated.

If new information is available — a change in market conditions, an updated risk factor — the system may prompt the user to consider whether their Context or Constraints have changed. This prompt is helpful, not mandatory.

### 2.3 — Recording an Outcome

When sufficient time has passed since a Decision was marked DECISION MADE or EXECUTING, the system prompts the user to record an Outcome. This prompt appears on the Dashboard and, optionally, via email.

The Outcome collection is brief and structured:
- What happened?
- Did the outcome match your goal?
- How satisfied are you with the decision?

The user can provide as much or as little detail as they choose. The system does not judge. A short Outcome is better than no Outcome.

After the Outcome is recorded, the Decision Object transitions to COMPLETED state.

### 2.4 — Reflection and Lessons Learned

Immediately after recording an Outcome, the system invites the user to Reflect. This step is explicitly optional but prominently offered.

Reflection asks:
- Was the decision-making process useful?
- What would you do differently?
- Was the AI analysis helpful?

Lessons Learned follows: the user can write a short note to their future self about what this decision taught them. This note is stored as part of the Decision Object and is surfaced when the user faces a similar decision in the future.

The Decision Object is now fully complete. It transitions to COMPLETED state and becomes part of the user's Decision History.

---

## Workflow 3 — AI Chat Within a Decision

The AI Chat Interface is always anchored to a specific Decision Object. This workflow describes how a user engages with AI in depth beyond the structured Wizard.

### 3.1 — Entering Chat from a Decision

From any active Decision Object — in Draft, Waiting for User, or Decision Made state — the user can open the AI Chat Interface. The Chat opens with full awareness of the current Decision context: category, inputs provided, Recommendation if available.

The Chat does not start from scratch. It starts from where the Decision is.

### 3.2 — Chat Interactions

Within Chat, the user can:
- Ask questions about the Recommendation ("Why did you weight reliability so heavily?")
- Challenge assumptions ("What if my budget increased by 20%?")
- Explore alternatives not yet considered
- Request a deeper analysis of a specific risk
- Ask for clarification on any part of the Decision Object

Every message and response in the Chat is stored as part of the Decision Object. The conversation is not ephemeral. It is part of the record.

### 3.3 — Updating the Decision from Chat

If the user provides new information in Chat that changes the Context, Constraints, or Alternatives, the system flags this and asks whether the user wants to update the Decision Object formally.

If they do, the relevant components are updated and a new AI analysis is triggered. The Decision Object returns to IN ANALYSIS state. The previous Recommendation is preserved in Version History.

If they do not, the Chat exchange is stored as context but the Decision Object is not modified.

### 3.4 — Closing Chat

Chat is a tool within a Decision, not a destination. When the user closes the Chat, they return to the Decision Object. Their next action is always related to advancing the Decision — not to continuing the conversation.

---

## Workflow 4 — Decision History and Knowledge

This workflow describes how a user engages with their completed Decision Objects over time.

### 4.1 — Browsing Decision History

The Decision History is accessible from the Dashboard. It shows all Decision Objects the user owns, filterable by:
- Decision State (Active, Completed, Archived)
- Category
- Date range
- Outcome quality (satisfied / neutral / unsatisfied)

The History is not a list of chat logs. It is a structured library of decisions made, with each entry showing the category, the Final Decision, the Outcome, and the Lessons Learned at a glance.

### 4.2 — Revisiting a Past Decision

A user can open any past Decision Object in full. They can read the complete record — every component, every AI analysis, every Chat message, every Outcome, every Lesson Learned.

They cannot modify a Completed Decision Object's content retroactively. If they want to revisit a decision in light of new information, they start a new Decision Object and can reference the previous one in the Context component.

### 4.3 — Applying Lessons Learned to a New Decision

When a user starts a new Decision Object in a category where they have previously completed decisions, the system surfaces relevant Lessons Learned from those past decisions.

This surfacing is explicit and attributed: "Based on your past decisions in this category, you noted: [lesson]." The user can dismiss it, acknowledge it, or incorporate it into their new Context.

This is Decision Intelligence at the individual level — the user becoming progressively better at this type of decision because the system remembers what they learned.

### 4.4 — Archiving a Decision

A user can archive any Completed Decision Object. Archiving moves it out of the active History view but preserves it in full. Archived Decision Objects remain searchable and can be unarchived at any time.

Deletion is permanent. When a user deletes a Decision Object, its content is removed immediately. The user is asked to confirm. There is no undo.

---

## Workflow 5 — Upgrade and Subscription

Subscription exists to fund the product and unlock advanced capabilities. It is never a wall that prevents a user from making a basic decision.

### 5.1 — Free Tier Experience

A user on the free tier can:
- Start and complete Decision Objects across all categories
- Use the Decision Wizard in full
- Receive AI-generated Recommendations
- Record Outcomes and Reflections
- Access their Decision History

The free tier is genuinely useful. It is not a demo.

### 5.2 — Upgrade Triggers

A user is shown an upgrade prompt when they reach a capability that requires a paid plan. Upgrade prompts are shown in context — at the moment the user would benefit from the feature, not as interruptions during a flow.

Upgrade prompts are honest and specific: "This feature requires a Pro plan. Here is what you get and what it costs." They are never alarming, urgent, or manipulative.

### 5.3 — Upgrade Flow

The user selects a plan and is taken to the Stripe Checkout. After successful payment, they are returned to the product — specifically, to the context where they initiated the upgrade. They immediately have access to the feature that prompted the upgrade.

A user who upgrades mid-Decision does not lose their progress. The Decision Object is preserved exactly as it was.

### 5.4 — Downgrade and Cancellation

A user who cancels their subscription returns to the free tier. Their Decision Objects, History, and Lessons Learned are preserved in full. Features that require a paid plan are locked, but no data is lost.

---

## Workflow 6 — Onboarding for New Accounts

This workflow applies when a user creates an account for the first time — either during Workflow 1 (after completing an anonymous decision) or directly from the homepage.

### 6.1 — Account Creation

The account creation form asks for the minimum required information: email and password. No profile setup. No preference survey. No onboarding wizard that must be completed before the product is usable.

If the user is claiming an anonymous Decision Object (Workflow 1.8), the Decision Object is transferred to their new account immediately after creation. They arrive on their Dashboard with their first Decision already in progress.

### 6.2 — Email Confirmation

The user receives an email confirmation. The product remains usable before confirmation, with a persistent but non-intrusive prompt to confirm. Unconfirmed accounts have full access to the product — confirmation is required only for features that involve persistent notifications or account recovery.

### 6.3 — First Dashboard State

If the user created an account without a prior anonymous Decision, their first Dashboard state is empty. The product presents a single clear action: "Start your first Decision." Nothing else competes for attention.

The empty state is not a tutorial. It is an invitation.

---

## Workflow 7 — Error and Edge Case Handling

Errors are part of any workflow. How the product handles them is a product quality signal as important as any feature.

### 7.1 — AI Analysis Failure

If the AI analysis fails — due to a service outage, timeout, or input error — the user is informed clearly and without technical language. The Decision Object remains in its current state. The user is offered the option to retry immediately or return later. Their inputs are preserved.

The product never loses a user's Decision because of a technical failure.

### 7.2 — Incomplete Input

If a user attempts to advance through the Decision Wizard with insufficient input, the system explains specifically what is missing and why it matters. It does not show a generic validation error. It explains the impact: "Without knowing your budget, we cannot meaningfully compare these options."

### 7.3 — Abandoned Decisions

A Decision Object that has been in Draft state for more than seven days without activity receives a single reminder. If the user does not return within another seven days, the Decision Object remains in Draft indefinitely — it is never auto-deleted.

An anonymous Decision Object that has not been claimed by a signed-in user is preserved for 48 hours, then deleted. The user is informed of this timeline at the point where they choose to remain anonymous.

### 7.4 — Conflicting Inputs

If the user's inputs contain an internal conflict — for example, a goal that is incompatible with a stated constraint — the AI flags this explicitly before proceeding to analysis. The user is asked to resolve the conflict or to acknowledge it before the analysis continues.

The system never silently ignores a conflict. It surfaces it, explains it, and lets the user decide how to proceed.

---

## Workflow Summary

The following table maps each workflow to the Decision States it spans, the user type it serves, and the primary Experience Layer component it uses.

| Workflow | Decision States Touched | User Type | Primary Component |
|---|---|---|---|
| 1 — First Visit | Draft → Waiting for User → Decision Made | Anonymous | Decision Wizard |
| 2 — Returning User | All states | Authenticated | Dashboard + Wizard |
| 3 — AI Chat | Draft, Waiting for User, Decision Made | Any | AI Chat Interface |
| 4 — History & Knowledge | Completed, Archived | Authenticated | Decision History |
| 5 — Upgrade & Subscription | Any | Any | Inline prompts + Stripe |
| 6 — Onboarding | Draft (first Decision) | New account | Dashboard |
| 7 — Errors & Edge Cases | Any | Any | Contextual messages |

---

## What H05 Does Not Define

This document defines the workflows — the sequence of events, the states, and the decisions the user makes. It does not define:

- Visual design, layout, or component library
- Specific copy or microcopy
- Animation and transition behavior
- Mobile-specific layout adaptations
- Accessibility implementation

These belong to design system documentation, which will be created as a separate reference once H05 is stable.

What H05 does define is authoritative. A design or implementation that contradicts a workflow defined here requires an explicit justification and a documented decision before it can be built.

---

*DecisionOS Company Handbook | H05 — Product Workflow*
*Version 1.0 Final | Status: Frozen*
*Owner: Founding Team | Next review: Q4 2026*
*Every screen in the product must be locatable within one of these workflows.*
