"use client";

import { useState, useMemo } from "react";
import { cn, formatCompactVND, formatPercent } from "@/lib/utils";
import {
  TrendingUp, Plus, HelpCircle, RefreshCw, Zap, ArrowRight, Brain, Sparkles,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts";
import {
  DEFAULT_SCENARIOS, runForecast, getFinanceSnapshot, listKpis, KPI_BY_ID, simulateImpact, useHACOUpdate,
} from "@/lib/queries";

export default function ForecastPage() {
  useHACOUpdate();
  const fin = getFinanceSnapshot();
  const allKpis = listKpis();

  const [activeId, setActiveId] = useState(DEFAULT_SCENARIOS[0].id);
  const [customAdjusts, setCustomAdjusts] = useState<{ kpiId: string; deltaPercent: number }[]>([
    { kpiId: "kpi_rev_b2b", deltaPercent: 0.10 },
  ]);

  const scenarios = useMemo(() => DEFAULT_SCENARIOS.map((s) => ({ ...s, result: runForecast(s.adjustments) })), []);
  const active = scenarios.find((s) => s.id === activeId)!;
  const custom = useMemo(() => runForecast(customAdjusts), [customAdjusts]);

  // chart compare
  const compareChart = scenarios.map((s) => ({
    name: s.name.split(" ")[0],
    profit: Math.round(s.result.forecastNetProfit / 1_000_000),
    color: s.color,
  }));

  // KPI eligible cho slider (chỉ KPI lá có quan hệ với NP)
  const sliderKpis = allKpis.filter((k) =>
    ["kpi_rev_b2b", "kpi_rev_b2c", "kpi_rev_show", "kpi_food_cost", "kpi_wastage", "kpi_mkt_spend", "kpi_payroll_cost"].includes(k.id)
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">Forecast & What-if Simulator</h1>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">
            Mô phỏng tác động lên Net Profit · baseline {formatCompactVND(fin.netProfit)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-zinc-200 px-4 py-2 rounded-lg font-bold text-xs text-zinc-600 flex items-center gap-2"><HelpCircle className="size-3" /> Hướng dẫn</button>
          <button className="bg-[#1b5e20] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-[#1b5e20]/20 flex items-center gap-2"><Plus className="size-3" /> Tạo kịch bản</button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Baseline NP", val: fin.netProfit, color: "text-zinc-900" },
          { label: `Active: ${active.name}`, val: active.result.forecastNetProfit, color: active.result.netProfitDelta >= 0 ? "text-emerald-600" : "text-rose-600" },
          { label: "Δ vs baseline", val: active.result.netProfitDelta, color: active.result.netProfitDelta >= 0 ? "text-emerald-600" : "text-rose-600", isDelta: true },
          { label: "Custom what-if Δ", val: custom.netProfitDelta, color: custom.netProfitDelta >= 0 ? "text-emerald-600" : "text-rose-600", isDelta: true },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={cn("text-xl font-black", s.color)}>
              {s.isDelta && s.val >= 0 ? "+" : ""}{formatCompactVND(s.val)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Scenarios list */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-6">Kịch bản chuẩn (chạy bằng simulateImpact thật)</h3>
            <div className="space-y-3">
              {scenarios.map((s) => (
                <button key={s.id} onClick={() => setActiveId(s.id)}
                  className={cn("w-full text-left p-4 rounded-2xl border-2 transition-all",
                    activeId === s.id ? "border-zinc-900 bg-zinc-50" : "border-zinc-100 hover:border-zinc-300")}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: s.color }}><RefreshCw className="size-4" /></div>
                      <div>
                        <p className="font-black text-zinc-900 text-sm">{s.name}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase">Xác suất {Math.round(s.probability * 100)}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-sm font-black",
                        s.result.netProfitDelta >= 0 ? "text-emerald-600" : "text-rose-600")}>
                        {s.result.netProfitDelta >= 0 ? "+" : ""}{formatCompactVND(s.result.netProfitDelta)}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-bold">→ NP {formatCompactVND(s.result.forecastNetProfit)}</p>
                    </div>
                  </div>
                  {/* Adjustment list */}
                  <div className="flex gap-2 flex-wrap mt-2">
                    {s.adjustments.map((a, i) => {
                      const k = KPI_BY_ID[a.kpiId];
                      return (
                        <span key={i} className="px-2 py-0.5 bg-white border border-zinc-100 rounded text-[10px] font-bold text-zinc-500">
                          {k?.code} {a.deltaPercent >= 0 ? "+" : ""}{Math.round(a.deltaPercent * 100)}%
                        </span>
                      );
                    })}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-6">So sánh Net Profit giữa các kịch bản (triệu)</h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compareChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f4" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => `${v} tr`} />
                  <Bar dataKey="profit" radius={[8, 8, 0, 0]}>
                    {compareChart.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Custom what-if builder */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900 rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="size-5 text-emerald-400" />
              <h3 className="text-sm font-black uppercase tracking-widest">What-if Builder</h3>
              <Sparkles className="size-4 text-amber-400" />
            </div>
            <p className="text-xs text-white/60 mb-6">Chỉnh slider để xem tác động lên Net Profit ngay lập tức.</p>

            <div className="space-y-4">
              {customAdjusts.map((adj, i) => {
                const k = KPI_BY_ID[adj.kpiId];
                if (!k) return null;
                const impact = simulateImpact(allKpis, adj.kpiId, adj.deltaPercent);
                return (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <select
                        value={adj.kpiId}
                        onChange={(e) => {
                          const next = [...customAdjusts];
                          next[i] = { ...next[i], kpiId: e.target.value };
                          setCustomAdjusts(next);
                        }}
                        className="bg-white/10 text-white text-xs font-bold px-2 py-1 rounded outline-none border border-white/10"
                      >
                        {sliderKpis.map((kp) => <option key={kp.id} value={kp.id} className="bg-zinc-900">{kp.name}</option>)}
                      </select>
                      <button onClick={() => setCustomAdjusts(customAdjusts.filter((_, idx) => idx !== i))} className="text-white/40 text-xs hover:text-white">×</button>
                    </div>
                    <input
                      type="range" min={-50} max={50} step={1}
                      value={Math.round(adj.deltaPercent * 100)}
                      onChange={(e) => {
                        const next = [...customAdjusts];
                        next[i] = { ...next[i], deltaPercent: parseInt(e.target.value) / 100 };
                        setCustomAdjusts(next);
                      }}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between mt-2 text-[10px] font-bold">
                      <span className="text-white/40">−50%</span>
                      <span className={cn("text-base font-black",
                        adj.deltaPercent > 0 ? "text-emerald-400" : adj.deltaPercent < 0 ? "text-rose-400" : "text-white")}>
                        {adj.deltaPercent >= 0 ? "+" : ""}{Math.round(adj.deltaPercent * 100)}%
                      </span>
                      <span className="text-white/40">+50%</span>
                    </div>
                    <p className="text-[10px] text-white/50 mt-2">
                      Δ NP đơn lẻ: <span className={cn("font-black", impact.netProfitDelta >= 0 ? "text-emerald-400" : "text-rose-400")}>
                        {impact.netProfitDelta >= 0 ? "+" : ""}{formatCompactVND(impact.netProfitDelta)}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setCustomAdjusts([...customAdjusts, { kpiId: "kpi_rev_b2c", deltaPercent: 0 }])}
              className="mt-4 w-full py-3 bg-emerald-600 text-white text-xs font-black uppercase rounded-xl flex items-center justify-center gap-2"
            >
              <Plus className="size-3" /> Thêm điều chỉnh
            </button>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Tổng Δ Net Profit</p>
                <p className={cn("text-2xl font-black",
                  custom.netProfitDelta >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  {custom.netProfitDelta >= 0 ? "+" : ""}{formatCompactVND(custom.netProfitDelta)}
                </p>
              </div>
              <p className="text-[10px] text-white/40 mt-1">
                Net Profit dự kiến: {formatCompactVND(custom.forecastNetProfit)} ({formatPercent((custom.netProfitDelta / fin.netProfit) * 100, 1)} so baseline)
              </p>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest mb-4">Cách hệ thống tính</h3>
            <ol className="space-y-2 text-[11px] text-zinc-500 list-decimal pl-4">
              <li>KPI tiền: tác động trực tiếp = Δ% × actual.</li>
              <li>KPI phi tiền: ảnh hưởng KPI tiền cha gần nhất theo Δ completion × weight.</li>
              <li>Propagate lên Net Profit theo chuỗi parent (xem kpi-tree).</li>
              <li>Increase KPI: revenue+ → NP+, cost+ → NP−.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
