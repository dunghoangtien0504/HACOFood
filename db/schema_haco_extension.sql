-- ============================================================
-- HACO Food OS — F&B Extension Schema (9 tables)
-- Chạy SAU db/schema.sql
-- ============================================================

-- ============================================================
-- F&B-1: Nguyên liệu (Ingredients / SKUs)
-- ============================================================
CREATE TABLE ingredients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code            TEXT NOT NULL,
  name            TEXT NOT NULL,
  category        TEXT,           -- thịt, rau, gia vị, bao bì, nguyên phụ liệu...
  unit            TEXT NOT NULL,  -- kg, lít, cái, hộp
  unit_cost       BIGINT DEFAULT 0,  -- VND/unit
  min_stock       NUMERIC(10,3) DEFAULT 0,
  reorder_point   NUMERIC(10,3) DEFAULT 0,
  shelf_life_days INT,
  storage_temp    TEXT,           -- room, cold (2-8°C), frozen (-18°C)
  allergen_tags   TEXT[] DEFAULT '{}',
  supplier_id     UUID,           -- FK added after suppliers
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

-- ============================================================
-- F&B-2: Nhà cung cấp
-- ============================================================
CREATE TABLE suppliers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code            TEXT NOT NULL,
  name            TEXT NOT NULL,
  tax_id          TEXT,
  contact_name    TEXT,
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  payment_terms   TEXT DEFAULT '30_days',  -- 30_days, 15_days, cod, prepaid
  lead_time_days  INT DEFAULT 3,
  rating          NUMERIC(3,1),  -- 1-5
  categories      TEXT[] DEFAULT '{}',   -- what they supply
  is_active       BOOLEAN DEFAULT TRUE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

-- FK suppliers → ingredients
ALTER TABLE ingredients
  ADD CONSTRAINT ingredients_supplier_id_fkey
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id);

-- ============================================================
-- F&B-3: Món ăn / Sản phẩm
-- ============================================================
CREATE TABLE dishes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code            TEXT NOT NULL,
  name            TEXT NOT NULL,
  category        TEXT,      -- combo, à-la-carte, nước, tráng miệng, set...
  sale_price      BIGINT NOT NULL,   -- VND
  target_food_cost_pct NUMERIC(5,4) DEFAULT 0.30,  -- mục tiêu food cost %
  calories        INT,
  description     TEXT,
  image_url       TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  allergen_tags   TEXT[] DEFAULT '{}',
  pos_sku         TEXT,       -- SKU trong POS (CukCuk / Sapo)
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

-- ============================================================
-- F&B-4: Công thức / BOM (Bill of Materials)
-- ============================================================
CREATE TABLE recipes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dish_id         UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  version         TEXT DEFAULT '1.0',
  yield_qty       NUMERIC(10,3) DEFAULT 1,  -- số khẩu phần mỗi lần nấu
  yield_unit      TEXT DEFAULT 'portion',
  prep_time_mins  INT DEFAULT 15,
  cook_time_mins  INT DEFAULT 20,
  instructions    TEXT,
  approved_by     UUID REFERENCES employees(id),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recipe_ingredients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id       UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id   UUID NOT NULL REFERENCES ingredients(id),
  quantity        NUMERIC(10,4) NOT NULL,  -- per yield_qty
  unit            TEXT NOT NULL,
  waste_pct       NUMERIC(5,4) DEFAULT 0.05,  -- 5% waste default
  notes           TEXT,
  UNIQUE(recipe_id, ingredient_id)
);

-- ============================================================
-- F&B-5: Kho hàng / Tồn kho
-- ============================================================
CREATE TABLE inventory_locations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  name            TEXT NOT NULL,  -- Kho trung tâm, Bếp chính, Bếp phụ, Kho lạnh
  code            TEXT NOT NULL,
  type            TEXT DEFAULT 'storage',  -- storage, kitchen, cold_room, freezer
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

CREATE TABLE inventory_movements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  location_id     UUID REFERENCES inventory_locations(id),
  ingredient_id   UUID NOT NULL REFERENCES ingredients(id),
  movement_type   TEXT NOT NULL,   -- import (nhập), export (xuất), transfer, adjustment, waste
  quantity        NUMERIC(10,4) NOT NULL,
  unit            TEXT NOT NULL,
  unit_cost       BIGINT,          -- cost at time of movement
  total_cost      BIGINT,
  reference_no    TEXT,            -- PO number / invoice
  supplier_id     UUID REFERENCES suppliers(id),
  notes           TEXT,
  recorded_by     UUID REFERENCES employees(id),
  movement_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inv_movements_date ON inventory_movements(company_id, movement_date DESC);
CREATE INDEX idx_inv_movements_ingredient ON inventory_movements(ingredient_id, movement_date DESC);

