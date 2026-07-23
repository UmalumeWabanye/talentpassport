import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { ResponseEnvelopeInterceptor } from '../common/interceptors/response-envelope.interceptor';

export function configureApp(app: INestApplication) {
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v'
  });
  app.use((request: { headers?: Record<string, string | string[] | undefined>; tenantId?: string }, _response: unknown, next: () => void) => {
    const tenantHeader = request.headers?.['x-tenant-id'];

    request.tenantId = Array.isArray(tenantHeader) ? tenantHeader[0] : tenantHeader;
    next();
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