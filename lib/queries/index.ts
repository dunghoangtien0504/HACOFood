/**
 * HACO Food OS — Unified Query / Selector layer
 * ----------------------------------------------
 * Mọi trang import data từ đây (KHÔNG import trực tiếp `demo.ts` ở UI).
 * Khi cắm Supabase, chỉ thay phần body của các selector — UI không phải đổi.
 */

import {
  COMPANY,
  DEPARTMENTS, DEPT_BY_ID,
  EMPLOYEES, EMP_BY_ID,
  KPIS, KPI_BY_ID,
  TASKS,
  PROJECTS,
  FINANCE_HISTORY, FINANCE_SNAPSHOT, COST_BREAKDOWN, TRANSACTIONS,
  PAYROLL_PERIOD, PAYROLL_OVERRIDES, EMPLOYEE_KPI_COMPLETION,
  OBJECTIVES,
  ALERTS,
  APPROVALS,
  AUDIT_LOG,
  JOB_REQS,
  SOPS,
  REPORTS,
  type DeptId, type Department, type Employee, type Kpi, type Task, type Project,
  type Alert, type Approval, type Objective, type SOP, type JobReq, type Report,
  type Transaction,
} from "./demo";

import {
  buildKpiTree, completionOf, statusOf, summarizeKpis,
  rollupCompletion, simulateImpact,
  type KpiTreeNode, type KpiStatus,
} from "@/lib/kpi/cascade";

import {
  computePayroll, DEFAULT_RULES, DEPT_MULTIPLIER,
  type PayrollResult,
} from "@/lib/compensation/ruleEngine";

/* ============================ Re-exports gọn ============================ */

export {
  COMPANY,
  DEPARTMENTS, DEPT_BY_ID,
  EMPLOYEES, EMP_BY_ID,
  KPIS, KPI_BY_ID,
  TASKS, PROJECTS,
  FINANCE_HISTORY, FINANCE_SNAPSHOT, COST_BREAKDOWN, TRANSACTIONS,
  OBJECTIVES, ALERTS, APPROVALS, AUDIT_LOG,
  JOB_REQS, SOPS, REPORTS,
};
export type {
  DeptId, Department, Employee, Kpi, Task, Project,
  Alert, Approval, Objective, SOP, JobReq, Report, Transaction,
  KpiTreeNode, KpiStatus,
};
export { buildKpiTree, completionOf, statusOf, summarizeKpis, rollupCompletion, simulateImpact };

/* ============================ COMPANY ============================ */

export function getCompany() {
  return COMPANY;
}

/* ============================ DEPARTMENTS ============================ */

export function listDepartments(): Department[] {
  return DEPARTMENTS;
}

export function getDepartment(id: DeptId): Department | undefined {
  return DEPT_BY_ID[id];
}

export function getDepartmentSummary(id: DeptId) {
  const dept = DEPT_BY_ID[id];
  if (!dept) return null;
  const employees = EMPLOYEES.filter((e) => e.departmentId === id);
  const tasks = TASKS.filter((t) => t.departmentId === id);
  const kpis = KPIS.filter((k) => k.ownerDepartmentId === id);
  const projects = PROJECTS.filter((p) => p.departmentId === id);

  const tasksOpen = tasks.filter((t) => t.status !== "done" && t.status !== "blocked").length;
  const tasksOverdue = tasks.filter((t) => t.status !== "done" && new Date(t.dueDate) < new Date(COMPANY.currentPeriod + "-15")).length;
  const tasksDone = tasks.filter((t) => t.status === "done").length;

  const kpiSummary = summarizeKpis(kpis);
  const head = EMP_BY_ID[dept.headEmployeeId];

  return {
    department: dept,
    head,
    employees,
    tasks,
    kpis,
    projects,
    metrics: {
      headcount: employees.length,
      headcountReported: dept.headcount,
      tasksOpen,
      tasksOverdue,
      tasksDone,
      kpiAvgCompletion: kpiSummary.avgCompletion,
      kpiGreen: kpiSummary.green,
      kpiAmber: kpiSummary.amber,
      kpiRed: kpiSummary.red,
      budgetMonthly: dept.budgetMonthly,
      costActual: dept.costActual,
      budgetUtilization: dept.costActual / dept.budgetMonthly,
    },
  };
}

