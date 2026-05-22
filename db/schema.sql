-- ============================================================
-- HACO Food OS — Core Schema (66 tables)
-- Chạy trên Supabase SQL Editor hoặc psql
-- ============================================================
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- full-text search

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE app_role AS ENUM (
  'ceo', 'cfo', 'hr_admin', 'dept_head', 'team_lead', 'employee', 'auditor'
);

CREATE TYPE kpi_direction AS ENUM ('increase', 'decrease');
CREATE TYPE kpi_status AS ENUM ('green', 'yellow', 'red', 'no_data');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'blocked', 'done', 'cancelled');
CREATE TYPE task_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE project_status AS ENUM ('planning', 'active', 'paused', 'done', 'cancelled');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE alert_severity AS ENUM ('critical', 'warning', 'info');
CREATE TYPE accounting_type AS ENUM ('debit', 'credit');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE requisition_status AS ENUM ('draft', 'open', 'interviewing', 'offered', 'closed');
CREATE TYPE okr_status AS ENUM ('on_track', 'at_risk', 'off_track', 'done');
CREATE TYPE payroll_status AS ENUM ('draft', 'approved', 'paid');

-- ============================================================
-- 1. ORGANIZATION (8 tables)
-- ============================================================

-- 1.1 Companies
CREATE TABLE companies (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  short_name    TEXT,
  tax_id        TEXT,
  industry      TEXT DEFAULT 'F&B',
  logo_url      TEXT,
  website       TEXT,
  address       TEXT,
  phone         TEXT,
  email         TEXT,
  fiscal_year_start INT DEFAULT 1,  -- month (1=Jan)
  base_currency TEXT DEFAULT 'VND',
  timezone      TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  settings      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Departments
CREATE TABLE departments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  code          TEXT NOT NULL,  -- e.g. BGĐ, KD, MKT, SX, RD, MH, HR
  description   TEXT,
  parent_id     UUID REFERENCES departments(id),
  head_id       UUID,  -- FK to employees (added after employees table)
  cost_center   TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

-- 1.3 Employees
CREATE TABLE employees (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department_id   UUID REFERENCES departments(id),
  user_id         UUID REFERENCES auth.users(id),  -- Supabase auth user
  employee_code   TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  position        TEXT NOT NULL,
  level           TEXT,  -- e.g. junior, senior, manager
  hire_date       DATE,
  end_date        DATE,
  is_active       BOOLEAN DEFAULT TRUE,
  avatar_url      TEXT,
  base_salary     BIGINT DEFAULT 0,  -- VND
  contract_type   TEXT DEFAULT 'full_time',  -- full_time, part_time, contractor
  tax_id          TEXT,
  bank_account    TEXT,
  bank_name       TEXT,
  address         TEXT,
  emergency_contact JSONB DEFAULT '{}',
  meta            JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, employee_code),
  UNIQUE(company_id, email)
);

-- Add FK for department head
ALTER TABLE departments
  ADD CONSTRAINT departments_head_id_fkey
  FOREIGN KEY (head_id) REFERENCES employees(id);

-- 1.4 Profiles (maps Supabase auth user → app role)
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id      UUID REFERENCES companies(id),
  employee_id     UUID REFERENCES employees(id),
  full_name       TEXT,
  avatar_url      TEXT,
  role            app_role DEFAULT 'employee',
  department_id   UUID REFERENCES departments(id),
  is_active       BOOLEAN DEFAULT TRUE,
  last_seen_at    TIMESTAMPTZ,
  preferences     JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 Teams (sub-groups within departments)
CREATE TABLE teams (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  name          TEXT NOT NULL,
  code          TEXT,
  lead_id       UUID REFERENCES employees(id),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id     UUID REFERENCES teams(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, employee_id)
);

