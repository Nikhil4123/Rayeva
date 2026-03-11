CREATE TABLE IF NOT EXISTS products (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID         REFERENCES users(id) ON DELETE SET NULL,
  name        VARCHAR(300) NOT NULL,
  description TEXT         NOT NULL,
  brand       VARCHAR(100),
  price       NUMERIC(12,2),
  image_url   TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_user_id   ON products (user_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);
