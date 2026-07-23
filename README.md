# Talent Passport

Phase-locked monorepo for the Talent Passport platform.

## Current Focus
- Active phase: Phase 01 Foundation
- Source of truth: phases/PHASE_01_FOUNDATION.md
- Task board: docs/PHASE_01_EXECUTION_TRACKER.md

## Workspace Layout
- apps/
- packages/
- services/
- database/
- docs/
- .github/

## Quick Start
1. Install Node.js 20+
2. Enable pnpm
3. Install dependencies
4. Run quality gates

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Ground Rules
- Follow DEVELOPMENT_RULES.md
- Do not implement future-phase features
- Prioritize completeness, quality, and security over speed
