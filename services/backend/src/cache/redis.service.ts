import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor(configService: AppConfigService) {
    this.client = new Redis(configService.redisUrl, {
      enableOfflineQueue: false,
      lazyConnect: true,
      maxRetriesPerRequest: 1
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
}