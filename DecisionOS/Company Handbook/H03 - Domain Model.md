\# H03 — The Decision Model

\*\*DecisionOS Company Handbook\*\*

\*Version 1.0 Final | June 2026\*



\---



\## Preamble



Every product has a core object. For Notion, it is the Page. For Linear, it is the Issue. For Stripe, it is the Payment. The core object is not just a data structure — it is the philosophical center of gravity around which everything else orbits.



For DecisionOS, that object is the \*\*Decision\*\*.



Not the user. Not the recommendation. Not the AI response. The Decision.



This document defines what a Decision is, how it lives and grows, and why every feature we build must serve it. It is the most important product document we have after H01 and H02. Engineers, designers, and product managers should return to it every time they are unsure what they are building and why.



\---



\## What Is a Decision?



A Decision in DecisionOS is not a click. It is not a preference. It is not a search query.



A Decision is a structured, documented process through which a person moves from uncertainty to confident action — with the support of AI, and with full ownership of the outcome.



This definition has four important parts:



\*\*Structured.\*\* A Decision follows a defined model. It has a beginning, a middle, and an end. It is not a freeform conversation. Structure is what separates a Decision from a chat message.



\*\*Documented.\*\* A Decision is recorded. Every input, every alternative considered, every piece of AI reasoning, every override, and every outcome is preserved. Documentation is what allows a Decision to teach future decisions.



\*\*Process.\*\* A Decision unfolds over time. It may take five minutes or five weeks. The process matters because good decisions are made, not had.



\*\*Owned by the human.\*\* The AI contributes reasoning. The human contributes judgment. The outcome belongs entirely to the person who made the choice.



\---



\## Why Everything Revolves Around the Decision



Most AI tools are built around the user. Sign in, build your profile, get personalized results. The user is the center.



DecisionOS is built around the Decision because a user without a decision has no reason to be here. Our product does not exist for entertainment, discovery, or social connection. It exists for one moment: when a person faces a choice that matters and needs help making it well.



This inversion has profound consequences for how we build:



\- Features are evaluated by how they improve the Decision, not how they improve engagement.

\- The user profile exists to serve future Decisions, not to define the user.

\- AI exists to enrich the Decision, not to be impressive on its own.

\- Billing exists to unlock capabilities within a Decision, not to gate access to the platform.



When we forget this, we drift. When we return to it, we build the right things.



\---



\## The Decision Model



A Decision in DecisionOS is composed of thirteen structured components. Together, they form a complete map of how a good decision is made — from the establishment of its permanent identity to the final lesson learned.



\---



\### 0. Decision Identity



\*\*Purpose:\*\* Establish a permanent, unique identity for every Decision from the moment it is created.



A Decision is not a conversation. It is not a session. It is not a temporary artifact. It is a first-class object in the DecisionOS system, with a persistent identity that survives across sessions, devices, states, and time.



\*\*Fields:\*\*



\- \*\*Decision ID\*\* — A unique, permanent identifier assigned at creation. It never changes, regardless of what happens to the Decision afterward.

\- \*\*Owner\*\* — The user to whom the Decision belongs. May be anonymous (for unauthenticated sessions) or linked to an authenticated account. Ownership can be claimed after the fact when an anonymous user signs in.

\- \*\*Created At\*\* — The timestamp of the moment the Decision was initiated.

\- \*\*Updated At\*\* — The timestamp of the most recent change to any component of the Decision.

\- \*\*Status\*\* — The current lifecycle state of the Decision (see Decision States). Status is the single most important field for understanding where a Decision is in its journey.

\- \*\*Category\*\* — The decision domain (e.g., Financial, Technology, Health, Travel). Category determines which questionnaire framework, which AI prompts, and which risk patterns apply.

\- \*\*Version History\*\* — A complete audit trail of every change made to the Decision, including who made the change and when. No data in a Decision is ever silently overwritten.



