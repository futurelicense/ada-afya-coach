import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Truck, Clock, MapPin, Phone, CheckCircle2, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUserData } from "@/hooks/useUserData";

interface DeliveryOrder {
  id: string;
  meals: string[];
  totalPrice: number;
  status: 'pending' | 'preparing' | 'on-the-way' | 'delivered';
  orderDate: Date;
  estimatedDelivery: Date;
  address: string;
  phone: string;
}

const MEAL_PRICES: Record<string, number> = {
  'Jollof Rice with Grilled Chicken': 2500,
  'Egusi Soup with Pounded Yam': 3000,
  'Beans Porridge with Plantain': 1800,
  'Pepper Soup with Fish': 2200,
  'Moi Moi with Pap': 1500,
  'Suya with Vegetables': 2800,
};

export const MealDeliverySystem = () => {
  const { todayMeals } = useUserData();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);

  const availableMeals = todayMeals.filter(m => !m.eaten);

  const handleOrderMeal = () => {
    if (selectedMeals.length === 0) {
      toast({
        title: "No meals selected",
        description: "Please select at least one meal to order",
        variant: "destructive",
      });
      return;
    }

    if (!deliveryAddress || !phoneNumber) {
      toast({
        title: "Missing information",
        description: "Please provide delivery address and phone number",
        variant: "destructive",
      });
      return;
    }

    const totalPrice = selectedMeals.reduce((sum, meal) => {
      return sum + (MEAL_PRICES[meal] || 2000);
    }, 0);

    const newOrder: DeliveryOrder = {
      id: Date.now().toString(),
      meals: selectedMeals,
      totalPrice,
      status: 'pending',
      orderDate: new Date(),
      estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000), // 45 mins
      address: deliveryAddress,
      phone: phoneNumber,
    };

    setOrders(prev => [newOrder, ...prev]);
    setSelectedMeals([]);
    
    toast({
      title: "Order placed successfully! 🎉",
      description: `Your ${selectedMeals.length} meal(s) will arrive in ~45 minutes`,
    });

    // Simulate order status updates
    setTimeout(() => updateOrderStatus(newOrder.id, 'preparing'), 5000);
    setTimeout(() => updateOrderStatus(newOrder.id, 'on-the-way'), 15000);
  };

  const updateOrderStatus = (orderId: string, status: DeliveryOrder['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const toggleMealSelection = (mealName: string) => {
    setSelectedMeals(prev => 
      prev.includes(mealName) 
        ? prev.filter(m => m !== mealName)
        : [...prev, mealName]
    );
  };

  const getStatusIcon = (status: DeliveryOrder['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'preparing': return <Package className="h-5 w-5" />;
      case 'on-the-way': return <Truck className="h-5 w-5" />;
      case 'delivered': return <CheckCircle2 className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: DeliveryOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'on-the-way': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
    }
  };

  return (
    <Card className="shadow-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Meal Delivery Service
        </CardTitle>
        <CardDescription>Order your AI-generated meals delivered fresh to your door</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="order" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="order">Place Order</TabsTrigger>
            <TabsTrigger value="track">Track Orders ({orders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="order" className="space-y-4 mt-4">
            {availableMeals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">No meal plan available</p>
                <p className="text-sm text-muted-foreground">Generate your AI meal plan in the Nutrition page first!</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Select Meals to Order</Label>
                  {availableMeals.map((meal) => {
                    const price = MEAL_PRICES[meal.name] || 2000;
                    const isSelected = selectedMeals.includes(meal.name);
                    
                    return (
                      <div
                        key={meal.id}
                        onClick={() => toggleMealSelection(meal.name)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-smooth hover:shadow-md ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected ? 'bg-primary border-primary' : 'border-muted'
                              }`}>
                                {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                              </div>
                              <h4 className="font-medium">{meal.name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 ml-7">
                              {meal.calories} cal • {meal.protein}g protein
                            </p>
                          </div>
                          <Badge variant="secondary" className="ml-2">₦{price.toLocaleString()}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <div className="flex gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-2" />
                      <Input
                        id="address"
                        placeholder="Enter your delivery address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2">
                      <Phone className="h-5 w-5 text-muted-foreground mt-2" />
                      <Input
                        id="phone"
                        placeholder="080xxxxxxxx"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {selectedMeals.length > 0 && (
                  <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg">
                    <div>
                      <p className="font-semibold">Total Amount</p>
                      <p className="text-sm text-muted-foreground">{selectedMeals.length} meal(s)</p>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      ₦{selectedMeals.reduce((sum, meal) => sum + (MEAL_PRICES[meal] || 2000), 0).toLocaleString()}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleOrderMeal} 
                  className="w-full" 
                  size="lg"
                  disabled={selectedMeals.length === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Place Order
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="track" className="space-y-4 mt-4">
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No orders yet</p>
                <p className="text-sm text-muted-foreground">Your delivery orders will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Card key={order.id} className="shadow-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">Order #{order.id.slice(-6)}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.orderDate.toLocaleDateString()} • {order.orderDate.toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} text-white gap-1`}>
                          {getStatusIcon(order.status)}
                          {order.status.replace('-', ' ')}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-3">
                        <p className="text-sm font-medium">Items:</p>
                        {order.meals.map((meal, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground pl-4">• {meal}</p>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Est. {order.estimatedDelivery.toLocaleTimeString()}
                        </div>
                        <p className="font-bold text-primary">₦{order.totalPrice.toLocaleString()}</p>
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
