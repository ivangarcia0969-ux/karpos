-- 0008_irrigation.sql
-- AquaPlan: irrigation zones, events, fertigation recipes, sensor readings.
-- References: FAO Irrigation and Drainage Paper 56 (Allen et al. 1998), ETo/ETc/Kc.

CREATE TABLE karpos.irrigation_zones (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  plot_id         uuid NOT NULL REFERENCES karpos.plots(id) ON DELETE CASCADE,
  code            text NOT NULL,
  name            text NOT NULL,
  area_ha         numeric(10,3),
  emitter_type    text,
  emitter_flow_lph numeric(8,3),
  emitters_per_tree int,
  trees_count     int,
  pressure_bar    numeric(5,2),
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plot_id, code)
);
CREATE INDEX ON karpos.irrigation_zones(org_id);
CREATE TRIGGER trg_irrigation_zones_updated BEFORE UPDATE ON karpos.irrigation_zones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE karpos.irrigation_events (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  zone_id         uuid NOT NULL REFERENCES karpos.irrigation_zones(id) ON DELETE CASCADE,
  started_at      timestamptz NOT NULL,
  ended_at        timestamptz,
  duration_min    numeric(8,2),
  applied_l       numeric(14,2),
  applied_mm      numeric(8,3),
  recipe_id       uuid,
  triggered_by    text NOT NULL DEFAULT 'manual' CHECK (triggered_by IN ('manual','schedule','sensor','model')),
  notes           text,
  recorded_by     uuid REFERENCES karpos.users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.irrigation_events(org_id, zone_id, started_at DESC);

CREATE TABLE karpos.fertigation_recipes (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  species_id      uuid REFERENCES catalog.crop_species(id),
  bbch_from       text,
  bbch_to         text,
  components      jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{product_id, dose, unit, ec_target, ph_target}]
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.fertigation_recipes(org_id);
CREATE TRIGGER trg_fertigation_recipes_updated BEFORE UPDATE ON karpos.fertigation_recipes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE karpos.irrigation_events
  ADD CONSTRAINT irrigation_events_recipe_fk FOREIGN KEY (recipe_id) REFERENCES karpos.fertigation_recipes(id);

-- High-frequency sensor data: Timescale hypertable.
CREATE TABLE karpos.sensors (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  plot_id         uuid REFERENCES karpos.plots(id) ON DELETE SET NULL,
  zone_id         uuid REFERENCES karpos.irrigation_zones(id) ON DELETE SET NULL,
  external_id     text,
  type            text NOT NULL CHECK (type IN ('soil_moisture','soil_temp','dendrometer','sap_flow','leaf_wetness','weather','flow','pressure')),
  vendor          text,
  model           text,
  unit            text,
  geom            geography(Point, 4326),
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  active          boolean NOT NULL DEFAULT true,
  installed_at    date,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.sensors(org_id, type) WHERE active = true;
CREATE INDEX ON karpos.sensors USING gist(geom);

CREATE TABLE karpos.sensor_readings (
  org_id          uuid NOT NULL,
  sensor_id       uuid NOT NULL,
  observed_at     timestamptz NOT NULL,
  value_numeric   numeric(14,4),
  value_text      text,
  quality         text DEFAULT 'good' CHECK (quality IN ('good','suspect','bad','missing')),
  raw             jsonb,
  PRIMARY KEY (sensor_id, observed_at)
);
SELECT create_hypertable('karpos.sensor_readings', 'observed_at', chunk_time_interval => INTERVAL '7 days', if_not_exists => TRUE);
CREATE INDEX ON karpos.sensor_readings(org_id, observed_at DESC);
SELECT add_compression_policy('karpos.sensor_readings', INTERVAL '30 days', if_not_exists => TRUE);

-- Daily ETo / ETc summary per plot.
CREATE TABLE karpos.water_balance_daily (
  org_id          uuid NOT NULL,
  plot_id         uuid NOT NULL,
  observed_on     date NOT NULL,
  eto_mm          numeric(8,3),
  kc              numeric(5,3),
  etc_mm          numeric(8,3),
  rainfall_mm     numeric(8,3),
  irrigation_mm   numeric(8,3),
  deficit_mm      numeric(8,3),
  source          text,
  PRIMARY KEY (org_id, plot_id, observed_on)
);
SELECT create_hypertable('karpos.water_balance_daily', 'observed_on', chunk_time_interval => INTERVAL '90 days', if_not_exists => TRUE);
