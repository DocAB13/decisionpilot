# DecisionOS — Claude Code Working Instructions

## Project

**Product:** DecisionOS
**Repository:** `github.com/DocAB13/decisionpilot`

## Team Roles

| Role | Person |
|---|---|
| Founder | User |
| Chief Product Architect & Product Manager | ChatGPT |
| Implementation Engineer | Claude Code |

## Source of Truth

- **Handbook** (`DecisionOS/Company Handbook/`) — frozen architecture, design system, database spec, API spec, AI spec. Never deviate from it.
- **IR01** (`DecisionOS/Implementation Reports/IR01 - MVP Implementation Roadmap.md`) — defines implementation order and task scope.
- **Audit** (`DecisionOS/Audit/DecisionOS_Codebase_Audit.md`) — documents existing codebase state.

## Working Rules

1. The Handbook is the single source of truth. Follow it exactly.
2. IR01 defines implementation order. Do not skip or reorder tasks.
3. Never redesign existing architecture. Build what the Handbook specifies.
4. Reuse existing code whenever possible. Do not duplicate.
5. Implement only one IR01 task at a time.
6. Make the smallest possible change that satisfies the task acceptance criteria.
7. Run verification after every task (build, tests, or as specified in IR01).
8. Commit after every completed task with the IR01 task ID in the message.
9. Stop and wait for approval before the next task.
10. Never continue automatically to the next IR01 task.

## Response Format

After each task, respond only with:

- **Verification** — what was run and the result
- **Files changed** — list of created or modified files
- **Commit** — hash and message
- **Waiting for approval**
