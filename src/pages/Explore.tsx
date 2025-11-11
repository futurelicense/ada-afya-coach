import { LocalNigerianIntegration } from "@/components/LocalNigerianIntegration";

export default function Explore() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gradient">
          Nigerian Fitness Community
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Discover local gyms, trainers, nutritionists, and fitness resources across Nigeria
        </p>
      </div>
      
      <LocalNigerianIntegration />
    </div>
  );
}
