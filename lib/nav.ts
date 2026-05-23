import {
  LayoutGrid, Users, Briefcase, UserPlus, Target, ClipboardList,
  Wallet, Zap, BarChart3, Settings, FileText, Bell, CheckCircle2,
  ShieldCheck, TrendingUp, UserCheck, BookOpen, User, BarChart,
} from "lucide-react";
import type { AppRole } from "@/lib/auth/guards";

export type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  desc?: string;
  /** Nếu undefined → tất cả roles đều thấy */
  roles?: AppRole[];
};

export type NavGroup = {
  id: string;
  label: string;
  defaultOpen: boolean;
  items: NavItem[];
};

/** Tất cả nav items — dùng để tra cứu nhanh */
export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",    label: "Dashboard",      href: "/dashboard",    icon: LayoutGrid,   desc: "Tổng quan vận hành" },
  { id: "org",          label: "Sơ đồ tổ chức",  href: "/org",          icon: Users,        desc: "Cấu trúc nhân sự" },
  { id: "departments",  label: "Phòng ban",       href: "/departments",  icon: Briefcase,    desc: "Quản lý Cost Center",  roles: ["ceo","cfo","hr_admin","dept_head","auditor"] },
  { id: "people",       label: "Nhân sự",         href: "/people",       icon: UserPlus,     desc: "Hồ sơ & Impact Path",  roles: ["ceo","hr_admin","dept_head","team_lead","auditor"] },
  { id: "kpi-tree",     label: "KPI Tree",        href: "/kpi-tree",     icon: Target,       desc: "Cascade & Formula" },
  { id: "operations",   label: "Công việc",       href: "/operations",   icon: ClipboardList, desc: "Task board & SLA" },
  { id: "compensation", label: "Lương thưởng",    href: "/compensation", icon: Wallet,       desc: "Payroll & Incentive",  roles: ["ceo","cfo","hr_admin"] },
  { id: "projects",     label: "Dự án",           href: "/projects",     icon: Zap,          desc: "Initiative & ROI" },
  { id: "finance",      label: "Tài chính",       href: "/finance",      icon: BarChart3,    desc: "P&L, BS, Cashflow",    roles: ["ceo","cfo","auditor"] },
  { id: "okr",          label: "Mục tiêu OKR",   href: "/okr",          icon: Target,       desc: "Chiến lược dài hạn" },
  { id: "forecast",     label: "Dự báo",          href: "/forecast",     icon: TrendingUp,   desc: "What-if Simulator",    roles: ["ceo","cfo"] },
  { id: "reports",      label: "Báo cáo",         href: "/reports",      icon: FileText,     desc: "Snapshot & Automation" },
  { id: "alerts",       label: "Cảnh báo",        href: "/alerts",       icon: Bell,         desc: "Trung tâm rủi ro" },
  { id: "approvals",    label: "Phê duyệt",       href: "/approvals",    icon: CheckCircle2, desc: "Duyệt yêu cầu" },
  { id: "audit",        label: "Audit Log",       href: "/audit",        icon: ShieldCheck,  desc: "Truy vết hệ thống",    roles: ["ceo","cfo","auditor"] },
  { id: "recruiting",   label: "Tuyển dụng",      href: "/recruiting",   icon: UserCheck,    desc: "Pipeline ứng viên",    roles: ["ceo","hr_admin","dept_head"] },
  { id: "knowledge",    label: "Knowledge",       href: "/knowledge",    icon: BookOpen,     desc: "SOP & Playbook" },
  { id: "profile",      label: "Tài khoản",       href: "/profile",      icon: User,         desc: "Cá nhân hóa" },
  { id: "settings",     label: "Cài đặt",         href: "/settings",     icon: Settings,     desc: "Cấu hình hệ thống",    roles: ["ceo","cfo","hr_admin"] },
];

/** Nav groups — dùng trong Sidebar */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "operating",
    label: "Vận hành",
    defaultOpen: true,
    items: [
      { id: "dashboard",  label: "Dashboard",   href: "/dashboard",   icon: LayoutGrid },
      { id: "operations", label: "Công việc",   href: "/operations",  icon: ClipboardList },
      { id: "kpi-tree",   label: "KPI Tree",    href: "/kpi-tree",    icon: Target },
      { id: "projects",   label: "Dự án",       href: "/projects",    icon: Zap },
      { id: "approvals",  label: "Phê duyệt",   href: "/approvals",   icon: CheckCircle2 },
    ],
  },
  {
    id: "governance",
    label: "Quản trị",
    defaultOpen: true,
    items: [
      { id: "org",          label: "Sơ đồ tổ chức", href: "/org",          icon: Users,    roles: undefined },
      { id: "people",       label: "Nhân sự",        href: "/people",       icon: UserPlus, roles: ["ceo","hr_admin","dept_head","team_lead","auditor"] as AppRole[] },
      { id: "compensation", label: "Lương thưởng",   href: "/compensation", icon: Wallet,   roles: ["ceo","cfo","hr_admin"] as AppRole[] },
      { id: "finance",      label: "Tài chính",      href: "/finance",      icon: BarChart3,roles: ["ceo","cfo","auditor"] as AppRole[] },
      { id: "forecast",     label: "Dự báo",         href: "/forecast",     icon: TrendingUp,roles: ["ceo","cfo"] as AppRole[] },
    ],
  },
  {
    id: "intelligence",
    label: "Hệ thống",
    defaultOpen: false,
    items: [
      { id: "okr",       label: "Chiến lược OKR", href: "/okr",       icon: BarChart },
      { id: "alerts",    label: "Cảnh báo",       href: "/alerts",    icon: Bell },
      { id: "reports",   label: "Báo cáo",        href: "/reports",   icon: FileText },
      { id: "knowledge", label: "SOP / Playbook", href: "/knowledge", icon: BookOpen },
      { id: "audit",     label: "Audit Log",      href: "/audit",     icon: ShieldCheck, roles: ["ceo","cfo","auditor"] as AppRole[] },
      { id: "settings",  label: "Cài đặt",        href: "/settings",  icon: Settings,    roles: ["ceo","cfo","hr_admin"] as AppRole[] },
    ],
  },
];

/** Lọc nav items theo role */
export function filterNavByRole(items: NavItem[], role: AppRole): NavItem[] {
  return items.filter((item) => !item.roles || item.roles.includes(role));
}

/** Lọc toàn bộ nav groups theo role */
export function filterGroupsByRole(groups: NavGroup[], role: AppRole): NavGroup[] {
  return groups
    .map((g) => ({ ...g, items: filterNavByRole(g.items, role) }))
    .filter((g) => g.items.length > 0);
}
