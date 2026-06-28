# H06 — Product Requirements (PRD)
**DecisionOS Company Handbook**
*Version 1.0 Final | June 2026*

---

## Preamble

This document defines the complete product requirements for DecisionOS MVP. It is the authoritative specification for engineering implementation.

H06 translates the vision in H01, the principles in H02, the Decision Model in H03, the architecture in H04, and the workflows in H05 into concrete, implementable requirements. Every requirement in this document traces back to one of those foundations. Requirements that cannot be traced back should be challenged before implementation begins.

Before reading H06, engineers should be familiar with:
- **H03** — the Decision Object, its thirteen components, and its seven Decision States
- **H04** — the six system layers and their responsibilities
- **H05** — the seven user workflows that these requirements serve

This document is organized as follows:
1. MVP Scope Definition
2. Functional Requirements by system area
3. User Stories
4. Business Rules
5. Acceptance Criteria
6. Out of Scope
7. Implementation Priorities

---

## Part 1 — MVP Scope Definition

### What MVP Means for DecisionOS

The DecisionOS MVP is the smallest version of the product that delivers a complete Decision Lifecycle to a real user — from first visit to Lessons Learned — with sufficient quality to earn trust, collect meaningful feedback, and support the first paying customers.

The MVP is not a prototype. It is not a demo. It is a production system that a real person can use to make a real decision they care about, with confidence that the system will not lose their work, mislead them, or fail them at a critical moment.

### MVP Success Criteria

The MVP is considered successful when:
- A user can start a Decision Object, receive an AI Recommendation, record a Final Decision, and receive an Action Plan — entirely without assistance
- A returning user can find their Decision History, resume an active Decision Object, and record an Outcome
- Subscription payments process correctly end-to-end
- The system handles AI failures, session interruptions, and invalid inputs gracefully without data loss
- At least one user per week completes the full Decision Lifecycle (Draft → Completed) organically

### MVP Boundaries

**In MVP:**
- Full Decision Wizard (all components of the Decision Object through Final Decision and Action Plan)
- AI Recommendation with visible reasoning
- User authentication (email/password)
- Decision History for authenticated users
- Outcome and Reflection collection
- Subscription billing (Free, Pro, Premium tiers)
- Anonymous Decision Objects with 48-hour preservation
- AI Chat Interface anchored to a Decision Object
- Web application (desktop and mobile-responsive)

**Explicitly not in MVP** (see Part 6 for full out-of-scope list):
- Native mobile application
- Public API
- Embedded interface
- Decision sharing between users
- Learning Pipeline and Knowledge Base
- Notifications system
- Multi-language UI (English only for MVP; localization infrastructure is in scope)

---

## Part 2 — Functional Requirements

### FR-01 — Decision Object Creation

**FR-01.1** The system must create a new Decision Object whenever a user initiates a Decision, regardless of authentication state. Anonymous users receive a Decision Object with a temporary Owner field.

**FR-01.2** Every Decision Object must be assigned a unique, permanent Decision ID at creation. The ID must not change under any circumstances after creation.

**FR-01.3** The system must set the Decision Object's initial Decision State to Draft upon creation and record the Created At timestamp.

**FR-01.4** The system must persist a partial Decision Object at every step of the Decision Wizard — after each question is answered — so that no user input is ever lost due to session interruption, browser close, or navigation away.

**FR-01.5** An anonymous Decision Object must remain accessible via its Decision ID for a minimum of 48 hours from creation. After 48 hours without a signed-in owner claiming it, the system may delete the Decision Object. The user must be informed of this expiry at the point of choosing to remain anonymous.

**FR-01.6** When an anonymous user signs in or creates an account, all anonymous Decision Objects from the current session must be transferred to their account immediately.

---

### FR-02 — Decision Wizard

**FR-02.1** The Decision Wizard must collect the following components of the Decision Object as defined in H03, in this order: Context, Goal, Constraints, Alternatives. The Decision Identity component (component 0) is populated automatically by the system.

**FR-02.2** The Wizard must present questions one concept at a time. It must not present a multi-field form where all fields are visible simultaneously.

**FR-02.3** Each question in the Wizard must be accompanied by a brief explanation of why it matters to the decision being made. This explanation must be specific to the category, not generic.

**FR-02.4** The Wizard must clearly communicate the user's progress through the collection flow. The user must always know how many steps remain.

**FR-02.5** All Wizard questions must be skippable except for the Alternatives component. A Decision Object with fewer than two alternatives cannot proceed to AI analysis.

