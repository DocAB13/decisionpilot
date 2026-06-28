# H13 — API Specification
**DecisionOS Company Handbook**
*Version 1.0 Final | June 2026*
*Status: Frozen*

---

## Preamble

This document is the complete specification for every API endpoint in DecisionOS. It is the definitive reference for frontend engineers consuming the API, backend engineers implementing it, and QA engineers testing it.

Each endpoint is documented with its purpose, authentication requirements, request format, response format, all possible error responses, status codes, and a worked example. An engineer who has read only this document and H12 (Database Specification) should be able to implement any endpoint from scratch without consulting any other source.

This specification covers the **target MVP API** as defined in H09 §4 and H09 §8. Endpoints currently in transition (being migrated from legacy paths) are noted with their current and target paths.

**Base URL:** `https://decisionpilot.tech`

**Transport:** All endpoints require HTTPS. HTTP is rejected.

**Format:** All request and response bodies are JSON (`Content-Type: application/json`), except `POST /api/billing/webhook` which receives a raw body.

**Authentication:** Session cookies issued by Supabase Auth. The `@supabase/ssr` middleware refreshes tokens on every request. Endpoints that require authentication return `401` if no valid session exists.

Before reading H13, engineers should be familiar with:
- **H06 FR-01 through FR-11** — functional requirements each endpoint implements
- **H09 §6** — API conventions (method guard, auth check, validation, error format)
- **H10 §6** — API coding conventions
- **H12** — database tables and schemas that endpoints read and write

---

## 1. API Conventions

### 1.1 Request Structure

Every mutating endpoint (`POST`, `PUT`, `DELETE`) receives a JSON body. Query parameters are used only for filtering and pagination on `GET` endpoints.

### 1.2 Response Structure

**Success:** JSON body with the relevant resource at the top level. No `data` wrapper.

**Error:** Always `{ "error": "Human-readable message" }`. Error messages are safe to display to users — they do not expose stack traces, database errors, or internal identifiers.

### 1.3 Status Code Summary

| Code | Meaning |
|---|---|
| `200` | Success with body |
| `201` | Created — new resource returned |
| `204` | Success, no body |
| `400` | Invalid or missing input |
| `401` | Not authenticated |
| `403` | Authenticated but forbidden (used only for non-resource operations) |
| `404` | Not found, or resource exists but belongs to another user |
| `405` | HTTP method not allowed |
| `409` | Conflict (e.g., invalid state transition) |
| `429` | Rate limited |
| `500` | Internal server error |
| `503` | External service unavailable |

### 1.4 The 404-for-Unauthorized Rule

When an authenticated user requests a resource that exists but belongs to another user, the API returns `404` — not `403`. Returning `403` would confirm the resource exists, leaking information. `404` is indistinguishable from a genuinely missing resource. (H10 §6.3)

### 1.5 Handler Structure

Every endpoint follows this exact execution order (H10 §5.2):

```
1. Method guard   → 405 if wrong method
2. Auth check     → 401 if not authenticated (protected routes)
3. Input validate → 400 if required fields missing or invalid
4. Ownership verify → 404 if resource belongs to another user
5. Business logic → wrapped in try/catch
6. Response       → 200/201/204 on success, 500 on unexpected exception
```

---

## 2. Authentication Endpoints

### 2.1 `GET /api/auth/callback`

**Purpose:** Processes the Supabase email confirmation link. Exchanges the one-time code for a session. Claims any anonymous Decision Objects the user created before confirming their email. Redirects the user to their intended destination.

**Authentication:** None required. This endpoint is called by Supabase's email confirmation link.

**Request:**

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| `code` | Query string | `string` | Yes | One-time code from Supabase email link |
| `return` | Query string | `string` | No | URL to redirect to after confirmation. Defaults to `/dashboard`. |

**Example request:**
```
GET /api/auth/callback?code=abc123xyz&return=/decision/some-uuid
```

**Success response:** HTTP redirect (302). No JSON body.

| Condition | Redirect destination |
|---|---|
| `return` query param present and valid | `return` value |
| No `return` param | `/dashboard` |
| Code exchange fails | `/auth/login?error=confirmation_failed` |

**Anonymous token claim mechanism:** The `anonymous_token` is stored by the browser in `localStorage` (returned by `POST /api/decision/create`). Because `callback.ts` is a server-side route and cannot read `localStorage`, the frontend is responsible for copying the `anonymous_token` into a short-lived HTTP cookie named `anon_decision_token` before any navigation that passes through the callback (specifically: before the user submits the signup form). The callback reads this cookie server-side, performs the claim, and then clears the cookie. If no cookie is present, the claim step is skipped — the user can still claim their anonymous Decision client-side after being redirected to the dashboard, by calling `POST /api/decision/create` with the `anonymous_token` field.

**Processing steps:**
1. Call `supabase.auth.exchangeCodeForSession(code)`
2. If exchange fails → redirect to `/auth/login?error=confirmation_failed`
3. If exchange succeeds and the `anon_decision_token` cookie is present:
   - Read `$token` from the `anon_decision_token` cookie
   - Claim anonymous Decision Objects: `UPDATE decisions SET owner_id = $userId, anonymous_token = NULL, expires_at = NULL WHERE anonymous_token = $token AND expires_at > now()`
   - Clear the `anon_decision_token` cookie from the response
4. Redirect to `return` param or `/dashboard`

**Error responses:**

| Status | Error | Condition |
|---|---|---|
| 302 | Redirect to `/auth/login?error=confirmation_failed` | Code is invalid or expired |

**Notes:** The code expires after Supabase's default expiry (typically 1 hour). Users who click a link more than 1 hour after receiving the email receive a redirect to the login page with the error parameter.

---

## 3. Decision Endpoints

### 3.1 `POST /api/decision/create`

**Purpose:** Creates a new Decision Object. Supports both authenticated and anonymous users. For anonymous users, generates an `anonymous_token` returned to the client for storage in `localStorage`. The client must also copy this token to the `anon_decision_token` cookie (see §2.1) before any navigation that passes through the auth callback.

