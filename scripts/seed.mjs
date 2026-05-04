#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedsDir = resolve(__dirname, '..', 'infra', 'db', 'seeds');
const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL is required'); process.exit(1); }

const sql = postgres(url, { max: 1, prepare: false });

async function main() {
  const files = (await readdir(seedsDir)).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    process.stdout.write(`-> Seeding ${f}\n`);
    const body = await readFile(join(seedsDir, f), 'utf8');
    await sql.unsafe(body);
  }
  await sql.end();
  process.stdout.write('Seed complete.\n');
}
main().catch((e) => { console.error(e); process.exit(1); });