export function listDepartmentsWithKpi() {
  return DEPARTMENTS.map((d) => {
    const kpis = KPIS.filter((k) => k.ownerDepartmentId === d.id);
    const sum = summarizeKpis(kpis);
    return {
      ...d,
      kpiAvg: Math.round(sum.avgCompletion * 100),
      kpiCount: sum.total,
      headcount: EMPLOYEES.filter((e) => e.departmentId === d.id).length || d.headcount,
    };
  });
}

/* ============================ EMPLOYEES ============================ */

export function listEmployees(filter?: { departmentId?: DeptId }): Employee[] {
  if (!filter) return EMPLOYEES;
  return EMPLOYEES.filter((e) => (filter.departmentId ? e.departmentId === filter.departmentId : true));
}

export function getEmployee(id: string): Employee | undefined {
  return EMP_BY_ID[id];
}

export function getEmployeeProfile(id: string) {
  const emp = EMP_BY_ID[id];
  if (!emp) return null;
  const dept = DEPT_BY_ID[emp.departmentId];
  const manager = emp.managerId ? EMP_BY_ID[emp.managerId] : undefined;
  const reports = EMPLOYEES.filter((e) => e.managerId === id);
  const tasks = TASKS.filter((t) => t.assigneeId === id);
  const tasksToday = tasks.filter((t) => t.status !== "done").slice(0, 8);
  const ownedKpis = KPIS.filter((k) => k.ownerEmployeeId === id);
  const completion = EMPLOYEE_KPI_COMPLETION[id] ?? 1.0;
  const payroll = computePayroll({
    baseSalary: emp.baseSalary,
    targetBonus: emp.targetBonus,
    kpiCompletion: completion,
    deptMultiplier: DEPT_MULTIPLIER[emp.departmentId] ?? 1.0,
    bonusAdjustment: PAYROLL_OVERRIDES.find((o) => o.employeeId === id)?.bonusAdjustment,
    penalty: PAYROLL_OVERRIDES.find((o) => o.employeeId === id)?.penalty,
  });

  return {
    employee: emp,
    department: dept,
    manager,
    reports,
    tasks,
    tasksToday,
    ownedKpis,
    kpiCompletion: completion,
    payroll,
  };
}

/* ============================ KPI ============================ */

export function listKpis(): Kpi[] {
  return KPIS;
}

export function getKpi(id: string): Kpi | undefined {
  return KPI_BY_ID[id];
}

export function getKpiTree(rootId = "kpi_np"): KpiTreeNode[] {
  return buildKpiTree(KPIS, [rootId]);
}

export function listKpisByDepartment(deptId: DeptId): Kpi[] {
  return KPIS.filter((k) => k.ownerDepartmentId === deptId);
}

export function companyKpiSummary() {
  return summarizeKpis(KPIS);
}

export function listKpiSummariesByDepartment() {
  return DEPARTMENTS.map((d) => {
    const kpis = listKpisByDepartment(d.id);
    const sum = summarizeKpis(kpis);
    return {
      department: d,
      ...sum,
    };
  });
}

/* ============================ TASK / OPERATIONS ============================ */

export function listTasks(filter?: { departmentId?: DeptId; assigneeId?: string; status?: Task["status"]; }): Task[] {
  return TASKS.filter((t) => {
    if (filter?.departmentId && t.departmentId !== filter.departmentId) return false;
    if (filter?.assigneeId && t.assigneeId !== filter.assigneeId) return false;
    if (filter?.status && t.status !== filter.status) return false;
    return true;
  });
}

