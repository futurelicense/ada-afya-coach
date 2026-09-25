import { Search, CalendarCheck, CreditCard, BarChart3, MapPin, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/reference/explore-hero.png";

interface ExploreHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const INFO_CARDS = [
  { icon: Search, title: "Browse", desc: "Discover verified fitness partners", tone: "bg-emerald-50 text-emerald-600" },
  { icon: CalendarCheck, title: "Book", desc: "Schedule and reserve easily", tone: "bg-amber-50 text-amber-500" },
  { icon: CreditCard, title: "Pay", desc: "Secure checkout with Paystack", tone: "bg-blue-50 text-blue-600" },
  { icon: BarChart3, title: "Track", desc: "Manage your activity & bookings", tone: "bg-violet-50 text-violet-600" },
];

export const ExploreHeroOptimized = ({ searchQuery, onSearchChange }: ExploreHeroProps) => {
  return (
    <div className="space-y-4">
      <section
        className="relative min-h-[330px] overflow-hidden rounded-2xl border border-primary/10 shadow-card"
        style={{ background: "linear-gradient(120deg, #ecfaf2 0%, #ddf6e8 100%)" }}
      >
        <div className="absolute inset-y-0 right-0 hidden w-[48%] lg:block">
          <img src={heroImage} alt="WeFit community" className="h-full w-full object-cover object-center mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#e5f8ed] via-[#e5f8ed]/20 to-transparent" />
        </div>
        <div className="absolute bottom-4 right-6 hidden rotate-3 font-script text-xl leading-tight text-[#174b3a] lg:block">
          Stronger<br />Healthier<br />Happier<br />Together
        </div>
        <Heart className="absolute right-8 top-8 h-7 w-7 text-primary/50 lg:right-10" />

        <div className="relative z-10 flex min-h-[330px] max-w-3xl flex-col justify-center p-6 sm:p-8 lg:w-[66%] lg:p-10">
          <Badge className="mb-3 w-fit border-0 bg-primary/10 text-[10px] uppercase tracking-wide text-primary">
            Nigeria's fitness community
          </Badge>
          <h1 className="font-display text-4xl font-black leading-[.95] tracking-tight text-[#10233f] sm:text-5xl">
            Find your<br /><span className="text-primary">wellness people</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-[#536579]">
            Discover gyms, trainers, healthy kitchens and creators across Nigeria. Book, pay and connect — all on WeFit.
          </p>

          <div className="mt-6 flex max-w-2xl flex-col overflow-hidden rounded-xl bg-white p-1.5 shadow-elevated sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search gyms, trainers, meals, or creators in Nigeria..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-11 border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="hidden items-center gap-1 border-l px-3 text-xs text-muted-foreground sm:flex">
              <MapPin className="h-3.5 w-3.5 text-primary" /> Lagos, Nigeria
            </div>
            <Button className="h-11 gap-2 px-6 shadow-glow"><Search className="h-4 w-4" /> Search</Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {INFO_CARDS.map(({ icon: Icon, title, desc, tone }) => (
          <div key={title} className="flex items-center gap-3 rounded-xl border bg-white p-3.5 shadow-card">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#10233f]">{title}</p>
              <p className="text-[10px] leading-tight text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
