import Link from "next/link";
import type { ReactNode } from "react";
import { APP_NAME } from "@/lib/constants";
import { TicketPreview } from "./ticket-preview";

interface AuthShellProps {
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
}

export function AuthShell({ title, description, footer, children }: AuthShellProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden flex-col justify-between bg-[#1F1B33] p-12 text-[#F7F5FA] lg:flex">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl font-semibold"
        >
          {APP_NAME}
        </Link>
        <div className="space-y-10">
          <TicketPreview />
          <div className="max-w-sm space-y-3">
            <p className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight">
              Cada familia entra con un solo código.
            </p>
            <p className="leading-relaxed text-[#F7F5FA]/70">
              Envía la invitación por WhatsApp y mira en tiempo real quién confirma y quién
              ya llegó.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-[#F7F5FA] px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#1F1B33] lg:hidden"
            >
              {APP_NAME}
            </Link>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[#1F1B33]">
              {title}
            </h1>
            <p className="text-sm text-[#1F1B33]/70">{description}</p>
          </div>
          {children}
          <p className="text-sm text-[#1F1B33]/70">{footer}</p>
        </div>
      </main>
    </div>
  );
}