\*\*Why it matters:\*\* Without a stable identity, a Decision is indistinguishable from a chat message. Identity is what makes a Decision a persistent object — something that can be returned to, updated, analyzed, and learned from over months or years. It is also what makes the Decision portable: a user who starts a Decision on mobile and continues it on desktop has one Decision, not two sessions.



\---



\### 1. Context



\*\*Purpose:\*\* Establish the full situation surrounding the decision before any analysis begins.



\*\*Questions answered:\*\*

\- What is the background of this decision?

\- What led to this moment?

\- What does the person's current situation look like?

\- What has already been tried or considered?



\*\*Data stored:\*\* Life stage, relevant personal circumstances, prior attempts to resolve the question, market or geographic context, timing constraints.



\*\*Why it improves future decisions:\*\* Context is the foundation of personalization. A recommendation without context is a guess. With rich context, every future decision in the same category can be calibrated faster and more accurately. Pattern recognition across anonymized contexts also improves the AI model over time.



\---



\### 2. Goal



\*\*Purpose:\*\* Define what a successful outcome looks like — in the user's own words and on their own terms.



\*\*Questions answered:\*\*

\- What does the person actually want to achieve?

\- How will they know the decision was right?

\- What does success look like in three months, one year, five years?

\- Are there secondary goals that matter, even if unstated?



\*\*Data stored:\*\* Primary goal statement, time horizon, success criteria, secondary goals, emotional drivers behind the goal.



\*\*Why it improves future decisions:\*\* Most decision support tools skip the goal definition entirely. But a recommendation aligned to the wrong goal — however technically accurate — is a failure. Capturing goals explicitly allows DecisionOS to surface when a user's stated goal and their revealed preferences diverge, and to prompt reflection before a mistake is made.



\---



\### 3. Constraints



\*\*Purpose:\*\* Define the non-negotiable limits within which the decision must be made.



\*\*Questions answered:\*\*

\- What is the budget, absolute and flexible?

\- What are the time constraints?

\- What options are already ruled out, and why?

\- What personal, legal, geographic, or financial limits apply?

\- What would make any option immediately disqualified?



\*\*Data stored:\*\* Hard constraints (absolute limits), soft constraints (preferences), self-imposed constraints, externally imposed constraints.



\*\*Why it improves future decisions:\*\* Constraints are the most underused input in decision-making. Users often discover constraints mid-flow — a realization that they cannot afford option B, or that their lease prevents option C. Capturing constraints early prevents wasted analysis and surfaces trade-offs the user may not have seen. Over time, constraint patterns across users reveal where our questionnaires need improvement.



\---



\### 4. Alternatives



\*\*Purpose:\*\* Define the complete option space — what is actually on the table.



\*\*Questions answered:\*\*

\- What are the specific options being considered?

\- Are there options the user has not yet considered?

\- What is the "do nothing" option, and what does it cost?

\- Are the alternatives truly different, or are some just variations of the same choice?



\*\*Data stored:\*\* Named alternatives, their key attributes, source of each option (user-generated, AI-suggested, market data), and the option of inaction.



\*\*Why it improves future decisions:\*\* The quality of a decision is bounded by the quality of the alternatives considered. A person who has only considered two options may be missing the best option entirely. DecisionOS AI is responsible for surfacing alternatives the user has not thought of — and for challenging whether all stated alternatives are genuinely distinct. This component also allows the system to identify, across many decisions in a category, which alternatives are most commonly overlooked.



\---



\### 5. AI Analysis



\*\*Purpose:\*\* Apply structured reasoning to the alternatives, given the context, goal, and constraints.



\*\*Questions answered:\*\*

\- How does each alternative perform against the stated goal?

\- Which constraints does each alternative violate or satisfy?

\- What are the key differentiators between alternatives?

\- What information is missing that would change the analysis?

\- What does the AI consider the strongest case for each option?



\*\*Data stored:\*\* Analysis reasoning (full text), key factors considered, data sources referenced, confidence level, missing information flags, comparative scoring (internal, not shown as the primary output).



