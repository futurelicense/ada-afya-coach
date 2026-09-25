import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Zap, Crown, Sparkles, Loader2, ShieldCheck, Lock, Smartphone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { paystackService } from "@/lib/paystackService";
import { useToast } from "@/hooks/use-toast";
import { track } from "@/lib/analytics";
import heroImage from "@/assets/hero-fitness.jpg";

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
    color: "text-secondary",
    badgeColor: "bg-secondary/10 text-secondary border-secondary/20",
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-border/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link to="/" className="mr-3 text-xl font-black tracking-tight text-emerald-700">💚 <span className="text-slate-900">WeFit</span></Link>
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
            <span className="ml-auto hidden text-sm font-semibold sm:block">Simple plans. Stronger you.</span>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mb-5 overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-7 text-center sm:px-8">
          <span className="absolute -left-5 top-3 text-7xl opacity-20">🌿</span>
          <span className="absolute -right-3 bottom-0 text-7xl opacity-20">🌱</span>
          <Badge className="bg-primary/10 text-primary border-primary/20">Simple Pricing</Badge>
          <h1 className="mt-3 font-display text-4xl font-black tracking-tight md:text-6xl">
            Invest in Your <span className="text-gradient">Health</span>
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Choose the plan that fits your wellness goals. Start free, upgrade when you&apos;re ready.
          </p>
          <div className="mx-auto mt-4 flex w-fit rounded-full bg-white p-1 shadow-sm">
            <Button size="sm" className="h-8 rounded-full px-8">Monthly</Button>
            <Button size="sm" variant="ghost" className="h-8 rounded-full px-8">Yearly <span className="ml-2 text-[10px] text-emerald-600">Save more</span></Button>
          </div>
        </div>

        <div className="grid items-stretch gap-4 md:grid-cols-3 lg:gap-5 mb-5">
          {plans.map((plan) => {
            const Icon      = plan.icon;
            const isLoading = loadingPlan === plan.planKey;

            return (
              <Card
                key={plan.name}
                className={`relative flex overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  plan.popular ? "border-primary ring-2 ring-primary/20 shadow-lg" : plan.name === "Elite" ? "border-amber-100 bg-amber-50/40" : "border-border"
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
                <div className="flex w-full flex-col">
                <CardHeader className="pb-3 pt-7">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-muted ${plan.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge className={`text-xs ${plan.badgeColor}`}>{plan.name}</Badge>
                  </div>
                  <CardTitle className="text-3xl font-black">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground ml-1">/{plan.period}</span>
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col space-y-5">
                  <ul className="flex-1 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success flex-shrink-0" />
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
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mb-8 grid grid-cols-2 gap-2 rounded-2xl border bg-white p-3 shadow-sm md:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "Cancel anytime", desc: "No long-term commitment" },
            { icon: Lock,        title: "Secure checkout", desc: "Paystack keeps payments safe" },
            { icon: null,        title: "Built for Nigeria", desc: "Designed for our people", emoji: "🇳🇬" },
            { icon: Smartphone,  title: "Web and mobile", desc: "Fitness wherever you are" },
          ].map(({ icon: Icon, title, desc, emoji }) => (
            <div key={title} className="flex items-start gap-3 p-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-base">
                {Icon ? <Icon className="h-4 w-4 text-primary" /> : emoji}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-5xl">
          <p className="text-center text-xs font-semibold text-emerald-600">Questions? We&apos;ve got you.</p>
          <h2 className="mb-5 text-center text-2xl font-black">Frequently Asked Questions</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {faqs.map((faq, i) => (
              <Card key={i} className="border-border/50 shadow-sm">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="relative mt-7 overflow-hidden rounded-3xl p-7 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-primary/10"
             style={{ background: "linear-gradient(135deg, hsl(150 45% 95%) 0%, hsl(140 40% 91%) 100%)" }}>
          <div className="relative z-10 text-center md:text-left md:max-w-[45%]">
            <h3 className="text-2xl md:text-3xl font-display font-black">A Healthier You Starts Today</h3>
            <p className="text-muted-foreground mt-2">Join thousands of Nigerians building healthier habits with WeFit.</p>
          </div>
          <Button size="lg" className="relative z-10 shadow-glow gap-2 shrink-0" onClick={() => handlePlanClick(null)}>
            Start your wellness journey <Sparkles className="h-4 w-4" />
          </Button>
          <img src={heroImage} alt="" className="absolute bottom-0 right-0 hidden h-full w-[34%] object-cover opacity-90 lg:block" />
        </div>
      </div>
    </div>
  );
}
