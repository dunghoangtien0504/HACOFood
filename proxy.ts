/**
 * proxy.ts — Next.js 16 request interceptor (NOT middleware.ts)
 * --------------------------------------------------------------
 * Runs on every matched request to refresh Supabase auth session.
 * Keep this file minimal — business logic goes in lib/supabase/proxy.ts.
 */
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico / sitemap.xml / robots.txt
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
