-- ============================================================
-- HACO Food OS — Row Level Security Policies
-- Chạy SAU db/schema.sql và db/schema_haco_extension.sql
-- ============================================================

-- Enable RLS on all tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    -- Core
    'companies', 'departments', 'employees', 'profiles', 'teams', 'team_members',
    'job_levels', 'org_snapshots',
    -- KPI
    'kpis', 'kpi_targets', 'kpi_actuals', 'kpi_history', 'kpi_overrides',
    'kpi_assignments', 'kpi_comments',
    -- Tasks
    'tasks', 'task_outputs', 'task_comments', 'task_checklist_items',
    'time_logs', 'sop_documents',
    -- Projects
    'projects', 'project_members', 'project_milestones', 'project_risks',
    'project_updates', 'project_budgets',
    -- Compensation
    'payroll_periods', 'payroll_entries', 'payroll_rules', 'dept_bonus_multipliers',
    'payroll_overrides', 'leave_requests', 'attendance_logs',
    -- Finance
    'chart_of_accounts', 'accounting_entries', 'budgets', 'invoices',
    'cash_transactions', 'financial_statements', 'tax_declarations', 'fixed_assets',
    -- OKR
    'objectives', 'key_results', 'okr_check_ins',
    -- Recruiting
    'job_requisitions', 'candidates', 'interviews', 'onboarding_tasks',
    -- Governance
    'approvals', 'approval_steps', 'alerts', 'audit_logs',
    'policies', 'announcements', 'meeting_notes', 'reports',
    -- Settings
    'app_settings', 'integrations', 'webhooks',
    'notification_subscriptions', 'ai_conversations',
    -- F&B Extension
    'ingredients', 'suppliers', 'dishes', 'recipes', 'recipe_ingredients',
    'inventory_locations', 'inventory_movements', 'daily_sales', 'pos_transactions',
    'purchase_orders', 'purchase_order_items', 'haccp_checks'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END;
$$;

-- ============================================================
-- COMPANIES
-- ============================================================
CREATE POLICY "companies: own company read"
  ON companies FOR SELECT
  USING (id = current_company_id());

CREATE POLICY "companies: ceo/cfo update"
  ON companies FOR UPDATE
  USING (id = current_company_id() AND has_any_role(ARRAY['ceo', 'cfo']::app_role[]));

-- ============================================================
-- DEPARTMENTS
-- ============================================================
CREATE POLICY "departments: company read"
  ON departments FOR SELECT
  USING (company_id = current_company_id());

CREATE POLICY "departments: ceo/hr_admin write"
  ON departments FOR ALL
  USING (company_id = current_company_id() AND has_any_role(ARRAY['ceo', 'hr_admin']::app_role[]));

-- ============================================================
-- EMPLOYEES
-- ============================================================
-- All employees see all employees in their company (for org chart, assignments)
CREATE POLICY "employees: company read"
  ON employees FOR SELECT
  USING (company_id = current_company_id());

-- HR admin and CEO can create/update employees
CREATE POLICY "employees: hr/ceo write"
  ON employees FOR INSERT
  WITH CHECK (company_id = current_company_id() AND has_any_role(ARRAY['ceo', 'hr_admin']::app_role[]));

CREATE POLICY "employees: hr/ceo update"
  ON employees FOR UPDATE
  USING (company_id = current_company_id() AND has_any_role(ARRAY['ceo', 'hr_admin']::app_role[]));

-- Employees can update their own record (limited fields via app logic)
CREATE POLICY "employees: self update"
  ON employees FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "profiles: own read"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR company_id = current_company_id());

CREATE POLICY "profiles: self update"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "profiles: hr/ceo manage"
  ON profiles FOR ALL
  USING (company_id = current_company_id() AND has_any_role(ARRAY['ceo', 'hr_admin']::app_role[]));

-- ============================================================
-- KPIs
-- ============================================================
CREATE POLICY "kpis: company read"
  ON kpis FOR SELECT
  USING (company_id = current_company_id());

CREATE POLICY "kpis: ceo/cfo/dept_head write"
  ON kpis FOR ALL
  USING (company_id = current_company_id() AND has_any_role(ARRAY['ceo', 'cfo', 'dept_head']::app_role[]));

