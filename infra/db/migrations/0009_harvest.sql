-- 0009_harvest.sql
-- Cosecha360: harvest plans, lots, weighbridge tickets.

CREATE TABLE karpos.harvest_plans (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  season_year     int NOT NULL,
  plot_id         uuid NOT NULL REFERENCES karpos.plots(id) ON DELETE CASCADE,
  expected_start_date date,
  expected_end_date   date,
  expected_yield_kg numeric(14,2),
  expected_yield_kg_ha numeric(12,2),
  forecast_method text,
  forecast_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','active','closed')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, season_year, plot_id)
);
CREATE INDEX ON karpos.harvest_plans(org_id, season_year);
CREATE TRIGGER trg_harvest_plans_updated BEFORE UPDATE ON karpos.harvest_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE karpos.harvest_lots (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  plan_id         uuid REFERENCES karpos.harvest_plans(id) ON DELETE SET NULL,
  plot_id         uuid NOT NULL REFERENCES karpos.plots(id) ON DELETE CASCADE,
  lot_code        text NOT NULL,
  harvested_on    date NOT NULL,
  harvested_at    timestamptz,
  variety_id      uuid REFERENCES catalog.varieties(id),
  crew_id         uuid REFERENCES karpos.crews(id),
  gross_kg        numeric(14,2) NOT NULL DEFAULT 0,
  tare_kg         numeric(14,2) NOT NULL DEFAULT 0,
  net_kg          numeric(14,2) GENERATED ALWAYS AS (gross_kg - tare_kg) STORED,
  containers_count int,
  container_avg_kg numeric(10,2),
  quality_grade   text,
  status          text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','dispatched','voided')),
  voided_reason   text,
  geom            geography(Point, 4326),
  notes           text,
  recorded_by     uuid REFERENCES karpos.users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, lot_code)
);
CREATE INDEX ON karpos.harvest_lots(org_id, plot_id, harvested_on DESC);
CREATE INDEX ON karpos.harvest_lots(status);

CREATE TABLE karpos.weighbridge_tickets (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  lot_id          uuid NOT NULL REFERENCES karpos.harvest_lots(id) ON DELETE CASCADE,
  ticket_number   text NOT NULL,
  scale_id        text,
  weighed_at      timestamptz NOT NULL,
  vehicle_plate   text,
  driver          text,
  gross_kg        numeric(14,2) NOT NULL,
  tare_kg         numeric(14,2) NOT NULL,
  net_kg          numeric(14,2) GENERATED ALWAYS AS (gross_kg - tare_kg) STORED,
  attachments     jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorded_by     uuid REFERENCES karpos.users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, ticket_number)
);
CREATE INDEX ON karpos.weighbridge_tickets(org_id, lot_id, weighed_at DESC);
