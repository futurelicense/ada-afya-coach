import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Photo {
  id: string;
  url: string;
  date: string;
  note: string;
}

export const ProgressPhotos = () => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
      date: '2025-01-01',
      note: 'Starting my journey',
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
      date: '2025-02-01',
      note: '1 month progress',
    },
  ]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a URL for the selected file
    const url = URL.createObjectURL(file);
    
    const newPhoto: Photo = {
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

    // Reset input
    e.target.value = '';
  };

  const deletePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
    toast({
      title: "Photo Removed",
      description: "Photo has been deleted",
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Progress Photos
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
        {photos.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No progress photos yet</p>
            <label htmlFor="photo-upload-empty">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload First Photo
                </span>
              </Button>
            </label>
            <input
              id="photo-upload-empty"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border shadow-card">
                  <img
                    src={photo.url}
                    alt={photo.note}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-2">
                  <Badge variant="secondary" className="mb-2 text-xs">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(photo.date).toLocaleDateString()}
                  </Badge>
                  <p className="text-white text-xs text-center mb-3">{photo.note}</p>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deletePhoto(photo.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {photos.length > 0 && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              📅 Track your transformation with regular photos
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tip: Take photos from the same angle and lighting for best comparison
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
