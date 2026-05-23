"use client";

import { cn, formatCompactVND } from "@/lib/utils";
import {
  User, Mail, Phone, Calendar, Edit3, Bell,
  Globe, Lock, Shield, TrendingUp, CheckSquare,
  Award, Building2,
} from "lucide-react";
import {
  getEmployeeProfile,
  DEPT_BY_ID,
  EMPLOYEES,
  useHACOUpdate,
  type Kpi,
} from "@/lib/queries";
import { useDemoSession, ROLE_LABELS, ROLE_COLORS } from "@/lib/auth/demoSession";
import type { DeptId } from "@/lib/queries";

// ------------------------------------------------------------------ //
// Map the current demo session user → best-matching employee record   //
// ------------------------------------------------------------------ //
function resolveEmployeeId(role: string, departmentId: string): string {
  if (role === "ceo") return "emp_001";

  const deptId = departmentId as DeptId;
  const dept = DEPT_BY_ID[deptId];

  // CFO and dept_head → use the department head
  if (role === "cfo" || role === "dept_head" || role === "auditor") {
    return dept?.headEmployeeId ?? "emp_001";
  }

  // HR Admin, team_lead, employee → prefer a non-head in same dept
  const nonHead = EMPLOYEES.find(
    (e) => e.departmentId === deptId && e.id !== dept?.headEmployeeId
  );
  return nonHead?.id ?? dept?.headEmployeeId ?? "emp_001";
}

