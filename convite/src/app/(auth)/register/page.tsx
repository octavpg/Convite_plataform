import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Crea tu cuenta"
      description="Registra tu evento y envía las invitaciones en minutos."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-[#1F1B33] underline underline-offset-4">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
