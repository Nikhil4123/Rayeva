CREATE TABLE IF NOT EXISTS impact_reports (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID        NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  user_id         UUID        REFERENCES users(id) ON DELETE SET NULL,
  analysis_depth  VARCHAR(20) NOT NULL DEFAULT 'standard',
  overall_score   SMALLINT    CHECK (overall_score BETWEEN 0 AND 100),
  grade           CHAR(1)     CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
  ai_result       JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_impact_reports_order_id ON impact_reports (order_id);
CREATE INDEX IF NOT EXISTS idx_impact_reports_user_id  ON impact_reports (user_id);
