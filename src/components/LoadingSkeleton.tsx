import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const CardSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <div className="skeleton h-6 w-2/3 rounded mb-2"></div>
      <div className="skeleton h-4 w-1/2 rounded"></div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="skeleton h-4 w-full rounded"></div>
        <div className="skeleton h-4 w-5/6 rounded"></div>
        <div className="skeleton h-4 w-4/6 rounded"></div>
      </div>
    </CardContent>
  </Card>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="skeleton h-3 w-20 rounded"></div>
              <div className="skeleton h-8 w-16 rounded"></div>
            </div>
            <div className="skeleton h-8 w-8 rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const ListSkeleton = ({ items = 3 }: { items?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
        <div className="skeleton h-12 w-12 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded"></div>
          <div className="skeleton h-3 w-1/2 rounded"></div>
        </div>
        <div className="skeleton h-9 w-20 rounded"></div>
      </div>
    ))}
  </div>
);

export const ImageSkeleton = ({ aspectRatio = "video" }: { aspectRatio?: "video" | "square" }) => (
  <div className={`skeleton rounded-lg ${aspectRatio === "video" ? "aspect-video" : "aspect-square"}`}></div>
);
