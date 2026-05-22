/**
 * lib/auth/withAudit.ts — HOC để wrap Server Actions với audit logging
 * --------------------------------------------------------------------
 * Mọi Server Action ghi dữ liệu phải được wrap bằng withAudit.
 * Trong DEMO_MODE, log ra console thay vì ghi Supabase.
 */
import { getCurrentUser } from "@/lib/auth/guards";
import { isDemoMode } from "@/lib/env";

export interface AuditPayload {
  action: string;        // e.g. "create_task", "update_kpi_actual"
  entity: string;        // e.g. "tasks", "kpi_actuals"
  entityId?: string;
  before?: unknown;
  after?: unknown;
}

/**
 * Wrap a Server Action to auto-log audit trail.
 *
 * @example
 * const createTask = withAudit(
 *   { action: "create_task", entity: "tasks" },
 *   async (data: TaskInput) => { ... }
 * );
 */
export function withAudit<TInput, TOutput>(
  meta: { action: string; entity: string },
  fn: (input: TInput) => Promise<TOutput>
): (input: TInput) => Promise<TOutput> {
  return async (input: TInput): Promise<TOutput> => {
    const user = await getCurrentUser();
    const actor = user?.id ?? "anonymous";

    let result: TOutput;
    let error: unknown;

    try {
      result = await fn(input);
    } catch (err) {
      error = err;
      throw err;
    } finally {
      const auditEntry: AuditPayload & { actor: string; timestamp: string } = {
        actor,
        action: meta.action,
        entity: meta.entity,
        after: error ? undefined : input,
        timestamp: new Date().toISOString(),
      };

      if (isDemoMode) {
        console.log("[AUDIT]", auditEntry);
      } else {
        // Fire-and-forget — don't block the main action
        writeAuditLog(auditEntry).catch(console.error);
      }
    }

    return result!;
  };
}

async function writeAuditLog(entry: AuditPayload & { actor: string; timestamp: string }) {
  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = createAdminClient();
    await supabase.from("audit_logs").insert({
      actor_id: entry.actor,
      action: entry.action,
      entity_type: entry.entity,
      entity_id: entry.entityId,
      payload_before: entry.before,
      payload_after: entry.after,
      created_at: entry.timestamp,
    });
  } catch (err) {
    console.error("[AUDIT] Failed to write audit log:", err);
  }
}
