import { defineConfig, env } from 'prisma/config';

const defaultDatabaseUrl = 'postgresql://postgres:postgres@localhost:5432/talent_passport?schema=public';

export default defineConfig({
  schema: 'schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? defaultDatabaseUrl
  }
});