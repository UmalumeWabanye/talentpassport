import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_URL_POOLED: z.string().min(1).optional(),
  DIRECT_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  AUTH_PROVIDER: z.enum(['clerk', 'authjs']).default('clerk'),
  AUTH_ADMIN_EMAILS: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(604800),
  STORAGE_PROVIDER: z.enum(['local']).default('local'),
  STORAGE_BUCKET: z.string().min(1).default('talent-passport-dev'),
  STORAGE_SIGNING_SECRET: z.string().min(1).default('local-storage-signing-secret'),
  STORAGE_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  STORAGE_MAX_FILE_SIZE_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),
  STORAGE_ALLOWED_MIME_TYPES: z.string().min(1).default('application/pdf,image/png,image/jpeg,text/plain,text/csv'),
  STORAGE_PUBLIC_BASE_URL: z.string().url('STORAGE_PUBLIC_BASE_URL must be a valid URL').optional(),
  CORS_ALLOWED_ORIGINS: z.string().min(1).default('http://localhost:3000'),
  COOKIE_SECURE: z.enum(['true', 'false']).default('false'),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  CSRF_ENABLED: z.enum(['true', 'false']).default('false'),
  CSRF_HEADER_NAME: z.string().min(1).default('x-csrf-token'),
  CSRF_ALLOWED_ORIGINS: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  NEXT_PUBLIC_API_URL: z.string().url('NEXT_PUBLIC_API_URL must be a valid URL')
});

export type AppEnv = z.infer<typeof envSchema>;

export function parseEnv(input: Record<string, string | undefined>): AppEnv {
  const parsed = envSchema.safeParse(input);

  if (!parsed.success) {
    const message = parsed.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${message}`);
  }

  return parsed.data;
}
