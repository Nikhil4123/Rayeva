CREATE TABLE IF NOT EXISTS proposals (
  id                   UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID         REFERENCES users(id) ON DELETE SET NULL,
  company_name         VARCHAR(200) NOT NULL,
  company_type         VARCHAR(100),
  monthly_revenue      NUMERIC(16,2),
  target_budget        NUMERIC(16,2),
  focus_categories     JSONB        NOT NULL DEFAULT '[]',
  sustainability_goals JSONB        NOT NULL DEFAULT '[]',
  notes                TEXT,
  ai_result            JSONB,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposals_user_id    ON proposals (user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals (created_at DESC);
