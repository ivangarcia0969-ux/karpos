-- 0003_fito_catalog.sql
-- Catálogo de productos fitosanitarios con período de carencia (PHI) y de reingreso (REI).
-- Pre-cargado con productos registrados ICA Colombia. Cada organización puede agregar
-- productos propios marcándolos con org_id; los del catálogo global tienen org_id = NULL.

CREATE TABLE catalog.fito_products (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            uuid REFERENCES karpos.organizations(id) ON DELETE CASCADE, -- NULL = global
  commercial_name   text NOT NULL,
  active_ingredient text NOT NULL,
  registration_no   text,                     -- ICA, SAG, ANMAT, etc.
  registration_country text DEFAULT 'CO',
  formulation_type  text,                     -- SC, EC, WP, WG, SL, etc.
  category          text NOT NULL CHECK (category IN ('fungicide','insecticide','acaricide','herbicide','nematicide','bactericide','plant_growth_regulator','biological','adjuvant','fertilizer','other')),
  toxicology_class  text,                     -- I, II, III, IV (peligrosidad)
  default_phi_days  int  NOT NULL DEFAULT 0,
  default_rei_hours int,
  recommended_dose_min numeric(12,4),
  recommended_dose_max numeric(12,4),
  dose_unit         text,                     -- L/ha, kg/ha, mL/100L, g/100L
  target_pests      text[] NOT NULL DEFAULT '{}',
  target_crops      text[] NOT NULL DEFAULT '{}',
  mode_of_action    text,
  group_code        text,                     -- IRAC/FRAC/HRAC code
  manufacturer      text,
  notes             text,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
-- Idempotencia del seed: nombre comercial único globalmente (las orgs pueden agregar
-- productos propios — para esos casos crear otro índice si hace falta).
ALTER TABLE catalog.fito_products
  ADD CONSTRAINT fito_products_commercial_name_key UNIQUE (commercial_name);
CREATE INDEX ON catalog.fito_products(active_ingredient);
CREATE INDEX ON catalog.fito_products(category) WHERE is_active;
CREATE INDEX ON catalog.fito_products(org_id) WHERE org_id IS NOT NULL;
CREATE TRIGGER trg_fito_products_updated BEFORE UPDATE ON catalog.fito_products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Vincular spray_records con el producto del catálogo (opcional, no forzado por compatibilidad).
ALTER TABLE karpos.spray_records
  ADD COLUMN fito_product_id uuid REFERENCES catalog.fito_products(id);
CREATE INDEX ON karpos.spray_records(fito_product_id);
