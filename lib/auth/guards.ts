/**
 * lib/auth/guards.ts — Server-side auth & RBAC helpers
 * -----------------------------------------------------
 * Import trong Server Components / Server Actions.
 * Trong DEMO_MODE, trả về fake CEO user để không bị redirect.
 */
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/env";

// ----- Role types (mirrors Supabase app_role enum) -----
export type AppRole =
  | "ceo"
  | "cfo"
  | "hr_admin"
  | "dept_head"
  | "team_lead"
  | "employee"
  | "auditor";

export interface AuthUser {
  id: string;
  email: string;
  role: AppRole;
  companyId: string;
  departmentId?: string;
  fullName?: string;
}

// Fake CEO for demo mode
const DEMO_USER: AuthUser = {
  id: "demo-ceo-001",
  email: "ceo@haco.food",
  role: "ceo",
  companyId: "haco-001",
  fullName: "CEO Demo",
};

/**
 * Get current authenticated user.
 * In demo mode returns DEMO_USER (never redirects).
 * In live mode reads Supabase session.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (isDemoMode) return DEMO_USER;

  try {
    // Dynamic import to avoid build errors when Supabase vars missing
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Fetch role from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, company_id, department_id, full_name")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      email: user.email ?? "",
      role: (profile?.role as AppRole) ?? "employee",
      companyId: profile?.company_id ?? "",
      departmentId: profile?.department_id ?? undefined,
      fullName: profile?.full_name ?? undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Require authenticated user — redirects to /login if not logged in.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Require specific roles — throws 403-equivalent if role not allowed.
 * Usage: await requireRole(["ceo", "cfo"])
 */
export async function requireRole(allowedRoles: AppRole[]): Promise<AuthUser> {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized");
  }
  return user;
}

/**
 * Get current company ID (helper for RLS queries).
 */
export async function currentCompanyId(): Promise<string> {
  const user = await getCurrentUser();
  return user?.companyId ?? "haco-001";
}

/**
 * Check if current user has one of the given roles (non-throwing).
 */
export async function hasRole(roles: AppRole[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Role display names for UI
 */
export const ROLE_LABELS: Record<AppRole, string> = {
  ceo: "CEO / Giám đốc",
  cfo: "CFO / Tài chính",
  hr_admin: "HR Admin",
  dept_head: "Trưởng phòng",
  team_lead: "Trưởng nhóm",
  employee: "Nhân viên",
  auditor: "Kiểm toán",
};
