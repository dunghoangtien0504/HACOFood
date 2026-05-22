"use client";

import { useState } from "react";
import { listKpis, listDepartments, completionOf, statusOf, EMP_BY_ID, KPI_BY_ID } from "@/lib/queries";
import { formatCompactVND, formatPercent, formatNumber, cn } from "@/lib/utils";
import { Target, TrendingUp, AlertTriangle, CheckCircle2, Filter } from "lucide-react";

export default function KpiPage() {
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const kpis = listKpis();
  const departments = listDepartments();

  const filtered = deptFilter === "all" ? kpis : kpis.filter((k) => k.ownerDepartmentId === deptFilter);

  const fmt = (v: number, unit: string) => {
    if (unit === "VND") return formatCompactVND(v);
    if (unit === "%") return `${v}%`;
    return `${formatNumber(v)} ${unit}`;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Quản lý KPI</h1>
          <p className="text-zinc-500 font-medium mt-1">Theo dõi mục tiêu và kết quả thực hiện của Bếp Cô Hạ — {filtered.length} KPI.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-zinc-200 rounded-lg text-sm font-semibold hover:bg-zinc-50">Xuất báo cáo</button>
          <button className="bg-[#1b5e20] text-white px-4 py-2 rounded-lg font-semibold shadow-md shadow-[#1b5e20]/20">Thiết lập KPI</button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="size-4 text-zinc-400" />
        <button onClick={() => setDeptFilter("all")} className={cn("px-3 py-1.5 rounded-full text-xs font-bold border", deptFilter === "all" ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-600")}>Tất cả ({kpis.length})</button>
        {departments.map((d) => {
          const count = kpis.filter((k) => k.ownerDepartmentId === d.id).length;
          return (
            <button key={d.id} onClick={() => setDeptFilter(d.id)} className={cn("px-3 py-1.5 rounded-full text-xs font-bold border", deptFilter === d.id ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-600")}>{d.name} ({count})</button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Chỉ số KPI</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Phòng ban / Owner</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">KPI cha</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Mục tiêu</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Thực tế</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Tiến độ</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((kpi) => {
              const dept = departments.find((d) => d.id === kpi.ownerDepartmentId);
              const owner = EMP_BY_ID[kpi.ownerEmployeeId];
              const parent = kpi.parentId ? KPI_BY_ID[kpi.parentId] : null;
              const completion = completionOf(kpi);
              const status = statusOf(completion);
              const pct = Math.min(completion * 100, 200);

              return (
                <tr key={kpi.id} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-900">{kpi.name}</span>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">{kpi.code} · {kpi.frequency}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-zinc-700 font-bold">{dept?.name ?? "—"}</span>
                      <span className="text-[10px] text-zinc-400 font-medium">{owner?.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {parent ? (
                      <span className="text-xs font-medium text-zinc-500">↑ {parent.code}</span>
                    ) : (
                      <span className="text-[10px] text-zinc-300 font-bold uppercase">root</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-zinc-900">{fmt(kpi.target, kpi.unit)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn("text-sm font-bold",
                      status === "green" ? "text-emerald-600" : status === "amber" ? "text-amber-600" : "text-rose-600")}>
                      {fmt(kpi.actual, kpi.unit)}
                    </span>
                  </td>
                  <td className="px-6 py-4 w-48">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-zinc-500">{formatPercent(completion * 100, 0)}</span>
                        <span className="text-zinc-300">{kpi.direction === "increase" ? "↑ tốt" : "↓ tốt"}</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div className={cn("h-full transition-all duration-1000",
                          status === "green" ? "bg-emerald-600" : status === "amber" ? "bg-amber-500" : "bg-rose-500")}
                          style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      {status === "green" ? <CheckCircle2 className="size-5 text-emerald-600" />
                        : status === "amber" ? <TrendingUp className="size-5 text-amber-500" />
                          : <AlertTriangle className="size-5 text-rose-500" />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
