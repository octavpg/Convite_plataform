"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_SESSION_COOKIE } from "@/lib/constants";
import { env, isDemoMode } from "@/lib/env";
import { hashSecret, readLocalDb, writeLocalDb } from "@/lib/local-store";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema, toFieldErrors } from "./schemas";
import { ensureHostRecord } from "./session";
import type { AuthFormState } from "./state";

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const raw = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      fieldErrors: toFieldErrors(parsed.error),
      values: { name: String(raw.name ?? ""), email: String(raw.email ?? "") },
    };
  }

  const { name, email, password } = parsed.data;
  const values = { name, email };

  if (isDemoMode()) {
    const db = readLocalDb();
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: "Ya existe una cuenta con este correo.", values };
    }
    const newUser = {
      id: crypto.randomUUID(),
      email,
      name,
      passwordHash: hashSecret(password),
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    writeLocalDb(db);

    const cookieStore = await cookies();
    cookieStore.set(DEMO_SESSION_COOKIE, newUser.id, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    switch (error.code) {
      case "user_already_exists":
        return { error: "Ya existe una cuenta con este correo.", values };
      case "weak_password":
        return { fieldErrors: { password: ["Elige una contraseña más segura."] }, values };
      case "over_email_send_rate_limit":
        return { error: "Se enviaron demasiados correos. Intenta de nuevo en unos minutos.", values };
      default:
        return { error: "No pudimos crear tu cuenta. Intenta de nuevo.", values };
    }
  }

  // Con confirmación de correo activa, un correo ya registrado no devuelve error:
  // devuelve un usuario "ofuscado" sin identidades.
  if (!data.user || data.user.identities?.length === 0) {
    return { error: "Ya existe una cuenta con este correo.", values };
  }

  try {
    await ensureHostRecord(data.user);
  } catch (err) {
    // No bloquea el registro: `requireHost` reintenta la creación en el primer acceso.
    console.error("[auth] No se pudo crear el registro del anfitrión", err);
  }

  if (data.session) redirect("/dashboard");

  return {
    success: "Cuenta creada. Te enviamos un correo para confirmarla; ábrelo para iniciar sesión.",
    values,
  };
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const raw = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      fieldErrors: toFieldErrors(parsed.error),
      values: { email: String(raw.email ?? "") },
    };
  }

  const { email, password, next } = parsed.data;

  if (isDemoMode()) {
    const db = readLocalDb();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === hashSecret(password),
    );
    if (!user) {
      return { error: "Correo o contraseña incorrectos.", values: { email } };
    }
    const cookieStore = await cookies();
    cookieStore.set(DEMO_SESSION_COOKIE, user.id, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect(safeRedirectPath(next));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Confirma tu correo antes de iniciar sesión.", values: { email } };
    }
    // Mensaje único para no revelar si el correo existe.
    return { error: "Correo o contraseña incorrectos.", values: { email } };
  }

  redirect(safeRedirectPath(next));
}

export async function loginDemoQuickAction(): Promise<void> {
  if (!isDemoMode()) redirect("/login");
  const db = readLocalDb();
  const demoUser = db.users[0];
  if (demoUser) {
    const cookieStore = await cookies();
    cookieStore.set(DEMO_SESSION_COOKIE, demoUser.id, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  if (isDemoMode()) {
    const cookieStore = await cookies();
    cookieStore.delete(DEMO_SESSION_COOKIE);
    redirect("/login");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
