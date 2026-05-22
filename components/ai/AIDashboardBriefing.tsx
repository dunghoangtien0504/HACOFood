"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  Zap, 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Target, 
  MessageSquare,
  ArrowRight,
  Sparkles,
  Bot,
  Search,
  Plus,
  History,
  MoreVertical,
  Landmark,
  ShieldAlert,
  Lightbulb
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

export default function AIDashboardBriefing() {
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnalyzing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const aiInsights = [
    { 
      type: "critical", 
      title: "Rủi ro hụt doanh thu T5", 
      desc: "Dựa trên tốc độ chốt deal hiện tại, dự báo doanh thu tháng 5 chỉ đạt 88% kế hoạch. Thiếu hụt khoảng 6.4 tỷ VNĐ.",
      action: "Gợi ý: Đẩy mạnh chương trình khuyến mãi B2B và kiểm tra lại phễu Marketing.",
      icon: <AlertTriangle className="size-4" />,
      color: "border-rose-200 bg-rose-50/50 text-rose-700"
    },
    { 
      type: "opportunity", 
      title: "Tối ưu hóa chi phí Marketing", 
      desc: "Chi phí chuyển đổi (CAC) trên kênh Facebook đang giảm 15%. Hiệu suất quảng cáo đang đạt đỉnh.",
      action: "Gợi ý: Tăng 20% ngân sách cho nhóm quảng cáo 'Sản phẩm mới' để tối đa hóa doanh thu.",
      icon: <TrendingUp className="size-4" />,
      color: "border-emerald-200 bg-emerald-50/50 text-emerald-700"
    },
    { 
      type: "ops", 
      title: "Bất thường trong tiến độ công việc", 
      desc: "Dự án 'App Chăm sóc KH' đang bị đình trệ tại bước API Integration (4 ngày không có update).",
      action: "Gợi ý: Kiểm tra nguồn lực phòng Công nghệ hoặc nhắc nhở PM Lê Minh Tuấn.",
      icon: <Zap className="size-4" />,
      color: "border-blue-200 bg-blue-50/50 text-blue-700"
    }
  ];

  return (
    <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden mb-8 border border-white/10">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#1b5e20]/20 to-transparent pointer-events-none" />
      <div className="absolute -right-20 -top-20 size-64 bg-[#1b5e20]/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute left-1/4 bottom-0 size-48 bg-blue-500/5 rounded-full blur-[80px]" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative group">
                 <div className="absolute inset-0 bg-[#1b5e20]/20 blur-xl group-hover:bg-[#1b5e20]/40 transition-all" />
                 <Bot className="size-7 text-[#4ade80] relative animate-float" />
              </div>
              <div>
                 <h2 className="text-xl font-black flex items-center gap-2">
                    Chào buổi sáng, Admin A <Sparkles className="size-5 text-amber-400" />
                 </h2>
                 <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Hệ điều hành đang được quản trị bởi AI Intelligence</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-all flex items-center gap-2">
                 <History className="size-3.5" /> Xem lịch sử phân tích
              </button>
              <button className="px-4 py-2 bg-[#1b5e20] text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-[#1b5e20]/20 hover:scale-105 transition-all">
                 Yêu cầu AI lập báo cáo mới
              </button>
           </div>
        </div>

        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
             <div className="flex gap-2">
                <div className="size-2 bg-[#4ade80] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="size-2 bg-[#4ade80] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="size-2 bg-[#4ade80] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
             <p className="text-white/40 text-xs font-black uppercase tracking-widest">AI đang quét toàn bộ dữ liệu công ty...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
             {aiInsights.map((insight, idx) => (
               <div key={idx} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:bg-white/[0.08] transition-all group cursor-pointer">
                  <div className="flex items-center gap-3 mb-4">
                     <div className={cn("size-8 rounded-lg flex items-center justify-center", 
                        insight.type === 'critical' ? "bg-rose-500/20 text-rose-400" : 
                        insight.type === 'opportunity' ? "bg-emerald-500/20 text-emerald-400" : 
                        "bg-blue-500/20 text-blue-400"
                     )}>
                        {insight.icon}
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Insight {idx + 1}</span>
                  </div>
                  <h3 className="text-sm font-black mb-2 group-hover:text-[#4ade80] transition-colors">{insight.title}</h3>
                  <p className="text-xs text-white/50 leading-relaxed font-medium mb-4">{insight.desc}</p>
                  <div className="pt-4 border-t border-white/5">
                     <p className="text-[10px] font-bold text-white/40 uppercase mb-2">Hành động gợi ý:</p>
                     <p className="text-[11px] font-bold text-white/80 leading-relaxed">{insight.action}</p>
                  </div>
               </div>
             ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
           <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="size-6 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[8px] font-black">
                      {i === 1 ? 'M' : i === 2 ? 'T' : i === 3 ? 'H' : '+8'}
                   </div>
                 ))}
              </div>
              <p className="text-[10px] font-bold text-white/40 uppercase">AI đã kiểm tra đầu việc của 42 nhân sự sáng nay</p>
           </div>
           <button className="text-[10px] font-black text-[#4ade80] uppercase flex items-center gap-2 hover:underline">
              Mở bảng điều khiển AI COO <ArrowRight className="size-3" />
           </button>
        </div>
      </div>
    </div>
  );
}
