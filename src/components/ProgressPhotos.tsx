import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Trash2, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { progressPhotoService, ProgressPhoto } from "@/lib/progressPhotoService";

export const ProgressPhotos = () => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      setPhotos(await progressPhotoService.list());
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Max 5 MB per photo." });
      return;
    }
    setUploading(true);
    try {
      await progressPhotoService.upload(file);
      await load();
      toast({ title: "Photo saved", description: "Stored privately in your account." });
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Try a JPEG or PNG.",
      });
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photo: ProgressPhoto) => {
    try {
      await progressPhotoService.remove(photo);
      setPhotos(photos.filter(p => p.id !== photo.id));
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Could not delete",
        description: err instanceof Error ? err.message : "Try again.",
      });
    }
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
            <Button size="sm" asChild disabled={uploading}>
              <span>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Add Photo
              </span>
            </Button>
          </label>
          <input id="photo-upload" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => void handleFileSelect(e)} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading photos…</p>
        ) : photos.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No progress photos yet</p>
            <label htmlFor="photo-upload-empty">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload first photo
                </span>
              </Button>
            </label>
            <input id="photo-upload-empty" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => void handleFileSelect(e)} />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border">
                  <img src={photo.url} alt={photo.note} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-2">
                  <Badge variant="secondary" className="mb-2 text-xs">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(photo.date).toLocaleDateString()}
                  </Badge>
                  <Button size="sm" variant="destructive" onClick={() => void deletePhoto(photo)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
