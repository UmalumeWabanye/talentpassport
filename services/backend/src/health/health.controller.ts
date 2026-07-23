import { Controller, Get, Inject, Version } from '@nestjs/common';

import { RedisService } from '../cache/redis.service';
import { AppConfigService } from '../config/app-config.service';
import { PrismaService } from '../database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(AppConfigService) private readonly configService: AppConfigService,
    @Inject(PrismaService) private readonly prismaService: PrismaService,
    @Inject(RedisService) private readonly redisService: RedisService,
  ) {}

  @Get()
  @Version('1')
  getHealth() {
    return {
      environment: this.configService.nodeEnv,
      service: 'backend',
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: 'v1'
    };
  }

  @Get('db')
  @Version('1')
  async getDatabaseHealth() {
    const health = await this.prismaService.ping();

    return {
      service: 'database',
      timestamp: new Date().toISOString(),
      ...health
    };
  }

  @Get('redis')
  @Version('1')
  async getRedisHealth() {
    const health = await this.redisService.ping();

    return {
      service: 'redis',
      timestamp: new Date().toISOString(),
      ...health
    };
  }
}