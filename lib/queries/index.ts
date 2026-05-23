/**
 * HACO Food OS — Unified Query / Selector / State Layer
 * ---------------------------------------------------
 * Mọi trang import data từ đây.
 * Hỗ trợ đồng bộ trạng thái động toàn cục qua localStorage, các side-effects cascades,
 * và cung cấp hook `useHACOUpdate()` để tự động cập nhật UI trên các Client Components.
 */

import { useState, useEffect } from "react";
import {
  COMPANY as defaultCompany,
  DEPARTMENTS as defaultDepartments,
  EMPLOYEES as defaultEmployees,
  KPIS as defaultKpis,
  TASKS as defaultTasks,
  PROJECTS as defaultProjects,
  FINANCE_HISTORY as defaultFinanceHistory,
  FINANCE_SNAPSHOT as defaultFinanceSnapshot,
  COST_BREAKDOWN as defaultCostBreakdown,
  TRANSACTIONS as defaultTransactions,
  PAYROLL_PERIOD,
  PAYROLL_OVERRIDES as defaultPayrollOverrides,
  EMPLOYEE_KPI_COMPLETION as defaultEmployeeKpiCompletion,
  OBJECTIVES as defaultObjectives,
  ALERTS as defaultAlerts,
  APPROVALS as defaultApprovals,
  AUDIT_LOG as defaultAuditLog,
  JOB_REQS as defaultJobReqs,
  SOPS as defaultSops,
  REPORTS as defaultReports,
  type DeptId, type Department, type Employee, type Kpi, type Task, type Project,
  type Alert, type Approval, type Objective, type SOP, type JobReq, type Report,
  type Transaction,
} from "./demo";

export type {
  DeptId, Department, Employee, Kpi, Task, Project,
  Alert, Approval, Objective, SOP, JobReq, Report,
  Transaction,
};

import {
  buildKpiTree, completionOf, statusOf, summarizeKpis,
  rollupCompletion, simulateImpact,
  type KpiTreeNode, type KpiStatus,
} from "@/lib/kpi/cascade";

export {
  buildKpiTree, completionOf, statusOf, summarizeKpis,
  rollupCompletion, simulateImpact,
  type KpiTreeNode, type KpiStatus,
};

import {
  computePayroll, DEFAULT_RULES, DEPT_MULTIPLIER,
  type PayrollResult,
} from "@/lib/compensation/ruleEngine";

/* ============================ STATE STORE ============================ */

const hacoState = {
  company: { ...defaultCompany },
  departments: JSON.parse(JSON.stringify(defaultDepartments)) as Department[],
  employees: JSON.parse(JSON.stringify(defaultEmployees)) as Employee[],
  kpis: JSON.parse(JSON.stringify(defaultKpis)) as Kpi[],
  tasks: JSON.parse(JSON.stringify(defaultTasks)) as Task[],
  projects: JSON.parse(JSON.stringify(defaultProjects)) as Project[],
  financeSnapshot: { ...defaultFinanceSnapshot },
  transactions: JSON.parse(JSON.stringify(defaultTransactions)) as Transaction[],
  payrollOverrides: JSON.parse(JSON.stringify(defaultPayrollOverrides)),
  alerts: JSON.parse(JSON.stringify(defaultAlerts)) as Alert[],
  approvals: JSON.parse(JSON.stringify(defaultApprovals)) as Approval[],
  auditLog: JSON.parse(JSON.stringify(defaultAuditLog)) as any[],
  jobReqs: JSON.parse(JSON.stringify(defaultJobReqs)) as JobReq[],
  sops: JSON.parse(JSON.stringify(defaultSops)) as SOP[],
  reports: JSON.parse(JSON.stringify(defaultReports)) as Report[],
  objectives: JSON.parse(JSON.stringify(defaultObjectives)) as Objective[],
};

/* ============================ EXPORTED LIVE REFERENCES ============================ */

