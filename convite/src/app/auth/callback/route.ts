import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { ensureHostRecord } from "@/modules/auth/session";

/** Destino del enlace de confirmación de correo (flujo PKCE). */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeRedirectPath(request.nextUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      await ensureHostRecord(data.user).catch((err) =>
        console.error("[auth] No se pudo crear el registro del anfitrión", err),
      );
      return NextResponse.redirect(new URL(next, env.NEXT_PUBLIC_APP_URL));
    }
  }

  return NextResponse.redirect(new URL("/login?error=callback", env.NEXT_PUBLIC_APP_URL));
}
