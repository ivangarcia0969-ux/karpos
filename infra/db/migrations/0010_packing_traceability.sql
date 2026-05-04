-- 0010_packing_traceability.sql
-- Empaque y Frío + Trazabilidad: packing lots, pallets, containers, shipments, traceability links.
-- References: GS1 General Specifications (SSCC, GTIN), GS1 Logistic Label.

CREATE TABLE karpos.packing_lots (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  packing_house   text NOT NULL,
  lot_code        text NOT NULL,
  packed_on       date NOT NULL,
  variety_id      uuid REFERENCES catalog.varieties(id),
  size_grade      text,
  quality_grade   text,
  net_kg          numeric(14,2) NOT NULL,
  packages_count  int NOT NULL,
  package_type    text,
  brand           text,
  status          text NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock','dispatched','voided')),
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, lot_code)
);
CREATE INDEX ON karpos.packing_lots(org_id, packed_on DESC);

CREATE TABLE karpos.pallets (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  packing_lot_id  uuid NOT NULL REFERENCES karpos.packing_lots(id) ON DELETE CASCADE,
  sscc            text NOT NULL UNIQUE,
  pallet_code     text NOT NULL,
  packages_count  int NOT NULL,
  net_kg          numeric(14,2) NOT NULL,
  cold_room       text,
  status          text NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock','loaded','dispatched','voided')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, pallet_code)
);
CREATE INDEX ON karpos.pallets(org_id, packing_lot_id);
CREATE INDEX ON karpos.pallets(status);

CREATE TABLE karpos.containers (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  container_no    text NOT NULL,
  seal_no         text,
  carrier         text,
  destination_country char(2),
  destination_port    text,
  loaded_at       timestamptz,
  departed_at     timestamptz,
  arrived_at      timestamptz,
  temperature_set_c numeric(5,2),
  atmosphere_o2_pct numeric(5,2),
  atmosphere_co2_pct numeric(5,2),
  status          text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','loading','in_transit','delivered','rejected')),
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, container_no)
);
CREATE INDEX ON karpos.containers(status);

CREATE TABLE karpos.shipments (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  container_id    uuid REFERENCES karpos.containers(id) ON DELETE SET NULL,
  shipment_code   text NOT NULL,
  buyer           text,
  buyer_country   char(2),
  expected_arrival date,
  status          text NOT NULL CHECK (status IN ('booked','in_transit','delivered','rejected','closed')),
  documents       jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, shipment_code)
);

-- Genealogy graph: a pallet links back to packing_lots, which link to harvest_lots, which link to plots.
-- We materialize the graph for fast query.
CREATE TABLE karpos.traceability_links (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  parent_type     text NOT NULL CHECK (parent_type IN ('plot','harvest_lot','packing_lot','pallet','container','shipment')),
  parent_id       uuid NOT NULL,
  child_type      text NOT NULL CHECK (child_type IN ('harvest_lot','packing_lot','pallet','container','shipment')),
  child_id        uuid NOT NULL,
  share_kg        numeric(14,2),
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.traceability_links(org_id, parent_type, parent_id);
CREATE INDEX ON karpos.traceability_links(org_id, child_type, child_id);