-- ============================================================
-- KPI TARGETS
-- ============================================================
CREATE POLICY "kpi_targets: company read"
  ON kpi_targets FOR SELECT
  USING (EXISTS (SELECT 1 FROM kpis WHERE id = kpi_id AND company_id = current_company_id()));

CREATE POLICY "kpi_targets: ceo/cfo/dept_head write"
  ON kpi_targets FOR ALL
  USING (
    EXISTS (SELECT 1 FROM kpis WHERE id = kpi_id AND company_id = current_company_id())
    AND has_any_role(ARRAY['ceo', 'cfo', 'dept_head']::app_role[])
  );

-- ============================================================
-- KPI ACTUALS
-- ============================================================
CREATE POLICY "kpi_actuals: company read"
  ON kpi_actuals FOR SELECT
  USING (EXISTS (SELECT 1 FROM kpis WHERE id = kpi_id AND company_id = current_company_id()));

CREATE POLICY "kpi_actuals: team_lead+ write"
  ON kpi_actuals FOR ALL
  USING (
    EXISTS (SELECT 1 FROM kpis WHERE id = kpi_id AND company_id = current_company_id())
    AND has_any_role(ARRAY['ceo', 'cfo', 'dept_head', 'team_lead', 'hr_admin']::app_role[])
  );

-- ============================================================
-- TASKS
-- ============================================================
-- All employees read tasks in their company
CREATE POLICY "tasks: company read"
  ON tasks FOR SELECT
  USING (company_id = current_company_id());

-- Assignee and reporter can update their own tasks
CREATE POLICY "tasks: assignee update"
  ON tasks FOR UPDATE
  USING (
    company_id = current_company_id()
    AND (
      assignee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
      OR reporter_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
      OR has_any_role(ARRAY['ceo', 'dept_head', 'team_lead', 'hr_admin']::app_role[])
    )
  );

CREATE POLICY "tasks: team_lead+ create"
  ON tasks FOR INSERT
  WITH CHECK (
    company_id = current_company_id()
    AND has_any_role(ARRAY['ceo', 'dept_head', 'team_lead', 'hr_admin', 'employee']::app_role[])
  );

-- ============================================================
-- PAYROLL (sensitive — restricted)
-- ============================================================
-- Only self + hr_admin + ceo + cfo
CREATE POLICY "payroll_entries: self read"
  ON payroll_entries FOR SELECT
  USING (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
    OR has_any_role(ARRAY['ceo', 'cfo', 'hr_admin']::app_role[])
  );

CREATE POLICY "payroll_entries: hr/cfo write"
  ON payroll_entries FOR ALL
  USING (has_any_role(ARRAY['ceo', 'cfo', 'hr_admin']::app_role[]));

CREATE POLICY "payroll_periods: hr/cfo read"
  ON payroll_periods FOR SELECT
  USING (
    company_id = current_company_id()
    AND has_any_role(ARRAY['ceo', 'cfo', 'hr_admin']::app_role[])
  );

CREATE POLICY "payroll_periods: hr/cfo write"
  ON payroll_periods FOR ALL
  USING (
    company_id = current_company_id()
    AND has_any_role(ARRAY['ceo', 'cfo', 'hr_admin']::app_role[])
  );

CREATE POLICY "payroll_rules: ceo/cfo write"
  ON payroll_rules FOR ALL
  USING (company_id = current_company_id() AND has_any_role(ARRAY['ceo', 'cfo']::app_role[]));

CREATE POLICY "payroll_rules: hr read"
  ON payroll_rules FOR SELECT
  USING (company_id = current_company_id() AND has_any_role(ARRAY['ceo', 'cfo', 'hr_admin']::app_role[]));

-- ============================================================
-- FINANCE (sensitive — cfo/ceo only for write)
-- ============================================================
CREATE POLICY "accounting_entries: cfo/ceo read"
  ON accounting_entries FOR SELECT
  USING (
    company_id = current_company_id()
    AND has_any_role(ARRAY['ceo', 'cfo', 'auditor']::app_role[])
  );

