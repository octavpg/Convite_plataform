import "server-only";
import { isDemoMode } from "@/lib/env";
import { readLocalDb } from "@/lib/local-store";
import { prisma } from "@/lib/prisma";

export interface EventWithGuestsDTO {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  location: string;
  paymentStatus: "PENDING" | "PAID";
  receptionPin?: string;
  guests: {
    id: string;
    fullName: string;
    phone: string;
    totalPasses: number;
    admittedPasses: number;
    status: "INVITED" | "CONFIRMED" | "DECLINED";
    urlToken: string;
    qrToken: string;
  }[];
}

export async function getHostEvents(hostId: string): Promise<EventWithGuestsDTO[]> {
  if (isDemoMode()) {
    const db = readLocalDb();
    return db.events
      .filter((e) => e.hostId === hostId)
      .map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        eventDate: e.eventDate,
        location: e.location,
        paymentStatus: e.paymentStatus,
        receptionPin: e.receptionPin,
        guests: db.guests
          .filter((g) => g.eventId === e.id)
          .map((g) => ({
            id: g.id,
            fullName: g.fullName,
            phone: g.phone,
            totalPasses: g.totalPasses,
            admittedPasses: g.admittedPasses,
            status: g.status,
            urlToken: g.urlToken,
            qrToken: g.qrToken,
          })),
      }));
  }

  const events = await prisma.event.findMany({
    where: { hostId },
    orderBy: { eventDate: "asc" },
    include: {
      guests: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    eventDate: e.eventDate.toISOString(),
    location: e.location,
    paymentStatus: e.paymentStatus,
    guests: e.guests.map((g) => ({
      id: g.id,
      fullName: g.fullName,
      phone: g.phone,
      totalPasses: g.totalPasses,
      admittedPasses: g.admittedPasses,
      status: g.status,
      urlToken: g.urlToken,
      qrToken: g.qrToken,
    })),
  }));
}

export async function getInvitationByUrlToken(urlToken: string) {
  if (isDemoMode()) {
    const db = readLocalDb();
    const guest = db.guests.find((g) => g.urlToken === urlToken);
    if (!guest) return null;
    const event = db.events.find((e) => e.id === guest.eventId);
    if (!event) return null;
    return { guest, event };
  }

  const guest = await prisma.guest.findUnique({
    where: { urlToken },
    include: { event: true },
  });
  if (!guest) return null;

  return {
    guest: {
      ...guest,
      createdAt: guest.createdAt.toISOString(),
      updatedAt: guest.updatedAt.toISOString(),
      invitationSentAt: guest.invitationSentAt?.toISOString() ?? null,
      respondedAt: guest.respondedAt?.toISOString() ?? null,
      lastScanAt: guest.lastScanAt?.toISOString() ?? null,
    },
    event: {
      ...guest.event,
      eventDate: guest.event.eventDate.toISOString(),
    },
  };
}

export async function getEventForReception(eventId: string) {
  if (isDemoMode()) {
    const db = readLocalDb();
    const event = db.events.find((e) => e.id === eventId);
    if (!event) return null;
    const guests = db.guests.filter((g) => g.eventId === eventId);
    return { event, guests };
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { guests: { orderBy: { fullName: "asc" } } },
  });
  if (!event) return null;

  return {
    event: {
      ...event,
      eventDate: event.eventDate.toISOString(),
      receptionPin: undefined,
    },
    guests: event.guests.map((g) => ({
      id: g.id,
      fullName: g.fullName,
      phone: g.phone,
      totalPasses: g.totalPasses,
      admittedPasses: g.admittedPasses,
      status: g.status,
      urlToken: g.urlToken,
      qrToken: g.qrToken,
    })),
  };
}
