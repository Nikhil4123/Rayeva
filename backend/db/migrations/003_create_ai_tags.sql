CREATE TABLE IF NOT EXISTS ai_tags (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id           UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  primary_category     VARCHAR(100),
  sub_category         VARCHAR(100),
  confidence_score     SMALLINT    CHECK (confidence_score BETWEEN 0 AND 100),
  sustainability_tags  JSONB       NOT NULL DEFAULT '[]',
  keywords             JSONB       NOT NULL DEFAULT '[]',
  suggested_attributes JSONB       NOT NULL DEFAULT '{}',
  reasoning            TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_tags_product_id      ON ai_tags (product_id);
CREATE INDEX IF NOT EXISTS idx_ai_tags_primary_category ON ai_tags (primary_category);
CREATE INDEX IF NOT EXISTS idx_ai_tags_sustainability   ON ai_tags USING gin (sustainability_tags);
