"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, MapPin, Clock, Briefcase, Heart, Zap, Coffee, Users } from "lucide-react";
import Link from "next/link";

const roles = [
  {
    title: "Senior AI Engineer",
    team: "AI/ML",
    location: "Lagos, Nigeria (Remote OK)",
    type: "Full-time",
    description: "Build and improve our AI models for workout generation, food recognition, and personalised coaching.",
    tags: ["Python", "PyTorch", "LLMs", "FastAPI"],
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Product Designer (UI/UX)",
    team: "Product",
    location: "Lagos, Nigeria",
    type: "Full-time",
    description: "Design beautiful, intuitive interfaces that make health tracking feel effortless for millions of Nigerians.",
    tags: ["Figma", "User Research", "Mobile-first"],
    color: "bg-secondary/10 text-secondary",
  },
  {
    title: "Backend Engineer (Node.js)",
    team: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Scale our API infrastructure to support our growing user base across Nigeria and West Africa.",
    tags: ["Node.js", "PostgreSQL", "Redis", "AWS"],
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Partnerships Manager — Health Sector",
    team: "Business",
    location: "Lagos, Nigeria",
    type: "Full-time",
    description: "Build relationships with hospitals, gyms, food vendors, and corporate clients to grow the WeFit ecosystem.",
    tags: ["B2B Sales", "Healthcare", "Networking"],
    color: "bg-purple-500/10 text-purple-600",
  },
];

const perks = [
  { icon: Heart, title: "Premium Health Coverage", desc: "Full medical, dental, and vision for you and your family." },
  { icon: Zap, title: "WeFit Elite Membership", desc: "Free Elite plan for all employees, because we practice what we preach." },
  { icon: Coffee, title: "Flexible Work", desc: "Hybrid and remote options with a beautiful Lagos office when you want it." },
  { icon: Users, title: "Learning Budget", desc: "₦200K/year for courses, conferences, and certifications." },
];

export default function CareersPage() {
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
          <Badge className="bg-primary/10 text-primary border-primary/20">We&apos;re Hiring</Badge>
          <h1 className="font-display text-4xl md:text-6xl font-bold">
            Build the Future of{" "}
            <br className="hidden md:block" />
            <span className="text-gradient">African Wellness</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join a team that&apos;s passionate about making health technology work for every Nigerian. Remote-friendly, mission-driven, and fast-growing.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-20 items-center">
          <div className="space-y-4">
            <h2 className="font-display text-3xl font-bold">Why WeFit?</h2>
            <p className="text-muted-foreground">
              We&apos;re a 40-person team based in Lagos with remote members across Nigeria and Africa. Our culture is built on speed, empathy, and ambition — with the understanding that health and rest matter as much as hustle.
            </p>
            <p className="text-muted-foreground">
              We&apos;ve grown 5x in 12 months. We&apos;re profitable. And we&apos;re just getting started.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {perks.map((perk) => {
              const Icon = perk.icon;
              return (
                <Card key={perk.title} className="p-4 hover:shadow-lg transition-all border-border/50">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{perk.title}</h4>
                  <p className="text-xs text-muted-foreground">{perk.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="font-display text-3xl font-bold mb-8 text-center">Open Roles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {roles.map((role) => (
              <Card key={role.title} className="hover:shadow-xl transition-all group border-border/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className={`text-xs ${role.color}`}>{role.team}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /> {role.type}
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{role.title}</CardTitle>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" /> {role.location}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription>{role.description}</CardDescription>
                  <div className="flex flex-wrap gap-1.5">
                    {role.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <Button className="w-full shadow-glow">
                    Apply Now
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-8 md:p-12 text-center bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">Don&apos;t See Your Role?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            We&apos;re always looking for talented, mission-driven people. Send us your CV and tell us how you&apos;d contribute to building healthier Nigeria.
          </p>
          <Button className="shadow-glow" size="lg">
            Send Open Application
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
