\# H04 — System Architecture

\*\*DecisionOS Company Handbook\*\*

\*Version 1.0 Final | June 2026\*



\---



\## Preamble



This document defines the conceptual architecture of DecisionOS. It is not a technical specification. It does not prescribe frameworks, databases, cloud providers, or programming languages. Those choices are implementation details — they will change over time as technology evolves.



What this document defines will not change: the layers of the system, the responsibilities of each layer, the flow of data through the system, and the principles that govern every architectural decision.



Engineers joining DecisionOS should read this document before reading any code. Architects proposing changes to the system should measure those changes against this document. Product managers scoping new features should understand where in this architecture their feature lives.



The architecture exists to serve the Decision. Everything in this document can be traced back to that purpose.



Before reading H04, readers should be familiar with:

\- \*\*H03 — The Decision Model\*\*, which defines the Decision Object, its thirteen components, the Decision Lifecycle, Decision States, and Decision Intelligence. H04 builds on these concepts and references them throughout. They are not redefined here.



\---



\## Architectural Philosophy



Before defining the layers, three philosophical commitments shape every architectural choice made at DecisionOS.



\### The Decision Object Is the Unit of Architecture



Every system has a unit of currency — the thing that flows through it, gets stored, retrieved, processed, and displayed. In DecisionOS, that unit is the Decision Object as defined in H03.



This means:

\- Data is organized around Decision Objects, not around users or sessions.

\- Services are designed to create, enrich, advance, and close Decision Objects.

\- APIs speak in terms of Decisions, not in terms of raw AI calls or database operations.

\- The system's health is measured by Decision quality, not by request throughput alone.



\### Separation of Concerns Is Non-Negotiable



The system is divided into layers with clearly defined responsibilities. No layer reaches into another layer's concerns. No shortcut that violates layer boundaries is acceptable, regardless of how fast it would ship.



This discipline exists because DecisionOS will grow. Features will be added, removed, and changed. The architecture must accommodate that growth without requiring the entire system to be rewritten each time. Clean separation is what makes that possible.



\### Trust Is an Architectural Property



DecisionOS handles sensitive information — financial situations, health priorities, career decisions, personal values. Trust is not only a product principle (H02). It is an architectural requirement. The system must be designed so that data cannot flow in ways the user has not authorized, cannot be accessed by parties who should not have it, and cannot be lost or corrupted without detection.



Security, privacy, and auditability are first-class concerns in this architecture — not afterthoughts applied at the end.



\---



\## System Layers



The DecisionOS architecture is organized into six layers. Each layer has a single primary responsibility. Data and control flow upward from the foundation and downward from the interface.



```

┌─────────────────────────────────────────────────────────┐

│                  INTERFACE LAYER                        │

│         Web · Mobile · API · Embedded                   │

├─────────────────────────────────────────────────────────┤

│                 EXPERIENCE LAYER                        │

│      Decision Wizard · Chat · History · Dashboard       │

├─────────────────────────────────────────────────────────┤

│                  DECISION LAYER                         │

│    Decision Engine · State Machine · Lifecycle Manager  │

├─────────────────────────────────────────────────────────┤

│               INTELLIGENCE LAYER                        │

│      AI Reasoning · Prompt Orchestration · Learning     │

├─────────────────────────────────────────────────────────┤

│                   DATA LAYER                            │

│     Decision Store · User Store · Knowledge Base        │

├─────────────────────────────────────────────────────────┤

│               INFRASTRUCTURE LAYER                      │

│    Auth · Billing · Observability · Integrations        │

└─────────────────────────────────────────────────────────┘

```



\---



\## Layer 1 — Infrastructure Layer



\*\*Responsibility:\*\* Provide the foundational services that every other layer depends on. Infrastructure has no knowledge of Decisions. It knows only about identity, access, money, and observability.



\### Authentication \& Identity

Verifies who is making a request. Issues and validates session tokens. Manages the boundary between anonymous users (who can create Decisions without an account) and authenticated users (whose Decisions are persistent and private). Anonymous Decision Objects must be claimable — when a user signs in, their anonymous Decision Objects should transfer to their account.



\### Billing \& Entitlements

Manages subscriptions, plan tiers, and entitlement checks. The billing system does not know what a Decision is — it knows only what a user is entitled to do. The Decision Layer asks the Infrastructure Layer "is this user allowed to do X?" The Infrastructure Layer answers yes or no. It never makes product decisions.



\### Observability

