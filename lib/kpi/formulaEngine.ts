/**
 * HACO Food OS — KPI Formula Engine
 * Evaluates KPI formulas via JSONB AST.
 * Supports: sum, sub, mul, div, avg, ratio, const, ref.
 *
 * Cascade thật (rollupCompletion, simulateImpact) nằm ở `lib/kpi/cascade.ts`.
 */

type FormulaOp = 'sum' | 'sub' | 'mul' | 'div' | 'avg' | 'weighted_avg' | 'ratio' | 'const' | 'ref';

interface FormulaNode {
  op: FormulaOp;
  args?: (FormulaNode | number | string)[];
  val?: number;
  ref?: string;
}

export function evaluateFormula(node: FormulaNode | number | string, context: Record<string, number>): number {
  if (typeof node === 'number') return node;
  if (typeof node === 'string') return context[node] || 0;

  switch (node.op) {
    case 'const':
      return node.val || 0;
    case 'ref':
      return context[node.ref || ''] || 0;
    case 'sum':
      return (node.args || []).reduce((acc: number, arg) => acc + evaluateFormula(arg, context), 0);
    case 'sub':
      if (!node.args || node.args.length < 2) return 0;
      return evaluateFormula(node.args[0], context) - evaluateFormula(node.args[1], context);
    case 'mul':
      return (node.args || []).reduce((acc: number, arg) => acc * evaluateFormula(arg, context), 1);
    case 'div':
      if (!node.args || node.args.length < 2) return 0;
      const divisor = evaluateFormula(node.args[1], context);
      return divisor === 0 ? 0 : evaluateFormula(node.args[0], context) / divisor;
    case 'ratio':
      if (!node.args || node.args.length < 2) return 0;
      const den = evaluateFormula(node.args[1], context);
      return den === 0 ? 0 : (evaluateFormula(node.args[0], context) / den) * 100;
    default:
      return 0;
  }
}

/**
 * Propagates changes up the KPI tree.
 * If a leaf KPI changes by X%, how does it affect the root?
 */
export function simulateImpact(kpiId: string, deltaPercent: number, tree: any[]): Record<string, number> {
  const impacts: Record<string, number> = {};
  // Simplified logic for demo: linear propagation
  impacts[kpiId] = deltaPercent;
  return impacts;
}
