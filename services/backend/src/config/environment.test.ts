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
      JWT_ACCESS_TTL_SECONDS: '900',
      JWT_REFRESH_TTL_SECONDS: '604800',
      STORAGE_PROVIDER: 'local',
      STORAGE_BUCKET: 'talent-passport-test',
      STORAGE_SIGNING_SECRET: 'test-storage-signing-secret',
      STORAGE_SIGNED_URL_TTL_SECONDS: '900',
      STORAGE_MAX_FILE_SIZE_BYTES: '10485760',
      STORAGE_ALLOWED_MIME_TYPES: 'application/pdf,image/png,image/jpeg,text/plain,text/csv',
      STORAGE_PUBLIC_BASE_URL: 'http://localhost:4000/api/v1',
      CORS_ALLOWED_ORIGINS: 'http://localhost:3000',
      COOKIE_SECURE: 'false',
      COOKIE_SAME_SITE: 'lax',
      CSRF_ENABLED: 'false',
      CSRF_HEADER_NAME: 'x-csrf-token',
      CSRF_ALLOWED_ORIGINS: 'http://localhost:3000',
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
        JWT_ACCESS_TTL_SECONDS: '900',
        JWT_REFRESH_TTL_SECONDS: '604800',
        STORAGE_PROVIDER: 'local',
        STORAGE_BUCKET: 'talent-passport-test',
        STORAGE_SIGNING_SECRET: 'test-storage-signing-secret',
        STORAGE_SIGNED_URL_TTL_SECONDS: '900',
        STORAGE_MAX_FILE_SIZE_BYTES: '10485760',
        STORAGE_ALLOWED_MIME_TYPES: 'application/pdf,image/png,image/jpeg,text/plain,text/csv',
        STORAGE_PUBLIC_BASE_URL: 'http://localhost:4000/api/v1',
        CORS_ALLOWED_ORIGINS: 'http://localhost:3000',
        COOKIE_SECURE: 'false',
        COOKIE_SAME_SITE: 'lax',
        CSRF_ENABLED: 'false',
        CSRF_HEADER_NAME: 'x-csrf-token',
        CSRF_ALLOWED_ORIGINS: 'http://localhost:3000',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NEXT_PUBLIC_API_URL: 'http://localhost:4000/api/v1'
      }),
    ).toThrow('Invalid environment configuration');
  });
});
