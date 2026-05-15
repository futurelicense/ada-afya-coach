import { useState } from "react";
import { ExploreHeroOptimized } from "@/components/explore/ExploreHeroOptimized";
import { ExploreListing } from "@/components/explore/ExploreListing";
import { ExploreMap } from "@/components/ExploreMap";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in px-0 sm:px-4 md:px-6 lg:px-8 pb-24 md:pb-8 overflow-x-hidden">
      <ExploreHeroOptimized 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
      />
      <ExploreListing searchQuery={searchQuery} />
      <ExploreMap />
    </div>
  );
}
