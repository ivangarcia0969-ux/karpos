-- 0002_organizations.sql
-- Tenants, plans, subscriptions, billing.

CREATE TABLE karpos.organizations (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  legal_name      text NOT NULL,
  display_name    text NOT NULL,
  slug            citext NOT NULL UNIQUE,
  country_code    char(2) NOT NULL,
  default_locale  text NOT NULL DEFAULT 'es-CO',
  default_currency char(3) NOT NULL DEFAULT 'USD',
  default_timezone text NOT NULL DEFAULT 'America/Bogota',
  tax_id          text,
  billing_email   citext,
  status          text NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','suspended','trial','closed')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_organizations_updated BEFORE UPDATE ON karpos.organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE catalog.plans (
  code           text PRIMARY KEY,
  name           text NOT NULL,
  tier           text NOT NULL CHECK (tier IN ('starter','pro','enterprise')),
  price_usd_month numeric(10,2),
  price_usd_year  numeric(10,2),
  max_users      int,
  max_hectares   int,
  max_farms      int,
  modules        text[] NOT NULL DEFAULT '{}',
  features       jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_listed      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE karpos.subscriptions (
  id             uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id         uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  plan_code      text NOT NULL REFERENCES catalog.plans(code),
  billing_provider text NOT NULL CHECK (billing_provider IN ('stripe','wompi','manual')),
  external_id    text,
  status         text NOT NULL CHECK (status IN ('trialing','active','past_due','canceled','unpaid')),
  current_period_start timestamptz,
  current_period_end   timestamptz,
  cancel_at      timestamptz,
  trial_end      timestamptz,
  metadata       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.subscriptions(org_id);
CREATE INDEX ON karpos.subscriptions(status);
CREATE TRIGGER trg_subscriptions_updated BEFORE UPDATE ON karpos.subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE karpos.invoices (
  id             uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id         uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES karpos.subscriptions(id),
  number         text,
  status         text NOT NULL CHECK (status IN ('draft','open','paid','void','uncollectible')),
  amount_due     numeric(12,2) NOT NULL,
  amount_paid    numeric(12,2) NOT NULL DEFAULT 0,
  currency       char(3) NOT NULL,
  due_at         timestamptz,
  paid_at        timestamptz,
  pdf_url        text,
  external_id    text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.invoices(org_id, status);

CREATE TABLE karpos.usage_meters (
  id             uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id         uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  meter          text NOT NULL,
  period_start   date NOT NULL,
  period_end     date NOT NULL,
  value_numeric  numeric(20,4) NOT NULL DEFAULT 0,
  metadata       jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (org_id, meter, period_start)
);
