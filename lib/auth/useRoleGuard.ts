"use client";

/**
 * lib/auth/useRoleGuard.ts
 * ─────────────────────────────────────────────────────────────────
 * Client-side RBAC guard for demo mode.
 * Call at the top of any page that should be role-restricted.
 *
 * Usage:
 *   const { allowed, loading } = useRoleGuard(["ceo", "cfo"]);
 *   if (loading) return null;        // hydrating — skip flash
 *   if (!allowed) return null;       // router.push already fired
 *
 * Pattern: return null (not a redirect component) so pages keep
 * their own loading states without a flash of unauthorized content.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDemoSession } from "@/lib/auth/demoSession";
import type { AppRole } from "@/lib/auth/guards";

export function useRoleGuard(allowedRoles: AppRole[]) {
  const router = useRouter();
  const { user } = useDemoSession();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const ok = allowedRoles.includes(user.role);
    setAllowed(ok);
    setLoading(false);
    if (!ok) {
      router.replace("/unauthorized");
    }
  }, [user.role]);    // eslint-disable-line react-hooks/exhaustive-deps

  return { allowed, loading };
}
