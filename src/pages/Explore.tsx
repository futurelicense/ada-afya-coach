import { useState } from "react";
import { ExploreHeroOptimized } from "@/components/explore/ExploreHeroOptimized";
import { ExploreDirectory } from "@/components/explore/ExploreDirectory";
import { ExploreMap } from "@/components/ExploreMap";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="mx-auto max-w-[1440px] space-y-5 overflow-x-hidden pb-24 animate-fade-in md:pb-8">
      <ExploreHeroOptimized
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <ExploreDirectory searchQuery={searchQuery} />
      <ExploreMap />
    </div>
  );
}
