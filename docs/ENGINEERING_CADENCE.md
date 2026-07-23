# Engineering Cadence

Status: Active
Applies to: Phase 01 Foundation
Primary tracker: docs/PHASE_01_EXECUTION_TRACKER.md

## Purpose
Define a repeatable operating rhythm that prioritizes completeness, quality, and security over speed.

## Non-Negotiables
- Follow the active phase PRD only.
- Do not implement future-phase capabilities.
- Do not leave partially completed tasks.
- Do not mark work complete without evidence.
- Keep docs, tests, and implementation synchronized.

## Weekly Rhythm

### Monday - Plan and Scope Lock
1. Review active PRD requirements.
2. Select a limited set of tracker tasks for the week.
3. Confirm no selected work is out-of-scope.
4. Define acceptance evidence per task.

Deliverables:
- Weekly task list linked to tracker items
- Explicit out-of-scope confirmation

### Tuesday to Thursday - Build and Verify
1. Execute tasks one-by-one in tracker order.
2. Run lint, typecheck, tests after major increments.
3. Refactor continuously to preserve code quality.
4. Update docs immediately after behavior changes.

Daily end-of-day checks:
- Completed tasks have evidence attached.
- In-progress tasks include blockers and next action.
- No hidden TODOs in core functionality.

### Friday - Integration and Quality Gate
1. Run full workspace quality gates.
2. Validate security baseline controls.
3. Validate container and CI workflow behavior.
4. Reconcile documentation with implementation.

Deliverables:
- Weekly quality report
- Updated tracker statuses
- Risks and technical debt log

## Daily Execution Loop
1. Pick one task from the tracker.
2. Implement the minimum complete solution.
3. Add or update tests.
4. Run verification commands.
5. Record evidence.
6. Move to next task only after completion.

## Required Verification Commands
Use these categories at minimum (exact commands depend on tooling):
- Install
- Lint
- Typecheck
- Unit tests
- Integration tests
- Build
- Container startup

## Evidence Standard
A task can be marked complete only when it includes:
- Code merged for the scoped requirement
- Test proof relevant to the change
- Build/lint/typecheck pass proof
- Documentation update proof (if applicable)

Accepted evidence examples:
- CI run link
- Terminal output snippet
- API docs artifact
- Security check output

## Pull Request Standard
Every PR should:
- Map changes to specific tracker tasks
- Declare out-of-scope exclusions explicitly
- Include test and verification evidence
- Include security considerations
- Include rollback or mitigation notes if risk exists

## Definition of Done Enforcement
At least once per week, run a DoD review against:
- phases/PHASE_01_FOUNDATION.md
- docs/PHASE_01_EXECUTION_TRACKER.md

If any DoD item is missing, Phase 01 remains open.

## Blocker Management
When blocked:
1. Record blocker in tracker notes.
2. Record impact and affected tasks.
3. Propose the smallest safe unblock path.
4. Resume phased execution immediately after unblock.

## Quality Escalation Rules
Escalate and pause new implementation when any of the following occurs:
- Repeated failing tests with unclear root cause
- Security control regression
- Cross-tenant boundary risk
- CI instability across multiple runs

Priority during escalation:
1. Restore correctness and safety.
2. Re-establish deterministic tests.
3. Resume feature work.

## End-of-Phase Protocol
When all tracker tasks and DoD items are complete:
1. Stop adding new features.
2. Produce the completion report from tracker template.
3. Wait for Phase 02 PRD before any additional implementation.
