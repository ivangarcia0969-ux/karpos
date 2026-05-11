-- 0015_rls_policies.sql
-- Activate Row-Level Security on all tenant tables.

-- organizations is the tenant root: its own id IS the tenant id.
ALTER TABLE karpos.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE karpos.organizations FORCE ROW LEVEL SECURITY;
CREATE POLICY organizations_tenant_isolation ON karpos.organizations
  USING (id = current_org())
  WITH CHECK (id = current_org());

DO $$
DECLARE
  tbl text;
  has_org_id boolean;
  tenant_tables text[] := ARRAY[
    'subscriptions','invoices','usage_meters',
    'roles','memberships','api_keys',
    'farms','sectors','plots','trees',
    'phenology_profiles','phenology_profile_stages','phenology_events','gdd_daily',
    'crews','workers','field_operations','worker_outputs','payroll_periods',
    'pest_scoutings','spray_records','spray_record_items','disease_alerts',
    'irrigation_zones','irrigation_events','fertigation_recipes','sensors','sensor_readings','water_balance_daily',
    'harvest_plans','harvest_lots','weighbridge_tickets',
    'packing_lots','pallets','containers','shipments','traceability_links',
    'satellite_indices','weather_stations','weather_observations','weather_forecasts','alerts',
    'certifications','documents','audit_checklists',
    'knowledge_documents','knowledge_chunks','copilot_sessions','copilot_messages'
  ];
BEGIN
  FOREACH tbl IN ARRAY tenant_tables LOOP
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'karpos' AND table_name = tbl AND column_name = 'org_id'
    ) INTO has_org_id;

    IF NOT has_org_id THEN
      RAISE NOTICE 'Skipping RLS on karpos.% — column org_id not present', tbl;
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE karpos.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE karpos.%I FORCE ROW LEVEL SECURITY', tbl);

    EXECUTE format($f$
      CREATE POLICY %I_tenant_isolation ON karpos.%I
        USING (org_id IS NULL OR org_id = current_org())
        WITH CHECK (org_id IS NULL OR org_id = current_org())
    $f$, tbl, tbl);
  END LOOP;
END $$;

ALTER TABLE audit.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.audit_events FORCE ROW LEVEL SECURITY;
CREATE POLICY audit_events_tenant_read ON audit.audit_events
  FOR SELECT USING (org_id = current_org());
CREATE POLICY audit_events_tenant_insert ON audit.audit_events
  FOR INSERT WITH CHECK (org_id = current_org());

-- Catalog schema is global, read-only for tenants.
GRANT USAGE ON SCHEMA catalog TO PUBLIC;
GRANT SELECT ON ALL TABLES IN SCHEMA catalog TO PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA catalog GRANT SELECT ON TABLES TO PUBLIC;

-- Self-check: list tenant tables that have org_id but no RLS.
CREATE OR REPLACE VIEW analytics.rls_audit AS
SELECT n.nspname AS schema, c.relname AS table, c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_attribute a ON a.attrelid = c.oid AND a.attname = 'org_id'
 WHERE c.relkind = 'r' AND n.nspname = 'karpos';
