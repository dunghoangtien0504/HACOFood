"use client";

import { Settings as SettingsIcon, Building2, Users, Lock, Bell, Database, Globe } from "lucide-react";
import { COMPANY, listDepartments } from "@/lib/queries";

export default function SettingsPage() {
  const departments = listDepartments();

  const sections = [
    {
      icon: <Building2 className="size-5" />,
      title: "Thông tin công ty",
      rows: [
        { l: "Tên thương hiệu", v: COMPANY.name },
        { l: "Pháp nhân", v: COMPANY.legalName },
        { l: "Mã công ty", v: COMPANY.code },
        { l: "Ngành", v: COMPANY.industry },
        { l: "Năm tài chính", v: COMPANY.fiscalYear },
        { l: "Tiền tệ", v: COMPANY.currency },
        { l: "Múi giờ", v: COMPANY.timezone },
        { l: "Trụ sở", v: COMPANY.hqAddress },
        { l: "Thành lập", v: new Date(COMPANY.founded).toLocaleDateString("vi-VN") },
      ],
    },
    {
      icon: <Users className="size-5" />,
      title: `Phòng ban (${departments.length})`,
      rows: departments.map((d) => ({ l: d.code, v: `${d.name} · ${d.headcount} người` })),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-3"><SettingsIcon className="size-6" /> Cài đặt hệ thống</h1>
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Cấu hình toàn cục cho HACO Food OS</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((sec) => (
          <div key={sec.title} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <span className="size-9 rounded-xl bg-emerald-50 text-[#1b5e20] flex items-center justify-center">{sec.icon}</span>
              {sec.title}
            </h3>
            <div className="divide-y divide-zinc-50">
              {sec.rows.map((r, i) => (
                <div key={i} className="py-3 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">{r.l}</span>
                  <span className="font-bold text-zinc-900 truncate ml-3">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { icon: <Lock className="size-5" />, title: "Bảo mật & RBAC", desc: "7 vai trò: CEO, CFO, Head, Lead, Staff, HR Admin, Viewer." },
          { icon: <Bell className="size-5" />, title: "Cảnh báo tự động", desc: "Threshold KPI/Budget gửi tới Head + CEO khi vi phạm." },
          { icon: <Globe className="size-5" />, title: "Tích hợp", desc: "Sẵn sàng kết nối Supabase, Slack, Email, Google Sheets, ERP." },
        ].map((c) => (
          <div key={c.title} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <div className="size-10 rounded-xl bg-emerald-50 text-[#1b5e20] flex items-center justify-center mb-4">{c.icon}</div>
            <h4 className="text-sm font-black text-zinc-900 mb-2">{c.title}</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">{c.desc}</p>
            <button className="mt-4 text-[10px] font-black text-[#1b5e20] uppercase">Cấu hình →</button>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 rounded-3xl p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-emerald-600 flex items-center justify-center"><Database className="size-5" /></div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest">Backup dữ liệu</h4>
            <p className="text-[10px] text-white/40 font-bold mt-1">Demo mode — dữ liệu sống trong code. Bật Supabase để dùng backup tự động.</p>
          </div>
        </div>
        <button className="px-6 py-2 bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase">Cấu hình Supabase</button>
      </div>
    </div>
  );
}