export const COMPANY = { ...defaultCompany };
export const DEPARTMENTS: Department[] = [];
export const DEPT_BY_ID: Record<DeptId, Department> = {} as any;
export const EMPLOYEES: Employee[] = [];
export const EMP_BY_ID: Record<string, Employee> = {};
export const KPIS: Kpi[] = [];
export const KPI_BY_ID: Record<string, Kpi> = {};
export const TASKS: Task[] = [];
export const PROJECTS: Project[] = [];
export const FINANCE_HISTORY = JSON.parse(JSON.stringify(defaultFinanceHistory));
export const FINANCE_SNAPSHOT = { ...defaultFinanceSnapshot };
export const COST_BREAKDOWN = JSON.parse(JSON.stringify(defaultCostBreakdown));
export const TRANSACTIONS: Transaction[] = [];
export const OBJECTIVES: Objective[] = [];
export const ALERTS: Alert[] = [];
export const APPROVALS: Approval[] = [];
export const AUDIT_LOG: any[] = [];
export const JOB_REQS: JobReq[] = [];
export const SOPS: SOP[] = [];
export const REPORTS: Report[] = [];
export const EMPLOYEE_KPI_COMPLETION: Record<string, number> = {};

function replaceArrayContents(target: any[], source: any[]) {
  target.length = 0;
  target.push(...source);
}

export function syncStateToExports() {
  replaceArrayContents(DEPARTMENTS, hacoState.departments);
  replaceArrayContents(EMPLOYEES, hacoState.employees);
  replaceArrayContents(KPIS, hacoState.kpis);
  replaceArrayContents(TASKS, hacoState.tasks);
  replaceArrayContents(PROJECTS, hacoState.projects);
  replaceArrayContents(TRANSACTIONS, hacoState.transactions);
  replaceArrayContents(OBJECTIVES, hacoState.objectives);
  replaceArrayContents(ALERTS, hacoState.alerts);
  replaceArrayContents(APPROVALS, hacoState.approvals);
  replaceArrayContents(AUDIT_LOG, hacoState.auditLog);
  replaceArrayContents(JOB_REQS, hacoState.jobReqs);
  replaceArrayContents(SOPS, hacoState.sops);
  replaceArrayContents(REPORTS, hacoState.reports);

  Object.assign(COMPANY, hacoState.company);
  Object.assign(FINANCE_SNAPSHOT, hacoState.financeSnapshot);

  // Sync Cost Breakdown (cho trang Finance)
  const breakdown = [
    { name: "Nguyên liệu", value: hacoState.financeSnapshot.cogs * 0.65, color: "#1b5e20" },
    { name: "Lương & BHXH", value: hacoState.financeSnapshot.opex * 0.51, color: "#10b981" },
    { name: "Marketing", value: hacoState.financeSnapshot.opex * 0.25, color: "#8b5cf6" },
    { name: "Logistics", value: hacoState.financeSnapshot.opex * 0.13, color: "#3b82f6" },
    { name: "Mặt bằng + tiện ích", value: hacoState.financeSnapshot.opex * 0.11, color: "#f59e0b" },
  ];
  replaceArrayContents(COST_BREAKDOWN, breakdown);

  // Rebuild lookup maps
  for (const key in DEPT_BY_ID) delete (DEPT_BY_ID as any)[key];
  hacoState.departments.forEach((d) => {
    (DEPT_BY_ID as any)[d.id] = d;
  });

  for (const key in EMP_BY_ID) delete EMP_BY_ID[key];
  hacoState.employees.forEach((e) => {
    EMP_BY_ID[e.id] = e;
  });

  for (const key in KPI_BY_ID) delete KPI_BY_ID[key];
  hacoState.kpis.forEach((k) => {
    KPI_BY_ID[k.id] = k;
  });

  for (const key in EMPLOYEE_KPI_COMPLETION) delete EMPLOYEE_KPI_COMPLETION[key];
  hacoState.employees.forEach((e) => {
    EMPLOYEE_KPI_COMPLETION[e.id] = getEmployeeKpiCompletion(e.id);
  });
}