Captures logs, metrics, traces, and errors across the entire system. Observability is not optional and is not added after the fact. Every significant event in the Decision Lifecycle — creation, state transition, AI call, completion — is an observable event. The system must be understandable from the outside.



\### External Integrations

Manages connections to third-party services — AI providers, payment processors, email services, analytics platforms. The Infrastructure Layer is the only layer that communicates directly with external systems. All other layers go through it.



\*\*What this layer never does:\*\*

\- Makes product decisions

\- Stores Decision content

\- Applies business logic

\- Knows what category a Decision Object belongs to



\---



\## Layer 2 — Data Layer



\*\*Responsibility:\*\* Store, retrieve, and protect all persistent data in the system. The Data Layer is the source of truth. Nothing is more authoritative than what is stored here.



\### Decision Store

The primary database of the system. Stores every Decision Object in its complete form — all thirteen components defined in H03, all Decision State transitions, all Version History. The Decision Store is append-friendly: history is never deleted, only archived. A Decision Object that has been deleted by a user is soft-deleted — its content is removed from the user's view and from the system's operational processes, but the fact that it existed is retained for integrity purposes.



The Decision Store is organized around the Decision ID as the primary key. Every other entity in the system — user preferences, AI outputs, Action Plans, Outcomes — is linked to a Decision ID.



\### User Store

Stores user accounts, preferences, authentication state, and subscription status. The User Store is deliberately small — it contains only what is necessary to identify a user and serve their Decision Objects. It does not contain Decision content. It does not contain behavioral profiles.



\### Knowledge Base

Stores anonymized, aggregated Decision Intelligence — the patterns, heuristics, and Lessons Learned extracted from completed Decision Objects across the user base. The Knowledge Base is what makes DecisionOS smarter over time. It is populated only from completed, consented Decision Objects. It is read by the Intelligence Layer to improve the quality of future AI analysis.



The Knowledge Base is organized by decision category, constraint profile, and Outcome quality — not by user or conversation. It is a structured library of decision patterns, not a database of personal information.



\*\*What this layer never does:\*\*

\- Applies business logic

\- Makes decisions about what data to show

\- Communicates directly with external services

\- Accesses data it is not authorized to access



\---



\## Layer 3 — Intelligence Layer



\*\*Responsibility:\*\* Provide all AI reasoning capabilities to the system. The Intelligence Layer does not store data and does not communicate directly with the user. It receives structured inputs, applies reasoning, and returns structured outputs.



\### AI Reasoning Engine

The core reasoning capability of DecisionOS. Takes a fully populated Decision context — category, goal, constraints, alternatives — and produces structured analysis: pros and cons per alternative, risk assessment, confidence evaluation, and a Recommendation with full reasoning.



The AI Reasoning Engine is designed around the Decision Model defined in H03, not around general-purpose chat. Every prompt it receives is structured around a specific component of the Decision Object. Every output it produces maps back to a component in the Decision Model.



\### Prompt Orchestration

Manages the construction and sequencing of AI prompts. Different Decision components require different prompting strategies. Prompt Orchestration is responsible for knowing which strategy to apply, in what order, and with what context. It shields the rest of the system from the complexity of prompt engineering.



Prompts are versioned. When a prompt changes, the version is recorded alongside every Decision Object that was analyzed using it. This makes it possible to understand — and audit — exactly what reasoning process was applied to any given Decision Object at any point in time.



\### Learning Pipeline

Processes completed Decision Objects — with user consent and after anonymization — to extract patterns that improve future analysis. The Learning Pipeline is the bridge between the Data Layer's Knowledge Base and the Intelligence Layer's reasoning capabilities.



The Learning Pipeline is not a real-time system. It operates on completed, closed Decision Objects. It does not modify active Decision Objects. It does not affect a Decision Object that is currently in progress.



\*\*What this layer never does:\*\*

\- Stores data persistently (it reads and writes only through the Data Layer)

\- Communicates directly with users

\- Makes final product decisions — it provides analysis, the Decision Layer applies it

\- Operates without a structured Decision context



\---



\## Layer 4 — Decision Layer



\*\*Responsibility:\*\* Implement the business logic of the Decision Object. This is the most important layer in the system. It is where the Decision Model defined in H03 becomes operational software.



\### Decision Engine

Orchestrates the Decision Lifecycle from creation to archival. The Decision Engine knows the thirteen components defined in H03, the seven Decision States defined in H03, the valid transitions between states, and the rules that govern each transition.



