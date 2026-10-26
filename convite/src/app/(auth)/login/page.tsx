import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { isDemoMode } from "@/lib/env";
import { safeRedirectPath } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <AuthShell
      title="Inicia sesión"
      description="Entra para administrar tus eventos e invitados."
      footer={
        <>
          ¿Aún no tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-[#1F1B33] underline underline-offset-4">
            Crear cuenta
          </Link>
        </>
      }
    >
      <LoginForm
        next={safeRedirectPath(next)}
        callbackError={error === "callback"}
        demoMode={isDemoMode()}
      />
    </AuthShell>
  );
}
