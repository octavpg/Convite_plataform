import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { Calendar, MapPin, ShieldCheck, ArrowLeft } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { getInvitationByUrlToken } from "@/modules/events/queries";
import { RsvpButtons } from "./rsvp-buttons";

export const metadata: Metadata = { title: "Tu Invitación Digital" };

export default async function GuestInvitationPage({
  params,
}: {
  params: Promise<{ urlToken: string }>;
}) {
  const { urlToken } = await params;
  const data = await getInvitationByUrlToken(urlToken);

  if (!data) notFound();
  const { guest, event } = data;

  // Regla de seguridad de Convite: el QR solo se genera y entrega cuando status === "CONFIRMED"
  const qrDataUrl =
    guest.status === "CONFIRMED"
      ? await QRCode.toDataURL(guest.qrToken, {
          width: 240,
          margin: 1,
          color: { dark: "#1F1B33", light: "#FFFFFF" },
        })
      : null;

  return (
    <div className="min-h-dvh bg-[#1F1B33] text-[#F7F5FA] px-4 py-10 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold">
            {APP_NAME}
          </span>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-[#F7F5FA]/70 hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Volver al panel (prueba)
          </Link>
        </div>

        {/* Boleto / Invitación */}
        <div className="rounded-3xl bg-[#F7F5FA] text-[#1F1B33] shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1F1B33]/60">
              Invitación Personal
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight">
              {event.title}
            </h1>
            {event.description ? (
              <p className="text-sm text-[#1F1B33]/75 leading-relaxed">{event.description}</p>
            ) : null}

            <div className="space-y-2 pt-2 text-sm text-[#1F1B33]/80">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-[#1F1B33]/50 shrink-0" />
                <span>
                  {new Date(event.eventDate).toLocaleString("es-MX", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-[#1F1B33]/50 shrink-0" />
                <span>{event.location}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 border border-[#1F1B33]/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#1F1B33]/60">Pase reservado para</p>
                <p className="font-[family-name:var(--font-display)] text-xl font-semibold">
                  {guest.fullName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex size-12 items-center justify-center rounded-full bg-[#F4B63F] font-[family-name:var(--font-display)] text-2xl font-bold text-[#1F1B33]">
                  {guest.totalPasses}
                </span>
                <span className="text-xs font-medium text-[#1F1B33]/70">pases</span>
              </div>
            </div>

            <RsvpButtons urlToken={guest.urlToken} currentStatus={guest.status} />
          </div>

          {/* Línea punteada de boleto y sección de QR */}
          <div className="relative border-t-2 border-dashed border-[#1F1B33]/20 bg-white p-6 sm:p-8">
            <span className="absolute -left-3 -top-3 size-6 rounded-full bg-[#1F1B33]" />
            <span className="absolute -right-3 -top-3 size-6 rounded-full bg-[#1F1B33]" />

            {guest.status === "CONFIRMED" && qrDataUrl ? (
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="size-3.5" />
                  Pase QR Activo para la Recepción
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="Código QR de acceso"
                  className="size-48 rounded-xl border border-[#1F1B33]/10 p-2 bg-white shadow-sm"
                />
                <p className="text-xs text-[#1F1B33]/60">
                  Muestra este código en la entrada. Pases admitidos:{" "}
                  <strong>
                    {guest.admittedPasses} de {guest.totalPasses}
                  </strong>
                </p>
                <p className="font-mono text-[11px] text-[#1F1B33]/50 select-all">
                  Token QR: {guest.qrToken}
                </p>
              </div>
            ) : guest.status === "DECLINED" ? (
              <p className="text-center text-sm text-[#1F1B33]/65">
                Has indicado que no podrás asistir. Si cambias de opinión, puedes confirmar arriba en cualquier momento.
              </p>
            ) : (
              <p className="text-center text-sm text-[#1F1B33]/65">
                Confirma tu asistencia arriba para revelar tu código QR de acceso a la recepción.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
