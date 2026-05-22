import { 
  LayoutGrid, 
  Users, 
  Briefcase, 
  UserPlus, 
  Target, 
  ClipboardList, 
  Wallet, 
  Zap, 
  BarChart3, 
  Settings, 
  FileText, 
  Bell, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  UserCheck, 
  BookOpen, 
  User,
  Activity,
  BarChart,
  MessageSquare
} from "lucide-react";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutGrid, desc: "Tổng quan vận hành" },
  { id: "org", label: "Sơ đồ tổ chức", href: "/org", icon: Users, desc: "Cấu trúc nhân sự" },
  { id: "departments", label: "Phòng ban", href: "/departments", icon: Briefcase, desc: "Quản lý Cost Center" },
  { id: "people", label: "Nhân sự", href: "/people", icon: UserPlus, desc: "Hồ sơ & Impact Path" },
  { id: "kpi-tree", label: "KPI Tree", href: "/kpi-tree", icon: Target, desc: "Cascade & Formula" },
  { id: "operations", label: "Công việc", href: "/operations", icon: ClipboardList, desc: "Task board & SLA" },
  { id: "compensation", label: "Lương thưởng", href: "/compensation", icon: Wallet, desc: "Payroll & Incentive" },
  { id: "projects", label: "Dự án", href: "/projects", icon: Zap, desc: "Initiative & ROI" },
  { id: "finance", label: "Tài chính", href: "/finance", icon: BarChart3, desc: "P&L, BS, Cashflow" },
  { id: "okr", label: "Mục tiêu OKR", href: "/okr", icon: Target, desc: "Chiến lược dài hạn" },
  { id: "forecast", label: "Dự báo", href: "/forecast", icon: TrendingUp, desc: "What-if Simulator" },
  { id: "reports", label: "Báo cáo", href: "/reports", icon: FileText, desc: "Snapshot & Automation" },
  { id: "alerts", label: "Cảnh báo", href: "/alerts", icon: Bell, desc: "Trung tâm rủi ro" },
  { id: "approvals", label: "Phê duyệt", href: "/approvals", icon: CheckCircle2, desc: "Duyệt yêu cầu" },
  { id: "audit", label: "Audit Log", href: "/audit", icon: ShieldCheck, desc: "Truy vết hệ thống" },
  { id: "recruiting", label: "Tuyển dụng", href: "/recruiting", icon: UserCheck, desc: "Pipeline ứng viên" },
  { id: "knowledge", label: "Knowledge", href: "/knowledge", icon: BookOpen, desc: "SOP & Playbook" },
  { id: "profile", label: "Tài khoản", href: "/profile", icon: User, desc: "Cá nhân hóa" },
  { id: "settings", label: "Cài đặt", href: "/settings", icon: Settings, desc: "Cấu hình hệ thống" },
];

export const NAV_GROUPS = [
  {
    id: "operating",
    label: "Vận hành",
    defaultOpen: true,
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
      { id: "operations", label: "Công việc", href: "/operations", icon: ClipboardList },
      { id: "kpi-tree", label: "KPI Tree", href: "/kpi-tree", icon: Target },
      { id: "projects", label: "Dự án", href: "/projects", icon: Zap },
      { id: "approvals", label: "Phê duyệt", href: "/approvals", icon: CheckCircle2 },
    ]
  },
  {
    id: "governance",
    label: "Quản trị",
    defaultOpen: true,
    items: [
      { id: "org", label: "Sơ đồ tổ chức", href: "/org", icon: Users },
      { id: "people", label: "Nhân sự", href: "/people", icon: UserPlus },
      { id: "compensation", label: "Lương thưởng", href: "/compensation", icon: Wallet },
      { id: "finance", label: "Tài chính", href: "/finance", icon: BarChart3 },
      { id: "forecast", label: "Dự báo", href: "/forecast", icon: TrendingUp },
    ]
  },
  {
    id: "intelligence",
    label: "Hệ thống",
    defaultOpen: false,
    items: [
      { id: "okr", label: "Chiến lược OKR", href: "/okr", icon: BarChart },
      { id: "alerts", label: "Cảnh báo", href: "/alerts", icon: Bell },
      { id: "reports", label: "Báo cáo", href: "/reports", icon: FileText },
      { id: "knowledge", label: "SOP / Playbook", href: "/knowledge", icon: BookOpen },
      { id: "audit", label: "Audit Log", href: "/audit", icon: ShieldCheck },
      { id: "settings", label: "Cài đặt", href: "/settings", icon: Settings },
    ]
  }
];
