# CSRF Test Coverage

## Scope
Epic 7.1 baseline CSRF protection where applicable.

## Strategy
- CSRF enforcement is controlled by `CSRF_ENABLED`.
- For unsafe methods (`POST`, `PUT`, `PATCH`, `DELETE`):
  - `Origin` must be in `CSRF_ALLOWED_ORIGINS`.
  - CSRF header (default: `x-csrf-token`) must be present.
- Safe methods (`GET`, `HEAD`, `OPTIONS`) bypass CSRF checks.

## Current Test Coverage
- Baseline e2e tests run with `CSRF_ENABLED=false` to preserve existing auth/storage contract tests.
- Middleware behavior is covered by dedicated unit test scenarios in future hardening phases when cookie/session issuance is wired for browser-auth flows.

## Operational Guidance
- Keep `CSRF_ENABLED=true` for browser clients in staging/production.
- Keep `CSRF_ALLOWED_ORIGINS` scoped to trusted frontend origins only.
