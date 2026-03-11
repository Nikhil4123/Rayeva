CREATE TABLE IF NOT EXISTS ai_logs (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  module            VARCHAR(50) NOT NULL,
  user_id           UUID        REFERENCES users(id) ON DELETE SET NULL,
  request_payload   JSONB,
  response_payload  JSONB,
  prompt_tokens     INTEGER     NOT NULL DEFAULT 0,
  candidate_tokens  INTEGER     NOT NULL DEFAULT 0,
  total_tokens      INTEGER     NOT NULL DEFAULT 0,
  latency_ms        INTEGER     NOT NULL DEFAULT 0,
  success           BOOLEAN     NOT NULL DEFAULT true,
  error_message     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_module     ON ai_logs (module);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_success    ON ai_logs (success);
