import { MapPin, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const ExploreMap = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10"
      }`}
    >
      <Card className="overflow-hidden border-primary/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg sm:text-2xl md:text-3xl">
              Explore Locations
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-48 sm:h-64 md:h-96 rounded-lg sm:rounded-xl overflow-hidden bg-muted">
            {/* Map placeholder with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center p-4">
              <div className="text-center space-y-2 sm:space-y-4">
                <MapPin className="h-10 w-10 sm:h-12 md:h-16 sm:w-12 md:w-16 mx-auto text-primary animate-bounce" />
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-sm sm:text-base md:text-lg font-semibold">Interactive Map Coming Soon</p>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                    View all fitness locations on an interactive map
                  </p>
                </div>
                <Button size="sm" className="shadow-glow text-xs sm:text-sm">
                  <Navigation className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Enable Location
                </Button>
              </div>
            </div>
            
            {/* Animated markers */}
            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary rounded-full animate-pulse shadow-glow" />
            <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-secondary rounded-full animate-pulse shadow-glow" style={{ animationDelay: "0.5s" }} />
            <div className="absolute bottom-1/4 left-1/2 w-3 h-3 bg-accent rounded-full animate-pulse shadow-glow" style={{ animationDelay: "1s" }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
