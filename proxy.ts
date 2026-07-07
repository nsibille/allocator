import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Middleware Next 16 (fichier `proxy.ts`) — refresh de session Supabase SSR.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Toutes les routes sauf :
     * - _next/static, _next/image
     * - favicon.ico + fichiers d'assets (svg, png, jpg, woff…)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