// Chạy sync ban đầu để SSR có dữ liệu sẵn
syncStateToExports();

/* ============================ LOCAL STORAGE SYNC & REACT SUBSCRIPTION ============================ */

let isClientLoaded = false;
const subscribers = new Set<() => void>();

export function subscribe(cb: () => void) {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

export function notify() {
  subscribers.forEach((cb) => cb());
}

export function ensureClientLoaded() {
  if (typeof window === "undefined" || isClientLoaded) return;
  try {
    const saved = localStorage.getItem("haco-food-os-state-v1");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ghi đè các trường vào hacoState
      Object.keys(parsed).forEach((k) => {
        if (hacoState.hasOwnProperty(k)) {
          (hacoState as any)[k] = parsed[k];
        }
      });
    }
    isClientLoaded = true;
    syncStateToExports();
    notify();
  } catch (e) {
    console.error("Lỗi khi khôi phục trạng thái từ localStorage:", e);
  }
}

function saveState() {
  syncStateToExports();
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("haco-food-os-state-v1", JSON.stringify(hacoState));
    } catch (e) {
      console.error("Lỗi khi ghi trạng thái vào localStorage:", e);
    }
  }
}

export function useHACOUpdate() {
  const [, setTick] = useState(0);
  useEffect(() => {
    ensureClientLoaded();
    return subscribe(() => setTick((t) => t + 1));
  }, []);
}

/* ============================ CASCADING RECALCULATIONS ============================ */

/** Tự động tổng hợp dữ liệu KPI & Tài chính lên cấp công ty */
function rollupKpisAndFinance() {
  const kpiMap = new Map(hacoState.kpis.map((k) => [k.id, k]));

  // 1. Tổng hợp Doanh thu Sales B2B, B2C, Showroom → kpi_rev
  const revB2b = kpiMap.get("kpi_rev_b2b")?.actual ?? 0;
  const revB2c = kpiMap.get("kpi_rev_b2c")?.actual ?? 0;
  const revShowroom = kpiMap.get("kpi_rev_showroom")?.actual ?? 0;
  const revKpi = kpiMap.get("kpi_rev");
  if (revKpi) revKpi.actual = revB2b + revB2c + revShowroom;

  // 2. Tổng hợp COGS dựa trên food cost & wastage
  const foodCostPct = kpiMap.get("kpi_food_cost")?.actual ?? 41;
  const wastagePct = kpiMap.get("kpi_wastage")?.actual ?? 1.8;
  const cogsKpi = kpiMap.get("kpi_cogs");
  const currentRevenue = revKpi?.actual ?? 5_200_000_000;
  if (cogsKpi) {
    cogsKpi.actual = Math.round(currentRevenue * ((foodCostPct + wastagePct) / 100) + 180_000_000);
  }

  // 3. Tổng hợp OPEX từ marketing, payroll, logistics, admin
  const mktSpend = kpiMap.get("kpi_mkt_spend")?.actual ?? 0;
  const payrollCost = kpiMap.get("kpi_payroll_cost")?.actual ?? 0;
  const logisticsCost = kpiMap.get("kpi_logistics_cost")?.actual ?? 0;
  const adminCost = kpiMap.get("kpi_admin_cost")?.actual ?? 0;
  const opexKpi = kpiMap.get("kpi_opex");
  if (opexKpi) opexKpi.actual = mktSpend + payrollCost + logisticsCost + adminCost;

  // 4. Tổng hợp Net Profit (Lợi nhuận ròng)
  const npKpi = kpiMap.get("kpi_np");
  if (npKpi && revKpi && cogsKpi && opexKpi) {
    const grossProfit = revKpi.actual - cogsKpi.actual;
    const ebitda = grossProfit - opexKpi.actual;
    const tax = Math.max(0, ebitda * 0.20);
    npKpi.actual = ebitda - tax;
  }

  // 5. Đồng bộ vào Finance Snapshot
  hacoState.financeSnapshot.revenue = revKpi?.actual ?? hacoState.financeSnapshot.revenue;
  hacoState.financeSnapshot.cogs = cogsKpi?.actual ?? hacoState.financeSnapshot.cogs;
  hacoState.financeSnapshot.grossProfit = hacoState.financeSnapshot.revenue - hacoState.financeSnapshot.cogs;
  hacoState.financeSnapshot.opex = opexKpi?.actual ?? hacoState.financeSnapshot.opex;
  hacoState.financeSnapshot.ebitda = hacoState.financeSnapshot.grossProfit - hacoState.financeSnapshot.opex;
  hacoState.financeSnapshot.tax = Math.max(0, hacoState.financeSnapshot.ebitda * 0.20);
  hacoState.financeSnapshot.netProfit = hacoState.financeSnapshot.ebitda - hacoState.financeSnapshot.tax;
}

