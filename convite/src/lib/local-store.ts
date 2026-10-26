import "server-only";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface LocalEvent {
  id: string;
  hostId: string;
  title: string;
  description: string | null;
  eventDate: string;
  location: string;
  paymentStatus: "PENDING" | "PAID";
  receptionPin: string;
  receptionPinHash: string;
  pinFailedAttempts: number;
  pinLockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocalGuest {
  id: string;
  eventId: string;
  fullName: string;
  phone: string;
  totalPasses: number;
  admittedPasses: number;
  status: "INVITED" | "CONFIRMED" | "DECLINED";
  urlToken: string;
  qrToken: string;
  invitationSentAt: string | null;
  respondedAt: string | null;
  lastScanAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LocalDbSchema {
  users: LocalUser[];
  events: LocalEvent[];
  guests: LocalGuest[];
}

const DB_PATH = path.join(process.cwd(), ".convite-local-db.json");

export function hashSecret(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

function createInitialDb(): LocalDbSchema {
  const demoHostId = "11111111-1111-4111-8111-111111111111";
  const demoEventId = "22222222-2222-4222-8222-222222222222";
  const now = new Date().toISOString();

  return {
    users: [
      {
        id: demoHostId,
        email: "demo@convite.mx",
        name: "Ana y Luis (Demo)",
        passwordHash: hashSecret("convite123"),
        createdAt: now,
      },
    ],
    events: [
      {
        id: demoEventId,
        hostId: demoHostId,
        title: "Boda de Ana y Luis",
        description: "Recepción y cena en Hacienda Teya. Código de vestimenta: Formal Riguroso / Guayabera de gala.",
        eventDate: "2026-11-14T20:00:00.000Z",
        location: "Hacienda Teya, Mérida, Yucatán",
        paymentStatus: "PAID",
        receptionPin: "1234",
        receptionPinHash: hashSecret("1234"),
        pinFailedAttempts: 0,
        pinLockedUntil: null,
        createdAt: now,
        updatedAt: now,
      },
    ],
    guests: [
      {
        id: "33333333-3333-4333-8333-333333333331",
        eventId: demoEventId,
        fullName: "Familia Pérez Garza",
        phone: "+529991234567",
        totalPasses: 4,
        admittedPasses: 0,
        status: "CONFIRMED",
        urlToken: "44444444-4444-4444-8444-444444444441",
        qrToken: "55555555-5555-4555-8555-555555555551",
        invitationSentAt: now,
        respondedAt: now,
        lastScanAt: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "33333333-3333-4333-8333-333333333332",
        eventId: demoEventId,
        fullName: "Carlos Méndez y acompañante",
        phone: "+529997654321",
        totalPasses: 2,
        admittedPasses: 0,
        status: "INVITED",
        urlToken: "44444444-4444-4444-8444-444444444442",
        qrToken: "55555555-5555-4555-8555-555555555552",
        invitationSentAt: now,
        respondedAt: null,
        lastScanAt: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "33333333-3333-4333-8333-333333333333",
        eventId: demoEventId,
        fullName: "Familia Cámara Peón",
        phone: "+529999887766",
        totalPasses: 5,
        admittedPasses: 3,
        status: "CONFIRMED",
        urlToken: "44444444-4444-4444-8444-444444444443",
        qrToken: "55555555-5555-4555-8555-555555555553",
        invitationSentAt: now,
        respondedAt: now,
        lastScanAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

export function readLocalDb(): LocalDbSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initial = createInitialDb();
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw) as LocalDbSchema;
  } catch {
    return createInitialDb();
  }
}

export function writeLocalDb(data: LocalDbSchema): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}
