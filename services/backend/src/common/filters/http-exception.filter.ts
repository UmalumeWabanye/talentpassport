import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';

import type { ApiErrorResponse } from '../contracts/api-response.contract';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const request = host.switchToHttp().getRequest<{ method?: string; url?: string }>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const publicMessage = exception instanceof HttpException ? exception.message : 'Internal server error';
    const logMessage = exception instanceof Error ? exception.message : publicMessage;
    const errorCode = exception instanceof HttpException ? `HTTP_${status}` : 'INTERNAL_SERVER_ERROR';

    this.logger.error(`${request.method ?? 'UNKNOWN'} ${request.url ?? 'unknown'} -> ${status}: ${logMessage}`);

    response.status(status).json({
      success: false,
      error: {
        code: errorCode,
        message: publicMessage,
        statusCode: status
      },
      meta: {
        path: request.url ?? 'unknown',
        timestamp: new Date().toISOString()
      }
    } satisfies ApiErrorResponse);
  }
}