\*\*Why it improves future decisions:\*\* The AI Analysis component is the intellectual core of the Decision. It is also the component that must be most transparent. By storing the full reasoning — not just the conclusion — DecisionOS can review past analyses when new information emerges, allow users to revisit and challenge the reasoning, and continuously improve the quality of AI analysis as the model learns which reasoning patterns lead to good outcomes.



\---



\### 6. Risks



\*\*Purpose:\*\* Surface the ways each alternative could go wrong, including risks the user may be unaware of.



\*\*Questions answered:\*\*

\- What are the downside scenarios for each alternative?

\- How likely and how severe is each risk?

\- Are there risks common in this decision category that are often overlooked?

\- What is the worst plausible outcome for each option?

\- What would the user need to believe to be true for their preferred option to fail?



\*\*Data stored:\*\* Risk inventory per alternative, severity and likelihood assessment, category-specific risk flags, mitigation options where applicable.



\*\*Why it improves future decisions:\*\* Risk awareness is the most underserved part of consumer decision-making. Traditional comparison tools show the best-case scenario for each option. DecisionOS is committed to surfacing the realistic downside. Over time, this component becomes one of the most valuable sources of accumulated knowledge — because risks that materialize in real decisions, reported back through the Outcome and Reflection components, sharpen the system's ability to warn future users more accurately.



\---



\### 7. Recommendation



\*\*Purpose:\*\* Synthesize the full analysis into a clear, reasoned recommendation.



\*\*Questions answered:\*\*

\- Which alternative best serves the user's goal within their constraints?

\- Why is this the recommendation?

\- How confident is the AI in this recommendation, and why?

\- What would change the recommendation?

\- What are the one or two most important reasons to choose this option?



\*\*Data stored:\*\* Recommended alternative, primary reasoning, confidence level, conditions that would change the recommendation, runner-up alternative and the margin between them.



\*\*Why it improves future decisions:\*\* The Recommendation is the output the user sees most prominently. But its value to the system lies in the acceptance rate. When a recommendation is accepted, it validates the reasoning chain. When it is rejected, it reveals a gap. Tracking recommendation acceptance — and, crucially, long-term outcome satisfaction — is the primary feedback mechanism for improving the AI model. A recommendation that is accepted but leads to a poor outcome is more important to analyze than one that is rejected.



\---



\### 8. Final Decision



\*\*Purpose:\*\* Record what the human actually decided — which may or may not match the recommendation.



\*\*Questions answered:\*\*

\- What did the user ultimately choose?

\- Did they follow the recommendation?

\- If not, why not?

\- Were there factors the AI did not know about that influenced the choice?

\- How confident does the user feel about their decision?



\*\*Data stored:\*\* Final choice, alignment with recommendation (yes/no), stated reason for divergence if applicable, user-reported confidence level at time of decision.



\*\*Why it improves future decisions:\*\* This is the most important divergence point in the entire model. When a user chooses differently from the recommendation, one of three things has happened: the AI missed something, the user has information we do not have, or the user is making an error they will later regret. Capturing and analyzing this divergence — across thousands of decisions — is how DecisionOS becomes genuinely intelligent about the gap between analysis and human judgment.



\---



\### 9. Action Plan



\*\*Purpose:\*\* Translate the decision into concrete next steps.



\*\*Questions answered:\*\*

\- What needs to happen now that the decision is made?

\- Who needs to be involved?

\- What is the timeline?

\- What are the first three actions the user should take?

\- What could delay or derail execution, and how should it be pre-empted?



\*\*Data stored:\*\* Action items (with optional deadlines), dependencies, potential blockers, responsible parties.



\*\*Why it improves future decisions:\*\* A decision without an action plan is incomplete. Many good decisions fail not because the choice was wrong, but because the execution was poor. By capturing and tracking the action plan, DecisionOS can identify, over time, where execution consistently breaks down in specific decision categories — and provide better execution support for future users facing the same decisions.



\---



\### 10. Outcome



