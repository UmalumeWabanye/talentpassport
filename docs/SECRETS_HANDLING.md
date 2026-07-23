# Secrets Handling

## Purpose
Define secure handling rules for credentials and sensitive configuration.

## Rules
- Never commit real secrets to source control.
- Use example env files only for non-sensitive placeholders.
- Store runtime secrets in deployment platform secret managers.
- Rotate JWT and provider secrets on schedule and after incidents.
- Restrict secrets access to minimum required maintainers and services.

## Local Development
- Copy from .env.local.example into a non-committed .env.local file.
- Use local-only credentials with least privilege.
- Do not reuse staging or production credentials locally.

## Staging and Production
- Store secrets in platform-managed secret stores (Vercel, Railway, GitHub Actions secrets).
- Apply per-environment secret isolation.
- Enforce secret changes through audited procedures.

## CI/CD Guidance
- Use GitHub Actions encrypted secrets for pipeline credentials.
- Never print full secret values in logs.
- Use masked environment output and scoped tokens.

## Incident Response
- Revoke and rotate exposed credentials immediately.
- Audit affected systems and deployment history.
- Document timeline, impact, and preventive action.