-- ============================================================
-- F&B-6: Doanh thu ngày / Daily Sales
-- ============================================================
CREATE TABLE daily_sales (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  sale_date       DATE NOT NULL,
  channel         TEXT NOT NULL,  -- b2b (đặt cơm công ty), b2c (walk-in), show (sự kiện/show)
  location_id     UUID REFERENCES inventory_locations(id),
  gross_revenue   BIGINT NOT NULL,
  discount        BIGINT DEFAULT 0,
  net_revenue     BIGINT NOT NULL,
  order_count     INT DEFAULT 0,
  covers          INT DEFAULT 0,   -- số khách
  aov             BIGINT,          -- average order value
  food_cost       BIGINT DEFAULT 0,
  food_cost_pct   NUMERIC(5,4),
  waste_amount    BIGINT DEFAULT 0,
  waste_pct       NUMERIC(5,4),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, sale_date, channel)
);

CREATE INDEX idx_daily_sales_date ON daily_sales(company_id, sale_date DESC);

-- ============================================================
-- F&B-7: POS Transactions (chi tiết từng giao dịch)
-- ============================================================
CREATE TABLE pos_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  transaction_no  TEXT NOT NULL,
  txn_datetime    TIMESTAMPTZ NOT NULL,
  channel         TEXT NOT NULL,   -- b2b, b2c, show
  dish_id         UUID REFERENCES dishes(id),
  dish_name       TEXT,            -- snapshot at time of sale
  quantity        NUMERIC(8,2) NOT NULL,
  unit_price      BIGINT NOT NULL,
  discount_pct    NUMERIC(5,4) DEFAULT 0,
  line_total      BIGINT NOT NULL,
  pos_source      TEXT DEFAULT 'cukcuk',  -- cukcuk, sapo, manual
  raw_payload     JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, transaction_no)
);

CREATE INDEX idx_pos_txn_datetime ON pos_transactions(company_id, txn_datetime DESC);

-- ============================================================
-- F&B-8: Supplier Purchase Orders
-- ============================================================
CREATE TABLE purchase_orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  supplier_id     UUID NOT NULL REFERENCES suppliers(id),
  po_no           TEXT NOT NULL,
  order_date      DATE NOT NULL,
  expected_date   DATE,
  received_date   DATE,
  status          TEXT DEFAULT 'draft',  -- draft, sent, partial, received, cancelled
  total_amount    BIGINT DEFAULT 0,
  notes           TEXT,
  created_by      UUID REFERENCES employees(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, po_no)
);

CREATE TABLE purchase_order_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id           UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  ingredient_id   UUID NOT NULL REFERENCES ingredients(id),
  quantity        NUMERIC(10,4) NOT NULL,
  unit            TEXT NOT NULL,
  unit_price      BIGINT NOT NULL,
  total_price     BIGINT NOT NULL,
  received_qty    NUMERIC(10,4) DEFAULT 0,
  notes           TEXT
);

-- ============================================================
-- F&B-9: HACCP / Quality Control Logs
-- ============================================================
CREATE TABLE haccp_checks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  check_type      TEXT NOT NULL,   -- temp_check, hygiene, pest_control, equipment
  location_id     UUID REFERENCES inventory_locations(id),
  check_date      DATE NOT NULL,
  check_time      TIME,
  parameter       TEXT NOT NULL,   -- e.g. "Nhiệt độ tủ lạnh"
  measured_value  NUMERIC,
  unit            TEXT,
  min_acceptable  NUMERIC,
  max_acceptable  NUMERIC,
  is_pass         BOOLEAN,
  corrective_action TEXT,
  checked_by      UUID REFERENCES employees(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_haccp_date ON haccp_checks(company_id, check_date DESC);

-- ============================================================
-- Inventory balance VIEW (materialized-style query helper)
-- ============================================================
CREATE OR REPLACE VIEW inventory_balance AS
SELECT
  im.company_id,
  im.ingredient_id,
  i.name AS ingredient_name,
  i.unit,
  i.unit_cost,
  im.location_id,
  il.name AS location_name,
  SUM(
    CASE WHEN im.movement_type IN ('import') THEN im.quantity
         WHEN im.movement_type IN ('export', 'waste') THEN -im.quantity
         WHEN im.movement_type = 'adjustment' THEN im.quantity
         ELSE 0 END
  ) AS balance_qty,
  SUM(
    CASE WHEN im.movement_type IN ('import') THEN COALESCE(im.total_cost, 0)
         WHEN im.movement_type IN ('export', 'waste') THEN -COALESCE(im.total_cost, 0)
         ELSE 0 END
  ) AS balance_value
FROM inventory_movements im
JOIN ingredients i ON i.id = im.ingredient_id
LEFT JOIN inventory_locations il ON il.id = im.location_id
GROUP BY im.company_id, im.ingredient_id, i.name, i.unit, i.unit_cost,
         im.location_id, il.name;
