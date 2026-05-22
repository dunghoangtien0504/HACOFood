"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  User, 
  Target, 
  LayoutGrid, 
  Command, 
  ArrowRight,
  TrendingUp,
  Briefcase,
  FileText,
  X,
  Bot,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Mock Data for Search - High Density
const SEARCH_INDEX = [
  { id: 1, type: "page", label: "Dashboard tổng quan", href: "/dashboard", category: "Chức năng" },
  { id: 2, type: "page", label: "Cây KPI (KPI Tree)", href: "/kpi-tree", category: "Chức năng" },
  { id: 3, type: "page", label: "Sơ đồ tổ chức", href: "/org", category: "Chức năng" },
  { id: 4, type: "page", label: "Bảng lương & Thưởng", href: "/compensation", category: "Chức năng" },
  
  { id: 10, type: "people", label: "Nguyễn Văn A", sub: "CEO / Founder", category: "Nhân sự" },
  { id: 11, type: "people", label: "Lê Minh Tuấn", sub: "Trưởng phòng Sales", category: "Nhân sự" },
  { id: 12, type: "people", label: "Nguyễn Thu Hà", sub: "Trưởng phòng Marketing", category: "Nhân sự" },

  { id: 20, type: "kpi", label: "Lợi nhuận ròng (Net Profit)", sub: "Target: 1.2 tỷ", category: "Chỉ số KPI" },
  { id: 21, type: "kpi", label: "Tỷ lệ chuyển đổi", sub: "Target: 4.5%", category: "Chỉ số KPI" },
  { id: 22, type: "kpi", label: "Giá vốn hàng bán (COGS)", sub: "Target: <45%", category: "Chỉ số KPI" },
];

export default function GlobalSearch({ isOpen, onClose, initialQuery }: { isOpen: boolean, onClose: () => void, initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(SEARCH_INDEX);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      // Simple filter logic
      const filtered = SEARCH_INDEX.filter(item => 
        item.label.toLowerCase().includes(initialQuery.toLowerCase()) || 
        item.category.toLowerCase().includes(initialQuery.toLowerCase())
      );
      setResults(filtered);
    }
  }, [isOpen, initialQuery]);

  const handleSearch = (q: string) => {
    setQuery(q);
    const filtered = SEARCH_INDEX.filter(item => 
      item.label.toLowerCase().includes(q.toLowerCase()) || 
      item.category.toLowerCase().includes(q.toLowerCase())
    );
    setResults(filtered);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Overlay with Glassmorphism */}
      <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Search Modal - High Fidelity */}
      <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-2xl border border-white/20 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300">
        
        {/* Search Input Area */}
        <div className="flex items-center gap-4 px-8 py-6 border-b border-zinc-100">
           <Search className="size-6 text-[#1b5e20]" />
           <input 
             autoFocus
             type="text" 
             value={query}
             onChange={(e) => handleSearch(e.target.value)}
             placeholder="Tìm nhân sự, KPI, phòng ban, task..." 
             className="flex-1 bg-transparent border-none outline-none text-xl font-black text-zinc-900 placeholder:text-zinc-300"
           />
           <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-xl text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              ESC để đóng
           </div>
           <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <X className="size-5 text-zinc-400" />
           </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-6 space-y-8">
           {results.length > 0 ? (
             Object.entries(
               results.reduce((acc, item) => {
                 (acc[item.category] = acc[item.category] || []).push(item);
                 return acc;
               }, {} as any)
             ).map(([category, items]: [string, any]) => (
               <div key={category} className="space-y-4">
                  <h3 className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{category}</h3>
                  <div className="space-y-1">
                     {items.map((item: any) => (
                       <button 
                         key={item.id}
                         onClick={() => {
                           if (item.href) router.push(item.href);
                           onClose();
                         }}
                         className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 group transition-all"
                       >
                          <div className="flex items-center gap-4">
                             <div className="size-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-[#1b5e20]/10 group-hover:text-[#1b5e20] transition-all">
                                {item.type === 'page' && <LayoutGrid className="size-5" />}
                                {item.type === 'people' && <User className="size-5" />}
                                {item.type === 'kpi' && <Target className="size-5" />}
                             </div>
                             <div className="text-left">
                                <p className="text-sm font-black text-zinc-900">{item.label}</p>
                                {item.sub && <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">{item.sub}</p>}
                             </div>
                          </div>
                          <ArrowRight className="size-4 text-zinc-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                       </button>
                     ))}
                  </div>
               </div>
             ))
           ) : (
             <div className="py-20 text-center space-y-4">
                <div className="size-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mx-auto text-zinc-200">
                   <Search className="size-10" />
                </div>
                <div className="space-y-1">
                   <p className="text-sm font-black text-zinc-900">Không tìm thấy kết quả</p>
                   <p className="text-xs text-zinc-400 font-medium">Thử tìm kiếm với từ khóa khác hoặc danh mục khác</p>
                </div>
             </div>
           )}

           {/* AI Suggestion Section */}
           <div className="mt-8 p-6 bg-[#1b5e20] rounded-[2rem] text-white relative overflow-hidden group">
              <div className="relative z-10 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                       <Bot className="size-5 text-emerald-400" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none mb-1">AI Search Pro</p>
                       <p className="text-sm font-bold">Hỏi AI về bất kỳ dữ liệu nào trong doanh nghiệp</p>
                    </div>
                 </div>
                 <button className="px-4 py-2 bg-white text-[#1b5e20] rounded-xl text-[10px] font-black uppercase shadow-xl">Chat ngay</button>
              </div>
              <div className="absolute -right-10 -bottom-10 size-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-all" />
           </div>
        </div>

        {/* Footer with Shortcuts */}
        <div className="px-8 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
           <div className="flex gap-6">
              <div className="flex items-center gap-2"><div className="px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-[9px] font-black text-zinc-400 shadow-sm">↑↓</div> <span className="text-[9px] font-black text-zinc-400 uppercase">Di chuyển</span></div>
              <div className="flex items-center gap-2"><div className="px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-[9px] font-black text-zinc-400 shadow-sm">Enter</div> <span className="text-[9px] font-black text-zinc-400 uppercase">Chọn</span></div>
           </div>
           <div className="flex items-center gap-2 text-zinc-300">
              <Sparkles className="size-3" />
              <span className="text-[9px] font-black uppercase">Powered by HACO AI</span>
           </div>
        </div>
      </div>
    </div>
  );
}
