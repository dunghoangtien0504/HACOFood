"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BookOpen, Search, Filter, Plus, Eye, FileText, ChevronRight } from "lucide-react";
import { listSops, DEPT_BY_ID } from "@/lib/queries";

export default function KnowledgePage() {
  const all = listSops();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [activeId, setActiveId] = useState<string>(all[0].id);

  const categories = Array.from(new Set(all.map((s) => s.category)));
  const filtered = all.filter((s) => {
    if (catFilter !== "all" && s.category !== catFilter) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const active = all.find((s) => s.id === activeId)!;
  const activeDept = DEPT_BY_ID[active.departmentId];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-3"><BookOpen className="size-6" /> Knowledge / SOP / Playbook</h1>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">{all.length} tài liệu · {all.filter((s) => s.published).length} published</p>
        </div>
        <button className="bg-[#1b5e20] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-[#1b5e20]/20 flex items-center gap-2"><Plus className="size-3" /> Tạo SOP</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="size-4 text-zinc-400" />
            <button onClick={() => setCatFilter("all")} className={cn("px-3 py-1 rounded-full text-[10px] font-bold border", catFilter === "all" ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-600")}>Tất cả</button>
            {categories.map((c) => (
              <button key={c} onClick={() => setCatFilter(c)} className={cn("px-3 py-1 rounded-full text-[10px] font-bold border", catFilter === c ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-600")}>{c}</button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm SOP..." className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-xs outline-none" />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.map((s) => {
              const dept = DEPT_BY_ID[s.departmentId];
              return (
                <button key={s.id} onClick={() => setActiveId(s.id)}
                  className={cn("w-full text-left p-4 rounded-2xl border-2 transition-all",
                    activeId === s.id ? "border-zinc-900 bg-zinc-50" : "border-zinc-100 bg-white hover:border-zinc-300")}>
                  <div className="flex items-start gap-3">
                    <FileText className="size-4 text-zinc-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase">{s.category}</span>
                        {!s.published && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-[8px] font-black uppercase">Draft</span>}
                      </div>
                      <p className="text-xs font-black text-zinc-900 leading-snug">{s.title}</p>
                      <p className="text-[10px] text-zinc-400 mt-1">{dept?.name} · v{s.version} · {s.views} views</p>
                    </div>
                    <ChevronRight className="size-3 text-zinc-300" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-black uppercase">{active.category}</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">{activeDept?.name}</span>
              <span className="text-[10px] font-bold text-zinc-400">v{active.version}</span>
              {!active.published && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-black uppercase">Draft</span>}
            </div>
            <h2 className="text-2xl font-black text-zinc-900 mb-3">{active.title}</h2>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">{active.excerpt}</p>
            <div className="flex items-center gap-6 text-[11px] font-bold text-zinc-400 pt-4 border-t border-zinc-50">
              <span>Tác giả: <span className="text-zinc-700">{active.author}</span></span>
              <span>Cập nhật: <span className="text-zinc-700">{new Date(active.updatedAt).toLocaleDateString("vi-VN")}</span></span>
              <span className="flex items-center gap-1"><Eye className="size-3" /> {active.views} views</span>
            </div>
            <div className="mt-8 p-6 bg-zinc-50 rounded-2xl text-[12px] text-zinc-500 italic">
              [Nội dung chi tiết SOP — phần body sẽ render khi cắm Supabase / CMS]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
