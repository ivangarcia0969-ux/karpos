import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ZodError } from 'zod';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse();
    const req = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let payload: Record<string, unknown> = { error: 'internal_error' };

    if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      payload = { error: 'validation_failed', issues: exception.issues };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      payload = typeof res === 'string' ? { error: res } : (res as Record<string, unknown>);
    } else if (exception instanceof Error) {
      this.logger.error(exception.stack ?? exception.message);
      payload = { error: 'internal_error', message: exception.message };
    }

    payload.path = req.url;
    payload.method = req.method;
    payload.timestamp = new Date().toISOString();
    payload.requestId = req.id;

    reply.status(status).send(payload);
  }
}
