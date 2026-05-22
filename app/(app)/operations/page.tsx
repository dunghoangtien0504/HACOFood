"use client";

import { useState, useMemo } from "react";
import { cn, formatPercent } from "@/lib/utils";
import { Search, Plus, LayoutGrid, Filter, Brain, Sparkles, History } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  listTasks, operationsSummary, listProjects,
  EMP_BY_ID, KPI_BY_ID, DEPT_BY_ID,
} from "@/lib/queries";

const TABS = ["Tất cả", "Đang chạy", "Quá hạn", "Hoàn thành", "Bị block"];

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useLocalStorage("ops-active-tab", "Tất cả");
  const [search, setSearch] = useState("");

  const allTasks = listTasks();
  const ops = operationsSummary();
  const projects = listProjects();

  const filtered = useMemo(() => {
    let xs = allTasks;
    if (activeTab === "Đang chạy") xs = xs.filter((t) => t.status === "in_progress");
    else if (activeTab === "Quá hạn") xs = xs.filter((t) => t.status !== "done" && new Date(t.dueDate) < new Date());
    else if (activeTab === "Hoàn thành") xs = xs.filter((t) => t.status === "done");
    else if (activeTab === "Bị block") xs = xs.filter((t) => t.status === "blocked");
    if (search) {
      const s = search.toLowerCase();
      xs = xs.filter((t) => t.title.toLowerCase().includes(s) || t.description.toLowerCase().includes(s));
    }
    return xs;
  }, [allTasks, activeTab, search]);

  const taskStats = [
    { label: "Tổng công việc", val: String(ops.total), tVal: `${ops.byType.urgent} urgent`, color: "text-zinc-900" },
    { label: "Đang thực hiện", val: String(ops.inProgress), tVal: formatPercent((ops.inProgress / ops.total) * 100, 0), color: "text-blue-600" },
    { label: "Hoàn thành", val: String(ops.done), tVal: formatPercent((ops.done / ops.total) * 100, 0), color: "text-emerald-600" },
    { label: "Quá hạn", val: String(ops.overdue), tVal: ops.overdue > 0 ? "cần xử lý" : "OK", color: ops.overdue > 0 ? "text-rose-600" : "text-emerald-600" },
    { label: "% gắn KPI", val: formatPercent(ops.linkedToKpiPct * 100, 0), tVal: "task↔KPI", color: "text-[#1b5e20]" },
  ];

  const weeklyPerf = [
    { n: "T2", t: 65, l: 60 }, { n: "T3", t: 75, l: 65 }, { n: "T4", t: 70, l: 72 },
    { n: "T5", t: 85, l: 70 }, { n: "T6", t: 90, l: 75 }, { n: "T7", t: 88, l: 78 }, { n: "CN", t: 92, l: 80 },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden flex items-center justify-between border border-white/10">
        <div className="flex items-center gap-6 relative z-10">
          <div className="size-16 rounded-2xl bg-[#1b5e20] flex items-center justify-center shadow-lg shadow-[#1b5e20]/20">
            <Brain className="size-8 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-widest flex items-center gap-2">AI Work Auditor <Sparkles className="size-4 text-amber-400" /></h3>
            <p className="text-sm text-white/60 font-medium mt-1 leading-relaxed max-w-2xl">
              Quét sáng nay: <span className="text-rose-400 font-black">{ops.overdue} task quá hạn</span> ·
              <span className="text-amber-400 font-black"> {ops.blocked} task bị block</span> ·
              {Math.round(ops.linkedToKpiPct * 100)}% task đã gắn KPI rõ ràng. Đề xuất ưu tiên xử lý task urgent trước.
            </p>
          </div>
        </div>
        <button className="px-6 py-3 bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase relative z-10 flex items-center gap-2"><History className="size-4" /> Báo cáo</button>
      </div>

      <PageHeader title="Quản trị Vận hành" breadcrumbs={["Trang chủ", "Vận hành"]}
        actions={
          <div className="flex items-center gap-3">
            <button className="bg-white border border-zinc-200 px-4 py-2 rounded-lg font-bold text-xs text-zinc-600 flex items-center gap-2"><LayoutGrid className="size-3" /> Kanban</button>
            <button className="bg-[#1b5e20] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-[#1b5e20]/20 flex items-center gap-2"><Plus className="size-3" /> Tạo công việc</button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-5">
        {taskStats.map((s, idx) => (
          <div key={idx} className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{s.label}</p>
            <div className="flex items-end justify-between">
              <h3 className={cn("text-lg font-black", s.color)}>{s.val}</h3>
              <p className="text-[8px] font-bold text-zinc-400">{s.tVal}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex gap-6">
                {TABS.map((t) => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={cn("text-xs font-black transition-all pb-2 border-b-2",
                      activeTab === t ? "border-[#1b5e20] text-zinc-900" : "border-transparent text-zinc-400")}>{t}</button>
                ))}
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm..." className="pl-9 pr-4 py-1.5 bg-zinc-50 border border-zinc-100 rounded-xl text-xs outline-none w-48" />
                </div>
                <button className="p-2 bg-zinc-50 border border-zinc-100 rounded-xl text-zinc-400"><Filter className="size-4" /></button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-400 font-bold border-b border-zinc-50 uppercase tracking-widest">
                    <th className="pb-4">Công việc</th>
                    <th className="pb-4">Phòng / KPI</th>
                    <th className="pb-4">Người nhận</th>
                    <th className="pb-4 text-center">Ưu tiên</th>
                    <th className="pb-4 text-center">Hạn</th>
                    <th className="pb-4 text-center">Tiến độ</th>
                    <th className="pb-4 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filtered.map((t) => {
                    const assignee = EMP_BY_ID[t.assigneeId];
                    const dept = DEPT_BY_ID[t.departmentId];
                    const kpi = t.linkedKpiId ? KPI_BY_ID[t.linkedKpiId] : null;
                    const overdue = t.status !== "done" && new Date(t.dueDate) < new Date();
                    return (
                      <tr key={t.id} className="hover:bg-zinc-50/50">
                        <td className="py-5 font-black text-zinc-900 max-w-xs">
                          <p className="truncate">{t.title}</p>
                          <p className="text-[10px] font-medium text-zinc-400 truncate mt-0.5">{t.description}</p>
                        </td>
                        <td className="py-5">
                          <p className="text-[11px] font-bold text-zinc-700">{dept?.name}</p>
                          {kpi ? <p className="text-[10px] font-bold text-emerald-600 mt-0.5">↗ {kpi.code}</p>
                            : <p className="text-[10px] text-zinc-300 italic mt-0.5">Chưa gắn KPI</p>}
                        </td>
                        <td className="py-5">
                          <div className="flex items-center gap-2">
                            <div className="size-7 rounded-lg bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center">{assignee?.avatarInitials}</div>
                            <span className="text-[11px] font-bold text-zinc-700 truncate max-w-[100px]">{assignee?.fullName.split(" ").slice(-2).join(" ")}</span>
                          </div>
                        </td>
                        <td className="py-5 text-center">
                          <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase border",
                            t.priority === "urgent" ? "bg-rose-50 text-rose-500 border-rose-100"
                              : t.priority === "high" ? "bg-amber-50 text-amber-500 border-amber-100"
                                : t.priority === "normal" ? "bg-blue-50 text-blue-500 border-blue-100"
                                  : "bg-zinc-50 text-zinc-500 border-zinc-100")}>{t.priority}</span>
                        </td>
                        <td className={cn("py-5 text-center font-bold", overdue ? "text-rose-500" : "text-zinc-500")}>
                          {new Date(t.dueDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                        </td>
                        <td className="py-5 w-32 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1 flex-1 bg-zinc-100 rounded-full overflow-hidden">
                              <div className={cn("h-full",
                                t.status === "done" ? "bg-emerald-500" : t.status === "blocked" ? "bg-rose-500" : "bg-[#1b5e20]")}
                                style={{ width: `${t.progress}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-zinc-400 w-8">{t.progress}%</span>
                          </div>
                        </td>
                        <td className="py-5 text-center">
                          <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tight",
                            t.status === "done" ? "bg-emerald-50 text-emerald-600"
                              : t.status === "blocked" ? "bg-rose-50 text-rose-600"
                                : t.status === "review" ? "bg-purple-50 text-purple-600"
                                  : t.status === "in_progress" ? "bg-blue-50 text-blue-600"
                                    : "bg-zinc-50 text-zinc-600")}>{t.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="text-center text-xs text-zinc-400 py-8 italic">Không có task khớp bộ lọc.</p>}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-8">Hiệu suất đội ngũ tuần</h3>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyPerf}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f4" />
                    <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis hide />
                    <Tooltip />
                    <Line type="monotone" dataKey="t" stroke="#1b5e20" strokeWidth={4} dot={{ r: 4, fill: "#1b5e20", strokeWidth: 2, stroke: "#fff" }} />
                    <Line type="monotone" dataKey="l" stroke="#e5e7eb" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-8">Tiến độ dự án trọng điểm</h3>
              <div className="space-y-6">
                {projects.slice(0, 5).map((p) => (
                  <div key={p.id} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase">
                      <span className="text-zinc-700 truncate pr-2">{p.name}</span>
                      <span className="text-zinc-900 shrink-0">{p.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-50 rounded-full overflow-hidden">
                      <div className={cn("h-full",
                        p.progress >= 80 ? "bg-emerald-500" : p.progress >= 50 ? "bg-amber-500" : "bg-blue-500")}
                        style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-6 shadow-sm">
            <h3 className="text-xs font-black text-zinc-900 uppercase tracking-tight mb-6">Phân loại task</h3>
            <div className="space-y-4">
              {[
                { l: "Growth", v: ops.byType.growth, color: "bg-blue-500" },
                { l: "Maintenance", v: ops.byType.maintenance, color: "bg-purple-500" },
                { l: "Admin", v: ops.byType.admin, color: "bg-amber-500" },
                { l: "Urgent", v: ops.byType.urgent, color: "bg-rose-500" },
              ].map((c) => (
                <div key={c.l} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-zinc-500">{c.l}</span>
                    <span className="text-zinc-900">{c.v}/{ops.total}</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-50 rounded-full overflow-hidden">
                    <div className={cn("h-full", c.color)} style={{ width: `${(c.v / Math.max(ops.total, 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-6 shadow-sm">
            <h3 className="text-xs font-black text-zinc-900 uppercase tracking-tight mb-6">Cảnh báo nhanh</h3>
            <div className="space-y-3 text-[11px]">
              <p className="flex justify-between"><span className="text-zinc-500">Quá hạn</span><span className="font-black text-rose-500">{ops.overdue}</span></p>
              <p className="flex justify-between"><span className="text-zinc-500">Bị block</span><span className="font-black text-amber-500">{ops.blocked}</span></p>
              <p className="flex justify-between"><span className="text-zinc-500">Đang review</span><span className="font-black text-purple-500">{allTasks.filter((t) => t.status === "review").length}</span></p>
              <p className="flex justify-between"><span className="text-zinc-500">Chưa gắn KPI</span><span className="font-black text-zinc-400">{allTasks.filter((t) => !t.linkedKpiId).length}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
