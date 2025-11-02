import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Star, Clock, MapPin, Phone, Heart, Calendar, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { vendorService, Vendor, ScheduledDelivery } from "@/lib/vendorService";
import { useUserData } from "@/hooks/useUserData";

export const VendorMarketplace = () => {
  const [vendors] = useState<Vendor[]>(vendorService.getAllVendors());
  const [favoriteVendorIds, setFavoriteVendorIds] = useState<string[]>(vendorService.getFavoriteVendors());
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const { todayMeals } = useUserData();

  const toggleFavorite = (vendorId: string) => {
    const isFav = vendorService.toggleFavorite(vendorId);
    setFavoriteVendorIds(vendorService.getFavoriteVendors());
    
    toast({
      title: isFav ? "Added to favorites! ❤️" : "Removed from favorites",
      description: isFav ? "You'll see this vendor in your favorites tab" : undefined,
    });
  };

  const scheduleDelivery = () => {
    if (!selectedVendor || !scheduledDate || !scheduledTime) {
      toast({
        title: "Missing information",
        description: "Please select vendor, date, and time",
        variant: "destructive",
      });
      return;
    }

    const delivery: ScheduledDelivery = {
      id: Date.now().toString(),
      mealNames: todayMeals.slice(0, 2).map(m => m.name),
      vendorId: selectedVendor.id,
      scheduledDate,
      scheduledTime,
      recurring: 'none',
      status: 'pending',
    };

    vendorService.scheduleDelivery(delivery);
    
    toast({
      title: "Delivery scheduled! 📅",
      description: `Your meal will be delivered on ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime}`,
    });

    setScheduledDate('');
    setScheduledTime('');
    setSelectedVendor(null);
  };

  const favoriteVendors = vendors.filter(v => favoriteVendorIds.includes(v.id));
  const upcomingDeliveries = vendorService.getUpcomingDeliveries();

  return (
    <Card className="shadow-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" />
          Nigerian Food Vendors
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Vendors ({vendors.length})</TabsTrigger>
            <TabsTrigger value="favorites">Favorites ({favoriteVendors.length})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({upcomingDeliveries.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {vendors.map((vendor) => (
              <Card key={vendor.id} className="hover-scale cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold">{vendor.name}</h4>
                        {vendor.verified && <Badge variant="secondary" className="text-xs">✓ Verified</Badge>}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        {vendor.location}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {vendor.cuisine.map((c, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{c}</Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant={favoriteVendorIds.includes(vendor.id) ? "default" : "ghost"}
                      size="sm"
                      onClick={() => toggleFavorite(vendor.id)}
                    >
                      <Heart className={`h-4 w-4 ${favoriteVendorIds.includes(vendor.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{vendor.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{vendor.deliveryTime}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span className="text-xs">{vendor.phone.slice(-8)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-sm">
                      <p className="text-muted-foreground">Min: <span className="font-bold text-foreground">₦{vendor.minOrder.toLocaleString()}</span></p>
                      <p className="text-muted-foreground">Delivery: <span className="font-bold text-foreground">₦{vendor.deliveryFee.toLocaleString()}</span></p>
                    </div>
                    <Button size="sm" onClick={() => setSelectedVendor(vendor)}>
                      Order Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-3 mt-4">
            {favoriteVendors.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No favorite vendors yet</p>
                <p className="text-sm text-muted-foreground">Tap the heart icon to save your favorites</p>
              </div>
            ) : (
              favoriteVendors.map((vendor) => (
                <Card key={vendor.id} className="hover-scale">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold mb-1">{vendor.name}</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span>{vendor.rating}</span>
                          <span className="text-muted-foreground">• {vendor.deliveryTime}</span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => setSelectedVendor(vendor)}>Order</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4 mt-4">
            {selectedVendor && (
              <Card className="bg-primary/5 border-primary">
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-bold">Schedule Delivery from {selectedVendor.name}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Date</label>
                      <Input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Time</label>
                      <Input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={scheduleDelivery} className="flex-1">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedVendor(null)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {upcomingDeliveries.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No scheduled deliveries</p>
                <p className="text-sm text-muted-foreground">Select a vendor to schedule your meals</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeliveries.map((delivery) => {
                  const vendor = vendorService.getVendorById(delivery.vendorId);
                  return (
                    <Card key={delivery.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold">{vendor?.name}</h4>
                            <p className="text-sm text-muted-foreground">{delivery.mealNames.join(', ')}</p>
                          </div>
                          <Badge>{delivery.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(delivery.scheduledDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {delivery.scheduledTime}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
