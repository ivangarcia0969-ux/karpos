-- 0016_roles_and_grants.sql
-- Database roles and least-privilege grants.

DO $$ BEGIN
  CREATE ROLE karpos_app NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE ROLE karpos_migrator NOLOGIN BYPASSRLS;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE ROLE karpos_readonly NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

GRANT USAGE ON SCHEMA karpos, catalog, audit, analytics TO karpos_app, karpos_readonly;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA karpos TO karpos_app;
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA audit TO karpos_app;
GRANT SELECT ON ALL TABLES IN SCHEMA catalog TO karpos_app, karpos_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO karpos_app, karpos_readonly;

ALTER DEFAULT PRIVILEGES IN SCHEMA karpos GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO karpos_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit GRANT SELECT, INSERT ON TABLES TO karpos_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA catalog GRANT SELECT ON TABLES TO karpos_app, karpos_readonly;

-- Sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA karpos TO karpos_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA karpos GRANT USAGE ON SEQUENCES TO karpos_app;

-- Migrator owns everything.
ALTER SCHEMA karpos OWNER TO karpos_migrator;
ALTER SCHEMA audit OWNER TO karpos_migrator;
ALTER SCHEMA catalog OWNER TO karpos_migrator;
ALTER SCHEMA analytics OWNER TO karpos_migrator;
