import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

export const ExploreHeroOptimized = ({ searchQuery, onSearchChange }: ExploreHeroProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-mesh p-3 sm:p-6 md:p-10 lg:p-12">
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-3 sm:space-y-4 md:space-y-6 overflow-hidden">
        {/* Badge */}
        <Badge className="bg-primary/10 text-primary border-0 px-2.5 py-0.5 text-xs sm:text-sm">
          <Sparkles className="h-3 w-3 mr-1" />
          Discover Fitness in Nigeria
        </Badge>

        {/* Headline */}
        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gradient animate-fade-in leading-tight break-words">
          Nigerian Fitness Community
        </h1>
        
        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Discover local gyms, trainers, nutritionists, and fitness resources across Nigeria
        </p>
        
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search gyms, trainers..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-10 sm:h-12 bg-background/80 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm sm:text-base"
            />
          </div>
          <Button size="default" className="h-10 sm:h-12 px-6 sm:px-8 shadow-glow">
            <Search className="h-4 w-4 mr-2 sm:mr-2" />
            <span>Search</span>
          </Button>
        </div>

        {/* Quick Searches */}
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <span className="text-xs text-muted-foreground mr-0.5 self-center">Popular:</span>
          {quickSearches.map((term) => (
            <Badge
              key={term}
              variant="outline"
              className={cn(
                "cursor-pointer transition-all text-xs hover:bg-primary hover:text-primary-foreground hover:border-primary",
                searchQuery === term && "bg-primary text-primary-foreground border-primary"
              )}
              onClick={() => onSearchChange(term)}
            >
              {term}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-6 mt-4 sm:mt-6 md:mt-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <StatCard icon="💪" value="50+" label="Gyms" />
          <StatCard icon="🏃" value="200+" label="Trainers" />
          <StatCard icon="👥" value="1K+" label="Members" />
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-32 sm:w-48 md:w-72 h-32 sm:h-48 md:h-72 bg-primary rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-40 sm:w-64 md:w-96 h-40 sm:h-64 md:h-96 bg-secondary rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label }: { icon: string; value: string; label: string }) => (
  <div className="glass p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl hover-lift transition-all">
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 mb-0.5 sm:mb-1">
      <span className="text-base sm:text-lg md:text-xl">{icon}</span>
      <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary">{value}</span>
    </div>
    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{label}</p>
  </div>
);
