import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { isDemoMode } from "@/lib/env";
import { logoutAction } from "@/modules/auth/actions";
import { requireHost } from "@/modules/auth/session";

export default async function HostLayout({ children }: { children: ReactNode }) {
  const host = await requireHost();
  const demo = isDemoMode();

  return (
    <div className="min-h-dvh bg-[#F7F5FA] text-[#1F1B33]">
      <header className="border-b border-[#1F1B33]/10 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="font-[family-name:var(--font-display)] text-lg font-semibold"
            >
              {APP_NAME}
            </Link>
            {demo ? (
              <span className="rounded-full bg-[#F4B63F]/25 px-2.5 py-0.5 text-xs font-medium text-[#1F1B33]">
                Modo Demo Local
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[#1F1B33]/70 sm:inline">{host.name}</span>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
    </div>
  );
}
