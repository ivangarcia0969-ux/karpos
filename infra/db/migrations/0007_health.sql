-- 0007_health.sql
-- Sanidad+: pest scouting, disease models, chemical products, spray records.
-- References: GlobalG.A.P. v6 IFA control points; FAO IPC; WHO Recommended Classification of Pesticides by Hazard.

CREATE TABLE catalog.pest_taxa (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  scientific_name text NOT NULL UNIQUE,
  common_name_es  text,
  common_name_en  text,
  group_code      text NOT NULL CHECK (group_code IN ('insect','mite','disease','nematode','weed','vertebrate','abiotic')),
  hosts           text[] NOT NULL DEFAULT '{}'
);

CREATE TABLE catalog.active_ingredients (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  cas_number      text UNIQUE,
  name            text NOT NULL,
  who_class       text CHECK (who_class IN ('Ia','Ib','II','III','U','NL')),
  frac_code       text,
  irac_code       text,
  hrac_code       text
);

CREATE TABLE catalog.chemical_products (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  trade_name      text NOT NULL,
  manufacturer    text,
  formulation     text,
  registration_country char(2),
  registration_id text,
  active_ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,  -- [{ai_id, concentration_g_l, units}]
  unit            text,
  default_phi_days int,
  default_rei_hours int,
  notes           text,
  UNIQUE (registration_country, registration_id)
);

CREATE TABLE karpos.pest_scoutings (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  plot_id         uuid NOT NULL REFERENCES karpos.plots(id) ON DELETE CASCADE,
  observed_at     timestamptz NOT NULL,
  observer_id     uuid REFERENCES karpos.users(id),
  pest_taxon_id   uuid NOT NULL REFERENCES catalog.pest_taxa(id),
  severity_scale  text NOT NULL,         -- e.g. 'horsfall_barratt', '0_5'
  severity_value  numeric(6,2),
  incidence_pct   numeric(5,2),
  sample_size     int,
  geom            geography(Point, 4326),
  notes           text,
  attachments     jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_diagnosis    jsonb,                 -- result from ML vision service
  source          text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','vision','trap')),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.pest_scoutings(org_id, plot_id, observed_at DESC);
CREATE INDEX ON karpos.pest_scoutings(pest_taxon_id);

CREATE TABLE karpos.spray_records (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  plot_id         uuid NOT NULL REFERENCES karpos.plots(id) ON DELETE CASCADE,
  applied_at      timestamptz NOT NULL,
  finished_at     timestamptz,
  applicator_id   uuid REFERENCES karpos.users(id),
  applicator_name text,
  applicator_license text,
  equipment       text,
  area_treated_ha numeric(10,3),
  water_l_ha      numeric(10,2),
  weather_temp_c  numeric(5,2),
  weather_rh_pct  numeric(5,2),
  weather_wind_ms numeric(5,2),
  ph_before       numeric(4,2),
  notes           text,
  phi_until       date,
  rei_until       timestamptz,
  status          text NOT NULL DEFAULT 'applied' CHECK (status IN ('planned','applied','voided')),
  voided_reason   text,
  attachments     jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorded_by     uuid REFERENCES karpos.users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.spray_records(org_id, plot_id, applied_at DESC);
CREATE INDEX ON karpos.spray_records(phi_until);

CREATE TABLE karpos.spray_record_items (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  spray_record_id uuid NOT NULL REFERENCES karpos.spray_records(id) ON DELETE CASCADE,
  product_id      uuid NOT NULL REFERENCES catalog.chemical_products(id),
  target_taxon_id uuid REFERENCES catalog.pest_taxa(id),
  dose_value      numeric(12,4) NOT NULL,
  dose_unit       text NOT NULL,
  total_quantity  numeric(12,4),
  total_unit      text,
  concentration_g_l numeric(12,4)
);
CREATE INDEX ON karpos.spray_record_items(spray_record_id);

CREATE TABLE karpos.disease_alerts (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  plot_id         uuid NOT NULL REFERENCES karpos.plots(id) ON DELETE CASCADE,
  model_code      text NOT NULL,         -- e.g. 'mills_apple_scab', 'tomcast', 'dmcast'
  triggered_at    timestamptz NOT NULL,
  severity        text NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  details         jsonb NOT NULL DEFAULT '{}'::jsonb,
  resolved_at     timestamptz,
  resolved_by     uuid REFERENCES karpos.users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.disease_alerts(org_id, plot_id, triggered_at DESC);
CREATE INDEX ON karpos.disease_alerts(severity) WHERE resolved_at IS NULL;
