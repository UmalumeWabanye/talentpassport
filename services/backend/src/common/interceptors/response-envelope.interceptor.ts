import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs';

import type { ApiSuccessResponse } from '../contracts/api-response.contract';

function isApiSuccessResponse(value: unknown): value is ApiSuccessResponse<unknown> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ApiSuccessResponse<unknown>>;

  return candidate.success === true && 'data' in candidate && !!candidate.meta;
}

@Injectable()
export class ResponseEnvelopeInterceptor<T> implements NestInterceptor<T, ApiSuccessResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>) {
    return next.handle().pipe(
      map((data) => {
        if (isApiSuccessResponse(data)) {
          return data as ApiSuccessResponse<T>;
        }

        return {
          success: true,
          data,
          meta: {
            timestamp: new Date().toISOString()
          }
        } satisfies ApiSuccessResponse<T>;
      }),
    );
  }
}