\*\*Purpose:\*\* Record what actually happened as a result of the decision.



\*\*Questions answered:\*\*

\- What was the real-world outcome of the decision?

\- Did the outcome match the goal?

\- Did the constraints prove accurate, or did reality differ?

\- What happened that was not anticipated?

\- How satisfied is the user with the outcome?



\*\*Data stored:\*\* Outcome description (user-provided), goal achievement rating, satisfaction score, unexpected developments, time to outcome.



\*\*Why it improves future decisions:\*\* The Outcome is where the Decision produces its most valuable long-term signal. Most decision tools never capture outcomes — they stop at the recommendation. DecisionOS is designed to close the loop. An outcome captured three months after a decision, when the user knows whether the choice worked, is worth more to the system than a hundred pre-decision inputs. This is the data that transforms DecisionOS from a recommendation engine into a decision intelligence platform.



\---



\### 11. Reflection



\*\*Purpose:\*\* Invite the user to examine the decision process itself, not just the outcome.



\*\*Questions answered:\*\*

\- Was the decision-making process sound, even if the outcome was poor?

\- Was there information that should have been gathered but was not?

\- Did the user's priorities turn out to differ from what they stated at the start?

\- Was the AI analysis helpful? Where did it fall short?

\- What would the user do differently next time?



\*\*Data stored:\*\* Process quality rating, information gaps identified, priority recalibration notes, AI analysis feedback, self-reported areas for improvement.



\*\*Why it improves future decisions:\*\* Reflection is the bridge between experience and wisdom. A good outcome from a flawed process teaches nothing — and can reinforce bad habits. A poor outcome from a sound process teaches everything. By building structured reflection into the model, DecisionOS creates the conditions for genuine learning — both for the individual user and for the system as a whole.



\---



\### 12. Lessons Learned



\*\*Purpose:\*\* Extract reusable knowledge from a completed decision.



\*\*Questions answered:\*\*

\- What does this decision teach about how to approach this type of decision in the future?

\- What should be done differently next time?

\- Are there principles or heuristics that emerged from this decision?

\- What would the user tell someone else facing the same decision?



\*\*Data stored:\*\* Key lessons (user-authored), decision category tags, reusable heuristics, shareable insights (with consent), confidence in lessons over time.



\*\*Why it improves future decisions:\*\* Lessons Learned is the final transformation of a single decision into durable knowledge. At the individual level, it builds the user's decision-making capability over time. At the system level, aggregated lessons — anonymized and with consent — become the raw material for DecisionOS's most powerful long-term asset: a structured database of human decision knowledge, organized by category, constraint type, and outcome quality.



\---



\## The Decision Lifecycle



A Decision does not begin when a user opens the app. It begins when a person first becomes aware that they face a choice. And it does not end when they make the choice. It ends when they have extracted everything that choice has to teach them.



```

IDEA

The person becomes aware they face a decision.

They may not yet know what the alternatives are,

or even what the goal is. They know only that

a choice must be made.

│

▼

CONTEXT COLLECTION

DecisionOS gathers the situation surrounding

the decision — background, constraints, life

stage, prior considerations. This is where

personalization begins.

│

▼

AI ANALYSIS

The AI examines the alternatives against

the stated goal and constraints. It surfaces

risks, identifies missing information,

and builds a reasoning chain.

│

▼

ALTERNATIVES

The full option space is defined and examined.

The AI may suggest alternatives the user

had not considered. The "do nothing" option

is always included.

│

▼

RECOMMENDATION

The AI synthesizes the analysis into a clear,

reasoned recommendation — with full reasoning

visible, and with conditions for reconsideration

explicitly stated.

│

▼

HUMAN DECISION

The person makes their choice. They may follow

the recommendation. They may not. Either way,

the decision is theirs. DecisionOS records the

choice and the reasoning behind any divergence.

│

▼

EXECUTION

The action plan is activated. DecisionOS may

provide structured support during execution,

but the primary responsibility shifts

entirely to the user.

│

▼

OUTCOME

Time passes. The real-world result emerges.

The user reports what happened — how closely

it matched the goal, what was unexpected,

how satisfied they are.

│

▼

REFLECTION

The user examines not just what happened,

but how the decision was made. Process quality,

information gaps, priority shifts, AI feedback.

│

▼

DECISION INTELLIGENCE

The completed Decision — all thirteen components —

becomes knowledge. For the user, it builds

capability. For the system, it improves

every future decision in the same category.

```



