import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { NestMiddleware } from '@nestjs/common';

import { AppConfigService } from '../../config/app-config.service';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfProtectionMiddleware implements NestMiddleware {
  constructor(@Inject(AppConfigService) private readonly configService: AppConfigService) {}

  use(
    request: {
      headers?: Record<string, string | string[] | undefined>;
      method?: string;
    },
    _response: unknown,
    next: () => void,
  ) {
    if (!this.configService.csrfEnabled) {
      next();
      return;
    }

    const method = (request.method ?? 'GET').toUpperCase();

    if (SAFE_METHODS.has(method)) {
      next();
      return;
    }

    const originHeader = this.readHeader(request.headers, 'origin');
    const tokenHeader = this.readHeader(request.headers, this.configService.csrfHeaderName);

    if (!originHeader || !this.configService.csrfAllowedOrigins.includes(originHeader)) {
      throw new ForbiddenException('CSRF origin is invalid');
    }

    if (!tokenHeader) {
      throw new ForbiddenException('CSRF token header is required');
    }

    next();
  }

  private readHeader(headers: Record<string, string | string[] | undefined> | undefined, key: string) {
    const value = headers?.[key];

    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  }
}
