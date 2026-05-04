-- 0004_farms.sql
-- Predios: farms, sectors, plots, trees, varieties, rootstocks, training systems.

CREATE TABLE catalog.crop_species (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  code            text NOT NULL UNIQUE,
  scientific_name text NOT NULL,
  common_name_es  text NOT NULL,
  common_name_en  text NOT NULL,
  family          text,
  category        text NOT NULL CHECK (category IN ('deciduous','citrus','tropical','berry','vine','nut'))
);

CREATE TABLE catalog.varieties (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  species_id      uuid NOT NULL REFERENCES catalog.crop_species(id) ON DELETE CASCADE,
  code            text NOT NULL,
  name            text NOT NULL,
  origin_country  char(2),
  patent_holder   text,
  pollination_group text,
  notes           text,
  UNIQUE (species_id, code)
);

CREATE TABLE catalog.rootstocks (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  species_id      uuid NOT NULL REFERENCES catalog.crop_species(id) ON DELETE CASCADE,
  code            text NOT NULL,
  name            text NOT NULL,
  vigor           text CHECK (vigor IN ('dwarf','semi-dwarf','semi-vigorous','vigorous')),
  notes           text,
  UNIQUE (species_id, code)
);

CREATE TABLE catalog.training_systems (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  code            text NOT NULL UNIQUE,
  name            text NOT NULL,
  applies_to      text[] NOT NULL DEFAULT '{}',  -- species categories
  description     text
);

CREATE TABLE karpos.farms (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  code            text NOT NULL,
  name            text NOT NULL,
  country_code    char(2) NOT NULL,
  region          text,
  locality        text,
  timezone        text NOT NULL,
  elevation_m     int,
  total_area_ha   numeric(10,3),
  centroid        geography(Point, 4326),
  boundary        geography(MultiPolygon, 4326),
  contact         jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, code)
);
CREATE INDEX ON karpos.farms(org_id);
CREATE INDEX ON karpos.farms USING gist(boundary);
CREATE TRIGGER trg_farms_updated BEFORE UPDATE ON karpos.farms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE karpos.sectors (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  farm_id         uuid NOT NULL REFERENCES karpos.farms(id) ON DELETE CASCADE,
  code            text NOT NULL,
  name            text NOT NULL,
  area_ha         numeric(10,3),
  boundary        geography(MultiPolygon, 4326),
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (farm_id, code)
);
CREATE INDEX ON karpos.sectors(org_id);
CREATE INDEX ON karpos.sectors USING gist(boundary);
CREATE TRIGGER trg_sectors_updated BEFORE UPDATE ON karpos.sectors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE karpos.plots (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  farm_id         uuid NOT NULL REFERENCES karpos.farms(id) ON DELETE CASCADE,
  sector_id       uuid REFERENCES karpos.sectors(id) ON DELETE SET NULL,
  code            text NOT NULL,
  name            text NOT NULL,
  species_id      uuid NOT NULL REFERENCES catalog.crop_species(id),
  variety_id      uuid REFERENCES catalog.varieties(id),
  rootstock_id    uuid REFERENCES catalog.rootstocks(id),
  training_system_id uuid REFERENCES catalog.training_systems(id),
  planting_date   date,
  spacing_row_m   numeric(6,2),
  spacing_tree_m  numeric(6,2),
  trees_count     int,
  area_ha         numeric(10,3),
  boundary        geography(MultiPolygon, 4326),
  centroid        geography(Point, 4326),
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('planning','establishing','active','retired')),
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (farm_id, code)
);
CREATE INDEX ON karpos.plots(org_id);
CREATE INDEX ON karpos.plots(farm_id);
CREATE INDEX ON karpos.plots USING gist(boundary);
CREATE INDEX ON karpos.plots(species_id);
CREATE TRIGGER trg_plots_updated BEFORE UPDATE ON karpos.plots
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE karpos.trees (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  plot_id         uuid NOT NULL REFERENCES karpos.plots(id) ON DELETE CASCADE,
  row_number      int,
  position_in_row int,
  variety_id      uuid REFERENCES catalog.varieties(id),
  rootstock_id   uuid REFERENCES catalog.rootstocks(id),
  planted_at      date,
  geom            geography(Point, 4326),
  status          text NOT NULL DEFAULT 'alive' CHECK (status IN ('alive','missing','replanted','removed')),
  qr_code         text UNIQUE,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.trees(org_id);
CREATE INDEX ON karpos.trees(plot_id, row_number, position_in_row);
CREATE INDEX ON karpos.trees USING gist(geom);
CREATE TRIGGER trg_trees_updated BEFORE UPDATE ON karpos.trees
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
