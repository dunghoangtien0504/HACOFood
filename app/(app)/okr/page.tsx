"use client";

import { useState } from "react";
import { cn, formatCompactVND, formatNumber } from "@/lib/utils";
import {
  Target, Flag, CheckCircle2, AlertCircle, Search, Plus, ShieldCheck,
  ArrowRight, Rocket, ChevronDown, TrendingUp, Building2, User,
} from "lucide-react";
import {
  listObjectives, EMP_BY_ID, DEPT_BY_ID, useHACOUpdate,
  type Objective,
} from "@/lib/queries";
import { useDemoSession, ROLE_LABELS } from "@/lib/auth/demoSession";

// ------------------------------------------------------------------ //
// KR progress bar                                                      //
// ------------------------------------------------------------------ //
function KrBar({
  kr,
}: {
  kr: { id: string; title: string; target: number; actual: number; unit: string };
}) {
  const pct = Math.min((kr.actual / Math.max(kr.target, 1)) * 100, 200);
  const display = (v: number) =>
    kr.unit === "VND" ? formatCompactVND(v) : `${formatNumber(v)}${kr.unit === "%" ? "%" : " " + kr.unit}`;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-[10px] font-bold">
        <span className="text-zinc-700 flex-1 truncate pr-2">{kr.title}</span>
        <span
          className={cn(
            "shrink-0",
            pct >= 95 ? "text-emerald-600" : pct >= 70 ? "text-amber-600" : "text-rose-600"
          )}
        >
          {Math.round(pct)}%
        </span>
      </div>
      <p className="text-[9px] text-zinc-400 font-medium">
        {display(kr.actual)}
        <span className="mx-1 text-zinc-300">/</span>
        {display(kr.target)}
      </p>
      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full",
            pct >= 95 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-500" : "bg-rose-500"
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ //
// Department objective card                                            //
// ------------------------------------------------------------------ //
function DeptObjCard({ o, highlight = false }: { o: Objective; highlight?: boolean }) {
  const owner = EMP_BY_ID[o.ownerId];
  const dept = o.ownerDepartmentId ? DEPT_BY_ID[o.ownerDepartmentId] : null;
  const [expanded, setExpanded] = useState(highlight);

  return (
    <div
      className={cn(
        "bg-white border rounded-3xl shadow-sm transition-all",
        highlight ? "border-[#1b5e20]/30 ring-2 ring-[#1b5e20]/10" : "border-zinc-200 hover:shadow-md"
      )}
    >
      <div
        className="p-6 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {highlight && (
              <span className="inline-block mb-2 px-2 py-0.5 bg-[#1b5e20]/10 text-[#1b5e20] text-[9px] font-black uppercase rounded-full">
                Phòng ban của bạn
              </span>
            )}
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
              {dept?.name} · {o.period}
            </p>
            <h3 className="text-base font-black text-zinc-900 mt-1.5">{o.title}</h3>
            {expanded && (
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{o.description}</p>
            )}
          </div>
          <div className="text-right shrink-0 flex flex-col items-end gap-1">
            <p
              className={cn(
                "text-2xl font-black",
                o.progress >= 70 ? "text-emerald-600" : o.progress >= 50 ? "text-amber-500" : "text-rose-500"
              )}
            >
              {o.progress}%
            </p>
            <ChevronDown
              className={cn("size-4 text-zinc-300 transition-transform", expanded && "rotate-180")}
            />
          </div>
        </div>

        {/* Owner */}
        <div className="flex items-center gap-2 mt-3">
          <div className="size-6 rounded-lg bg-zinc-900 text-white text-[8px] font-black flex items-center justify-center shrink-0">
            {owner?.avatarInitials ?? "?"}
          </div>
          <p className="text-[11px] font-bold text-zinc-500">{owner?.fullName}</p>
        </div>
      </div>

      {/* Key results (expanded) */}
      {expanded && (
        <div className="px-6 pb-6 space-y-4 border-t border-zinc-50 pt-4">
          {o.keyResults.map((kr) => (
            <KrBar key={kr.id} kr={kr} />
          ))}
          <button className="mt-2 text-[10px] font-black text-[#1b5e20] uppercase flex items-center gap-1 hover:underline">
            Liên kết KPI <ArrowRight className="size-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ //
// Page                                                                 //
// ------------------------------------------------------------------ //
export default function OkrPage() {
  useHACOUpdate();
  const { user } = useDemoSession();

  const [search, setSearch] = useState("");
  const objectives = listObjectives();

  const companyObj = objectives.find((o) => o.level === "company");
  const deptObjs = objectives.filter((o) => o.level === "department");

  // Filtered dept objectives (search)
  const filteredDeptObjs = deptObjs.filter(
    (o) => !search || o.title.toLowerCase().includes(search.toLowerCase())
  );

  // Current user's department objective (highlight)
  const myDeptObj = deptObjs.find((o) => o.ownerDepartmentId === user.departmentId);

  const overallProgress =
    objectives.length > 0
      ? Math.round(objectives.reduce((s, o) => s + o.progress, 0) / objectives.length)
      : 0;

  const totalKRs = objectives.reduce((s, o) => s + o.keyResults.length, 0);
  const onTrack = objectives.filter((o) => o.progress >= 60).length;
  const needsAttention = objectives.filter((o) => o.progress < 60).length;

  const canCreate = ["ceo", "dept_head"].includes(user.role);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">Mục tiêu OKR — Q2/2026</h1>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">
            {objectives.length} objectives · {totalKRs} key results · TB {overallProgress}% · {ROLE_LABELS[user.role]}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm objective..."
              className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-xs outline-none w-52 focus:border-zinc-400 transition-colors"
            />
          </div>
          {canCreate && (
            <button className="bg-[#1b5e20] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-[#1b5e20]/20 flex items-center gap-2 hover:bg-[#154618] transition-colors">
              <Plus className="size-3" /> Tạo Objective
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Objectives", val: String(objectives.length), icon: <Target className="size-4" />, color: "text-zinc-900" },
          { label: "Key Results", val: String(totalKRs), icon: <Flag className="size-4" />, color: "text-zinc-900" },
          { label: "Đang on track", val: String(onTrack), icon: <CheckCircle2 className="size-4" />, color: "text-emerald-600" },
          { label: "Cần chú ý", val: String(needsAttention), icon: <AlertCircle className="size-4" />, color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{s.label}</p>
              <p className={cn("text-2xl font-black mt-1", s.color)}>{s.val}</p>
            </div>
            <div className={cn("size-10 rounded-xl bg-zinc-50 flex items-center justify-center", s.color)}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Personal dept objective — shown to dept_head and employee when their dept has an OKR */}
      {myDeptObj && (user.role === "dept_head" || user.role === "employee" || user.role === "team_lead") && (
        <div className="space-y-3">
          <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <User className="size-3.5" /> Mục tiêu phòng ban của bạn
          </h2>
          <DeptObjCard o={myDeptObj} highlight />
        </div>
      )}

      {/* Company objective spotlight */}
      {companyObj && (
        <div className="space-y-3">
          <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Building2 className="size-3.5" /> Objective công ty
          </h2>
          <div className="bg-zinc-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute -right-20 -top-20 size-64 bg-emerald-600/10 rounded-full blur-[80px]" />
            <div className="flex items-start gap-6 relative z-10">
              <div className="size-16 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="size-7" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">
                  OBJECTIVE CÔNG TY · {companyObj.period}
                </p>
                <h2 className="text-xl md:text-2xl font-black mb-2">{companyObj.title}</h2>
                <p className="text-sm text-white/70 leading-relaxed">{companyObj.description}</p>

                <div className="flex items-center gap-8 mt-6 flex-wrap">
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase">Owner</p>
                    <p className="text-sm font-black mt-1">{EMP_BY_ID[companyObj.ownerId]?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase">Tiến độ</p>
                    <p className={cn(
                      "text-2xl font-black mt-1",
                      companyObj.progress >= 70 ? "text-emerald-400" : companyObj.progress >= 50 ? "text-amber-400" : "text-rose-400"
                    )}>
                      {companyObj.progress}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase">Key Results</p>
                    <p className="text-sm font-black mt-1">{companyObj.keyResults.length} chỉ tiêu</p>
                  </div>
                </div>

                {/* KR progress bars */}
                <div className="mt-6 grid md:grid-cols-3 gap-4">
                  {companyObj.keyResults.map((kr) => {
                    const pct = Math.min((kr.actual / Math.max(kr.target, 1)) * 100, 200);
                    const display = (v: number) =>
                      kr.unit === "VND" ? formatCompactVND(v) : `${formatNumber(v)}${kr.unit === "%" ? "%" : ""}`;
                    return (
                      <div key={kr.id} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <p className="text-[10px] font-bold text-white/50 uppercase leading-snug">{kr.title}</p>
                        <p className="text-sm font-black mt-2">
                          {display(kr.actual)}
                          <span className="text-white/30 font-medium text-xs ml-1">/ {display(kr.target)}</span>
                        </p>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-2">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              pct >= 95 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-500" : "bg-rose-500"
                            )}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <p className={cn(
                          "text-[10px] font-black mt-1",
                          pct >= 95 ? "text-emerald-400" : pct >= 70 ? "text-amber-400" : "text-rose-400"
                        )}>
                          {Math.round(pct)}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Department objectives */}
      <div className="space-y-3">
        <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="size-3.5" />
          Objectives phòng ban
          {search && (
            <span className="font-medium normal-case tracking-normal text-zinc-300">
              · {filteredDeptObjs.length} kết quả
            </span>
          )}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredDeptObjs
            // Put my dept obj last in grid since it's shown at top already
            .filter((o) => !myDeptObj || o.id !== myDeptObj.id || user.role === "ceo" || user.role === "cfo")
            .map((o) => (
              <DeptObjCard key={o.id} o={o} />
            ))}
        </div>

        {filteredDeptObjs.length === 0 && (
          <div className="bg-white border border-zinc-200 rounded-3xl p-16 text-center">
            <Rocket className="size-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-sm font-black text-zinc-400">Không tìm thấy objective nào.</p>
            <p className="text-xs text-zinc-300 mt-1">Thử từ khoá khác hoặc xoá bộ lọc.</p>
          </div>
        )}
      </div>
    </div>
  );
}
