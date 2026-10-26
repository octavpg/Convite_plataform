import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@prisma/client";
import type { User as AuthUser } from "@supabase/supabase-js";
import { DEMO_SESSION_COOKIE } from "@/lib/constants";
import { isDemoMode } from "@/lib/env";
import { readLocalDb } from "@/lib/local-store";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/** Usuario de Supabase Auth validado contra el servidor. Una sola llamada por request. */
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  if (isDemoMode()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Garantiza que exista la fila `users` que corresponde al usuario de Supabase Auth. */
export async function ensureHostRecord(authUser: AuthUser): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (existing) return existing;

  const email = authUser.email;
  if (!email) throw new Error("El usuario de Supabase no tiene correo.");

  const metaName: unknown = authUser.user_metadata?.name;
  const name =
    typeof metaName === "string" && metaName.trim() ? metaName.trim() : email.split("@")[0];

  return prisma.user.upsert({
    where: { id: authUser.id },
    update: {},
    create: { id: authUser.id, email, name },
  });
}

/**
 * Úsala al inicio de cada página, layout, Server Action o Route Handler del anfitrión.
 * El middleware es solo una primera barrera: la autorización real se verifica aquí.
 */
export const requireHost = cache(async (): Promise<User> => {
  if (isDemoMode()) {
    const cookieStore = await cookies();
    const demoUserId = cookieStore.get(DEMO_SESSION_COOKIE)?.value;
    if (!demoUserId) redirect("/login");

    const db = readLocalDb();
    const found = db.users.find((u) => u.id === demoUserId);
    if (!found) redirect("/login");

    return {
      id: found.id,
      email: found.email,
      name: found.name,
      createdAt: new Date(found.createdAt),
    };
  }

  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");
  return ensureHostRecord(authUser);
});
