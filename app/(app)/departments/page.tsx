"use client";

import { useState } from "react";
import { formatVND, formatCompactVND, formatPercent, cn } from "@/lib/utils";
import {
  Users, Target, TrendingUp, ArrowRight, Search, ChevronDown,
  LayoutGrid, Zap, AlertCircle, CheckCircle2, BarChart3, MessageSquare, ArrowRightLeft, Wallet,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie,
} from "recharts";
import {
  listDepartments, getDepartmentSummary, listKpisByDepartment,
  EMP_BY_ID, completionOf, statusOf,
  type DeptId,
} from "@/lib/queries";

export default function DepartmentsPage() {
  const departments = listDepartments();
  const [activeDeptId, setActiveDeptId] = useState<DeptId>(departments[1].id); // Sales mặc định

  const summary = getDepartmentSummary(activeDeptId)!;
  const dept = summary.department;
  const head = summary.head;
  const m = summary.metrics;

  // Cost breakdown demo theo phòng (simple split từ costActual)
  const costSplit = [
    { name: "Lương", budget: dept.budgetMonthly * 0.55, actual: dept.costActual * 0.58 },
    { name: "Vận hành", budget: dept.budgetMonthly * 0.25, actual: dept.costActual * 0.22 },
    { name: "Marketing/Tools", budget: dept.budgetMonthly * 0.15, actual: dept.costActual * 0.16 },
    { name: "Khác", budget: dept.budgetMonthly * 0.05, actual: dept.costActual * 0.04 },
  ].map((r) => ({ name: r.name, budget: Math.round(r.budget / 1_000_000), actual: Math.round(r.actual / 1_000_000) }));

  const deptKpis = listKpisByDepartment(activeDeptId);
  const fmtVal = (v: number, unit: string) => unit === "VND" ? formatCompactVND(v) : unit === "%" ? `${v}%` : `${v} ${unit}`;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header với selector phòng ban */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">Phòng ban</h1>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Chi tiết bộ phận & vận hành / {dept.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={activeDeptId}
              onChange={(e) => setActiveDeptId(e.target.value as DeptId)}
              className="appearance-none pl-9 pr-10 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-700 outline-none cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <LayoutGrid className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <ChevronDown className="absolute right-3 top-1/2 size-3 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
          <button className="bg-[#1b5e20] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-[#1b5e20]/20">Xuất báo cáo</button>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Nhân sự", val: String(m.headcountReported), tVal: `${m.headcount} có hồ sơ`, color: "text-blue-600" },
          { label: "KPI tổng thể", val: formatPercent(m.kpiAvgCompletion * 100, 0), tVal: `${m.kpiGreen}/${m.kpiGreen + m.kpiAmber + m.kpiRed} xanh`, color: "text-[#1b5e20]" },
          { label: "Ngân sách tháng", val: formatCompactVND(m.budgetMonthly), tVal: "Budget", color: "text-purple-600" },
          { label: "Chi phí thực tế", val: formatCompactVND(m.costActual), tVal: `${formatPercent(m.budgetUtilization * 100, 0)} ngân sách`, color: m.budgetUtilization > 1 ? "text-rose-600" : "text-orange-600" },
          { label: "Task đang mở", val: String(m.tasksOpen), tVal: `${m.tasksOverdue} quá hạn`, color: m.tasksOverdue > 0 ? "text-rose-600" : "text-blue-500" },
          { label: "Project đang chạy", val: String(summary.projects.length), tVal: `${summary.projects.filter((p) => p.status === "active").length} active`, color: "text-emerald-600" },
        ].map((c, idx) => (
          <div key={idx} className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{c.label}</p>
            <div className="flex items-end justify-between">
              <h3 className={cn("text-lg font-black", c.color)}>{c.val}</h3>
              <p className="text-[9px] font-bold text-zinc-400">{c.tVal}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Overview & Budget */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className={cn("size-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl", dept.color)}>
                  {dept.code.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-black text-zinc-900">Tổng quan {dept.name}</h2>
                    <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded",
                      m.kpiAvgCompletion >= 0.95 ? "bg-emerald-50 text-emerald-600"
                        : m.kpiAvgCompletion >= 0.85 ? "bg-amber-50 text-amber-600"
                          : "bg-rose-50 text-rose-600")}>
                      {m.kpiAvgCompletion >= 0.95 ? "Tốt" : m.kpiAvgCompletion >= 0.85 ? "Cần chú ý" : "Rủi ro"}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">{head?.fullName} <span className="text-zinc-400 font-medium ml-2">{head?.position}</span></p>
                  <p className="text-[11px] text-zinc-400 mt-1 max-w-lg leading-relaxed font-medium">{dept.scope}</p>
                </div>
              </div>
              <div className="flex gap-4 text-center">
                <div><p className="text-[10px] font-bold text-zinc-400 uppercase">Mã CC</p><p className="text-lg font-black text-zinc-900">{dept.code}</p></div>
                <div><p className="text-[10px] font-bold text-zinc-400 uppercase">Headcount</p><p className="text-lg font-black text-zinc-900">{m.headcountReported}</p></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
              {[
                { tab: "Mục tiêu", desc: dept.scope },
                { tab: "Owner KPI", desc: `${deptKpis.length} KPI thuộc phòng. Đạt TB: ${formatPercent(m.kpiAvgCompletion * 100, 0)}.` },
                { tab: "Phối hợp", desc: `Tasks đang chạy: ${m.tasksOpen}. Project: ${summary.projects.length}. Quá hạn: ${m.tasksOverdue}.` },
              ].map((t) => (
                <div key={t.tab} className="space-y-2">
                  <h4 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-[#1b5e20]" /> {t.tab}
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Budget chart */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Ngân sách & chi thực (triệu đồng)</h3>
              <span className={cn("text-[10px] font-bold px-2 py-1 rounded",
                m.budgetUtilization > 1 ? "bg-rose-50 text-rose-600"
                  : m.budgetUtilization > 0.95 ? "bg-amber-50 text-amber-600"
                    : "bg-emerald-50 text-emerald-600")}>
                {m.budgetUtilization > 1 ? "Vượt ngân sách" : "Trong kiểm soát"}
              </span>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costSplit} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f4" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                  <Tooltip />
                  <Bar dataKey="budget" fill="#e5e7eb" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="actual" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right: KPI list & team */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-6">KPI phòng ban ({deptKpis.length})</h3>
            <div className="space-y-5 max-h-[280px] overflow-y-auto pr-2">
              {deptKpis.map((k) => {
                const c = completionOf(k);
                const s = statusOf(c);
                return (
                  <div key={k.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-zinc-700 truncate">{k.name}</span>
                      <span className="text-zinc-900 shrink-0">{Math.round(c * 100)}%</span>
                    </div>
                    <p className="text-[9px] font-medium text-zinc-400">Target: {fmtVal(k.target, k.unit)} · Actual: {fmtVal(k.actual, k.unit)}</p>
                    <div className="h-1.5 w-full bg-zinc-50 rounded-full overflow-hidden">
                      <div className={cn("h-full",
                        s === "green" ? "bg-emerald-500" : s === "amber" ? "bg-amber-500" : "bg-rose-500")}
                        style={{ width: `${Math.min(c * 100, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
              {deptKpis.length === 0 && <p className="text-[10px] text-zinc-400 italic">Phòng này chưa có KPI gắn owner.</p>}
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 border-t border-zinc-50 pt-6">
              <div className="relative size-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ v: m.kpiAvgCompletion * 100 }, { v: 100 - m.kpiAvgCompletion * 100 }]} innerRadius={30} outerRadius={45} dataKey="v" startAngle={90} endAngle={450}>
                      <Cell fill="#1b5e20" />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center font-black text-lg text-zinc-900">{Math.round(m.kpiAvgCompletion * 100)}%</div>
              </div>
              <div>
                <p className="text-xs font-black text-emerald-600">{m.kpiGreen} xanh</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase">{m.kpiAmber} vàng · {m.kpiRed} đỏ</p>
              </div>
            </div>
          </div>

          {/* Team list */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-4">Nhân sự ({summary.employees.length})</h3>
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {summary.employees.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-50 hover:bg-zinc-50">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-zinc-900 text-white text-[10px] font-black flex items-center justify-center">{e.avatarInitials}</div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">{e.fullName}</p>
                      <p className="text-[10px] text-zinc-400 font-medium">{e.position}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-zinc-400 uppercase">{e.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Project list của phòng */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-6">Dự án trọng điểm của phòng</h3>
        {summary.projects.length === 0 ? (
          <p className="text-xs text-zinc-400 italic">Phòng này chưa có dự án đang chạy.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {summary.projects.map((p) => {
              const owner = EMP_BY_ID[p.ownerId];
              return (
                <div key={p.id} className="border border-zinc-100 rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-black text-zinc-900">{p.name}</h4>
                    <span className="text-[9px] font-bold text-zinc-300 uppercase">{p.code}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed mb-3">{p.businessCase}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-5 rounded-full bg-zinc-900 text-white text-[8px] flex items-center justify-center font-black">{owner?.avatarInitials}</div>
                    <p className="text-[10px] font-bold text-zinc-700">{owner?.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-zinc-500">{formatCompactVND(p.spent)} / {formatCompactVND(p.budget)}</span>
                      <span className="text-zinc-900">{p.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