**FR-02.6** The Wizard must allow backward navigation. A user can return to any previously completed step and change their answer. When they do, the system must flag that subsequent components (AI Analysis, Recommendation) may be affected by the change.

**FR-02.7** For the Alternatives component, the Wizard must accept two to five alternatives. If the user provides fewer than two, the Wizard must explain why a minimum of two is required. If the user provides more than five, the Wizard must inform them that the analysis will focus on the top five by relevance.

**FR-02.8** The AI must suggest up to three additional alternatives based on category and context after the user has provided their initial alternatives. The user can accept or reject each suggestion individually.

**FR-02.9** For every decision category, the Wizard must suggest a "do nothing" alternative if the user has not already included one. This prompt is optional for the user to accept.

**FR-02.10** The Wizard must identify and surface potential conflicts between Goal and Constraints before proceeding to AI analysis. A conflict is defined as a Constraint that makes the stated Goal mathematically or logically unachievable. The user must acknowledge the conflict before proceeding.

---

### FR-03 — AI Analysis

**FR-03.1** The system must initiate AI analysis automatically when the user completes the Alternatives step and submits the Wizard. The Decision State must transition from Draft to In Analysis.

**FR-03.2** The AI analysis must produce a structured output that populates the following Decision Object components as defined in H03: AI Analysis (component 5), Risks (component 6), and Recommendation (component 7).

**FR-03.3** The AI analysis must evaluate every alternative provided by the user against the stated Goal and Constraints. No alternative may be ignored in the analysis.

**FR-03.4** For each alternative, the AI must produce: a minimum of two pros, a minimum of two cons, and a minimum of one risk. These are absolute minimums, not targets.

**FR-03.5** The Recommendation must identify a single winning alternative. If two alternatives are genuinely equal given the user's inputs, the system must say so explicitly and explain what additional information would break the tie.

**FR-03.6** The Recommendation must include a plain-language explanation of the primary reasoning. This explanation must reference specific inputs the user provided — it must not be generic.

**FR-03.7** The AI analysis must complete within 30 seconds in normal operating conditions. If the analysis takes longer than 10 seconds, the system must show a meaningful progress indicator — not a spinner.

**FR-03.8** If the AI analysis fails, the system must preserve the Decision Object in its current state, inform the user in plain language, and offer a retry option. The system must never transition the Decision State to In Analysis and leave it stuck there if the analysis fails.

**FR-03.9** The AI analysis prompt must include the decision category, all user-provided Context, Goal, Constraints, and Alternatives. It must not include any data from other users' Decision Objects.

**FR-03.10** Every AI analysis must be versioned. When the user updates their inputs and triggers a new analysis, the previous AI Analysis and Recommendation are preserved in the Version History of the Decision Object. They are not overwritten.

---

### FR-04 — Recommendation View

**FR-04.1** The Recommendation View must display the following elements: the recommended alternative (stated clearly as the primary heading), the primary reasoning in plain language, a complete pros and cons breakdown for each alternative, and the risks associated with each alternative.

**FR-04.2** The Recommendation View must display the conditions under which the Recommendation would change. This is derived from the AI analysis and must be shown as part of the standard view, not hidden behind a toggle.

**FR-04.3** The Recommendation View must provide a clear entry point to the AI Chat Interface. The Chat must open pre-loaded with the full Decision context.

**FR-04.4** The Recommendation View must provide a clear call to action to proceed to the Final Decision step. This action must be visually distinct but must not pressure the user with urgency language.

**FR-04.5** The Recommendation View must be fully accessible to the user at any point while the Decision Object is in Waiting for User state. Navigating away and returning must show the same Recommendation.

**FR-04.6** If the user has updated their inputs and a new analysis is available, the system must inform the user that the Recommendation has been updated and allow them to compare the previous and current Recommendation.

---

### FR-05 — Final Decision and Action Plan

**FR-05.1** The Final Decision step must ask the user to explicitly state which alternative they have chosen. This must be an active selection, not an implied one from viewing the Recommendation.

**FR-05.2** The Final Decision step must ask the user to record their confidence level on a three-point scale: Confident, Uncertain, or Reluctant. This field is required.

**FR-05.3** If the user's Final Decision differs from the Recommendation, the system must present a single optional question: "What influenced your decision differently?" The user can skip this. Their answer is stored in the Final Decision component.

**FR-05.4** After the Final Decision is recorded, the Decision State must transition from Waiting for User to Decision Made.

