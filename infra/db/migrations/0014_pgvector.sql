-- 0014_pgvector.sql
-- Karpos IQ: embedding store for RAG over the agronomic corpus and tenant data.

CREATE TABLE karpos.knowledge_documents (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid REFERENCES karpos.organizations(id) ON DELETE CASCADE,  -- null = global corpus
  source          text NOT NULL,
  source_url      text,
  title           text NOT NULL,
  language        text NOT NULL DEFAULT 'es',
  topics          text[] NOT NULL DEFAULT '{}',
  species_codes   text[] NOT NULL DEFAULT '{}',
  citation        text,
  license         text,
  ingested_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.knowledge_documents USING gin(topics);
CREATE INDEX ON karpos.knowledge_documents USING gin(species_codes);

CREATE TABLE karpos.knowledge_chunks (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  document_id     uuid NOT NULL REFERENCES karpos.knowledge_documents(id) ON DELETE CASCADE,
  org_id          uuid REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  chunk_index     int NOT NULL,
  content         text NOT NULL,
  embedding       vector(1024),
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX ON karpos.knowledge_chunks(document_id);
CREATE INDEX ON karpos.knowledge_chunks USING hnsw (embedding vector_cosine_ops);

CREATE TABLE karpos.copilot_sessions (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES karpos.users(id),
  title           text,
  context         jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz
);
CREATE INDEX ON karpos.copilot_sessions(org_id, user_id, created_at DESC);

CREATE TABLE karpos.copilot_messages (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  session_id      uuid NOT NULL REFERENCES karpos.copilot_sessions(id) ON DELETE CASCADE,
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('user','assistant','system','tool')),
  content         text NOT NULL,
  tool_calls      jsonb,
  citations       jsonb NOT NULL DEFAULT '[]'::jsonb,
  tokens_in       int,
  tokens_out      int,
  model           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.copilot_messages(session_id, created_at);
