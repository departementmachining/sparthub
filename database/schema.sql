CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warehouses (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(150),
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spare_parts (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  warehouse_id BIGINT REFERENCES warehouses(id) ON DELETE SET NULL,
  unit VARCHAR(30) NOT NULL DEFAULT 'pcs',
  stock NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_stock NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
  purchase_price NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (purchase_price >= 0),
  selling_price NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (selling_price >= 0),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_in (
  id BIGSERIAL PRIMARY KEY,
  transaction_code VARCHAR(60) NOT NULL UNIQUE,
  part_id BIGINT NOT NULL REFERENCES spare_parts(id),
  supplier_id BIGINT REFERENCES suppliers(id) ON DELETE SET NULL,
  warehouse_id BIGINT REFERENCES warehouses(id) ON DELETE SET NULL,
  quantity NUMERIC(14,2) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_out (
  id BIGSERIAL PRIMARY KEY,
  transaction_code VARCHAR(60) NOT NULL UNIQUE,
  part_id BIGINT NOT NULL REFERENCES spare_parts(id),
  warehouse_id BIGINT REFERENCES warehouses(id) ON DELETE SET NULL,
  quantity NUMERIC(14,2) NOT NULL CHECK (quantity > 0),
  recipient VARCHAR(150),
  purpose TEXT,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id BIGSERIAL PRIMARY KEY,
  part_id BIGINT NOT NULL REFERENCES spare_parts(id),
  warehouse_id BIGINT REFERENCES warehouses(id) ON DELETE SET NULL,
  movement_type VARCHAR(20) NOT NULL
    CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT')),
  quantity NUMERIC(14,2) NOT NULL CHECK (quantity > 0),
  reference_code VARCHAR(60),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spare_parts_category
  ON spare_parts(category_id);

CREATE INDEX IF NOT EXISTS idx_spare_parts_warehouse
  ON spare_parts(warehouse_id);

CREATE INDEX IF NOT EXISTS idx_stock_in_part_date
  ON stock_in(part_id, transaction_date);

CREATE INDEX IF NOT EXISTS idx_stock_out_part_date
  ON stock_out(part_id, transaction_date);

CREATE INDEX IF NOT EXISTS idx_stock_movements_part_date
  ON stock_movements(part_id, created_at);