**FR-05.5** The Action Plan must be generated immediately after the Final Decision is recorded. The Action Plan must contain three to five concrete, actionable next steps specific to the user's chosen alternative and their Category.

**FR-05.6** Each Action Plan item must be a specific action, not a category of actions. "Research mortgage rates" is not acceptable. "Contact three lenders and request a mortgage illustration for the amount and term you specified" is acceptable.

**FR-05.7** The user must be able to mark Action Plan items as complete. This does not affect the Decision State. Marking all items complete transitions the Decision State from Decision Made to Executing only if the user explicitly confirms readiness to execute.

**FR-05.8** The Action Plan must be editable by the user. They can add, remove, or modify items. Edits are recorded in the Version History of the Decision Object.

---

### FR-06 — Decision State Management

**FR-06.1** The system must enforce the following valid state transitions and reject all others:
- Draft → In Analysis (triggered by Wizard submission)
- In Analysis → Waiting for User (triggered by successful AI analysis completion)
- In Analysis → Draft (triggered by AI analysis failure, with user acknowledgment)
- Waiting for User → Decision Made (triggered by user recording Final Decision)
- Waiting for User → Draft (triggered by user choosing to update their inputs)
- Decision Made → Executing (triggered by user confirming execution readiness)
- Executing → Completed (triggered by user recording an Outcome)
- Completed → Archived (triggered by user action)
- Any state → Archived (triggered by user action, with confirmation)

**FR-06.2** Every state transition must be recorded in the Version History of the Decision Object, including: the previous state, the new state, the timestamp, and the trigger (user action or system event).

**FR-06.3** The system must never leave a Decision Object in In Analysis state longer than 5 minutes without either completing the transition to Waiting for User or reverting to Draft with an error recorded.

**FR-06.4** A Decision Object in Waiting for User state must remain in that state indefinitely until the user takes an action. The system must not auto-expire this state.

**FR-06.5** A Decision Object may be moved to Archived from any state. Archiving does not delete content. It removes the Decision Object from the user's default Dashboard view.

---

### FR-07 — AI Chat Interface

**FR-07.1** The AI Chat Interface must be accessible from any Decision Object in Draft, Waiting for User, or Decision Made state.

**FR-07.2** When the Chat opens, it must load the full Decision Object context — category, all collected components, and the current Recommendation if available — as the AI's starting context. The user must not need to repeat information they have already provided.

**FR-07.3** Every message and AI response in the Chat must be stored as part of the Decision Object. Chat history must persist across sessions and devices.

**FR-07.4** If the user provides new information in Chat that materially changes the Context, Goal, Constraints, or Alternatives, the system must detect this and offer to update the Decision Object components formally. The offer must be explicit and require the user's confirmation.

**FR-07.5** Chat messages must not be used to modify Decision Object components implicitly. Changes happen explicitly through the Wizard or through a formal update flow triggered from Chat.

**FR-07.6** The Chat must clearly communicate its context: "You are discussing your [Category] decision" must be visible at all times within the Chat interface.

**FR-07.7** The Chat must gracefully handle AI failures. If an AI response fails, the user is informed and can retry. The failed message is not stored as part of the Decision Object record.

---

### FR-08 — User Authentication

**FR-08.1** The system must support email and password authentication. No other authentication method is required for MVP.

**FR-08.2** Account creation requires only email and password. No additional profile information is collected at signup.

**FR-08.3** The product must be fully functional before email confirmation is completed. Email confirmation is required only to unlock persistent notifications (post-MVP feature).

**FR-08.4** Password reset must be available via email. The reset link must expire after 24 hours.

**FR-08.5** A user session must persist for a minimum of 30 days without requiring re-authentication, unless the user explicitly signs out.

**FR-08.6** An anonymous user who creates an account during or after completing a Decision Object must have all their anonymous Decision Objects transferred to their new account automatically and immediately.

**FR-08.7** The system must never require authentication to start or complete a Decision Object. Authentication is required only to persist Decision Objects beyond 48 hours and to access Decision History.

---

### FR-09 — Decision History and Dashboard

**FR-09.1** Authenticated users must have access to a Decision Dashboard that displays all their Decision Objects.

**FR-09.2** The Dashboard must group Decision Objects by Decision State: Active (Draft, In Analysis, Waiting for User, Decision Made, Executing), Completed, and Archived.

**FR-09.3** Each Decision Object in the Dashboard must display: Category, creation date, Decision State, and — for Completed Decision Objects — Outcome satisfaction rating.

