-- 0003_iam.sql
-- Identity, memberships, roles, permissions, API keys.

CREATE TABLE karpos.users (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  oidc_subject    text UNIQUE,
  email           citext NOT NULL UNIQUE,
  full_name       text NOT NULL,
  phone           text,
  avatar_url      text,
  default_locale  text NOT NULL DEFAULT 'es-CO',
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled','deleted')),
  mfa_enrolled    boolean NOT NULL DEFAULT false,
  last_login_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON karpos.users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE karpos.roles (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid REFERENCES karpos.organizations(id) ON DELETE CASCADE,  -- null = system role
  code            text NOT NULL,
  name            text NOT NULL,
  description     text,
  permissions     text[] NOT NULL DEFAULT '{}',
  is_builtin      boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, code)
);

CREATE TABLE karpos.memberships (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES karpos.users(id) ON DELETE CASCADE,
  role_id         uuid NOT NULL REFERENCES karpos.roles(id),
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('invited','active','disabled')),
  scopes          jsonb NOT NULL DEFAULT '{}'::jsonb,  -- ABAC: { "farm_ids": ["uuid",...] }
  invited_at      timestamptz,
  accepted_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);
CREATE INDEX ON karpos.memberships(user_id);
CREATE TRIGGER trg_memberships_updated BEFORE UPDATE ON karpos.memberships
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE karpos.api_keys (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  prefix          text NOT NULL,
  hashed_secret   text NOT NULL,
  scopes          text[] NOT NULL DEFAULT '{}',
  created_by      uuid REFERENCES karpos.users(id),
  last_used_at    timestamptz,
  expires_at      timestamptz,
  revoked_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.api_keys(org_id) WHERE revoked_at IS NULL;

-- Builtin permissions (kept here for self-documentation; real source of truth is in code).
COMMENT ON COLUMN karpos.roles.permissions IS
  'Examples: farms:read, farms:write, sprays:apply, harvest:plan, billing:admin, settings:write, copilot:use';
