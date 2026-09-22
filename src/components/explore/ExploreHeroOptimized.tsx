import { Search, Users, CalendarCheck, CreditCard, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-fitness.jpg";

interface ExploreHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const quickSearches = [
  "Gyms in Lekki",
  "Personal Trainer",
  "Yoga Classes",
  "Weight Loss",
  "CrossFit",
];

const INFO_CARDS = [
  { icon: Search, title: "Browse", desc: "Discover verified fitness partners" },
  { icon: CalendarCheck, title: "Book", desc: "Schedule and reserve easily" },
  { icon: CreditCard, title: "Pay", desc: "Secure checkout with Paystack" },
  { icon: BarChart3, title: "Track", desc: "Manage your activity & bookings" },
];

export const ExploreHeroOptimized = ({ searchQuery, onSearchChange }: ExploreHeroProps) => {
  return (
    <div className="relative overflow-hidden rounded-3xl shadow-premium border border-primary/10"
         style={{ background: "linear-gradient(135deg, hsl(150 45% 94%) 0%, hsl(140 40% 90%) 100%)" }}>
      <div className="absolute -top-16 -right-16 w-72 h-72 bg-primary/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-secondary/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 p-4 sm:p-6 md:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 sm:space-y-4 flex-1">
            <Badge className="bg-primary/15 text-primary border-0 text-xs">Nigeria's fitness community</Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black leading-tight">
              Find your <span className="text-gradient">wellness people</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
              Discover gyms, trainers, healthy kitchens and creators across Nigeria. Book, pay and connect — all on WeFit.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search gyms, trainers, meals or creators..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 h-11 bg-background/90 backdrop-blur-sm"
                />
              </div>
              <Button className="h-11 px-6 shadow-glow gap-2"><Search className="h-4 w-4" /> Search</Button>
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-muted-foreground mr-0.5">Popular:</span>
              {quickSearches.map((term) => (
                <Badge
                  key={term}
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-all text-xs bg-background/70 hover:bg-primary hover:text-primary-foreground hover:border-primary",
                    searchQuery === term && "bg-primary text-primary-foreground border-primary"
                  )}
                  onClick={() => onSearchChange(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>

          <div className="hidden lg:block shrink-0">
            <div className="relative w-48 h-56 rounded-2xl overflow-hidden shadow-premium border-4 border-white">
              <img src={heroImage} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {INFO_CARDS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass rounded-xl p-3 flex items-start gap-2.5 shadow-card">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