**FR-09.4** The Dashboard must provide filtering by: Decision State, Category, and date range.

**FR-09.5** The Dashboard must surface Decision Objects that require user action with a clear priority indicator: Decision Objects in Waiting for User state, Decision Objects in Executing state where an Outcome has not been recorded and more than 30 days have passed, and Decision Objects in Draft state that have been inactive for more than 7 days.

**FR-09.6** A user must be able to permanently delete a Decision Object from the Dashboard. Deletion is immediate and irreversible. The user must be asked to confirm before deletion. Deleted Decision Objects are removed from all views and all data stores within 24 hours.

**FR-09.7** The system must support a maximum of 100 Decision Objects per user account in MVP. This limit may be raised in future versions.

---

### FR-10 — Outcome and Reflection

**FR-10.1** When a Decision Object has been in Executing state for 30 days without an Outcome being recorded, the system must surface a prompt on the Dashboard asking the user to record their Outcome.

**FR-10.2** The Outcome collection must ask: what happened, whether the outcome matched the goal (yes / partially / no), and a satisfaction rating (1–5). All three fields are required to mark an Outcome as recorded.

**FR-10.3** After an Outcome is recorded, the system must immediately offer the Reflection flow. The Reflection flow is optional but must be prominently presented.

**FR-10.4** The Reflection collection must ask: whether the decision process was useful, what the user would do differently, and whether the AI analysis was helpful. All fields are optional within the Reflection.

**FR-10.5** After Reflection is completed (or skipped), the system must present the Lessons Learned prompt. The user can write a free-text note to their future self. This field is optional.

**FR-10.6** After Outcome is recorded, the Decision State must transition to Completed, regardless of whether Reflection and Lessons Learned have been completed.

**FR-10.7** A user can return to add or edit Reflection and Lessons Learned on any Completed Decision Object at any point in the future.

---

### FR-11 — Subscription and Billing

**FR-11.1** The system must support three subscription tiers: Free, Pro (€4.99/month), and Premium (€9.99/month). Pricing is defined in EUR as the primary currency.

**FR-11.2** The Free tier must allow: unlimited Decision Objects, full Decision Wizard, AI Recommendations, Outcome and Reflection recording, and access to Decision History for the most recent 10 Decision Objects.

**FR-11.3** The Pro tier must include everything in Free plus: full Decision History (unlimited), AI Chat Interface, Action Plan editing, and priority AI response times.

**FR-11.4** The Premium tier must include everything in Pro plus: advanced Recommendation analysis (deeper pros/cons, expanded risk assessment), Lessons Learned surfacing across past decisions, and premium support.

**FR-11.5** Subscription payments must be processed via Stripe. The system must use Stripe Checkout for the payment flow. The system must not handle raw card data at any point.

**FR-11.6** When a payment is completed, the Stripe webhook must update the user's subscription record in Supabase within 60 seconds of the payment event.

**FR-11.7** When a subscription is cancelled or lapses, the user's tier must revert to Free. Their Decision Objects, History, and all Decision Object content must be fully preserved. Only tier-specific capabilities are restricted.

**FR-11.8** Upgrade prompts must be shown in context — at the specific moment a user attempts to use a feature that requires a higher tier. Upgrade prompts must not appear during the Decision Wizard flow or during Recommendation viewing.

**FR-11.9** A user who upgrades mid-session must not lose any Decision Object data or progress as a result of the upgrade. The upgrade flow must return them to exactly the context where they initiated the upgrade.

---

### FR-12 — Performance and Reliability

**FR-12.1** The Decision Wizard must load within 2 seconds on a standard broadband connection.

**FR-12.2** AI analysis must complete within 30 seconds for 95% of requests. Requests that exceed 30 seconds must be surfaced to the user with an appropriate message and a retry option.

**FR-12.3** The system must maintain 99.5% uptime for all user-facing endpoints during MVP.

**FR-12.4** No user input entered in the Decision Wizard must be lost due to a system error. If a save operation fails, the system must retry automatically a minimum of three times before informing the user.

**FR-12.5** The web application must be fully functional and usable on mobile browsers (iOS Safari, Android Chrome) without a native application. Responsive breakpoints must support screens from 375px width.

**FR-12.6** The system must handle concurrent AI analysis requests gracefully. A spike in usage must degrade gracefully (slower response times) rather than failing silently.

---

## Part 3 — User Stories

