import { Inject, Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import Redis from 'ioredis';

import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(@Inject(AppConfigService) configService: AppConfigService) {
    this.client = new Redis(configService.redisUrl, {
      enableOfflineQueue: false,
      lazyConnect: true,
      maxRetriesPerRequest: 1
    });

    this.client.on('error', (error) => {
      this.logger.warn(`Redis client error: ${error.message}`);
    });
  }

  async ping() {
    const startedAt = Date.now();

    try {
      await this.client.ping();

      return {
        latencyMs: Date.now() - startedAt,
        status: 'ok' as const
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown Redis error',
        latencyMs: Date.now() - startedAt,
        status: 'degraded' as const
      };
    }
  }

  async get(key: string) {
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    try {
      if (typeof ttlSeconds === 'number') {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }

      return true;
    } catch {
      return false;
    }
  }

  async del(key: string) {
    try {
      await this.client.del(key);
      return true;
    } catch {
      return false;
    }
  }
}