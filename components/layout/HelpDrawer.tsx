"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  BookOpen, 
  HelpCircle, 
  MessageSquare, 
  FileText, 
  ChevronRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pageTitle: string;
}

export function HelpDrawer({ isOpen, onClose, pageTitle }: HelpDrawerProps) {
  const [activeTab, setActiveTab] = useState("Hướng dẫn");

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const helpContent = {
    "Dashboard tổng quan": [
      { title: "Theo dõi Sức khỏe Doanh nghiệp", desc: "Sử dụng 6 thẻ chỉ số trên cùng để nắm bắt nhanh Doanh thu, Lợi nhuận và Dòng tiền." },
      { title: "Phân tích Rủi ro KPI", desc: "AI sẽ tự động gắn nhãn 'Nguy cơ' cho các chỉ số đang lệch khỏi quỹ đạo kế hoạch." },
      { title: "Xếp hạng Phòng ban", desc: "Dựa trên điểm KPI trung bình để đánh giá hiệu suất tương quan giữa các bộ phận." },
    ],
    "Quản trị Tài chính": [
      { title: "Cấu trúc 4 Phân hệ", desc: "Chuyển đổi giữa P&L, Bảng cân đối, Dòng tiền và Ngân sách để xem dữ liệu chi tiết." },
      { title: "Kiểm soát Thu/Chi", desc: "Mọi giao dịch trên 50 triệu VNĐ sẽ tự động kích hoạt luồng phê duyệt từ Admin A." },
      { title: "Dự báo Dòng tiền", desc: "Sử dụng biểu đồ xu hướng để dự đoán điểm hòa vốn và khả năng chi trả trong 3 tháng tới." },
    ],
    "Quản trị Vận hành": [
      { title: "Theo dõi Dòng hoạt động", desc: "Cột bên phải hiển thị mọi thay đổi trạng thái công việc và dự án trong thời gian thực." },
      { title: "AI Work Auditor", desc: "Hệ thống tự động quét và báo cáo các công việc bị 'treo' quá lâu để đôn đốc kịp thời." },
      { title: "Lịch điều hành", desc: "Tất cả deadline và lịch họp quan trọng được đồng bộ trực tiếp từ Google Calendar." },
    ]
  };

  const currentHelp = helpContent[pageTitle as keyof typeof helpContent] || [
    { title: "Hướng dẫn chung", desc: "Trang này chứa các công cụ quản trị chuyên sâu dành cho Admin A." },
    { title: "Hỗ trợ AI", desc: "Bấm vào biểu tượng Brain để yêu cầu AI phân tích dữ liệu trên màn hình này." }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-[70] flex flex-col transition-transform duration-500 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#4ade80]">
                 <HelpCircle className="size-5" />
              </div>
              <div>
                 <h3 className="text-lg font-black text-zinc-900">Trợ giúp & Hướng dẫn</h3>
                 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{pageTitle}</p>
              </div>
           </div>
           <button 
              onClick={onClose}
              className="size-10 rounded-xl hover:bg-zinc-50 flex items-center justify-center text-zinc-400 transition-all"
           >
              <X className="size-5" />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
           {/* Tabs */}
           <div className="flex gap-4 border-b border-zinc-50 pb-4">
              {["Hướng dẫn", "Tài liệu SOP", "Hỗ trợ"].map(t => (
                <button 
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={cn(
                    "text-[11px] font-black uppercase tracking-widest transition-all pb-2 border-b-2",
                    activeTab === t ? "border-[#1b5e20] text-zinc-900" : "border-transparent text-zinc-400"
                  )}
                >
                  {t}
                </button>
              ))}
           </div>

           {activeTab === "Hướng dẫn" && (
             <div className="space-y-6">
                {currentHelp.map((item, i) => (
                  <div key={i} className="group cursor-pointer">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="size-1.5 rounded-full bg-[#1b5e20]" />
                        <h4 className="text-xs font-black text-zinc-900 group-hover:text-[#1b5e20] transition-colors">{item.title}</h4>
                     </div>
                     <p className="text-xs text-zinc-500 leading-relaxed pl-4.5 font-medium">{item.desc}</p>
                  </div>
                ))}

                <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100 mt-10">
                   <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="size-4 text-amber-500" />
                      <h4 className="text-[11px] font-black text-zinc-900 uppercase">Hỏi trợ lý AI về trang này</h4>
                   </div>
                   <p className="text-[11px] text-zinc-500 leading-relaxed mb-4 font-medium">AI có thể giải thích các số liệu và biểu đồ đang hiển thị để giúp bạn ra quyết định nhanh hơn.</p>
                   <button className="w-full py-3 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2">
                      <MessageSquare className="size-3.5" /> Bắt đầu hội thoại
                   </button>
                </div>
             </div>
           )}

           {activeTab === "Tài liệu SOP" && (
             <div className="space-y-4">
                {[
                  "Quy trình quản lý tài chính",
                  "Hướng dẫn nhập liệu KPI",
                  "Chính sách bảo mật dữ liệu Admin",
                  "Quy trình phê duyệt ngân sách"
                ].map(sop => (
                  <div key={sop} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-[#1b5e20]/20 transition-all cursor-pointer group">
                     <div className="flex items-center gap-3">
                        <FileText className="size-4 text-zinc-400 group-hover:text-[#1b5e20]" />
                        <span className="text-xs font-bold text-zinc-600">{sop}</span>
                     </div>
                     <ChevronRight className="size-4 text-zinc-300" />
                  </div>
                ))}
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-zinc-50 bg-zinc-50/50">
           <div className="flex items-center gap-4 text-zinc-400">
              <ShieldCheck className="size-5" />
              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                 Tài liệu được mã hóa & bảo mật bởi HACO Food OS v2.0
              </p>
           </div>
        </div>
      </div>
    </>
  );
}
