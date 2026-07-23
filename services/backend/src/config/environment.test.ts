import { describe, expect, it } from 'vitest';

import { getBackendEnv } from './environment';

describe('getBackendEnv', () => {
  it('parses a valid backend env', () => {
    const env = getBackendEnv({
      NODE_ENV: 'development',
      LOG_LEVEL: 'info',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talent_passport',
      DATABASE_URL_POOLED: 'postgresql://postgres:postgres@localhost:5432/talent_passport',
      DIRECT_URL: 'postgresql://postgres:postgres@localhost:5432/talent_passport',
      REDIS_URL: 'redis://localhost:6379',
      AUTH_PROVIDER: 'clerk',
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NEXT_PUBLIC_API_URL: 'http://localhost:4000/api/v1'
    });

    expect(env.NODE_ENV).toBe('development');
  });

  it('throws when required values are missing', () => {
    expect(() =>
      getBackendEnv({
        NODE_ENV: 'development',
        LOG_LEVEL: 'info',
        DATABASE_URL: '',
        DATABASE_URL_POOLED: 'postgresql://postgres:postgres@localhost:5432/talent_passport',
        DIRECT_URL: 'postgresql://postgres:postgres@localhost:5432/talent_passport',
        REDIS_URL: 'redis://localhost:6379',
        AUTH_PROVIDER: 'clerk',
        JWT_ACCESS_SECRET: 'access-secret',
        JWT_REFRESH_SECRET: 'refresh-secret',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_API_URL: 'http://localhost:4000/api/v1'
      }),
    ).toThrow('Invalid environment configuration');
  });
});
