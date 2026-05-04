-- 0005_phenology.sql
-- Fenoflow: phenological profiles per species/variety, BBCH stages, observed events, growing degree days.
-- References: BBCH-Skala (Bundessortenamt), Meier 2001; FAO Plant Production and Protection.

CREATE TABLE catalog.phenology_stages (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  bbch_code       text NOT NULL,
  principal_stage int NOT NULL CHECK (principal_stage BETWEEN 0 AND 9),
  secondary_stage int CHECK (secondary_stage BETWEEN 0 AND 9),
  name_es         text NOT NULL,
  name_en         text NOT NULL,
  description     text,
  applies_to      text[] NOT NULL DEFAULT '{}',
  UNIQUE (bbch_code, applies_to)
);

CREATE TABLE karpos.phenology_profiles (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  species_id      uuid NOT NULL REFERENCES catalog.crop_species(id),
  variety_id      uuid REFERENCES catalog.varieties(id),
  name            text NOT NULL,
  base_temp_c     numeric(4,1) NOT NULL DEFAULT 10.0,
  upper_temp_c    numeric(4,1),
  gdd_method      text NOT NULL DEFAULT 'single_triangle'
                  CHECK (gdd_method IN ('average','single_triangle','double_triangle','single_sine','double_sine')),
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.phenology_profiles(org_id, species_id);
CREATE TRIGGER trg_phenology_profiles_updated BEFORE UPDATE ON karpos.phenology_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE karpos.phenology_profile_stages (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  profile_id      uuid NOT NULL REFERENCES karpos.phenology_profiles(id) ON DELETE CASCADE,
  bbch_code       text NOT NULL,
  expected_gdd    numeric(8,2),
  expected_doy_from int,
  expected_doy_to   int,
  alert_window_days int,
  notes           text,
  position        int NOT NULL,
  UNIQUE (profile_id, bbch_code)
);
CREATE INDEX ON karpos.phenology_profile_stages(profile_id, position);

CREATE TABLE karpos.phenology_events (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  plot_id         uuid NOT NULL REFERENCES karpos.plots(id) ON DELETE CASCADE,
  observed_at     timestamptz NOT NULL,
  bbch_code       text NOT NULL,
  observed_pct    numeric(5,2),
  observer_id     uuid REFERENCES karpos.users(id),
  notes           text,
  attachments     jsonb NOT NULL DEFAULT '[]'::jsonb,
  source          text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','satellite','model','imported')),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.phenology_events(org_id, plot_id, observed_at DESC);

-- Growing-degree-day daily series: Timescale hypertable, partitioned by day.
CREATE TABLE karpos.gdd_daily (
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  plot_id         uuid NOT NULL REFERENCES karpos.plots(id) ON DELETE CASCADE,
  observed_on     date NOT NULL,
  tmin_c          numeric(5,2),
  tmax_c          numeric(5,2),
  gdd             numeric(8,3) NOT NULL,
  cumulative_gdd  numeric(10,3),
  base_temp_c     numeric(4,1) NOT NULL,
  source          text NOT NULL,
  PRIMARY KEY (org_id, plot_id, observed_on)
);
SELECT create_hypertable('karpos.gdd_daily', 'observed_on', chunk_time_interval => INTERVAL '90 days', if_not_exists => TRUE);
CREATE INDEX ON karpos.gdd_daily(plot_id, observed_on DESC);

-- Helper: GDD by single-triangle method (Zalom et al. 1983).
CREATE OR REPLACE FUNCTION karpos.gdd_single_triangle(tmin numeric, tmax numeric, base_t numeric, upper_t numeric DEFAULT NULL)
RETURNS numeric AS $$
DECLARE
  avg_t numeric;
BEGIN
  IF tmax IS NULL OR tmin IS NULL THEN RETURN NULL; END IF;
  IF tmax <= base_t THEN RETURN 0; END IF;
  avg_t := (tmin + tmax) / 2.0;
  IF tmin >= base_t THEN
    IF upper_t IS NOT NULL AND avg_t > upper_t THEN RETURN upper_t - base_t; END IF;
    RETURN avg_t - base_t;
  ELSE
    RETURN ((tmax - base_t)^2) / (2.0 * (tmax - tmin));
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
