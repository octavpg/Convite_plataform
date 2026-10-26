"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isDemoMode } from "@/lib/env";
import { hashSecret, readLocalDb, writeLocalDb } from "@/lib/local-store";
import { prisma } from "@/lib/prisma";
import { requireHost } from "@/modules/auth/session";

const createEventSchema = z.object({
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres.").max(100),
  location: z.string().trim().min(3, "Ingresa la ubicación del evento.").max(140),
  eventDate: z.string().min(1, "Selecciona la fecha y hora del evento."),
  description: z.string().trim().max(400).optional(),
  receptionPin: z
    .string()
    .trim()
    .regex(/^\d{4,6}$/, "El PIN de recepción debe tener entre 4 y 6 dígitos numéricos."),
});

const createGuestSchema = z.object({
  eventId: z.string().uuid(),
  fullName: z.string().trim().min(2, "Ingresa el nombre del invitado o familia.").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{9,14}$/, "Usa formato con lada, ej. +529991234567"),
  totalPasses: z.coerce.number().int().min(1, "Mínimo 1 pase.").max(20, "Máximo 20 pases."),
});

export async function createEventAction(formData: FormData): Promise<{ error?: string; success?: string }> {
  const host = await requireHost();
  const raw = Object.fromEntries(formData);
  const parsed = createEventSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { title, location, eventDate, description, receptionPin } = parsed.data;
  const parsedDate = new Date(eventDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return { error: "Fecha inválida." };
  }

  if (isDemoMode()) {
    const db = readLocalDb();
    const now = new Date().toISOString();
    db.events.unshift({
      id: crypto.randomUUID(),
      hostId: host.id,
      title,
      description: description || null,
      eventDate: parsedDate.toISOString(),
      location,
      paymentStatus: "PAID",
      receptionPin,
      receptionPinHash: hashSecret(receptionPin),
      pinFailedAttempts: 0,
      pinLockedUntil: null,
      createdAt: now,
      updatedAt: now,
    });
    writeLocalDb(db);
    revalidatePath("/dashboard");
    return { success: "Evento creado correctamente." };
  }

  await prisma.event.create({
    data: {
      hostId: host.id,
      title,
      description: description || null,
      eventDate: parsedDate,
      location,
      receptionPinHash: hashSecret(receptionPin),
    },
  });

  revalidatePath("/dashboard");
  return { success: "Evento creado correctamente." };
}

export async function createGuestAction(formData: FormData): Promise<{ error?: string; success?: string }> {
  const host = await requireHost();
  const raw = Object.fromEntries(formData);
  const parsed = createGuestSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos del invitado inválidos." };
  }

  const { eventId, fullName, phone, totalPasses } = parsed.data;
  const normalizedPhone = phone.startsWith("+") ? phone : `+${phone}`;

  if (isDemoMode()) {
    const db = readLocalDb();
    const ev = db.events.find((e) => e.id === eventId && e.hostId === host.id);
    if (!ev) return { error: "No se encontró el evento." };

    const now = new Date().toISOString();
    db.guests.push({
      id: crypto.randomUUID(),
      eventId,
      fullName,
      phone: normalizedPhone,
      totalPasses,
      admittedPasses: 0,
      status: "INVITED",
      urlToken: crypto.randomUUID(),
      qrToken: crypto.randomUUID(),
      invitationSentAt: now,
      respondedAt: null,
      lastScanAt: null,
      createdAt: now,
      updatedAt: now,
    });
    writeLocalDb(db);
    revalidatePath("/dashboard");
    return { success: "Invitado agregado." };
  }

  const ev = await prisma.event.findFirst({ where: { id: eventId, hostId: host.id } });
  if (!ev) return { error: "No se encontró el evento." };

  await prisma.guest.create({
    data: {
      eventId,
      fullName,
      phone: normalizedPhone,
      totalPasses,
      invitationSentAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  return { success: "Invitado agregado." };
}

export async function respondInvitationAction(
  urlToken: string,
  decision: "CONFIRMED" | "DECLINED",
): Promise<{ error?: string }> {
  if (isDemoMode()) {
    const db = readLocalDb();
    const guest = db.guests.find((g) => g.urlToken === urlToken);
    if (!guest) return { error: "Invitación no encontrada." };
    guest.status = decision;
    guest.respondedAt = new Date().toISOString();
    guest.updatedAt = new Date().toISOString();
    writeLocalDb(db);
    revalidatePath(`/invitacion/${urlToken}`);
    revalidatePath("/dashboard");
    return {};
  }

  await prisma.guest.update({
    where: { urlToken },
    data: {
      status: decision,
      respondedAt: new Date(),
    },
  });

  revalidatePath(`/invitacion/${urlToken}`);
  revalidatePath("/dashboard");
  return {};
}

export async function checkInGuestAction(
  eventId: string,
  pin: string,
  qrToken: string,
  passesToAdmit: number,
): Promise<{ error?: string; success?: string }> {
  if (passesToAdmit < 1) return { error: "Debes admitir al menos 1 pase." };

  if (isDemoMode()) {
    const db = readLocalDb();
    const ev = db.events.find((e) => e.id === eventId);
    if (!ev) return { error: "Evento no encontrado." };

    if (ev.receptionPinHash !== hashSecret(pin.trim())) {
      return { error: "PIN de recepción incorrecto (en el evento demo es 1234)." };
    }

    const guest = db.guests.find((g) => g.eventId === eventId && g.qrToken === qrToken.trim());
    if (!guest) return { error: "Código QR no pertenece a este evento." };
    if (guest.status !== "CONFIRMED") {
      return { error: `El invitado está en estado ${guest.status} y no ha confirmado asistencia.` };
    }
    const remaining = guest.totalPasses - guest.admittedPasses;
    if (passesToAdmit > remaining) {
      return { error: `Solo quedan ${remaining} pases disponibles para ${guest.fullName}.` };
    }

    guest.admittedPasses += passesToAdmit;
    guest.lastScanAt = new Date().toISOString();
    guest.updatedAt = new Date().toISOString();
    writeLocalDb(db);
    revalidatePath("/dashboard");
    revalidatePath(`/recepcion/${eventId}`);
    return {
      success: `Acceso registrado: entraron ${passesToAdmit} persona(s) de ${guest.fullName}. (${guest.admittedPasses}/${guest.totalPasses} admitidos)`,
    };
  }

  const ev = await prisma.event.findUnique({ where: { id: eventId } });
  if (!ev) return { error: "Evento no encontrado." };

  if (ev.receptionPinHash !== hashSecret(pin.trim())) {
    return { error: "PIN de recepción incorrecto." };
  }

  const guest = await prisma.guest.findFirst({
    where: { eventId, qrToken: qrToken.trim() },
  });
  if (!guest) return { error: "Código QR no válido para este evento." };
  if (guest.status !== "CONFIRMED") {
    return { error: "El invitado aún no ha confirmado su asistencia." };
  }

  const remaining = guest.totalPasses - guest.admittedPasses;
  if (passesToAdmit > remaining) {
    return { error: `Solo quedan ${remaining} pases disponibles para ${guest.fullName}.` };
  }

  const updated = await prisma.guest.update({
    where: { id: guest.id },
    data: {
      admittedPasses: { increment: passesToAdmit },
      lastScanAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/recepcion/${eventId}`);
  return {
    success: `Acceso registrado: entraron ${passesToAdmit} persona(s) de ${updated.fullName}. (${updated.admittedPasses}/${updated.totalPasses} admitidos)`,
  };
}