The Decision Engine is the only component in the system that can advance a Decision Object through its Decision Lifecycle. No other layer — not the Experience Layer, not the Interface Layer — can change a Decision Object's state directly. All state changes go through the Decision Engine.



\### State Machine

Enforces the valid Decision States and transitions defined in H03. The State Machine is the guardian of Decision integrity. It rejects invalid transitions (e.g., a Decision Object cannot move from Draft directly to Completed without passing through the intervening states). It records every transition in the Version History field of the Decision Identity component, as defined in H03.



The State Machine does not care about UI, about user experience, or about performance. It cares only about correctness. A Decision Object in an invalid state is a corrupted Decision Object.



\### Lifecycle Manager

Manages the temporal dimension of Decision Objects — the events that are triggered by time rather than by user action. A Decision Object that has been in Waiting for User state for an extended period may warrant a gentle prompt. A Decision Object in Executing state with a deadline approaching may need a check-in. A Decision Object that was Completed months ago may be ready for an Outcome request.



The Lifecycle Manager does not interrupt users arbitrarily. It creates opportunities for engagement that are tied directly to the Decision Object's state and timeline — never to engagement metrics.



\*\*What this layer never does:\*\*

\- Communicates directly with AI providers (it delegates to the Intelligence Layer)

\- Stores data directly (it delegates to the Data Layer)

\- Renders UI (it provides data and state to the Experience Layer)

\- Bypasses the State Machine for any reason



\---



\## Layer 5 — Experience Layer



\*\*Responsibility:\*\* Translate the Decision Model into user-facing experiences. The Experience Layer does not implement business logic. It presents the output of the Decision Layer to the user and translates user actions into inputs for the Decision Layer.



\### Decision Wizard

The primary flow through which a user creates and advances a Decision Object. The Wizard guides the user through the Context, Goal, Constraints, and Alternatives components — collecting the inputs that the Intelligence Layer needs to perform its analysis. The Wizard is structured, but it is not rigid. A user can move backward, skip optional fields, and return to a partially completed Decision Object at any time.



The Decision Wizard is the most important surface in DecisionOS. It is where the user's trust is established or lost. Every interaction within the Wizard must feel like it is serving the user's Decision — never serving the product's metrics.



\### AI Chat Interface

The conversational surface through which users can explore a Decision Object with AI assistance. Unlike a general-purpose chatbot, the Chat Interface in DecisionOS is always anchored to a specific Decision Object. Every message in the Chat is stored as part of that Decision Object. The conversation does not float freely — it belongs to the Decision Object it was created within.



The Chat Interface is a complement to the Decision Wizard, not a replacement for it. The Wizard provides structure. The Chat provides depth. Together, they cover the full range of how users prefer to engage with a complex decision.



\### Decision History \& Dashboard

The surface through which users can review their completed and active Decision Objects. The History is not a list of chat sessions. It is a structured view of Decision Objects — sortable by category, Decision State, date, and Outcome quality. A user reviewing their History should be able to see, at a glance, which Decision Objects are in progress, which are waiting for an Outcome report, and which Lessons Learned they extracted from past decisions.



\### Recommendation View

The surface through which the AI's analysis and Recommendation are presented to the user. The Recommendation View is designed around transparency — every element of the view corresponds to a component of the Decision Object. The user can see the reasoning, the alternatives considered, the risks surfaced, and the conditions under which the Recommendation would change.



\*\*What this layer never does:\*\*

\- Implements business logic (it delegates to the Decision Layer)

\- Stores data directly (it delegates to the Data Layer)

\- Makes architectural decisions about AI (it delegates to the Intelligence Layer)

\- Exists independently of a Decision Object



\---



\## Layer 6 — Interface Layer



\*\*Responsibility:\*\* Deliver the Experience Layer to users across different surfaces and contexts. The Interface Layer is the boundary between DecisionOS and the outside world.



\### Web Application

The primary interface for DecisionOS. Optimized for Decision Objects that require time, depth, and multiple sessions — mortgage evaluations, career choices, major purchases. The web application is where the full Decision Model is available in its complete form.



\### Mobile Application

A focused interface for Decision Objects that are initiated in the moment or need to be accessible on the go. The mobile interface prioritizes the core Decision Lifecycle flow — starting a Decision Object, advancing it, and reviewing a Recommendation — without requiring the full complexity of the desktop experience.



\### Public API

The programmatic interface through which developers and organizations can integrate DecisionOS capabilities into their own products. The API is Decision-centric: its primary resources are Decision Objects, and its operations map to Decision Lifecycle transitions. It is not a general-purpose AI API. Developers who integrate DecisionOS are building decision-support experiences, not chat interfaces.



