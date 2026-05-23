/**
 * lib/auth/demoSession.ts — Demo mode user session
 * -------------------------------------------------
 * Quản lý "current user" khi chạy DEMO_MODE.
 * Lưu vào localStorage, đọc bằng hook useDemoSession().
 * Khi cắm Supabase thật → thay thế bằng lib/auth/guards.ts.
 */
"use client";

import { useState, useEffect } from "react";
import type { AppRole } from "@/lib/auth/guards";

export interface DemoUser {
  id: string;
  fullName: string;
  email: string;
  role: AppRole;
  departmentId: string;
  avatarInitials: string;
  position: string;
}

/** Danh sách user demo — 1 per role */
export const DEMO_USERS: DemoUser[] = [
  {
    id: "demo-ceo",
    fullName: "Nguyễn Văn Hùng",
    email: "hung.nv@haco.food",
    role: "ceo",
    departmentId: "dept_mgmt",
    avatarInitials: "HN",
    position: "CEO / Giám đốc",
  },
  {
    id: "demo-cfo",
    fullName: "Trần Thị Lan",
    email: "lan.tt@haco.food",
    role: "cfo",
    departmentId: "dept_back",
    avatarInitials: "LT",
    position: "CFO / Giám đốc Tài chính",
  },
  {
    id: "demo-hr",
    fullName: "Bùi Văn Tài",
    email: "tai.bv@haco.food",
    role: "hr_admin",
    departmentId: "dept_back",
    avatarInitials: "TB",
    position: "HR Executive",
  },
  {
    id: "demo-dept-head",
    fullName: "Lê Hoàng Nam",
    email: "nam.lh@haco.food",
    role: "dept_head",
    departmentId: "dept_sales",
    avatarInitials: "NL",
    position: "Trưởng phòng Kinh doanh",
  },
  {
    id: "demo-employee",
    fullName: "Phạm Thị Mai",
    email: "mai.pt@haco.food",
    role: "employee",
    departmentId: "dept_sales",
    avatarInitials: "MP",
    position: "Sales Executive B2B",
  },
];

const STORAGE_KEY = "haco-demo-user";
const DEFAULT_USER = DEMO_USERS[0]; // CEO default

/** Đọc demo user từ localStorage (client only) */
export function getDemoUser(): DemoUser {
  if (typeof window === "undefined") return DEFAULT_USER;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER;
    const parsed = JSON.parse(raw) as DemoUser;
    // Validate
    if (parsed?.id && parsed?.role) return parsed;
  } catch {}
  return DEFAULT_USER;
}

/** Ghi demo user vào localStorage */
export function setDemoUser(user: DemoUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("haco-session-change"));
}

/** Clear demo session (logout) */
export function clearDemoUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("haco-session-change"));
}

/** React hook — auto-updates when session changes */
export function useDemoSession() {
  const [user, setUser] = useState<DemoUser>(DEFAULT_USER);

  useEffect(() => {
    setUser(getDemoUser());

    const handler = () => setUser(getDemoUser());
    window.addEventListener("haco-session-change", handler);
    return () => window.removeEventListener("haco-session-change", handler);
  }, []);

  return { user, setUser: setDemoUser, logout: clearDemoUser };
}

/** Role display label */
export const ROLE_LABELS: Record<AppRole, string> = {
  ceo: "CEO",
  cfo: "CFO",
  hr_admin: "HR Admin",
  dept_head: "Trưởng phòng",
  team_lead: "Trưởng nhóm",
  employee: "Nhân viên",
  auditor: "Kiểm toán",
};

/** Role badge color */
export const ROLE_COLORS: Record<AppRole, string> = {
  ceo: "bg-zinc-900 text-white",
  cfo: "bg-blue-600 text-white",
  hr_admin: "bg-purple-600 text-white",
  dept_head: "bg-emerald-700 text-white",
  team_lead: "bg-emerald-500 text-white",
  employee: "bg-zinc-200 text-zinc-700",
  auditor: "bg-amber-500 text-white",
};
