/**
 * GET /api/health — Health check endpoint
 * ----------------------------------------
 * Returns system status: version, mode, timestamp.
 * Used by Docker/Railway health check + deployment verification.
 */
import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/env";

const pkg = { version: "0.1.0" }; // sẽ đồng bộ với package.json sau

export async function GET() {
  const payload = {
    status: "ok",
    version: pkg.version,
    mode: isDemoMode ? "demo" : "live",
    timestamp: new Date().toISOString(),
    services: {
      database: isDemoMode ? "demo" : await checkDatabase(),
      ai: "unconfigured",
    },
  };

  return NextResponse.json(payload, { status: 200 });
}

async function checkDatabase(): Promise<"ok" | "error"> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { error } = await supabase.from("companies").select("id").limit(1);
    return error ? "error" : "ok";
  } catch {
    return "error";
  }
}
