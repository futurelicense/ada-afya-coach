import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { naira, startMarketplaceCheckout } from "@/lib/marketplaceService";

interface Trainer {
  id: string;
  name: string;
  specialty: string;
  pricePerSession: number;
  location: string;
}

interface TrainerBookingDialogProps {
  trainer: Trainer | null;
  open: boolean;
  onClose: () => void;
  gyms?: Array<{ id: string; name: string; location: string }>;
}

export const TrainerBookingDialog = ({ trainer, open, onClose }: TrainerBookingDialogProps) => {
  const { toast } = useToast();
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [sessionType, setSessionType] = useState("single");
  const [bookingNotes, setBookingNotes] = useState("");
  const [sending, setSending] = useState(false);

  const amount = trainer
    ? sessionType === "package-10"
      ? Math.round(trainer.pricePerSession * 10 * 0.85)
      : sessionType === "package-5"
        ? Math.round(trainer.pricePerSession * 5 * 0.9)
        : trainer.pricePerSession
    : 0;

  const pay = async () => {
    if (!trainer || !bookingDate || !bookingTime) {
      toast({ title: "Choose a date and time", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await startMarketplaceCheckout({
        kind: "trainer_booking",
        listingId: trainer.id,
        scheduledAt: `${bookingDate}T${bookingTime}:00`,
        sessionType,
        notes: bookingNotes,
        callbackPath: "/explore",
      });
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: err instanceof Error ? err.message : "Sign in and try again.",
      });
      setSending(false);
    }
  };

  if (!trainer) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book {trainer.name}</DialogTitle>
          <DialogDescription>
            {trainer.specialty}. Pay the session fee now. The trainer sees the booking once Paystack confirms.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Session</Label>
            <Select value={sessionType} onValueChange={setSessionType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single — {naira(trainer.pricePerSession)}</SelectItem>
                <SelectItem value="package-5">5 sessions — {naira(Math.round(trainer.pricePerSession * 5 * 0.9))}</SelectItem>
                <SelectItem value="package-10">10 sessions — {naira(Math.round(trainer.pricePerSession * 10 * 0.85))}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4" />Date</Label>
              <Input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <Label className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4" />Time</Label>
              <Input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)} rows={3} />
          </div>
          <p className="text-sm font-semibold">Due now: {naira(amount)}</p>
        </div>

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
