import { LocalNigerianIntegration } from "@/components/LocalNigerianIntegration";
import { ExploreHero } from "@/components/ExploreHero";
import { ExploreMap } from "@/components/ExploreMap";

export default function Explore() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <ExploreHero />
      <LocalNigerianIntegration />
      <ExploreMap />
    </div>
  );
}
