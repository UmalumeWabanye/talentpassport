import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../app.module';
import { configureApp } from '../bootstrap/configure-app';

const testEnv = {
  AUTH_PROVIDER: 'clerk',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talent_passport',
  DATABASE_URL_POOLED: 'postgresql://postgres:postgres@localhost:5432/talent_passport',
  DIRECT_URL: 'postgresql://postgres:postgres@localhost:5432/talent_passport',
  JWT_ACCESS_SECRET: 'access-secret',
  JWT_REFRESH_SECRET: 'refresh-secret',
  STORAGE_PROVIDER: 'local',
  STORAGE_BUCKET: 'talent-passport-test',
  STORAGE_SIGNING_SECRET: 'test-storage-signing-secret',
  STORAGE_SIGNED_URL_TTL_SECONDS: '900',
  STORAGE_MAX_FILE_SIZE_BYTES: '10485760',
  STORAGE_ALLOWED_MIME_TYPES: 'application/pdf,image/png,image/jpeg,text/plain,text/csv',
  STORAGE_PUBLIC_BASE_URL: 'http://localhost:4000/api/v1',
  LOG_LEVEL: 'info',
  CORS_ALLOWED_ORIGINS: 'http://localhost:3000',
  COOKIE_SECURE: 'false',
  COOKIE_SAME_SITE: 'lax',
  CSRF_ENABLED: 'false',
  CSRF_HEADER_NAME: 'x-csrf-token',
  CSRF_ALLOWED_ORIGINS: 'http://localhost:3000',
  NEXT_PUBLIC_API_URL: 'http://localhost:4000/api/v1',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NODE_ENV: 'test',
  PORT: '4000',
  REDIS_URL: 'redis://localhost:6379'
} as const;

describe('Health endpoint', () => {
  let app: INestApplication;
  const originalEnv = { ...process.env };

  beforeAll(async () => {
    Object.assign(process.env, testEnv);

    app = await NestFactory.create(AppModule, {
      abortOnError: false,
      logger: false
    });
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    }

    Object.assign(process.env, originalEnv);
  });

  it('returns the versioned health response', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
    expect(response.body.data.service).toBe('backend');
    expect(response.body.data.environment).toBe('test');
    expect(response.body.data.version).toBe('v1');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('allows CORS for explicitly configured origins', async () => {
    const response = await request(app.getHttpServer())
      .options('/api/v1/health')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET');

    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('rejects CORS for unknown origins', async () => {
    const response = await request(app.getHttpServer())
      .options('/api/v1/health')
      .set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'GET');

    expect(response.status).toBe(500);
  });

  it('returns the database health response envelope', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health/db');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.service).toBe('database');
    expect(['degraded', 'ok']).toContain(response.body.data.status);
  });

  it('returns the redis health response envelope', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health/redis');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.service).toBe('redis');
    expect(['degraded', 'ok']).toContain(response.body.data.status);
  });
});