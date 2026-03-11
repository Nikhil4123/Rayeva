CREATE TABLE IF NOT EXISTS orders (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID         REFERENCES users(id) ON DELETE SET NULL,
  external_ref VARCHAR(100),
  items        JSONB        NOT NULL DEFAULT '[]',
  total_value  NUMERIC(12,2),
  currency     VARCHAR(3)   NOT NULL DEFAULT 'USD',
  status       VARCHAR(30)  NOT NULL DEFAULT 'pending',
  ordered_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
