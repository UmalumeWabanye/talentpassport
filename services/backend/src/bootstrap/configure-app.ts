import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

type MinimalRequest = {
  headers?: Record<string, string | string[] | undefined>;
  method?: string;
  tenantId?: string;
};

type MinimalResponse = {
  append?: (name: string, value: string) => unknown;
  setHeader?: (name: string, value: string | string[]) => unknown;
  getHeader?: (name: string) => unknown;
  headersSent?: boolean;
};

type MiddlewareNext = () => void;

import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { ResponseEnvelopeInterceptor } from '../common/interceptors/response-envelope.interceptor';
import { CsrfProtectionMiddleware } from '../common/middleware/csrf-protection.middleware';
import { AppConfigService } from '../config/app-config.service';

export function configureApp(app: INestApplication) {
  const configService = app.get(AppConfigService);
  const csrfMiddleware = app.get(CsrfProtectionMiddleware);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v'
  });
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'no-referrer' },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }),
  );
  app.enableCors({
    credentials: true,
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      if (!origin || configService.corsAllowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin is not allowed'));
    }
  } as CorsOptions);
  app.use(cookieParser());
  app.use((_request: MinimalRequest, response: MinimalResponse, next: MiddlewareNext) => {
    const secureSuffix = configService.cookieSecure ? '; Secure' : '';
    const cookieValue =
      `tp_security_context=baseline; Max-Age=0; Path=/; HttpOnly; SameSite=${configService.cookieSameSite}${secureSuffix}`;

    if (!response.headersSent) {
      if (typeof response.append === 'function') {
        response.append('Set-Cookie', cookieValue);
      } else if (typeof response.setHeader === 'function') {
        const existing = response.getHeader?.('Set-Cookie');

        if (Array.isArray(existing)) {
          response.setHeader('Set-Cookie', [...existing, cookieValue]);
        } else if (typeof existing === 'string') {
          response.setHeader('Set-Cookie', [existing, cookieValue]);
        } else {
          response.setHeader('Set-Cookie', cookieValue);
        }
      }
    }

    next();
  });
  app.use((request: MinimalRequest, _response: unknown, next: MiddlewareNext) => {
    const tenantHeader = request.headers?.['x-tenant-id'];

    request.tenantId = Array.isArray(tenantHeader) ? tenantHeader[0] : tenantHeader;
    next();
  });
  app.use((request: MinimalRequest, response: unknown, next: MiddlewareNext) => {
    csrfMiddleware.use(request, response, next);
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseEnvelopeInterceptor());
}