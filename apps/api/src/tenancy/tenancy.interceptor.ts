import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, from, switchMap } from 'rxjs';
import { TenancyService } from './tenancy.service.js';

@Injectable()
export class TenancyInterceptor implements NestInterceptor {
  constructor(private readonly tenancy: TenancyService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const principal = req.principal;

    if (!principal?.orgId) {
      // Public endpoints (e.g. health, traceability portal) skip the tenancy session;
      // the JWT guard already enforces auth on protected routes.
      return next.handle();
    }

    return from(
      this.tenancy.withTenant(principal.orgId, principal.userId ?? null, async () => undefined),
    ).pipe(switchMap(() => next.handle()));
  }
}
