import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';

import { loadEnv } from './config/env.js';
import { DatabaseModule } from './database/database.module.js';
import { IamModule } from './iam/iam.module.js';
import { JwtAuthGuard } from './iam/guards/jwt.guard.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { HealthController } from './common/health.controller.js';

import { FarmsModule } from './modules/farms/farms.module.js';
import { FieldLogModule } from './modules/field-log/field-log.module.js';
import { PhenologyModule } from './modules/phenology/phenology.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { HarvestModule } from './modules/harvest/harvest.module.js';
import { CatalogModule } from './modules/catalog/catalog.module.js';

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
    DatabaseModule,
    IamModule,
    FarmsModule,
    FieldLogModule,
    PhenologyModule,
    HealthModule,
    HarvestModule,
    CatalogModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
