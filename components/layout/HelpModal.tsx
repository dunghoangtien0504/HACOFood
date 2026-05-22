"use client";

import { useState } from "react";
import { 
  X, 
  LayoutGrid, 
  ChevronRight, 
  Lightbulb, 
  Settings, 
  Target, 
  Zap, 
  Users,
  ExternalLink,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HelpModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"admin" | "employee">("admin");
  const pathname = usePathname();

  if (!isOpen) return null;

  // Content Detection
  const isGuidePage = pathname === "/guide";

  const content = isGuidePage ? {
    title: "Hướng dẫn",
    summary: "Triết lý HACO Food OS + workflow end-to-end + link tới 19 màn hình chi tiết.",
    admin: [
      "Đọc workflow 'Setup công ty lần đầu' trước khi onboard team.",
      "Chia sẻ trang guide cho nhân viên mới.",
      "Icon '?' ở mỗi trang mở drawer hướng dẫn — khuyến khích user dùng."
    ],
    employee: [
      "Đọc 'Triết lý HACO Food OS' để hiểu chuỗi: Task → KPI → Finance.",
      "Bấm 'Xem hướng dẫn' ở từng màn hình để có mẹo cụ thể."
    ]
  } : {
    title: "Dashboard",
    summary: "Ảnh chụp công ty trong 30 giây — 6 KPI chính, donut KPI tổng, trend 12 tháng.",
    admin: [
      "Chọn cột KPI công ty muốn hiển thị ở Settings → KPI formula (REV/GP/NP/Ret...).",
      "Cấu hình ngưỡng màu: xanh ≥100%, vàng 85-99%, đỏ <85% ở Settings → Rules.",
      "Kiểm tra 3 insight card AI — nếu sai narrative, cập nhật weight ở KPI Tree.",
      "Check phòng ban đỏ/vàng → giao việc qua /approvals hoặc /operations."
    ],
    employee: [
      "Đọc 6 KPI card đầu trang — sparkline cho biết xu hướng 6-12 tháng.",
      "Donut ở giữa = tỷ lệ hoàn thành KPI công ty. Bấm vào để sang KPI Tree.",
      "Panel trái: KPI đang ở mức đỏ/vàng bạn cần chú ý.",
      "Panel phải: trend doanh thu — so sánh với target chấm đứt nét."
    ]
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end">
      {/* Overlay */}
      <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Modal - Slide in from right */}
      <div className="relative w-full max-w-lg h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100">
           <h2 className="text-xl font-black text-zinc-900 tracking-tight">{content.title}</h2>
           <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <X className="size-5 text-zinc-400" />
           </button>
        </div>

        <div className="p-8 space-y-8">
           {/* Brief Summary */}
           <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <div className="size-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                 {isGuidePage ? <HelpCircle className="size-6" /> : <LayoutGrid className="size-6" />}
              </div>
              <div>
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Tóm tắt</p>
                 <p className="text-sm font-bold text-zinc-700 leading-relaxed">
                    {content.summary}
                 </p>
              </div>
           </div>

           {/* Tabs */}
           <div className="flex border-b border-zinc-100">
              <button 
                onClick={() => setActiveTab("admin")}
                className={cn(
                  "px-6 py-3 text-sm font-black transition-all relative",
                  activeTab === "admin" ? "text-blue-600" : "text-zinc-400"
                )}
              >
                Quản trị viên
                {activeTab === "admin" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
              </button>
              <button 
                onClick={() => setActiveTab("employee")}
                className={cn(
                  "px-6 py-3 text-sm font-black transition-all relative",
                  activeTab === "employee" ? "text-blue-600" : "text-zinc-400"
                )}
              >
                Nhân viên
                {activeTab === "employee" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
              </button>
           </div>

           {/* Steps Content */}
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">CÁC BƯỚC</p>
              
              <div className="space-y-6">
                 {(activeTab === "admin" ? content.admin : content.employee).map((step, i) => (
                   <div key={i} className="flex gap-4 group">
                      <div className="size-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black shrink-0 border border-blue-100">
                         {i + 1}
                      </div>
                      <p className="text-sm font-bold text-zinc-600 leading-relaxed group-hover:text-zinc-900 transition-colors">{step}</p>
                   </div>
                 ))}
              </div>
           </div>

           {!isGuidePage && (
             <div className="bg-zinc-50 rounded-[2rem] p-8 space-y-4">
                <div className="flex items-center gap-2">
                   <Lightbulb className="size-4 text-amber-500" />
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">MẸO NHANH</p>
                </div>
                <ul className="space-y-3">
                   <li className="flex items-start gap-3">
                      <div className="size-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <p className="text-sm font-bold text-zinc-600">Mở /dashboard mỗi sáng 9h là thói quen tốt.</p>
                   </li>
                   <li className="flex items-start gap-3">
                      <div className="size-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <p className="text-sm font-bold text-zinc-600">Hover sparkline để xem giá trị từng tháng.</p>
                   </li>
                </ul>
             </div>
           )}

           {/* Footer */}
           <div className="flex items-center justify-between pt-8">
              <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-tight">
                {pathname}
              </div>
              {!isGuidePage && (
                <Link 
                  href="/guide" 
                  onClick={onClose}
                  className="flex items-center gap-2 text-blue-600 text-sm font-black hover:translate-x-1 transition-transform"
                >
                   Xem hướng dẫn tổng <ExternalLink className="size-4" />
                </Link>
              )}
              {isGuidePage && (
                 <button 
                  onClick={onClose}
                  className="flex items-center gap-2 text-blue-600 text-sm font-black hover:translate-x-1 transition-transform"
                 >
                    Xem hướng dẫn tổng <ExternalLink className="size-4" />
                 </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
