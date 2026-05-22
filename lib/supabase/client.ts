/**
 * lib/supabase/client.ts — Browser Supabase client
 * -------------------------------------------------
 * Dùng trong "use client" components.
 * Singleton pattern tránh tạo nhiều instance.
 */
import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase URL/Anon key missing — set DEMO_MODE=true or add Supabase vars");
  }
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
