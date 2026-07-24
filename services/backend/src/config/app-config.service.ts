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

  get storageMaxFileSizeBytes() {
    const value = (this.env as Record<string, unknown>).STORAGE_MAX_FILE_SIZE_BYTES;

    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value;
    }

    return 10 * 1024 * 1024;
  }

  get storageAllowedMimeTypes() {
    return new Set(
      this.env.STORAGE_ALLOWED_MIME_TYPES
        .split(',')
        .map((mimeType) => mimeType.trim().toLowerCase())
        .filter(Boolean),
    );
  }

  get storagePublicBaseUrl() {
    return this.env.STORAGE_PUBLIC_BASE_URL ?? this.env.NEXT_PUBLIC_API_URL;
  }

  get corsAllowedOrigins() {
    const configured =
      (this.env as Record<string, unknown>).CORS_ALLOWED_ORIGINS ?? process.env.CORS_ALLOWED_ORIGINS;
    const value: string =
      typeof configured === 'string' && configured.trim().length > 0
        ? configured
        : 'http://localhost:3000';

    return value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  get cookieSecure() {
    return this.env.COOKIE_SECURE === 'true';
  }

  get cookieSameSite() {
    return this.env.COOKIE_SAME_SITE;
  }

  get csrfEnabled() {
    return this.env.CSRF_ENABLED === 'true';
  }

  get csrfHeaderName() {
    return this.env.CSRF_HEADER_NAME.toLowerCase();
  }

  get csrfAllowedOrigins() {
    const configured =
      (this.env as Record<string, unknown>).CSRF_ALLOWED_ORIGINS ?? process.env.CSRF_ALLOWED_ORIGINS;

    if (typeof configured !== 'string' || configured.trim().length === 0) {
      return this.corsAllowedOrigins;
    }

    return configured
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }
}