CREATE POLICY "accounting_entries: cfo write"
  ON accounting_entries FOR ALL
  USING (
    company_id = current_company_id()
    AND has_any_role(ARRAY['ceo', 'cfo']::app_role[])
  );

CREATE POLICY "budgets: dept read"
  ON budgets FOR SELECT
  USING (
    company_id = current_company_id()
    AND (
      has_any_role(ARRAY['ceo', 'cfo', 'auditor']::app_role[])
      OR is_dept_head_of(department_id)
    )
  );

CREATE POLICY "budgets: cfo write"
  ON budgets FOR ALL
  USING (company_id = current_company_id() AND has_any_role(ARRAY['ceo', 'cfo']::app_role[]));

-- ============================================================
-- ALERTS
-- ============================================================
CREATE POLICY "alerts: company read"
  ON alerts FOR SELECT
  USING (company_id = current_company_id());

CREATE POLICY "alerts: system write"
  ON alerts FOR ALL
  USING (company_id = current_company_id() AND has_any_role(ARRAY['ceo', 'cfo', 'hr_admin']::app_role[]));

-- ============================================================
-- APPROVALS
-- ============================================================
CREATE POLICY "approvals: requester/approver read"
  ON approvals FOR SELECT
  USING (
    company_id = current_company_id()
    AND (
      requester_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
      OR approver_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
      OR has_any_role(ARRAY['ceo', 'cfo', 'hr_admin']::app_role[])
    )
  );

CREATE POLICY "approvals: all create"
  ON approvals FOR INSERT
  WITH CHECK (company_id = current_company_id());

CREATE POLICY "approvals: approver update"
  ON approvals FOR UPDATE
  USING (
    company_id = current_company_id()
    AND (
      approver_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
      OR has_any_role(ARRAY['ceo', 'cfo', 'hr_admin']::app_role[])
    )
  );

-- ============================================================
-- AUDIT LOGS (read-only for auditor, insert by system)
-- ============================================================
CREATE POLICY "audit_logs: auditor/ceo read"
  ON audit_logs FOR SELECT
  USING (
    company_id = current_company_id()
    AND has_any_role(ARRAY['ceo', 'cfo', 'auditor']::app_role[])
  );

-- Only service role (backend) can insert audit logs
-- (achieved by using service role key in withAudit HOC)

-- ============================================================
-- OBJECTIVES / OKR
-- ============================================================
CREATE POLICY "objectives: company read"
  ON objectives FOR SELECT
  USING (company_id = current_company_id());

CREATE POLICY "objectives: ceo/dept_head write"
  ON objectives FOR ALL
  USING (company_id = current_company_id() AND has_any_role(ARRAY['ceo', 'dept_head']::app_role[]));

CREATE POLICY "key_results: company read"
  ON key_results FOR SELECT
  USING (EXISTS (SELECT 1 FROM objectives WHERE id = objective_id AND company_id = current_company_id()));

CREATE POLICY "key_results: owner/ceo write"
  ON key_results FOR ALL
  USING (
    EXISTS (SELECT 1 FROM objectives WHERE id = objective_id AND company_id = current_company_id())
    AND has_any_role(ARRAY['ceo', 'dept_head', 'team_lead']::app_role[])
  );

-- ============================================================
-- F&B EXTENSION: Daily Sales (sensitive — ceo/cfo/dept_head)
-- ============================================================
CREATE POLICY "daily_sales: company read"
  ON daily_sales FOR SELECT
  USING (
    company_id = current_company_id()
    AND has_any_role(ARRAY['ceo', 'cfo', 'dept_head', 'hr_admin']::app_role[])
  );

CREATE POLICY "daily_sales: cfo/dept write"
  ON daily_sales FOR ALL
  USING (
    company_id = current_company_id()
    AND has_any_role(ARRAY['ceo', 'cfo', 'dept_head']::app_role[])
  );

-- ============================================================
-- F&B EXTENSION: Ingredients, Suppliers, Dishes (public read within company)
-- ============================================================
CREATE POLICY "ingredients: company read"
  ON ingredients FOR SELECT
  USING (company_id = current_company_id());

