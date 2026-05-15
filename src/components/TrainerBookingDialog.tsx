import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, Clock } from "lucide-react";

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
  gyms: Array<{ id: string; name: string; location: string }>;
}

export const TrainerBookingDialog = ({ trainer, open, onClose, gyms }: TrainerBookingDialogProps) => {
  const { toast } = useToast();
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [selectedGym, setSelectedGym] = useState("");
  const [sessionType, setSessionType] = useState("single");
  const [bookingNotes, setBookingNotes] = useState("");

  const handleBookingSubmit = () => {
    if (!bookingDate || !bookingTime || !selectedGym) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Save booking to localStorage
    const bookings = JSON.parse(localStorage.getItem('trainer_bookings') || '[]');
    const selectedGymData = gyms.find(g => g.id === selectedGym);
    
    bookings.push({
      id: Date.now().toString(),
      trainerId: trainer?.id,
      trainerName: trainer?.name,
      gymId: selectedGym,
      gymName: selectedGymData?.name,
      gymLocation: selectedGymData?.location,
      date: bookingDate,
      time: bookingTime,
      sessionType,
      notes: bookingNotes,
      status: 'confirmed',
      price: trainer?.pricePerSession
    });
    
    localStorage.setItem('trainer_bookings', JSON.stringify(bookings));

    toast({
      title: "Booking Confirmed! 🎉",
      description: `Session with ${trainer?.name} at ${selectedGymData?.name} on ${new Date(bookingDate).toLocaleDateString()}`,
    });

    // Reset form
    setBookingDate("");
    setBookingTime("");
    setSelectedGym("");
    setSessionType("single");
    setBookingNotes("");
    onClose();
  };

  if (!trainer) return null;

  const selectedGymData = gyms.find(g => g.id === selectedGym);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Training Session</DialogTitle>
          <DialogDescription>
            {trainer.name} - {trainer.specialty}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="sessionType">Session Type</Label>
            <Select value={sessionType} onValueChange={setSessionType}>
              <SelectTrigger id="sessionType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Session - ₦{trainer.pricePerSession}</SelectItem>
                <SelectItem value="package-5">5 Sessions Package - ₦{trainer.pricePerSession * 5 * 0.9} (Save 10%)</SelectItem>
                <SelectItem value="package-10">10 Sessions Package - ₦{trainer.pricePerSession * 10 * 0.85} (Save 15%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="gym" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Select Gym Location
            </Label>
            <Select value={selectedGym} onValueChange={setSelectedGym}>
              <SelectTrigger id="gym">
                <SelectValue placeholder="Choose a gym..." />
              </SelectTrigger>
              <SelectContent>
                {gyms.map(gym => (
                  <SelectItem key={gym.id} value={gym.id}>
                    {gym.name} - {gym.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedGymData && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {selectedGymData.location}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="time" className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any specific goals or concerns..."
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between text-sm mb-1">
              <span>Trainer Fee:</span>
              <span className="font-semibold">₦{trainer.pricePerSession.toLocaleString()}</span>
            </div>
            {selectedGymData && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Location:</span>
                <span>{selectedGymData.name}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
          <Button onClick={handleBookingSubmit} className="w-full sm:w-auto">Confirm Booking</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
