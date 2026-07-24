# Security Baseline Headers

## Epic 7.1 Coverage
This document captures web security baseline controls applied at the backend bootstrap layer.

## Implemented Controls
- Helmet middleware enabled with hardened defaults.
- HSTS enabled (`max-age=31536000`, includeSubDomains, preload).
- Strict referrer policy (`no-referrer`).
- `X-Content-Type-Options: nosniff` enabled.
- Frame guard via `X-Frame-Options` enabled.

## Validation
- Header assertions are covered in `services/backend/src/health/health.e2e.test.ts`.
- CORS allowlist behavior (allowed and blocked origin paths) is covered in e2e tests.