CREATE POLICY "ingredients: dept_head+ write"
  ON ingredients FOR ALL
  USING (company_id = current_company_id() AND has_any_role(ARRAY['ceo', 'dept_head', 'hr_admin']::app_role[]));

CREATE POLICY "suppliers: company read"
  ON suppliers FOR SELECT
  USING (company_id = current_company_id());

CREATE POLICY "suppliers: dept_head+ write"
  ON suppliers FOR ALL
  USING (company_id = current_company_id() AND has_any_role(ARRAY['ceo', 'cfo', 'dept_head']::app_role[]));

CREATE POLICY "dishes: company read"
  ON dishes FOR SELECT
  USING (company_id = current_company_id());

CREATE POLICY "dishes: dept_head+ write"
  ON dishes FOR ALL
  USING (company_id = current_company_id() AND has_any_role(ARRAY['ceo', 'dept_head']::app_role[]));

CREATE POLICY "inventory_movements: company read"
  ON inventory_movements FOR SELECT
  USING (company_id = current_company_id());

CREATE POLICY "inventory_movements: team_lead+ write"
  ON inventory_movements FOR ALL
  USING (
    company_id = current_company_id()
    AND has_any_role(ARRAY['ceo', 'dept_head', 'team_lead', 'hr_admin']::app_role[])
  );

CREATE POLICY "pos_transactions: cfo/ceo read"
  ON pos_transactions FOR SELECT
  USING (
    company_id = current_company_id()
    AND has_any_role(ARRAY['ceo', 'cfo', 'dept_head']::app_role[])
  );

CREATE POLICY "haccp_checks: company read"
  ON haccp_checks FOR SELECT
  USING (company_id = current_company_id());

CREATE POLICY "haccp_checks: team_lead+ write"
  ON haccp_checks FOR ALL
  USING (
    company_id = current_company_id()
    AND has_any_role(ARRAY['ceo', 'dept_head', 'team_lead', 'hr_admin']::app_role[])
  );

-- ============================================================
-- REMAINING TABLES — broad company-level policies
-- ============================================================
-- Projects
CREATE POLICY "projects: company read" ON projects FOR SELECT USING (company_id = current_company_id());
CREATE POLICY "projects: dept_head write" ON projects FOR ALL
  USING (company_id = current_company_id() AND has_any_role(ARRAY['ceo', 'dept_head']::app_role[]));

-- SOPs
CREATE POLICY "sop_documents: company read" ON sop_documents FOR SELECT USING (company_id = current_company_id());
CREATE POLICY "sop_documents: dept_head write" ON sop_documents FOR ALL
  USING (company_id = current_company_id() AND has_any_role(ARRAY['ceo', 'dept_head', 'hr_admin']::app_role[]));

-- Leave requests — self + hr
CREATE POLICY "leave_requests: self/hr read" ON leave_requests FOR SELECT
  USING (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
    OR has_any_role(ARRAY['ceo', 'hr_admin', 'dept_head']::app_role[])
  );
CREATE POLICY "leave_requests: self create" ON leave_requests FOR INSERT
  WITH CHECK (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));
CREATE POLICY "leave_requests: hr approve" ON leave_requests FOR UPDATE
  USING (has_any_role(ARRAY['ceo', 'hr_admin', 'dept_head']::app_role[]));

-- Settings — ceo only
CREATE POLICY "app_settings: ceo read" ON app_settings FOR SELECT
  USING (company_id = current_company_id() AND has_any_role(ARRAY['ceo', 'cfo']::app_role[]));
CREATE POLICY "app_settings: ceo write" ON app_settings FOR ALL
  USING (company_id = current_company_id() AND has_role('ceo'));

-- Announcements — all read
CREATE POLICY "announcements: all read" ON announcements FOR SELECT USING (company_id = current_company_id());
CREATE POLICY "announcements: hr/ceo write" ON announcements FOR ALL
  USING (company_id = current_company_id() AND has_any_role(ARRAY['ceo', 'hr_admin']::app_role[]));

-- Reports — company read
CREATE POLICY "reports: company read" ON reports FOR SELECT USING (company_id = current_company_id());
