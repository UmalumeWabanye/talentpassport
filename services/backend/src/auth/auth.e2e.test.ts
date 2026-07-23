import 'reflect-metadata';

import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../app.module';
import { configureApp } from '../bootstrap/configure-app';

const testEnv = {
  AUTH_PROVIDER: 'authjs',
  AUTH_ADMIN_EMAILS: 'admin@talentpassport.local',
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
    const adminEmail = 'admin@talentpassport.local';
    const adminPassword = 'strong-password';

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

    expect(profileResponse.status, JSON.stringify(profileResponse.body)).toBe(200);
    expect(profileResponse.body.success).toBe(true);
    expect(profileResponse.body.data.email).toBe(email);
    expect(profileResponse.body.data.role).toBe('user');

    const tenantResourceResponse = await request(app.getHttpServer())
      .get('/api/v1/auth/tenants/tenant-alpha/resource')
      .set('Authorization', `Bearer ${tokenResponse.body.data.accessToken}`)
      .set('x-tenant-id', 'tenant-alpha');

    expect(tenantResourceResponse.status).toBe(200);
    expect(tenantResourceResponse.body.success).toBe(true);
    expect(tenantResourceResponse.body.data.tenantId).toBe('tenant-alpha');

    const crossTenantResponse = await request(app.getHttpServer())
      .get('/api/v1/auth/tenants/tenant-alpha/resource')
      .set('Authorization', `Bearer ${tokenResponse.body.data.accessToken}`)
      .set('x-tenant-id', 'tenant-beta');

    expect(crossTenantResponse.status, JSON.stringify(crossTenantResponse.body)).toBe(403);
    expect(crossTenantResponse.body.success).toBe(false);

    const forbiddenAdminResponse = await request(app.getHttpServer())
      .get('/api/v1/auth/admin')
      .set('Authorization', `Bearer ${tokenResponse.body.data.accessToken}`);

    expect(forbiddenAdminResponse.status, JSON.stringify(forbiddenAdminResponse.body)).toBe(403);
    expect(forbiddenAdminResponse.body.success).toBe(false);

    const adminRegisterResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: adminEmail,
        password: adminPassword
      });

    expect(adminRegisterResponse.status).toBe(201);

    const adminTokenResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/token')
      .send({
        email: adminEmail,
        password: adminPassword
      });

    expect(adminTokenResponse.status).toBe(201);

    const adminResponse = await request(app.getHttpServer())
      .get('/api/v1/auth/admin')
      .set('Authorization', `Bearer ${adminTokenResponse.body.data.accessToken}`);

    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body.success).toBe(true);
    expect(adminResponse.body.data.role).toBe('admin');
    expect(adminResponse.body.data.permissions).toContain('admin:read');

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
