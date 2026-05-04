-- 0013_audit_log.sql
-- Immutable, hash-chained event log for sensitive domains.
-- See ADR-0003.

CREATE TABLE audit.audit_events (
  event_id        uuid NOT NULL DEFAULT uuid_v7(),
  org_id          uuid NOT NULL,
  aggregate_type  text NOT NULL,
  aggregate_id    uuid NOT NULL,
  seq             bigint NOT NULL,
  event_type      text NOT NULL,
  event_version   int NOT NULL DEFAULT 1,
  payload         jsonb NOT NULL,
  actor_id        uuid,
  actor_role      text,
  client_meta     jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at     timestamptz NOT NULL,
  recorded_at     timestamptz NOT NULL DEFAULT now(),
  prev_hash       bytea,
  hash            bytea NOT NULL,
  PRIMARY KEY (event_id, recorded_at),
  UNIQUE (org_id, aggregate_type, aggregate_id, seq, recorded_at)
);
SELECT create_hypertable('audit.audit_events', 'recorded_at', chunk_time_interval => INTERVAL '30 days', if_not_exists => TRUE);
CREATE INDEX ON audit.audit_events(org_id, aggregate_type, aggregate_id, seq);
CREATE INDEX ON audit.audit_events(org_id, event_type, recorded_at DESC);

-- Compute hash on INSERT.
CREATE OR REPLACE FUNCTION audit.compute_event_hash() RETURNS trigger AS $$
DECLARE
  prev bytea;
  payload_text text;
BEGIN
  SELECT hash INTO prev
    FROM audit.audit_events
   WHERE org_id = NEW.org_id
     AND aggregate_type = NEW.aggregate_type
     AND aggregate_id = NEW.aggregate_id
   ORDER BY seq DESC
   LIMIT 1;
  NEW.prev_hash := prev;
  payload_text := COALESCE(prev::text, '') || NEW.org_id::text || NEW.aggregate_type || NEW.aggregate_id::text
                 || NEW.seq::text || NEW.event_type || NEW.payload::text || COALESCE(NEW.actor_id::text, '')
                 || NEW.occurred_at::text;
  NEW.hash := digest(payload_text, 'sha256');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_events_hash BEFORE INSERT ON audit.audit_events
  FOR EACH ROW EXECUTE FUNCTION audit.compute_event_hash();

-- Hard-block UPDATE/DELETE on the audit log for application roles.
CREATE OR REPLACE FUNCTION audit.block_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit.audit_events is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_events_no_update BEFORE UPDATE ON audit.audit_events
  FOR EACH ROW EXECUTE FUNCTION audit.block_mutation();
CREATE TRIGGER trg_audit_events_no_delete BEFORE DELETE ON audit.audit_events
  FOR EACH ROW EXECUTE FUNCTION audit.block_mutation();

-- Verification query (run as a scheduled job).
CREATE OR REPLACE FUNCTION audit.verify_chain(p_org uuid, p_type text, p_aggregate uuid)
RETURNS TABLE (broken_seq bigint) AS $$
DECLARE
  r record;
  expected_prev bytea;
BEGIN
  expected_prev := NULL;
  FOR r IN
    SELECT seq, prev_hash, hash
      FROM audit.audit_events
     WHERE org_id = p_org AND aggregate_type = p_type AND aggregate_id = p_aggregate
     ORDER BY seq
  LOOP
    IF (expected_prev IS DISTINCT FROM r.prev_hash) THEN
      broken_seq := r.seq;
      RETURN NEXT;
    END IF;
    expected_prev := r.hash;
  END LOOP;
END;
$$ LANGUAGE plpgsql STABLE;