export function getEmployeeKpiCompletion(employeeId: string): number {
  const override = hacoState.payrollOverrides.find((o: any) => o.employeeId === employeeId);
  if (override?.manualKpiCompletion !== undefined) {
    return override.manualKpiCompletion;
  }

  // Nếu là C-Level hoặc sở hữu KPI trực tiếp
  const owned = hacoState.kpis.filter((k) => k.ownerEmployeeId === employeeId);
  if (owned.length > 0) {
    const sum = owned.reduce((s, k) => s + completionOf(k), 0);
    return Math.round((sum / owned.length) * 100) / 100;
  }

  // Tính từ tiến độ Task của cá nhân đó
  const assigned = hacoState.tasks.filter((t) => t.assigneeId === employeeId);
  if (assigned.length > 0) {
    const done = assigned.filter((t) => t.status === "done").length;
    return Math.round((0.80 + 0.20 * (done / assigned.length)) * 100) / 100;
  }

  // Fallback về điểm phòng ban
  const emp = hacoState.employees.find((e) => e.id === employeeId);
  if (emp) {
    const deptKpis = hacoState.kpis.filter((k) => k.ownerDepartmentId === emp.departmentId);
    if (deptKpis.length > 0) {
      const sum = deptKpis.reduce((s, k) => s + completionOf(k), 0);
      return Math.round((sum / deptKpis.length) * 100) / 100;
    }
  }

  return 0.95;
}

/* ============================ MUTATIONS (Ghi dữ liệu & kích hoạt Cascades) ============================ */