-- 1.6 Job positions / levels
CREATE TABLE job_levels (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES companies(id),
  title       TEXT NOT NULL,
  level_code  TEXT NOT NULL,  -- L1, L2, ... L7
  grade       INT,
  min_salary  BIGINT,
  max_salary  BIGINT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 1.7 Org chart snapshots (for history)
CREATE TABLE org_snapshots (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES companies(id),
  snapshot    JSONB NOT NULL,
  taken_at    TIMESTAMPTZ DEFAULT NOW(),
  taken_by    UUID REFERENCES employees(id)
);

-- ============================================================
-- 2. KPI (7 tables)
-- ============================================================

-- 2.1 KPI definitions
CREATE TABLE kpis (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  owner_id      UUID REFERENCES employees(id),
  parent_id     UUID REFERENCES kpis(id),  -- cascade tree
  code          TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  unit          TEXT DEFAULT '%',   -- %, VND, kg, đơn...
  direction     kpi_direction DEFAULT 'increase',
  formula_type  TEXT DEFAULT 'manual',  -- const, ref, sum, sub, mul, ratio, weighted_avg, milestone, manual
  formula_def   JSONB DEFAULT '{}',     -- { op, refs, weights, ... }
  weight        NUMERIC(5,4) DEFAULT 1.0,
  benchmark_min NUMERIC,
  benchmark_max NUMERIC,
  is_monetary   BOOLEAN DEFAULT FALSE,
  is_leaf       BOOLEAN DEFAULT TRUE,
  sort_order    INT DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

-- 2.2 KPI Targets (per period)
CREATE TABLE kpi_targets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_id      UUID NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  period      TEXT NOT NULL,   -- e.g. "2026-05"
  target      NUMERIC NOT NULL,
  stretch     NUMERIC,         -- stretch goal
  min_target  NUMERIC,         -- floor
  set_by      UUID REFERENCES employees(id),
  approved_by UUID REFERENCES employees(id),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kpi_id, period)
);

-- 2.3 KPI Actuals (per period)
CREATE TABLE kpi_actuals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_id      UUID NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  period      TEXT NOT NULL,
  actual      NUMERIC NOT NULL,
  source      TEXT DEFAULT 'manual',  -- manual, pos_sync, erp_sync, formula
  entered_by  UUID REFERENCES employees(id),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kpi_id, period)
);

-- 2.4 KPI history (time series for trending)
CREATE TABLE kpi_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_id      UUID NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  period      TEXT NOT NULL,
  actual      NUMERIC,
  target      NUMERIC,
  completion  NUMERIC,  -- 0..1
  status      kpi_status,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kpi_history_kpi_period ON kpi_history(kpi_id, period);

-- 2.5 KPI overrides (manual adjustments with reason)
CREATE TABLE kpi_overrides (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_id      UUID NOT NULL REFERENCES kpis(id),
  period      TEXT NOT NULL,
  override_val NUMERIC NOT NULL,
  reason      TEXT NOT NULL,
  approved_by UUID REFERENCES employees(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 KPI employee assignments (personal KPIs)
CREATE TABLE kpi_assignments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_id      UUID NOT NULL REFERENCES kpis(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  period      TEXT NOT NULL,
  weight      NUMERIC(5,4) DEFAULT 1.0,  -- for weighted avg in personal score
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kpi_id, employee_id, period)
);

-- 2.7 KPI comments / discussions
CREATE TABLE kpi_comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_id      UUID NOT NULL REFERENCES kpis(id),
  author_id   UUID NOT NULL REFERENCES employees(id),
  period      TEXT,
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. TASKS / OPERATIONS (6 tables)
-- ============================================================

-- 3.1 Tasks
CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department_id   UUID REFERENCES departments(id),
  assignee_id     UUID REFERENCES employees(id),
  reporter_id     UUID REFERENCES employees(id),
  kpi_id          UUID REFERENCES kpis(id),   -- linked KPI (Task→KPI linkage)
  project_id      UUID,                         -- FK added after projects
  parent_task_id  UUID REFERENCES tasks(id),   -- sub-tasks
  title           TEXT NOT NULL,
  description     TEXT,
  status          task_status DEFAULT 'todo',
  priority        task_priority DEFAULT 'medium',
  due_date        DATE,
  completed_at    TIMESTAMPTZ,
  estimated_hours NUMERIC(6,2),
  actual_hours    NUMERIC(6,2),
  kpi_impact      NUMERIC(5,4),  -- expected delta on linked KPI (0..1)
  tags            TEXT[] DEFAULT '{}',
  attachments     JSONB DEFAULT '[]',
  meta            JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- 3.2 Task outputs (measurable results tied to task)
CREATE TABLE task_outputs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES employees(id),
  output_type TEXT DEFAULT 'note',  -- note, metric, file, link
  title       TEXT,
  value       NUMERIC,              -- numeric output (e.g. units produced)
  unit        TEXT,
  body        TEXT,                 -- free text / URL
  file_url    TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Task comments
CREATE TABLE task_comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES employees(id),
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 Checklists
CREATE TABLE task_checklist_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  is_done     BOOLEAN DEFAULT FALSE,
  done_at     TIMESTAMPTZ,
  sort_order  INT DEFAULT 0
);

