import { useState } from "react";
import { Search, TrendingUp, Users, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const ExploreHero = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-mesh p-8 md:p-12 mb-8">
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient animate-fade-in">
          Nigerian Fitness Community
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Discover local gyms, trainers, nutritionists, and fitness resources across Nigeria
        </p>
        
        {/* Search Bar */}
        <div className="flex gap-2 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search gyms, trainers, nutritionists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary"
            />
          </div>
          <Button size="lg" className="h-12 px-8 shadow-glow">
            Search
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 mt-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="glass p-4 rounded-xl hover-lift">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <span className="text-2xl md:text-3xl font-bold text-primary">50+</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Gyms</p>
          </div>
          <div className="glass p-4 rounded-xl hover-lift" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl md:text-3xl font-bold text-primary">200+</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Trainers</p>
          </div>
          <div className="glass p-4 rounded-xl hover-lift" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-2xl md:text-3xl font-bold text-primary">1K+</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Members</p>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
    </div>
  );
};

// Fix missing Dumbbell import
import { Dumbbell } from "lucide-react";
