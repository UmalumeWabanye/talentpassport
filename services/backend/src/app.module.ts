import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { CacheModule } from './cache/cache.module';
import { BackendConfigModule } from './config/backend-config.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [BackendConfigModule, CacheModule, DatabaseModule, HealthModule, AuthModule]
})
export class AppModule {}