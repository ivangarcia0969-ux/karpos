#!/usr/bin/env node
import postgres from 'postgres';
const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL is required'); process.exit(1); }
const sql = postgres(url, { max: 1, prepare: false });
await sql`DROP SCHEMA IF EXISTS karpos CASCADE`;
await sql`DROP SCHEMA IF EXISTS catalog CASCADE`;
await sql`DROP SCHEMA IF EXISTS audit CASCADE`;
await sql`DROP SCHEMA IF EXISTS analytics CASCADE`;
await sql.end();
process.stdout.write('Schemas dropped.\n');
