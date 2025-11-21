import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreditCard, Building2, Smartphone, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Gym {
  id: string;
  name: string;
  priceRange: string;
  location: string;
}

interface GymPaymentDialogProps {
  gym: Gym | null;
  open: boolean;
  onClose: () => void;
}

export const GymPaymentDialog = ({ gym, open, onClose }: GymPaymentDialogProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'plan' | 'payment' | 'confirmation'>('plan');
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [processing, setProcessing] = useState(false);

  const plans = [
    { id: 'monthly', name: 'Monthly', price: '₦25,000', savings: '' },
    { id: 'quarterly', name: 'Quarterly (3 months)', price: '₦65,000', savings: 'Save ₦10,000' },
    { id: 'yearly', name: 'Yearly (12 months)', price: '₦240,000', savings: 'Save ₦60,000' }
  ];

  const handlePayment = () => {
    if (!cardNumber || !cardExpiry || !cardCVV) {
      toast({
        title: "Missing Information",
        description: "Please fill in all payment details",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setStep('confirmation');
      
      // Save to localStorage
      const memberships = JSON.parse(localStorage.getItem('gym_memberships') || '[]');
      memberships.push({
        id: Date.now().toString(),
        gymId: gym?.id,
        gymName: gym?.name,
        plan: selectedPlan,
        startDate: new Date().toISOString(),
        status: 'active',
        paymentMethod
      });
      localStorage.setItem('gym_memberships', JSON.stringify(memberships));
    }, 2000);
  };

  const handleClose = () => {
    setStep('plan');
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
    setSelectedPlan('monthly');
    onClose();
  };

  if (!gym) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === 'plan' && (
          <>
            <DialogHeader>
              <DialogTitle>Select Membership Plan</DialogTitle>
              <DialogDescription>{gym.name} - {gym.location}</DialogDescription>
            </DialogHeader>
            
            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="space-y-3">
              {plans.map(plan => (
                <div key={plan.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value={plan.id} id={plan.id} />
                  <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{plan.name}</p>
                        {plan.savings && <p className="text-xs text-primary">{plan.savings}</p>}
                      </div>
                      <p className="font-bold text-lg">{plan.price}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={() => setStep('payment')}>Continue to Payment</Button>
            </DialogFooter>
          </>
        )}

        {step === 'payment' && (
          <>
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                {plans.find(p => p.id === selectedPlan)?.name} - {plans.find(p => p.id === selectedPlan)?.price}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-4 w-4" />
                      Debit/Credit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Building2 className="h-4 w-4" />
                      Bank Transfer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="ussd" id="ussd" />
                    <Label htmlFor="ussd" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Smartphone className="h-4 w-4" />
                      USSD
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {paymentMethod === 'card' && (
                <>
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        type="password"
                        placeholder="123"
                        value={cardCVV}
                        onChange={(e) => setCardCVV(e.target.value)}
                        maxLength={3}
                      />
                    </div>
                  </div>
                </>
              )}

              {paymentMethod === 'transfer' && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="font-semibold">Transfer to:</p>
                  <p className="text-sm">Bank: First Bank Nigeria</p>
                  <p className="text-sm">Account: 1234567890</p>
                  <p className="text-sm">Account Name: {gym.name}</p>
                  <p className="text-xs text-muted-foreground mt-2">Use your email as reference</p>
                </div>
              )}

              {paymentMethod === 'ussd' && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold mb-2">Dial USSD Code:</p>
                  <p className="text-lg font-mono">*737*50*{plans.find(p => p.id === selectedPlan)?.price.replace(/[₦,]/g, '')}#</p>
                  <p className="text-xs text-muted-foreground mt-2">Follow prompts on your phone</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('plan')}>Back</Button>
              <Button onClick={handlePayment} disabled={processing}>
                {processing ? "Processing..." : "Pay Now"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'confirmation' && (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
              </div>
              <DialogTitle className="text-center">Payment Successful!</DialogTitle>
              <DialogDescription className="text-center">
                Your membership has been activated
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gym:</span>
                <span className="font-semibold">{gym.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-semibold">{plans.find(p => p.id === selectedPlan)?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">{plans.find(p => p.id === selectedPlan)?.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="font-semibold">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
