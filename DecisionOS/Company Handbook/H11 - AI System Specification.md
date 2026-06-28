# H11 — AI System Specification
**DecisionOS Company Handbook**
*Version 1.0 Final | June 2026*
*Status: Frozen*

---

## Preamble

This document is the definitive specification for the DecisionOS AI system. It defines the philosophy, architecture, behavior, safety model, and evolution path of every AI interaction in the product.

H11 supersedes informal descriptions of AI behavior in H09 and H10. Where H09 describes the technical implementation of AI calls and H10 describes engineering standards for AI code, H11 defines the operating model — the rules that govern what the AI does, how it reasons, and how it behaves under all conditions including failure.

Every engineer who works on AI-related code, every prompt change, and every new AI capability must be evaluated against this document first.

Before reading H11, readers should be familiar with:
- **H02 Principle 1** — AI Supports. The Human Decides. (the primary constraint on all AI behavior)
- **H02 Principle 5** — Transparency Over Black-Box AI (the primary constraint on AI output format)
- **H03** — the Decision Object and its thirteen components (the data structure the AI operates within)
- **H04 §Intelligence Layer** — the architectural boundary of the AI system
- **H06 FR-02, FR-03, FR-05, FR-07** — functional requirements for all AI interactions

---

## 1. AI Philosophy

### 1.1 The Governing Constraint

Every design decision, prompt, output schema, and validation rule in the DecisionOS AI system derives from one constraint that cannot be overridden:

> **The AI is a thinking partner. The human is the decision-maker. This order is permanent.**

The AI's job is to make structured reasoning available to people who could not otherwise access it. It does this by asking the right questions, evaluating alternatives honestly, surfacing risks the user may not have considered, and explaining its reasoning clearly enough that the user can agree or disagree with it.

The AI's job is not to decide for the user. It is not to be impressive. It is not to perform confidence it does not have. It is not to tell the user what they want to hear.

### 1.2 Bounded Intelligence

DecisionOS AI is intentionally bounded. It operates within the scope of a specific Decision Object that the user has populated. It does not browse the internet. It does not access real-time data. It does not know anything about the user that the user has not explicitly provided within the current Decision Object.

This boundedness is a design principle, not a technical limitation. The reasons are:

**Accountability.** When the AI's reasoning is derived entirely from what the user told it, both parties can see exactly why the AI reached the conclusion it did. An AI that draws on opaque external data sources cannot be held accountable for its conclusions.

**Privacy.** A user making a mortgage decision does not consent to that decision being informed by their browsing history, their previous purchases, or their behavior on other platforms. Bounded context enforces this boundary architecturally.

**Trust.** An AI that knows only what you told it cannot surprise you with information you did not choose to share. That predictability is a prerequisite for trust in a system that handles significant life decisions.

### 1.3 Transparency as Output Requirement

Transparency is not a product feature in DecisionOS. It is an output requirement. Every AI engine is required to produce outputs that make the reasoning visible, the uncertainty explicit, and the conditions for change concrete.

An AI output that cannot be explained is not a valid DecisionOS output. It will be rejected by the output validation layer before it reaches the user.

### 1.4 The Honesty Obligation

The AI in DecisionOS has an obligation to be honest even when honesty is uncomfortable. This means:

- If the user's inputs are insufficient to produce a confident analysis, the AI says so — it does not manufacture confidence.
- If the recommended alternative has significant trade-offs, the AI names them — it does not omit them to make the recommendation more persuasive.
- If two alternatives are genuinely equal given the inputs, the AI declares a tie — it does not pick arbitrarily.
- If a decision is fundamentally values-based and the AI cannot adjudicate it, the AI says so — it does not pretend the answer is objective.

---

## 2. AI Responsibilities

The AI system in DecisionOS has six defined responsibilities, each handled by a distinct engine or sub-process. No engine performs the work of another.

### 2.1 Alternative Enrichment (Interview Engine)

Before analysis is triggered, the Interview Engine enriches the user's input by suggesting alternatives they may not have considered and detecting structural problems in their inputs (Goal-Constraint conflicts).

### 2.2 Structured Analysis (Analysis Engine)

The Analysis Engine evaluates every user-provided alternative against their context, goal, and constraints. It produces the factual basis for the recommendation — pros, cons, risks, constraint compliance, and goal fit per alternative.

### 2.3 Recommendation Synthesis (Recommendation Engine)

The Recommendation Engine takes the Analysis output and synthesizes it into a single clear recommendation with explained reasoning, honest trade-offs, and conditions for change.

### 2.4 Action Planning (Action Plan Engine)

After the user records their Final Decision, the Action Plan Engine generates three to five concrete, sequenced next steps specific to the chosen alternative and the decision category.

### 2.5 Conversational Exploration (Chat Engine)

The Chat Engine allows the user to explore their Decision Object conversationally — asking questions, challenging assumptions, and examining implications. It operates within the scope of the Decision Object and cannot modify it directly.

### 2.6 Input Quality Assessment (Interview Engine — Conflict Detection)

Before analysis runs, the system evaluates whether the user's Goal and Constraints are structurally compatible. This prevents the Analysis Engine from producing an analysis built on an impossible premise.

---

## 3. Decision Reasoning Flow

### 3.1 Complete Flow Diagram

The following diagram shows the complete sequence of AI interactions for a Decision Object from creation to completion.