-- 3.5 Time logs
CREATE TABLE time_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     UUID NOT NULL REFERENCES tasks(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  hours       NUMERIC(6,2) NOT NULL,
  logged_at   DATE DEFAULT CURRENT_DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3.6 SOP Documents
CREATE TABLE sop_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  department_id   UUID REFERENCES departments(id),
  code            TEXT NOT NULL,
  title           TEXT NOT NULL,
  version         TEXT DEFAULT '1.0',
  content         TEXT,   -- markdown
  status          TEXT DEFAULT 'draft',  -- draft, active, archived
  owner_id        UUID REFERENCES employees(id),
  approved_by     UUID REFERENCES employees(id),
  approved_at     TIMESTAMPTZ,
  tags            TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. PROJECTS (6 tables)
-- ============================================================

CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  department_id   UUID REFERENCES departments(id),
  lead_id         UUID REFERENCES employees(id),
  name            TEXT NOT NULL,
  description     TEXT,
  status          project_status DEFAULT 'planning',
  start_date      DATE,
  end_date        DATE,
  budget          BIGINT DEFAULT 0,  -- VND
  spent           BIGINT DEFAULT 0,
  completion_pct  NUMERIC(5,2) DEFAULT 0,
  kpi_id          UUID REFERENCES kpis(id),  -- linked KPI
  tags            TEXT[] DEFAULT '{}',
  meta            JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- FK tasks.project_id
ALTER TABLE tasks
  ADD CONSTRAINT tasks_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id);

CREATE TABLE project_members (
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  role        TEXT DEFAULT 'member',
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, employee_id)
);

CREATE TABLE project_milestones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  due_date    DATE,
  done_date   DATE,
  is_done     BOOLEAN DEFAULT FALSE,
  sort_order  INT DEFAULT 0
);

CREATE TABLE project_risks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id),
  title       TEXT NOT NULL,
  description TEXT,
  severity    alert_severity DEFAULT 'warning',
  mitigation  TEXT,
  status      TEXT DEFAULT 'open',  -- open, mitigated, closed
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_updates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id),
  author_id   UUID NOT NULL REFERENCES employees(id),
  body        TEXT NOT NULL,
  progress_pct NUMERIC(5,2),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_budgets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id),
  category    TEXT NOT NULL,
  planned     BIGINT NOT NULL,
  actual      BIGINT DEFAULT 0,
  period      TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. COMPENSATION / PAYROLL (7 tables)
-- ============================================================

CREATE TABLE payroll_periods (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES companies(id),
  period      TEXT NOT NULL,   -- "2026-05"
  status      payroll_status DEFAULT 'draft',
  run_at      TIMESTAMPTZ,
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, period)
);

CREATE TABLE payroll_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_id       UUID NOT NULL REFERENCES payroll_periods(id),
  employee_id     UUID NOT NULL REFERENCES employees(id),
  base_salary     BIGINT NOT NULL,
  kpi_completion  NUMERIC(5,4) DEFAULT 0,  -- 0..1
  bonus_multiplier NUMERIC(5,4) DEFAULT 0,
  bonus_earned    BIGINT DEFAULT 0,
  gross           BIGINT NOT NULL,
  bhxh_employee   BIGINT DEFAULT 0,   -- 10.5% NLĐ
  pit_estimate    BIGINT DEFAULT 0,
  net_pay         BIGINT NOT NULL,
  company_bhxh    BIGINT DEFAULT 0,   -- 17.5% NSD
  total_company_cost BIGINT NOT NULL,
  override_note   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(period_id, employee_id)
);

CREATE TABLE payroll_rules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES companies(id),
  name        TEXT NOT NULL,
  threshold   NUMERIC(5,4) NOT NULL,   -- KPI completion threshold (0..1)
  multiplier  NUMERIC(5,4) NOT NULL,   -- bonus multiplier
  is_active   BOOLEAN DEFAULT TRUE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dept_bonus_multipliers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID NOT NULL REFERENCES companies(id),
  department_id UUID NOT NULL REFERENCES departments(id),
  multiplier    NUMERIC(5,4) NOT NULL DEFAULT 1.0,
  period        TEXT,   -- null = applies always
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, department_id, period)
);

