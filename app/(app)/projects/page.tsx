"use client";

import { useState } from "react";
import { formatCompactVND, cn } from "@/lib/utils";
import {
  Search, Filter, Plus, Calendar, CheckCircle2, AlertCircle, Wallet, Users, ChevronDown,
  TrendingUp, ArrowRight,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { listProjects, EMP_BY_ID, DEPT_BY_ID, KPI_BY_ID } from "@/lib/queries";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const projects = listProjects();

  const filtered = projects.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
  const active = projects.filter((p) => p.status === "active").length;
  const planning = projects.filter((p) => p.status === "planning").length;

  // Budget by project for chart
  const chartData = projects.map((p) => ({
    name: p.code, budget: Math.round(p.budget / 1_000_000), spent: Math.round(p.spent / 1_000_000),
  }));

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">Dự án & Initiative</h1>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">{projects.length} dự án · {active} active · {planning} planning</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm dự án..." className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-xs outline-none w-56" />
          </div>
          <button className="bg-[#1b5e20] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-[#1b5e20]/20 flex items-center gap-2"><Plus className="size-3" /> Tạo dự án</button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Tổng ngân sách", val: formatCompactVND(totalBudget), icon: <Wallet className="size-4" />, color: "text-zinc-900" },
          { label: "Đã chi", val: formatCompactVND(totalSpent), icon: <TrendingUp className="size-4" />, color: "text-orange-600" },
          { label: "Còn lại", val: formatCompactVND(totalBudget - totalSpent), icon: <Wallet className="size-4" />, color: "text-emerald-600" },
          { label: "Project active", val: String(active), icon: <CheckCircle2 className="size-4" />, color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{s.label}</p>
              <p className={cn("text-xl font-black mt-1", s.color)}>{s.val}</p>
            </div>
            <div className={cn("size-10 rounded-xl bg-zinc-50 flex items-center justify-center", s.color)}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Status filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="size-4 text-zinc-400" />
        {[
          { id: "all", label: "Tất cả" },
          { id: "active", label: "Active" },
          { id: "planning", label: "Planning" },
          { id: "done", label: "Done" },
          { id: "paused", label: "Paused" },
        ].map((s) => (
          <button key={s.id} onClick={() => setStatusFilter(s.id)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-bold border",
              statusFilter === s.id ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-600")}>{s.label}</button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Project cards */}
        <div className="lg:col-span-8 space-y-4">
          {filtered.map((p) => {
            const owner = EMP_BY_ID[p.ownerId];
            const dept = DEPT_BY_ID[p.departmentId];
            const kpi = p.linkedKpiId ? KPI_BY_ID[p.linkedKpiId] : null;
            const utilization = p.spent / p.budget;
            return (
              <div key={p.id} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-black text-zinc-900">{p.name}</h3>
                      <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">{p.code}</span>
                      <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase",
                        p.status === "active" ? "bg-emerald-50 text-emerald-600"
                          : p.status === "planning" ? "bg-blue-50 text-blue-600"
                            : p.status === "done" ? "bg-zinc-100 text-zinc-500"
                              : "bg-amber-50 text-amber-600")}>{p.status}</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-3 max-w-3xl">{p.businessCase}</p>
                    <div className="flex items-center gap-6 text-[11px] font-bold text-zinc-500">
                      <span className="flex items-center gap-1.5"><Users className="size-3" /> {owner?.fullName}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="size-3" /> {new Date(p.startsAt).toLocaleDateString("vi-VN")} → {new Date(p.endsAt).toLocaleDateString("vi-VN")}</span>
                      <span>{dept?.name}</span>
                      {kpi && <span className="text-emerald-600 flex items-center gap-1"><ArrowRight className="size-3" /> {kpi.name}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-6">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Progress</p>
                    <p className={cn("text-2xl font-black",
                      p.progress >= 80 ? "text-emerald-600" : p.progress >= 50 ? "text-amber-500" : "text-blue-500")}>{p.progress}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-50">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span className="text-zinc-500 uppercase">Tiến độ</span>
                      <span className="text-zinc-900">{p.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div className={cn("h-full",
                        p.progress >= 80 ? "bg-emerald-500" : p.progress >= 50 ? "bg-amber-500" : "bg-blue-500")}
                        style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span className="text-zinc-500 uppercase">Ngân sách</span>
                      <span className={cn(utilization > 1 ? "text-rose-500" : "text-zinc-900")}>
                        {formatCompactVND(p.spent)} / {formatCompactVND(p.budget)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div className={cn("h-full",
                        utilization > 1 ? "bg-rose-500" : utilization > 0.8 ? "bg-amber-500" : "bg-emerald-500")}
                        style={{ width: `${Math.min(utilization * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="text-center text-xs text-zinc-400 py-8 italic">Không có dự án khớp bộ lọc.</p>}
        </div>

        {/* Right: Budget chart */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-6">Ngân sách dự án (triệu)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f4" />
                  <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip />
                  <Bar dataKey="budget" fill="#e5e7eb" radius={[0, 4, 4, 0]} barSize={10} />
                  <Bar dataKey="spent" fill="#1b5e20" radius={[0, 4, 4, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
