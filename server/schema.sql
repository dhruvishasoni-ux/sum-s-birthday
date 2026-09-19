CREATE TABLE IF NOT EXISTS app_records (
  store_name TEXT NOT NULL,
  id TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (store_name, id)
);

CREATE INDEX IF NOT EXISTS app_records_store_name_idx ON app_records (store_name);
