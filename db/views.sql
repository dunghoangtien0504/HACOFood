-- ============================================================
-- HACO Food OS — SQL Views (Business Intelligence)
-- Chạy SAU tất cả schema + extension
-- ============================================================

-- ============================================================
-- 1. P&L Monthly (Revenue - COGS - OpEx = Net Profit)
-- ============================================================
CREATE OR REPLACE VIEW pnl_monthly AS
WITH monthly AS (
  SELECT
    company_id,
    period,
    account_code,
    account_name,
    CASE
      WHEN account_code LIKE '511%' OR account_code LIKE '512%' THEN 'revenue'
      WHEN account_code LIKE '632%' OR account_code LIKE '156%' THEN 'cogs'
      WHEN account_code LIKE '641%' THEN 'selling_expense'
      WHEN account_code LIKE '642%' THEN 'admin_expense'
      WHEN account_code LIKE '635%' OR account_code LIKE '811%' THEN 'other_expense'
      WHEN account_code LIKE '711%' THEN 'other_income'
      ELSE NULL
    END AS line_type,
    SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE -amount END) AS net_amount
  FROM accounting_entries
  WHERE account_code IS NOT NULL
  GROUP BY company_id, period, account_code, account_name
)
SELECT
  company_id,
  period,
  SUM(CASE WHEN line_type = 'revenue' THEN net_amount ELSE 0 END) AS revenue,
  SUM(CASE WHEN line_type = 'cogs' THEN -net_amount ELSE 0 END) AS cogs,
  SUM(CASE WHEN line_type = 'revenue' THEN net_amount ELSE 0 END)
    - SUM(CASE WHEN line_type = 'cogs' THEN -net_amount ELSE 0 END) AS gross_profit,
  SUM(CASE WHEN line_type = 'selling_expense' THEN -net_amount ELSE 0 END) AS selling_expense,
  SUM(CASE WHEN line_type = 'admin_expense' THEN -net_amount ELSE 0 END) AS admin_expense,
  SUM(CASE WHEN line_type IN ('selling_expense', 'admin_expense') THEN -net_amount ELSE 0 END) AS total_opex,
  SUM(CASE WHEN line_type = 'revenue' THEN net_amount
            WHEN line_type IN ('cogs', 'selling_expense', 'admin_expense') THEN -(-net_amount)
            ELSE 0 END) AS ebitda,
  SUM(CASE WHEN line_type = 'other_income' THEN net_amount ELSE 0 END) AS other_income,
  SUM(CASE WHEN line_type = 'other_expense' THEN -net_amount ELSE 0 END) AS other_expense,
  -- Simplified Net Profit (no tax deduction in view — app calculates after CIT)
  SUM(CASE WHEN line_type = 'revenue' THEN net_amount
            WHEN line_type IN ('cogs', 'selling_expense', 'admin_expense', 'other_expense') THEN net_amount
            WHEN line_type = 'other_income' THEN net_amount
            ELSE 0 END) AS net_profit_before_tax
FROM monthly
WHERE line_type IS NOT NULL
GROUP BY company_id, period;

-- ============================================================
-- 2. Balance Sheet Snapshot (simplified)
-- ============================================================
CREATE OR REPLACE VIEW balance_sheet_snapshot AS
SELECT
  company_id,
  period,
  -- Assets
  SUM(CASE WHEN account_code IN ('111', '112') AND entry_type = 'debit' THEN amount
           WHEN account_code IN ('111', '112') AND entry_type = 'credit' THEN -amount
           ELSE 0 END) AS cash_and_bank,
  SUM(CASE WHEN account_code LIKE '131%' AND entry_type = 'debit' THEN amount
           WHEN account_code LIKE '131%' AND entry_type = 'credit' THEN -amount
           ELSE 0 END) AS accounts_receivable,
  SUM(CASE WHEN account_code LIKE '15%' AND entry_type = 'debit' THEN amount
           WHEN account_code LIKE '15%' AND entry_type = 'credit' THEN -amount
           ELSE 0 END) AS inventory,
  SUM(CASE WHEN account_code LIKE '2%' AND entry_type = 'debit' THEN amount
           WHEN account_code LIKE '2%' AND entry_type = 'credit' THEN -amount
           ELSE 0 END) AS fixed_assets_net,
  -- Liabilities
  SUM(CASE WHEN account_code LIKE '33%' AND entry_type = 'credit' THEN amount
           WHEN account_code LIKE '33%' AND entry_type = 'debit' THEN -amount
           ELSE 0 END) AS accounts_payable,
  SUM(CASE WHEN account_code LIKE '34%' AND entry_type = 'credit' THEN amount
           WHEN account_code LIKE '34%' AND entry_type = 'debit' THEN -amount
           ELSE 0 END) AS loans,
  -- Equity
  SUM(CASE WHEN account_code LIKE '4%' AND entry_type = 'credit' THEN amount
           WHEN account_code LIKE '4%' AND entry_type = 'debit' THEN -amount
           ELSE 0 END) AS equity