CREATE TABLE payroll_overrides (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES companies(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  period      TEXT NOT NULL,
  field       TEXT NOT NULL,  -- bonus_earned, gross, net_pay
  value       BIGINT NOT NULL,
  reason      TEXT NOT NULL,
  approved_by UUID REFERENCES employees(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leave_requests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  leave_type  TEXT DEFAULT 'annual',  -- annual, sick, unpaid, maternity
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  days        NUMERIC(5,2),
  status      leave_status DEFAULT 'pending',
  reason      TEXT,
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attendance_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  log_date    DATE NOT NULL,
  check_in    TIME,
  check_out   TIME,
  total_hours NUMERIC(5,2),
  late_minutes INT DEFAULT 0,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, log_date)
);

-- ============================================================
-- 6. FINANCE / ACCOUNTING (8 tables)
-- ============================================================

CREATE TABLE chart_of_accounts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES companies(id),
  account_code TEXT NOT NULL,   -- VAS: 111, 112, 131, 511...
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL,   -- asset, liability, equity, revenue, expense
  parent_code TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, account_code)
);

CREATE TABLE accounting_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  entry_date      DATE NOT NULL,
  period          TEXT NOT NULL,   -- "2026-05"
  account_code    TEXT NOT NULL,
  account_name    TEXT,
  entry_type      accounting_type NOT NULL,
  amount          BIGINT NOT NULL,  -- VND
  description     TEXT,
  reference_no    TEXT,   -- invoice / receipt number
  department_id   UUID REFERENCES departments(id),
  project_id      UUID REFERENCES projects(id),
  tags            TEXT[] DEFAULT '{}',
  created_by      UUID REFERENCES employees(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accounting_period ON accounting_entries(company_id, period);
CREATE INDEX idx_accounting_account ON accounting_entries(company_id, account_code);

CREATE TABLE budgets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  department_id   UUID REFERENCES departments(id),
  account_code    TEXT,
  period          TEXT NOT NULL,
  budget_amount   BIGINT NOT NULL,
  actual_amount   BIGINT DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, department_id, account_code, period)
);

CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  invoice_no      TEXT NOT NULL,
  invoice_date    DATE NOT NULL,
  due_date        DATE,
  counterparty    TEXT NOT NULL,  -- customer / vendor name
  counterparty_tax TEXT,
  invoice_type    TEXT DEFAULT 'sale',  -- sale, purchase
  subtotal        BIGINT NOT NULL,
  vat_amount      BIGINT DEFAULT 0,
  total           BIGINT NOT NULL,
  paid_amount     BIGINT DEFAULT 0,
  status          TEXT DEFAULT 'pending',  -- pending, partial, paid, overdue
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, invoice_no)
);

CREATE TABLE cash_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  txn_date        DATE NOT NULL,
  txn_type        TEXT NOT NULL,  -- receipt, payment
  amount          BIGINT NOT NULL,
  account_code    TEXT NOT NULL,  -- 111 (cash) or 112 (bank)
  description     TEXT,
  reference_no    TEXT,
  category        TEXT,  -- operating, investing, financing
  created_by      UUID REFERENCES employees(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE financial_statements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  period          TEXT NOT NULL,
  statement_type  TEXT NOT NULL,  -- pnl, balance_sheet, cashflow
  data            JSONB NOT NULL,  -- full statement as JSON
  generated_at    TIMESTAMPTZ DEFAULT NOW(),
  generated_by    UUID REFERENCES employees(id),
  UNIQUE(company_id, period, statement_type)
);

CREATE TABLE tax_declarations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  period          TEXT NOT NULL,
  tax_type        TEXT NOT NULL,  -- vat, cit, pit
  taxable_amount  BIGINT NOT NULL,
  tax_amount      BIGINT NOT NULL,
  status          TEXT DEFAULT 'draft',
  filed_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fixed_assets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  asset_code      TEXT NOT NULL,
  name            TEXT NOT NULL,
  category        TEXT,  -- equipment, vehicle, building
  purchase_date   DATE,
  purchase_cost   BIGINT,
  useful_life_months INT,
  depreciation_method TEXT DEFAULT 'straight_line',
  current_value   BIGINT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. OKR (3 tables)
