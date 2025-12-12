import { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Camera, 
  Barcode, 
  FileText, 
  Search, 
  X, 
  Loader2, 
  Image as ImageIcon,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { foodScanService, FoodItem } from '@/lib/foodScanService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FoodScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFoodSelected: (food: FoodItem) => void;
}

export const FoodScanner = ({ open, onOpenChange, onFoodSelected }: FoodScannerProps) => {
  const [activeTab, setActiveTab] = useState<string>('photo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [recognizedFoods, setRecognizedFoods] = useState<FoodItem[]>([]);
  const [recognitionConfidence, setRecognitionConfidence] = useState<'high' | 'medium' | 'low'>('medium');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      let errorMessage = "Unable to access camera. ";
      if (error.name === 'NotAllowedError') {
        errorMessage += "Please allow camera permissions in your browser settings.";
      } else if (error.name === 'NotFoundError') {
        errorMessage += "No camera found on this device.";
      } else if (error.name === 'NotReadableError') {
        errorMessage += "Camera is in use by another application.";
      } else {
        errorMessage += "Please use the upload option instead.";
      }
      setCameraError(errorMessage);
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  // Auto-start camera when dialog opens and tab is a camera tab
  useEffect(() => {
    if (open && (activeTab === 'photo' || activeTab === 'barcode' || activeTab === 'label') && !capturedImage) {
      startCamera();
    }
    
    // Cleanup on close
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
    };
  }, [open, activeTab, capturedImage, startCamera]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
        processImage(imageData, activeTab);
      }
    }
  }, [activeTab, stopCamera]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        processImage(imageData, activeTab);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageData: string, scanType: string) => {
    setIsProcessing(true);
    setRecognizedFoods([]);

    try {
      if (scanType === 'barcode') {
        // Simulate barcode scanning
        const result = await foodScanService.lookupBarcode('mock-barcode');
        if (result) {
          onFoodSelected(result);
          onOpenChange(false);
        } else {
          toast({
            title: "Product Not Found",
            description: "This product is not in our database. Try scanning the nutrition label instead.",
          });
          setActiveTab('label');
        }
      } else if (scanType === 'label') {
        const extracted = await foodScanService.extractNutritionLabel(imageData);
        if (extracted) {
          const mockFood: FoodItem = {
            id: 'scanned-' + Date.now(),
            name: extracted.name || 'Scanned Food',
            category: 'packaged',
            origin: 'international',
            calories: extracted.calories || 0,
            protein: extracted.protein || 0,
            carbs: extracted.carbs || 0,
            fats: extracted.fats || 0,
            fiber: extracted.fiber || 0,
            sugar: extracted.sugar || 0,
            sodium: extracted.sodium || 0,
            saturatedFat: extracted.saturatedFat || 0,
            ingredients: extracted.ingredients || [],
            allergens: extracted.allergens || [],
            commonPreparations: [],
            healthFlags: [],
            portionSize: extracted.portionSize || 'Per serving',
          };
          onFoodSelected(mockFood);
          onOpenChange(false);
        }
      } else {
        // Photo recognition for meals
        const result = await foodScanService.recognizeMealPhoto(imageData);
        setRecognizedFoods(result.foods);
        setRecognitionConfidence(result.confidence);
      }
    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      const results = foodScanService.searchFood(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const resetScanner = () => {
    setCapturedImage(null);
    setRecognizedFoods([]);
    setSearchResults([]);
    setSearchQuery('');
    stopCamera();
  };

  const handleClose = () => {
    resetScanner();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Scan Food
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); resetScanner(); }} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mx-4 mt-2" style={{ width: 'calc(100% - 2rem)' }}>
            <TabsTrigger value="photo" className="text-xs sm:text-sm gap-1">
              <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Meal</span>
            </TabsTrigger>
            <TabsTrigger value="barcode" className="text-xs sm:text-sm gap-1">
              <Barcode className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Barcode</span>
            </TabsTrigger>
            <TabsTrigger value="label" className="text-xs sm:text-sm gap-1">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Label</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="text-xs sm:text-sm gap-1">
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Search</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-4 pt-4">
            <TabsContent value="photo" className="mt-0 space-y-4">
              <p className="text-sm text-muted-foreground">
                Take a photo of your meal and our AI will identify Nigerian & African dishes
              </p>
              
              {!capturedImage ? (
                <div className="space-y-4">
                  <div className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden">
                    {isCameraActive ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-48 h-48 sm:w-64 sm:h-64 border-2 border-primary/50 rounded-xl" />
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <Camera className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground text-sm">Camera preview</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    {!isCameraActive ? (
                      <>
                        <Button onClick={startCamera} className="flex-1 gap-2">
                          <Camera className="h-4 w-4" />
                          Open Camera
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 gap-2"
                        >
                          <ImageIcon className="h-4 w-4" />
                          Upload Photo
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={capturePhoto} className="flex-1 gap-2">
                          <Camera className="h-4 w-4" />
                          Capture
                        </Button>
                        <Button variant="outline" onClick={stopCamera} className="gap-2">
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden">
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                    {isProcessing && (
                      <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium">Analyzing meal...</p>
                      </div>
                    )}
                  </div>

                  {recognizedFoods.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Possible matches:</p>
                        <Badge variant="outline" className={cn(
                          recognitionConfidence === 'high' && 'border-secondary text-secondary',
                          recognitionConfidence === 'medium' && 'border-primary text-primary',
                          recognitionConfidence === 'low' && 'border-orange-500 text-orange-500'
                        )}>
                          {recognitionConfidence} confidence
                        </Badge>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {recognizedFoods.map((food) => (
                          <Card 
                            key={food.id} 
                            className="cursor-pointer hover:shadow-md transition-all"
                            onClick={() => {
                              onFoodSelected(food);
                              onOpenChange(false);
                            }}
                          >
                            <CardContent className="p-3 flex items-center justify-between">
                              <div>
                                <p className="font-medium">{food.name}</p>
                                {food.localName && (
                                  <p className="text-xs text-muted-foreground">{food.localName}</p>
                                )}
                              </div>
                              <Badge variant="secondary">{food.calories} cal</Badge>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button variant="outline" onClick={resetScanner} className="w-full gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Scan Again
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="barcode" className="mt-0 space-y-4">
              <p className="text-sm text-muted-foreground">
                Scan the barcode on packaged food products
              </p>
              
              <div className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-64 h-24 border-2 border-primary/50 rounded-lg" />
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <Barcode className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">Position barcode in frame</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!isCameraActive ? (
                  <Button onClick={startCamera} className="flex-1 gap-2">
                    <Camera className="h-4 w-4" />
                    Start Scanning
                  </Button>
                ) : (
                  <>
                    <Button onClick={capturePhoto} className="flex-1 gap-2">
                      <Barcode className="h-4 w-4" />
                      Scan
                    </Button>
                    <Button variant="outline" onClick={stopCamera} className="gap-2">
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="label" className="mt-0 space-y-4">
              <p className="text-sm text-muted-foreground">
                Capture the nutrition facts label for detailed analysis
              </p>
              
              {!capturedImage ? (
                <>
                  <div className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden">
                    {isCameraActive ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-48 h-64 border-2 border-primary/50 rounded-lg" />
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground text-sm text-center px-4">
                          Position the nutrition label in frame
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {!isCameraActive ? (
                      <>
                        <Button onClick={startCamera} className="flex-1 gap-2">
                          <Camera className="h-4 w-4" />
                          Open Camera
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 gap-2"
                        >
                          <ImageIcon className="h-4 w-4" />
                          Upload
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={capturePhoto} className="flex-1 gap-2">
                          <Camera className="h-4 w-4" />
                          Capture
                        </Button>
                        <Button variant="outline" onClick={stopCamera} className="gap-2">
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden">
                    <img src={capturedImage} alt="Label" className="w-full h-full object-cover" />
                    {isProcessing && (
                      <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium">Extracting nutrition info...</p>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" onClick={resetScanner} className="w-full gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Scan Again
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="search" className="mt-0 space-y-4">
              <p className="text-sm text-muted-foreground">
                Search for Nigerian & African foods by name
              </p>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search foods (e.g., Jollof, Egusi, Suya)"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((food) => (
                    <Card 
                      key={food.id} 
                      className="cursor-pointer hover:shadow-md transition-all"
                      onClick={() => {
                        onFoodSelected(food);
                        onOpenChange(false);
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{food.name}</p>
                            {food.localName && (
                              <p className="text-xs text-muted-foreground">{food.localName}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{food.calories} cal</Badge>
                            <p className="text-xs text-muted-foreground mt-1">{food.portionSize}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : searchQuery.length >= 2 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No foods found. Try a different search term.
                  </p>
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">
                      Start typing to search for foods
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
};
