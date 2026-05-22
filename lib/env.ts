/**
 * lib/env.ts — Validated environment variables (Zod)
 * -------------------------------------------------------
 * Import { env } thay vì process.env trực tiếp.
 * Build sẽ fail sớm nếu thiếu biến bắt buộc.
 */
import { z } from "zod";

const envSchema = z.object({
  // Supabase — required in live mode, optional in DEMO_MODE
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Demo mode: skip Supabase entirely
  // Zod v4: .default() expects the OUTPUT type of the transform (boolean)
  DEMO_MODE: z
    .string()
    .transform((v) => v === "true" || v === "1")
    .default(true),

  // Anthropic — validate format only when key is actually provided & non-empty
  ANTHROPIC_API_KEY: z
    .string()
    .optional()
    .refine(
      (v) => !v || v === "" || v.startsWith("sk-ant-"),
      { message: 'ANTHROPIC_API_KEY must start with "sk-ant-"' }
    ),

  // Storage
  SUPABASE_STORAGE_BUCKET: z.string().default("haco-uploads"),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables — check .env.local");
  }

  const data = result.data;

  // In live mode, Supabase vars must be present
  if (!data.DEMO_MODE) {
    if (!data.NEXT_PUBLIC_SUPABASE_URL || !data.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required when DEMO_MODE=false"
      );
    }
  }

  return data;
}

export const env = parseEnv();

/** True when running in demo mode (no Supabase required) */
export const isDemoMode = env.DEMO_MODE;