-- ============================================================

CREATE TABLE objectives (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  department_id   UUID REFERENCES departments(id),
  owner_id        UUID REFERENCES employees(id),
  parent_id       UUID REFERENCES objectives(id),
  title           TEXT NOT NULL,
  description     TEXT,
  period          TEXT NOT NULL,   -- "Q2-2026"
  status          okr_status DEFAULT 'on_track',
  progress        NUMERIC(5,2) DEFAULT 0,
  is_company_level BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE key_results (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  objective_id    UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  owner_id        UUID REFERENCES employees(id),
  title           TEXT NOT NULL,
  target_value    NUMERIC,
  current_value   NUMERIC DEFAULT 0,
  unit            TEXT DEFAULT '%',
  progress        NUMERIC(5,2) DEFAULT 0,
  weight          NUMERIC(5,4) DEFAULT 1.0,
  kpi_id          UUID REFERENCES kpis(id),
  status          okr_status DEFAULT 'on_track',
  due_date        DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE okr_check_ins (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_result_id   UUID NOT NULL REFERENCES key_results(id),
  author_id       UUID NOT NULL REFERENCES employees(id),
  current_value   NUMERIC NOT NULL,
  confidence      INT,  -- 1-10
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. RECRUITING (4 tables)
-- ============================================================

CREATE TABLE job_requisitions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  department_id   UUID REFERENCES departments(id),
  requested_by    UUID REFERENCES employees(id),
  title           TEXT NOT NULL,
  level           TEXT,
  headcount       INT DEFAULT 1,
  status          requisition_status DEFAULT 'draft',
  job_description TEXT,
  requirements    TEXT,
  salary_range    TEXT,
  open_date       DATE,
  close_date      DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE candidates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requisition_id  UUID NOT NULL REFERENCES job_requisitions(id),
  full_name       TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  cv_url          TEXT,
  source          TEXT,  -- linkedin, referral, website, headhunter
  status          TEXT DEFAULT 'applied',  -- applied, screening, interview, offered, hired, rejected
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE interviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id    UUID NOT NULL REFERENCES candidates(id),
  interviewer_id  UUID REFERENCES employees(id),
  scheduled_at    TIMESTAMPTZ NOT NULL,
  duration_mins   INT DEFAULT 60,
  format          TEXT DEFAULT 'in_person',  -- in_person, video, phone
  score           INT,   -- 1-10
  notes           TEXT,
  status          TEXT DEFAULT 'scheduled',  -- scheduled, done, cancelled
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE onboarding_tasks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  employee_id     UUID NOT NULL REFERENCES employees(id),
  title           TEXT NOT NULL,
  description     TEXT,
  due_days        INT DEFAULT 7,  -- days after hire_date
  is_done         BOOLEAN DEFAULT FALSE,
  done_at         TIMESTAMPTZ,
  assigned_to     UUID REFERENCES employees(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. GOVERNANCE (8 tables)
-- ============================================================

CREATE TABLE approvals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  requester_id    UUID NOT NULL REFERENCES employees(id),
  approver_id     UUID REFERENCES employees(id),
  approval_type   TEXT NOT NULL,  -- budget, leave, payroll, capex, policy
  title           TEXT NOT NULL,
  description     TEXT,
  amount          BIGINT,
  status          approval_status DEFAULT 'pending',
  priority        task_priority DEFAULT 'medium',
  due_date        DATE,
  decided_at      TIMESTAMPTZ,
  decision_note   TEXT,
  reference_id    UUID,  -- FK to the source record
  reference_type  TEXT,  -- table name of source record
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approvals_status ON approvals(status, company_id);

CREATE TABLE approval_steps (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  approval_id     UUID NOT NULL REFERENCES approvals(id) ON DELETE CASCADE,
  step_order      INT NOT NULL,
  approver_id     UUID NOT NULL REFERENCES employees(id),
  status          approval_status DEFAULT 'pending',
  decided_at      TIMESTAMPTZ,
  notes           TEXT
);

CREATE TABLE alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  department_id   UUID REFERENCES departments(id),
  kpi_id          UUID REFERENCES kpis(id),
  title           TEXT NOT NULL,
  body            TEXT,
  severity        alert_severity DEFAULT 'warning',
  category        TEXT DEFAULT 'kpi',  -- kpi, finance, ops, hr, system
  is_read         BOOLEAN DEFAULT FALSE,
  is_resolved     BOOLEAN DEFAULT FALSE,
  resolved_by     UUID REFERENCES employees(id),
  resolved_at     TIMESTAMPTZ,
  action_url      TEXT,
  meta            JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_company_unread ON alerts(company_id, is_read, is_resolved);

CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID,
  actor_id        UUID,
  action          TEXT NOT NULL,
  entity_type     TEXT NOT NULL,
  entity_id       UUID,
  payload_before  JSONB,
  payload_after   JSONB,
  ip_address      TEXT,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);

CREATE TABLE policies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  title           TEXT NOT NULL,
  category        TEXT DEFAULT 'hr',  -- hr, finance, ops, safety, quality
  content         TEXT,
  version         TEXT DEFAULT '1.0',
  status          TEXT DEFAULT 'draft',
  effective_date  DATE,
  owner_id        UUID REFERENCES employees(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE announcements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  author_id       UUID NOT NULL REFERENCES employees(id),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  audience        TEXT DEFAULT 'all',  -- all, dept:{id}, role:{role}
  is_pinned       BOOLEAN DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meeting_notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  department_id   UUID REFERENCES departments(id),
  title           TEXT NOT NULL,
  meeting_date    DATE NOT NULL,
  attendees       UUID[] DEFAULT '{}',
  agenda          TEXT,
  minutes         TEXT,
  action_items    JSONB DEFAULT '[]',
  created_by      UUID REFERENCES employees(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  department_id   UUID REFERENCES departments(id),
  title           TEXT NOT NULL,
  report_type     TEXT DEFAULT 'monthly',
  period          TEXT,
  body            TEXT,
  file_url        TEXT,
  generated_by    UUID REFERENCES employees(id),
  generated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. SETTINGS (5 tables)
-- ============================================================

CREATE TABLE app_settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES companies(id),
  key         TEXT NOT NULL,
  value       JSONB NOT NULL,
  category    TEXT DEFAULT 'general',
  updated_by  UUID REFERENCES employees(id),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, key)
);

CREATE TABLE integrations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  name            TEXT NOT NULL,  -- pos_cukcuk, sapo, misa, base_erp
  provider        TEXT,
  is_active       BOOLEAN DEFAULT FALSE,
  config          JSONB DEFAULT '{}',
  last_sync_at    TIMESTAMPTZ,
  sync_status     TEXT DEFAULT 'idle',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhooks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  name            TEXT NOT NULL,
  url             TEXT NOT NULL,
  secret          TEXT,
  events          TEXT[] DEFAULT '{}',
  is_active       BOOLEAN DEFAULT TRUE,
  last_fired_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notification_subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id     UUID NOT NULL REFERENCES employees(id),
  channel         TEXT NOT NULL,  -- email, zalo, telegram, in_app
  event_types     TEXT[] DEFAULT '{}',
  is_active       BOOLEAN DEFAULT TRUE,
  config          JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  title           TEXT,
  messages        JSONB DEFAULT '[]',
  model           TEXT DEFAULT 'claude-sonnet-4-6',
  tokens_used     INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT triggers (auto-update timestamps)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'companies', 'departments', 'employees', 'profiles',
    'kpis', 'kpi_actuals', 'tasks', 'task_comments',
    'projects', 'objectives', 'key_results',
    'job_requisitions', 'candidates',
    'approvals', 'sop_documents', 'policies'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t, t
    );
  END LOOP;
END;
$$;

-- ============================================================
-- HELPER FUNCTIONS (for RLS)
-- ============================================================

-- Get company_id for current auth user
CREATE OR REPLACE FUNCTION current_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if current user has a given role
CREATE OR REPLACE FUNCTION has_role(check_role app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = check_role
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if current user has any of the given roles
CREATE OR REPLACE FUNCTION has_any_role(check_roles app_role[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = ANY(check_roles)
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if current user's department matches
CREATE OR REPLACE FUNCTION is_dept_head_of(dept_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN departments d ON d.id = dept_id
    WHERE p.id = auth.uid()
      AND p.role IN ('dept_head', 'ceo', 'cfo')
      AND (p.department_id = dept_id OR p.role IN ('ceo', 'cfo'))
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