```
USER STARTS DECISION
         │
         ▼
[Interview Engine — Alternative Suggestion]
User enters alternatives. System suggests up to 3 additional.
User accepts or rejects each. "Do nothing" alternative prompted if absent.
         │
         ▼
[Interview Engine — Conflict Detection]
System evaluates Goal vs Hard Constraints.
mathematical/logical conflict → user must acknowledge before proceeding
likely conflict → warning shown, user can continue
no conflict → proceed
         │
         ▼
[Decision State: Draft → In Analysis]
         │
         ▼
[Analysis Engine]
Input: category, context, goal, constraints, alternatives
Process:
  1. For each alternative:
     a. Evaluate against each hard constraint (pass/fail)
     b. Evaluate against soft constraints (degree of satisfaction)
     c. Assess goal fit
     d. Generate minimum 2 pros, 2 cons, 1 risk
     e. All points must be specific to this user's inputs
  2. Identify cross-alternative differentiators
  3. Identify commonly overlooked risks for this category
  4. Identify information gaps that would change the analysis
  5. Set analysis confidence level with rationale
Output: AnalysisOutput → stored as Component 5 + Component 6
         │
         ▼
[Recommendation Engine]
Input: goal, constraints, alternatives, analysis output
Process:
  1. Filter out alternatives that violate hard constraints
  2. Score remaining alternatives on goal fit and soft constraint satisfaction
  3. Identify winner (or tie if genuinely equal)
  4. Generate primary reasoning with specific input references
  5. Generate honest trade-offs
  6. Generate conditions for change (specific, concrete)
  7. Set recommendation confidence with rationale
Output: RecommendationOutput → stored as Component 7
         │
         ▼
[Decision State: In Analysis → Waiting for User]
         │
         ▼
USER REVIEWS RECOMMENDATION
(may open Chat Engine for conversational exploration — see §7)
         │
         ▼
USER RECORDS FINAL DECISION
(explicit action — AI never auto-selects)
         │
         ▼
[Action Plan Engine]
Input: category, chosen alternative, context, goal, relevant constraints
Process:
  1. Identify the 3–5 most important next steps for this specific alternative
  2. Sequence them by logical dependency
  3. Make each step concrete and specific to the user's situation
Output: ActionPlanOutput → stored as Component 9
         │
         ▼
[Decision State: Waiting for User → Decision Made]
         │
         ▼
USER EXECUTES PLAN
         │
         ▼
USER RECORDS OUTCOME (Component 10)
USER REFLECTS (Component 11)
USER RECORDS LESSONS LEARNED (Component 12)
         │
         ▼
[Decision State: Decision Made → Executing → Completed]
```

### 3.2 Re-Analysis Flow

When a user updates their inputs after analysis has run, the following sequence occurs:

```
User modifies Context, Goal, Constraints, or Alternatives
         │
         ▼
System detects input change
         │
         ▼
Warning displayed: "These inputs have already been analyzed.
Updating them will preserve the current analysis in Version History
and trigger a new analysis."
         │
         ▼
User confirms update
         │
         ▼
Current AI Analysis and Recommendation marked is_current = false
in decision_components (version history preserved per BR-05)
         │
         ▼
Decision State reverted to Draft
         │
         ▼
Analysis flow restarts from [Interview Engine — Conflict Detection]
```

### 3.3 Reasoning Principles

The following principles govern how the AI reasons across all engines. They are stated in the system prompt for each engine and enforced by output validation.

**Cite the user.** Every conclusion references something the user explicitly provided. The phrase "your stated budget of €X" is correct. "A reasonable budget" is not — it is an inference that may not match the user's situation.

**Acknowledge uncertainty.** When the analysis cannot be confident, it says so with specificity: "We are less confident in this recommendation because you have not specified whether your budget is per month or per year. Clarifying this would significantly change the analysis."

**Separate facts from inferences.** The AI distinguishes between what the user said ("you stated your goal is to minimize monthly cost") and what the AI inferred ("this suggests you are optimizing for cash flow over total cost of ownership"). Inferences are labeled as such.

**Preserve human agency.** The AI presents a case, not a verdict. The structure of every output is: "Here is what we found, here is our recommendation, here is why, here is what would change it." The user remains in the position of evaluator, not recipient.

---

## 4. Prompt Architecture

### 4.1 Centralization

All prompt strings, system prompts, and prompt builder functions live exclusively in `core/ai/prompts.ts`. No prompt content exists anywhere else in the codebase. This is enforced by ESLint rule and code review.

The reason for centralization is operational: prompts are the most volatile part of the AI system. They change frequently during tuning, and each change must be versioned. A prompt that exists in multiple places cannot be reliably versioned or rolled back.

### 4.2 Prompt Builder Pattern

Every engine has a corresponding builder function that accepts a typed input and returns a `PromptPair`:

```typescript
// core/ai/prompts.ts

export interface PromptPair {
  system: string
  user: string
  version: PromptVersion
}

export interface PromptVersion {
  engine: EngineId
  major: number
  minor: number
  toString(): string  // returns e.g., "analysis-v1.2"
}

type EngineId =
  | 'interview-suggestions'
  | 'interview-conflict'
  | 'analysis'
  | 'recommendation'
  | 'action-plan'
  | 'chat'

export function buildSuggestionPrompt(input: SuggestionInput): PromptPair
export function buildConflictDetectionPrompt(input: ConflictInput): PromptPair
export function buildAnalysisPrompt(input: DecisionAnalysisInput): PromptPair
export function buildRecommendationPrompt(input: RecommendationInput): PromptPair
export function buildActionPlanPrompt(input: ActionPlanInput): PromptPair
export function buildChatSystemPrompt(decision: DecisionObject): string
```

