"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FileText, Download, Search, Filter, Calendar, Loader2, CheckCircle2, Clock } from "lucide-react";
import { listReports, EMP_BY_ID, DEPT_BY_ID, useHACOUpdate } from "@/lib/queries";

const CAT_LABEL: Record<string, string> = {
  weekly: "Tuần", monthly: "Tháng", quarterly: "Quý", ad_hoc: "Đột xuất",
};
const FORMAT_COLOR: Record<string, string> = {
  PDF: "bg-rose-50 text-rose-600",
  Excel: "bg-emerald-50 text-emerald-600",
  Dashboard: "bg-blue-50 text-blue-600",
};

export default function ReportsPage() {
  useHACOUpdate();
  const all = listReports();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");

  const filtered = all.filter((r) => {
    if (catFilter !== "all" && r.category !== catFilter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-3"><FileText className="size-6" /> Trung tâm báo cáo</h1>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">{all.length} báo cáo · {all.filter((r) => r.status === "ready").length} sẵn sàng</p>
        </div>
        <button className="bg-[#1b5e20] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-[#1b5e20]/20 flex items-center gap-2"><Calendar className="size-3" /> Lên lịch tự động</button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="size-4 text-zinc-400" />
        {["all", "weekly", "monthly", "quarterly", "ad_hoc"].map((s) => (
          <button key={s} onClick={() => setCatFilter(s)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-bold border capitalize",
              catFilter === s ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-600")}>
            {s === "all" ? "Tất cả" : CAT_LABEL[s] ?? s}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm báo cáo..." className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-xs outline-none w-56" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => {
          const owner = EMP_BY_ID[r.ownerId];
          const dept = r.departmentId === "company" ? "Toàn công ty" : DEPT_BY_ID[r.departmentId as Exclude<typeof r.departmentId, "company">]?.name;
          return (
            <div key={r.id} className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase", FORMAT_COLOR[r.format])}>{r.format}</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">{CAT_LABEL[r.category]}</span>
                {r.status === "ready" ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500 ml-auto" />
                ) : r.status === "generating" ? (
                  <Loader2 className="size-3.5 text-blue-500 animate-spin ml-auto" />
                ) : (
                  <Clock className="size-3.5 text-zinc-400 ml-auto" />
                )}
              </div>
              <h3 className="text-sm font-black text-zinc-900 leading-snug mb-2">{r.title}</h3>
              <p className="text-[10px] text-zinc-500 mb-3">{dept} · {r.period}</p>
              <div className="flex items-center justify-between pt-3 border-t border-zinc-50">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center">{owner?.avatarInitials}</div>
                  <p className="text-[10px] font-bold text-zinc-700 truncate max-w-[100px]">{owner?.fullName}</p>
                </div>
                <button disabled={r.status !== "ready"} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1",
                  r.status === "ready" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400")}>
                  <Download className="size-3" /> Tải về
                </button>
              </div>
              <p className="text-[9px] text-zinc-400 mt-2">Tạo: {new Date(r.generatedAt).toLocaleString("vi-VN")}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
