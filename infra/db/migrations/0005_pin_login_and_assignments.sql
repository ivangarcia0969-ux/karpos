-- 0005_pin_login_and_assignments.sql
-- Integración de ideas de AgroControl y SAM a Karpos

-- 1. Soporte para Login con PIN (Kiosk mode para operarios)
ALTER TABLE karpos.users ADD COLUMN pin_hash text;

-- 2. Workflow de Órdenes de Trabajo, Asignaciones y Ejecuciones
CREATE TABLE karpos.work_orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  farm_id         uuid NOT NULL REFERENCES karpos.farms(id) ON DELETE CASCADE,
  code            text NOT NULL,
  planned_date    date NOT NULL,
  status          text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  operation_type  text NOT NULL,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_work_orders_updated BEFORE UPDATE ON karpos.work_orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE karpos.assignments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  work_order_id   uuid NOT NULL REFERENCES karpos.work_orders(id) ON DELETE CASCADE,
  plot_id         uuid NOT NULL REFERENCES karpos.plots(id) ON DELETE CASCADE,
  assignee_id     uuid REFERENCES karpos.users(id), -- Operario asignado
  supervisor_id   uuid REFERENCES karpos.users(id), -- Supervisor
  status          text NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  assigned_area_ha numeric(10,3),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_assignments_updated BEFORE UPDATE ON karpos.assignments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE karpos.executions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  assignment_id   uuid NOT NULL REFERENCES karpos.assignments(id) ON DELETE CASCADE,
  started_at      timestamptz NOT NULL DEFAULT now(),
  ended_at        timestamptz,
  executed_area_ha numeric(10,3),
  status          text NOT NULL DEFAULT 'EN_EJECUCION' CHECK (status IN ('EN_EJECUCION', 'FINALIZADO', 'FIRMADO')),
  signature_url   text,
  receipt_url     text,
  verified_by     uuid REFERENCES karpos.users(id), -- Técnico que firma
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_executions_updated BEFORE UPDATE ON karpos.executions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
