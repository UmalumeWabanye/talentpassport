import { describe, expect, it } from 'vitest';

import { parseEnv } from './env';

describe('parseEnv', () => {
  it('parses a valid environment', () => {
    const env = parseEnv({
      NODE_ENV: 'development',
      LOG_LEVEL: 'info',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talent_passport',
      DATABASE_URL_POOLED: 'postgresql://postgres:postgres@localhost:5432/talent_passport',
      DIRECT_URL: 'postgresql://postgres:postgres@localhost:5432/talent_passport',
      REDIS_URL: 'redis://localhost:6379',
      AUTH_PROVIDER: 'clerk',
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
      JWT_ACCESS_TTL_SECONDS: '900',
      JWT_REFRESH_TTL_SECONDS: '604800',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NEXT_PUBLIC_API_URL: 'http://localhost:4000/api/v1'
    });

    expect(env.AUTH_PROVIDER).toBe('clerk');
    expect(env.NODE_ENV).toBe('development');
  });

  it('fails fast on missing required values', () => {
    expect(() =>
      parseEnv({
        NODE_ENV: 'development',
        LOG_LEVEL: 'info',
        DATABASE_URL: '',
        DATABASE_URL_POOLED: 'postgresql://postgres:postgres@localhost:5432/talent_passport',
        DIRECT_URL: 'postgresql://postgres:postgres@localhost:5432/talent_passport',
        REDIS_URL: 'redis://localhost:6379',
        AUTH_PROVIDER: 'clerk',
        JWT_ACCESS_SECRET: 'access-secret',
        JWT_REFRESH_SECRET: 'refresh-secret',
        JWT_ACCESS_TTL_SECONDS: '900',
        JWT_REFRESH_TTL_SECONDS: '604800',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_API_URL: 'http://localhost:4000/api/v1'
      }),
    ).toThrow('Invalid environment configuration');
  });
});