FROM accounting_entries
GROUP BY company_id, period;

-- ============================================================
-- 3. Cashflow Monthly (operating / investing / financing)
-- ============================================================
CREATE OR REPLACE VIEW cashflow_monthly AS
SELECT
  company_id,
  DATE_TRUNC('month', txn_date)::DATE AS month,
  TO_CHAR(txn_date, 'YYYY-MM') AS period,
  SUM(CASE WHEN txn_type = 'receipt' AND category = 'operating' THEN amount ELSE 0 END) AS op_inflow,
  SUM(CASE WHEN txn_type = 'payment' AND category = 'operating' THEN amount ELSE 0 END) AS op_outflow,
  SUM(CASE WHEN txn_type = 'receipt' AND category = 'operating' THEN amount ELSE 0 END)
    - SUM(CASE WHEN txn_type = 'payment' AND category = 'operating' THEN amount ELSE 0 END) AS op_net,
  SUM(CASE WHEN txn_type = 'receipt' AND category = 'investing' THEN amount ELSE 0 END) AS inv_inflow,
  SUM(CASE WHEN txn_type = 'payment' AND category = 'investing' THEN amount ELSE 0 END) AS inv_outflow,
  SUM(CASE WHEN txn_type = 'receipt' AND category = 'investing' THEN amount ELSE 0 END)
    - SUM(CASE WHEN txn_type = 'payment' AND category = 'investing' THEN amount ELSE 0 END) AS inv_net,
  SUM(CASE WHEN txn_type = 'receipt' AND category = 'financing' THEN amount ELSE 0 END) AS fin_inflow,
  SUM(CASE WHEN txn_type = 'payment' AND category = 'financing' THEN amount ELSE 0 END) AS fin_outflow,
  SUM(CASE WHEN category = 'operating' OR category = 'investing' OR category = 'financing'
        THEN CASE WHEN txn_type = 'receipt' THEN amount ELSE -amount END
        ELSE 0 END) AS net_change
FROM cash_transactions
GROUP BY company_id, DATE_TRUNC('month', txn_date)::DATE, TO_CHAR(txn_date, 'YYYY-MM');

-- ============================================================
-- 4. KPI Status Summary (per period)
-- ============================================================
CREATE OR REPLACE VIEW kpi_status_summary AS
SELECT
  k.company_id,
  k.id AS kpi_id,
  k.code,
  k.name,
  k.department_id,
  k.direction,
  k.unit,
  k.parent_id,
  kt.period,
  kt.target,
  ka.actual,
  CASE
    WHEN kt.target IS NULL OR kt.target = 0 THEN 0
    WHEN k.direction = 'increase' THEN ROUND(ka.actual / kt.target, 4)
    ELSE ROUND((2 * kt.target - ka.actual) / kt.target, 4)
  END AS completion,
  CASE
    WHEN kt.target IS NULL OR ka.actual IS NULL THEN 'no_data'
    WHEN (
      CASE
        WHEN k.direction = 'increase' THEN ROUND(ka.actual / kt.target, 4)
        ELSE ROUND((2 * kt.target - ka.actual) / kt.target, 4)
      END
    ) >= 0.95 THEN 'green'
    WHEN (
      CASE
        WHEN k.direction = 'increase' THEN ROUND(ka.actual / kt.target, 4)
        ELSE ROUND((2 * kt.target - ka.actual) / kt.target, 4)
      END
    ) >= 0.85 THEN 'yellow'
    ELSE 'red'
  END AS status
FROM kpis k
LEFT JOIN kpi_targets kt ON kt.kpi_id = k.id
LEFT JOIN kpi_actuals ka ON ka.kpi_id = k.id AND ka.period = kt.period;

