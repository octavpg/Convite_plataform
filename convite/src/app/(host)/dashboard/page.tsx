import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { env } from "@/lib/env";
import { requireHost } from "@/modules/auth/session";
import { getHostEvents } from "@/modules/events/queries";

export const metadata: Metadata = { title: "Mis eventos" };

export default async function DashboardPage() {
  const host = await requireHost();
  const events = await getHostEvents(host.id);
  const firstName = host.name.split(" ")[0];

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          Hola, {firstName}
        </h1>
        <p className="text-sm text-[#1F1B33]/70">
          Administra tus eventos, envía invitaciones por WhatsApp y supervisa las confirmaciones y el acceso en tiempo real.
        </p>
      </div>

      <DashboardClient events={events} appUrl={env.NEXT_PUBLIC_APP_URL} />
    </section>
  );
}
