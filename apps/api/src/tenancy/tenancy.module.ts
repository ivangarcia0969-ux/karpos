import { Global, Module } from '@nestjs/common';
import { TenancyService } from './tenancy.service.js';
import { TenancyInterceptor } from './tenancy.interceptor.js';

@Global()
@Module({
  providers: [TenancyService, TenancyInterceptor],
  exports: [TenancyService],
})
export class TenancyModule {}