-- ============================================================
-- 5. Food Cost by Dish (actual vs. target)
-- ============================================================
CREATE OR REPLACE VIEW food_cost_by_dish AS
SELECT
  d.company_id,
  d.id AS dish_id,
  d.code,
  d.name,
  d.sale_price,
  d.target_food_cost_pct,
  -- Actual cost = sum of (ingredient qty × current unit_cost × (1 + waste_pct))
  COALESCE(
    (
      SELECT SUM(ri.quantity * (1 + ri.waste_pct) * i.unit_cost / r.yield_qty)
      FROM recipes r
      JOIN recipe_ingredients ri ON ri.recipe_id = r.id
      JOIN ingredients i ON i.id = ri.ingredient_id
      WHERE r.dish_id = d.id AND r.is_active = TRUE
      LIMIT 1
    ),
    0
  ) AS actual_cost_per_portion,
  d.target_food_cost_pct * d.sale_price AS target_cost_amount,
  CASE
    WHEN d.sale_price > 0 THEN
      ROUND(
        COALESCE(
          (
            SELECT SUM(ri.quantity * (1 + ri.waste_pct) * i.unit_cost / r.yield_qty)
            FROM recipes r
            JOIN recipe_ingredients ri ON ri.recipe_id = r.id
            JOIN ingredients i ON i.id = ri.ingredient_id
            WHERE r.dish_id = d.id AND r.is_active = TRUE
            LIMIT 1
          ),
          0
        )::NUMERIC / d.sale_price,
        4
      )
    ELSE 0
  END AS actual_food_cost_pct
FROM dishes d;

-- ============================================================
-- 6. Waste by Category (per month)
-- ============================================================
CREATE OR REPLACE VIEW waste_by_category AS
SELECT
  im.company_id,
  TO_CHAR(im.movement_date, 'YYYY-MM') AS period,
  i.category AS ingredient_category,
  SUM(im.quantity) AS waste_qty,
  SUM(COALESCE(im.total_cost, im.quantity * i.unit_cost)) AS waste_value,
  COUNT(*) AS incident_count
FROM inventory_movements im
JOIN ingredients i ON i.id = im.ingredient_id
WHERE im.movement_type = 'waste'
GROUP BY im.company_id, TO_CHAR(im.movement_date, 'YYYY-MM'), i.category;

-- ============================================================
-- 7. AR Aging (Accounts Receivable)
-- ============================================================
CREATE OR REPLACE VIEW ar_aging AS
SELECT
  company_id,
  counterparty,
  invoice_no,
  invoice_date,
  due_date,
  total - paid_amount AS outstanding,
  CURRENT_DATE - due_date AS days_overdue,
  CASE
    WHEN CURRENT_DATE <= due_date THEN 'current'
    WHEN CURRENT_DATE - due_date <= 30 THEN '1-30_days'
    WHEN CURRENT_DATE - due_date <= 60 THEN '31-60_days'
    WHEN CURRENT_DATE - due_date <= 90 THEN '61-90_days'
    ELSE '90+_days'
  END AS aging_bucket
FROM invoices
WHERE invoice_type = 'sale' AND status NOT IN ('paid', 'cancelled');

-- ============================================================
-- 8. AP Aging (Accounts Payable)
-- ============================================================
CREATE OR REPLACE VIEW ap_aging AS
SELECT
  company_id,
  counterparty,
  invoice_no,
  invoice_date,
  due_date,
  total - paid_amount AS outstanding,
  CURRENT_DATE - due_date AS days_overdue,
  CASE
    WHEN CURRENT_DATE <= due_date THEN 'current'
    WHEN CURRENT_DATE - due_date <= 30 THEN '1-30_days'
    WHEN CURRENT_DATE - due_date <= 60 THEN '31-60_days'
    ELSE '60+_days'
  END AS aging_bucket
FROM invoices
WHERE invoice_type = 'purchase' AND status NOT IN ('paid', 'cancelled');

-- ============================================================
-- 9. Cash Runway (how many months of burn left)
-- ============================================================
CREATE OR REPLACE VIEW cash_runway_view AS
WITH latest_cash AS (
  SELECT
    company_id,
    SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE -amount END) AS cash_balance
  FROM accounting_entries
  WHERE account_code IN ('111', '112')
  GROUP BY company_id
),
monthly_burn AS (
  SELECT
    company_id,
    period,
    SUM(CASE WHEN entry_type = 'debit' AND account_code NOT LIKE '1%' THEN amount ELSE 0 END) AS monthly_expense
  FROM accounting_entries
  GROUP BY company_id, period
),
avg_burn AS (
  SELECT company_id, AVG(monthly_expense) AS avg_monthly_burn
  FROM monthly_burn
  WHERE monthly_expense > 0
  GROUP BY company_id
)
SELECT
  lc.company_id,
  lc.cash_balance,
  ab.avg_monthly_burn,
  CASE WHEN ab.avg_monthly_burn > 0
    THEN ROUND(lc.cash_balance / ab.avg_monthly_burn, 1)
    ELSE NULL
  END AS runway_months
FROM latest_cash lc
LEFT JOIN avg_burn ab ON ab.company_id = lc.company_id;
