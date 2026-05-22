"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { 
  Bell, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Zap, 
  Target, 
  Wallet,
  Settings,
  MoreVertical,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("Tất cả");

  const notifications = [
    { id: 1, type: "KPI", title: "Cảnh báo KPI hụt ngưỡng", desc: "KPI 'Tỷ lệ chốt Sales' đang ở mức 68% (Mục tiêu 85%).", time: "2 phút trước", unread: true, icon: <Target className="size-4" />, color: "bg-rose-50 text-rose-500" },
    { id: 2, type: "Finance", title: "Yêu cầu phê duyệt ngân sách", desc: "Marketing đề xuất 450 triệu cho chiến dịch T6.", time: "15 phút trước", unread: true, icon: <Wallet className="size-4" />, color: "bg-blue-50 text-blue-500" },
    { id: 3, type: "System", title: "Cập nhật AI Work Auditor", desc: "Đã quét xong 42 nhân sự. Phát hiện 3 rủi ro.", time: "1 giờ trước", unread: false, icon: <Zap className="size-4" />, color: "bg-zinc-900 text-[#4ade80]" },
    { id: 4, type: "HR", title: "Hồ sơ nhân sự mới", desc: "Hoàng Minh Đức đã hoàn thiện hồ sơ 360.", time: "2 giờ trước", unread: false, icon: <CheckCircle2 className="size-4" />, color: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader 
        title="Cảnh báo & Thông báo" 
        breadcrumbs={["Trang chủ", "Thông báo"]}
        actions={
          <div className="flex items-center gap-3">
            <button className="bg-white border border-zinc-200 px-4 py-2 rounded-lg font-bold text-xs text-zinc-600 flex items-center gap-2">
               <CheckCircle2 className="size-3" /> Đánh dấu đã đọc tất cả
            </button>
            <button className="bg-rose-50 border border-rose-100 px-4 py-2 rounded-lg font-bold text-xs text-rose-600 flex items-center gap-2">
               <Trash2 className="size-3" /> Xóa tất cả
            </button>
          </div>
        }
      />

      <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
         <div className="flex items-center justify-between mb-8">
            <div className="flex gap-6">
               {["Tất cả", "Chưa đọc", "KPI", "Tài chính", "Hệ thống"].map(t => (
                 <button 
                   key={t}
                   onClick={() => setActiveTab(t)}
                   className={cn(
                     "text-xs font-black transition-all pb-2 border-b-2",
                     activeTab === t ? "border-[#1b5e20] text-zinc-900" : "border-transparent text-zinc-400"
                   )}
                 >
                   {t}
                 </button>
               ))}
            </div>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
               <input type="text" placeholder="Tìm kiếm thông báo..." className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-xs outline-none w-64" />
            </div>
         </div>

         <div className="space-y-4">
            {notifications.map((n) => (
              <div key={n.id} className={cn(
                "p-6 rounded-3xl border transition-all flex items-start justify-between group cursor-pointer",
                n.unread ? "bg-white border-zinc-200 shadow-sm" : "bg-zinc-50 border-zinc-50 opacity-70"
              )}>
                 <div className="flex gap-4">
                    <div className={cn("size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", n.color)}>
                       {n.icon}
                    </div>
                    <div>
                       <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-sm font-black text-zinc-900 group-hover:text-[#1b5e20] transition-colors">{n.title}</h4>
                          {n.unread && <div className="size-2 rounded-full bg-[#1b5e20] animate-pulse" />}
                       </div>
                       <p className="text-xs text-zinc-500 font-medium leading-relaxed">{n.desc}</p>
                       <div className="flex items-center gap-4 mt-3">
                          <span className="text-[10px] font-black text-zinc-400 uppercase flex items-center gap-1"><Clock className="size-3" /> {n.time}</span>
                          <span className="text-[10px] font-black text-[#1b5e20] uppercase cursor-pointer hover:underline">Chi tiết yêu cầu →</span>
                       </div>
                    </div>
                 </div>
                 <button className="p-2 text-zinc-300 hover:text-zinc-900 transition-colors">
                    <MoreVertical className="size-4" />
                 </button>
              </div>
            ))}
         </div>
         
         <button className="w-full mt-8 py-4 border-2 border-dashed border-zinc-100 rounded-3xl text-xs font-black text-zinc-400 hover:border-[#1b5e20]/20 hover:text-[#1b5e20] transition-all">
            Xem lịch sử thông báo cũ hơn
         </button>
      </div>
    </div>
  );
}
