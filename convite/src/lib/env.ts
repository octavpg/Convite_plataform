import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default("https://placeholder.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default("placeholder-anon-key"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "https://placeholder.supabase.co";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "placeholder-anon-key";
const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

export const env = schema.parse({
  NEXT_PUBLIC_SUPABASE_URL: rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: rawKey,
  NEXT_PUBLIC_APP_URL: rawAppUrl.startsWith("http") ? rawAppUrl : "http://localhost:3000",
});

/**
 * Determina si el servidor debe correr en Modo Demo Local (sin requerir Supabase ni Postgres activo).
 * Se activa si CONVITE_DEMO_MODE="true" o si las variables de Supabase siguen con valores de ejemplo.
 */
export function isDemoMode(): boolean {
  if (process.env.CONVITE_DEMO_MODE === "false") return false;
  if (process.env.CONVITE_DEMO_MODE === "true") return true;
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    url.includes("tu-id") ||
    url.includes("tu-proyecto") ||
    url.includes("placeholder") ||
    url.includes("[REF]") ||
    key.includes("tu-clave") ||
    key.includes("tu-anon-key") ||
    key === "..." ||
    key === "placeholder-anon-key"
  );
}
