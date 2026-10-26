import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/** Cliente para Client Components. En este proyecto se usará para Realtime y Storage. */
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
