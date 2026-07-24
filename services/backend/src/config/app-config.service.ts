import { Injectable } from '@nestjs/common';

import { getBackendEnv } from './environment';

@Injectable()
export class AppConfigService {
  private readonly env = getBackendEnv();

  get nodeEnv() {
    return this.env.NODE_ENV;
  }

  get port() {
    return this.env.PORT;
  }

  get logLevel() {
    return this.env.LOG_LEVEL;
  }

  get databaseUrl() {
    return this.env.DATABASE_URL;
  }

  get databaseUrlPooled() {
    return this.env.DATABASE_URL_POOLED ?? this.env.DATABASE_URL;
  }

  get directDatabaseUrl() {
    return this.env.DIRECT_URL ?? this.env.DATABASE_URL;
  }

  get redisUrl() {
    return this.env.REDIS_URL;
  }

  get authProvider() {
    return this.env.AUTH_PROVIDER;
  }

  get authAdminEmails() {
    const rawValue = this.env.AUTH_ADMIN_EMAILS ?? process.env.AUTH_ADMIN_EMAILS ?? '';

    return new Set(
      rawValue
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    );
  }

  get jwtAccessSecret() {
    return this.env.JWT_ACCESS_SECRET;
  }

  get jwtRefreshSecret() {
    return this.env.JWT_REFRESH_SECRET;
  }

  get jwtAccessTtlSeconds() {
    const value = (this.env as Record<string, unknown>).JWT_ACCESS_TTL_SECONDS;

    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value;
    }

    return 900;
  }

  get jwtRefreshTtlSeconds() {
    const value = (this.env as Record<string, unknown>).JWT_REFRESH_TTL_SECONDS;

    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value;
    }

    return 604800;
  }

  get storageProvider() {
    return this.env.STORAGE_PROVIDER;
  }

  get storageBucket() {
    return this.env.STORAGE_BUCKET;
  }

  get storageSigningSecret() {
    return this.env.STORAGE_SIGNING_SECRET;
  }

  get storageSignedUrlTtlSeconds() {
    const value = (this.env as Record<string, unknown>).STORAGE_SIGNED_URL_TTL_SECONDS;

    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value;
    }

    return 900;
  }

  get storagePublicBaseUrl() {
    return this.env.STORAGE_PUBLIC_BASE_URL ?? this.env.NEXT_PUBLIC_API_URL;
  }
}