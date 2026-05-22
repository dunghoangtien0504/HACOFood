"use client";

import { 
  Bell, 
  Search, 
  User, 
  Calendar, 
  HelpCircle, 
  ChevronDown,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

import GlobalSearch from "@/components/search/GlobalSearch";
import HelpModal from "./HelpModal";

export function Topbar() {
  const [lang, setLang] = useState("VI");
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("Tháng 04/2026");
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsSearchOpen(true);
    }
  };

  const months = [
    "Tháng 04/2026", "Tháng 03/2026", "Tháng 02/2026", "Tháng 01/2026",
    "Tháng 12/2025", "Tháng 11/2025", "Tháng 10/2025", "Tháng 09/2025",
    "Tháng 08/2025", "Tháng 07/2025", "Tháng 06/2025", "Tháng 05/2025",
  ];

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-zinc-100 bg-white px-8">
      {/* Search Bar - High Density */}
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 size-4 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#1b5e20] transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm nhân sự, KPI, phòng ban, task..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-12 w-full rounded-2xl bg-[#f8fafc] pl-14 pr-6 text-sm font-bold text-zinc-600 border border-transparent focus:bg-white focus:border-[#1b5e20]/20 focus:ring-8 focus:ring-[#1b5e20]/5 transition-all outline-none"
          />
        </div>
      </div>

      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        initialQuery={searchQuery} 
      />

      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />

      {/* Right Controls */}
      <div className="flex items-center gap-6">
        {/* Date Selector Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsMonthOpen(!isMonthOpen)}
            className="hidden lg:flex items-center gap-3 px-4 py-2.5 bg-[#f8fafc] rounded-2xl border border-transparent hover:border-zinc-100 transition-all group"
          >
            <Calendar className="size-4 text-zinc-400 group-hover:text-[#1b5e20]" />
            <span className="text-[13px] font-black text-zinc-600">{selectedMonth}</span>
            <ChevronDown className={cn("size-3 text-zinc-300 transition-transform", isMonthOpen && "rotate-180")} />
          </button>

          {isMonthOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsMonthOpen(false)} />
              <div className="absolute top-full mt-2 right-0 w-64 bg-white/80 backdrop-blur-xl border border-zinc-100 rounded-[2rem] shadow-2xl z-20 p-4 max-h-[400px] overflow-y-auto custom-scrollbar animate-fade-in">
                 <p className="px-4 py-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-50 mb-2">Lịch sử 12 tháng</p>
                 <div className="space-y-1">
                    {months.map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setSelectedMonth(m);
                          setIsMonthOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all",
                          selectedMonth === m 
                            ? "bg-[#1b5e20] text-white shadow-lg" 
                            : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                 </div>
              </div>
            </>
          )}
        </div>

        {/* Help Link */}
        <button 
          onClick={() => setIsHelpOpen(true)}
          className="hidden xl:flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors"
        >
           <HelpCircle className="size-5" />
           <span className="text-[13px] font-black">Hướng dẫn</span>
        </button>

        {/* Language Switcher */}
        <div className="flex items-center p-1 bg-[#f8fafc] rounded-xl border border-zinc-50">
           <button 
             onClick={() => setLang("VI")}
             className={cn(
               "px-3 py-1.5 rounded-lg text-[10px] font-black transition-all",
               lang === "VI" ? "bg-white text-[#1b5e20] shadow-sm" : "text-zinc-400"
             )}
           >
             VI
           </button>
           <button 
             onClick={() => setLang("EN")}
             className={cn(
               "px-3 py-1.5 rounded-lg text-[10px] font-black transition-all",
               lang === "EN" ? "bg-white text-[#1b5e20] shadow-sm" : "text-zinc-400"
             )}
           >
             EN
           </button>
        </div>

        {/* Notifications */}
        <button className="relative size-10 rounded-2xl bg-[#f8fafc] flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all border border-transparent hover:border-zinc-100">
           <Bell className="size-5" />
           <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-rose-500 border-2 border-white" />
        </button>

        {/* Vertical Divider */}
        <div className="h-10 w-px bg-zinc-50" />

        {/* User Profile */}
        <div className="flex items-center gap-3 group cursor-pointer ml-4">
           <div className="size-11 rounded-full bg-[#1b5e20] flex items-center justify-center text-white font-black shadow-lg shadow-[#1b5e20]/10 transition-transform group-hover:scale-105">
              NH
           </div>
           <div className="hidden sm:flex flex-col">
              <span className="text-[14px] font-bold text-zinc-900 leading-tight">ha.nguyen@hacofood.vn</span>
              <span className="text-[11px] font-bold text-[#1b5e20] uppercase tracking-tight">CEO · Bếp Cô Hạ</span>
           </div>
        </div>
      </div>
    </header>
  );
}
