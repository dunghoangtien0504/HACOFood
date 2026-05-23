"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  UserCheck, Plus, Users, Briefcase, Calendar,
  LayoutList, Columns, Filter, X,
} from "lucide-react";
import { listJobReqs, DEPT_BY_ID, DEPARTMENTS, useHACOUpdate } from "@/lib/queries";
import { useDemoSession } from "@/lib/auth/demoSession";
import type { JobReq } from "@/lib/queries";

// ------------------------------------------------------------------ //
// Config                                                               //
// ------------------------------------------------------------------ //
const STAGES = [
  { key: "open",      label: "Đang mở",    color: "border-blue-200",   badge: "bg-blue-50 text-blue-600 border-blue-100" },
  { key: "screening", label: "Sàng lọc",   color: "border-amber-200",  badge: "bg-amber-50 text-amber-600 border-amber-100" },
  { key: "interview", label: "Phỏng vấn",  color: "border-purple-200", badge: "bg-purple-50 text-purple-600 border-purple-100" },
  { key: "closed",    label: "Đã đóng",    color: "border-emerald-200",badge: "bg-emerald-50 text-emerald-600 border-emerald-100" },
] as const;

type ViewMode = "list" | "kanban";

// ------------------------------------------------------------------ //
// Page                                                                 //
// ------------------------------------------------------------------ //
export default function RecruitingPage() {
  useHACOUpdate();
  const { user } = useDemoSession();

  const jobs = listJobReqs();
  const [view, setView] = useState<ViewMode>("list");
  const [deptFilter, setDeptFilter] = useState<string>("all");

  const canEdit = ["ceo", "cfo", "hr_admin", "dept_head"].includes(user.role);

  // Filter by department
  const filtered = jobs.filter((j) =>
    deptFilter === "all" ? true : j.departmentId === deptFilter
  );

  // Summary stats
  const totalHeadcount = jobs.reduce((s, j) => s + j.headcount, 0);
  const totalFilled = jobs.reduce((s, j) => s + j.filled, 0);
  const totalCandidates = jobs.reduce((s, j) => s + j.candidates, 0);
  const activeJobs = jobs.filter((j) => j.status !== "closed").length;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
            <UserCheck className="size-6" /> Tuyển dụng
          </h1>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">
            {activeJobs} job đang mở · {totalHeadcount - totalFilled} vị trí cần tuyển · {totalCandidates} ứng viên
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center p-1 bg-zinc-100 rounded-xl gap-1">
            <button
              onClick={() => setView("list")}
              className={cn(
                "p-2 rounded-lg transition-all",
                view === "list" ? "bg-white shadow text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
              )}
              title="Danh sách"
            >
              <LayoutList className="size-4" />
            </button>
            <button
              onClick={() => setView("kanban")}
              className={cn(
                "p-2 rounded-lg transition-all",
                view === "kanban" ? "bg-white shadow text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
              )}
              title="Kanban"
            >
              <Columns className="size-4" />
            </button>
          </div>

          {canEdit && (
            <button className="bg-[#1b5e20] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-[#1b5e20]/20 flex items-center gap-2 hover:bg-[#154618] transition-colors">
              <Plus className="size-3" /> Mở job mới
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { l: "Job đang mở", v: activeJobs, icon: <Briefcase className="size-4" />, color: "text-blue-600" },
          { l: "Headcount cần", v: totalHeadcount - totalFilled, icon: <Users className="size-4" />, color: "text-amber-600" },
          { l: "Đã fill", v: totalFilled, icon: <UserCheck className="size-4" />, color: "text-emerald-600" },
          { l: "Tổng ứng viên", v: totalCandidates, icon: <Users className="size-4" />, color: "text-zinc-900" },
        ].map((c) => (
          <div key={c.l} className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{c.l}</p>
              <p className={cn("text-2xl font-black mt-1", c.color)}>{c.v}</p>
            </div>
            <div className={cn("size-10 rounded-xl bg-zinc-50 flex items-center justify-center", c.color)}>
              {c.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Dept filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="size-4 text-zinc-400 shrink-0" />
        <button
          onClick={() => setDeptFilter("all")}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-bold border transition-colors",
            deptFilter === "all" ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
          )}
        >
          Tất cả
        </button>
        {DEPARTMENTS.filter((d) => jobs.some((j) => j.departmentId === d.id)).map((d) => (
          <button
            key={d.id}
            onClick={() => setDeptFilter(deptFilter === d.id ? "all" : d.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold border transition-colors",
              deptFilter === d.id ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            )}
          >
            {d.name}
          </button>
        ))}
        {deptFilter !== "all" && (
          <button onClick={() => setDeptFilter("all")} className="ml-1 text-zinc-400 hover:text-zinc-600">
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Content — list or kanban */}
      {view === "list" ? (
        <ListView jobs={filtered} />
      ) : (
        <KanbanView jobs={filtered} />
      )}
    </div>
  );
}

// ------------------------------------------------------------------ //
// List View                                                            //
// ------------------------------------------------------------------ //
function ListView({ jobs }: { jobs: JobReq[] }) {
  if (jobs.length === 0) return <EmptyState />;

  return (
    <div className="space-y-3">
      {jobs.map((j) => <JobCard key={j.id} job={j} />)}
    </div>
  );
}

// ------------------------------------------------------------------ //
// Kanban View                                                          //
// ------------------------------------------------------------------ //
function KanbanView({ jobs }: { jobs: JobReq[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {STAGES.map((stage) => {
        const stageJobs = jobs.filter((j) => j.status === stage.key);
        return (
          <div key={stage.key} className={cn(
            "bg-zinc-50 rounded-3xl p-4 border-t-4 min-h-[300px]",
            stage.color
          )}>
            {/* Column header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-black text-zinc-700 uppercase tracking-widest">{stage.label}</p>
                <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                  {stageJobs.reduce((s, j) => s + j.candidates, 0)} ứng viên
                </p>
              </div>
              <span className="size-7 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-black text-zinc-900">
                {stageJobs.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {stageJobs.map((j) => (
                <KanbanCard key={j.id} job={j} stageBadge={stage.badge} />
              ))}
              {stageJobs.length === 0 && (
                <div className="h-24 border-2 border-dashed border-zinc-200 rounded-2xl flex items-center justify-center">
                  <p className="text-[10px] font-bold text-zinc-300 uppercase">Không có job</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------ //
// Job card (list view)                                                 //
// ------------------------------------------------------------------ //
function JobCard({ job: j }: { job: JobReq }) {
  const dept = DEPT_BY_ID[j.departmentId];
  const fillPct = Math.round((j.filled / Math.max(j.headcount, 1)) * 100);
  const stage = STAGES.find((s) => s.key === j.status);

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-base font-black text-zinc-900">{j.title}</h3>
            <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase border shrink-0", stage?.badge)}>
              {stage?.label}
            </span>
            <span className="px-2 py-0.5 bg-zinc-50 border border-zinc-100 rounded-full text-[9px] font-black uppercase text-zinc-500">
              {j.level}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mb-3 leading-relaxed">{j.reason}</p>
          <div className="flex items-center gap-6 text-[11px] font-bold text-zinc-400 flex-wrap">
            <span className="text-zinc-600">{dept?.name}</span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(j.openedAt).toLocaleDateString("vi-VN")}
            </span>
            <span>HC: <span className="text-zinc-700">{j.headcount} người</span></span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black text-zinc-900">{j.candidates}</p>
          <p className="text-[9px] font-bold text-zinc-400 uppercase">ứng viên</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-50">
        <div>
          <div className="flex justify-between text-[10px] font-bold mb-1.5">
            <span className="text-zinc-500 uppercase">Tiến độ fill</span>
            <span className="text-zinc-900">{j.filled}/{j.headcount}</span>
          </div>
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full", fillPct >= 100 ? "bg-emerald-500" : "bg-blue-400")}
              style={{ width: `${Math.min(fillPct, 100)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-bold mb-1.5">
            <span className="text-zinc-500 uppercase">Tỷ lệ offer</span>
            <span className="text-zinc-900">{Math.round((j.filled / Math.max(j.candidates, 1)) * 100)}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${(j.filled / Math.max(j.candidates, 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ //
// Kanban mini card                                                     //
// ------------------------------------------------------------------ //
function KanbanCard({ job: j, stageBadge }: { job: JobReq; stageBadge: string }) {
  const dept = DEPT_BY_ID[j.departmentId];
  const fillPct = Math.round((j.filled / Math.max(j.headcount, 1)) * 100);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 cursor-pointer hover:shadow-md transition-all group">
      <p className="text-xs font-black text-zinc-900 leading-snug mb-2 group-hover:text-[#1b5e20] transition-colors">
        {j.title}
      </p>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-zinc-400">{dept?.name}</span>
        <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-black uppercase border", stageBadge)}>
          {j.level}
        </span>
      </div>
      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 mb-2">
        <span className="flex items-center gap-1">
          <Users className="size-3" /> {j.candidates} ứng viên
        </span>
        <span>{j.filled}/{j.headcount} filled</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", fillPct >= 100 ? "bg-emerald-400" : "bg-blue-400")}
          style={{ width: `${Math.min(fillPct, 100)}%` }}
        />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-20 text-center">
      <Briefcase className="size-12 text-zinc-200 mx-auto mb-4" />
      <p className="text-sm font-black text-zinc-400">Không có job nào phù hợp.</p>
    </div>
  );
}
