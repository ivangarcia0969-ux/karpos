#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const migrationsDir = join(root, 'infra', 'db', 'migrations');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false });

async function main() {
  await sql`CREATE SCHEMA IF NOT EXISTS karpos`;
  await sql`
    CREATE TABLE IF NOT EXISTS karpos._migrations (
      id text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now(),
      checksum text NOT NULL
    )
  `;

  const applied = new Map(
    (await sql`SELECT id, checksum FROM karpos._migrations`).map((r) => [r.id, r.checksum]),
  );

  const files = (await readdir(migrationsDir))
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const id = file.replace(/\.sql$/, '');
    const body = await readFile(join(migrationsDir, file), 'utf8');
    const checksum = await sha256(body);

    if (applied.has(id)) {
      if (applied.get(id) !== checksum) {
        throw new Error(`Migration ${id} checksum mismatch — file changed after being applied`);
      }
      continue;
    }

    process.stdout.write(`-> Applying ${id}\n`);
    try {
      await sql.unsafe(body);
      await sql`INSERT INTO karpos._migrations (id, checksum) VALUES (${id}, ${checksum})`;
    } catch (err) {
      console.error(`Failed migration ${id}:`, err);
      process.exit(1);
    }
  }
  await sql.end();
  process.stdout.write('Migrations applied.\n');
}

async function sha256(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