/** Cập nhật trạng thái / tiến độ Task */
export function updateTaskStatus(taskId: string, status: Task["status"], progress?: number) {
  const task = hacoState.tasks.find((t) => t.id === taskId);
  if (!task) return;

  const oldStatus = task.status;
  task.status = status;

  if (progress !== undefined) {
    task.progress = progress;
  } else if (status === "done") {
    task.progress = 100;
  } else if (status === "in_progress" && task.progress === 100) {
    task.progress = 50;
  }

  // 1. Cập nhật tiến độ dự án liên quan (Project Progress)
  if (task.projectId) {
    const projTasks = hacoState.tasks.filter((t) => t.projectId === task.projectId);
    const proj = hacoState.projects.find((p) => p.id === task.projectId);
    if (proj && projTasks.length > 0) {
      const avgProgress = projTasks.reduce((s, t) => s + t.progress, 0) / projTasks.length;
      proj.progress = Math.round(avgProgress);
    }
  }

  // 2. Cập nhật chỉ số KPI tương ứng nếu có liên kết
  if (task.linkedKpiId) {
    const kpi = hacoState.kpis.find((k) => k.id === task.linkedKpiId);
    if (kpi) {
      if (status === "done" && oldStatus !== "done") {
        // Tăng hiệu suất KPI khi hoàn thành Task
        if (kpi.direction === "increase") {
          kpi.actual = kpi.unit === "%" ? Math.min(100, kpi.actual + 3.0) : kpi.actual + Math.round(kpi.target * 0.04);
        } else {
          kpi.actual = kpi.unit === "%" ? Math.max(kpi.target, kpi.actual - 0.2) : Math.max(kpi.target, kpi.actual - Math.round(kpi.target * 0.04));
        }
      } else if (oldStatus === "done" && status !== "done") {
        // Hoàn tác KPI nếu bỏ check hoàn thành Task
        if (kpi.direction === "increase") {
          kpi.actual = kpi.unit === "%" ? Math.max(0, kpi.actual - 3.0) : Math.max(0, kpi.actual - Math.round(kpi.target * 0.04));
        } else {
          kpi.actual = kpi.unit === "%" ? kpi.actual + 0.2 : kpi.actual + Math.round(kpi.target * 0.04);
        }
      }
    }
  }

  // 3. Chạy lại roll-ups
  rollupKpisAndFinance();

  // 4. Tạo Audit Log
  const actor = hacoState.employees.find((e) => e.id === task.assigneeId)?.fullName ?? "Hệ thống";
  hacoState.auditLog.unshift({
    id: "aud_" + Date.now(),
    actorId: task.assigneeId,
    action: "update",
    entity: "Task",
    entityId: task.id,
    summary: `${actor} cập nhật trạng thái task "${task.title}" → ${status.toUpperCase()}`,
    createdAt: new Date().toISOString(),
  });

  saveState();
  notify();
}

