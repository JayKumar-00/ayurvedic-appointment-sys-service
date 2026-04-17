import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message = 'Something went wrong';
    let details: string[] | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      error = HttpStatus[statusCode] ?? 'Error';

      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const payload = exceptionResponse as {
          message?: string | string[];
          error?: string;
        };

        if (typeof payload.error === 'string') {
          error = payload.error;
        }

        if (Array.isArray(payload.message)) {
          message = 'Validation failed';
          details = payload.message;
        } else if (typeof payload.message === 'string') {
          message = payload.message;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.stack ?? exception.message);
    } else {
      this.logger.error('Unknown non-error exception thrown');
    }

    response.status(statusCode).json({
      statusCode,
      error,
      message,
      details,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
