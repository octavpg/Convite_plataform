"use client";

import { useState, useTransition } from "react";
import { QrCode, ShieldAlert, CheckCircle2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkInGuestAction } from "@/modules/events/actions";

interface GuestItem {
  id: string;
  fullName: string;
  totalPasses: number;
  admittedPasses: number;
  status: "INVITED" | "CONFIRMED" | "DECLINED";
  qrToken: string;
}

export function ScannerClient({
  eventId,
  guests,
}: {
  eventId: string;
  guests: GuestItem[];
}) {
  const [pin, setPin] = useState("1234");
  const [qrToken, setQrToken] = useState(
    guests.find((g) => g.status === "CONFIRMED")?.qrToken ?? "",
  );
  const [passesToAdmit, setPassesToAdmit] = useState(2);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCheckIn(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await checkInGuestAction(eventId, pin, qrToken, Number(passesToAdmit));
      if (res.error) {
        setMessage({ tone: "err", text: res.error });
      } else {
        setMessage({ tone: "ok", text: res.success ?? "Check-in realizado." });
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-[#1F1B33]/10 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <QrCode className="size-5 text-[#1F1B33]" />
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Validar QR en Puerta
          </h2>
        </div>

        {message ? (
          <div
            className={`flex items-start gap-2 rounded-xl border p-3.5 text-sm ${
              message.tone === "err"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-900"
            }`}
          >
            {message.tone === "err" ? (
              <ShieldAlert className="size-4 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        ) : null}

        <form onSubmit={handleCheckIn} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pin">PIN del personal de recepción</Label>
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Ej. 1234"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qrToken">Token QR escaneado (o selecciona un invitado a la derecha)</Label>
            <Input
              id="qrToken"
              value={qrToken}
              onChange={(e) => setQrToken(e.target.value)}
              placeholder="UUID del código QR"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="passesToAdmit">Personas que ingresan en este momento</Label>
            <Input
              id="passesToAdmit"
              type="number"
              min={1}
              max={20}
              value={passesToAdmit}
              onChange={(e) => setPassesToAdmit(Number(e.target.value))}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            <UserCheck className="size-4" />
            {isPending ? "Verificando…" : "Registrar entrada parcial / total"}
          </Button>
        </form>
      </div>

      {/* Lista rápida para simular escaneo con 1 clic */}
      <div className="rounded-2xl border border-[#1F1B33]/10 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
            Simulador de escaneo rápido
          </h3>
          <p className="text-xs text-[#1F1B33]/65">
            Haz clic en cualquier familia para cargar su código QR en el lector y probar el control de pases.
          </p>
        </div>

        <div className="divide-y divide-[#1F1B33]/10">
          {guests.map((g) => {
            const remaining = g.totalPasses - g.admittedPasses;
            return (
              <div key={g.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium">{g.fullName}</p>
                  <p className="text-xs text-[#1F1B33]/65">
                    Estado: <strong>{g.status}</strong> · Admitidos:{" "}
                    <strong>
                      {g.admittedPasses}/{g.totalPasses}
                    </strong>{" "}
                    (disponibles: {remaining})
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQrToken(g.qrToken);
                    setPassesToAdmit(Math.max(1, remaining));
                  }}
                >
                  Cargar QR
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