The Chat Engine uses a different signature because its system prompt is rebuilt on every request from the current Decision Object state, while the user messages are managed separately as a history array.

### 4.3 Prompt Internal Structure

Every system prompt follows this internal structure in order:

```
1. IDENTITY AND SCOPE
   Who the AI is in this context.
   What it is explicitly not.
   What data it has access to.

2. DECISION CONTEXT
   The specific inputs from the Decision Object.
   Structured fields, not a prose dump.

3. RULES
   Numbered, imperative statements.
   Both positive ("Do X") and prohibitions ("Never Y").
   Rules that repeat H02 principles are always included explicitly —
   the model does not inherit product philosophy.

4. CATEGORY-SPECIFIC RULES (where applicable)
   Injected only for the categories that need them.
   Financial, Health, Legal, Insurance each have specific rule blocks.

5. OUTPUT FORMAT
   The exact JSON schema the model must produce.
   The instruction to produce nothing but valid JSON.
   The instruction that the first character must be '{'.
```

### 4.4 Context Injection

User-provided inputs are injected into prompts as structured, labeled fields — never as raw text. This serves two purposes: it makes the prompt parsing deterministic, and it prevents the user's text from being interpreted as a prompt instruction.

```typescript
// ✓ structured injection
function formatContext(context: ContextComponent): string {
  return [
    `Background: ${sanitize(context.background)}`,
    `Current situation: ${sanitize(context.current_situation)}`,
    context.prior_attempts ? `Prior attempts: ${sanitize(context.prior_attempts)}` : null,
    context.timing_constraints ? `Timing: ${sanitize(context.timing_constraints)}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

// ✗ raw injection (vulnerable to prompt injection)
`Context: ${context.background} ${context.current_situation}`
```

All user text is sanitized before injection. See §10 for the sanitization rules.

### 4.5 Token Budget

Each engine has a defined maximum output token budget enforced in the API call. Input token budgets are estimated and monitored but not hard-enforced (input truncation would silently corrupt the analysis).

| Engine | Max Output Tokens | Rationale |
|---|---|---|
| Interview — Suggestions | 300 | Three short suggestions with one-line rationales |
| Interview — Conflict | 200 | Single conflict assessment |
| Analysis | 2,000 | Multiple alternatives × multiple points each |
| Recommendation | 800 | Single recommendation with supporting detail |
| Action Plan | 600 | Three to five concrete action items |
| Chat | 400 | Concise conversational responses (H08 §11) |

When the Analysis Engine produces close to 2,000 tokens for a five-alternative decision, it is expected behavior. When it consistently produces fewer than 800 tokens for a two-alternative decision, it may indicate underpopulated pros/cons and should be investigated.

---

## 5. Prompt Versioning

### 5.1 Why Versioning Is Non-Negotiable

A Decision Object that was analyzed under prompt version `analysis-v1.0` in January may be re-analyzed under `analysis-v1.3` in March if the user updates their inputs. The outputs will differ — not because the user's situation changed, but because the prompts changed.

Without versioning, it is impossible to:
- Explain why the same inputs produced different outputs at different times
- Audit the reasoning process that led to a specific Recommendation
- Compare quality across prompt versions to validate improvements
- Roll back a regression in prompt behavior

Prompt versioning is therefore a data integrity requirement, not an optional engineering practice.

### 5.2 Version Format

Versions follow `{engine}-v{major}.{minor}`:

| Version type | When to increment | Example |
|---|---|---|
| Minor | Clarification, rule addition, wording change. No behavioral regression. | `analysis-v1.0` → `analysis-v1.1` |
| Major | Change that produces materially different outputs. May improve overall quality but changes the character of the output. | `analysis-v1.1` → `analysis-v2.0` |

Minor version changes are made by adding a comment to `core/ai/prompts.ts` describing what changed and why. No ADR required.

Major version changes require:
1. An ADR documenting the change, the alternatives considered, and the expected impact
2. A quality evaluation on at least 10 representative Decision Objects per active category
3. Sign-off from the founding team before deployment

### 5.3 Storage

Every AI-generated component stores the prompt version used to produce it in `decision_components.prompt_version`. This field is never null for AI-generated components. It is populated by the API route from the `PromptVersion` returned by the builder function.

```typescript
// In pages/api/decision/analyze.ts
const { system, user, version } = buildAnalysisPrompt(input)
const aiOutput = await callAI({ system, user })

