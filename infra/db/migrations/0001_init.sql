-- 0001_init.sql
-- Karpos baseline schema. Postgres 16 vanilla — no Timescale, PostGIS, pgvector.
-- Geometries are stored as GeoJSON (jsonb); add PostGIS later if you need
-- server-side spatial queries.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS karpos;
CREATE SCHEMA IF NOT EXISTS catalog;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────
-- Catalog (global reference data)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE catalog.crop_species (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text NOT NULL UNIQUE,
  scientific_name text NOT NULL,
  common_name_es  text NOT NULL,
  common_name_en  text NOT NULL,
  family          text,
  category        text
);

CREATE TABLE catalog.varieties (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id      uuid NOT NULL REFERENCES catalog.crop_species(id) ON DELETE CASCADE,
  code            text NOT NULL,
  name            text NOT NULL,
  origin_country  text,
  notes           text,
  UNIQUE (species_id, code)
);

-- ─────────────────────────────────────────────────────────────
-- Tenancy
-- ─────────────────────────────────────────────────────────────

CREATE TABLE karpos.organizations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name      text NOT NULL,
  display_name    text NOT NULL,
  slug            text NOT NULL UNIQUE,
  country_code    char(2) NOT NULL,
  default_locale  text NOT NULL DEFAULT 'es-CO',
  default_currency char(3) NOT NULL DEFAULT 'COP',
  default_timezone text NOT NULL DEFAULT 'America/Bogota',
  tax_id          text,
  billing_email   text,
  status          text NOT NULL DEFAULT 'active',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_organizations_updated BEFORE UPDATE ON karpos.organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE karpos.users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL UNIQUE,
  password_hash   text NOT NULL,
  display_name    text NOT NULL,
  locale          text NOT NULL DEFAULT 'es-CO',
  status          text NOT NULL DEFAULT 'active',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON karpos.users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE karpos.memberships (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES karpos.users(id) ON DELETE CASCADE,
  role            text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','manager','member','viewer')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);
CREATE INDEX ON karpos.memberships(user_id);

-- ─────────────────────────────────────────────────────────────
-- Farms / Plots
-- ─────────────────────────────────────────────────────────────

CREATE TABLE karpos.farms (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  code            text NOT NULL,
  name            text NOT NULL,
  country_code    char(2) NOT NULL,
  region          text,
  locality        text,
  timezone        text NOT NULL DEFAULT 'America/Bogota',
  elevation_m     int,
  total_area_ha   numeric(10,3),
  centroid        jsonb,   -- GeoJSON Point
  boundary        jsonb,   -- GeoJSON Polygon / MultiPolygon
  contact         jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, code)
);
CREATE INDEX ON karpos.farms(org_id);
CREATE TRIGGER trg_farms_updated BEFORE UPDATE ON karpos.farms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE karpos.plots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  farm_id         uuid NOT NULL REFERENCES karpos.farms(id) ON DELETE CASCADE,
  code            text NOT NULL,
  name            text NOT NULL,
  species_id      uuid REFERENCES catalog.crop_species(id),
  variety_id      uuid REFERENCES catalog.varieties(id),
  planting_date   date,
  spacing_row_m   numeric(6,2),
  spacing_tree_m  numeric(6,2),
  trees_count     int,
  area_ha         numeric(10,3),
  boundary        jsonb,   -- GeoJSON Polygon
  centroid        jsonb,   -- GeoJSON Point
  status          text NOT NULL DEFAULT 'active',
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (farm_id, code)
);
CREATE INDEX ON karpos.plots(org_id);
CREATE TRIGGER trg_plots_updated BEFORE UPDATE ON karpos.plots
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Field operations log (pruning, fertilizing, spraying, etc.)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE karpos.field_operations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  plot_id         uuid NOT NULL REFERENCES karpos.plots(id) ON DELETE CASCADE,
  operation_type  text NOT NULL,   -- 'prune','fertilize','spray','irrigate','thin','manual_log'
  started_at      timestamptz NOT NULL,
  ended_at        timestamptz,
  area_ha         numeric(10,3),
  notes           text,
  inputs          jsonb NOT NULL DEFAULT '[]'::jsonb,   -- list of products / doses
  recorded_by     uuid REFERENCES karpos.users(id),
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.field_operations(org_id, plot_id, started_at DESC);
CREATE INDEX ON karpos.field_operations(org_id, operation_type, started_at DESC);

-- ─────────────────────────────────────────────────────────────
-- Phenology (BBCH events)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE karpos.phenology_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  plot_id         uuid NOT NULL REFERENCES karpos.plots(id) ON DELETE CASCADE,
  observed_on     date NOT NULL,
  bbch_code       text NOT NULL,   -- e.g. '65' (full flowering)
  stage_label     text,
  pct_in_stage    numeric(5,2),
  notes           text,
  recorded_by     uuid REFERENCES karpos.users(id),
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.phenology_events(org_id, plot_id, observed_on DESC);

-- ─────────────────────────────────────────────────────────────
-- Harvest lots
-- ─────────────────────────────────────────────────────────────

CREATE TABLE karpos.harvest_lots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  plot_id         uuid NOT NULL REFERENCES karpos.plots(id) ON DELETE CASCADE,
  lot_code        text NOT NULL,
  harvested_on    date NOT NULL,
  variety_id      uuid REFERENCES catalog.varieties(id),
  net_weight_kg   numeric(12,2),
  quality_grade   text,
  destination     text,
  notes           text,
  recorded_by     uuid REFERENCES karpos.users(id),
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, lot_code)
);
CREATE INDEX ON karpos.harvest_lots(org_id, plot_id, harvested_on DESC);