export default function ProfilePage() {
  useHACOUpdate();
  const { user } = useDemoSession();

  const empId = resolveEmployeeId(user.role, user.departmentId);
  const profile = getEmployeeProfile(empId);

  // Graceful fallback if profile not found
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-400 text-sm font-bold">Không tìm thấy hồ sơ nhân viên.</p>
      </div>
    );
  }

  const { employee: emp, department, payroll, ownedKpis, tasks, kpiCompletion } = profile;

  // Use session user's display name & contact; fall back to employee record
  const displayName = user.fullName || emp.fullName;
  const displayEmail = user.email || emp.email;
  const displayPosition = user.position || emp.position;
  const displayInitials = user.avatarInitials || emp.avatarInitials;

  const tasksDone = tasks.filter((t) => t.status === "done").length;
  const tasksTotal = tasks.length;
  const kpiPct = Math.round((kpiCompletion ?? 0) * 100);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-zinc-900">Tài khoản cá nhân</h1>
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">
          Hồ sơ · Cá nhân hoá · Bảo mật
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* ---- Left column ---- */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile card */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm text-center">
            {/* Avatar */}
            <div className="size-28 rounded-3xl bg-[#1b5e20]/10 text-[#1b5e20] font-black text-4xl flex items-center justify-center mx-auto shadow-xl mb-4">
              {displayInitials}
            </div>

            <h2 className="text-xl font-black text-zinc-900">{displayName}</h2>
            <p className="text-sm font-bold text-zinc-400 mt-1">{displayPosition}</p>

            {/* Role badge */}
            <span className={cn(
              "inline-block mt-3 px-3 py-1 text-[10px] font-black uppercase rounded-full",
              ROLE_COLORS[user.role]
            )}>
              {ROLE_LABELS[user.role]}
            </span>

            {/* Contact info */}
            <div className="space-y-3 mt-8 text-left">
              {[
                { icon: <Mail className="size-3.5" />, l: "Email", v: displayEmail },
                { icon: <Phone className="size-3.5" />, l: "SĐT", v: emp.phone },
                { icon: <Calendar className="size-3.5" />, l: "Ngày vào", v: new Date(emp.joinDate).toLocaleDateString("vi-VN") },
                { icon: <User className="size-3.5" />, l: "Mã NS", v: emp.code },
                { icon: <Building2 className="size-3.5" />, l: "Phòng ban", v: department?.name ?? "—" },
              ].map((it, i) => (
                <div key={i} className="flex items-center justify-between text-xs gap-4">
                  <div className="flex items-center gap-2 text-zinc-400 font-medium shrink-0">
                    {it.icon}
                    <span>{it.l}</span>
                  </div>
                  <span className="font-bold text-zinc-900 truncate text-right">{it.v}</span>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 py-3 bg-zinc-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors">
              <Edit3 className="size-3.5" /> Chỉnh sửa hồ sơ
            </button>
          </div>

          {/* Performance quick stats */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">
              Hiệu suất tháng này
            </h3>
            <div className="space-y-4">
              {/* KPI completion */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                    <TrendingUp className="size-3" /> Hoàn thành KPI
                  </span>
                  <span className={cn(
                    "font-black",
                    kpiPct >= 100 ? "text-emerald-600" : kpiPct >= 85 ? "text-amber-600" : "text-rose-600"
                  )}>{kpiPct}%</span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      kpiPct >= 100 ? "bg-emerald-500" : kpiPct >= 85 ? "bg-amber-400" : "bg-rose-400"
                    )}
                    style={{ width: `${Math.min(kpiPct, 100)}%` }}
                  />
                </div>
              </div>

              {/* Task completion */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                    <CheckSquare className="size-3" /> Công việc xong
                  </span>
                  <span className="font-black text-zinc-900">{tasksDone}/{tasksTotal}</span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{ width: tasksTotal ? `${(tasksDone / tasksTotal) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-50 space-y-3">
              <Row l="KPI đang sở hữu" v={`${ownedKpis.length} chỉ tiêu`} />
              <Row l="Lương cứng" v={formatCompactVND(emp.baseSalary)} />
              <Row l="Thưởng KPI" v={formatCompactVND(payroll.bonusEarned)} c="text-emerald-600" />
              <Row l="Lương net thực nhận" v={formatCompactVND(payroll.net)} c="text-zinc-900 font-black text-sm" />
            </div>
          </div>
        </div>

        {/* ---- Right column ---- */}
        <div className="lg:col-span-8 space-y-6">
          {/* KPIs owned */}
          {ownedKpis.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-5 flex items-center gap-2">
                <Award className="size-4" /> KPI đang phụ trách
              </h3>
              <div className="space-y-3">
                {ownedKpis.slice(0, 6).map((kpi) => {
                  const pct = Math.round((kpi.actual / Math.max(kpi.target, 1)) * 100);
                  const isGood = pct >= 100;
                  return (
                    <div key={kpi.id} className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-zinc-700 truncate">{kpi.name}</span>
                          <span className={cn("text-xs font-black shrink-0 ml-4", isGood ? "text-emerald-600" : "text-amber-600")}>
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", isGood ? "bg-emerald-400" : pct >= 85 ? "bg-amber-400" : "bg-rose-400")}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notification settings */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <Bell className="size-4" /> Thông báo
            </h3>
            <div className="space-y-4">
              {[
                { l: "Email khi có cảnh báo KPI", on: true },
                { l: "Email khi yêu cầu chờ duyệt", on: true },
                { l: "Push khi task được giao", on: true },
                { l: "Báo cáo tuần (sáng T2)", on: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-700 font-bold">{s.l}</span>
                  <div className={cn("w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer", s.on ? "bg-emerald-500" : "bg-zinc-200")}>
                    <div className={cn("size-4 rounded-full bg-white shadow transition-transform", s.on ? "translate-x-5" : "")} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Language & theme */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <Globe className="size-4" /> Ngôn ngữ & giao diện
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border-2 border-zinc-900 rounded-2xl text-left">
                <p className="text-xs font-black">🇻🇳 Tiếng Việt</p>
                <p className="text-[10px] text-zinc-400 mt-1">Mặc định</p>
              </button>
              <button className="p-4 border-2 border-zinc-100 rounded-2xl text-left opacity-50 cursor-not-allowed">
                <p className="text-xs font-black">🇬🇧 English</p>
                <p className="text-[10px] text-zinc-400 mt-1">Coming soon</p>
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <Shield className="size-4" /> Bảo mật
            </h3>
            <div className="space-y-3">
              <button className="w-full p-4 bg-zinc-50 hover:bg-zinc-100 rounded-2xl text-left flex items-center justify-between transition-colors">
                <div>
                  <p className="text-xs font-black text-zinc-900 flex items-center gap-2">
                    <Lock className="size-3.5" /> Đổi mật khẩu
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Lần cuối: 2 tháng trước</p>
                </div>
                <span className="text-xs font-bold text-zinc-400">→</span>
              </button>
              <button className="w-full p-4 bg-zinc-50 hover:bg-zinc-100 rounded-2xl text-left flex items-center justify-between transition-colors">
                <div>
                  <p className="text-xs font-black text-zinc-900">Xác thực 2 lớp (2FA)</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5 font-bold">Đã bật · TOTP</p>
                </div>
                <span className="text-xs font-bold text-zinc-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ l, v, c }: { l: string; v: string; c?: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-zinc-400">{l}</span>
      <span className={cn("font-bold", c || "text-zinc-700")}>{v}</span>
    </div>
  );
}
