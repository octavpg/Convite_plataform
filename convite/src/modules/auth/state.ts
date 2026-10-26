// Archivo aparte: los módulos "use server" solo pueden exportar funciones async.

export type AuthField = "name" | "email" | "password" | "confirmPassword";

export interface AuthFormState {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<AuthField, string[]>>;
  /** Valores no sensibles para repoblar el formulario tras un error. */
  values?: { name?: string; email?: string };
}

export const initialAuthState: AuthFormState = {};
