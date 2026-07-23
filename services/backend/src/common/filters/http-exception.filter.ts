import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const request = host.switchToHttp().getRequest<{ method?: string; url?: string }>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const publicMessage = exception instanceof HttpException ? exception.message : 'Internal server error';
    const logMessage = exception instanceof Error ? exception.message : publicMessage;

    this.logger.error(`${request.method ?? 'UNKNOWN'} ${request.url ?? 'unknown'} -> ${status}: ${logMessage}`);

    response.status(status).json({
      error: {
        message: publicMessage,
        statusCode: status,
        timestamp: new Date().toISOString()
      }
    });
  }
}