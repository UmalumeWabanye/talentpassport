import { describe, expect, it } from 'vitest';

import { HealthController } from './health.controller';
import type { RedisService } from '../cache/redis.service';
import type { AppConfigService } from '../config/app-config.service';
import type { PrismaService } from '../database/prisma.service';

describe('HealthController', () => {
  it('returns the versioned health payload', () => {
    const controller = new HealthController({
      logLevel: 'info',
      nodeEnv: 'test',
      port: 4000
    } as AppConfigService, {
      ping: async () => ({ latencyMs: 1, status: 'ok' as const })
    } as PrismaService, {
      ping: async () => ({ latencyMs: 1, status: 'ok' as const })
    } as RedisService);

    const response = controller.getHealth();

    expect(response.status).toBe('ok');
    expect(response.service).toBe('backend');
    expect(response.environment).toBe('test');
    expect(response.version).toBe('v1');
  });

  it('returns the database health payload', async () => {
    const controller = new HealthController({
      logLevel: 'info',
      nodeEnv: 'test',
      port: 4000
    } as AppConfigService, {
      ping: async () => ({ latencyMs: 12, status: 'ok' as const })
    } as PrismaService, {
      ping: async () => ({ latencyMs: 1, status: 'ok' as const })
    } as RedisService);

    await expect(controller.getDatabaseHealth()).resolves.toMatchObject({
      service: 'database',
      status: 'ok'
    });
  });

  it('returns the redis health payload', async () => {
    const controller = new HealthController({
      logLevel: 'info',
      nodeEnv: 'test',
      port: 4000
    } as AppConfigService, {
      ping: async () => ({ latencyMs: 12, status: 'ok' as const })
    } as PrismaService, {
      ping: async () => ({ latencyMs: 3, status: 'ok' as const })
    } as RedisService);

    await expect(controller.getRedisHealth()).resolves.toMatchObject({
      service: 'redis',
      status: 'ok'
    });
  });
});