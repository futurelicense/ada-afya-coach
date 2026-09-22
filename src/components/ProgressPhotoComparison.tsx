import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Calendar } from "lucide-react";
import { progressPhotoService, ProgressPhoto } from "@/lib/progressPhotoService";

export const ProgressPhotoComparison = () => {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [compare, setCompare] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    progressPhotoService.list()
      .then((list) => {
        setPhotos(list);
        if (list.length >= 2) setCompare([0, list.length - 1]);
      })
      .catch(() => setPhotos([]));
  }, []);

  const photo1 = photos[compare[0]];
  const photo2 = photos[compare[1]];
  const daysDiff = photo1 && photo2
    ? Math.round(Math.abs(new Date(photo2.date).getTime() - new Date(photo1.date).getTime()) / 86400000)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          Compare photos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {photos.length < 2 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Upload at least two photos in Progress Photos to compare.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground text-center">{daysDiff} days apart</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Badge variant="outline">Earlier</Badge>
                {photo1 && (
                  <>
                    <img src={photo1.url} alt="" className="aspect-square w-full object-cover rounded-lg border" />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(photo1.date).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <Badge>Later</Badge>
                {photo2 && (
                  <>
                    <img src={photo2.url} alt="" className="aspect-square w-full object-cover rounded-lg border" />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(photo2.date).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    compare.includes(idx) ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => {
                    if (idx === compare[0]) setCompare([idx, compare[1]]);
                    else setCompare([compare[0], idx]);
                  }}
                >
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
