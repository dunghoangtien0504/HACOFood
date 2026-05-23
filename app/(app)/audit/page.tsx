"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, Search, Filter } from "lucide-react";
import { listAuditLog, EMP_BY_ID, useHACOUpdate } from "@/lib/queries";
import { useRoleGuard } from "@/lib/auth/useRoleGuard";

const ACTION_COLOR: Record<string, string> = {
  create: "bg-emerald-50 text-emerald-700",
  update: "bg-blue-50 text-blue-700",
  approve: "bg-purple-50 text-purple-700",
  reject: "bg-rose-50 text-rose-700",
  delete: "bg-rose-50 text-rose-700",
  request: "bg-amber-50 text-amber-700",
};

export default function AuditPage() {
  const { allowed, loading } = useRoleGuard(["ceo", "cfo", "auditor"]);
  useHACOUpdate();
  if (loading || !allowed) return null;
  const all = listAuditLog();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const filtered = all.filter((a) => {
    if (actionFilter !== "all" && a.action !== actionFilter) return false;
    if (search && !a.summary.toLowerCase().includes(search.toLowerCase()) && !a.entity.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const actions = Array.from(new Set(all.map((a) => a.action)));

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-3"><ShieldCheck className="size-6" /> Audit Log</h1>
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">{all.length} sự kiện · truy vết toàn hệ thống</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="size-4 text-zinc-400" />
        <button onClick={() => setActionFilter("all")} className={cn("px-3 py-1.5 rounded-full text-xs font-bold border", actionFilter === "all" ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-600")}>Tất cả</button>
        {actions.map((a) => (
          <button key={a} onClick={() => setActionFilter(a)} className={cn("px-3 py-1.5 rounded-full text-xs font-bold border capitalize", actionFilter === a ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-600")}>{a}</button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm sự kiện..." className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-xs outline-none w-56" />
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
        <div className="space-y-3">
          {filtered.map((a) => {
            const actor = EMP_BY_ID[a.actorId];
            return (
              <div key={a.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50">
                <div className="size-10 rounded-lg bg-zinc-900 text-white text-[11px] font-black flex items-center justify-center shrink-0">{actor?.avatarInitials ?? "?"}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-zinc-900">{actor?.fullName ?? a.actorId}</span>
                    <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase", ACTION_COLOR[a.action] ?? "bg-zinc-100 text-zinc-600")}>{a.action}</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">{a.entity}</span>
                    <span className="text-[10px] font-mono text-zinc-300">{a.entityId}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">{a.summary}</p>
                </div>
                <p className="text-[10px] text-zinc-400 shrink-0">{new Date(a.createdAt).toLocaleString("vi-VN")}</p>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="text-center text-xs text-zinc-400 py-8 italic">Không có sự kiện nào.</p>}
        </div>
      </div>
    </div>
  );
}