export function operationsSummary() {
  const total = TASKS.length;
  const done = TASKS.filter((t) => t.status === "done").length;
  const inProgress = TASKS.filter((t) => t.status === "in_progress").length;
  const overdue = TASKS.filter((t) => t.status !== "done" && new Date(t.dueDate) < new Date()).length;
  const blocked = TASKS.filter((t) => t.status === "blocked").length;
  const linkedToKpi = TASKS.filter((t) => t.linkedKpiId !== null).length;
  return {
    total,
    done,
    inProgress,
    overdue,
    blocked,
    linkedToKpiPct: total ? linkedToKpi / total : 0,
    onTimeRate: total ? (total - overdue) / total : 0,
    byType: {
      growth: TASKS.filter((t) => t.taskType === "growth").length,
      maintenance: TASKS.filter((t) => t.taskType === "maintenance").length,
      admin: TASKS.filter((t) => t.taskType === "admin").length,
      urgent: TASKS.filter((t) => t.taskType === "urgent").length,
    },
  };
}

/* ============================ PROJECTS ============================ */

export function listProjects(): Project[] {
  return PROJECTS;
}

export function getProject(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}

/* ============================ COMPENSATION / PAYROLL ============================ */

export type PayrollRow = {
  employee: Employee;
  payroll: PayrollResult;
  kpiCompletion: number;
  override?: { bonusAdjustment?: number; penalty?: number; note?: string };
};

export function runPayroll(period = PAYROLL_PERIOD.period): PayrollRow[] {
  return EMPLOYEES.map((emp) => {
    const completion = EMPLOYEE_KPI_COMPLETION[emp.id] ?? 1.0;
    const override = PAYROLL_OVERRIDES.find((o) => o.employeeId === emp.id);
    const payroll = computePayroll({
      baseSalary: emp.baseSalary,
      targetBonus: emp.targetBonus,
      kpiCompletion: override?.manualKpiCompletion ?? completion,
      deptMultiplier: DEPT_MULTIPLIER[emp.departmentId] ?? 1.0,
      bonusAdjustment: override?.bonusAdjustment,
      penalty: override?.penalty,
    });
    return { employee: emp, payroll, kpiCompletion: completion, override };
  });
}

export function payrollSummary() {
  const rows = runPayroll();
  const grossTotal = rows.reduce((s, r) => s + r.payroll.gross, 0);
  const netTotal = rows.reduce((s, r) => s + r.payroll.net, 0);
  const bonusTotal = rows.reduce((s, r) => s + r.payroll.bonusEarned, 0);
  const insuranceTotal = rows.reduce((s, r) => s + r.payroll.insurance, 0);
  const companyCostTotal = rows.reduce((s, r) => s + r.payroll.companyCost, 0);
  const avgPerHead = grossTotal / rows.length;
  return {
    rows,
    grossTotal,
    netTotal,
    bonusTotal,
    insuranceTotal,
    companyCostTotal,
    avgPerHead,
    payrollOverRevenue: grossTotal / FINANCE_SNAPSHOT.revenue,
  };
}

export { DEFAULT_RULES, DEPT_MULTIPLIER };

/* ============================ FINANCE ============================ */

export function getFinanceHistory() {
  return FINANCE_HISTORY;
}

export function getFinanceSnapshot() {
  return FINANCE_SNAPSHOT;
}

export function getCostBreakdown() {
  return COST_BREAKDOWN;
}

export function listTransactions(): Transaction[] {
  return TRANSACTIONS;
}

export function cashflowSeries() {
  return FINANCE_HISTORY.map((h) => ({ period: h.period, cashIn: h.cashIn, cashOut: h.cashOut, net: h.cashIn - h.cashOut }));
}

export function calcRunwayMonths() {
  const burns = FINANCE_HISTORY.slice(-3).map((h) => h.cashOut - h.cashIn);
  const avgBurn = burns.reduce((s, b) => s + Math.max(b, 0), 0) / burns.length;
  if (avgBurn <= 0) return Infinity;
  return Math.round((FINANCE_SNAPSHOT.cash / avgBurn) * 10) / 10;
}

/* ============================ FORECAST / WHAT-IF ============================ */

export function runForecast(adjustments: { kpiId: string; deltaPercent: number }[]) {
  let netProfitDelta = 0;
  const impacts = adjustments.map((adj) => {
    const r = simulateImpact(KPIS, adj.kpiId, adj.deltaPercent);
    netProfitDelta += r.netProfitDelta;
    return r;
  });
  const baselineNp = FINANCE_SNAPSHOT.netProfit;
  return {
    baseline: baselineNp,
    forecastNetProfit: baselineNp + netProfitDelta,
    netProfitDelta,
    impacts,
  };
}

