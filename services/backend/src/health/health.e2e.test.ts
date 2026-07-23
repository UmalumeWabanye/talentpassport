import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../app.module';
import { configureApp } from '../bootstrap/configure-app';

const testEnv = {
  AUTH_PROVIDER: 'clerk',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talent_passport',
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
      logger: false
    });
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();

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
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('backend');
    expect(response.body.environment).toBe('test');
    expect(response.body.version).toBe('v1');
  });
});