\### Embedded Interface

A lightweight, embeddable version of the DecisionOS experience that organizations can deploy within their own products. A bank embedding DecisionOS to help customers choose a mortgage. A healthcare provider embedding it to help patients choose a treatment path. The embedded interface is constrained to a specific decision category and context — it is DecisionOS scoped to a single domain.



\*\*What this layer never does:\*\*

\- Implements business logic

\- Communicates directly with the Intelligence Layer

\- Bypasses the Experience Layer

\- Exists as a general-purpose interface disconnected from Decision Objects



\---



\## Data Flow



The canonical flow of data through the system for the most common operation — a user creating and completing a Decision Object through its full Decision Lifecycle.



```

USER ACTION

User initiates a new Decision Object in the web application.

│

▼

INTERFACE LAYER

Receives the request. Authenticates the user

(or creates an anonymous session). Routes to

the Experience Layer.

│

▼

EXPERIENCE LAYER (Decision Wizard)

Presents the Context and Goal collection flow.

Collects user inputs. Translates them into

a structured Decision Object creation request.

│

▼

DECISION LAYER (Decision Engine)

Creates a new Decision Object with a unique ID.

Sets Decision State to DRAFT. Records Created At timestamp.

Stores the Decision Object via the Data Layer.

│

▼

DATA LAYER (Decision Store)

Persists the Decision Object. Returns confirmation.

│

▼

\[User continues providing input across sessions]

│

▼

DECISION LAYER (Decision Engine)

Validates that sufficient input exists to request

AI analysis. Advances Decision State to IN ANALYSIS.

Delegates analysis request to the Intelligence Layer.

│

▼

INTELLIGENCE LAYER (AI Reasoning Engine)

Receives the structured Decision context.

Constructs appropriate prompts via Prompt Orchestration.

Executes analysis. Returns structured output:

alternatives assessed, risks identified,

Recommendation with reasoning.

│

▼

DECISION LAYER (Decision Engine)

Receives AI output. Attaches it to the Decision Object

as the AI Analysis and Recommendation components.

Advances Decision State to WAITING FOR USER.

Persists updates via the Data Layer.

│

▼

EXPERIENCE LAYER (Recommendation View)

Presents the Recommendation to the user.

Displays reasoning, alternatives, risks.

Awaits the user's Final Decision.

│

▼

USER ACTION

User records their Final Decision

(which may or may not match the Recommendation).

│

▼

DECISION LAYER (Decision Engine)

Records the Final Decision component.

Advances Decision State to DECISION MADE.

Activates the Action Plan component.

Persists via the Data Layer.

│

▼

\[Time passes. User executes the plan.]

│

▼

DECISION LAYER (Lifecycle Manager)

Detects that the Decision Object has been in EXECUTING

state for the expected duration.

Creates an Outcome request for the user.

│

▼

USER ACTION

User records the Outcome and Reflection.

│

▼

DECISION LAYER (Decision Engine)

Attaches Outcome and Reflection to the Decision Object.

Advances Decision State to COMPLETED.

Triggers the Learning Pipeline (with consent).

│

▼

INTELLIGENCE LAYER (Learning Pipeline)

Anonymizes and processes the completed Decision Object.

Extracts patterns. Updates the Knowledge Base

with the new Decision Intelligence.

│

▼

DATA LAYER (Knowledge Base)

Stores the extracted Decision Intelligence.

Makes it available for future AI analysis

in the same category.

```



\---



\## Architectural Boundaries



Certain boundaries in this architecture are absolute. They are not subject to pragmatic compromise, deadline pressure, or performance optimization arguments.



\### The Decision Layer owns the State Machine



No code outside the Decision Layer may change the Decision State of a Decision Object. Not the Experience Layer. Not the Interface Layer. Not a database trigger. Not a background job operating outside the Decision Engine.



If the State Machine can be bypassed, Decision Object integrity cannot be guaranteed. If Decision Object integrity cannot be guaranteed, the system cannot be trusted.



\### The Intelligence Layer never stores data



All persistence goes through the Data Layer. The Intelligence Layer reads context, produces output, and returns it. It does not write to any database directly. This boundary ensures that AI outputs are always traceable, always versioned, and always associated with the Decision Object they belong to.



\### The Infrastructure Layer is the only external boundary