export const DEFAULT_SCENARIOS = [
  { id: "scn_growth", name: "Tăng trưởng mạnh", color: "#10b981", probability: 0.35, adjustments: [
    { kpiId: "kpi_rev_b2b", deltaPercent: 0.15 },
    { kpiId: "kpi_rev_b2c", deltaPercent: 0.20 },
    { kpiId: "kpi_food_cost", deltaPercent: -0.05 },
  ]},
  { id: "scn_base", name: "Thận trọng", color: "#3b82f6", probability: 0.40, adjustments: [
    { kpiId: "kpi_rev", deltaPercent: 0.05 },
    { kpiId: "kpi_opex", deltaPercent: 0.02 },
  ]},
  { id: "scn_costcut", name: "Cắt giảm chi phí", color: "#f59e0b", probability: 0.15, adjustments: [
    { kpiId: "kpi_mkt_spend", deltaPercent: -0.20 },
    { kpiId: "kpi_payroll_cost", deltaPercent: -0.05 },
    { kpiId: "kpi_rev_b2c", deltaPercent: -0.08 },
  ]},
  { id: "scn_risk", name: "Rủi ro suy giảm", color: "#f43f5e", probability: 0.10, adjustments: [
    { kpiId: "kpi_rev_b2b", deltaPercent: -0.20 },
    { kpiId: "kpi_food_cost", deltaPercent: 0.08 },
  ]},
];

/* ============================ OKR ============================ */

export function listObjectives(): Objective[] {
  return OBJECTIVES;
}

/* ============================ ALERTS / APPROVALS / AUDIT ============================ */

export function listAlerts(): Alert[] {
  return ALERTS;
}

export function alertsSummary() {
  const open = ALERTS.filter((a) => !a.resolvedAt);
  return {
    total: open.length,
    critical: open.filter((a) => a.severity === "critical").length,
    danger: open.filter((a) => a.severity === "danger").length,
    warning: open.filter((a) => a.severity === "warning").length,
    info: open.filter((a) => a.severity === "info").length,
  };
}

export function listApprovals(): Approval[] {
  return APPROVALS;
}

export function approvalsSummary() {
  const pending = APPROVALS.filter((a) => a.status === "pending");
  return {
    pending: pending.length,
    pendingValue: pending.reduce((s, a) => s + a.amount, 0),
    approved30d: APPROVALS.filter((a) => a.status === "approved").length,
    rejected30d: APPROVALS.filter((a) => a.status === "rejected").length,
  };
}

export function listAuditLog() {
  return AUDIT_LOG;
}

/* ============================ HR / RECRUITING / KNOWLEDGE / REPORTS ============================ */

export function listJobReqs(): JobReq[] {
  return JOB_REQS;
}

export function listSops(): SOP[] {
  return SOPS;
}

export function listReports(): Report[] {
  return REPORTS;
}

/* ============================ AGGREGATE — DASHBOARD HEADLINES ============================ */

export function dashboardHeadlines() {
  const fin = getFinanceSnapshot();
  const ops = operationsSummary();
  const pay = payrollSummary();
  const kpi = companyKpiSummary();
  const alerts = alertsSummary();
  const runway = calcRunwayMonths();
  return {
    revenue: fin.revenue,
    grossProfit: fin.grossProfit,
    netProfit: fin.netProfit,
    grossMargin: fin.grossProfit / fin.revenue,
    netMargin: fin.netProfit / fin.revenue,
    cash: fin.cash,
    runwayMonths: runway,
    headcount: EMPLOYEES.length,
    departmentCount: DEPARTMENTS.length,
    payrollGross: pay.grossTotal,
    payrollOverRevenue: pay.payrollOverRevenue,
    bonusPool: pay.bonusTotal,
    kpiCompletion: kpi.avgCompletion,
    kpiGreen: kpi.green,
    kpiAmber: kpi.amber,
    kpiRed: kpi.red,
    tasksTotal: ops.total,
    tasksOpen: ops.total - ops.done,
    tasksOverdue: ops.overdue,
    tasksLinkedKpi: ops.linkedToKpiPct,
    alerts,
  };
}
