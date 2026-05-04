-- 0012_certifications.sql
-- CertiBox: documents, certifications, audit checklists.

CREATE TABLE catalog.certification_schemes (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  code            text NOT NULL UNIQUE,
  name            text NOT NULL,
  authority       text,
  scope           text,
  url             text
);

CREATE TABLE karpos.certifications (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  farm_id         uuid REFERENCES karpos.farms(id) ON DELETE CASCADE,
  scheme_id       uuid NOT NULL REFERENCES catalog.certification_schemes(id),
  certificate_no  text,
  issued_on       date,
  valid_from      date,
  valid_until     date,
  status          text NOT NULL CHECK (status IN ('draft','active','expired','suspended','withdrawn')),
  scope_text      text,
  certifier       text,
  attachments     jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.certifications(org_id, status);
CREATE INDEX ON karpos.certifications(valid_until) WHERE status = 'active';
CREATE TRIGGER trg_certifications_updated BEFORE UPDATE ON karpos.certifications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE karpos.documents (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  scope_type      text NOT NULL CHECK (scope_type IN ('organization','farm','plot','crew','worker','certification','other')),
  scope_id        uuid,
  title           text NOT NULL,
  category        text,
  storage_url     text NOT NULL,
  mime_type       text,
  size_bytes      bigint,
  checksum_sha256 text,
  expires_at      date,
  uploaded_by     uuid REFERENCES karpos.users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.documents(org_id, scope_type, scope_id);
CREATE INDEX ON karpos.documents(expires_at) WHERE expires_at IS NOT NULL;

CREATE TABLE karpos.audit_checklists (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  certification_id uuid REFERENCES karpos.certifications(id) ON DELETE CASCADE,
  scheme_id       uuid NOT NULL REFERENCES catalog.certification_schemes(id),
  control_point   text NOT NULL,
  level           text CHECK (level IN ('major_must','minor_must','recommendation')),
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','compliant','non_compliant','not_applicable')),
  evidence_doc_ids uuid[] NOT NULL DEFAULT '{}',
  notes           text,
  reviewed_by     uuid REFERENCES karpos.users(id),
  reviewed_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.audit_checklists(org_id, certification_id);
CREATE TRIGGER trg_audit_checklists_updated BEFORE UPDATE ON karpos.audit_checklists
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
