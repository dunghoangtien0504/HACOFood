"use client";

import { useState } from "react";
import { cn, formatCompactVND } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, Filter, Search, Plus } from "lucide-react";
import { listApprovals, approvalsSummary, EMP_BY_ID, DEPT_BY_ID } from "@/lib/queries";

const KIND_LABEL: Record<string, string> = {
  bonus: "Bonus", budget: "Ngân sách", hire: "Tuyển dụng", purchase: "Mua sắm", expense: "Chi phí",
};

export default function ApprovalsPage() {
  const all = listApprovals();
  const sum = approvalsSummary();
  const [filter, setFilter] = useState<string>("pending");
  const [search, setSearch] = useState("");

  const filtered = all.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">Trung tâm phê duyệt</h1>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">{sum.pending} pending · giá trị {formatCompactVND(sum.pendingValue)}</p>
        </div>
        <button className="bg-[#1b5e20] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-[#1b5e20]/20 flex items-center gap-2"><Plus className="size-3" /> Tạo yêu cầu</button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { l: "Chờ duyệt", v: sum.pending, color: "text-amber-600" },
          { l: "Giá trị chờ", v: formatCompactVND(sum.pendingValue), color: "text-zinc-900" },
          { l: "Đã duyệt", v: sum.approved30d, color: "text-emerald-600" },
          { l: "Bị từ chối", v: sum.rejected30d, color: "text-rose-600" },
        ].map((s) => (
          <div key={s.l} className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{s.l}</p>
            <p className={cn("text-xl font-black mt-1", s.color)}>{typeof s.v === "number" ? s.v : s.v}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="size-4 text-zinc-400" />
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-bold border capitalize",
              filter === s ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-600")}>{s}</button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm yêu cầu..." className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-xs outline-none w-56" />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((a) => {
          const requester = EMP_BY_ID[a.requesterId];
          const approver = EMP_BY_ID[a.approverId];
          const dept = DEPT_BY_ID[a.departmentId];
          return (
            <div key={a.id} className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-black uppercase">{KIND_LABEL[a.kind]}</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">{dept?.name}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase",
                      a.status === "approved" ? "bg-emerald-50 text-emerald-600"
                        : a.status === "rejected" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600")}>{a.status}</span>
                  </div>
                  <h3 className="text-sm font-black text-zinc-900">{a.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{a.note}</p>
                  <div className="flex items-center gap-6 mt-3 text-[10px] font-bold text-zinc-400">
                    <span>Requester: <span className="text-zinc-700">{requester?.fullName}</span></span>
                    <span>Approver: <span className="text-zinc-700">{approver?.fullName}</span></span>
                    <span>Created: {new Date(a.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {a.amount > 0 && (
                    <p className="text-lg font-black text-zinc-900">{formatCompactVND(a.amount)}</p>
                  )}
                  {a.status === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> Duyệt
                      </button>
                      <button className="px-3 py-1.5 bg-rose-100 text-rose-600 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                        <XCircle className="size-3" /> Từ chối
                      </button>
                    </div>
                  )}
                  {a.status !== "pending" && a.decidedAt && (
                    <p className="text-[10px] text-zinc-400 mt-2 flex items-center gap-1 justify-end">
                      <Clock className="size-3" /> {new Date(a.decidedAt).toLocaleDateString("vi-VN")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-xs text-zinc-400 py-8 italic">Không có yêu cầu nào.</p>}
      </div>
    </div>
  );
}
