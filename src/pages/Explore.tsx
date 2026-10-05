import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ExploreHeroOptimized } from "@/components/explore/ExploreHeroOptimized";
import { ExploreDirectory } from "@/components/explore/ExploreDirectory";

export default function Explore() {
  const [params] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => params.get("q") ?? "");

  useEffect(() => {
    setSearchQuery(params.get("q") ?? "");
  }, [params]);

  return (
    <div className="mx-auto max-w-[1440px] space-y-5 overflow-x-hidden pb-24 animate-fade-in md:pb-8">
      <ExploreHeroOptimized
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <ExploreDirectory searchQuery={searchQuery} />
    </div>
  );
}