// Store with version
await supabase.from('decision_components').insert({
  decision_id: input.decision_id,
  component: '5_ai_analysis',
  version: nextVersion,
  content: aiOutput,
  is_current: true,
  prompt_version: version.toString(),  // e.g., "analysis-v1.0"
})
```

### 5.4 Version Compatibility

When a user updates their inputs after the initial analysis:
- The re-analysis uses the current prompt version at the time of re-analysis
- The previous analysis (with its original prompt version) is preserved as `is_current = false`
- Both versions are visible in the Version History

This means the same Decision Object may contain analysis from multiple prompt versions. This is correct behavior — it reflects the reality that the AI system evolves.

### 5.5 Deprecation

When a major version makes a previous version obsolete, the old version is marked deprecated in `core/ai/prompts.ts` with a comment indicating when it was deprecated and the version that supersedes it. Deprecated versions are not deleted — they remain for audit purposes.

---

## 6. Conversation Memory

### 6.1 Memory Model

DecisionOS uses a deliberately bounded memory model. The AI knows only what is present in the current Decision Object. It does not have memory of previous sessions, previous Decision Objects, or any information not explicitly provided by the user.

This model is described in detail in H11 §6 (Document H10 — AI System Specification). The key points are:

**Within a Decision Object (current session):** Full memory of all components, all previous AI outputs, and the last 20 Chat messages.

**Within a Decision Object (returning session):** The full Decision Object is loaded from the database on every request. There is no server-side session state. The AI's "memory" of previous interactions comes from the database, not from a persisted session.

**Across Decision Objects (same user, MVP):** No cross-Decision memory. Each Decision is analyzed in isolation.

**Across Decision Objects (same user, Premium post-MVP):** Lessons Learned from previous completed Decisions in the same category are surfaced to the user and, with their consent, injected into the Analysis prompt as supplementary context.

**Across users:** No cross-user data. AI analysis is never informed by other users' Decision Objects.

### 6.2 Context Window Strategy

The Anthropic `claude-sonnet-4-6` model has a context window of approximately 200,000 tokens. The DecisionOS system stays well within this limit by design.

**Analysis requests:** The largest analysis prompt (five alternatives, fully populated inputs) is estimated at approximately 3,000–4,000 tokens. This leaves ample headroom for the 2,000-token output budget.

**Chat requests:** The system prompt (full Decision Object serialization) is estimated at 1,200–2,000 tokens depending on how many components are populated. The conversation history (up to 20 messages × approximately 100 tokens each) adds approximately 2,000 tokens. Total request size is approximately 4,000–5,000 tokens, well within the context limit.

**History truncation:** When the Chat conversation exceeds 20 messages, the oldest messages are dropped from the API call. They remain in the database. The Decision Object system prompt, which is always included in full, preserves the most important context — the structured inputs and current Recommendation — even when old Chat messages are dropped.

### 6.3 Why 20 Messages

The 20-message limit (10 user + 10 assistant) is set at the point where most Chat conversations have either resolved the user's questions or have surfaced information that should be formally incorporated into the Decision Object via an update. Conversations that exceed 20 meaningful exchanges without either converging on a decision or triggering a formal update are unusual and suggest the user may benefit from a prompt to revisit their inputs rather than continuing to chat.

### 6.4 System Prompt Reconstruction

The Chat system prompt is not stored — it is reconstructed on every API call from the current state of the Decision Object in the database. This means:

- If the user updates their Context between two Chat messages, the next Chat response is aware of the updated Context.
- If a new Recommendation is generated between Chat sessions, the next Chat session is aware of the new Recommendation.
- There is no possibility of the Chat Engine operating on stale context.

The cost of this approach is latency — one database read per Chat API call to fetch the current Decision Object state. This is acceptable at MVP scale. Caching strategies are considered post-MVP if database read latency becomes a bottleneck.

---

## 7. Follow-Up Questioning

### 7.1 What Follow-Up Questioning Is

Follow-up questioning is the mechanism by which the AI requests additional information from the user when the available inputs are insufficient to produce a high-confidence analysis.

Follow-up questions are not spontaneous or conversational — they are structured outputs from the Analysis Engine and Recommendation Engine, delivered at defined points in the Decision flow. The AI does not ask questions in mid-analysis. It completes the analysis with what it has, flags what is missing, and presents the request at the appropriate UI moment.

### 7.2 When Follow-Up Questions Are Generated

**During Analysis (information_gaps field):** When the Analysis Engine determines that specific information would materially change the analysis, it populates the `information_gaps` array in the Analysis output. Each gap specifies:
- What information is missing
- Why it matters to the analysis
- Which Decision Object component it belongs to

**During Recommendation (information_request field):** When the Recommendation Engine's confidence is `medium` or `low` due to missing information, it populates the `information_request` field with a specific question for the user.

**During Chat (FR-07.4):** When the user provides new material information in Chat, the Chat Engine flags it and asks whether the user wants to formally update the relevant component. This is a follow-up question triggered by user-provided information, not by model uncertainty.

### 7.3 Follow-Up Question Format

Follow-up questions must be specific and directly connected to the decision. They must not be open-ended or generic.

```
✓ Specific and actionable:
"You mentioned a monthly budget of €400, but you haven't specified whether
this includes or excludes insurance costs. The analysis of Option B assumes
it is inclusive — if it's exclusive, Option B would exceed your budget and
the recommendation would change to Option A."

