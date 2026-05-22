/**
 * HACO Food OS — Compensation Engine
 * ----------------------------------
 * Tính lương + thưởng theo: lương cơ bản + bonus theo bậc KPI completion
 * × hệ số phòng × override.
 *
 * Bậc thưởng (CompRule[]) sắp xếp theo threshold giảm dần.
 */

export interface CompRule {
  threshold: number;   // KPI completion threshold (1.0 = đạt 100%)
  multiplier: number;  // % bonus payout (0..>1)
}

export interface PayrollInput {
  baseSalary: number;
  targetBonus: number;
  kpiCompletion: number;   // 0..>1
  deptMultiplier: number;  // hệ số phòng (1.0 trung lập, >1 phòng tốt, <1 phòng tệ)
  bonusAdjustment?: number;
  penalty?: number;
}

export interface PayrollResult {
  baseSalary: number;
  targetBonus: number;
  kpiCompletion: number;
  incentiveMultiplier: number;
  bonusEarned: number;
  bonusAdjustment: number;
  penalty: number;
  gross: number;
  insurance: number;       // BHXH+BHYT+BHTN người lao động (10.5%)
  pit: number;             // thuế TNCN ước tính (~5% net)
  net: number;
  companyCost: number;     // gross + BHXH công ty (~17.5%)
}

/* ----------------- Default rules ----------------- */

export const DEFAULT_RULES: CompRule[] = [
  { threshold: 1.20, multiplier: 1.5 },
  { threshold: 1.00, multiplier: 1.0 },
  { threshold: 0.90, multiplier: 0.8 },
  { threshold: 0.80, multiplier: 0.5 },
  { threshold: 0.00, multiplier: 0.0 },
];

/* ----------------- Department multipliers (HACO) ----------------- */
export const DEPT_MULTIPLIER: Record<string, number> = {
  dept_exec: 1.00,
  dept_sales: 1.05,
  dept_mkt: 1.00,
  dept_prod: 0.98,
  dept_rnd_qa: 1.00,
  dept_supply: 1.02,
  dept_back: 1.00,
};

/* ----------------- Compute ----------------- */

export function computePayroll(input: PayrollInput, rules: CompRule[] = DEFAULT_RULES): PayrollResult {
  const sorted = [...rules].sort((a, b) => b.threshold - a.threshold);
  let multiplier = 0;
  for (const r of sorted) {
    if (input.kpiCompletion >= r.threshold) {
      multiplier = r.multiplier;
      break;
    }
  }

  const bonusEarned = input.targetBonus * multiplier * input.deptMultiplier;
  const bonusAdjustment = input.bonusAdjustment ?? 0;
  const penalty = input.penalty ?? 0;

  const gross = input.baseSalary + bonusEarned + bonusAdjustment - penalty;
  const insurance = Math.max(0, input.baseSalary * 0.105);
  const pitBase = Math.max(0, gross - insurance - 11_000_000);
  const pit = Math.max(0, pitBase * 0.05);
  const net = gross - insurance - pit;
  const companyCost = gross + input.baseSalary * 0.175;

  return {
    baseSalary: input.baseSalary,
    targetBonus: input.targetBonus,
    kpiCompletion: input.kpiCompletion,
    incentiveMultiplier: multiplier,
    bonusEarned,
    bonusAdjustment,
    penalty,
    gross,
    insurance,
    pit,
    net,
    companyCost,
  };
}
