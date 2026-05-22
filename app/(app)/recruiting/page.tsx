"use client";

import { cn } from "@/lib/utils";
import { UserCheck, Plus, Users, Briefcase, Calendar } from "lucide-react";
import { listJobReqs, DEPT_BY_ID } from "@/lib/queries";

const STATUS_COLOR: Record<string, string> = {
  open: "bg-blue-50 text-blue-600 border-blue-100",
  screening: "bg-amber-50 text-amber-600 border-amber-100",
  interview: "bg-purple-50 text-purple-600 border-purple-100",
  closed: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

export default function RecruitingPage() {
  const jobs = listJobReqs();
  const totalHeadcount = jobs.reduce((s, j) => s + j.headcount, 0);
  const totalFilled = jobs.reduce((s, j) => s + j.filled, 0);
  const totalCandidates = jobs.reduce((s, j) => s + j.candidates, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-3"><UserCheck className="size-6" /> Tuyển dụng</h1>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">{jobs.length} job đang mở · {totalHeadcount - totalFilled} vị trí cần tuyển · {totalCandidates} ứng viên</p>
        </div>
        <button className="bg-[#1b5e20] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-[#1b5e20]/20 flex items-center gap-2"><Plus className="size-3" /> Mở job mới</button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { l: "Job đang mở", v: jobs.filter((j) => j.status !== "closed").length, icon: <Briefcase className="size-4" /> },
          { l: "Headcount cần", v: totalHeadcount - totalFilled, icon: <Users className="size-4" /> },
          { l: "Đã fill", v: totalFilled, icon: <UserCheck className="size-4" /> },
          { l: "Tổng ứng viên", v: totalCandidates, icon: <Users className="size-4" /> },
        ].map((c) => (
          <div key={c.l} className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{c.l}</p>
              <p className="text-xl font-black text-zinc-900 mt-1">{c.v}</p>
            </div>
            <div className="size-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">{c.icon}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {jobs.map((j) => {
          const dept = DEPT_BY_ID[j.departmentId];
          const fillPct = (j.filled / j.headcount) * 100;
          return (
            <div key={j.id} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-black text-zinc-900">{j.title}</h3>
                    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase border", STATUS_COLOR[j.status])}>{j.status}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-3 leading-relaxed">{j.reason}</p>
                  <div className="flex items-center gap-6 text-[11px] font-bold text-zinc-400">
                    <span>{dept?.name}</span>
                    <span>Level: <span className="text-zinc-700">{j.level}</span></span>
                    <span className="flex items-center gap-1"><Calendar className="size-3" /> Mở từ {new Date(j.openedAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-black text-zinc-900">{j.candidates}</p>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase">ứng viên</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-50">
                <div>
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span className="text-zinc-500 uppercase">Tiến độ fill</span>
                    <span className="text-zinc-900">{j.filled}/{j.headcount}</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div className={cn("h-full", fillPct >= 100 ? "bg-emerald-500" : "bg-blue-500")} style={{ width: `${fillPct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span className="text-zinc-500 uppercase">Funnel ứng viên</span>
                    <span className="text-zinc-900">{Math.round(j.filled / Math.max(j.candidates, 1) * 100)}% offer</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${(j.filled / Math.max(j.candidates, 1)) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