External APIs, third-party services, and external data sources are accessed only through the Infrastructure Layer. No other layer makes outbound network calls to external systems. This ensures that all external dependencies are visible, auditable, and replaceable.



\### Decision Intelligence never crosses the anonymization boundary without consent



Data that moves from the Decision Store to the Knowledge Base must be anonymized and must be consented by the user. This is not a feature. It is a system constraint enforced at the architectural level — not by policy alone, but by the design of the Learning Pipeline.



\---



\## Scalability and Evolution



This architecture is designed to evolve. The boundaries between layers define contracts, not implementations. The contract between the Decision Layer and the Intelligence Layer is: "here is a structured Decision context; return structured analysis." What happens inside the Intelligence Layer — which AI model, which infrastructure, which optimization — is an implementation detail that can change without affecting anything outside that layer.



The same applies to every layer. The Data Layer's contract is: "store this Decision Object; retrieve it when asked; protect it always." Whether the underlying database is a managed cloud service or a self-hosted cluster is an implementation detail.



This separation means that DecisionOS can scale individual layers independently, replace components within layers without rewriting adjacent layers, and adopt new technology without architectural risk — as long as the contracts between layers are honored.



The architecture grows by strengthening layers, not by bypassing them.



\---



\## What This Architecture Is Not



\*\*It is not a microservices mandate.\*\* The layers can be implemented as separate services, as modules within a monolith, or as a combination. The conceptual separation matters. The deployment model is an implementation choice.



\*\*It is not a technology prescription.\*\* This document does not specify a programming language, a database engine, a cloud provider, or an AI model. Those choices belong to implementation documents.



\*\*It is not final in its implementation.\*\* The layers, boundaries, and data flows defined here will be implemented incrementally. The current codebase does not yet reflect this architecture in full. That is expected. This document is the target, not the current state.



\*\*It is not optional.\*\* Every engineering decision made at DecisionOS should be measured against this architecture. Deviations should be documented, justified, and treated as temporary technical debt with a plan for resolution.



\---



\## Reference: Layer Responsibility Summary



| Layer | Primary Responsibility | Knows About | Never Does |

|---|---|---|---|

| Interface | Deliver experience to users | Surfaces, devices, protocols | Business logic, data storage |

| Experience | Translate Decision Model into UX | Decision Object state, user actions | AI calls, persistence |

| Decision | Implement Decision Lifecycle logic | All Decision components, Decision States | AI calls, UI rendering |

| Intelligence | Provide AI reasoning | Decision context, prompt strategies | Data storage, user interaction |

| Data | Store and protect all data | Decision Objects, user records | Business logic, AI calls |

| Infrastructure | Foundation services | Identity, billing, observability | Product decisions, Decision content |



\---



\## Current MVP Mapping



This section maps today's implementation to the target architecture defined above. The purpose is to make the gap between current state and target state explicit — not to excuse it, but to track it.



```

INFRASTRUCTURE LAYER

&#x20; ✓ Authentication     Supabase Auth (email + password, session management)

&#x20; ✓ Billing           Stripe (Pro €4.99/month, Premium €9.99/month, webhook sync)

&#x20; ✓ Observability     Google Analytics GA4 (partial — event tracking only)

&#x20; ✗ External Integrations  Not yet centralized; AI and Stripe called from pages directly



DATA LAYER

&#x20; ✓ Decision Store    Supabase PostgreSQL (subscriptions table; full Decision Store planned)

&#x20; ✓ User Store        Supabase Auth user table

&#x20; 🚧 Knowledge Base   Not yet implemented



INTELLIGENCE LAYER

&#x20; ✓ AI Reasoning      Anthropic Claude API (claude-sonnet-4-6)

&#x20; 🚧 Prompt Orchestration  Prompts embedded in API routes; centralization planned

&#x20; 🚧 Learning Pipeline     Not yet implemented



DECISION LAYER

&#x20; 🚧 Decision Engine   Not yet implemented as a formal layer

&#x20; 🚧 State Machine     Not yet implemented; state managed implicitly in UI

&#x20; 🚧 Lifecycle Manager Not yet implemented



EXPERIENCE LAYER

&#x20; ✓ AI Chat Interface  Existing chat flow (pages/api/chat.js)

&#x20; ✓ Landing Page       Existing homepage with category browsing and hero

&#x20; 🚧 Decision Wizard   Partially implemented; not yet structured around Decision Model

&#x20; 🚧 Recommendation View  Exists as raw AI output; not yet structured by component

&#x20; 🚧 Decision History  Not yet implemented



INTERFACE LAYER

&#x20; ✓ Web Application    Next.js 14 deployed on Vercel (decisionpilot.tech)

&#x20; 🚧 Mobile            Not yet implemented

&#x20; 🚧 Public API        Not yet implemented

&#x20; 🚧 Embedded Interface Not yet implemented

```



