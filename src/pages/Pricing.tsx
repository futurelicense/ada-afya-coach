import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Zap, Crown, Sparkles, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { paystackService } from "@/lib/paystackService";
import { useToast } from "@/hooks/use-toast";
import { track } from "@/lib/analytics";

const plans = [
  {
    name: "Free",
    price: "₦0",
    period: "forever",
    description: "Perfect for getting started with your wellness journey",
    icon: Sparkles,
    color: "text-muted-foreground",
    badgeColor: "bg-muted text-muted-foreground",
    planKey: null as null | 'pro' | 'elite',
    features: [
      "5 AI requests per feature per day (workouts, meals, chat, analysis, food scan)",
      "Meal and workout logging",
      "Community leaderboard and challenges",
      "Goal tracking",
      "Installable PWA",
    ],
    cta: "Get Started Free",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "₦2,500",
    period: "per month",
    description: "For serious fitness enthusiasts who want full AI power",
    icon: Zap,
    color: "text-primary",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
    popular: true,
    planKey: 'pro' as const,
    features: [
      "50 AI requests per feature per day",
      "Nigerian meal generation with shopping lists",
      "Coach Ada chat (same daily cap)",
      "Analytics and progress charts",
      "Voice-guided workouts",
      "Food scanner (counts toward scan quota)",
      "Watch live trainer sessions (when a trainer is live)",
      "Live session chat",
    ],
    cta: "Start Pro — ₦2,500/mo",
    variant: "default" as const,
  },
  {
    name: "Elite",
    price: "₦5,000",
    period: "per month",
    description: "For athletes and professionals who demand the best",
    icon: Crown,
    color: "text-yellow-500",
    badgeColor: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    planKey: 'elite' as const,
    features: [
      "Everything in Pro, with unlimited daily AI requests",
      "Go live as a trainer (broadcast workouts)",
      "Watch all live sessions",
      "Early access to new features",
    ],
    cta: "Go Elite — ₦5,000/mo",
    variant: "outline" as const,
  },
];

const faqs = [
  { q: "Can I switch plans anytime?", a: "Yes. Upgrade or change through Paystack. Access follows the subscription status we store after a successful payment or webhook." },
  { q: "Is there a free trial for Pro?", a: "No trial right now. You can use the Free plan with daily AI limits, then upgrade when you need more." },
  { q: "Do you support family plans?", a: "Not yet. Each account is billed separately." },
  { q: "What payment methods do you accept?", a: "Paystack accepts Nigerian cards, USSD, bank transfer, and mobile money where available." },
];

export default function Pricing() {
  const navigate  = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handlePlanClick(planKey: 'pro' | 'elite' | null) {
    if (!planKey) {
      // Free plan — go to sign up / onboarding
      navigate(session ? '/dashboard' : '/auth')
      return
    }

    if (!session) {
      toast({ title: 'Sign in first', description: 'Create a free account before upgrading.' })
      navigate('/auth')
      return
    }

    setLoadingPlan(planKey)
    try {
      track.paymentInitiated(planKey, planKey === 'pro' ? 2500 : 5000);
      await paystackService.startCheckout(planKey)
      // Browser redirects to Paystack — execution stops here
    } catch (err: any) {
      toast({
        variant:     'destructive',
        title:       'Payment error',
        description: err.message ?? 'Could not start checkout. Please try again.',
      })
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
            <span className="font-bold text-lg text-gradient ml-auto">WeFit</span>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <Badge className="bg-primary/10 text-primary border-primary/20">Simple Pricing</Badge>
          <h1 className="font-display text-4xl md:text-6xl font-bold">
            Invest in Your <span className="text-gradient">Health</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your wellness goals. Start free, upgrade when you&apos;re ready.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {plans.map((plan) => {
            const Icon      = plan.icon;
            const isLoading = loadingPlan === plan.planKey;

            return (
              <Card
                key={plan.name}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  plan.popular ? "border-primary ring-2 ring-primary/30 shadow-lg scale-[1.02]" : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary" />
                )}
                {plan.popular && (
                  <div className="absolute top-0 right-4">
                    <Badge className="rounded-t-none rounded-b-md bg-primary text-primary-foreground text-xs px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-muted ${plan.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge className={`text-xs ${plan.badgeColor}`}>{plan.name}</Badge>
                  </div>
                  <CardTitle className="text-3xl font-bold">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground ml-1">/{plan.period}</span>
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.variant}
                    className={`w-full ${plan.popular ? "shadow-glow" : ""}`}
                    disabled={isLoading}
                    onClick={() => handlePlanClick(plan.planKey)}
                  >
                    {isLoading
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirecting to Paystack...</>
                      : plan.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
