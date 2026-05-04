import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { loadEnv } from './config/env.js';
import { DatabaseModule } from './database/database.module.js';
import { TenancyModule } from './tenancy/tenancy.module.js';
import { TenancyInterceptor } from './tenancy/tenancy.interceptor.js';
import { IamModule } from './iam/iam.module.js';
import { JwtAuthGuard } from './iam/guards/jwt.guard.js';
import { PermissionsGuard } from './iam/guards/permissions.guard.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { HealthController } from './common/health.controller.js';

import { FarmsModule } from './modules/farms/farms.module.js';
import { FieldLogModule } from './modules/field-log/field-log.module.js';
import { PhenologyModule } from './modules/phenology/phenology.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { HarvestModule } from './modules/harvest/harvest.module.js';
import { CopilotModule } from './modules/copilot/copilot.module.js';
import { BillingModule } from './modules/billing/billing.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: () => loadEnv() }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        autoLogging: true,
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 240 }]),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({ wildcard: true, delimiter: '.' }),
    DatabaseModule,
    TenancyModule,
    IamModule,
    FarmsModule,
    FieldLogModule,
    PhenologyModule,
    HealthModule,
    HarvestModule,
    CopilotModule,
    BillingModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_INTERCEPTOR, useClass: TenancyInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
