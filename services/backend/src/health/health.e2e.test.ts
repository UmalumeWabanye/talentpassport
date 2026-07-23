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
  LOG_LEVEL: 'info',
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