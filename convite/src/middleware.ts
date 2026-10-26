// Next.js 16: este archivo se llama `proxy.ts` y la función exportada `proxy`.
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// Solo corre donde hay sesión que gestionar: el portal del invitado y el escáner quedan fuera.
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
