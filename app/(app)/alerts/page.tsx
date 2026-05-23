"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Bell, AlertCircle, AlertTriangle, Info, CheckCircle2, Filter, Search } from "lucide-react";
import { listAlerts, alertsSummary, KPI_BY_ID, useHACOUpdate, resolveAlert } from "@/lib/queries";

export default function AlertsPage() {
  useHACOUpdate();
  const all = listAlerts();
  const sum = alertsSummary();
  const [filter, setFilter] = useState<string>("open");
  const [search, setSearch] = useState("");

  const filtered = all.filter((a) => {
    if (filter === "open" && a.resolvedAt) return false;
    if (filter === "resolved" && !a.resolvedAt) return false;
    if (!["open", "resolved", "all"].includes(filter) && a.severity !== filter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sevConfig = {
    critical: { icon: <AlertCircle className="size-5" />, bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
    danger: { icon: <AlertCircle className="size-5" />, bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
    warning: { icon: <AlertTriangle className="size-5" />, bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
    info: { icon: <Info className="size-5" />, bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  } as const;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-3"><Bell className="size-6" /> Trung tâm cảnh báo</h1>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">{sum.total} cảnh báo đang mở · {sum.critical} critical · {sum.danger} danger · {sum.warning} warning</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm cảnh báo..." className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-xs outline-none w-56" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Critical", val: sum.critical, color: "bg-rose-50 text-rose-600 border-rose-100" },
          { label: "Danger", val: sum.danger, color: "bg-rose-50 text-rose-600 border-rose-100" },
          { label: "Warning", val: sum.warning, color: "bg-amber-50 text-amber-600 border-amber-100" },
          { label: "Info", val: sum.info, color: "bg-blue-50 text-blue-600 border-blue-100" },
        ].map((c) => (
          <div key={c.label} className={cn("border rounded-3xl p-5 shadow-sm", c.color)}>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{c.label}</p>
            <p className="text-3xl font-black mt-1">{c.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="size-4 text-zinc-400" />
        {["open", "resolved", "all", "critical", "danger", "warning", "info"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-bold border capitalize transition-colors",
              filter === s ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50")}>{s}</button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {filtered.map((a) => {
          const cfg = sevConfig[a.severity];
          const linkedKpi = a.linkedKpiId ? KPI_BY_ID[a.linkedKpiId] : null;
          const isResolved = !!a.resolvedAt;
          return (
            <div key={a.id} className={cn(
              "flex gap-4 p-5 rounded-3xl border hover:shadow-md transition-all",
              isResolved ? "bg-zinc-50 border-zinc-100 opacity-70" : cn("bg-white", cfg.border)
            )}>
              <div className={cn("size-12 rounded-xl flex items-center justify-center shrink-0", isResolved ? "bg-zinc-100 text-zinc-400" : cn(cfg.bg, cfg.text))}>
                {isResolved ? <CheckCircle2 className="size-5" /> : cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase", isResolved ? "bg-zinc-100 text-zinc-500" : cn(cfg.bg, cfg.text))}>
                    {isResolved ? "resolved" : a.severity}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">{a.source}</span>
                  {linkedKpi && <span className="text-[10px] font-bold text-emerald-600">↗ {linkedKpi.code}</span>}
                </div>
                <h3 className={cn("text-sm font-black", isResolved ? "text-zinc-400 line-through" : "text-zinc-900")}>{a.title}</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{a.detail}</p>
                <p className="text-[10px] text-zinc-400 mt-2">
                  {isResolved
                    ? `Đã xử lý: ${new Date(a.resolvedAt!).toLocaleString("vi-VN")}`
                    : `Phát sinh: ${new Date(a.createdAt).toLocaleString("vi-VN")}`}
                </p>
              </div>
              {!isResolved && (
                <button
                  onClick={() => resolveAlert(a.id)}
                  className="self-start px-3 py-1.5 bg-zinc-900 hover:bg-zinc-700 text-white text-[10px] font-black uppercase rounded-lg shrink-0 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="size-3" /> Xử lý
                </button>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-12 text-center">
            <CheckCircle2 className="size-12 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-black text-emerald-700">Không có cảnh báo khớp bộ lọc.</p>
          </div>
        )}
      </div>
    </div>
  );
}
