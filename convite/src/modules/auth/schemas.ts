import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Ingresa un correo válido.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Ingresa tu contraseña."),
  next: z.string().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Ingresa tu nombre.").max(80, "Máximo 80 caracteres."),
    email,
    password: z
      .string()
      .min(8, "Usa al menos 8 caracteres.")
      .max(72, "Máximo 72 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

/** Convierte los issues de Zod a { campo: [mensajes] } (válido en Zod 3 y 4). */
export function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
