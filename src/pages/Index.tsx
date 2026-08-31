import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ArrowRight, Dumbbell, UtensilsCrossed, Brain, TrendingUp, Users, Sparkles,
  Zap, Scan, Radio, Play, Star, CheckCircle2, ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import heroImage   from "@/assets/hero-fitness.jpg";
import workoutImage from "@/assets/workout-session.jpg";
import mealImage    from "@/assets/nigerian-meal.jpg";
import wefitLogo    from "@/assets/wefit-logo.png";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { NumberTicker } from "@/components/NumberTicker";

const FEATURES = [
  {
    icon: Brain,
    color: "bg-primary",
    title: "Coach Ada AI",
    desc: "Your 24/7 AI wellness coach — ask anything, get personalised tips and motivation in seconds.",
    link: "/dashboard",
    linkLabel: "Chat with Ada",
    accent: "primary",
  },
  {
    icon: Dumbbell,
    color: "bg-primary",
    title: "AI Workout Plans",
    desc: "Customised routines built for your level, equipment, and goals. Adapts as you improve.",
    link: "/workouts",
    linkLabel: "Explore workouts",
    accent: "primary",
  },
  {
    icon: UtensilsCrossed,
    color: "gradient-gold",
    title: "Nigerian Meal Plans",
    desc: "Balanced, calorie-tracked recommendations featuring real local dishes — jollof, egusi, suya and more.",
    link: "/nutrition",
    linkLabel: "View meal plans",
    accent: "secondary",
  },
  {
    icon: Scan,
    color: "gradient-gold",
    title: "Smart Food Scanner",
    desc: "Point your camera at any meal and instantly get nutritional data powered by Claude Vision AI.",
    link: "/nutrition",
    linkLabel: "Try the scanner",
    accent: "secondary",
  },
  {
    icon: Radio,
    color: "bg-primary",
    title: "Live Trainer Sessions",
    desc: "Watch certified Nigerian trainers go live daily. Real-time guidance and live chat — right from your phone.",
    link: "/workouts",
    linkLabel: "Watch live",
    accent: "primary",
  },
  {
    icon: Users,
    color: "gradient-gold",
    title: "Community Challenges",
    desc: "Compete with thousands of Nigerians, climb the leaderboard, and win badges every week.",
    link: "/community",
    linkLabel: "Join community",
    accent: "secondary",
  },
];

const MARQUEE_ITEMS = [
  "AI Workout Generator", "Nigerian Meal Plans", "Food Scanner", "Live Training Sessions",
  "Community Leaderboard", "Streak Tracking", "Coach Ada AI", "Progress Analytics",
  "Paystack Payments", "Push Notifications", "Dark Mode", "Installable PWA",
  "AI Workout Generator", "Nigerian Meal Plans", "Food Scanner", "Live Training Sessions",
  "Community Leaderboard", "Streak Tracking", "Coach Ada AI", "Progress Analytics",
  "Paystack Payments", "Push Notifications", "Dark Mode", "Installable PWA",
];

const WHY_ITEMS = [
  { icon: "🇳🇬", title: "Built for Nigeria", desc: "AI prompted around Nigerian foods, culture, and fitness habits — not a foreign app with a naira sticker." },
  { icon: "💳", title: "Pay with Paystack", desc: "Pro is ₦2,500/month. Upgrade or cancel through Paystack." },
  { icon: "📶", title: "Works on 3G", desc: "The app is a PWA you can install. AI, auth, and payments still need a connection." },
  { icon: "🔒", title: "Your data, secured", desc: "TLS in transit, encrypted at rest with our cloud providers. We do not sell your health logs." },
];

