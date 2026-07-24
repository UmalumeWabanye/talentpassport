import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { CacheModule } from './cache/cache.module';
import { BackendConfigModule } from './config/backend-config.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [BackendConfigModule, CacheModule, DatabaseModule, HealthModule, AuthModule, StorageModule]
})
export class AppModule {}