// =============================================================================
// HACO Food OS — Domain Types
// =============================================================================

export type Company = {
  id: string;
  name: string;
  code: string;
  currency: string;
  timezone: string;
  settings: Record<string, unknown>;
};

export type Department = {
  id: string;
  company_id: string;
  name: string;
  code: string;
  head_employee_id: string | null;
  budget_monthly: number;
  scope: string;
};

export type Employee = {
  id: string;
  company_id: string;
  auth_user_id: string | null;
  code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  department_id: string | null;
  team_id: string | null;
  position_id: string;
  manager_id: string | null;
  join_date: string;
  status: "active" | "onboarding" | "on_leave" | "terminated";
  base_salary: number;
  employment_type: "fulltime" | "parttime" | "contract" | "intern" | "freelance";
};

export type Kpi = {
  id: string;
  company_id: string;
  code: string;
  name: string;
  description: string;
  level: "company" | "department" | "team" | "employee";
  owner_employee_id: string | null;
  owner_department_id: string | null;
  owner_team_id: string | null;
  unit: string;
  weight: number;
  parent_kpi_id: string | null;
  data_source: string;
  active: boolean;
  target_frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
};

export type KpiTarget = {
  kpi_id: string;
  period: string;
  target_value: number;
};

export type KpiActual = {
  kpi_id: string;
  period: string;
  actual_value: number;
  completion_rate: number;
  status: string;
};

export type KpiFormulaDef =
  | { const: number }
  | { ref: string }
  | { op: "sum"; args: KpiFormulaDef[] }
  | { op: "sub"; args: KpiFormulaDef[] }
  | { op: "mul"; args: KpiFormulaDef[] }
  | { op: "avg"; args: KpiFormulaDef[] }
  | { op: "weighted_avg"; args: KpiFormulaDef[] }
  | { op: "ratio"; numerator: KpiFormulaDef; denominator: KpiFormulaDef }
  | { op: "milestone"; steps: { at: number; value: number }[] }
  | { op: "manual"; value: number };

export type Task = {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  assignee_id: string;
  reviewer_id: string | null;
  department_id: string;
  project_id: string | null;
  linked_kpi_id: string | null;
  priority: "low" | "normal" | "high" | "urgent";
  task_type: "growth" | "maintenance" | "admin" | "urgent";
  status: "todo" | "in_progress" | "blocked" | "review" | "done" | "cancelled";
  due_date: string;
  estimated_hours: number | null;
  actual_hours: number | null;
};

export type PayrollEntry = {
  id: string;
  company_id: string;
  payroll_period_id: string;
  employee_id: string;
  base_salary: number;
  allowance_total: number;
  commission_total: number;
  bonus_total: number;
  penalty_total: number;
  adjustment_total: number;
  gross_pay: number;
  net_pay: number;
  company_cost: number;
  breakdown: Record<string, unknown>;
};

export type Project = {
  id: string;
  company_id: string;
  code: string;
  name: string;
  owner_id: string;
  business_case: string;
  status: "draft" | "active" | "paused" | "done" | "cancelled";
  starts_at: string;
  ends_at: string;
  budget: number;
};

export type AccountingEntry = {
  id: string;
  company_id: string;
  entry_date: string;
  account_code: string;
  debit: number;
  credit: number;
  cost_center_id: string | null;
  department_id: string | null;
  project_id: string | null;
  note: string;
};

export type Alert = {
  id: string;
  company_id: string;
  severity: "info" | "warning" | "danger" | "critical";
  title: string;
  detail: Record<string, unknown>;
  resolved_at: string | null;
  created_at: string;
};

export type Approval = {
  id: string;
  company_id: string;
  kind: string;
  title: string;
  payload: Record<string, unknown>;
  status: "pending" | "approved" | "rejected" | "cancelled";
  requested_by: string;
  created_at: string;
};

export type Objective = {
  id: string;
  company_id: string;
  level: "company" | "department" | "team" | "employee";
  owner_employee_id: string;
  owner_department_id: string | null;
  title: string;
  description: string | null;
  period: string;
  status: string;
  progress_pct: number;
};

export type KeyResult = {
  id: string;
  objective_id: string;
  title: string;
  target_value: number;
  actual_value: number;
  unit: string;
  progress_pct: number;
};

export type JobRequisition = {
  id: string;
  company_id: string;
  department_id: string;
  position_id: string | null;
  title: string;
  headcount: number;
  status: string;
  reason: string;
  opened_at: string;
  closed_at: string | null;
};

export type SopDocument = {
  id: string;
  company_id: string;
  department_id: string;
  title: string;
  body: string;
  version: number;
  published: boolean;
};

export type AuditLog = {
  id: string;
  company_id: string;
  actor: string;
  action: string;
  entity: string;
  entity_id: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  created_at: string;
};