**Authentication:** Optional. Unauthenticated users receive an anonymous Decision Object.

**Request body:**

```typescript
{
  category: 'financial' | 'technology' | 'health' | 'travel' |
            'career' | 'insurance' | 'home' | 'education' | 'lifestyle'
  anonymous_token?: string  // If provided, associates with existing anon session
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `category` | `string` | Yes | Decision category. Constrained to nine valid values. |
| `anonymous_token` | `string` | No | If the client already has an anonymous token from a previous request in the same session, pass it here to prevent duplicate sessions. |

**Success response (authenticated user): `201 Created`**

```json
{
  "decision": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "category": "financial",
    "status": "draft",
    "title": null,
    "created_at": "2026-06-15T09:00:00.000Z",
    "updated_at": "2026-06-15T09:00:00.000Z"
  }
}
```

**Success response (anonymous user): `201 Created`**

```json
{
  "decision": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "category": "financial",
    "status": "draft",
    "title": null,
    "created_at": "2026-06-15T09:00:00.000Z",
    "updated_at": "2026-06-15T09:00:00.000Z",
    "expires_at": "2026-06-17T09:00:00.000Z"
  },
  "anonymous_token": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```

**Processing steps:**
1. If authenticated: verify user has fewer than 100 non-archived Decisions (FR-09.7)
2. If authenticated: `INSERT INTO decisions (owner_id, category, status) VALUES ($userId, $category, 'draft')`
3. If anonymous: generate `anonymous_token = gen_random_uuid()`. `INSERT INTO decisions (anonymous_token, category, status, expires_at) VALUES ($token, $category, 'draft', now() + interval '48 hours')`
4. Insert initial state transition: `from_status = NULL, to_status = 'draft', trigger = 'user_action'`
5. Return the created Decision

**Error responses:**

| Status | Error | Condition |
|---|---|---|
| `400` | `"category is required"` | `category` missing from body |
| `400` | `"Invalid category: [value]"` | `category` not in allowed list |
| `405` | (empty) | Method is not `POST` |
| `409` | `"You have reached the maximum of 100 active decisions..."` | Authenticated user at limit |
| `500` | `"Failed to create decision. Please try again."` | Database error |

**Example (authenticated):**
```bash
curl -X POST https://decisionpilot.tech/api/decision/create \
  -H "Content-Type: application/json" \
  -b "session-cookie=..." \
  -d '{"category": "financial"}'