User stories follow the format: As a [user type], I want to [action], so that [outcome].

### US-01 — Starting a Decision (Anonymous)
*As a first-time visitor, I want to start a decision immediately without creating an account, so that I can evaluate whether DecisionOS is useful before committing.*

Acceptance: User can complete the full Decision Wizard and receive a Recommendation without authentication. No sign-up prompt appears until after the Recommendation is shown.

### US-02 — Receiving a Structured Recommendation
*As a user who has completed the Wizard, I want to see a clear recommendation with visible reasoning, so that I can evaluate it and decide whether to follow it or not.*

Acceptance: Recommendation View shows the winning alternative, primary reasoning referencing the user's inputs, pros/cons per alternative, risks per alternative, and conditions for changing the Recommendation.

### US-03 — Recording a Final Decision That Differs from the Recommendation
*As a user who has considered the AI Recommendation, I want to record a different final decision with my own reasoning, so that the system captures what I actually decided and why.*

Acceptance: Final Decision step accepts any of the user's alternatives, not just the recommended one. If the choice differs from the Recommendation, an optional explanation field is shown. The Action Plan is generated for the user's actual chosen alternative, not the recommended one.

### US-04 — Saving a Decision to an Account
*As an anonymous user who has received a valuable Recommendation, I want to create an account and save my Decision, so that I can return to it later and track the outcome.*

Acceptance: After account creation, the anonymous Decision Object is immediately visible in the user's Dashboard. No data is lost. No steps need to be repeated.

### US-05 — Resuming an Incomplete Decision
*As a returning authenticated user, I want to resume a Decision I started last week, so that I do not have to start over from scratch.*

Acceptance: User opens Dashboard, sees Decision Object in Draft state, clicks to resume, and returns to the exact Wizard step where they left off with all previous inputs intact.

### US-06 — Asking a Follow-Up Question via Chat
*As a user who has received a Recommendation, I want to ask the AI why it weighted a specific factor so heavily, so that I can decide whether I agree with the reasoning.*

Acceptance: Chat opens with Decision context pre-loaded. User's question receives a response that references the specific Decision Object components relevant to the question. The Chat message is stored as part of the Decision Object.

### US-07 — Recording an Outcome
*As a user whose decision is now in Executing state, I want to record what actually happened, so that I can close the loop and learn from the experience.*

Acceptance: User accesses the Outcome flow from the Dashboard prompt or directly from the Decision Object. Completes the three required fields. Decision State transitions to Completed. Reflection prompt is immediately offered.

### US-08 — Finding a Past Decision
*As an authenticated user with multiple completed decisions, I want to find a specific Decision Object from three months ago, so that I can review what I decided and why.*

Acceptance: Decision History is filterable by category and date range. The target Decision Object is findable in three interactions or fewer from the Dashboard.

### US-09 — Upgrading to Pro Mid-Flow
*As a Free-tier user who has just completed a Decision and wants to access the AI Chat Interface, I want to upgrade to Pro without losing my current Decision context, so that I can immediately use the feature I paid for.*

Acceptance: Upgrade prompt appears in context. After successful payment, user is returned to the Decision Object they were viewing. Chat Interface is immediately available. No data is lost.

### US-10 — Deleting a Decision Object
*As a user who started a decision I no longer need, I want to permanently delete it, so that my Decision History remains relevant to me.*

Acceptance: Delete action is available from the Dashboard and from within the Decision Object. A confirmation is required. After confirmation, the Decision Object is immediately removed from all views. It is non-recoverable.

### US-11 — Receiving an Action Plan for the Chosen Alternative
*As a user who has just recorded my Final Decision, I want to receive a concrete list of next steps, so that I know how to move from decision to execution.*

Acceptance: Action Plan is generated automatically after Final Decision is recorded. Contains three to five specific, actionable items. Each item is specific to the user's chosen alternative and their category. User can edit items.

### US-12 — Handling an AI Analysis Failure
*As a user whose AI analysis failed midway, I want the system to tell me what happened and let me retry, so that I do not lose my work or feel abandoned.*

Acceptance: Decision Object remains in Draft state after failure (does not get stuck in In Analysis). User sees a plain-language error message with a retry button. All Wizard inputs are preserved. Retry re-submits the same inputs without the user having to re-enter anything.

---

## Part 4 — Business Rules

Business rules are constraints that apply regardless of implementation approach.

**BR-01 — No Decision without Alternatives.** A Decision Object cannot transition from Draft to In Analysis if fewer than two Alternatives have been provided. This rule has no exceptions.

