-- 0002_sanidad_harvest_plans.sql
-- Sanidad+ (pest scouting + spray records, append-only for GLOBALG.A.P.) and
-- Cosecha360 plan layer (production forecast preceding harvest_lots).

-- ─────────────────────────────────────────────────────────────
-- Pest / disease scouting
-- ─────────────────────────────────────────────────────────────

CREATE TABLE karpos.pest_scoutings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  plot_id         uuid NOT NULL REFERENCES karpos.plots(id) ON DELETE CASCADE,
  observed_on     date NOT NULL,
  observer_id     uuid REFERENCES karpos.users(id),
  target          text NOT NULL,             -- e.g. 'Spodoptera frugiperda', 'Phytophthora'
  category        text NOT NULL CHECK (category IN ('pest','disease','weed','beneficial','abiotic')),
  severity        text NOT NULL CHECK (severity IN ('none','low','moderate','high','severe')),
  incidence_pct   numeric(5,2),               -- % of sample showing symptoms
  sample_size     int,
  stage_bbch      text,
  notes           text,
  photos          jsonb NOT NULL DEFAULT '[]'::jsonb,  -- list of S3 keys
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.pest_scoutings(org_id, plot_id, observed_on DESC);
CREATE INDEX ON karpos.pest_scoutings(org_id, target);

-- ─────────────────────────────────────────────────────────────
-- Spray records (append-only — required by GLOBALG.A.P. IFA v6 CB 7.6).
-- Void via spray_records.voided_at, never DELETE/UPDATE rows.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE karpos.spray_records (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  plot_id         uuid NOT NULL REFERENCES karpos.plots(id) ON DELETE CASCADE,
  scouting_id     uuid REFERENCES karpos.pest_scoutings(id),
  applied_at      timestamptz NOT NULL,
  ended_at        timestamptz,
  operator        text NOT NULL,
  target          text,
  product_name    text NOT NULL,
  active_ingredient text NOT NULL,
  registration_no text,                       -- ICA / SAG / equivalent
  dose_amount     numeric(12,4) NOT NULL,
  dose_unit       text NOT NULL,              -- 'L/ha','kg/ha','mL/100L'
  water_l_per_ha  numeric(10,2),
  area_ha         numeric(10,3) NOT NULL,
  phi_days        int NOT NULL,               -- Pre-Harvest Interval
  rei_hours       int,                        -- Re-Entry Interval
  equipment       text,
  wind_kmh        numeric(5,2),
  temp_c          numeric(5,2),
  rh_pct          numeric(5,2),
  notes           text,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  voided_at       timestamptz,
  voided_by       uuid REFERENCES karpos.users(id),
  void_reason     text,
  recorded_by     uuid REFERENCES karpos.users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.spray_records(org_id, plot_id, applied_at DESC);
CREATE INDEX ON karpos.spray_records(org_id, active_ingredient);
CREATE INDEX ON karpos.spray_records(plot_id, applied_at DESC) WHERE voided_at IS NULL;

-- ─────────────────────────────────────────────────────────────
-- Harvest plans (production forecast before lots are recorded)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE karpos.harvest_plans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  plot_id         uuid NOT NULL REFERENCES karpos.plots(id) ON DELETE CASCADE,
  season_year     int NOT NULL,
  expected_start_date date,
  expected_end_date   date,
  expected_yield_kg   numeric(14,2),
  expected_yield_kg_ha numeric(10,2),
  forecast_method text,
  forecast_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','in_progress','closed','cancelled')),
  notes           text,
  recorded_by     uuid REFERENCES karpos.users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plot_id, season_year)
);
CREATE INDEX ON karpos.harvest_plans(org_id, season_year);
CREATE TRIGGER trg_harvest_plans_updated BEFORE UPDATE ON karpos.harvest_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE karpos.harvest_lots
  ADD COLUMN plan_id uuid REFERENCES karpos.harvest_plans(id),
  ADD COLUMN gross_kg numeric(12,2),
  ADD COLUMN tare_kg numeric(12,2) DEFAULT 0,
  ADD COLUMN containers_count int;
