"use client";

import { cn, formatCompactVND } from "@/lib/utils";
import { User, Mail, Phone, Calendar, Edit3, Bell, Globe, Lock, Shield } from "lucide-react";
import { getEmployeeProfile } from "@/lib/queries";

export default function ProfilePage() {
  // demo: profile của CEO (emp_001)
  const profile = getEmployeeProfile("emp_001")!;
  const { employee: emp, department, payroll, ownedKpis } = profile;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-black text-zinc-900">Tài khoản cá nhân</h1>
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Hồ sơ · Cá nhân hoá · Bảo mật</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-6">
          {/* Profile card */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm text-center">
            <div className="size-32 rounded-3xl bg-emerald-500/10 text-[#1b5e20] font-black text-4xl flex items-center justify-center mx-auto shadow-xl mb-4">{emp.avatarInitials}</div>
            <h2 className="text-xl font-black text-zinc-900">{emp.fullName}</h2>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-1">{emp.position}</p>
            <span className="inline-block mt-4 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full">Đang làm việc</span>
            <div className="space-y-3 mt-8 text-left">
              {[
                { icon: <Mail className="size-3.5" />, l: "Email", v: emp.email },
                { icon: <Phone className="size-3.5" />, l: "SĐT", v: emp.phone },
                { icon: <Calendar className="size-3.5" />, l: "Ngày vào", v: new Date(emp.joinDate).toLocaleDateString("vi-VN") },
                { icon: <User className="size-3.5" />, l: "Mã NS", v: emp.code },
              ].map((it, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-zinc-400 font-medium">{it.icon}{it.l}</div>
                  <span className="font-bold text-zinc-900 truncate">{it.v}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-zinc-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"><Edit3 className="size-3.5" /> Chỉnh sửa hồ sơ</button>
          </div>

          {/* Quick stats */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">Tổng quan</h3>
            <div className="space-y-3 text-xs">
              <Row l="Phòng ban" v={department?.name ?? "—"} />
              <Row l="KPI hiện tại" v={`${Math.round((profile.kpiCompletion ?? 1) * 100)}%`} c="text-emerald-600" />
              <Row l="KPI owner" v={String(ownedKpis.length)} />
              <Row l="Lương net" v={formatCompactVND(payroll.net)} c="text-zinc-900 font-black" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-6 flex items-center gap-2"><Bell className="size-4" /> Thông báo</h3>
            <div className="space-y-4">
              {[
                { l: "Email khi có cảnh báo KPI", on: true },
                { l: "Email khi yêu cầu chờ duyệt", on: true },
                { l: "Push khi task được giao", on: true },
                { l: "Báo cáo tuần (sáng T2)", on: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-700 font-bold">{s.l}</span>
                  <div className={cn("w-10 h-5 rounded-full p-0.5 transition-colors", s.on ? "bg-emerald-500" : "bg-zinc-200")}>
                    <div className={cn("size-4 rounded-full bg-white shadow transition-transform", s.on ? "translate-x-5" : "")} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-6 flex items-center gap-2"><Globe className="size-4" /> Ngôn ngữ & giao diện</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border-2 border-zinc-900 rounded-2xl text-left">
                <p className="text-xs font-black">🇻🇳 Tiếng Việt</p>
                <p className="text-[10px] text-zinc-400 mt-1">Mặc định</p>
              </button>
              <button className="p-4 border-2 border-zinc-100 rounded-2xl text-left">
                <p className="text-xs font-black">🇬🇧 English</p>
                <p className="text-[10px] text-zinc-400 mt-1">Coming soon</p>
              </button>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-6 flex items-center gap-2"><Shield className="size-4" /> Bảo mật</h3>
            <div className="space-y-3">
              <button className="w-full p-4 bg-zinc-50 hover:bg-zinc-100 rounded-2xl text-left flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-zinc-900 flex items-center gap-2"><Lock className="size-3.5" /> Đổi mật khẩu</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Lần cuối: 2 tháng trước</p>
                </div>
                <span className="text-xs font-bold text-zinc-400">→</span>
              </button>
              <button className="w-full p-4 bg-zinc-50 hover:bg-zinc-100 rounded-2xl text-left flex items-center justify-between">
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
    <div className="flex justify-between items-center">
      <span className="text-zinc-400">{l}</span>
      <span className={cn("font-bold", c || "text-zinc-700")}>{v}</span>
    </div>
  );
}