**BR-02 — Recommendation is always explained.** A Recommendation must never be presented without a plain-language explanation that references the user's specific inputs. A generic explanation is a system failure, not an acceptable output.

**BR-03 — Action Plan is for the chosen alternative, not the recommended one.** If the user's Final Decision differs from the AI Recommendation, the Action Plan must be generated for the user's actual choice. The system must never generate an Action Plan for an alternative the user did not choose.

**BR-04 — Anonymous Decision Objects expire.** An anonymous Decision Object that has not been claimed by an authenticated user within 48 hours of creation is eligible for deletion. The user must be informed of this expiry at the point of choosing to remain anonymous, not after.

**BR-05 — Decision Object data is never silently overwritten.** When a user updates inputs and triggers a new AI analysis, the previous AI Analysis, Recommendation, and all related components are preserved in Version History. The new analysis appears as the current version.

**BR-06 — Upgrade prompts never interrupt a Decision flow.** Upgrade prompts must not appear during the Decision Wizard, during AI analysis, or during the Recommendation View. They appear only when the user explicitly attempts to access a feature that requires a higher tier.

**BR-07 — Cancellation does not delete data.** When a user's subscription lapses or is cancelled, no Decision Object data is deleted. Tier-restricted features are locked, but all content is preserved in full.

**BR-08 — Deletion is permanent and requires confirmation.** The system must present a confirmation step before deleting any Decision Object. Deletion is irreversible. No undo, no recovery period, no soft-delete visible to the user.

**BR-09 — The AI does not make the Final Decision.** The system must never auto-select a Final Decision on behalf of the user, even if only one alternative was provided, even if the user leaves the Recommendation View without recording a decision. The Final Decision is always an explicit user action.

**BR-10 — Free tier users can complete a full Decision.** No step in the Decision Lifecycle may be gated behind a paid tier. Anonymous users and Free tier users must be able to progress from Draft through Decision Made and receive an Action Plan without encountering an upgrade prompt during the flow.

**BR-11 — Chat is anchored to a Decision Object.** A Chat session cannot exist independently of a Decision Object. Every message in Chat is permanently associated with the Decision Object it was created within.

**BR-12 — State transitions are irreversible unless explicitly defined as reversible.** A Decision Object that has transitioned to Completed cannot be moved back to Decision Made or Executing. The only action available from Completed is Archiving. If a user needs to revisit a completed decision, they start a new Decision Object.

---

## Part 5 — Acceptance Criteria

Acceptance criteria define the conditions under which a feature is considered complete and ready for production.

### AC-01 — Decision Wizard Complete

- [ ] A new user can complete the full Wizard flow (Context → Goal → Constraints → Alternatives) within a single session
- [ ] Each Wizard step auto-saves the user's input before proceeding
- [ ] A user who closes the browser mid-Wizard and returns finds their inputs intact
- [ ] The Wizard displays progress (e.g., "Step 2 of 4") at all times
- [ ] The system prevents submission with fewer than two Alternatives and shows a specific explanation
- [ ] The system surfaces potential Goal/Constraint conflicts before submitting for analysis
- [ ] Optional fields can be skipped without blocking progress

### AC-02 — AI Analysis Complete

- [ ] AI analysis completes within 30 seconds for 95% of test cases
- [ ] The output contains: pros and cons for each alternative (minimum two each), risks per alternative (minimum one each), and a single Recommendation with plain-language reasoning
- [ ] The Recommendation reasoning explicitly references at least one user-provided input
- [ ] Analysis failure leaves the Decision Object in Draft state with all inputs preserved
- [ ] Retry after failure re-submits without requiring user re-entry

### AC-03 — Recommendation View Complete

- [ ] Recommended alternative is displayed as the primary heading
- [ ] Full pros/cons for all alternatives are visible without additional navigation
- [ ] Risks for all alternatives are visible
- [ ] Conditions for changing the Recommendation are shown
- [ ] Chat can be opened from the Recommendation View and opens pre-loaded with Decision context
- [ ] The view is identical when the user navigates away and returns

### AC-04 — Final Decision and Action Plan Complete

- [ ] Final Decision step requires an explicit alternative selection (no default)
- [ ] Confidence level (Confident / Uncertain / Reluctant) is required
- [ ] If Final Decision differs from Recommendation, optional explanation field is shown
- [ ] Action Plan is generated for the user's chosen alternative, not the Recommendation
- [ ] Action Plan contains between three and five items
- [ ] Each Action Plan item is specific and actionable (reviewed manually before launch)
- [ ] Action Plan items can be marked complete and edited by the user

