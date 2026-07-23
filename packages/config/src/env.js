import { z } from 'zod';
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
    AUTH_PROVIDER: z.enum(['clerk', 'authjs']).default('clerk'),
    JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
    JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
    NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
    NEXT_PUBLIC_API_URL: z.string().url('NEXT_PUBLIC_API_URL must be a valid URL')
});
export function parseEnv(input) {
    const parsed = envSchema.safeParse(input);
    if (!parsed.success) {
        const message = parsed.error.errors
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join('; ');
        throw new Error(`Invalid environment configuration: ${message}`);
    }
    return parsed.data;
}
//# sourceMappingURL=env.js.map