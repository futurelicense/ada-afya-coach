import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { naira, startMarketplaceCheckout } from "@/lib/marketplaceService";

interface Gym {
  id: string;
  name: string;
  priceRange: string;
  location: string;
  membershipPlans?: Array<{ id: string; name: string; amount_naira: number; months: number }>;
}

interface GymPaymentDialogProps {
  gym: Gym | null;
  open: boolean;
  onClose: () => void;
}

const FALLBACK = [
  { id: "monthly", name: "Monthly", amount_naira: 25000, months: 1 },
  { id: "quarterly", name: "Quarterly", amount_naira: 65000, months: 3 },
  { id: "yearly", name: "Yearly", amount_naira: 240000, months: 12 },
];

export const GymPaymentDialog = ({ gym, open, onClose }: GymPaymentDialogProps) => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [sending, setSending] = useState(false);
  const plans = gym?.membershipPlans?.length ? gym.membershipPlans : FALLBACK;

  const pay = async () => {
    if (!gym) return;
    setSending(true);
    try {
      await startMarketplaceCheckout({
        kind: "gym_membership",
        listingId: gym.id,
        planId: selectedPlan,
        callbackPath: "/explore",
      });
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: err instanceof Error ? err.message : "Try again after signing in.",
      });
      setSending(false);
    }
  };

  if (!gym) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Join {gym.name}</DialogTitle>
          <DialogDescription>
            {gym.location}. Pay with Paystack. The gym owner sees your membership as soon as payment confirms.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="space-y-3">
          {plans.map((plan) => (
            <div key={plan.id} className="flex items-center space-x-3 p-4 border rounded-lg">
              <RadioGroupItem value={plan.id} id={plan.id} />
              <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                <div className="flex justify-between gap-2">
                  <p className="font-semibold">{plan.name}</p>
                  <p className="font-bold">{naira(plan.amount_naira)}</p>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => void pay()} disabled={sending}>
            {sending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Pay with Paystack
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
