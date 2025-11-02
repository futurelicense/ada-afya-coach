import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, ArrowLeftRight, Calendar, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProgressPhoto {
  id: string;
  url: string;
  date: string;
  weight?: number;
  note: string;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
  };
}

export const ProgressPhotoComparison = () => {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
      date: '2025-01-01',
      weight: 85,
      note: 'Starting point',
      measurements: { chest: 100, waist: 90, hips: 95 }
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
      date: '2025-02-01',
      weight: 82,
      note: '1 month progress',
      measurements: { chest: 98, waist: 85, hips: 93 }
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
      date: '2025-03-01',
      weight: 79,
      note: '2 months progress',
      measurements: { chest: 96, waist: 82, hips: 91 }
    },
  ]);
  const [compareIndices, setCompareIndices] = useState<[number, number]>([0, photos.length - 1]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const newPhoto: ProgressPhoto = {
      id: Date.now().toString(),
      url,
      date: new Date().toISOString().split('T')[0],
      note: 'Progress photo',
    };

    setPhotos([...photos, newPhoto]);
    toast({
      title: "Photo Added! 📸",
      description: "Your progress photo has been saved",
    });
    e.target.value = '';
  };

  const selectForComparison = (index: number, position: 0 | 1) => {
    const newIndices: [number, number] = [...compareIndices];
    newIndices[position] = index;
    setCompareIndices(newIndices);
  };

  const getDaysDifference = (date1: string, date2: string) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const photo1 = photos[compareIndices[0]];
  const photo2 = photos[compareIndices[1]];
  const daysDiff = photo1 && photo2 ? getDaysDifference(photo1.date, photo2.date) : 0;
  const weightDiff = photo1?.weight && photo2?.weight ? photo2.weight - photo1.weight : null;

  return (
    <Card className="shadow-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Progress Photo Comparison
          </CardTitle>
          <label htmlFor="photo-upload">
            <Button size="sm" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Add Photo
              </span>
            </Button>
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="compare" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compare">Side-by-Side</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="compare" className="space-y-4 mt-4">
            {/* Comparison Stats */}
            {photo1 && photo2 && (
              <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-card rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="text-2xl font-bold">{daysDiff}</p>
                  <p className="text-xs text-muted-foreground">days apart</p>
                </div>
                {weightDiff !== null && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary">{Math.abs(weightDiff)}kg</p>
                    <p className="text-xs text-muted-foreground">
                      {weightDiff < 0 ? 'lost' : 'gained'}
                    </p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{photos.length}</p>
                  <p className="text-xs text-muted-foreground">total photos</p>
                </div>
              </div>
            )}

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-2 gap-4">
              {/* Before Photo */}
              <div className="space-y-2">
                <Badge variant="outline">Before</Badge>
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary shadow-card">
                  {photo1 ? (
                    <img src={photo1.url} alt="Before" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Select photo</p>
                    </div>
                  )}
                </div>
                {photo1 && (
                  <div className="text-sm space-y-1">
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(photo1.date).toLocaleDateString()}
                    </p>
                    {photo1.weight && <p className="text-muted-foreground">Weight: {photo1.weight}kg</p>}
                    <p className="text-xs text-muted-foreground">{photo1.note}</p>
                  </div>
                )}
              </div>

              {/* After Photo */}
              <div className="space-y-2">
                <Badge variant="default">After</Badge>
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-secondary shadow-card">
                  {photo2 ? (
                    <img src={photo2.url} alt="After" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Select photo</p>
                    </div>
                  )}
                </div>
                {photo2 && (
                  <div className="text-sm space-y-1">
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(photo2.date).toLocaleDateString()}
                    </p>
                    {photo2.weight && <p className="text-muted-foreground">Weight: {photo2.weight}kg</p>}
                    <p className="text-xs text-muted-foreground">{photo2.note}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Measurement Comparison */}
            {photo1?.measurements && photo2?.measurements && (
              <Card className="bg-secondary/10">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    Measurements Change
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {Object.keys(photo1.measurements).map((key) => {
                      const k = key as keyof typeof photo1.measurements;
                      const before = photo1.measurements?.[k] || 0;
                      const after = photo2.measurements?.[k] || 0;
                      const diff = after - before;
                      return (
                        <div key={key} className="text-center">
                          <p className="text-xs text-muted-foreground capitalize">{key}</p>
                          <p className={`text-lg font-bold ${diff < 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                            {diff > 0 ? '+' : ''}{diff}cm
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Photo Selector */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Select photos to compare:</p>
              <div className="grid grid-cols-4 gap-2">
                {photos.map((photo, idx) => (
                  <div key={photo.id} className="space-y-1">
                    <div
                      className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-smooth ${
                        compareIndices.includes(idx) ? 'border-primary scale-95' : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        if (compareIndices[0] === idx) {
                          selectForComparison(idx, 1);
                        } else {
                          selectForComparison(idx, 0);
                        }
                      }}
                    >
                      <img src={photo.url} alt={photo.note} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      {new Date(photo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-3 mt-4">
            {photos.length === 0 ? (
              <div className="text-center py-8">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No progress photos yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...photos].reverse().map((photo, idx) => (
                  <Card key={photo.id} className="hover-scale">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden border shadow-card flex-shrink-0">
                          <img src={photo.url} alt={photo.note} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold">{photo.note}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(photo.date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={idx === 0 ? "default" : "secondary"}>
                              {idx === 0 ? 'Latest' : `${photos.length - idx - 1} photos ago`}
                            </Badge>
                          </div>
                          {photo.weight && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Weight:</span>{' '}
                              <span className="font-bold">{photo.weight}kg</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
