/**
 * HACO Food OS — KPI Cascade Engine
 * ----------------------------------
 * - buildKpiTree: chuyển danh sách KPI flat → cây cha-con.
 * - getKpiStatus: tính status (xanh/vàng/đỏ) cho 1 KPI tuỳ direction.
 * - rollupCompletion: tính hoàn thành tổng từ các con (weighted).
 * - simulateImpact: thay đổi 1 KPI lá → propagate lên gốc (Net Profit).
 *
 * KHÔNG phụ thuộc React. Có thể dùng cả Server Component lẫn Client.
 */

import type { Kpi } from "@/lib/queries/demo";

export type KpiStatus = "green" | "amber" | "red" | "info";

export type KpiTreeNode = Kpi & {
  children: KpiTreeNode[];
  completion: number;     // 0..1+ (1 = đạt 100%)
  status: KpiStatus;
  // tổng đóng góp tiền (chỉ có nghĩa với KPI dạng VND ở cây Net Profit)
  variance: number;       // actual − target (đối với increase) hoặc target − actual (decrease)
};

/* ----------------------------- Status & Completion ----------------------------- */

/** Tỉ lệ hoàn thành — giá trị 0..>1. 1.00 = đạt đúng target. */
export function completionOf(kpi: Pick<Kpi, "actual" | "target" | "direction">): number {
  if (!isFinite(kpi.target) || kpi.target === 0) return 0;
  if (kpi.direction === "increase") {
    return kpi.actual / kpi.target;
  }
  // decrease: thực càng thấp càng tốt → completion = target / actual
  if (kpi.actual === 0) return 2; // siêu tốt
  return kpi.target / kpi.actual;
}

/** Phân loại status từ completion. Ngưỡng cố định: ≥0.95 xanh, ≥0.85 vàng, dưới = đỏ. */
export function statusOf(completion: number): KpiStatus {
  if (completion >= 0.95) return "green";
  if (completion >= 0.85) return "amber";
  return "red";
}

/** Variance dương = đang vượt target (theo direction). */
export function varianceOf(kpi: Pick<Kpi, "actual" | "target" | "direction">): number {
  return kpi.direction === "increase"
    ? kpi.actual - kpi.target
    : kpi.target - kpi.actual;
}

/* ----------------------------- Tree builder ----------------------------- */

export function buildKpiTree(kpis: Kpi[], rootIds?: string[]): KpiTreeNode[] {
  const byId = new Map<string, KpiTreeNode>();
  for (const k of kpis) {
    byId.set(k.id, {
      ...k,
      children: [],
      completion: completionOf(k),
      status: statusOf(completionOf(k)),
      variance: varianceOf(k),
    });
  }

  const roots: KpiTreeNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else if (!node.parentId) {
      roots.push(node);
    }
  }

  if (rootIds && rootIds.length) {
    return roots.filter((r) => rootIds.includes(r.id));
  }
  return roots;
}

/** Duyệt cây và áp callback. */
export function walkTree(nodes: KpiTreeNode[], cb: (node: KpiTreeNode, depth: number) => void, depth = 0) {
  for (const n of nodes) {
    cb(n, depth);
    if (n.children.length) walkTree(n.children, cb, depth + 1);
  }
}

/** Flat hoá cây (dùng để render dạng list/table). */
export function flattenTree(nodes: KpiTreeNode[]): { node: KpiTreeNode; depth: number }[] {
  const out: { node: KpiTreeNode; depth: number }[] = [];
  walkTree(nodes, (n, d) => out.push({ node: n, depth: d }));
  return out;
}

/* ----------------------------- Roll-up logic ----------------------------- */

/**
 * Rollup completion lên trên: với mỗi nút có children (và child có weight>0),
 * completion = Σ child.completion × child.weight.
 * Nếu tổng weight = 0 (không phải cây tài chính), giữ nguyên completion từ actual/target.
 */
export function rollupCompletion(node: KpiTreeNode): number {
  if (!node.children.length) return node.completion;
  const weighted = node.children.filter((c) => c.weight > 0);
  if (!weighted.length) return node.completion;
  const totalW = weighted.reduce((s, c) => s + c.weight, 0);
  let acc = 0;
  for (const c of weighted) {
    acc += rollupCompletion(c) * (c.weight / totalW);
  }
  return acc;
}

/* ----------------------------- Simulation ----------------------------- */

export type ImpactResult = {
  kpiId: string;
  baselineActual: number;
  newActual: number;
  baselineCompletion: number;
  newCompletion: number;
  /** Tác động lên Net Profit dạng VND (xấp xỉ tuyến tính, theo weight chain). */
  netProfitDelta: number;
};