export default function Index() {
  const navigate = useNavigate();
  const featuresReveal  = useScrollReveal();
  const whyReveal       = useScrollReveal();
  const ctaReveal       = useScrollReveal();

  return (
    <div id="main-content" className="min-h-screen bg-background text-foreground">

      {/* ── Sticky nav ────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={wefitLogo} alt="WeFit" className="w-8 h-8 object-contain" />
              <span className="font-display font-bold text-lg text-gradient">WeFit</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
              {[["Features", "#features"], ["Pricing", "/pricing"], ["Community", "/community"], ["Blog", "/blog"]].map(([label, href]) =>
                href.startsWith("/") ? (
                  <Link key={label} to={href} className="hover:text-foreground transition-colors">{label}</Link>
                ) : (
                  <a key={label} href={href} className="hover:text-foreground transition-colors">{label}</a>
                )
              )}
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="hidden md:flex">Sign in</Button>
              </Link>
              <Button size="sm" className="shadow-glow gap-1.5" onClick={() => navigate("/auth?mode=signup")}>
                Get started <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[hsl(270_53%_4%)] pt-16">
        {/* Background orbs */}
        <div className="absolute -top-32 -right-32 w-[700px] h-[700px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-900/20 rounded-full blur-[200px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — copy */}
            <div className="space-y-8 animate-fade-in">
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 gap-2 px-4 py-1.5 text-sm">
                🇳🇬 AI fitness, built for Nigeria
              </Badge>

              <h1 className="font-display font-black text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-white">
                Train Harder.<br />
                Eat Better.<br />
                <span className="text-gradient">Live Nigerian.</span>
              </h1>

              <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">
                AI-powered workouts, authentic Nigerian meal plans, and live coaching — all built for your lifestyle and priced in naira.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="shadow-glow text-base font-semibold px-8 gap-2 bg-primary hover:bg-primary/90"
                  onClick={() => navigate("/auth?mode=signup")}
                >
                  Start Free Today <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-base gap-2" asChild>
                  <Link to="/pricing">
                    <Play className="w-4 h-4 fill-current" /> See pricing
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
                {[
                  { value: 500, suffix: "+", label: "Nigerian dishes in Ada’s knowledge" },
                  { value: 5,    suffix: "/day", label: "Free AI requests per feature" },
                  { value: 3,   suffix: " plans",  label: "Free, Pro, Elite" },
                ].map(({ value, suffix, label }) => (
                  <div key={label}>
                    <div className="font-display font-black text-2xl lg:text-3xl text-white">
                      <NumberTicker value={value} suffix={suffix} />
                    </div>
                    <div className="text-xs text-white/50 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — hero visual */}
            <div className="relative animate-slide-up hidden sm:block" style={{ animationDelay: "0.2s" }}>
              <div className="absolute -inset-6 bg-primary/20 rounded-[2.5rem] blur-3xl" />
              <div className="relative overflow-hidden rounded-3xl shadow-premium card-3d">
                <img src={heroImage} alt="Nigerian woman training with WeFit" className="w-full h-auto relative z-10 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07040e] via-transparent to-transparent" />
              </div>

              {/* Floating cards */}
              <div className="absolute -left-6 top-1/4 glass rounded-2xl p-3.5 shadow-premium animate-float border border-white/10"
                   style={{ animationDelay: "0.5s" }}>
                <p className="text-xs text-white/50 mb-0.5">Today's streak</p>
                <p className="font-display font-black text-2xl text-white">🔥 14 days</p>
              </div>

              <div className="absolute -right-4 bottom-1/4 glass rounded-2xl p-3.5 shadow-premium animate-float border border-white/10"
                   style={{ animationDelay: "1.5s" }}>
                <p className="text-xs text-white/50 mb-0.5">Calories burned</p>
                <div className="flex items-baseline gap-1">
                  <p className="font-display font-black text-2xl text-gradient">1,240</p>
                  <p className="text-xs text-white/50">kcal</p>
                </div>
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 glass rounded-xl px-4 py-2.5 shadow-premium border border-primary/20 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-white">AI Coach Ada is ready</span>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature marquee ───────────────────────────── */}
      <div className="bg-primary/5 border-y border-primary/10 py-3.5 overflow-hidden">
        <div className="marquee-track">
          {MARQUEE_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 mx-6 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ──────────────────────────────────── */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={featuresReveal.ref}>
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5">Everything you need</Badge>
            <h2 className="font-display font-black text-4xl md:text-5xl">
              Wellness powered by <span className="text-gradient">smart AI</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From AI-generated workouts to live trainer streams — one platform built for Nigerians, by Nigerians.
            </p>
          </div>

          <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-5 scroll-reveal ${featuresReveal.isVisible ? "visible" : ""}`}>
            {FEATURES.map((f, i) => (
              <Card
                key={f.title}
                className="group relative overflow-hidden glass border-border/40 hover:border-primary/30 hover:shadow-premium transition-all duration-500 p-6 stagger-item"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-5 relative z-10 shadow-glow group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2 relative z-10 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 relative z-10">{f.desc}</p>
                <Link
                  to={f.link}
                  className={`text-${f.accent} text-sm font-semibold inline-flex items-center gap-1 relative z-10 hover:gap-2 transition-all`}
                >
                  {f.linkLabel} <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── App preview split ─────────────────────────── */}
      <section className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-secondary/10 rounded-[2rem] blur-3xl" />
              <img src={mealImage} alt="Nigerian healthy meal" className="relative rounded-3xl shadow-premium w-full h-auto object-cover" />
              <div className="absolute -bottom-4 -right-4 glass rounded-2xl p-4 shadow-gold border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center flex-shrink-0">
                    <UtensilsCrossed className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Today's recommendation</p>
                    <p className="font-bold text-sm">Jollof Rice + Grilled Fish</p>
                    <p className="text-xs text-secondary font-medium">540 kcal · High protein</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <Badge className="bg-secondary/10 text-secondary border-secondary/20 gap-1.5">
                <UtensilsCrossed className="w-3 h-3" /> Smart Nutrition
              </Badge>
              <h2 className="font-display font-black text-4xl md:text-5xl leading-tight">
                Eat what you love,<br />
                <span className="text-gradient-gold">stay healthy</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                AI meal plans featuring authentic Nigerian cuisine — calorie-tracked, macro-balanced, and sourced from local ingredients you can actually find.
              </p>
              <ul className="space-y-3">
                {[
                  "Jollof, egusi, suya, moi moi and 500+ more dishes",
                  "Scan any food with your camera for instant nutrition data",
                  "Calorie and macro tracking designed around your goals",
                  "Healthy ingredient swaps without killing the taste",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-gold" asChild>
                <Link to="/nutrition">Explore meal plans <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why WeFit ─────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={whyReveal.ref}>
          <div className="text-center mb-14 space-y-4">
            <h2 className="font-display font-black text-4xl md:text-5xl">
              Why <span className="text-gradient">Nigerians choose</span> WeFit
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              We're not a western app with a naira price tag. We built this from the ground up for you.
            </p>
          </div>
          <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-5 scroll-reveal ${whyReveal.isVisible ? "visible" : ""}`}>
            {WHY_ITEMS.map((item, i) => (
              <Card
                key={item.title}
                className="glass border-border/40 p-6 hover:border-primary/30 hover:shadow-premium transition-all duration-400 stagger-item"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-base mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[hsl(270_53%_4%)] relative overflow-hidden" ref={ctaReveal.ref}>
        <div className="absolute inset-0 gradient-mesh opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/15 rounded-full blur-[100px]" />

        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 scroll-reveal ${ctaReveal.isVisible ? "visible" : ""}`}>
          <div className="max-w-3xl mx-auto space-y-8">
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 gap-2 px-4 py-1.5">
              <Star className="w-3 h-3 fill-current" /> Free to start · Paystack when you upgrade
            </Badge>
            <h2 className="font-display font-black text-4xl md:text-6xl text-white leading-tight">
              Your fitness journey<br />starts <span className="text-gradient">right now</span>
            </h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Free to start. Upgrade when you're ready. Built for Nigeria — yours to keep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="shadow-glow text-base font-semibold px-10 gap-2"
                onClick={() => navigate("/auth?mode=signup")}
              >
                <Zap className="w-4 h-4" /> Start for free
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-base" asChild>
                <Link to="/pricing">View pricing →</Link>
              </Button>
            </div>
            <p className="text-white/30 text-sm">No credit card required · Cancel anytime · Pay in ₦</p>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="bg-[hsl(270_53%_3%)] border-t border-white/5 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <img src={wefitLogo} alt="WeFit" className="w-7 h-7 object-contain" />
                <span className="font-display font-bold text-gradient">WeFit</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                Nigeria&apos;s AI-powered fitness platform. Train smarter, eat better, live healthier.
              </p>
            </div>
            {[
              { title: "Product", links: [["Dashboard", "/dashboard"], ["Workouts", "/workouts"], ["Nutrition", "/nutrition"], ["Pricing", "/pricing"]] },
              { title: "Company",  links: [["About", "/about"], ["Blog", "/blog"], ["Careers", "/careers"], ["Community", "/community"]] },
              { title: "Legal",    links: [["Privacy", "/privacy"], ["Terms", "/terms"], ["Security", "/security"]] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <Link to={href} className="text-sm text-white/50 hover:text-white/80 transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/30">© 2026 WeFit. Made in Nigeria.</p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-white/40">AI coaching · Nigerian meals · Paystack</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
