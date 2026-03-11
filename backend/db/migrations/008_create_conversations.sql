CREATE TABLE IF NOT EXISTS conversations (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id   UUID        NOT NULL,
  user_id      UUID        REFERENCES users(id) ON DELETE SET NULL,
  user_message TEXT        NOT NULL,
  ai_response  TEXT        NOT NULL,
  intent       VARCHAR(50),
  confidence   SMALLINT    CHECK (confidence BETWEEN 0 AND 100),
  escalate     BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations (session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id    ON conversations (user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations (created_at DESC);
