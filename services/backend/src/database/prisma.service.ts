import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import type { PrismaClient } from '../../generated/prisma/client';
import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class PrismaService implements OnModuleDestroy {
  private client?: PrismaClient;
  private readonly configService: AppConfigService;

  constructor(@Inject(AppConfigService) configService: AppConfigService) {
    this.configService = configService;
  }

  private async getClient() {
    if (!this.client) {
      const { PrismaClient: GeneratedPrismaClient } = await import('../../generated/prisma/client');
      const adapter = new PrismaPg({ connectionString: this.configService.databaseUrlPooled });

      this.client = new GeneratedPrismaClient({ adapter });
    }

    return this.client;
  }

  async onModuleDestroy() {
    await this.client?.$disconnect();
  }

  async ping() {
    const startedAt = Date.now();

    try {
      await (await this.getClient()).$queryRaw`SELECT 1`;

      return {
        latencyMs: Date.now() - startedAt,
        status: 'ok' as const
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown Prisma error',
        latencyMs: Date.now() - startedAt,
        status: 'degraded' as const
      };
    }
  }
}