### AC-05 — Authentication Complete

- [ ] User can create an account with email and password only
- [ ] User can sign in and out
- [ ] User can reset password via email
- [ ] Session persists for 30 days without re-authentication
- [ ] Anonymous Decision Objects transfer to new account immediately upon signup
- [ ] Authentication can be skipped entirely for Decision creation and Recommendation viewing

### AC-06 — Decision History Complete

- [ ] Dashboard shows all Decision Objects grouped by Active / Completed / Archived
- [ ] Each entry shows Category, creation date, Decision State, and (for Completed) Outcome satisfaction
- [ ] Filtering by Decision State, Category, and date range works correctly
- [ ] Decision Objects requiring user action are visually distinguished
- [ ] Delete action requires confirmation and removes the Decision Object immediately

### AC-07 — Outcome and Reflection Complete

- [ ] Outcome prompt appears on Dashboard after 30 days in Executing state
- [ ] Outcome requires: description, goal achievement, satisfaction rating
- [ ] After Outcome is recorded, Decision State transitions to Completed
- [ ] Reflection is offered immediately after Outcome; it is skippable
- [ ] Lessons Learned prompt follows Reflection; it is skippable
- [ ] Reflection and Lessons Learned can be added or edited on Completed Decision Objects at any future point

### AC-08 — Subscription and Billing Complete

- [ ] Free, Pro, and Premium tiers are correctly enforced
- [ ] Stripe Checkout processes a test payment successfully
- [ ] Webhook updates user's subscription tier within 60 seconds of payment
- [ ] Subscription cancellation reverts user to Free tier without data loss
- [ ] Upgrade prompt appears in the correct context (not during Wizard or Recommendation View)
- [ ] User returns to their Decision context after successful upgrade

### AC-09 — AI Chat Complete

- [ ] Chat is accessible from Decision Objects in Draft, Waiting for User, and Decision Made states
- [ ] Chat opens with Decision context pre-loaded (no blank start)
- [ ] Chat context label ("You are discussing your [Category] decision") is always visible
- [ ] Messages are persisted across sessions
- [ ] Formal update offer is shown when user provides new material information in Chat
- [ ] Chat failure shows error and retry; failed messages are not stored

### AC-10 — Performance Complete

- [ ] Decision Wizard loads within 2 seconds on standard broadband
- [ ] AI analysis completes within 30 seconds for 95% of requests
- [ ] The web application is fully usable on iOS Safari and Android Chrome at 375px width
- [ ] Wizard auto-save does not cause perceptible UI delay

---

## Part 6 — Out of Scope for MVP

The following items are explicitly out of scope for the current MVP. They are not deferred indefinitely — they are candidates for future versions. Their absence must not leave gaps in the core Decision Lifecycle.

### Not in MVP

**Native Mobile Application** — The web application must be mobile-responsive and fully functional in mobile browsers. A native iOS or Android application is a post-MVP investment.

**Public API** — The programmatic API for third-party integrations is post-MVP. The architecture (H04) supports it, but it requires dedicated authentication, rate limiting, and documentation work that is not justified before product-market fit is established.

**Embedded Interface** — The white-label embedded interface for organizations is a post-MVP commercial product.

**Learning Pipeline and Knowledge Base** — The system infrastructure for anonymized, aggregated Decision Intelligence is post-MVP. Individual Decision Objects will collect Outcome and Reflection data during MVP, which will seed the Knowledge Base when the pipeline is built.

**Decision Sharing** — Sharing a Decision Object with another user, collaborating on a Decision, or inviting a co-owner is post-MVP.

**Notification System** — Email and in-app notifications (e.g., Outcome prompts, inactivity reminders) are post-MVP. MVP uses Dashboard surfacing only for these prompts.

**Multi-Language UI** — The UI must be implemented in English for MVP. The localization infrastructure (i18n framework, string extraction) should be in place to support future languages without a full rewrite, but translated strings are post-MVP.

**Social Features** — Community ratings, "what others decided," shared decision templates, and any social proof mechanisms are permanently out of scope per Principle 6 (H02), not merely deferred.

**Third-Party Data Integrations** — Real-time market data, live product pricing, or external database lookups are post-MVP. The AI Reasoning Engine works from user-provided context in MVP.

