import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { paystackService } from "@/lib/paystackService";
import { useToast } from "@/hooks/use-toast";
import { track } from "@/lib/analytics";

/** Confirms Paystack return on any route (`?payment=success&reference=`). */
export function PaymentReturnHandler() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const ran = useRef(false);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const reference = searchParams.get("reference") ?? searchParams.get("trxref");
    if (payment !== "success" || !reference || ran.current) return;
    ran.current = true;

    const next = new URLSearchParams(searchParams);
    next.delete("payment");
    next.delete("reference");
    next.delete("trxref");
    setSearchParams(next, { replace: true });

    paystackService.verifyPayment(reference).then((result) => {
      const kind = result.kind ?? "subscription";
      if (kind === "subscription" && result.plan) {
        track.paymentCompleted(result.plan);
        toast({
          title: `Welcome to ${result.plan.charAt(0).toUpperCase() + result.plan.slice(1)}!`,
          description: "Your subscription is now active.",
        });
        return;
      }
      const labels: Record<string, string> = {
        meal_order: "Meal order paid",
        trainer_booking: "Session booked",
        gym_membership: "Membership paid",
        partnership: "Partnership paid",
      };
      toast({
        title: labels[kind] ?? "Payment confirmed",
        description: "The partner dashboard will show this transaction.",
      });
    }).catch(() => {
      toast({
        variant: "destructive",
        title: "Payment check failed",
        description: "If your card was charged, wait a moment or contact support.",
      });
    });
  }, [searchParams, setSearchParams, toast]);

  return null;
}
