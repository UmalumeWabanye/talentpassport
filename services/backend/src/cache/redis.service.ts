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
}