/** Duyệt phê duyệt (Approval) */
export function approveApproval(approvalId: string) {
  const apv = hacoState.approvals.find((a) => a.id === approvalId);
  if (!apv || apv.status !== "pending") return;

  apv.status = "approved";
  apv.decidedAt = new Date().toISOString();

  // Side-effect 1: Duyệt ngân sách phòng ban
  if (apv.kind === "budget") {
    const dept = hacoState.departments.find((d) => d.id === apv.departmentId);
    if (dept) {
      dept.budgetMonthly += apv.amount;
    }
  }

  // Side-effect 2: Duyệt Chi phí/Mua sắm
  else if (apv.kind === "purchase" || apv.kind === "expense") {
    // a. Trừ tiền mặt quỹ công ty
    hacoState.financeSnapshot.cash -= apv.amount;

    // b. Cộng chi phí thực tế của phòng ban
    const dept = hacoState.departments.find((d) => d.id === apv.departmentId);
    if (dept) {
      dept.costActual += apv.amount;
    }

    // c. Tạo giao dịch tài chính
    hacoState.transactions.unshift({
      id: "tx_" + Date.now(),
      title: apv.title,
      amount: apv.amount,
      type: "expense" as const,
      date: new Date().toISOString().slice(0, 10),
      status: "posted" as const,
      departmentId: apv.departmentId as typeof import("./demo").DEPARTMENTS[number]["id"],
      account: "642",
    });

    // d. Cập nhật KPI Chi phí tương ứng
    let kpiId = "kpi_opex";
    if (apv.departmentId === "dept_mkt") kpiId = "kpi_mkt_spend";
    else if (apv.departmentId === "dept_supply") kpiId = "kpi_logistics_cost";
    else if (apv.departmentId === "dept_prod") kpiId = "kpi_cogs";
    else if (apv.departmentId === "dept_back") kpiId = "kpi_admin_cost";

    const kpi = hacoState.kpis.find((k) => k.id === kpiId);
    if (kpi) {
      kpi.actual += apv.amount;
    }
  }

  // Side-effect 3: Duyệt tuyển dụng nhân sự mới
  else if (apv.kind === "hire") {
    // Tìm Job Req liên kết để đóng
    const req = hacoState.jobReqs.find((r) => r.departmentId === apv.departmentId && r.status !== "closed");
    if (req) {
      req.status = "closed";
      req.filled += 1;
    }

    // Tạo nhân sự mới
    const newEmpId = "emp_" + Date.now();
    const newEmp: Employee = {
      id: newEmpId,
      code: "HACO-" + Math.floor(100 + Math.random() * 900),
      fullName: apv.title.replace("Tuyển dụng: ", "").replace("Tuyển 2 sales", "Sales").trim(),
      email: "staff." + newEmpId.slice(-4) + "@hacofood.vn",
      phone: "0909 " + Math.floor(100_000 + Math.random() * 900_000),
      avatarInitials: "NS",
      position: "Chuyên viên vận hành",
      level: "Staff",
      departmentId: apv.departmentId,
      managerId: DEPT_BY_ID[apv.departmentId]?.headEmployeeId ?? "emp_001",
      joinDate: new Date().toISOString().slice(0, 10),
      status: "active",
      baseSalary: apv.amount > 0 ? apv.amount : 12_000_000,
      targetBonus: 3_000_000,
      employmentType: "fulltime",
      skills: [{ name: "Operations", score: 85 }],
    };

    hacoState.employees.push(newEmp);

    // Tăng headcount phòng ban
    const dept = hacoState.departments.find((d) => d.id === apv.departmentId);
    if (dept) {
      dept.headcount += 1;
    }

    // Cập nhật KPI Quỹ lương
    const kpiPayroll = hacoState.kpis.find((k) => k.id === "kpi_payroll_cost");
    if (kpiPayroll) {
      kpiPayroll.actual += newEmp.baseSalary;
    }
  }

  // Side-effect 4: Duyệt Thưởng (bonus)
  else if (apv.kind === "bonus") {
    hacoState.payrollOverrides.push({
      employeeId: apv.requesterId,
      bonusAdjustment: apv.amount,
      note: apv.title,
    });
  }

  // Chạy lại rollup tài chính
  rollupKpisAndFinance();

  // Tạo Audit Log
  const actor = hacoState.employees.find((e) => e.id === apv.approverId)?.fullName ?? "CEO Nguyễn Thị Hạ";
  hacoState.auditLog.unshift({
    id: "aud_" + Date.now(),
    actorId: apv.approverId,
    action: "approve",
    entity: "Approval",
    entityId: apv.id,
    summary: `${actor} phê duyệt yêu cầu "${apv.title}"`,
    createdAt: new Date().toISOString(),
  });

  saveState();
  notify();
}

/** Từ chối phê duyệt (Approval) */
export function rejectApproval(approvalId: string) {
  const apv = hacoState.approvals.find((a) => a.id === approvalId);
  if (!apv || apv.status !== "pending") return;

  apv.status = "rejected";
  apv.decidedAt = new Date().toISOString();

  // Tạo Audit Log
  const actor = hacoState.employees.find((e) => e.id === apv.approverId)?.fullName ?? "CEO Nguyễn Thị Hạ";
  hacoState.auditLog.unshift({
    id: "aud_" + Date.now(),
    actorId: apv.approverId,
    action: "reject",
    entity: "Approval",
    entityId: apv.id,
    summary: `${actor} từ chối phê duyệt yêu cầu "${apv.title}"`,
    createdAt: new Date().toISOString(),
  });

  saveState();
  notify();
}

/** Tạo yêu cầu phê duyệt mới */
export function createApproval(approval: Omit<Approval, "id" | "status" | "createdAt" | "decidedAt">) {
  const id = "apv_" + Date.now();
  const newApv: Approval = {
    ...approval,
    id,
    status: "pending",
    createdAt: new Date().toISOString(),
    decidedAt: null,
  };
  hacoState.approvals.unshift(newApv);

  // Tạo Audit Log
  const requester = hacoState.employees.find((e) => e.id === approval.requesterId)?.fullName ?? "Nhân viên";
  hacoState.auditLog.unshift({
    id: "aud_" + Date.now(),
    actorId: approval.requesterId,
    action: "request",
    entity: "Approval",
    entityId: id,
    summary: `${requester} tạo yêu cầu phê duyệt mới: "${approval.title}"`,
    createdAt: new Date().toISOString(),
  });

  saveState();
  notify();
}

