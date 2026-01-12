import { useState } from "react";
import { Search, MapPin, Sparkles } from "lucide-react";
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
    <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-mesh p-6 md:p-10 lg:p-12">
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5 md:space-y-6">
        {/* Badge */}
        <Badge className="bg-primary/10 text-primary border-0 px-3 py-1">
          <Sparkles className="h-3 w-3 mr-1" />
          Discover Fitness in Nigeria
        </Badge>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gradient animate-fade-in leading-tight">
          Nigerian Fitness Community
        </h1>
        
        {/* Subtitle */}
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Discover local gyms, trainers, nutritionists, and fitness resources across Nigeria
        </p>
        
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search gyms, trainers, nutritionists..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-12 bg-background/80 backdrop-blur-sm border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <Button size="lg" className="h-12 px-8 shadow-glow">
            <Search className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Search</span>
          </Button>
        </div>

        {/* Quick Searches */}
        <div className="flex flex-wrap justify-center gap-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <span className="text-xs text-muted-foreground mr-1 self-center">Popular:</span>
          {quickSearches.map((term) => (
            <Badge
              key={term}
              variant="outline"
              className={cn(
                "cursor-pointer transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary",
                searchQuery === term && "bg-primary text-primary-foreground border-primary"
              )}
              onClick={() => onSearchChange(term)}
            >
              {term}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mt-6 md:mt-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <StatCard icon="💪" value="50+" label="Gyms" />
          <StatCard icon="🏃" value="200+" label="Trainers" />
          <StatCard icon="👥" value="1K+" label="Members" />
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-48 md:w-72 h-48 md:h-72 bg-primary rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-secondary rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label }: { icon: string; value: string; label: string }) => (
  <div className="glass p-3 md:p-4 rounded-xl hover-lift transition-all">
    <div className="flex items-center justify-center gap-1.5 md:gap-2 mb-1">
      <span className="text-lg md:text-xl">{icon}</span>
      <span className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">{value}</span>
    </div>
    <p className="text-xs md:text-sm text-muted-foreground">{label}</p>
  </div>
);
