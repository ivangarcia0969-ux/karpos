-- 0004_fito_clone.sql
-- Permite "adoptar" un producto global al catálogo de la organización.
-- Unique cambia de (commercial_name) a (org_id, commercial_name) con NULLS NOT DISTINCT
-- para que el mismo nombre pueda existir como global (org_id NULL) y como copia per-org,
-- pero no duplicarse dentro del mismo scope.

ALTER TABLE catalog.fito_products
  DROP CONSTRAINT IF EXISTS fito_products_commercial_name_key;

ALTER TABLE catalog.fito_products
  ADD CONSTRAINT fito_products_org_name_key
    UNIQUE NULLS NOT DISTINCT (org_id, commercial_name);

-- Trazabilidad: si el producto vino de un clone, apuntá al global original.
ALTER TABLE catalog.fito_products
  ADD COLUMN cloned_from_id uuid REFERENCES catalog.fito_products(id);

CREATE INDEX ON catalog.fito_products(cloned_from_id) WHERE cloned_from_id IS NOT NULL;