/** Tạo công việc mới */
export function createTask(task: Omit<Task, "id" | "createdAt" | "status" | "progress">) {
  const id = "tsk_" + Date.now();
  const newTask: Task = {
    ...task,
    id,
    status: "in_progress",
    progress: 0,
    createdAt: new Date().toISOString(),
  };
  hacoState.tasks.unshift(newTask);

  // Tăng số lượng task phòng ban
  const dept = hacoState.departments.find((d) => d.id === task.departmentId);
  if (dept) {
    dept.headcount = hacoState.employees.filter((e) => e.departmentId === task.departmentId).length;
  }

  // Tạo Audit Log
  const creator = hacoState.employees.find((e) => e.id === task.assigneeId)?.fullName ?? "Trưởng phòng";
  hacoState.auditLog.unshift({
    id: "aud_" + Date.now(),
    actorId: task.assigneeId,
    action: "create",
    entity: "Task",
    entityId: id,
    summary: `${creator} giao công việc mới: "${task.title}"`,
    createdAt: new Date().toISOString(),
  });

  saveState();
  notify();
}

/** Tạo giao dịch tài chính thủ công */
export function createTransaction(tx: Omit<Transaction, "id" | "date" | "status">) {
  const id = "tx_" + Date.now();
  const newTx: Transaction = {
    ...tx,
    id,
    date: new Date().toISOString().slice(0, 10),
    status: "posted",
  };
  hacoState.transactions.unshift(newTx);

  // Điều chỉnh Cash & KPI
  if (tx.type === "income") {
    hacoState.financeSnapshot.cash += tx.amount;
    const kpi = hacoState.kpis.find((k) => k.id === "kpi_rev");
    if (kpi) kpi.actual += tx.amount;
  } else {
    hacoState.financeSnapshot.cash -= tx.amount;
    const kpi = hacoState.kpis.find((k) => k.id === "kpi_opex");
    if (kpi) kpi.actual += tx.amount;

    const dept = hacoState.departments.find((d) => d.id === tx.departmentId);
    if (dept) dept.costActual += tx.amount;
  }

  rollupKpisAndFinance();

  hacoState.auditLog.unshift({
    id: "aud_" + Date.now(),
    actorId: "emp_007", // CFO
    action: "create",
    entity: "Transaction",
    entityId: id,
    summary: `Ghi nhận giao dịch tài chính mới: "${tx.title}" (${tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString()} VND)`,
    createdAt: new Date().toISOString(),
  });

  saveState();
  notify();
}

/** Khôi phục trạng thái mô phỏng về mặc định */
export function resetDemoState() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("haco-food-os-state-v1");
    } catch (e) {}
  }
  
  hacoState.company = { ...defaultCompany };
  hacoState.departments = JSON.parse(JSON.stringify(defaultDepartments));
  hacoState.employees = JSON.parse(JSON.stringify(defaultEmployees));
  hacoState.kpis = JSON.parse(JSON.stringify(defaultKpis));
  hacoState.tasks = JSON.parse(JSON.stringify(defaultTasks));
  hacoState.projects = JSON.parse(JSON.stringify(defaultProjects));
  hacoState.financeSnapshot = { ...defaultFinanceSnapshot };
  hacoState.transactions = JSON.parse(JSON.stringify(defaultTransactions));
  hacoState.payrollOverrides = JSON.parse(JSON.stringify(defaultPayrollOverrides));
  hacoState.alerts = JSON.parse(JSON.stringify(defaultAlerts));
  hacoState.approvals = JSON.parse(JSON.stringify(defaultApprovals));
  hacoState.auditLog = JSON.parse(JSON.stringify(defaultAuditLog));
  hacoState.jobReqs = JSON.parse(JSON.stringify(defaultJobReqs));
  hacoState.sops = JSON.parse(JSON.stringify(defaultSops));
  hacoState.reports = JSON.parse(JSON.stringify(defaultReports));
  hacoState.objectives = JSON.parse(JSON.stringify(defaultObjectives));

  syncStateToExports();
  notify();
}

