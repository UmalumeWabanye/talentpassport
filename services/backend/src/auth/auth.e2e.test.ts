import 'reflect-metadata';

import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../app.module';
import { configureApp } from '../bootstrap/configure-app';

const testEnv = {
  AUTH_PROVIDER: 'authjs',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/talent_passport',
  DATABASE_URL_POOLED: 'postgresql://postgres:postgres@localhost:5432/talent_passport',
  DIRECT_URL: 'postgresql://postgres:postgres@localhost:5432/talent_passport',
  JWT_ACCESS_SECRET: 'access-secret',
  JWT_ACCESS_TTL_SECONDS: '120',
  JWT_REFRESH_SECRET: 'refresh-secret',
  JWT_REFRESH_TTL_SECONDS: '600',
  LOG_LEVEL: 'info',
  NEXT_PUBLIC_API_URL: 'http://localhost:4000/api/v1',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NODE_ENV: 'test',
  PORT: '4000',
  REDIS_URL: 'redis://localhost:6379'
} as const;

describe('Auth endpoint', () => {
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

  it('supports register, token issue, profile, refresh, and logout flow', async () => {
    const email = 'auth-user@example.com';
    const password = 'strong-password';

    const registerResponse = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email,
      password
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.success).toBe(true);
    expect(registerResponse.body.data.email).toBe(email);

    const tokenResponse = await request(app.getHttpServer()).post('/api/v1/auth/token').send({
      email,
      password
    });

    expect(tokenResponse.status).toBe(201);
    expect(tokenResponse.body.success).toBe(true);
    expect(tokenResponse.body.data.accessToken).toBeTruthy();
    expect(tokenResponse.body.data.refreshToken).toBeTruthy();
    expect(tokenResponse.body.data.sessionId).toBeTruthy();

    const profileResponse = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${tokenResponse.body.data.accessToken}`);

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.success).toBe(true);
    expect(profileResponse.body.data.email).toBe(email);

    const refreshResponse = await request(app.getHttpServer()).post('/api/v1/auth/refresh').send({
      sessionId: tokenResponse.body.data.sessionId,
      refreshToken: tokenResponse.body.data.refreshToken
    });

    expect(refreshResponse.status).toBe(201);
    expect(refreshResponse.body.success).toBe(true);
    expect(refreshResponse.body.data.accessToken).toBeTruthy();
    expect(refreshResponse.body.data.refreshToken).toBeTruthy();

    const logoutResponse = await request(app.getHttpServer()).post('/api/v1/auth/logout').send({
      sessionId: tokenResponse.body.data.sessionId
    });

    expect(logoutResponse.status).toBe(201);
    expect(logoutResponse.body.success).toBe(true);
    expect(logoutResponse.body.data.revoked).toBe(true);

    const refreshAfterLogoutResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        sessionId: tokenResponse.body.data.sessionId,
        refreshToken: refreshResponse.body.data.refreshToken
      });

    expect(refreshAfterLogoutResponse.status).toBe(401);
    expect(refreshAfterLogoutResponse.body.success).toBe(false);
  });
});
