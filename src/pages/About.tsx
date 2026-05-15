import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Target, Users, Lightbulb, Mail, Phone, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const team = [
  { name: "Adaeze Okonkwo", role: "CEO & Co-Founder", bio: "Former nutrition scientist, passionate about African health data.", initials: "AO" },
  { name: "Emeka Eze", role: "CTO & Co-Founder", bio: "10+ years building health-tech platforms across West Africa.", initials: "EE" },
  { name: "Fatima Hassan", role: "Head of AI/ML", bio: "PhD in Machine Learning from University of Lagos.", initials: "FH" },
  { name: "Chidi Okafor", role: "Head of Product", bio: "Former product lead at Konga and Flutterwave.", initials: "CO" },
  { name: "Ngozi Adeyemi", role: "Head of Nutrition", bio: "Registered dietitian specialising in Nigerian diets.", initials: "NA" },
  { name: "Tunde Balogun", role: "Head of Growth", bio: "Growth marketer with a background in fitness coaching.", initials: "TB" },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "500+", label: "Nigerian Dishes" },
  { value: "10M+", label: "Calories Tracked" },
  { value: "4.9★", label: "App Rating" },
];

const values = [
  { icon: Heart, title: "Health for Everyone", desc: "We believe great wellness tools should be accessible to every Nigerian, regardless of income." },
  { icon: Target, title: "Culturally Grounded", desc: "Our AI is trained on authentic Nigerian foods, habits, and lifestyles — not imported data." },
  { icon: Users, title: "Community First", desc: "Wellness is a shared journey. We build features that connect and uplift communities." },
  { icon: Lightbulb, title: "Relentlessly Innovative", desc: "We keep building smarter tools so our users can focus on living healthier lives." },
];

export default function About() {
  const navigate = useNavigate();

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
        <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">
          <Badge className="bg-primary/10 text-primary border-primary/20">Our Mission</Badge>
          <h1 className="font-display text-4xl md:text-6xl font-bold">
            Built for <span className="text-gradient">Nigeria</span>,{" "}
            <br className="hidden md:block" />
            Built for You
          </h1>
          <p className="text-lg text-muted-foreground">
            WeFit was born from a simple frustration: global fitness apps don&apos;t understand Nigerian foods, bodies, or lifestyles. So we built one that does.
          </p>
          <Button className="shadow-glow" onClick={() => navigate("/onboarding")}>
            Join the Movement
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center p-6 border-border/50 hover:shadow-lg transition-all">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="font-display text-3xl md:text-4xl font-bold">The Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                In 2023, Adaeze Okonkwo and Emeka Eze were building separate health apps when they met at a Lagos tech conference. Both had the same problem: every AI nutrition tool they tried couldn&apos;t recognise a plate of egusi soup or tell the difference between eba and fufu.
              </p>
              <p>
                They co-founded WeFit with a mission to create an AI wellness companion that actually understands Nigerian lifestyles. Within 6 months, they had a prototype. Within 12 months, 10,000 users. Today, WeFit serves over 50,000 Nigerians across all 36 states.
              </p>
              <p>
                We&apos;re backed by leading African venture capital firms and a community of passionate users who believe technology should reflect their culture.
              </p>
            </div>
          </div>
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <div className="space-y-6">
              <div className="text-5xl">🇳🇬</div>
              <blockquote className="text-lg font-medium italic">
                &ldquo;We didn&apos;t want to import another Western wellness app and slap a naira sign on it. We built this from scratch, for Nigerians, by Nigerians.&rdquo;
              </blockquote>
              <div>
                <p className="font-semibold">Adaeze Okonkwo</p>
                <p className="text-sm text-muted-foreground">CEO &amp; Co-Founder, WeFit</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-20">
          <h2 className="font-display text-3xl font-bold text-center mb-10">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <Card key={v.title} className="p-6 hover:shadow-lg transition-all border-border/50 group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="font-display text-3xl font-bold text-center mb-10">The Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member) => (
              <Card key={member.name} className="p-6 hover:shadow-lg transition-all border-border/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-xs text-primary">{member.role}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6" id="support">
          <Card className="p-6 border-border/50" id="contact">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Contact Us</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Reach our team for help, partnerships, or press inquiries.</p>
            <p className="text-sm font-medium">hello@wefit.ng</p>
            <p className="text-sm font-medium">+234 812 345 6789</p>
          </Card>
          <Card className="p-6 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-5 h-5 text-secondary" />
              <h3 className="font-semibold">Help Center</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Browse our knowledge base or chat with Ada for instant support.</p>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/auth")}>
              Open Help Center
            </Button>
          </Card>
          <Card className="p-6 border-border/50" id="privacy">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Privacy Policy</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Your data belongs to you. We never sell personal health data to third parties. All data is encrypted and stored securely within Nigeria.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