/** Tự động phê duyệt toàn bộ yêu cầu đang chờ */
export function approveAllPendingApprovals() {
  const pending = [...hacoState.approvals].filter((a) => a.status === "pending");
  pending.forEach((a) => {
    approveApproval(a.id);
  });
}

/** Hoàn thành tất cả các task đang thực hiện */
export function completeAllActiveTasks() {
  const active = [...hacoState.tasks].filter((t) => t.status === "in_progress");
  active.forEach((t) => {
    updateTaskStatus(t.id, "done");
  });
}

/* ============================ SELECTOR IMPLEMENTATIONS ============================ */

export function getCompany() {
  return COMPANY;
}

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
  const completion = getEmployeeKpiCompletion(id);
  const override = hacoState.payrollOverrides.find((o: { employeeId: string; bonusAdjustment?: number; penalty?: number; manualKpiCompletion?: number }) => o.employeeId === id);
  const payroll = computePayroll({
    baseSalary: emp.baseSalary,
    targetBonus: emp.targetBonus,
    kpiCompletion: completion,
    deptMultiplier: DEPT_MULTIPLIER[emp.departmentId] ?? 1.0,
    bonusAdjustment: override?.bonusAdjustment,
    penalty: override?.penalty,
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

export function listProjects(): Project[] {
  return PROJECTS;
}

export function getProject(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}

export type PayrollRow = {
  employee: Employee;
  payroll: PayrollResult;
  kpiCompletion: number;
  override?: { bonusAdjustment?: number; penalty?: number; note?: string };
};

export function runPayroll(period = PAYROLL_PERIOD.period): PayrollRow[] {
  return EMPLOYEES.map((emp) => {
    const completion = getEmployeeKpiCompletion(emp.id);
    const override = hacoState.payrollOverrides.find((o: any) => o.employeeId === emp.id);
    const payroll = computePayroll({
      baseSalary: emp.baseSalary,
      targetBonus: emp.targetBonus,
      kpiCompletion: completion,
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
  const avgPerHead = grossTotal / Math.max(rows.length, 1);
  return {
    rows,
    grossTotal,
    netTotal,
    bonusTotal,
    insuranceTotal,
    companyCostTotal,
    avgPerHead,
    payrollOverRevenue: grossTotal / Math.max(FINANCE_SNAPSHOT.revenue, 1),
  };
}

export { DEFAULT_RULES, DEPT_MULTIPLIER };

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
  return FINANCE_HISTORY.map((h: any) => ({ period: h.period, cashIn: h.cashIn, cashOut: h.cashOut, net: h.cashIn - h.cashOut }));
}

export function calcRunwayMonths() {
  const burns = FINANCE_HISTORY.slice(-3).map((h: any) => h.cashOut - h.cashIn);
  const avgBurn = burns.reduce((s: number, b: number) => s + Math.max(b, 0), 0) / burns.length;
  if (avgBurn <= 0) return Infinity;
  return Math.round((FINANCE_SNAPSHOT.cash / avgBurn) * 10) / 10;
}

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

export function listObjectives(): Objective[] {
  return OBJECTIVES;
}

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

export function listJobReqs(): JobReq[] {
  return JOB_REQS;
}

export function listSops(): SOP[] {
  return SOPS;
}

export function listReports(): Report[] {
  return REPORTS;
}

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
    grossMargin: fin.revenue > 0 ? fin.grossProfit / fin.revenue : 0,
    netMargin: fin.revenue > 0 ? fin.netProfit / fin.revenue : 0,
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
