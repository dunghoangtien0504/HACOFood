"use client";

import { useState } from "react";
import { formatCompactVND, formatPercent, formatNumber, cn } from "@/lib/utils";
import {
  User, Mail, Phone, Calendar, IdCard, CheckCircle2, Circle, Clock,
  ShieldCheck, Edit3, LayoutGrid, ArrowRight, Search,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  listEmployees, getEmployeeProfile, completionOf, statusOf,
  EMP_BY_ID, useHACOUpdate,
} from "@/lib/queries";

const PRIORITY_LABELS: Record<string, string> = {
  urgent: "Khẩn cấp",
  high: "Cao",
  normal: "Bình thường",
  low: "Thấp",
};

export default function PeoplePage() {
  useHACOUpdate();

  const employees = listEmployees();
  const [activeId, setActiveId] = useState<string>("emp_021"); // Minh Anh — Senior Content
  const [search, setSearch] = useState("");

  const currentActiveId = employees.some((e) => e.id === activeId) ? activeId : (employees[0]?.id || "");
  const profile = getEmployeeProfile(currentActiveId);

  if (!profile) {
    return <p className="text-xs text-zinc-400 py-8 italic text-center">Không có dữ liệu nhân sự.</p>;
  }

  const { employee: emp, department: dept, manager, payroll, ownedKpis, kpiCompletion, tasks } = profile;
  const tasksToday = profile.tasksToday;

  const filtered = employees.filter((e) =>
    !search || e.fullName.toLowerCase().includes(search.toLowerCase()) || e.position.toLowerCase().includes(search.toLowerCase())
  );

  // Hiệu suất 6 tháng — chuyển từ KPI completion thực + jitter
  const performanceData = [
    { name: "T12", kpi: Math.round(kpiCompletion * 100 - 8), avg: 88 },
    { name: "T1", kpi: Math.round(kpiCompletion * 100 - 4), avg: 90 },
    { name: "T2", kpi: Math.round(kpiCompletion * 100 - 2), avg: 90 },
    { name: "T3", kpi: Math.round(kpiCompletion * 100 + 1), avg: 92 },
    { name: "T4", kpi: Math.round(kpiCompletion * 100 - 1), avg: 91 },
    { name: "T5", kpi: Math.round(kpiCompletion * 100), avg: 92 },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        <span>Nhân sự</span> <ArrowRight className="size-2" /> <span>Hồ sơ nhân sự</span>
        <ArrowRight className="size-2" /> <span className="text-zinc-900">{emp.fullName}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT — Employee picker + Card */}
        <div className="lg:w-[400px] space-y-6 shrink-0">
          {/* Employee picker */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-4 shadow-sm">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm nhân sự..."
                className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs outline-none"
              />
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1">
              {filtered.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setActiveId(e.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all",
                    currentActiveId === e.id ? "bg-emerald-50 border border-emerald-200" : "hover:bg-zinc-50"
                  )}
                >
                  <div className="size-8 rounded-lg bg-zinc-900 text-white text-[10px] font-black flex items-center justify-center shrink-0">{e.avatarInitials}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-zinc-900 truncate">{e.fullName}</p>
                    <p className="text-[9px] text-zinc-400 font-medium truncate">{e.position}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Profile card */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-[#1b5e20]/5" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="size-32 rounded-3xl bg-zinc-100 border-4 border-white shadow-xl overflow-hidden mb-4">
                <div className="size-full bg-emerald-500/10 flex items-center justify-center text-[#1b5e20] font-black text-4xl">{emp.avatarInitials}</div>
              </div>
              <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                {emp.fullName} <ShieldCheck className="size-4 text-blue-500" />
              </h2>
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-1 text-center">{emp.position}</p>
              <span className={cn("mt-4 px-3 py-1 text-[10px] font-black uppercase rounded-full",
                emp.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                {emp.status === "active" ? "Đang làm việc" : emp.status}
              </span>
              <div className="w-full mt-8 space-y-4 pt-6 border-t border-zinc-50">
                {[
                  { icon: <LayoutGrid className="size-3.5" />, label: "Phòng ban", val: dept?.name ?? "—" },
                  { icon: <User className="size-3.5" />, label: "Quản lý", val: manager?.fullName ?? "—" },
                  { icon: <Mail className="size-3.5" />, label: "Email", val: emp.email },
                  { icon: <Phone className="size-3.5" />, label: "SĐT", val: emp.phone },
                  { icon: <Calendar className="size-3.5" />, label: "Ngày vào", val: new Date(emp.joinDate).toLocaleDateString("vi-VN") },
                  { icon: <IdCard className="size-3.5" />, label: "Mã NS", val: emp.code },
                ].map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2 text-zinc-400 font-medium shrink-0">{it.icon}{it.label}</div>
                    <span className="font-bold text-zinc-900 truncate text-right">{it.val}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-3 bg-zinc-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"><Edit3 className="size-3.5" /> Chỉnh sửa hồ sơ</button>
            </div>
          </div>

          {/* Lương card — wired computePayroll */}
          <div className="bg-zinc-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Tổng thu nhập gross — kỳ này</p>
              <h3 className="text-2xl font-black text-white mb-6">{formatCompactVND(payroll.gross)}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-white/40 uppercase">Lương cơ bản</p>
                  <p className="text-sm font-bold">{formatCompactVND(payroll.baseSalary)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-white/40 uppercase text-emerald-400">Bonus KPI ({Math.round(kpiCompletion * 100)}%)</p>
                  <p className="text-sm font-bold text-emerald-400">{formatCompactVND(payroll.bonusEarned)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-white/40 uppercase">BHXH (10.5%)</p>
                  <p className="text-sm font-bold">−{formatCompactVND(payroll.insurance)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-white/40 uppercase">Net</p>
                  <p className="text-sm font-bold text-white">{formatCompactVND(payroll.net)}</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 size-32 bg-[#1b5e20]/30 rounded-full blur-3xl" />
          </div>
        </div>

        {/* RIGHT — KPI & tasks */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "KPI cá nhân", val: formatPercent(kpiCompletion * 100, 0), sub: `${ownedKpis.length} KPI owner`, color: kpiCompletion >= 0.95 ? "text-[#1b5e20]" : "text-amber-500" },
              { label: "Bonus đa hệ số", val: `${(payroll.incentiveMultiplier * 100).toFixed(0)}%`, sub: `target ${formatCompactVND(payroll.targetBonus)}`, color: "text-emerald-500" },
              { label: "Task đang chạy", val: String(tasks.filter((t) => t.status !== "done").length), sub: `${tasks.length} tổng`, color: "text-blue-500" },
              { label: "Cấp bậc", val: emp.level, sub: emp.employmentType, color: "text-amber-500" },
            ].map((s, idx) => (
              <div key={idx} className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm text-center">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{s.label}</p>
                <h4 className={cn("text-xl font-black", s.color)}>{s.val}</h4>
                <p className="text-[9px] font-bold text-zinc-400 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-6">
              {/* KPI cá nhân */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-6">KPI cá nhân ({ownedKpis.length})</h3>
                {ownedKpis.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Nhân sự này chưa được gắn KPI owner.</p>
                ) : (
                  <div className="space-y-4">
                    {ownedKpis.map((k) => {
                      const c = completionOf(k);
                      const s = statusOf(c);
                      return (
                        <div key={k.id} className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-zinc-700">{k.name} <span className="text-zinc-300 font-medium ml-1">({k.frequency})</span></span>
                            <span className="text-zinc-900">{Math.round(c * 100)}%</span>
                          </div>
                          <p className="text-[9px] font-medium text-zinc-400">Target: {k.target} · Actual: {k.actual} {k.unit}</p>
                          <div className="h-1.5 w-full bg-zinc-50 rounded-full overflow-hidden">
                            <div className={cn("h-full",
                              s === "green" ? "bg-emerald-500" : s === "amber" ? "bg-amber-500" : "bg-rose-500")}
                              style={{ width: `${Math.min(c * 100, 100)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tasks today */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Công việc đang theo</h3>
                  <span className="text-xs font-bold text-emerald-600">{tasks.filter((t) => t.status === "done").length}/{tasks.length} đã xong</span>
                </div>
                {tasksToday.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Hôm nay không có task được giao.</p>
                ) : (
                  <div className="space-y-4">
                    {tasksToday.map((t) => (
                      <div key={t.id} className="flex items-center gap-4 group">
                        <span className="text-[10px] font-bold text-zinc-400 w-14 shrink-0">{new Date(t.dueDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}</span>
                        <div className="flex-1 flex items-center gap-3 min-w-0">
                          {t.status === "done" ? <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                            : t.status === "in_progress" ? <Clock className="size-3.5 text-blue-500 shrink-0" />
                              : <Circle className="size-3.5 text-zinc-200 shrink-0" />}
                          <span className={cn("text-xs font-medium truncate",
                            t.status === "done" ? "text-zinc-400 line-through" : "text-zinc-900")}>{t.title}</span>
                        </div>
                        <span className={cn("text-[9px] font-bold uppercase shrink-0",
                          t.priority === "urgent" ? "text-rose-500" : t.priority === "high" ? "text-amber-500" : "text-zinc-300")}>
                          {PRIORITY_LABELS[t.priority] || t.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-6">Hiệu suất 6 tháng gần nhất</h3>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f4" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip />
                      <Line type="monotone" dataKey="kpi" stroke="#1b5e20" strokeWidth={3} dot />
                      <Line type="monotone" dataKey="avg" stroke="#e5e7eb" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-6">Kỹ năng & năng lực</h3>
                <div className="space-y-4">
                  {emp.skills.map((s) => (
                    <div key={s.name} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-zinc-500">{s.name}</span>
                        <span className="text-zinc-900">{s.score}%</span>
                      </div>
                      <div className="h-1 w-full bg-zinc-50 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-900" style={{ width: `${s.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {profile.reports.length > 0 && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-4">Báo cáo trực tiếp ({profile.reports.length})</h3>
                  <div className="space-y-2">
                    {profile.reports.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setActiveId(r.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 text-left"
                      >
                        <div className="size-7 rounded-lg bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center">{r.avatarInitials}</div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900 truncate">{r.fullName}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{r.position}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
