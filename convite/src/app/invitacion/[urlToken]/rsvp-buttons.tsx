"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { respondInvitationAction } from "@/modules/events/actions";

export function RsvpButtons({
  urlToken,
  currentStatus,
}: {
  urlToken: string;
  currentStatus: "INVITED" | "CONFIRMED" | "DECLINED";
}) {
  const [isPending, startTransition] = useTransition();

  function handleDecision(decision: "CONFIRMED" | "DECLINED") {
    startTransition(async () => {
      await respondInvitationAction(urlToken, decision);
    });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-2">
      <Button
        type="button"
        disabled={isPending || currentStatus === "CONFIRMED"}
        onClick={() => handleDecision("CONFIRMED")}
        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white"
      >
        <Check className="size-4" />
        {currentStatus === "CONFIRMED" ? "Asistencia confirmada" : "Confirmar asistencia"}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={isPending || currentStatus === "DECLINED"}
        onClick={() => handleDecision("DECLINED")}
        className="flex-1"
      >
        <X className="size-4" />
        {currentStatus === "DECLINED" ? "Asistencia declinada" : "No podremos asistir"}
      </Button>
    </div>
  );
}
