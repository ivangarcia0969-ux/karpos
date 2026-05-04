import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { loadEnv } from '../config/env.js';
import * as schema from './schema/index.js';

export const DRIZZLE = Symbol('DRIZZLE');
export const PG_CLIENT = Symbol('PG_CLIENT');

@Global()
@Module({
  providers: [
    {
      provide: PG_CLIENT,
      useFactory: () => {
        const env = loadEnv();
        return postgres(env.DATABASE_URL, {
          max: 20,
          prepare: false,
          types: {
            bigint: postgres.BigInt,
          },
        });
      },
    },
    {
      provide: DRIZZLE,
      inject: [PG_CLIENT],
      useFactory: (client: ReturnType<typeof postgres>) => drizzle(client, { schema, casing: 'snake_case' }),
    },
  ],
  exports: [DRIZZLE, PG_CLIENT],
})
export class DatabaseModule {}

export type Database = ReturnType<typeof drizzle<typeof schema>>;
