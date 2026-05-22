"use client";

import { 
  Zap, 
  Settings, 
  Target, 
  Activity, 
  LayoutGrid, 
  ArrowRight, 
  Users, 
  Wallet, 
  BarChart3, 
  ShieldCheck, 
  Bot, 
  FileText, 
  Search, 
  Bell, 
  CheckCircle2, 
  Database,
  Terminal,
  HelpCircle,
  Briefcase,
  PieChart,
  ClipboardList,
  AlertCircle,
  UserPlus,
  BookOpen,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function GuidePage() {
  const screens = [
    { id: "dashboard", icon: LayoutGrid, label: "Dashboard", desc: "Ảnh chụp công ty trong 30 giây — 6 KPI chính, donut KPI tổng, trend 12 tháng.", href: "/dashboard" },
    { id: "org", icon: Users, label: "Sơ đồ tổ chức", desc: "Cơ cấu công ty dạng cây + KPI trung bình theo phòng ban.", href: "/org" },
    { id: "depts", icon: Briefcase, label: "Phòng ban", desc: "Mỗi phòng là cost center + KPI center — click để xem chi tiết.", href: "/departments" },
    { id: "people", icon: UserPlus, label: "Nhân sự", desc: "Directory + hồ sơ từng người với impact path từ KPI cá nhân → KPI công ty.", href: "/people" },
    { id: "kpi", icon: Target, label: "KPI Tree", desc: "Cascade KPI từ Company → Department → Team → Employee. Công thức JSONB.", href: "/kpi-tree" },
    { id: "ops", icon: ClipboardList, label: "Công việc", desc: "Task board 5 cột + lịch + workload + low-value detector.", href: "/operations" },
    { id: "comp", icon: Wallet, label: "Lương thưởng", desc: "Payroll snapshot + Incentive Simulator dùng rule engine 5 bậc.", href: "/compensation" },
    { id: "projects", icon: Zap, label: "Dự án", desc: "Initiative cross-functional với milestones và ROI tracking.", href: "/projects" },
    { id: "finance", icon: BarChart3, label: "Tài chính", desc: "P&L · Balance Sheet · Cash Flow · Budget vs Actual.", href: "/finance" },
    { id: "reports", icon: FileText, label: "Báo cáo", desc: "Snapshot báo cáo PDF/XLSX + lịch email tự động.", href: "/reports" },
    { id: "alerts", icon: Bell, label: "Cảnh báo", desc: "Trung tâm cảnh báo phân loại theo mức: critical/danger/warning/info.", href: "/alerts" },
    { id: "approvals", icon: CheckCircle2, label: "Phê duyệt", desc: "Duyệt KPI · thưởng · ngân sách · tuyển dụng trong một nơi.", href: "/approvals" },
    { id: "audit", icon: ShieldCheck, label: "Audit Log", desc: "Ai · sửa gì · khi nào — truy vết 12 tháng. Chỉ CEO + Auditor + CFO xem.", href: "/audit" },
    { id: "okr", icon: Target, label: "Mục tiêu OKR", desc: "Objective + Key Results cascade theo quý/năm. Alignment với KPI Tree.", href: "/okr" },
    { id: "forecast", icon: TrendingUp, label: "Forecast", desc: "What-if: kéo slider KPI lá → xem impact cascade lên KPI công ty và tài chính.", href: "/forecast" },
    { id: "recruiting", icon: UserPlus, label: "Tuyển dụng", desc: "Job requisition + pipeline candidate + skill gap analysis.", href: "/recruiting" },
    { id: "knowledge", icon: BookOpen, label: "SOP / Playbook", desc: "Quy trình chuẩn + playbook + checklist cho từng phòng.", href: "/knowledge" },
    { id: "profile", icon: Users, label: "Tài khoản", desc: "Thông tin + bảo mật + thiết bị + thông báo + tích hợp.", href: "/profile" },
    { id: "settings", icon: Settings, label: "Cài đặt", desc: "Company · Structure · Permissions · KPI formula · Comp rules · Integrations.", href: "/settings" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start pt-10">
         <div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter mb-2">Hướng dẫn sử dụng</h1>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Business Operating System · 19 màn hình · quy trình end-to-end</p>
         </div>
         <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">Guide v1</span>
            <div className="size-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
               <HelpCircle className="size-5" />
            </div>
         </div>
      </div>

      {/* Triết lý HACO Food OS */}
      <div className="bg-white border border-zinc-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
         <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
               <div className="size-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white">
                  <Zap className="size-6" />
               </div>
               <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Triết lý HACO Food OS</h2>
            </div>
            <p className="text-lg font-bold text-zinc-600 leading-relaxed max-w-4xl">
               Không phải HRM, không phải BI dashboard đơn thuần. HACO Food OS là <span className="text-zinc-900">Business Operating System</span> — nơi mọi task hằng ngày, KPI, lương thưởng và tài chính đều được nối vào một chuỗi logic thống nhất:
            </p>
            <div className="flex flex-wrap items-center gap-4 py-4">
               <span className="px-4 py-2 bg-zinc-100 rounded-full text-[11px] font-black text-zinc-500 uppercase">Task hằng ngày</span>
               <ArrowRight className="size-4 text-zinc-300" />
               <span className="px-4 py-2 bg-zinc-100 rounded-full text-[11px] font-black text-zinc-500 uppercase">KPI cá nhân</span>
               <ArrowRight className="size-4 text-zinc-300" />
               <span className="px-4 py-2 bg-zinc-100 rounded-full text-[11px] font-black text-zinc-500 uppercase">KPI phòng ban</span>
               <ArrowRight className="size-4 text-zinc-300" />
               <span className="px-4 py-2 bg-zinc-100 rounded-full text-[11px] font-black text-zinc-500 uppercase">KPI công ty</span>
               <ArrowRight className="size-4 text-zinc-300" />
               <span className="px-4 py-2 bg-emerald-100 rounded-full text-[11px] font-black text-emerald-600 uppercase">Doanh thu · Lợi nhuận · Dòng tiền</span>
            </div>
            <p className="text-sm font-bold text-zinc-400 italic">Mục tiêu: nếu KPI cấp cá nhân được thiết kế đúng và đạt ngưỡng, thì KPI cấp team, phòng, và công ty cũng phải đạt. Mọi thứ truy vết được.</p>
         </div>
         <div className="absolute top-0 right-0 size-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/10 transition-colors" />
      </div>

      {/* Bắt đầu từ đâu */}
      <div className="grid gap-6 md:grid-cols-3">
         {[
           { step: "Bước 1 - Setup", link: "/settings", desc: "Điền thông tin tin công ty, tạo phòng ban, gán permissions.", icon: Settings, color: "bg-blue-50 text-blue-600 border-blue-100" },
           { step: "Bước 2 - Design KPI", link: "/kpi", desc: "Tạo KPI công ty → cascade xuống phòng ban → cá nhân. Gắn công thức JSONB.", icon: Target, color: "bg-purple-50 text-purple-600 border-purple-100" },
           { step: "Bước 3 - Vận hành", link: "/operations", desc: "Giao task, gắn linked_kpi_id. Mở /dashboard theo dõi mỗi ngày.", icon: Activity, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
         ].map((s, i) => (
           <div key={i} className={cn("p-8 rounded-[2.5rem] border space-y-4 group cursor-pointer hover:shadow-xl transition-all", s.color)}>
              <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black uppercase tracking-widest">{s.step}</p>
                 <s.icon className="size-5 opacity-40 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-lg font-black">{s.link}</h3>
              <p className="text-xs font-bold leading-relaxed opacity-70">{s.desc}</p>
           </div>
         ))}
      </div>

      {/* Quy trình tiêu biểu */}
      <div className="space-y-8">
         <h3 className="text-xl font-black text-zinc-900 tracking-tight">Quy trình tiêu biểu</h3>
         <div className="grid gap-8 lg:grid-cols-3">
            {[
              { 
                t: "Task → KPI → Tài chính (end-to-end)", 
                icon: Zap,
                steps: [
                  "CEO tạo KPI công ty ở /kpi (ví dụ REV = 5 tỷ/tháng).",
                  "Dept Head tạo KPI phòng ban với parent = REV (ví dụ SAL.CLOSE).",
                  "Team Lead giao task ở /operations và gắn linked_kpi_id.",
                  "Nhân viên complete task → output đẩy lên KPI actual.",
                  "KPI actual cập nhật → cascade lên KPI cha tự động.",
                  "/compensation tính bonus dựa trên completion rate.",
                  "/finance phản ánh revenue/cost vào P&L.",
                  "/forecast cho phép what-if: 'Nếu KPI giảm 20%...' → xem impact."
                ]
              },
              { 
                t: "Payroll cuối tháng", 
                icon: Wallet,
                steps: [
                  "Đầu tháng: chốt KPI kỳ trước ở /kpi.",
                  "/compensation mở: hệ thống tính sẵn bonus theo rule.",
                  "Rà soát bảng Payroll chi tiết, điều chỉnh nếu cần (tạo Approval).",
                  "Duyệt adjustment ở /approvals.",
                  "Chạy payroll → status 'closed' → audit log ghi nhận.",
                  "/finance ghi nhận payroll cost vào cost center phòng ban."
                ]
              },
              { 
                t: "Setup công ty lần đầu", 
                icon: Briefcase,
                steps: [
                  "Đăng ký tài khoản ở /signup.",
                  "/settings: điền tên công ty, currency, timezone.",
                  "Tạo cơ cấu: business_unit → department → team → position.",
                  "Thêm nhân sự ở /people (hoặc import CSV ở Settings → Import).",
                  "Gán role cho từng user qua user_roles.",
                  "Tạo KPI công ty ở /kpi + cascade xuống phòng ban/cá nhân.",
                  "Tạo compensation rules ở Settings.",
                  "Chạy một kỳ payroll thử ở /compensation.",
                  "Mở /dashboard theo dõi hằng ngày."
                ]
              }
            ].map((p, i) => (
              <div key={i} className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                 <div className="flex items-center gap-3">
                    <p.icon className="size-5 text-blue-600" />
                    <h4 className="text-sm font-black text-zinc-900 uppercase tracking-tight">{p.t}</h4>
                 </div>
                 <div className="space-y-4">
                    {p.steps.map((s, idx) => (
                      <div key={idx} className="flex gap-4">
                         <span className="size-5 rounded-full bg-zinc-50 text-zinc-400 flex items-center justify-center text-[10px] font-black shrink-0">{idx + 1}</span>
                         <p className="text-xs font-bold text-zinc-600 leading-relaxed">{s}</p>
                      </div>
                    ))}
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* 19 màn hình — tóm tắt */}
      <div className="space-y-8">
         <h3 className="text-xl font-black text-zinc-900 tracking-tight">19 màn hình — tóm tắt</h3>
         <p className="text-sm font-bold text-zinc-400">Click &apos;Mở&apos; để sang trang; bấm icon &apos;?&apos; trong trang đó để mở hướng dẫn chi tiết (tab Quản trị viên / Nhân viên).</p>
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {screens.map((s) => (
              <div key={s.id} className="bg-white border border-zinc-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all group">
                 <div className="flex items-start justify-between mb-4">
                    <div className="size-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                       <s.icon className="size-5" />
                    </div>
                    <Link href={s.href} className="text-[10px] font-black text-blue-600 uppercase hover:underline">Mở →</Link>
                 </div>
                 <h4 className="text-sm font-black text-zinc-900 mb-2">{s.label}</h4>
                 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight mb-4 leading-relaxed">{s.href}</p>
                 <p className="text-xs font-bold text-zinc-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
         </div>
      </div>

      {/* Tips nhanh */}
      <div className="bg-zinc-900 rounded-[3rem] p-10 text-white space-y-10 overflow-hidden relative">
         <h3 className="text-xl font-black uppercase tracking-widest relative z-10">Tips nhanh</h3>
         <div className="grid gap-10 md:grid-cols-2 relative z-10">
            {[
              { t: "Demo mode", d: "Chưa điền Supabase env? App tự chạy với 14 employee, 14 KPI, payroll, finance mẫu. Mọi trang render đầy đủ — nút CRUD sẽ no-op." },
              { t: "Nút '?' ở mọi trang", d: "Mỗi page có icon ? bên phải tiêu đề — click để mở drawer hướng dẫn chi tiết với 2 tab: Quản trị viên và Nhân viên." },
              { t: "RLS multi-tenant", d: "Mỗi bảng có company_id. User chỉ đọc được data của công ty mình nhờ helper SQL current_company_id()." },
              { t: "KPI formula", d: "Lưu dạng JSONB AST: {op:'mul', args:[{ref:'mql'},{ref:'close'}]}. Hỗ trợ sum/sub/mul/avg/weighted_avg/ratio/milestone/ref/const/manual." },
            ].map((t, i) => (
              <div key={i} className="space-y-2">
                 <h4 className="text-sm font-black text-emerald-400 uppercase tracking-tight">{t.t}</h4>
                 <p className="text-xs font-medium text-white/60 leading-relaxed">{t.d}</p>
              </div>
            ))}
         </div>
         <div className="absolute bottom-0 right-0 size-96 bg-emerald-500/10 rounded-full blur-3xl -mb-32 -mr-32" />
      </div>
    </div>
  );
}