```

---

### 3.2 `GET /api/decision/[id]`

**Purpose:** Fetches a single Decision Object with all current components.

**Authentication:** Required for owned Decisions. Anonymous Decisions require the `anonymous_token` query parameter.

**Request:**

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| `id` | Path | `uuid` | Yes | The Decision ID |
| `anonymous_token` | Query | `string` | Conditional | Required when fetching an anonymous Decision (no session cookie) |
| `include_history` | Query | `boolean` | No | If `true`, includes all non-current component versions. Default: `false`. |

**Example requests:**
```
GET /api/decision/550e8400-e29b-41d4-a716-446655440000
GET /api/decision/550e8400-e29b-41d4-a716-446655440000?anonymous_token=7c9e6679-...
GET /api/decision/550e8400-e29b-41d4-a716-446655440000?include_history=true
```

**Success response: `200 OK`**

```json
{
  "decision": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "category": "financial",
    "status": "waiting_for_user",
    "title": "Mortgage decision",
    "created_at": "2026-06-15T09:00:00.000Z",
    "updated_at": "2026-06-15T09:35:12.000Z",
    "components": {
      "1_context": {
        "version": 1,
        "content": { "background": "...", "current_situation": "..." },
        "updated_at": "2026-06-15T09:05:00.000Z"
      },
      "2_goal": {
        "version": 1,
        "content": { "primary": "..." },
        "updated_at": "2026-06-15T09:07:00.000Z"
      },
      "3_constraints": { "version": 1, "content": { "hard": [], "soft": [] }, "updated_at": "..." },
      "4_alternatives": { "version": 1, "content": { "alternatives": [] }, "updated_at": "..." },
      "5_ai_analysis": { "version": 1, "content": { }, "updated_at": "...", "prompt_version": "analysis-v1.0" },
      "6_risks": { "version": 1, "content": { }, "updated_at": "...", "prompt_version": "analysis-v1.0" },
      "7_recommendation": { "version": 1, "content": { }, "updated_at": "...", "prompt_version": "recommendation-v1.0" }
    },
    "state_transitions": [
      { "from_status": null, "to_status": "draft", "trigger": "user_action", "created_at": "..." },
      { "from_status": "draft", "to_status": "in_analysis", "trigger": "user_action", "created_at": "..." },
      { "from_status": "in_analysis", "to_status": "waiting_for_user", "trigger": "ai_completion", "created_at": "..." }
    ]
  }
}
```

When `include_history=true`, each component includes a `history` array of previous versions in addition to the current `content`.

**Processing steps:**
1. If no session and no `anonymous_token` → `401`
2. If `anonymous_token` provided: fetch Decision where `anonymous_token = $token`
3. If session: fetch Decision where `owner_id = $userId AND id = $decisionId`
4. If not found → `404`
5. Fetch current components (all rows with `is_current = true`)
6. Fetch state transitions ordered by `created_at asc`
7. If `include_history=true`: fetch all component versions grouped by component name
8. Return assembled Decision object

**Error responses:**

| Status | Error | Condition |
|---|---|---|
| `401` | `"Authentication required"` | No session and no anonymous_token |
| `404` | `"Decision not found"` | Decision doesn't exist, belongs to another user, or anonymous_token doesn't match |
| `405` | (empty) | Method is not `GET` |

---

### 3.3 `POST /api/decision/save`

**Purpose:** Saves a single Decision Object component. Implements the append-only version pattern — the existing current version is marked `is_current = false` and a new row is inserted. Also updates the parent Decision's `updated_at`.

**Authentication:** Required.

**Request body:**

```typescript
{
  decision_id: string   // UUID of the Decision
  component: string     // Component name from the client-writable list
  content: object       // Component content matching the component's schema (H12 §6.7)
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `decision_id` | `uuid` | Yes | The Decision this component belongs to. |
| `component` | `string` | Yes | One of the client-writable component identifiers. See lists below. |
| `content` | `object` | Yes | The component payload. Must match the H12 schema for this component. |

**Client-writable components:**
`0_identity`, `1_context`, `2_goal`, `3_constraints`, `4_alternatives`, `8_final_decision`, `10_outcome`, `11_reflection`, `12_lessons_learned`

**Server-generated components (client-write prohibited):**
Components `5_ai_analysis`, `6_risks`, `7_recommendation`, and `9_action_plan` are written exclusively by server-side AI engines (`/api/decision/analyze` and `/api/decision/state` when transitioning to `decision_made`). The route returns `400` if a client attempts to write any of these components directly. This restriction is enforced at the API route level before any database operation is attempted.

**Success response: `200 OK`**

```json
{
  "component": {
    "decision_id": "550e8400-e29b-41d4-a716-446655440000",
    "component": "1_context",
    "version": 2,
    "is_current": true,
    "created_at": "2026-06-15T09:05:30.000Z"
  }
}
```

**Processing steps (single transaction):**
1. Verify `decision_id` belongs to the authenticated user → `404` if not
2. Validate `component` is in the client-writable list → `400` if not
3. If `component` is in the server-generated list → `400` with specific error
4. Validate `content` schema for the specified component → `400` if invalid
5. BEGIN TRANSACTION
6. `UPDATE decision_components SET is_current = false WHERE decision_id = $id AND component = $component AND is_current = true`
7. Compute `next_version` = previous version number + 1 (or 1 if no previous row)
8. `INSERT INTO decision_components (decision_id, component, version, content, is_current) VALUES (..., true)`
9. `UPDATE decisions SET updated_at = now() WHERE id = $decision_id`
10. COMMIT

**Error responses:**

| Status | Error | Condition |
|---|---|---|
| `400` | `"decision_id is required"` | Missing field |
| `400` | `"component is required"` | Missing field |
| `400` | `"content is required"` | Missing field |
| `400` | `"Invalid component: [value]"` | Component not in client-writable list |
| `400` | `"Component [value] is server-generated and cannot be written by the client"` | Attempt to write `5_ai_analysis`, `6_risks`, `7_recommendation`, or `9_action_plan` |
| `400` | `"Invalid content for component [name]: [reason]"` | Content fails schema validation |
| `401` | `"Authentication required"` | No session |
| `404` | `"Decision not found"` | Decision doesn't exist or belongs to another user |
| `405` | (empty) | Method is not `POST` |
| `500` | `"Failed to save component. Please try again."` | Database error |

**Notes:** The auto-save in the Decision Wizard calls this endpoint after every input, debounced at 800ms (H09 §10.2). The route handles rapid successive calls gracefully — each call is a complete upsert operation. If calls are received faster than the database can process them for the same `(decision_id, component)` pair, the application's debounce prevents this in practice.

---

### 3.4 `POST /api/decision/analyze`

**Purpose:** Triggers AI analysis of a Decision Object. Transitions the Decision from `draft` to `in_analysis`, runs the Analysis Engine and Recommendation Engine, stores the results as components 5, 6, and 7, then transitions to `waiting_for_user`. If the Analysis Engine fails, the Decision reverts to `draft`. If the Recommendation Engine fails after the Analysis Engine has succeeded, the Analysis (components 5 and 6) is preserved and the Decision transitions to `waiting_for_user` without a Recommendation — per H10 §14.2.

**Authentication:** Required.

**Request body:**

```typescript
{
  decision_id: string  // UUID of the Decision to analyze
}
```

**Pre-conditions (validated before AI call):**
- Decision must be in `draft` state → `409` if not
- Decision must have component `4_alternatives` with at least 2 alternatives → `400` if not
- User must not have another analysis in progress for the same Decision → `409` if so

**Success response: `200 OK`**

```json
{
  "recommendation": {
    "recommended_alternative_id": "uuid",
    "recommended_alternative_name": "Option A",
    "primary_reasoning": "Based on your stated budget of €400/month and your goal of minimizing total cost over 3 years...",
    "confidence_level": "high",
    "confidence_rationale": "All input components are well-specified...",
    "conditions_for_change": "If your budget increases above €600/month, Option B becomes the stronger fit...",
    "honest_tradeoffs": "Option A requires a 24-month commitment; Option B offers more flexibility.",
    "tie_detected": false,
    "tie_explanation": null,
    "information_request": null
  },
  "analysis_confidence": "high",
  "decision_status": "waiting_for_user",
  "recommendation_available": true
}
```

**Partial success response (Analysis complete, Recommendation failed): `200 OK`**

When the Analysis Engine succeeds but the Recommendation Engine fails after two attempts, the Decision transitions to `waiting_for_user` with components 5 and 6 stored but component 7 absent. The response signals this state explicitly so the frontend can present an appropriate UI.

```json
{
  "recommendation": null,
  "analysis_confidence": "high",
  "decision_status": "waiting_for_user",
  "recommendation_available": false,
  "recommendation_error": "The recommendation could not be generated. Your analysis is saved. You can retry or proceed to review the analysis manually."
}
```

**Processing steps:**
1. Verify Decision ownership → `404`
2. Verify `status = 'draft'` → `409` with `"Decision must be in draft state to run analysis"`
3. Verify minimum 2 alternatives → `400`
4. Transition Decision to `in_analysis`; insert state transition row (`trigger = 'user_action'`)
5. Load all current components for the Decision
6. Build `DecisionAnalysisInput` from components
7. Call Analysis Engine (29-second timeout race)
8. If Analysis call fails or times out → revert Decision to `draft`; insert state transition (`trigger = 'system_event'`); return `503`
9. Validate Analysis output schema → if invalid, attempt one regeneration → if still invalid, revert to `draft` and return `503`
10. Store components `5_ai_analysis` and `6_risks` via the append-only save pattern
11. Call Recommendation Engine (29-second timeout race)
12. If Recommendation call fails or times out → transition Decision to `waiting_for_user` (do NOT revert to `draft`; Analysis is preserved per H10 §14.2); insert state transition (`trigger = 'ai_completion'`); return `200` with `recommendation_available: false`
13. Validate Recommendation output → if invalid, attempt one regeneration → if still invalid, follow step 12 behavior
14. Store component `7_recommendation`
15. Transition Decision to `waiting_for_user`; insert state transition (`trigger = 'ai_completion'`)
16. Return recommendation summary with `recommendation_available: true`

**Error responses:**

| Status | Error | Condition |
|---|---|---|
| `400` | `"decision_id is required"` | Missing field |
| `400` | `"At least 2 alternatives are required to run analysis"` | Fewer than 2 alternatives in component 4 |
| `401` | `"Authentication required"` | No session |
| `404` | `"Decision not found"` | Decision doesn't exist or belongs to another user |
| `405` | (empty) | Method is not `POST` |
| `409` | `"Decision must be in draft state to run analysis"` | Decision not in `draft` |
| `503` | `"The analysis did not complete. Your inputs are saved. Please try again."` | Analysis Engine failed or timed out |

**Note on partial success:** A `200` response with `recommendation_available: false` is not an error — it is a valid outcome. The user can view the per-alternative analysis (components 5 and 6) directly and retry the Recommendation via a dedicated UI action. Retry of the Recommendation Engine only (without re-running the Analysis Engine) is a post-MVP feature.

**Timeout behavior:** Both AI calls are wrapped in 29-second timeout races (H09 §7). Analysis timeout → revert to `draft`. Recommendation timeout → transition to `waiting_for_user` with `recommendation_available: false`.

**Infrastructure failure and FR-06.3:** If the Vercel serverless function is killed by the platform before the 29-second timeout fires (e.g., an infrastructure failure), the Decision may remain in `in_analysis` state indefinitely, violating FR-06.3 (no Decision may remain in `in_analysis` longer than 5 minutes). A Supabase pg_cron job must run every 5 minutes and revert any Decision stuck in `in_analysis` for longer than 5 minutes back to `draft`, inserting a state transition row with `trigger = 'system_event'`. The specification and implementation of this job are documented in H15 — Operations Handbook.

---

### 3.5 `POST /api/decision/state`

**Purpose:** Advances or reverts the Decision State. Enforces the valid state transitions defined in H03 §Decision States. Records the transition in `decision_state_transitions`. When transitioning to `decision_made`, triggers the Action Plan Engine synchronously and stores the resulting `9_action_plan` component before returning (FR-05.5).

**Authentication:** Required.

**Request body:**

```typescript
{
  decision_id: string
  to_status: 'draft' | 'decision_made' | 'executing' | 'completed' | 'archived'
  trigger: 'user_action'
}
```

**Valid user-initiated transitions (H03 and H06 FR-06.1):**

| From | To | When |
|---|---|---|
| `waiting_for_user` | `draft` | User chooses to update their inputs |
| `waiting_for_user` | `decision_made` | User records their Final Decision (component 8 must already be saved) |
| `decision_made` | `executing` | User confirms they are starting execution |
| `executing` | `completed` | User records an Outcome (component 10 must already be saved) |
| `completed` | `archived` | User archives the Decision |
| Any | `archived` | User archives from any state |

System-initiated transitions (`draft → in_analysis`, `in_analysis → waiting_for_user`, `in_analysis → draft`) are performed by `/api/decision/analyze` internally and cannot be requested via this endpoint.

**Pre-condition for `decision_made` transition:**
Component `8_final_decision` must already be saved (via `POST /api/decision/save`) before calling this endpoint with `to_status = 'decision_made'`. The route validates this and returns `409` if the component is absent.

**Success response: `200 OK`**

```json
{
  "decision": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "decision_made",
    "updated_at": "2026-06-17T14:22:09.000Z"
  },
  "transition": {
    "from_status": "waiting_for_user",
    "to_status": "decision_made",
    "trigger": "user_action",
    "created_at": "2026-06-17T14:22:09.000Z"
  },
  "action_plan": {
    "action_items": [
      {
        "sequence": 1,
        "title": "Contact three lenders",
        "detail": "Request a mortgage illustration for €320,000 over 25 years from your current bank, one online lender, and one specialist mortgage broker.",
        "estimated_effort": "medium",
        "time_estimate": "1–2 days",
        "completed": false
      }
    ]
  }
}
```

`action_plan` is present only when `to_status = 'decision_made'`. For all other transitions, `action_plan` is `null`.

**Processing steps:**
1. Verify Decision ownership → `404`
2. Validate `to_status` is in the allowed user-initiated transitions → `400`
3. Fetch current Decision status from DB
4. Validate the transition from current status to `to_status` is valid → `409`
5. If `to_status = 'decision_made'`: verify component `8_final_decision` is present and `is_current = true` → `409` if absent
6. BEGIN TRANSACTION
7. `UPDATE decisions SET status = $toStatus, updated_at = now() WHERE id = $decisionId`
8. `INSERT INTO decision_state_transitions (decision_id, from_status, to_status, trigger)`
9. COMMIT
10. If `to_status = 'decision_made'`: call Action Plan Engine with Decision context and chosen alternative from component 8; store result as `9_action_plan` component; include in response
11. If Action Plan Engine fails: log error; return `200` with `action_plan: null` and `action_plan_error: "The action plan could not be generated. The state transition was successful."`
12. Return response

**Error responses:**

| Status | Error | Condition |
|---|---|---|
| `400` | `"decision_id is required"` | Missing field |
| `400` | `"to_status is required"` | Missing field |
| `400` | `"Invalid to_status: [value]"` | Not a valid user-initiated target state |
| `401` | `"Authentication required"` | No session |
| `404` | `"Decision not found"` | Decision doesn't exist or belongs to another user |
| `405` | (empty) | Method is not `POST` |
| `409` | `"Invalid state transition: [from] → [to]"` | Transition not permitted |
| `409` | `"Final Decision must be recorded before advancing to decision_made"` | Component 8 absent when transitioning to `decision_made` |
| `500` | `"Failed to update state. Please try again."` | Database error on state update |

**Note on Action Plan failure:** If the Action Plan Engine call fails, the state transition has already committed to the database (step 6–9 completed). The Decision is correctly in `decision_made` state. The Action Plan is not retried automatically — the user can trigger a retry via a UI action, which calls this endpoint again with `to_status = 'decision_made'` if the state is still `decision_made` and component 9 is absent.

---

### 3.6 `POST /api/decision/chat`

**Purpose:** Sends a user Chat message to the AI Chat Engine and returns the AI response. Stores both the user message and AI response in `decision_chat_messages`. The full Decision Object context is reconstructed from the database on every call. If the AI call fails, neither message is stored.

**Authentication:** Required. Chat is a Pro tier feature (H06 FR-11.3).

**Request body:**

```typescript
{
  decision_id: string
  message: string       // The user's chat message
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `decision_id` | `uuid` | Yes | The Decision this Chat belongs to |
| `message` | `string` | Yes | The user's message. Maximum 1,000 characters (H11 §10.3). |

**Pre-conditions:**
- User must be on Pro or Premium tier (FR-11.3)
- Decision must be in `draft`, `waiting_for_user`, or `decision_made` state (FR-07.1)

**Success response: `200 OK`**

```json
{
  "response": "Based on your stated budget of €400/month, Option A satisfies your hard constraint while Option B would exceed it by approximately €80/month. The analysis weighted this heavily because you marked budget as a hard constraint.",
  "material_change_detected": false,
  "material_change_summary": null,
  "component_to_update": null,
  "message_id": "uuid-of-stored-user-message",
  "response_id": "uuid-of-stored-ai-response"
}
```

When material change is detected:
```json
{
  "response": "You mentioned your budget has actually increased to €600/month...",
  "material_change_detected": true,
  "material_change_summary": "Your available budget has changed from €400 to €600 per month. This would make Option B viable and could change the recommendation.",
  "component_to_update": "3_constraints",
  "message_id": "uuid",
  "response_id": "uuid"
}
```

**Processing steps:**
1. Verify Decision ownership → `404`
2. Verify user plan is Pro or Premium → `403` with `"AI Chat requires a Pro or Premium subscription"`
3. Verify Decision is in allowed state (`draft`, `waiting_for_user`, `decision_made`) → `409`
4. Sanitize message (H11 §10)
5. Fetch current Decision Object from database
6. Fetch last 20 Chat messages from `decision_chat_messages`
7. Build Chat system prompt from Decision Object
8. Call Chat Engine (AI API, 29-second timeout)
9. If AI call fails or times out → return `503`; store nothing (neither the user message nor the AI response is persisted)
10. BEGIN TRANSACTION — user message and AI response are inserted atomically. A partial exchange (user message without AI response) is structurally impossible: both rows commit together or neither does.
11. `INSERT INTO decision_chat_messages (decision_id, role, content) VALUES ($decisionId, 'user', $message)`
12. `INSERT INTO decision_chat_messages (decision_id, role, content) VALUES ($decisionId, 'assistant', $response)`
13. COMMIT
14. Return response

**Error responses:**

| Status | Error | Condition |
|---|---|---|
| `400` | `"decision_id is required"` | Missing field |
| `400` | `"message is required"` | Missing field |
| `400` | `"Message exceeds maximum length of 1000 characters"` | Message too long |
| `401` | `"Authentication required"` | No session |
| `403` | `"AI Chat requires a Pro or Premium subscription"` | User on Free tier |
| `404` | `"Decision not found"` | Decision doesn't exist or belongs to another user |
| `405` | (empty) | Method is not `POST` |
| `409` | `"Chat is not available for decisions in [status] state"` | Decision not in allowed state |
| `503` | `"The AI could not respond at this time. Please try again."` | AI call failed or timed out |

---

### 3.7 `GET /api/decision/chat/[id]`

**Purpose:** Fetches the full Chat history for a Decision Object, ordered chronologically.

**Authentication:** Required.

**Request:**

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| `id` | Path | `uuid` | Yes | The Decision ID |
| `limit` | Query | `integer` | No | Maximum messages to return. Default: 100. Maximum: 500. |
| `before` | Query | `uuid` | No | Message ID cursor for pagination. Returns messages older than this ID. |

**Example requests:**
```
GET /api/decision/chat/550e8400-e29b-41d4-a716-446655440000
GET /api/decision/chat/550e8400-e29b-41d4-a716-446655440000?limit=50
```

**Success response: `200 OK`**

```json
{
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "Why did you weight reliability so heavily?",
      "created_at": "2026-06-15T10:00:00.000Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "Your Context states that you've had two warranty failures in the past 3 years...",
      "created_at": "2026-06-15T10:00:05.000Z"
    }
  ],
  "total": 12,
  "has_more": false
}
```

**Error responses:**

| Status | Error | Condition |
|---|---|---|
| `401` | `"Authentication required"` | No session |
| `404` | `"Decision not found"` | Decision doesn't exist or belongs to another user |
| `405` | (empty) | Method is not `GET` |

---

### 3.8 `GET /api/decision/history`

**Purpose:** Returns a paginated list of Decision Objects for the authenticated user, suitable for the Dashboard and History views. Enforces the Free tier limit of 10 Decision Objects per FR-11.2 at the API level.

**Authentication:** Required.

**Request:**

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| `status` | Query | `string` | No | Filter by Decision State. Multiple values: `?status=draft&status=completed`. |
| `category` | Query | `string` | No | Filter by category. |
| `created_from` | Query | `ISO 8601` | No | Filter to Decisions created on or after this date. Example: `2026-01-01T00:00:00Z`. |
| `created_to` | Query | `ISO 8601` | No | Filter to Decisions created on or before this date. Example: `2026-06-30T23:59:59Z`. |
| `page` | Query | `integer` | No | Page number, 1-based. Default: `1`. |
| `limit` | Query | `integer` | No | Items per page. Default: `20`. Maximum: `50`. For Free tier users, the effective maximum is `10` regardless of this parameter. |
| `order` | Query | `'created_asc' \| 'created_desc' \| 'updated_desc'` | No | Sort order. Default: `'updated_desc'`. |

**Example requests:**
```
GET /api/decision/history
GET /api/decision/history?status=completed&page=1&limit=20
GET /api/decision/history?status=waiting_for_user&status=in_analysis
GET /api/decision/history?category=financial&order=created_desc
GET /api/decision/history?created_from=2026-01-01T00:00:00Z&created_to=2026-06-30T23:59:59Z
```

**Free tier enforcement (FR-11.2 — Business Rule):**

Free tier users may only access their most recent 10 Decision Objects. When a Free tier user calls this endpoint, the response is capped at 10 items ordered by `created_at desc`, regardless of the `page`, `limit`, or `order` parameters. The response includes a `plan_limit` flag to allow the frontend to surface an upgrade prompt per BR-06.

**Success response (Pro/Premium user): `200 OK`**

```json
{
  "decisions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "category": "financial",
      "status": "waiting_for_user",
      "title": "Mortgage comparison",
      "created_at": "2026-06-15T09:00:00.000Z",
      "updated_at": "2026-06-15T09:35:12.000Z",
      "summary": {
        "alternatives_count": 3,
        "has_recommendation": true,
        "outcome_satisfaction": null
      }
    }
  ],
  "total": 7,
  "page": 1,
  "limit": 20,
  "has_more": false,
  "plan_limit": false
}
```

**Success response (Free tier user): `200 OK`**

```json
{
  "decisions": [ ],
  "total": 10,
  "page": 1,
  "limit": 10,
  "has_more": false,
  "plan_limit": true
}
```

`plan_limit: true` signals that the user has more Decision Objects than the Free tier allows to be shown. The frontend uses this flag to display an upgrade prompt in context (per BR-06 — the prompt must not interrupt the Decision flow itself, only appear in the History/Dashboard view).

The `summary` object fields:
- `title`: taken from the `decisions.title` column. Set when the user names the Decision or when the API auto-derives it from the first alternative name in component `4_alternatives`. `null` until one of these conditions is met.
- `alternatives_count`: count from `4_alternatives` component if present, else `null`
- `has_recommendation`: `true` if component `7_recommendation` is present with `is_current = true`
- `outcome_satisfaction`: the `satisfaction_rating` from component `10_outcome` if present, else `null`

**Processing steps:**
1. Resolve user plan from `subscriptions` table (default `'free'` if no row)
2. If Free tier: override query to fetch the 10 most recent Decisions by `created_at desc`; set `plan_limit = (total_decisions_count > 10)`
3. If Pro/Premium: build query against `decisions` where `owner_id = $userId`
4. Apply `status` filter if provided
5. Apply `category` filter if provided
6. Apply `created_from` and `created_to` filters if provided
7. Apply `order` (ignored for Free tier — always `created_at desc`)
8. Count total matching rows for pagination metadata
9. Fetch paginated decision rows
10. For each Decision, fetch summary data from `decision_components` (single query with `IN (decision_id_list)`)
11. Return assembled response with `plan_limit` field

**Error responses:**

| Status | Error | Condition |
|---|---|---|
| `401` | `"Authentication required"` | No session |
| `400` | `"Invalid status: [value]"` | Status filter value not in allowed list |
| `400` | `"limit must be between 1 and 50"` | Limit out of range (ignored for Free tier) |
| `400` | `"Invalid created_from format"` | Not a valid ISO 8601 timestamp |
| `400` | `"Invalid created_to format"` | Not a valid ISO 8601 timestamp |
| `405` | (empty) | Method is not `GET` |

---

### 3.9 `DELETE /api/decision/[id]`

**Purpose:** Permanently deletes a Decision Object and all associated data (components, state transitions, chat messages) via `ON DELETE CASCADE`. Irreversible. Requires the Decision to belong to the authenticated user.

**Authentication:** Required.

**Request:**

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| `id` | Path | `uuid` | Yes | The Decision ID to delete |

**Success response: `204 No Content`**

No body. The Decision and all associated data are deleted.

**Processing steps:**
1. Verify Decision ownership → `404`
2. `DELETE FROM decisions WHERE id = $decisionId AND owner_id = $userId`
3. ON DELETE CASCADE removes all rows in `decision_components`, `decision_state_transitions`, `decision_chat_messages` for this Decision
4. Return `204`

**Error responses:**

| Status | Error | Condition |
|---|---|---|
| `401` | `"Authentication required"` | No session |
| `404` | `"Decision not found"` | Decision doesn't exist or belongs to another user |
| `405` | (empty) | Method is not `DELETE` |
| `500` | `"Failed to delete decision. Please try again."` | Database error |

**Note:** There is no `archived` state check — a Decision in any state can be deleted (BR-08). The confirmation dialog is a UI concern (H08 §12), not an API concern.

---

## 4. Billing Endpoints

### 4.1 `POST /api/billing/checkout`

**Purpose:** Creates a Stripe Checkout session for upgrading to Pro or Premium. Returns a URL that the client redirects to. The server never handles card data.

**Authentication:** Optional. The server resolves the authenticated user from the session cookie and attaches `user_id` as Stripe metadata. If no session exists, the metadata `user_id` field is omitted. The client never passes `user_id` in the request body.

**Current path:** Also available at `/api/create-checkout` (deprecated, migrating to `/api/billing/checkout`)

**Request body:**

```typescript
{
  plan: 'pro' | 'premium'
  return_path?: string // Path to return to after checkout (stored in success_url)
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `plan` | `string` | Yes | The plan to upgrade to. `'pro'` or `'premium'`. |
| `return_path` | `string` | No | URL path to append to the success redirect. Default: `/dashboard`. |

**Success response: `200 OK`**

```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Processing steps:**
1. Validate `plan` is `'pro'` or `'premium'` → `400` if not
2. Resolve `user_id` from the session cookie server-side: call `supabase.auth.getUser()`. If a valid session exists, `userId = user.id`. If no session, `userId = null`.
3. Select the correct Stripe Price ID from environment variables:
   - `'pro'` → `STRIPE_PRO_PRICE_ID`
   - `'premium'` → `STRIPE_PREMIUM_PRICE_ID`
4. Call `stripe.checkout.sessions.create()`:
   ```typescript
   {
     payment_method_types: ['card'],
     mode: 'subscription',
     line_items: [{ price: priceId, quantity: 1 }],
     success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&return=${return_path}`,
     cancel_url: `${origin}${return_path || '/'}`,
     allow_promotion_codes: true,
     billing_address_collection: 'auto',
     metadata: {
       user_id: userId ?? '',   // empty string when unauthenticated; webhook checks for non-empty
       plan: plan,
     },
   }
   ```
5. Return `{ url: session.url }`

**Error responses:**

| Status | Error | Condition |
|---|---|---|
| `400` | `"plan is required"` | Missing field |
| `400` | `"Invalid plan: [value]. Must be 'pro' or 'premium'"` | Plan not in allowed list |
| `405` | (empty) | Method is not `POST` |
| `500` | `"Failed to create checkout session. Please try again."` | Stripe API error |
| `503` | `"Payment service unavailable. Please try again."` | Stripe is unreachable |

---

### 4.2 `POST /api/billing/webhook`

**Purpose:** Receives and processes Stripe webhook events. Updates the `subscriptions` table based on payment events. This route uses `bodyParser: false` because Stripe requires the raw request body to validate the webhook signature.

**Authentication:** None. Authentication is via `stripe-signature` header verification using `STRIPE_WEBHOOK_SECRET`.

**Current path:** Also available at `/api/webhook` (deprecated, migrating to `/api/billing/webhook`)

**Request:**

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| `stripe-signature` | Header | `string` | Yes | Stripe webhook signature. Used to verify the request is from Stripe. |
| Body | Body | Raw bytes | Yes | Raw request body. Must not be parsed before signature verification. |

**Handled events:**

**`checkout.session.completed`** — A subscription payment was completed.

Processing:
1. Extract `metadata.user_id` and `metadata.plan` from the session
2. Extract `customer` and `subscription` from the session
3. If `user_id` is present and non-empty: upsert `subscriptions` table:
   ```sql
   INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan, status, updated_at)
   VALUES ($userId, $customerId, $subscriptionId, $plan, 'active', now())
   ON CONFLICT (user_id) DO UPDATE SET
     stripe_customer_id = excluded.stripe_customer_id,
     stripe_subscription_id = excluded.stripe_subscription_id,
     plan = excluded.plan,
     status = 'active',
     updated_at = now()
   ```
4. If `user_id` is absent or empty string: log the event for manual review; do not write to the database

**`customer.subscription.deleted`** — A subscription was cancelled (by the user or by Stripe for failed payment).

Processing:
1. Extract `customer` from the event
2. `UPDATE subscriptions SET plan = 'free', status = 'cancelled', updated_at = now() WHERE stripe_customer_id = $customerId`
3. If no row matches `stripe_customer_id`: log a warning; the subscription may have been created before the webhook infrastructure was in place

**Success response: `200 OK`**

```json
{ "received": true }
```

Stripe requires a `200` response to mark the webhook as processed. A non-`200` response causes Stripe to retry the event.

**Processing steps:**
1. Read raw body from request stream
2. Verify signature: `stripe.webhooks.constructEvent(rawBody, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET)`
3. If signature invalid → `400` with no body (do not return an error message that could aid in forgery attempts)
4. Switch on `event.type`
5. Process the relevant event
6. Return `200 { "received": true }`

**Error responses:**

| Status | Body | Condition |
|---|---|---|
| `400` | (empty) | Invalid Stripe signature — request rejected |
| `405` | (empty) | Method is not `POST` |
| `500` | `{ "error": "Webhook processing failed" }` | Database error during processing |

**Idempotency:** Stripe may deliver the same event multiple times if the webhook endpoint does not respond in time. The upsert pattern for `checkout.session.completed` and the conditional update for `customer.subscription.deleted` make all processing idempotent — processing the same event twice produces the same result.

---

## 5. Complete Endpoint Reference

### 5.1 Endpoint Summary Table

| Method | Path | Auth | Tier | Purpose |
|---|---|---|---|---|
| `GET` | `/api/auth/callback` | None | Any | Supabase email confirmation |
| `POST` | `/api/decision/create` | Optional | Any | Create a new Decision Object |
| `GET` | `/api/decision/[id]` | Optional* | Any | Fetch a Decision Object |
| `POST` | `/api/decision/save` | Required | Any | Save a client-writable Decision component |
| `POST` | `/api/decision/analyze` | Required | Any | Trigger AI analysis |
| `POST` | `/api/decision/state` | Required | Any | Advance Decision State; triggers Action Plan on `decision_made` |
| `POST` | `/api/decision/chat` | Required | Pro+ | Send a Chat message |
| `GET` | `/api/decision/chat/[id]` | Required | Pro+ | Fetch Chat history |
| `GET` | `/api/decision/history` | Required | Any† | List Decision Objects |
| `DELETE` | `/api/decision/[id]` | Required | Any | Delete a Decision Object |
| `POST` | `/api/billing/checkout` | Optional | Any | Create Stripe Checkout session |
| `POST` | `/api/billing/webhook` | None** | — | Stripe webhook handler |

*`GET /api/decision/[id]` for anonymous Decision Objects requires `anonymous_token` query param.
**Authenticated via Stripe signature header, not session cookie.
†Free tier users receive at most 10 results per FR-11.2; `plan_limit: true` is set in the response when this cap applies.

### 5.2 Deprecated Endpoints (During Migration)

These endpoints exist in the current codebase and remain active during the migration period defined in H09 §4. They will be removed in Sprint 2 when the target paths are fully deployed and confirmed.

| Deprecated path | Target path | Migration sprint |
|---|---|---|
| `POST /api/create-checkout` | `POST /api/billing/checkout` | Sprint 1 |
| `POST /api/webhook` | `POST /api/billing/webhook` | Sprint 1 |
| `POST /api/chat` | `POST /api/decision/chat` | Sprint 2 |
| `POST /api/compare` | Post-MVP | N/A |

---

## 6. Error Reference

### 6.1 Universal Errors

These errors can be returned by any endpoint:

| Status | Error | Cause |
|---|---|---|
| `405` | (empty body) | HTTP method not allowed |
| `500` | `"Something went wrong. Please try again."` | Unhandled exception |

### 6.2 Authentication Errors

| Status | Error | Endpoints |
|---|---|---|
| `401` | `"Authentication required"` | All protected endpoints |

### 6.3 Tier Enforcement Errors

| Status | Error | Condition |
|---|---|---|
| `403` | `"AI Chat requires a Pro or Premium subscription"` | Free user on `/api/decision/chat` |

Note: Tier enforcement returns `403` (not `401` or `404`) because the resource exists but access is gated on the subscription level, not on ownership or authentication. The Free tier history cap (FR-11.2) returns `200` with `plan_limit: true` rather than `403`, because the user does have access — the response is truncated, not blocked.

### 6.4 Decision-Specific Errors

| Status | Error | Endpoint | Cause |
|---|---|---|---|
| `400` | `"At least 2 alternatives are required to run analysis"` | `/api/decision/analyze` | BR-01 enforcement |
| `409` | `"Decision must be in draft state to run analysis"` | `/api/decision/analyze` | Decision not in `draft` |
| `409` | `"Invalid state transition: [from] → [to]"` | `/api/decision/state` | Transition not in allowed list |
| `409` | `"Final Decision must be recorded before advancing to decision_made"` | `/api/decision/state` | Component 8 absent |
| `409` | `"Chat is not available for decisions in [status] state"` | `/api/decision/chat` | FR-07.1 enforcement |
| `409` | `"You have reached the maximum of 100 active decisions..."` | `/api/decision/create` | FR-09.7 enforcement |

### 6.5 AI Errors

| Status | Error | Condition |
|---|---|---|
| `503` | `"The analysis did not complete. Your inputs are saved. Please try again."` | Analysis Engine failed or timed out |
| `503` | `"The AI could not respond at this time. Please try again."` | Chat AI call failed |
| `503` | `"Payment service unavailable. Please try again."` | Stripe unreachable |

Note: Recommendation Engine failure returns `200` (not `503`) with `recommendation_available: false`, because the Analysis is complete and the Decision has successfully transitioned to `waiting_for_user`. This is a partial success, not a service failure.

---

## 7. Security Constraints

### 7.1 Server-Side Only

All API routes execute server-side only. The following values never appear in client-side code or responses:
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

### 7.2 No Cross-User Data

Every query that accesses user data includes an ownership check, either via RLS (for requests using the `anon` key) or via explicit `AND owner_id = $userId` clauses (for queries using the `service_role` key). The behavior for unauthorized resource access is always `404`, never `403`.

### 7.3 Input Sanitization

All user-provided string fields that will be injected into AI prompts are passed through `sanitizeForPrompt()` (H11 §10) before any AI call. Fields that go only to the database are protected by Supabase SDK parameter binding, which prevents SQL injection.

### 7.4 Stripe Webhook Security

The webhook endpoint validates the `stripe-signature` header on every request. An invalid signature results in a `400` with no body. The raw request body is preserved using `bodyParser: false`. The Stripe webhook secret is rotated immediately if it is ever inadvertently exposed.

### 7.5 Rate Limiting

MVP does not implement application-level rate limiting. Vercel's serverless platform enforces function invocation limits. Anthropic's API enforces its own rate limits, returning `429` which the application surfaces as `503`. Explicit rate limiting per user or per IP is added post-MVP if abuse patterns emerge.

---

## 8. API Acceptance Criteria

These criteria confirm the API is production-ready. They extend H06 functional acceptance criteria and H09 TAC-04.

- [ ] Every endpoint returns `405` for unsupported HTTP methods
- [ ] Every protected endpoint returns `401` for requests with no session cookie
- [ ] `DELETE /api/decision/[id]` returns `404` for a Decision belonging to another authenticated user, not `403`
- [ ] `POST /api/billing/webhook` returns `400` (with empty body) for a request with an invalid `stripe-signature`
- [ ] `POST /api/decision/analyze` reverts the Decision to `draft` when the Analysis Engine times out (simulated); returns `200` with `recommendation_available: false` when the Recommendation Engine fails after Analysis succeeds
- [ ] `POST /api/decision/chat` returns `503` without storing any message when the AI call fails (verified by checking `decision_chat_messages` count before and after the failed call)
- [ ] `POST /api/decision/create` returns `409` when an authenticated user has 100 or more non-archived Decisions
- [ ] `POST /api/decision/state` returns `409` for the transition `completed → draft` (invalid reverse transition)
- [ ] `POST /api/decision/state` returns `409` when `to_status = 'decision_made'` and component `8_final_decision` is absent
- [ ] `POST /api/decision/state` with `to_status = 'decision_made'` returns `action_plan` in the response body when the Action Plan Engine succeeds
- [ ] All error responses are JSON `{ "error": "string" }` — no HTML error pages
- [ ] No API response includes a stack trace, database error message, or internal identifier beyond a Decision or User UUID
- [ ] `POST /api/decision/chat` returns `403` for a Free tier user
- [ ] `GET /api/decision/history` returns an empty `decisions` array (not a `404`) for an authenticated user with no Decision Objects
- [ ] `GET /api/decision/history` for a Free tier user with more than 10 Decisions returns exactly 10 items and `plan_limit: true`
- [ ] `GET /api/decision/history` for a Pro/Premium user returns up to 50 items and `plan_limit: false`
- [ ] `GET /api/decision/history?created_from=2026-01-01T00:00:00Z` filters correctly by creation date

---

*DecisionOS Company Handbook | H13 — API Specification*
*Version 1.0 Final | Status: Frozen*
*Owner: Founding Team | Next review: Q4 2026*
