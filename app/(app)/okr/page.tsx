"use client";

import { useState } from "react";
import { cn, formatCompactVND, formatNumber } from "@/lib/utils";
import {
  Target, Flag, CheckCircle2, AlertCircle, Search, Plus, ShieldCheck, ArrowRight, Rocket,
} from "lucide-react";
import { listObjectives, EMP_BY_ID, DEPT_BY_ID, useHACOUpdate } from "@/lib/queries";

export default function OkrPage() {
  useHACOUpdate();
  const [search, setSearch] = useState("");
  const objectives = listObjectives();
  const filtered = objectives.filter((o) => !search || o.title.toLowerCase().includes(search.toLowerCase()));

  const companyObj = objectives.find((o) => o.level === "company");
  const deptObjs = objectives.filter((o) => o.level === "department");

  const overallProgress = Math.round(objectives.reduce((s, o) => s + o.progress, 0) / objectives.length);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">Mục tiêu OKR — Q2/2026</h1>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">{objectives.length} objective · {objectives.reduce((s, o) => s + o.keyResults.length, 0)} key results · TB {overallProgress}%</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm objective..." className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-xs outline-none w-56" />
          </div>
          <button className="bg-[#1b5e20] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-[#1b5e20]/20 flex items-center gap-2"><Plus className="size-3" /> Tạo Objective</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Objectives", val: String(objectives.length), icon: <Target className="size-4" /> },
          { label: "Key Results", val: String(objectives.reduce((s, o) => s + o.keyResults.length, 0)), icon: <Flag className="size-4" /> },
          { label: "Đang on track", val: String(objectives.filter((o) => o.progress >= 60).length), icon: <CheckCircle2 className="size-4" />, color: "text-emerald-600" },
          { label: "Cần chú ý", val: String(objectives.filter((o) => o.progress < 60).length), icon: <AlertCircle className="size-4" />, color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{s.label}</p>
              <p className={cn("text-xl font-black mt-1", s.color ?? "text-zinc-900")}>{s.val}</p>
            </div>
            <div className={cn("size-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400", s.color)}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Company objective spotlight */}
      {companyObj && (
        <div className="bg-zinc-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
          <div className="flex items-start gap-6">
            <div className="size-16 rounded-2xl bg-emerald-600 flex items-center justify-center"><ShieldCheck className="size-7" /></div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">OBJECTIVE CÔNG TY · {companyObj.period}</p>
              <h2 className="text-2xl font-black mb-2">{companyObj.title}</h2>
              <p className="text-sm text-white/70 max-w-3xl leading-relaxed">{companyObj.description}</p>
              <div className="flex items-center gap-6 mt-6">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase">Owner</p>
                  <p className="text-sm font-black mt-1">{EMP_BY_ID[companyObj.ownerId]?.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase">Tiến độ</p>
                  <p className="text-sm font-black mt-1 text-emerald-400">{companyObj.progress}%</p>
                </div>
              </div>
              <div className="mt-6 grid md:grid-cols-3 gap-4">
                {companyObj.keyResults.map((kr) => {
                  const pct = Math.min((kr.actual / kr.target) * 100, 200);
                  return (
                    <div key={kr.id} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <p className="text-[10px] font-bold text-white/50 uppercase">{kr.title}</p>
                      <p className="text-sm font-black mt-2">
                        {kr.unit === "VND" ? formatCompactVND(kr.actual) : `${formatNumber(kr.actual)}${kr.unit === "%" ? "%" : ""}`}
                        <span className="text-white/40 font-medium text-xs ml-1">/ {kr.unit === "VND" ? formatCompactVND(kr.target) : `${formatNumber(kr.target)}${kr.unit === "%" ? "%" : ""}`}</span>
                      </p>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-2">
                        <div className={cn("h-full",
                          pct >= 95 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-500" : "bg-rose-500")}
                          style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Department objectives grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {deptObjs.filter((o) => filtered.includes(o)).map((o) => {
          const owner = EMP_BY_ID[o.ownerId];
          const dept = o.ownerDepartmentId ? DEPT_BY_ID[o.ownerDepartmentId] : null;
          return (
            <div key={o.id} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{dept?.name} · {o.period}</p>
                  <h3 className="text-base font-black text-zinc-900 mt-2">{o.title}</h3>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{o.description}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className={cn("text-2xl font-black",
                    o.progress >= 70 ? "text-emerald-600" : o.progress >= 50 ? "text-amber-500" : "text-rose-500")}>{o.progress}%</p>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase">progress</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-zinc-50 mb-4">
                <div className="size-7 rounded-lg bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center">{owner?.avatarInitials}</div>
                <p className="text-[11px] font-bold text-zinc-700">{owner?.fullName}</p>
              </div>

              <div className="space-y-3">
                {o.keyResults.map((kr) => {
                  const pct = Math.min((kr.actual / kr.target) * 100, 200);
                  return (
                    <div key={kr.id} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-zinc-700 flex-1 truncate pr-2">{kr.title}</span>
                        <span className={cn("shrink-0",
                          pct >= 95 ? "text-emerald-600" : pct >= 70 ? "text-amber-600" : "text-rose-600")}>{Math.round(pct)}%</span>
                      </div>
                      <p className="text-[9px] text-zinc-400 font-medium">
                        {kr.unit === "VND" ? formatCompactVND(kr.actual) : `${formatNumber(kr.actual)}`}
                        {kr.unit === "%" ? "%" : ` ${kr.unit}`}
                        <span className="mx-1">/</span>
                        {kr.unit === "VND" ? formatCompactVND(kr.target) : `${formatNumber(kr.target)}`}
                        {kr.unit === "%" ? "%" : ` ${kr.unit}`}
                      </p>
                      <div className="h-1.5 w-full bg-zinc-50 rounded-full overflow-hidden">
                        <div className={cn("h-full",
                          pct >= 95 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-500" : "bg-rose-500")}
                          style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="mt-4 text-[10px] font-black text-[#1b5e20] uppercase flex items-center gap-1">
                Liên kết KPI <ArrowRight className="size-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-20 text-center">
          <Rocket className="size-12 text-zinc-200 mx-auto mb-4" />
          <p className="text-sm font-black text-zinc-400">Không tìm thấy objective nào.</p>
        </div>
      )}
    </div>
  );
}
