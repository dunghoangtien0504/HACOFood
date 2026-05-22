"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/lib/nav";
import { ChevronRight, PanelLeftClose, PanelLeftOpen, Bot, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";

export function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useLocalStorage("sidebar-collapsed", false);
  const [openGroups, setOpenGroups] = useLocalStorage<string[]>(
    "sidebar-open-groups",
    NAV_GROUPS.filter(g => g.defaultOpen).map(g => g.id)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  if (!mounted) return (
    <aside className={cn("fixed left-0 top-0 z-40 h-screen border-r border-zinc-100 bg-[#f8fafc] transition-all duration-500 ease-in-out", collapsed ? "w-[88px]" : "w-[280px]")} />
  );

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen border-r border-zinc-100 bg-[#f8fafc] transition-all duration-500 ease-in-out md:translate-x-0 -translate-x-full overflow-y-auto custom-scrollbar flex flex-col shadow-sm",
      collapsed ? "w-[88px]" : "w-[280px]"
    )}>
      {/* Brand - High Density */}
      <div className="flex h-20 items-center px-6 border-b border-zinc-50 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-4 overflow-hidden group">
          <div className="size-10 rounded-2xl bg-[#1b5e20] flex items-center justify-center font-black text-white text-sm shadow-xl shadow-[#1b5e20]/20 shrink-0 group-hover:scale-105 transition-transform">
            HC
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[13px] font-black tracking-tight text-zinc-900 whitespace-nowrap uppercase">Bếp Cô Hạ OS</span>
              <span className="text-[9px] font-black text-[#1b5e20] uppercase tracking-widest leading-none">Enterprise v2.1</span>
            </div>
          )}
        </Link>
      </div>

      {/* Nav Groups */}
      <nav className="p-4 space-y-8 flex-1 mt-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.id} className="space-y-2">
            {!collapsed && (
              <button 
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors group"
              >
                {group.label}
                <ChevronRight className={cn("size-3 transition-transform text-zinc-300 group-hover:text-zinc-600", openGroups.includes(group.id) && "rotate-90")} />
              </button>
            )}
            
            {(openGroups.includes(group.id) || collapsed) && (
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : ""}
                      className={cn(
                        "flex items-center gap-4 rounded-2xl px-4 py-3 text-xs font-black transition-all duration-300 group relative",
                        isActive 
                          ? "bg-white text-[#1b5e20] shadow-md border border-zinc-100" 
                          : "text-zinc-400 hover:bg-white hover:text-zinc-900 hover:shadow-sm"
                      )}
                    >
                      <Icon className={cn("size-4.5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-[#1b5e20]" : "text-zinc-300 group-hover:text-zinc-900")} />
                      {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                      {isActive && <div className="absolute left-1.5 top-3 bottom-3 w-1 bg-[#1b5e20] rounded-full" />}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer Controls - Premium Glassmorphism */}
      <div className="p-4 border-t border-zinc-50 space-y-4 bg-white/50 backdrop-blur-sm">
        {!collapsed && (
          <div className="p-4 bg-zinc-900 rounded-[2rem] mb-2 relative overflow-hidden group shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                 <div className="size-8 rounded-xl bg-[#1b5e20] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#1b5e20]/20">
                    <Bot className="size-4" />
                 </div>
                 <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none mb-1">AI COO</p>
                    <p className="text-[11px] font-black text-white whitespace-nowrap">Briefing đang sẵn sàng</p>
                 </div>
              </div>
              <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-[10px] font-black text-white uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                 <Sparkles className="size-3 text-amber-400" /> Phân tích dữ liệu
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 size-32 bg-[#1b5e20]/20 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-xs font-black text-zinc-400 hover:bg-white hover:text-zinc-900 hover:shadow-sm transition-all group"
        >
          {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          {!collapsed && <span className="uppercase tracking-widest text-[10px]">Thu gọn Menu</span>}
        </button>
      </div>
    </aside>
  );
}
