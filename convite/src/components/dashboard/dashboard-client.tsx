"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Plus,
  QrCode,
  Share2,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEventAction, createGuestAction } from "@/modules/events/actions";
import type { EventWithGuestsDTO } from "@/modules/events/queries";

export function DashboardClient({
  events,
  appUrl,
}: {
  events: EventWithGuestsDTO[];
  appUrl: string;
}) {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id ?? "");
  const [showNewEventForm, setShowNewEventForm] = useState(events.length === 0);
  const [feedback, setFeedback] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentEvent = events.find((e) => e.id === selectedEventId) ?? events[0];

  function handleCreateEvent(formData: FormData) {
    setFeedback(null);
    startTransition(async () => {
      const res = await createEventAction(formData);
      if (res.error) {
        setFeedback({ tone: "err", text: res.error });
      } else {
        setFeedback({ tone: "ok", text: res.success ?? "Evento creado." });
        setShowNewEventForm(false);
      }
    });
  }

  function handleCreateGuest(formData: FormData) {
    setFeedback(null);
    startTransition(async () => {
      const res = await createGuestAction(formData);
      if (res.error) {
        setFeedback({ tone: "err", text: res.error });
      } else {
        setFeedback({ tone: "ok", text: res.success ?? "Invitado agregado." });
      }
    });
  }

  const totalPasses = currentEvent?.guests.reduce((acc, g) => acc + g.totalPasses, 0) ?? 0;
  const confirmedPasses =
    currentEvent?.guests
      .filter((g) => g.status === "CONFIRMED")
      .reduce((acc, g) => acc + g.totalPasses, 0) ?? 0;
  const admittedPasses =
    currentEvent?.guests.reduce((acc, g) => acc + g.admittedPasses, 0) ?? 0;

  return (
    <div className="space-y-8">
      {feedback ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            feedback.tone === "err"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      {/* Selector de Evento + Botón Nuevo Evento */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {events.map((ev) => (
            <button
              key={ev.id}
              type="button"
              onClick={() => {
                setSelectedEventId(ev.id);
                setShowNewEventForm(false);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                currentEvent?.id === ev.id && !showNewEventForm
                  ? "bg-[#1F1B33] text-white shadow-sm"
                  : "bg-white text-[#1F1B33] border border-[#1F1B33]/15 hover:bg-[#1F1B33]/5"
              }`}
            >
              {ev.title}
            </button>
          ))}
        </div>

        <Button
          type="button"
          variant={showNewEventForm ? "outline" : "default"}
          onClick={() => setShowNewEventForm((v) => !v)}
        >
          <Plus className="size-4" />
          {showNewEventForm ? "Ver mis eventos" : "Crear nuevo evento"}
        </Button>
      </div>

      {/* Formulario para crear un evento */}
      {showNewEventForm ? (
        <div className="rounded-2xl border border-[#1F1B33]/10 bg-white p-6 shadow-sm space-y-5">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
              Registrar nuevo evento
            </h2>
            <p className="text-sm text-[#1F1B33]/65">
              Define los datos principales y el PIN para el personal de la puerta.
            </p>
          </div>

          <form action={handleCreateEvent} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="title">Nombre del evento</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ej. Boda de Sofía y Diego"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="eventDate">Fecha y hora</Label>
              <Input
                id="eventDate"
                name="eventDate"
                type="datetime-local"
                defaultValue="2026-12-19T20:00"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="receptionPin">PIN de puerta (4 a 6 dígitos)</Label>
              <Input
                id="receptionPin"
                name="receptionPin"
                placeholder="1234"
                defaultValue="1234"
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="location">Lugar / Hacienda / Salón</Label>
              <Input
                id="location"
                name="location"
                placeholder="Ej. Hacienda San José Cholul, Mérida"
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">Mensaje o código de vestimenta (opcional)</Label>
              <Input
                id="description"
                name="description"
                placeholder="Ej. Formal riguroso. ¡Los esperamos con mucha ilusión!"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando…" : "Guardar evento"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Vista de detalle del evento seleccionado */}
      {currentEvent && !showNewEventForm ? (
        <div className="space-y-6">
          {/* Encabezado del evento */}
          <div className="rounded-2xl border border-[#1F1B33]/10 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="size-3.5" />
                  Evento Activo ({currentEvent.paymentStatus})
                </div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
                  {currentEvent.title}
                </h2>
                {currentEvent.description ? (
                  <p className="text-sm text-[#1F1B33]/70 max-w-2xl">
                    {currentEvent.description}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-[#1F1B33]/75">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-4 text-[#1F1B33]/50" />
                    {new Date(currentEvent.eventDate).toLocaleString("es-MX", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 text-[#1F1B33]/50" />
                    {currentEvent.location}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <Link href={`/recepcion/${currentEvent.id}`}>
                  <Button variant="secondary">
                    <QrCode className="size-4" />
                    Abrir Escáner de Puerta (Staff)
                  </Button>
                </Link>
                {currentEvent.receptionPin ? (
                  <span className="text-xs text-[#1F1B33]/60">
                    PIN de prueba del staff: <strong className="font-mono">{currentEvent.receptionPin}</strong>
                  </span>
                ) : null}
              </div>
            </div>

            {/* Métricas */}
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[#1F1B33]/10 pt-6 sm:grid-cols-3">
              <div className="rounded-xl bg-[#F7F5FA] p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-[#1F1B33]/60">
                  Grupos / Familias
                </p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">
                  {currentEvent.guests.length}{" "}
                  <span className="text-sm font-normal text-[#1F1B33]/60">
                    ({totalPasses} pases totales)
                  </span>
                </p>
              </div>
              <div className="rounded-xl bg-[#F7F5FA] p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-[#1F1B33]/60">
                  Pases Confirmados (RSVP)
                </p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-emerald-700">
                  {confirmedPasses}{" "}
                  <span className="text-sm font-normal text-[#1F1B33]/60">
                    de {totalPasses}
                  </span>
                </p>
              </div>
              <div className="rounded-xl bg-[#F7F5FA] p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-[#1F1B33]/60">
                  Admitidos en Puerta (Check-in)
                </p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-[#1F1B33]">
                  {admittedPasses}{" "}
                  <span className="text-sm font-normal text-[#1F1B33]/60">
                    de {confirmedPasses} confirmados
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Agregar Invitado + Tabla de Invitados */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            {/* Formulario Agregar Invitado */}
            <div className="rounded-2xl border border-[#1F1B33]/10 bg-white p-6 shadow-sm space-y-4 h-fit">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-[#1F1B33]" />
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
                  Agregar familia o invitado
                </h3>
              </div>
              <form action={handleCreateGuest} className="space-y-4">
                <input type="hidden" name="eventId" value={currentEvent.id} />
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Familia o nombre en el pase</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Ej. Familia Hernández"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">WhatsApp (con lada)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+529991234567"
                    defaultValue="+52999"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="totalPasses">Número de pases asignados</Label>
                  <Input
                    id="totalPasses"
                    name="totalPasses"
                    type="number"
                    min={1}
                    max={20}
                    defaultValue={2}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  <Plus className="size-4" />
                  {isPending ? "Agregando…" : "Generar invitación"}
                </Button>
              </form>
            </div>

            {/* Lista de invitados con enlaces de prueba */}
            <div className="rounded-2xl border border-[#1F1B33]/10 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
                  Lista de invitados y enlaces de prueba
                </h3>
                <span className="text-xs text-[#1F1B33]/60">
                  Haz clic en &ldquo;Ver invitación&rdquo; para probar el RSVP y el QR
                </span>
              </div>

              {currentEvent.guests.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#1F1B33]/60">
                  Aún no hay invitados en este evento. Agrega el primero a la izquierda.
                </p>
              ) : (
                <div className="divide-y divide-[#1F1B33]/10">
                  {currentEvent.guests.map((g) => {
                    const inviteUrl = `${appUrl}/invitacion/${g.urlToken}`;
                    const whatsappText = encodeURIComponent(
                      `¡Hola ${g.fullName}! Están cordialmente invitados a *${currentEvent.title}* (${g.totalPasses} pases reservados). Confirmen su asistencia y descarguen su pase QR aquí: ${inviteUrl}`,
                    );
                    const whatsappLink = `https://wa.me/${g.phone.replace(/\D/g, "")}?text=${whatsappText}`;

                    return (
                      <div
                        key={g.id}
                        className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[#1F1B33]">{g.fullName}</p>
                            {g.status === "CONFIRMED" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="size-3" /> Confirmado
                              </span>
                            ) : g.status === "DECLINED" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 border border-red-200">
                                <XCircle className="size-3" /> Declinó
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">
                                <Clock className="size-3" /> Pendiente
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#1F1B33]/65">
                            {g.phone} · <strong>{g.totalPasses}</strong> pases asignados ·{" "}
                            <strong>{g.admittedPasses}</strong> admitidos en puerta
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/invitacion/${g.urlToken}`}>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="size-3.5" />
                              Ver invitación
                            </Button>
                          </Link>
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="default" size="sm">
                              <Share2 className="size-3.5" />
                              WhatsApp
                            </Button>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
