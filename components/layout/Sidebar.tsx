"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_GROUPS, filterGroupsByRole } from "@/lib/nav";
import { ChevronRight, PanelLeftClose, PanelLeftOpen, Bot, Sparkles, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useDemoSession, ROLE_LABELS, ROLE_COLORS } from "@/lib/auth/demoSession";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useLocalStorage("sidebar-collapsed", false);
  const [openGroups, setOpenGroups] = useLocalStorage<string[]>(
    "sidebar-open-groups",
    NAV_GROUPS.filter((g) => g.defaultOpen).map((g) => g.id)
  );

  const { user, logout } = useDemoSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Filter nav groups based on current user's role
  const filteredGroups = mounted ? filterGroupsByRole(NAV_GROUPS, user.role) : NAV_GROUPS;

  if (!mounted) {
    return (
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-zinc-100 bg-[#f8fafc] transition-all duration-500 ease-in-out",
          "w-[280px]"
        )}
      />
    );
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-zinc-100 bg-[#f8fafc] transition-all duration-500 ease-in-out",
        "md:translate-x-0 -translate-x-full overflow-y-auto custom-scrollbar flex flex-col shadow-sm",
        collapsed ? "w-[88px]" : "w-[280px]"
      )}
    >
      {/* Brand */}
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

      {/* Current user chip */}
      {!collapsed && (
        <div className="mx-4 mt-4 p-3 bg-white border border-zinc-100 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-zinc-900 text-white text-[10px] font-black flex items-center justify-center shrink-0">
              {user.avatarInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-zinc-900 truncate">{user.fullName}</p>
              <span className={cn("inline-block px-1.5 py-0.5 rounded text-[8px] font-black mt-0.5", ROLE_COLORS[user.role])}>
                {ROLE_LABELS[user.role]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav Groups — filtered by role */}
      <nav className="p-4 space-y-6 flex-1 mt-3">
        {filteredGroups.map((group) => (
          <div key={group.id} className="space-y-1">
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors group"
              >
                {group.label}
                <ChevronRight
                  className={cn(
                    "size-3 transition-transform text-zinc-300 group-hover:text-zinc-600",
                    openGroups.includes(group.id) && "rotate-90"
                  )}
                />
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
                        "flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-black transition-all duration-200 group relative",
                        isActive
                          ? "bg-white text-[#1b5e20] shadow-md border border-zinc-100"
                          : "text-zinc-400 hover:bg-white hover:text-zinc-900 hover:shadow-sm"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-transform group-hover:scale-110",
                          isActive ? "text-[#1b5e20]" : "text-zinc-300 group-hover:text-zinc-900"
                        )}
                      />
                      {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                      {isActive && (
                        <div className="absolute left-1.5 top-3 bottom-3 w-0.5 bg-[#1b5e20] rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-50 space-y-3 bg-white/50 backdrop-blur-sm">
        {/* AI COO banner */}
        {!collapsed && (
          <div className="p-4 bg-zinc-900 rounded-[1.5rem] relative overflow-hidden group shadow-xl">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-8 rounded-xl bg-[#1b5e20] flex items-center justify-center text-white shrink-0">
                  <Bot className="size-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">AI COO</p>
                  <p className="text-[11px] font-black text-white">Briefing sẵn sàng</p>
                </div>
              </div>
              <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-[9px] font-black text-white uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                <Sparkles className="size-3 text-amber-400" /> Phân tích dữ liệu
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 size-28 bg-[#1b5e20]/20 rounded-full blur-xl" />
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-black text-zinc-400 hover:bg-white hover:text-zinc-900 hover:shadow-sm transition-all"
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          {!collapsed && <span className="uppercase tracking-widest text-[10px]">Thu gọn</span>}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-black text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
        >
          <LogOut className="size-4" />
          {!collapsed && <span className="uppercase tracking-widest text-[10px]">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