**Offline Mode** — The application requires an internet connection. Offline functionality is post-MVP.

---

## Part 7 — Implementation Priorities

Requirements are prioritized on a three-tier scale.

**P1 — Required for Launch.** The product cannot launch without this. A gap here means the Decision Lifecycle is incomplete or the system cannot be trusted.

**P2 — Required for Quality.** The product can launch without this, but it will feel incomplete or frustrating to users. Must be resolved before broader marketing.

**P3 — Important but Deferrable.** Adds meaningful value but does not block launch or quality. Scheduled for the sprint immediately after launch.

---

### P1 — Required for Launch

| ID | Requirement Summary |
|---|---|
| FR-01.1 to FR-01.4 | Decision Object creation and auto-save |
| FR-02.1 to FR-02.7 | Decision Wizard core flow |
| FR-03.1 to FR-03.9 | AI Analysis execution and output |
| FR-04.1 to FR-04.5 | Recommendation View display |
| FR-05.1 to FR-05.6 | Final Decision and Action Plan |
| FR-06.1 to FR-06.4 | Decision State machine enforcement |
| FR-08.1 to FR-08.7 | Authentication and anonymous sessions |
| FR-11.1 to FR-11.9 | Subscription and billing |
| FR-12.1, FR-12.4 | Wizard load time and input preservation |
| BR-01 to BR-12 | All business rules |
| AC-01 to AC-08 | Acceptance criteria for all P1 features |

### P2 — Required for Quality

| ID | Requirement Summary |
|---|---|
| FR-01.5, FR-01.6 | Anonymous Decision expiry and transfer |
| FR-02.8, FR-02.9, FR-02.10 | AI alternative suggestions, do-nothing prompt, conflict detection |
| FR-03.10 | AI analysis versioning |
| FR-04.6 | Recommendation comparison after input update |
| FR-05.7, FR-05.8 | Action Plan completion marking and editing |
| FR-06.5 | Archiving from any state |
| FR-07.1 to FR-07.7 | AI Chat Interface |
| FR-09.1 to FR-09.7 | Decision Dashboard and History |
| FR-10.1 to FR-10.7 | Outcome and Reflection collection |
| FR-12.2, FR-12.5 | AI timeout handling, mobile responsiveness |
| AC-09 | Chat acceptance criteria |
| AC-10 | Performance acceptance criteria |

### P3 — Important but Deferrable

| ID | Requirement Summary |
|---|---|
| FR-03.8 | Graceful AI failure with meaningful progress indicator (extended analysis) |
| FR-06.3 | Auto-revert from stuck In Analysis state |
| FR-12.3, FR-12.6 | Uptime SLA monitoring, concurrent request handling |
| US-08 | Advanced Decision History search |

---

## Traceability Summary

Every requirement in H06 traces to at least one prior handbook document.

| Requirement Area | H01 | H02 | H03 | H04 | H05 |
|---|---|---|---|---|---|
| Decision Object (FR-01) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Decision Wizard (FR-02) | ✓ | P2, P4 | Components 1–4 | Experience Layer | WF-1 |
| AI Analysis (FR-03) | ✓ | P1, P5 | Components 5–6 | Intelligence Layer | WF-1.6 |
| Recommendation View (FR-04) | ✓ | P1, P5 | Component 7 | Experience Layer | WF-1.7 |
| Final Decision (FR-05) | ✓ | P1 | Components 8–9 | Decision Layer | WF-1.9 |
| State Management (FR-06) | — | P1 | Decision States | Decision Layer | All WFs |
| AI Chat (FR-07) | ✓ | P5 | Version History | Experience Layer | WF-3 |
| Authentication (FR-08) | ✓ | P7, P8 | Owner field | Infrastructure | WF-1.8, WF-6 |
| Dashboard & History (FR-09) | ✓ | P3, P9 | All components | Experience Layer | WF-2, WF-4 |
| Outcome & Reflection (FR-10) | ✓ | P9 | Components 10–12 | Decision Layer | WF-2.3, WF-2.4 |
| Billing (FR-11) | ✓ | P7 | — | Infrastructure | WF-5 |
| Performance (FR-12) | — | P2, P7 | — | All layers | All WFs |

---

*DecisionOS Company Handbook | H06 — Product Requirements*
*Version 1.0 Final | Status: Frozen*
*Owner: Founding Team | Next review: Q4 2026*
*Every feature built must trace to a requirement in this document. Every requirement here traces to the Decision Model in H03.*
