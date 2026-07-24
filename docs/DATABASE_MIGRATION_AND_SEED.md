# Database Migration And Seed Workflow

## Migration Policy
- Keep Prisma schema changes in `database/prisma/schema.prisma`.
- Generate a committed SQL migration for every schema change.
- Review the generated SQL before merging.
- Apply committed migrations with `pnpm --filter @talent-passport/backend db:migrate:deploy`.
- Check migration status with `pnpm --filter @talent-passport/backend db:migrate:status`.

## Rollback And Recovery
- For local resets, use `pnpm --filter @talent-passport/backend db:migrate:reset`.
- If a migration must be rolled back in shared environments, add a forward-fixing migration instead of editing past SQL.
- Keep the schema file and migration history aligned; do not hand-edit generated Prisma metadata.

## Seed Workflow
- Seed data is deterministic and idempotent.
- Run the seed script with `pnpm --filter @talent-passport/backend db:seed`.
- Seed data creates base permissions, roles, a starter organization, and starter users/memberships for local and test environments.

## Cold Start Notes
- Generate Prisma client first.
- Apply migrations.
- Run the seed script.
- Verify backend health and auth tests before moving forward.