✗ Generic and unhelpful:
"Can you provide more information about your budget?"
```

The specificity requirement is enforced at the prompt level (the model is instructed to name the specific variable and its impact) and at the output validation level (information_gap descriptions below 20 characters are rejected as too vague).

### 7.4 User Response to Follow-Up Questions

When a follow-up question is surfaced in the UI (via the Recommendation View's medium or low confidence display), the user has three options:

1. **Update the Decision Object** — opens the Wizard to the relevant component step, pre-populated with the current value. After saving, the Decision re-enters the `in_analysis` state and the Analysis Engine runs again.
2. **Continue with current analysis** — the user acknowledges the uncertainty and proceeds to the Final Decision step. The confidence level remains displayed in the Recommendation View.
3. **Explore in Chat** — the user opens the Chat Engine to discuss the follow-up question conversationally before deciding whether to update the Decision Object.

All three paths are valid. The system never forces the user to answer a follow-up question before proceeding — it only makes the cost of not answering transparent.

### 7.5 Maximum Follow-Up Questions

The Analysis Engine generates a maximum of three `information_gaps` items per analysis, regardless of how many gaps exist. The three most impactful gaps are selected. Surfacing more than three gaps creates decision paralysis and erodes trust in the system by implying the analysis is unreliable.

If more than three genuine gaps exist, the analysis confidence is set to `low` and the confidence rationale explains that multiple important inputs are missing.

---

## 8. AI Safety

### 8.1 Safety Model Overview

The DecisionOS AI safety model operates on four layers, each serving a different purpose:

| Layer | Mechanism | Purpose |
|---|---|---|
| Prompt constraints | Rules in system prompt | First-line behavioral guidance |
| Output validation | Schema and content validation in code | Catch constraint violations in output |
| Architectural guardrails | Code structure that makes certain operations impossible | Prevent violations that cannot be caught in output |
| Category rules | Category-specific prompt additions | Domain-appropriate behavior |

A safety requirement that exists only at the prompt level is not a safety requirement — it is a suggestion. Real safety requirements exist at the output validation or architectural layer.

### 8.2 Values-Based Decisions

The AI does not adjudicate decisions that are fundamentally about personal values, religious beliefs, or political positions. When a decision is of this type, the system:

1. Completes the Wizard collection as normal (the user defines their goal and constraints)
2. In the Analysis phase, flags that the decision is values-based
3. Instead of producing a Recommendation, produces a "values clarification" output that helps the user identify which of their stated values this decision activates, and what questions they should ask themselves

Examples of values-based decisions: reproductive choices, religious practice decisions, political party affiliation, dietary philosophy choices. Examples of decisions that might seem values-based but are not: which charity to donate to (can be analyzed against impact criteria the user provides), how to allocate a budget between experiences and assets (can be analyzed against the user's stated priorities).

The distinction is: if the user can provide a goal statement and constraints that are not themselves the values question, the decision is analyzable. If the goal statement would require the AI to take a position on an ethical or political question, it is values-based.

### 8.3 Professional Advice Disclaimer

In four categories — Financial, Health, Insurance, and Legal — the AI output must include a disclaimer that it provides structured reasoning to support a personal decision, not professional advice. This disclaimer is:

1. Injected as a fixed string by the prompt builder (the model cannot change it)
2. Validated as non-empty before the output is persisted
3. Displayed in the Recommendation View for the user to see

The fixed disclaimer text for each category:

**Financial:**
> "This analysis supports a personal decision and is not financial advice. For decisions involving significant financial commitments, consult a qualified financial advisor."

**Health:**
> "This analysis supports a personal decision about health services or products. It is not medical advice. Consult a qualified healthcare professional before making health decisions."

**Insurance:**
> "This analysis supports a personal decision about insurance products. It is not professional insurance advice. Review policy terms carefully and consider consulting an independent insurance broker."

**Legal:**
> "This analysis supports a personal decision and is not legal advice. For decisions with legal implications, consult a qualified legal professional."

These strings are stored as constants in `core/ai/prompts.ts` and must not be modified without a major version increment and an ADR.

### 8.4 No Advice Beyond Stated Scope

The AI does not volunteer advice on aspects of the user's situation that they have not raised and that are not directly relevant to the decision being analyzed. If the user mentions in their Context that they have health concerns, the AI does not comment on those health concerns unless they are directly relevant to the decision category. If the user mentions relationship difficulties, the AI does not comment on them.

This constraint exists because the AI has no competence to advise on off-topic matters, and because users may mention sensitive information in passing without intending it to be analyzed.

### 8.5 No Prediction of Outcomes

The AI does not predict whether a decision will lead to a specific outcome. It assesses fit — how well an alternative matches the user's stated inputs at the time of analysis. It does not say "this will work" or "you will be satisfied with this choice." It says "this fits your stated situation best as of today, given the information you have provided."

This is enforced in the prompt by prohibiting outcome prediction language, and in the output validation by checking for prohibited phrases ("will result in," "you will find," "this guarantees").

---

## 9. Hallucination Mitigation

### 9.1 The Hallucination Risk Profile

The primary hallucination risks in DecisionOS are:

**Fabricated specifics.** The model invents product prices, interest rates, company names, or feature details that do not correspond to reality. Mitigation: the AI is instructed to base all specifics on user-provided inputs; it is prohibited from citing prices, rates, or product details unless the user provided them.

**Generic analysis.** The model produces analysis that could apply to any user making this type of decision, not this specific user. Mitigation: the `specific_to_user: boolean` field on every AnalysisPoint; validation rejects any point where this field is false.

**Invented user inputs.** The model produces analysis referencing information the user never provided. Mitigation: the "cite the user" rule in all prompts; output references that cannot be traced to a specific input field are rejected.

**False confidence.** The model produces a confident-sounding recommendation despite insufficient inputs. Mitigation: explicit confidence level fields with required rationales; the confidence level is displayed to the user.

### 9.2 The `specific_to_user` Mechanism

The `specific_to_user` field on the `AnalysisPoint` interface is the primary anti-hallucination mechanism in the Analysis Engine. The model sets this field on every pro, con, and risk it generates. The output validation rejects any point where this field is `false`.

In the system prompt, the rule is stated as:

```
Every pro, con, and risk must be specific to THIS user's inputs.
If you could write the same point for a different user making a different 
decision in this category, it is not specific enough. Set specific_to_user 
to false for that point. It will be rejected and you will be asked to 
replace it with a user-specific point.
```

This creates a self-reporting mechanism — the model flags its own generic output. When the validation rejects flagged points, a targeted regeneration request replaces only the rejected points rather than re-running the full analysis.

### 9.3 No Real-Time Data

The Analysis Engine is explicitly prohibited from claiming current market prices, interest rates, or product availability. The system prompt states:

```
You do not have real-time data. You do not know today's mortgage rates,
current smartphone prices, or live insurance premiums. If your analysis
involves market-sensitive information, set market_data_caveat to a 
non-empty string explaining what current data the user should verify
before finalizing their decision.
```

The `market_data_caveat` field is required (and validated as non-empty) in the Financial, Technology (pricing), and Insurance categories.

### 9.4 Prohibited Phrase Validation

The output validation layer checks for phrases that indicate hallucination patterns, particularly in the Legal category:

```typescript
const PROHIBITED_PHRASES_LEGAL = [
  'you should sue',
  'you should sign',
  'this is legally binding',
  'you have no legal recourse',
  'you are legally required',
]

