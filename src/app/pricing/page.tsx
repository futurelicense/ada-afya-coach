"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Zap, Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Free",
    price: "₦0",
    period: "forever",
    description: "Perfect for getting started with your wellness journey",
    icon: Sparkles,
    color: "text-muted-foreground",
    badgeColor: "bg-muted text-muted-foreground",
    features: [
      "3 AI-generated workouts/month",
      "Basic meal tracking",
      "Community access",
      "1 goal tracker",
      "Standard recipes (10)",
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
    features: [
      "Unlimited AI workouts",
      "Full Nigerian meal database (500+)",
      "Coach Ada chat — unlimited",
      "Advanced analytics & progress charts",
      "Voice-guided workouts",
      "Food scanner (AI recognition)",
      "Priority customer support",
    ],
    cta: "Start Pro Trial",
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
    features: [
      "Everything in Pro",
      "1-on-1 live trainer sessions (2/month)",
      "Custom meal delivery integration",
      "Team & corporate features",
      "White-label option",
      "Dedicated account manager",
      "Early access to new features",
    ],
    cta: "Go Elite",
    variant: "outline" as const,
  },
];

const faqs = [
  { q: "Can I switch plans anytime?", a: "Yes! You can upgrade or downgrade at any time. Changes take effect at your next billing cycle." },
  { q: "Is there a free trial for Pro?", a: "Absolutely. Pro comes with a 14-day free trial — no credit card required." },
  { q: "Do you support family plans?", a: "Family plans are coming soon. Sign up to be notified when they launch." },
  { q: "What payment methods do you accept?", a: "We accept all major Nigerian bank cards, Paystack, Flutterwave, and bank transfers." },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
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
            const Icon = plan.icon;
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
                    onClick={() => router.push("/onboarding")}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">Compare All Features</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold">Free</th>
                  <th className="text-center p-4 font-semibold text-primary">Pro</th>
                  <th className="text-center p-4 font-semibold text-yellow-600">Elite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["AI Workout Generator", "3/month", "Unlimited", "Unlimited"],
                  ["Nigerian Meal Database", "Basic", "Full (500+)", "Full (500+)"],
                  ["Coach Ada Chat", "5 messages/day", "Unlimited", "Unlimited"],
                  ["Voice-Guided Workouts", "—", "✓", "✓"],
                  ["Food Scanner", "—", "✓", "✓"],
                  ["Progress Analytics", "Basic", "Advanced", "Advanced + API"],
                  ["Live Trainer Sessions", "—", "—", "2/month"],
                  ["Corporate Features", "—", "—", "✓"],
                  ["Support", "Community", "Priority Email", "Dedicated Manager"],
                ].map(([feature, free, pro, elite], i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{feature}</td>
                    <td className="p-4 text-center text-muted-foreground">{free}</td>
                    <td className="p-4 text-center text-primary font-medium">{pro}</td>
                    <td className="p-4 text-center text-yellow-600 font-medium">{elite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