This lifecycle is not always linear. A user may loop between Alternatives and AI Analysis several times. They may revisit the Recommendation after sleeping on it. The Reflection may arrive weeks after the Outcome. The model accommodates this. What it does not accommodate is skipping the loop entirely. Every Decision must close.



\---



\## Decision States



A Decision moves through a defined set of states from the moment it is created to the moment it is archived. These states are not decorative — they determine what actions are available, what the system expects next, and how the Decision is displayed to the user.



```

DRAFT

↓

IN ANALYSIS

↓

WAITING FOR USER

↓

DECISION MADE

↓

EXECUTING

↓

COMPLETED

↓

ARCHIVED

```



\### Draft

The Decision has been created and the user has begun providing input. Context, Goal, and Constraints may be partially or fully completed. No AI analysis has been requested yet. A Decision in Draft can be abandoned, resumed, or advanced. This is the entry state for all Decisions.



\### In Analysis

The user has submitted sufficient input and the AI is actively processing the Decision. Alternatives are being evaluated, risks are being assessed, and the reasoning chain is being constructed. The system is working. The user waits.



\### Waiting for User

The AI analysis is complete. A Recommendation has been generated. The Decision is now in the user's hands. This state may persist for hours, days, or weeks — the user is thinking, consulting others, or gathering additional information before committing to a Final Decision. This state represents the highest-value moment of uncertainty in the entire lifecycle.



\### Decision Made

The user has recorded their Final Decision. The choice has been made — whether it matches the Recommendation or not. The Action Plan component becomes active. This state marks the transition from deliberation to execution.



\### Executing

The user is actively working through the Action Plan. The decision has been made; the work of carrying it out is underway. DecisionOS may surface reminders, check-ins, or relevant information during this state depending on the category and the timeline of the action plan.



\### Completed

The Outcome has been recorded. The user has reported what happened as a result of the decision. The Reflection and Lessons Learned components are now available and encouraged. A Decision in Completed state is one of the most valuable objects in the system — it carries a closed loop from intent to result.



\### Archived

The Decision has been closed and stored for long-term reference. It is no longer active in the user's primary view but remains fully accessible in their Decision history. Archived Decisions continue to contribute to Decision Intelligence through their anonymized, consented data.



\---



\## Decision Intelligence



\### From Individual Decisions to Long-Term Knowledge



A single completed Decision is valuable. A hundred completed Decisions in the same category are transformative.



Decision Intelligence is the accumulation, organization, and application of knowledge extracted from completed Decisions — across individual users, across categories, and across time.



At the individual level, Decision Intelligence means that a user who has completed ten Decisions with DecisionOS makes their eleventh Decision faster, with better-calibrated goals, more realistic constraints, and greater confidence. The system knows their decision patterns. It knows where they typically underestimate risk. It knows which types of alternatives they tend to overlook.



At the system level, Decision Intelligence means that every Outcome and Reflection captured — anonymized, consented, aggregated — becomes a training signal for the AI. Not training on conversations. Training on decisions. The difference is profound.



\### Why DecisionOS Remembers Decisions, Not Conversations



ChatGPT is a conversation engine. It remembers what was said in a session. It does not remember what was decided, what happened as a result, or what was learned.



This distinction is not a technical detail. It is a philosophical one.



Conversations are ephemeral. They capture what someone was thinking at a moment in time. Decisions are durable. They capture what someone actually did, what they were willing to commit to, and what the consequences were.



When DecisionOS stores a Decision, it is storing:

