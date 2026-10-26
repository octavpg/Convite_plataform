"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { loginAction, loginDemoQuickAction } from "@/modules/auth/actions";
import { initialAuthState } from "@/modules/auth/state";
import { Button } from "@/components/ui/button";
import { FormAlert } from "./form-alert";
import { FormField } from "./form-field";
import { SubmitButton } from "./submit-button";

interface LoginFormProps {
  next: string;
  callbackError?: boolean;
  demoMode?: boolean;
}

export function LoginForm({ next, callbackError, demoMode }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialAuthState);

  return (
    <div className="space-y-5">
      {demoMode ? (
        <div className="rounded-xl border border-[#F4B63F]/50 bg-[#F4B63F]/15 p-4 text-xs text-[#1F1B33] space-y-2.5">
          <div className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="size-4 text-[#1F1B33]" />
            <span>Modo Demo Local Activo</span>
          </div>
          <p className="text-[#1F1B33]/80 leading-relaxed">
            Puedes probar todo el flujo sin configurar Supabase todavía. Usa{" "}
            <code className="font-mono font-semibold">demo@convite.mx</code> /{" "}
            <code className="font-mono font-semibold">convite123</code> o entra con un clic:
          </p>
          <form action={loginDemoQuickAction}>
            <Button type="submit" variant="secondary" size="sm" className="w-full">
              Entrar como Anfitrión Demo (1 clic)
            </Button>
          </form>
        </div>
      ) : null}

      <form action={formAction} className="space-y-5" noValidate>
        <input type="hidden" name="next" value={next} />

        {state.error ? (
          <FormAlert tone="error">{state.error}</FormAlert>
        ) : callbackError ? (
          <FormAlert tone="error">
            El enlace de confirmación venció o no es válido. Inicia sesión o crea tu cuenta de
            nuevo.
          </FormAlert>
        ) : null}

        <FormField
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email ?? (demoMode ? "demo@convite.mx" : undefined)}
          error={state.fieldErrors?.email}
        />
        <FormField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          defaultValue={demoMode ? "convite123" : undefined}
          error={state.fieldErrors?.password}
        />

        <SubmitButton pendingLabel="Entrando…">Iniciar sesión</SubmitButton>
      </form>
    </div>
  );
}