The most significant gap is the Decision Layer. Until the Decision Engine and State Machine are implemented, all Decision Lifecycle logic is handled implicitly by the UI — which means it is fragile, untestable, and inconsistent. Implementing the Decision Layer is the highest-priority architectural work after the current sprint.



\---



\## Architectural Evolution



DecisionOS currently implements a fraction of the architecture described in this document. That is by design.



The handbook defines the target architecture — the system as it should exist when DecisionOS has reached the scale and complexity that justifies each layer's full implementation. Building the complete architecture on day one would be premature. Building without a target architecture would be directionless.



The correct approach is incremental implementation guided by the target. Each sprint should leave the system closer to the architecture defined here — either by implementing a layer that does not yet exist, by refactoring existing code to honor a boundary that is currently violated, or by replacing a temporary solution with one that belongs to the right layer.



The architecture does not change to accommodate the current implementation. The current implementation evolves to match the architecture.



When a change to the target architecture is genuinely warranted — because a layer boundary is wrong, because a component was misconceived, or because new requirements cannot be served by the existing model — that change must go through the Architecture Decision Record process described below.



\---



\## Appendix: Architecture Decision Records (ADR)



Any decision that changes, extends, or overrides the architecture defined in H04 must be documented as an Architecture Decision Record (ADR) before implementation begins.



An ADR is not a retrospective. It is not documentation written after the fact to explain what was built. It is a decision document written before the work begins — one that forces clarity about what is being decided, why, and at what cost.



ADRs are stored in the project repository under `/docs/adr/` and numbered sequentially. They are permanent. Once accepted, an ADR is never deleted — only superseded by a later ADR that explicitly references it.



\### When an ADR Is Required



An ADR is required when a proposed change meets any of the following criteria:



\- It introduces a new layer or removes an existing one.

\- It changes the responsibility boundary between two layers.

\- It adds a new component to a layer (e.g., a new service within the Intelligence Layer).

\- It violates one of the absolute architectural boundaries defined in this document.

\- It introduces a new external dependency at the Infrastructure Layer.

\- It changes how Decision Objects flow through the system.

\- It affects the Decision State machine or the valid transitions between states.



A bug fix is not an ADR. A UI change is not an ADR. A performance optimization within a layer that does not change its external contract is not an ADR.



\### ADR Structure



Every ADR must contain the following sections:



\*\*Title\*\*

A short, specific description of the decision. Examples: "Introduce event-driven communication between Decision Layer and Intelligence Layer" or "Replace monolithic Data Layer with separate Decision Store and Knowledge Base services."



\*\*Context\*\*

The situation that prompted this decision. What problem is being solved? What constraint or opportunity has arisen? What is the current state of the system that makes this decision necessary? Context is factual, not evaluative.



\*\*Decision\*\*

The specific architectural change being proposed. Written in present tense as a statement of intent: "We will..." Not a list of options — the decision has already been made by the time the ADR is written. The decision section should be unambiguous enough that two engineers reading it would implement the same thing.



\*\*Alternatives Considered\*\*

The other approaches that were evaluated before arriving at this decision. For each alternative: what it is, why it was considered, and why it was not chosen. This section is important — it prevents the same alternatives from being proposed again in the future without new information.



\*\*Consequences\*\*

The expected effects of this decision, both positive and negative. What becomes easier? What becomes harder? What technical debt is being created or retired? What adjacent systems are affected? Consequences should be honest, including the downsides of the chosen approach.



\### ADR Lifecycle



A proposed ADR begins in \*\*Draft\*\* status. It is reviewed by at least one other engineer and the founding team before being accepted. Once accepted, its status changes to \*\*Accepted\*\* and implementation may begin. If the decision is later superseded by a newer ADR, its status changes to \*\*Superseded\*\* with a reference to the replacing ADR.



No architectural change that requires an ADR may be merged into the main codebase before the corresponding ADR reaches Accepted status.



\---



\*DecisionOS Company Handbook | H04 — System Architecture\*

\*Version 1.0 Final | Status: Frozen\*

\*Owner: Founding Team | Next review: Q4 2026\*

\*Implementation choices change. Architectural principles do not.\*

