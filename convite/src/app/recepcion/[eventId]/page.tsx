import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { getEventForReception } from "@/modules/events/queries";
import { ScannerClient } from "./scanner-client";

export const metadata: Metadata = { title: "Recepción y Escáner QR" };

export default async function ReceptionScannerPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const data = await getEventForReception(eventId);
  if (!data) notFound();

  const { event, guests } = data;

  return (
    <div className="min-h-dvh bg-[#F7F5FA] text-[#1F1B33]">
      <header className="border-b border-[#1F1B33]/10 bg-[#1F1B33] text-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold">
              {APP_NAME} · Puerta
            </span>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Volver al dashboard del anfitrión
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#1F1B33]/60">
            Control de Acceso en Recepción
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            {event.title}
          </h1>
          <p className="text-sm text-[#1F1B33]/70">{event.location}</p>
        </div>

        <ScannerClient eventId={event.id} guests={guests} />
      </main>
    </div>
  );
}
