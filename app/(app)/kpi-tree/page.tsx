"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Target, ChevronRight, ChevronDown, Plus, Filter,
  TrendingUp, AlertCircle, CheckCircle2, Database, Brain, Sparkles, Zap,
} from "lucide-react";
import { cn, formatCompactVND, formatPercent, formatNumber } from "@/lib/utils";
import {
  getKpiTree, listKpis, summarizeKpis, runForecast, EMP_BY_ID,
  type KpiTreeNode, useHACOUpdate,
} from "@/lib/queries";

export default function KPITreePage() {
  useHACOUpdate();
  const tree = getKpiTree("kpi_np");
  const allKpis = listKpis();
  const summary = summarizeKpis(allKpis);

  const initialExpanded = new Set<string>();
  function gatherTopTwo(nodes: KpiTreeNode[], depth = 0) {
    for (const n of nodes) {
      if (depth <= 1) initialExpanded.add(n.id);
      if (n.children.length) gatherTopTwo(n.children, depth + 1);
    }
  }
  gatherTopTwo(tree);
  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded);

  const wif = runForecast([{ kpiId: "kpi_food_cost", deltaPercent: -0.05 }]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fmt = (v: number, unit: string) => {
    if (unit === "VND") return formatCompactVND(v);
    if (unit === "%") return `${v}%`;
    return `${formatNumber(v)} ${unit}`;
  };

  const renderNode = (node: KpiTreeNode, level = 0) => {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children.length > 0;
    const owner = EMP_BY_ID[node.ownerEmployeeId];

    return (
      <div key={node.id} className="space-y-3">
        <div
          className={cn(
            "rounded-2xl border-l-4 bg-white shadow-sm hover:shadow-md transition-all p-4",
            node.status === "green" ? "border-emerald-500"
              : node.status === "amber" ? "border-amber-500" : "border-rose-500"
          )}
          style={{ marginLeft: level * 32 }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            {hasChildren ? (
              <button onClick={() => toggle(node.id)} className="size-6 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-500">
                {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
              </button>
            ) : (
              <div className="size-6" />
            )}
            <Target className={cn("size-4 shrink-0",
              node.status === "green" ? "text-emerald-500"
                : node.status === "amber" ? "text-amber-500" : "text-rose-500")} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-black text-zinc-900 truncate">{node.name}</span>
                <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">{node.code}</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                Owner: {owner?.fullName ?? "—"} · {node.dataSource}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Target</p>
              <p className="text-xs font-bold text-zinc-700">{fmt(node.target, node.unit)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Actual</p>
              <p className={cn("text-xs font-black",
                node.status === "green" ? "text-emerald-600"
                  : node.status === "amber" ? "text-amber-600" : "text-rose-600")}>
                {fmt(node.actual, node.unit)}
              </p>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black border shrink-0 w-16 text-center",
              node.status === "green" ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : node.status === "amber" ? "bg-amber-50 text-amber-600 border-amber-100"
                  : "bg-rose-50 text-rose-600 border-rose-100"
            )}>
              {Math.round(node.completion * 100)}%
            </div>
            {node.weight > 0 && (
              <span className="text-[9px] font-bold text-zinc-400 uppercase shrink-0">w:{(node.weight * 100).toFixed(0)}%</span>
            )}
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="space-y-3">
            {node.children.map((c) => renderNode(c, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="KPI Tree — Cascade & Formula"
        breadcrumbs={["Trang chủ", "Vận hành", "KPI Tree"]}
        actions={
          <div className="flex items-center gap-3">
            <button className="bg-white border border-zinc-200 px-4 py-2 rounded-lg font-bold text-xs text-zinc-600 flex items-center gap-2">
              <Filter className="size-3" /> Lọc
            </button>
            <button className="bg-[#1b5e20] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-[#1b5e20]/20 flex items-center gap-2">
              <Plus className="size-3" /> Thêm KPI từ catalog
            </button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Tổng KPI", val: summary.total, color: "text-zinc-900", icon: <Database className="size-4" /> },
          { label: "Đạt mục tiêu", val: summary.green, color: "text-emerald-600", icon: <CheckCircle2 className="size-4" /> },
          { label: "Cảnh báo", val: summary.amber, color: "text-amber-600", icon: <TrendingUp className="size-4" /> },
          { label: "Rủi ro", val: summary.red, color: "text-rose-600", icon: <AlertCircle className="size-4" /> },
        ].map((m) => (
          <div key={m.label} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{m.label}</p>
              <p className={cn("text-2xl font-black mt-1", m.color)}>{m.val}</p>
            </div>
            <div className={cn("size-10 rounded-xl bg-zinc-50 flex items-center justify-center", m.color)}>{m.icon}</div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-emerald-600 flex items-center justify-center"><Brain className="size-5" /></div>
          <div className="flex-1">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              KPI Cascade Simulator <Sparkles className="size-4 text-amber-400" />
            </h3>
            <p className="text-xs text-white/70 mt-1">
              Mô phỏng: giảm <span className="text-emerald-400 font-black">Food Cost 5%</span> →
              Net Profit dự kiến <span className="text-emerald-400 font-black">{wif.netProfitDelta >= 0 ? "+" : ""}{formatCompactVND(wif.netProfitDelta)}</span> ·
              từ {formatCompactVND(wif.baseline)} lên {formatCompactVND(wif.forecastNetProfit)} ({formatPercent((wif.netProfitDelta / wif.baseline) * 100, 1)}).
            </p>
          </div>
          <Zap className="size-6 text-amber-400" />
        </div>
      </div>

      <div className="bg-zinc-50/40 rounded-3xl p-6 border border-zinc-100">
        <div className="space-y-3">
          {tree.map((root) => renderNode(root))}
        </div>
      </div>
    </div>
  );
}