/**
 * What-if: thay đổi `deltaPercent` (vd +0.10 = +10%) cho 1 KPI lá,
 * trả lại tác động dự kiến lên Net Profit (kpi gốc).
 *
 * Cách tính (đơn giản hoá, đủ dùng cho mô phỏng cấp công ty):
 *  - Với KPI tiền (VND): newActual = actual × (1 + delta)
 *    → propagate qua chuỗi parent với weight, ra delta tiền tại Net Profit.
 *  - Với KPI phi tài chính (leads, %, ngày…): chuyển thành tỉ lệ completion mới
 *    rồi nhân vào KPI cha tài chính gần nhất × weight chain.
 */
export function simulateImpact(
  kpis: Kpi[],
  kpiId: string,
  deltaPercent: number,
  rootId = "kpi_np"
): ImpactResult {
  const kpi = kpis.find((k) => k.id === kpiId);
  if (!kpi) {
    return {
      kpiId,
      baselineActual: 0,
      newActual: 0,
      baselineCompletion: 0,
      newCompletion: 0,
      netProfitDelta: 0,
    };
  }

  const baselineActual = kpi.actual;
  const newActual = baselineActual * (1 + deltaPercent);

  const baselineCompletion = completionOf(kpi);
  const newCompletion = completionOf({ ...kpi, actual: newActual });

  // Tìm chuỗi parent có weight để propagate tác động tài chính
  const chain: { kpi: Kpi; weight: number }[] = [];
  let current: Kpi | undefined = kpi;
  while (current && current.parentId) {
    const parent = kpis.find((k) => k.id === current!.parentId);
    if (!parent) break;
    chain.push({ kpi: parent, weight: current.weight });
    current = parent;
    if (parent.id === rootId) break;
  }

  // Tính delta tiền tại NP:
  // - Nếu KPI là tiền → deltaCash = (newActual - actual). Propagate: nhân trực tiếp
  //   theo dấu (revenue+ → NP+, cost+ → NP-).
  // - Nếu KPI phi tiền → deltaCash xấp xỉ: chỉ ảnh hưởng KPI tiền cha gần nhất tỉ lệ
  //   theo (newCompletion - baselineCompletion) × parent.actual × weight.
  let netProfitDelta = 0;
  if (kpi.unit === "VND") {
    let cashDelta = newActual - baselineActual;
    if (kpi.direction === "decrease") cashDelta = -cashDelta;
    // chuỗi parent: nhân các weight để biết phần đóng góp lên NP
    let factor = 1;
    for (const link of chain) {
      // weight 0 (feeder) thì coi như 1 — nó truyền nguyên tác động qua cha
      const w = link.weight > 0 ? link.weight : 1;
      factor *= w;
    }
    netProfitDelta = cashDelta * factor;
  } else {
    // KPI phi tiền: ước lượng qua parent tiền gần nhất
    const moneyParent = chain.find((c) => c.kpi.unit === "VND");
    if (moneyParent) {
      const completionDelta = newCompletion - baselineCompletion;
      // tác động cash ≈ parent.target × completionDelta × weight nhánh
      const w = moneyParent.weight > 0 ? moneyParent.weight : 1;
      let cashDelta = moneyParent.kpi.target * completionDelta * w;
      if (moneyParent.kpi.direction === "decrease") cashDelta = -cashDelta;
      // tiếp tục propagate lên NP nếu parent không phải NP
      let factor = 1;
      let started = false;
      for (const link of chain) {
        if (started) {
          const w2 = link.weight > 0 ? link.weight : 1;
          factor *= w2;
        }
        if (link.kpi.id === moneyParent.kpi.id) started = true;
      }
      netProfitDelta = cashDelta * factor;
    }
  }

  return {
    kpiId,
    baselineActual,
    newActual,
    baselineCompletion,
    newCompletion,
    netProfitDelta,
  };
}

/* ----------------------------- Aggregations ----------------------------- */

export function summarizeKpis(kpis: Kpi[]) {
  let green = 0, amber = 0, red = 0;
  for (const k of kpis) {
    const s = statusOf(completionOf(k));
    if (s === "green") green++;
    else if (s === "amber") amber++;
    else red++;
  }
  const total = kpis.length || 1;
  const avgCompletion = kpis.reduce((s, k) => s + completionOf(k), 0) / total;
  return { green, amber, red, total, avgCompletion };
}

export function kpisByDepartment(kpis: Kpi[], deptId: string): Kpi[] {
  return kpis.filter((k) => k.ownerDepartmentId === deptId);
}
