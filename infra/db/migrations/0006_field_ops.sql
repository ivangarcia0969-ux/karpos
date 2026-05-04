-- 0006_field_ops.sql
-- Bitácora Verde + Cuadrillas: field operations, crews, workers, payroll.

CREATE TABLE catalog.operation_types (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  code            text NOT NULL UNIQUE,
  name_es         text NOT NULL,
  name_en         text NOT NULL,
  category        text NOT NULL CHECK (category IN ('pruning','training','thinning','weeding','fertilization','irrigation','sanitary','harvest','other')),
  unit            text,
  applies_to      text[] NOT NULL DEFAULT '{}',
  notes           text
);

CREATE TABLE karpos.crews (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  leader_name     text,
  contractor      text,
  default_hourly_rate numeric(10,2),
  currency        char(3) NOT NULL DEFAULT 'USD',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.crews(org_id);
CREATE TRIGGER trg_crews_updated BEFORE UPDATE ON karpos.crews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE karpos.workers (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  crew_id         uuid REFERENCES karpos.crews(id) ON DELETE SET NULL,
  document_id     text,
  full_name       text NOT NULL,
  phone           text,
  hourly_rate     numeric(10,2),
  piecework_rate  numeric(10,4),
  hire_date       date,
  active          boolean NOT NULL DEFAULT true,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, document_id)
);
CREATE INDEX ON karpos.workers(org_id);
CREATE INDEX ON karpos.workers(crew_id) WHERE active = true;
CREATE TRIGGER trg_workers_updated BEFORE UPDATE ON karpos.workers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE karpos.field_operations (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  plot_id         uuid NOT NULL REFERENCES karpos.plots(id) ON DELETE CASCADE,
  operation_type_id uuid NOT NULL REFERENCES catalog.operation_types(id),
  performed_at    timestamptz NOT NULL,
  finished_at     timestamptz,
  crew_id         uuid REFERENCES karpos.crews(id),
  workers_count   int,
  area_covered_ha numeric(10,3),
  output_quantity numeric(12,3),
  output_unit     text,
  cost_amount     numeric(12,2),
  cost_currency   char(3),
  geom            geography(Point, 4326),
  notes           text,
  attachments     jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  recorded_by     uuid REFERENCES karpos.users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.field_operations(org_id, plot_id, performed_at DESC);
CREATE INDEX ON karpos.field_operations(operation_type_id);
CREATE INDEX ON karpos.field_operations(crew_id);
CREATE TRIGGER trg_field_operations_updated BEFORE UPDATE ON karpos.field_operations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE karpos.worker_outputs (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  field_operation_id uuid NOT NULL REFERENCES karpos.field_operations(id) ON DELETE CASCADE,
  worker_id       uuid NOT NULL REFERENCES karpos.workers(id),
  hours           numeric(6,2),
  units           numeric(12,3),
  unit            text,
  amount_paid     numeric(12,2),
  currency        char(3),
  recorded_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.worker_outputs(org_id, worker_id, recorded_at DESC);

CREATE TABLE karpos.payroll_periods (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  period_start    date NOT NULL,
  period_end      date NOT NULL,
  status          text NOT NULL CHECK (status IN ('open','closed','exported','paid')),
  closed_at       timestamptz,
  closed_by       uuid REFERENCES karpos.users(id),
  exported_at     timestamptz,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (org_id, period_start, period_end)
);