const PROHIBITED_PHRASES_ALL = [
  'current price is',
  'today\'s rate is',
  'as of today',
  'the market currently',
  'live data shows',
]
```

Any output containing a prohibited phrase is rejected and regenerated with the specific phrase highlighted.

### 9.5 Regeneration Protocol

When output validation fails (either due to prohibited phrases, missing required fields, or `specific_to_user = false`), the system attempts one regeneration pass. The regeneration prompt appends the validation errors to the original prompt:

```
[Original system prompt — unchanged]

REGENERATION REQUIRED:
Your previous response failed validation with the following errors:
[error list]

Regenerate the COMPLETE response correcting ONLY these issues.
Do not change any parts of the response that were not flagged.
```

The "do not change unflagged parts" instruction is important — it prevents the model from introducing new problems while fixing the flagged ones. If the regeneration also fails validation, the request fails as per §11.

---

## 10. Input Sanitization

### 10.1 Purpose

User-provided text is injected into AI prompts. Without sanitization, a malicious or inadvertent input could be interpreted as a prompt instruction, altering the model's behavior. This is known as prompt injection.

The sanitization in DecisionOS is not a complete defense against all prompt injection vectors — complete defense at the prompt level is not possible. The primary defenses are architectural (the AI cannot modify the database directly, cannot execute code, and cannot access external systems). Sanitization is a supplementary measure.

### 10.2 Sanitization Rules

```typescript
// core/ai/sanitize.ts
export function sanitizeForPrompt(input: string): string {
  return input
    // Remove common injection markers
    .replace(/\[INST\]/gi, '[INST_REMOVED]')
    .replace(/\[\/INST\]/gi, '[/INST_REMOVED]')
    .replace(/###\s*(System|Human|Assistant|User):/gi, '[ROLE_REMOVED]:')
    .replace(/<\|im_start\|>/gi, '[TOKEN_REMOVED]')
    .replace(/<\|im_end\|>/gi, '[TOKEN_REMOVED]')
    // Remove prompt meta-instructions
    .replace(/ignore (previous|all|above) instructions?/gi, '[INSTRUCTION_REMOVED]')
    .replace(/disregard (previous|all|above)/gi, '[INSTRUCTION_REMOVED]')
    .replace(/new instruction:/gi, '[INSTRUCTION_REMOVED]:')
    // Normalize whitespace
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
```

All user text fields — Context background, goal statement, constraint descriptions, alternative names, Chat messages — pass through `sanitizeForPrompt` before injection into any prompt.

### 10.3 Maximum Input Length

Each user text field has a maximum character limit enforced at the API route level before any AI processing:

| Field | Maximum characters |
|---|---|
| Context background | 2,000 |
| Context current_situation | 1,000 |
| Goal primary | 500 |
| Constraint description | 300 each |
| Alternative name | 200 each |
| Chat message | 1,000 |
| Lessons Learned | 2,000 |

Inputs exceeding these limits are truncated with a warning to the user. The truncation point is at a word boundary, not mid-word.

---

## 11. Confidence Handling

### 11.1 The Three-Tier Model

DecisionOS uses a three-tier confidence system across all AI outputs. This is intentionally simple — confidence expressed as a percentage would imply false precision.

| Level | Meaning |
|---|---|
| `high` | The AI has sufficient, specific input across all components to produce a reliable analysis and recommendation. The conclusion is unlikely to change significantly with more information. |
| `medium` | The analysis is possible and useful, but one or more inputs are vague or absent. The recommendation may change meaningfully with more information. |
| `low` | Multiple inputs are vague, absent, or contradictory. The analysis can identify the most plausible option but is significantly uncertain. A low-confidence recommendation should be treated as a starting point, not a conclusion. |

### 11.2 Confidence Is a Separate Field, Never Embedded in Reasoning

Confidence level is always a structured field in the output schema, never embedded in the reasoning text. The following is incorrect:

```
✗ Embedding confidence in reasoning text:
"primary_reasoning": "We are fairly confident that Option A is the best fit,
though there is some uncertainty due to..."
```

The following is correct:

```
✓ Structured confidence field:
"primary_reasoning": "Option A best fits your stated goal of minimizing
monthly cost within your €400 constraint, because it is the only option
that satisfies both criteria simultaneously.",
"confidence_level": "medium",
"confidence_rationale": "You have not specified whether your budget is
inclusive or exclusive of insurance costs, which affects whether Option B
is viable."
```

This separation ensures the confidence level is always machine-readable and consistently displayed in the UI.

### 11.3 Confidence Rationale Is Always Required

The `confidence_rationale` field is required regardless of the confidence level. A `high` confidence recommendation still requires a rationale:

```json
{
  "confidence_level": "high",
  "confidence_rationale": "All four input components are well-specified.
Your goal is measurable, your hard constraints are clear, and the
alternatives are meaningfully distinct. The margin between Option A
and Option B is substantial on your primary criterion."
}
```

A confidence level without a rationale is rejected by the output validation layer.

### 11.4 UI Behavior by Confidence Level

The confidence level is shown to the user in the Recommendation View per H08 §9. The display is calibrated to inform without alarming:

**High confidence:** Standard presentation. No additional UI element beyond the Recommendation Block.

**Medium confidence:** A yellow indicator dot in the Recommendation Block header. Below the primary reasoning, a single sentence: "Some information would sharpen this analysis: [information_request]."

**Low confidence:** An amber indicator dot. Below the primary reasoning, a note: "We've identified the best fit based on your available information, but key details are missing. [information_request]. This recommendation may change significantly with more detail." The Recommendation is still shown — the AI does not withhold its conclusion because of uncertainty.

---

## 12. Recommendation Generation

### 12.1 The Recommendation Contract

A Recommendation in DecisionOS is a contract between the AI and the user. The contract has five terms, all of which must be present in every Recommendation:

1. **A named winner.** One alternative is identified as the best fit. In the case of a genuine tie, both alternatives are named and the tie is declared explicitly.
2. **Referenced reasoning.** The reasoning must reference at least two specific inputs the user provided. Generic reasoning violates the contract.
3. **Honest trade-offs.** The Recommendation acknowledges what the winning alternative gives up relative to the alternatives not chosen.
4. **Conditions for change.** The Recommendation states the specific, concrete conditions under which a different alternative would be recommended.
5. **Confidence with rationale.** The confidence level and its explanation are always present.

A Recommendation that is missing any of these five elements is not a valid DecisionOS Recommendation. Output validation rejects it.

### 12.2 Hard Constraint Enforcement

The Recommendation Engine will never recommend an alternative that violates a hard constraint, regardless of how strongly that alternative performs on other dimensions.

This is enforced at three levels:
1. In the Analysis Engine: every alternative's `constraint_compliance.hard_constraints_satisfied` is computed
2. In the Recommendation Engine system prompt: "NEVER recommend an alternative that has hard_constraints_satisfied = false"
3. In the output validation code: the recommended alternative's constraint compliance is checked against the Analysis output

If all alternatives violate at least one hard constraint, the system does not produce a Recommendation. Instead, it surfaces a conflict resolution prompt: "All of your alternatives conflict with your stated hard constraints. Please review your constraints or add new alternatives."

### 12.3 Tie Detection

A tie is declared when two alternatives are genuinely indistinguishable on the dimensions that matter for the user's specific goal and constraints. A tie is not declared when:
- The AI is uncertain about which is better (that is low confidence, not a tie)
- One alternative is slightly better on most dimensions (that is a margin decision, not a tie)
- The decision comes down to personal preference (that is a values-based dimension, which is surfaced as a condition for change)

When a tie is declared, the output includes:
```json
{
  "tie_detected": true,
  "tie_explanation": "Option A and Option B perform identically against your stated goal of minimizing monthly cost within your €400 constraint. Both satisfy all your hard constraints. The difference comes down to setup time (Option A requires 2 weeks; Option B can be activated immediately) — which is more important to you determines the better choice.",
  "recommended_alternative_id": null
}
```

The UI surfaces this as a "These two options are nearly equal for your situation" state per H08 §9.

### 12.4 Recommendation Regeneration

A Recommendation can be regenerated without re-running the Analysis. This is useful when:
- The user wants to see the Recommendation framed differently
- The user has updated only the Goal (not the Alternatives) and wants to see how the Recommendation changes
- The Recommendation failed validation and requires a second attempt

Regeneration uses the existing Analysis output as input — it does not call the Analysis Engine again. The previous Recommendation is preserved in Version History per BR-05.

---

## 13. Multi-Model Support

### 13.1 Current State

DecisionOS currently uses a single AI model: `claude-sonnet-4-6` by Anthropic, accessed via direct HTTP fetch to `https://api.anthropic.com/v1/messages`. The model is called server-side only and is never exposed to the client.

### 13.2 Provider Abstraction

The AI integration is isolated to two locations:
- `core/ai/prompts.ts` — prompt construction (model-agnostic)
- `pages/api/decision/analyze.ts`, `pages/api/decision/chat.ts`, etc. — API calls (model-specific)

The prompt construction layer is already model-agnostic — it produces structured strings that can be sent to any language model. The API call layer contains the Anthropic-specific fetch logic.

This isolation means switching to a different provider or model requires changes only to the API call layer. The prompt content, output schemas, and validation logic are unchanged.

### 13.3 Provider Abstraction Layer (Post-MVP)

Post-MVP, the API call logic will be extracted into a provider abstraction:

```typescript
// lib/ai/provider.ts (post-MVP)
export interface AIProvider {
  complete(params: AICompletionParams): Promise<AICompletionResult>
}

export interface AICompletionParams {
  system: string
  user: string
  maxTokens: number
  model: string
}

export interface AICompletionResult {
  text: string
  inputTokens: number
  outputTokens: number
  model: string
}
```

The Anthropic implementation:
```typescript
// lib/ai/providers/anthropic.ts (post-MVP)
export class AnthropicProvider implements AIProvider {
  async complete(params: AICompletionParams): Promise<AICompletionResult> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: params.model,
        max_tokens: params.maxTokens,
        system: params.system,
        messages: [{ role: 'user', content: params.user }],
      }),
    })
    const data = await response.json()
    return {
      text: data.content.map((b: { text?: string }) => b.text || '').join(''),
      inputTokens: data.usage.input_tokens,
      outputTokens: data.usage.output_tokens,
      model: data.model,
    }
  }
}
```

### 13.4 Model Selection Strategy (Post-MVP)

When the provider abstraction is in place, the system can use different models for different engines:

| Engine | Rationale for different model |
|---|---|
| Analysis | Highest quality model — this is the highest-stakes output |
| Recommendation | Highest quality model — reasoning must be tight and referenced |
| Chat | A faster, less expensive model is acceptable — conversational responses do not require maximum reasoning depth |
| Interview — Suggestions | A fast, low-cost model — simple suggestion generation |
| Interview — Conflict | A fast, low-cost model — binary conflict detection |
| Action Plan | A mid-tier model — concrete and specific but not as analytically demanding as the Analysis |

This multi-model strategy is post-MVP. MVP uses `claude-sonnet-4-6` for all engines.

### 13.5 Fallback Strategy (Post-MVP)

When the primary model is unavailable (provider outage, rate limit), the system can fall back to a secondary provider. The fallback is transparent to the user — they see the standard "analysis taking longer than expected" message while the fallback runs.

The fallback decision is made at the API route level:

```typescript
// pages/api/decision/analyze.ts (post-MVP sketch)
try {
  result = await primaryProvider.complete(params)
} catch (primaryError) {
  console.error('[api/decision/analyze] Primary provider failed, attempting fallback', primaryError)
  result = await fallbackProvider.complete(params)
}
```

A fallback result is stored with a `prompt_version` that includes the provider name, so the switch is auditable.

---

## 14. AI Acceptance Criteria

These criteria define when the AI system is production-ready. They supplement H06 functional acceptance criteria and H10 TAC-05.

### AAC-01 — Analysis Engine

- [ ] Analysis completes within 30 seconds for 95% of test requests across all active categories
- [ ] Analysis output passes schema validation on first attempt for >90% of test inputs
- [ ] Every alternative in the input is present in the Analysis output (FR-03.3)
- [ ] Every AnalysisPoint in passing outputs has `specific_to_user = true`
- [ ] Financial category analysis always includes non-empty `market_data_caveat`
- [ ] Health category analysis always includes non-empty `professional_advice_disclaimer`
- [ ] `prompt_version` is stored in `decision_components.prompt_version` for every AI component

### AAC-02 — Recommendation Engine

- [ ] Recommendation never names an alternative that violates a hard constraint
- [ ] `primary_reasoning` in every valid output contains at least two references to specific user inputs
- [ ] `conditions_for_change` in every valid output is specific (>30 characters, names a concrete condition)
- [ ] `honest_tradeoffs` is non-empty in every valid output
- [ ] Tie is detected in 100% of purpose-built test inputs where two alternatives are objectively equal
- [ ] Tie is not declared in purpose-built inputs where one alternative is clearly superior

### AAC-03 — Action Plan Engine

- [ ] Action Plan always contains 3–5 items (no more, no fewer)
- [ ] Each item is specific to the chosen alternative, not generic to the category
- [ ] Action Plan is generated for the chosen alternative when it differs from the Recommendation (BR-03)
- [ ] Action Plan items are sequenced by logical dependency

### AAC-04 — Chat Engine

- [ ] Chat opens pre-loaded with full Decision Object context on every session (FR-07.2)
- [ ] Chat is accessible only in `draft`, `waiting_for_user`, and `decision_made` states (FR-07.1)
- [ ] Failed Chat responses are not stored in `decision_chat_messages` (FR-07.7)
- [ ] Material change detection triggers the formal update prompt in 4/5 test cases with material new information
- [ ] Chat history persists across sessions (FR-07.3)

### AAC-05 — Safety and Guardrails

- [ ] Values-based decision inputs trigger the values-clarification output instead of a standard Recommendation
- [ ] All four professional advice disclaimers are non-empty in the relevant categories
- [ ] Hard constraint enforcement: purpose-built inputs where all alternatives violate a hard constraint produce a conflict resolution prompt, not a Recommendation
- [ ] Prompt injection test inputs do not alter AI behavior in any engine

### AAC-06 — Failure Handling

- [ ] AI timeout leaves the Decision Object in `draft` state, not `in_analysis` (simulated test)
- [ ] Provider error produces the H08 §17 AI failure screen, not an unhandled exception
- [ ] Two consecutive validation failures produce the analysis failure state, not infinite regeneration
- [ ] All AI failure events are logged with `decision_id`, `engine`, `failure_category`, `prompt_version`

### AAC-07 — Quality Baseline

Before production launch, manually review 10 Analysis + Recommendation pairs per active category:

- [ ] All 10 analyses per category have `specific_to_user = true` on all points without manual regeneration
- [ ] All 10 recommendations reference specific user inputs in `primary_reasoning`
- [ ] All 10 recommendations have non-empty, specific `conditions_for_change`
- [ ] Financial category: all 10 have non-empty `market_data_caveat`
- [ ] Team Recommendation Acceptance Rate in internal testing is 55–85% (within target range from H10)

---

*DecisionOS Company Handbook | H11 — AI System Specification*
*Version 1.0 Final | Status: Frozen*
*Owner: Founding Team | Next review: Q4 2026*
