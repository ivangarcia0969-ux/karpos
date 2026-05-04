-- 0001_extensions.sql
-- Karpos: required PostgreSQL extensions and base helpers.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- UUIDv7 generator (time-ordered, Postgres native impl).
CREATE OR REPLACE FUNCTION uuid_v7() RETURNS uuid AS $$
DECLARE
  unix_ts_ms bigint;
  uuid_bytes bytea;
BEGIN
  unix_ts_ms := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::bigint;
  uuid_bytes := set_byte(gen_random_bytes(16), 6, ((b'0111' || (gen_random_bytes(1)::bit(4))))::int4::bit(8)::int);
  uuid_bytes := overlay(uuid_bytes placing substring(int8send(unix_ts_ms) from 3 for 6) from 1 for 6);
  uuid_bytes := set_byte(uuid_bytes, 6, (112 + (get_byte(uuid_bytes, 6) & 15))::int);
  uuid_bytes := set_byte(uuid_bytes, 8, (128 + (get_byte(uuid_bytes, 8) & 63))::int);
  RETURN encode(uuid_bytes, 'hex')::uuid;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION current_org() RETURNS uuid AS $$
BEGIN
  RETURN nullif(current_setting('app.current_org', true), '')::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION current_actor() RETURNS uuid AS $$
BEGIN
  RETURN nullif(current_setting('app.current_actor', true), '')::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE SCHEMA IF NOT EXISTS catalog;       -- global read-only reference data
CREATE SCHEMA IF NOT EXISTS karpos;        -- tenant business data (default search_path)
CREATE SCHEMA IF NOT EXISTS audit;         -- immutable event log
CREATE SCHEMA IF NOT EXISTS analytics;     -- derived read models / cubes

ALTER DATABASE karpos SET search_path = karpos, catalog, public;