\- A committed choice, not a hypothetical

\- A real-world outcome, not a response

\- A reflection from someone who lived with the consequences, not a prompt-response pair

\- A set of lessons distilled into something reusable



This is qualitatively different from conversation memory. A person who has made twenty Decisions with DecisionOS has given the system twenty data points grounded in reality — in actual choices, actual outcomes, and actual learning. No conversation history can provide that.



The long-term vision is for DecisionOS to become the world's most structured repository of human decision knowledge — organized not by topic, but by decision type, constraint profile, and outcome quality. That repository cannot be built from conversations. It can only be built from Decisions.



\---



\## One Decision. One Object.



In DecisionOS, a Decision is not a summary. It is not a thread. It is not a label applied to a group of chat messages. It is a first-class object — persistent, structured, and complete.



Everything that belongs to a Decision lives inside it:



\- \*\*Notes\*\* — the user's private thinking, written at any point in the lifecycle

\- \*\*Files\*\* — documents, screenshots, research materials attached to support the decision

\- \*\*AI Conversations\*\* — every exchange with the AI, tied to the specific component it informed

\- \*\*Recommendations\*\* — the AI's synthesized output, versioned and traceable

\- \*\*Actions\*\* — the concrete steps committed to after the Final Decision

\- \*\*Outcomes\*\* — the real-world results, reported back when they are known

\- \*\*Reflections\*\* — the user's retrospective on process and judgment

\- \*\*Lessons Learned\*\* — the durable knowledge extracted from the experience



None of these elements float freely. None of them exist outside the context of a Decision. A note without a Decision is just text. An AI conversation without a Decision is just a chat. An outcome without a Decision is just a memory.



By anchoring everything to the Decision object, DecisionOS makes it possible to understand the full arc of any choice — from the first moment of uncertainty to the final lesson learned — as a single, coherent record.



This is the architectural rule that governs everything we build:



> \*\*If a future feature cannot be attached to a Decision, it probably does not belong in DecisionOS.\*\*



Not because we are rigid. But because our product has a purpose. And that purpose is to make Decisions better — not to be a general-purpose workspace, not to be a social platform, not to be an AI assistant. Every feature that strengthens the Decision object strengthens the product. Every feature that exists outside of it diffuses it.



The Decision is the product. Everything else is infrastructure.



\---



\## Why the Decision Model Matters for Every Future Feature



Every feature we will ever build will be tempted to bypass the Decision Model.



A social feature will be tempted to surface popular choices without grounding them in individual context. A notification feature will be tempted to prompt engagement without tying it to a specific Decision in a specific lifecycle state. A premium feature will be tempted to offer "unlimited decisions" without ensuring those decisions follow the model that makes them valuable.



These temptations are understandable. They are also dangerous.



The Decision Model is not bureaucracy. It is the source of every defensible advantage DecisionOS has:



\*\*It is the source of personalization.\*\* Without the model, we have no structured way to understand what a user actually needs from a recommendation.



\*\*It is the source of trust.\*\* The model is what makes our reasoning transparent. Without it, we are a black box like every other AI tool.



\*\*It is the source of learning.\*\* Without Outcomes, Reflections, and Lessons Learned, DecisionOS is a one-shot recommendation engine that never improves from real-world results.



\*\*It is the source of differentiation.\*\* Any AI can generate a recommendation. Only DecisionOS generates a complete Decision — one that begins in uncertainty, ends in wisdom, and makes the next decision better.



Every feature that strengthens the model makes DecisionOS more valuable. Every feature that bypasses the model makes DecisionOS more generic.



The test for every future feature is simple: \*Which component of the Decision Model does this strengthen?\*



If the answer is none, the feature does not belong here.



\---



\*DecisionOS Company Handbook | H03 — The Decision Model\*

\*Version 1.0 Final | Status: Frozen\*

\*Owner: Founding Team | Next review: Q4 2026\*

\*This document defines the product. Everything else is implementation.\*

