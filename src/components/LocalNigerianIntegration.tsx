import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Dumbbell, User, Star, Phone, Clock, Award, Utensils, ShoppingBag, Calendar, TreePine } from "lucide-react";

interface Gym {
  id: string;
  name: string;
  location: string;
  rating: number;
  priceRange: string;
  amenities: string[];
  verified: boolean;
  phone: string;
}

interface Trainer {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  pricePerSession: number;
  location: string;
  phone: string;
  certified: boolean;
}

interface Influencer {
  id: string;
  name: string;
  followers: string;
  niche: string;
  verified: boolean;
  platform: string;
}

interface Nutritionist {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  rating: number;
  consultationFee: number;
  location: string;
  phone: string;
  verified: boolean;
}

interface Store {
  id: string;
  name: string;
  type: string;
  location: string;
  rating: number;
  products: string[];
  delivery: boolean;
  phone: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  type: string;
  attendees: number;
  price: string;
  organizer: string;
}

interface WorkoutSpot {
  id: string;
  name: string;
  type: string;
  location: string;
  rating: number;
  features: string[];
  free: boolean;
  bestTime: string;
}

const gyms: Gym[] = [
  {
    id: '1',
    name: 'FitLife Gym Lagos',
    location: 'Victoria Island, Lagos',
    rating: 4.8,
    priceRange: '₦15,000 - ₦30,000/month',
    amenities: ['Free Weights', 'Cardio', 'Classes', 'Sauna', 'Locker'],
    verified: true,
    phone: '+234 801 234 5678',
  },
  {
    id: '2',
    name: 'Power Zone Fitness',
    location: 'Lekki Phase 1, Lagos',
    rating: 4.7,
    priceRange: '₦20,000 - ₦40,000/month',
    amenities: ['CrossFit', 'Boxing', 'Yoga', 'Swimming', 'PT'],
    verified: true,
    phone: '+234 802 345 6789',
  },
  {
    id: '3',
    name: 'Body Temple Gym',
    location: 'Ikeja GRA, Lagos',
    rating: 4.6,
    priceRange: '₦12,000 - ₦25,000/month',
    amenities: ['Weights', 'Treadmills', 'Classes', 'Shower'],
    verified: true,
    phone: '+234 803 456 7890',
  },
];

const trainers: Trainer[] = [
  {
    id: '1',
    name: 'Tunde Adeyemi',
    specialty: 'Strength Training & Body Building',
    experience: '8 years',
    rating: 4.9,
    pricePerSession: 5000,
    location: 'Victoria Island, Lagos',
    phone: '+234 804 567 8901',
    certified: true,
  },
  {
    id: '2',
    name: 'Chioma Okafor',
    specialty: 'Weight Loss & HIIT',
    experience: '6 years',
    rating: 4.8,
    pricePerSession: 4500,
    location: 'Lekki, Lagos',
    phone: '+234 805 678 9012',
    certified: true,
  },
  {
    id: '3',
    name: 'Ibrahim Musa',
    specialty: 'Functional Training & CrossFit',
    experience: '10 years',
    rating: 5.0,
    pricePerSession: 6000,
    location: 'Ikeja, Lagos',
    phone: '+234 806 789 0123',
    certified: true,
  },
];

const influencers: Influencer[] = [
  {
    id: '1',
    name: 'Fitness Naija',
    followers: '450K',
    niche: 'General Fitness & Motivation',
    verified: true,
    platform: 'Instagram',
  },
  {
    id: '2',
    name: 'Lagos Gym Babe',
    followers: '320K',
    niche: 'Women\'s Fitness',
    verified: true,
    platform: 'Instagram',
  },
  {
    id: '3',
    name: 'Naija Muscle',
    followers: '280K',
    niche: 'Bodybuilding & Nutrition',
    verified: true,
    platform: 'YouTube',
  },
];

const nutritionists: Nutritionist[] = [
  {
    id: '1',
    name: 'Dr. Amaka Okonkwo',
    specialty: 'Sports Nutrition & Weight Management',
    qualification: 'PhD in Nutrition Science',
    rating: 4.9,
    consultationFee: 15000,
    location: 'Victoria Island, Lagos',
    phone: '+234 807 890 1234',
    verified: true,
  },
  {
    id: '2',
    name: 'Yusuf Abdullahi',
    specialty: 'Meal Planning & Dietary Supplements',
    qualification: 'MSc Nutrition, Certified Dietitian',
    rating: 4.8,
    consultationFee: 12000,
    location: 'Lekki, Lagos',
    phone: '+234 808 901 2345',
    verified: true,
  },
  {
    id: '3',
    name: 'Blessing Eze',
    specialty: 'Nigerian Diet Plans & Healthy Eating',
    qualification: 'BSc Nutrition & Dietetics',
    rating: 4.7,
    consultationFee: 10000,
    location: 'Ikeja, Lagos',
    phone: '+234 809 012 3456',
    verified: true,
  },
];

const stores: Store[] = [
  {
    id: '1',
    name: 'FitGear Nigeria',
    type: 'Equipment & Supplements',
    location: 'Victoria Island, Lagos',
    rating: 4.6,
    products: ['Dumbbells', 'Resistance Bands', 'Yoga Mats', 'Protein Powder', 'Pre-workout'],
    delivery: true,
    phone: '+234 810 123 4567',
  },
  {
    id: '2',
    name: 'HealthyBites Meal Prep',
    type: 'Meal Prep Service',
    location: 'Lekki Phase 1, Lagos',
    rating: 4.8,
    products: ['Low-carb meals', 'High-protein packs', 'Vegan options', 'Nigerian specials'],
    delivery: true,
    phone: '+234 811 234 5678',
  },
  {
    id: '3',
    name: 'Sports Arena Store',
    type: 'Fitness Equipment',
    location: 'Ikeja City Mall, Lagos',
    rating: 4.5,
    products: ['Treadmills', 'Exercise Bikes', 'Weight Sets', 'Gym Wear', 'Accessories'],
    delivery: true,
    phone: '+234 812 345 6789',
  },
];

const events: Event[] = [
  {
    id: '1',
    name: 'Lagos Fitness Festival 2025',
    date: '2025-03-15',
    time: '8:00 AM - 4:00 PM',
    location: 'Eko Atlantic City, Lagos',
    type: 'Festival',
    attendees: 5000,
    price: 'Free Entry',
    organizer: 'FitLife Lagos',
  },
  {
    id: '2',
    name: 'Beach Bootcamp Workout',
    date: '2025-03-08',
    time: '6:00 AM - 7:30 AM',
    location: 'Elegushi Beach, Lekki',
    type: 'Group Workout',
    attendees: 150,
    price: '₦2,000',
    organizer: 'Lagos Fit Squad',
  },
  {
    id: '3',
    name: 'Nutrition & Wellness Seminar',
    date: '2025-03-20',
    time: '10:00 AM - 2:00 PM',
    location: 'Radisson Blu Hotel, VI',
    type: 'Workshop',
    attendees: 200,
    price: '₦5,000',
    organizer: 'Health Naija',
  },
];

const workoutSpots: WorkoutSpot[] = [
  {
    id: '1',
    name: 'Freedom Park Lagos',
    type: 'Outdoor Park',
    location: 'Lagos Island',
    rating: 4.5,
    features: ['Open space', 'Morning runners', 'Calisthenics bars', 'Safe environment'],
    free: true,
    bestTime: '6:00 AM - 8:00 AM',
  },
  {
    id: '2',
    name: 'Bar Beach Fitness Area',
    type: 'Beach',
    location: 'Victoria Island, Lagos',
    rating: 4.7,
    features: ['Ocean view', 'Sand running', 'Group workouts', 'Fresh air'],
    free: true,
    bestTime: '5:30 AM - 7:00 AM',
  },
  {
    id: '3',
    name: 'Muri Okunola Park',
    type: 'Public Park',
    location: 'Victoria Island, Lagos',
    rating: 4.6,
    features: ['Jogging track', 'Outdoor gym', 'Green space', 'Well-maintained'],
    free: true,
    bestTime: '6:00 AM - 9:00 AM',
  },
];

export const LocalNigerianIntegration = () => {
  return (
    <Card className="shadow-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Nigerian Fitness Community
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gyms" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1">
            <TabsTrigger value="gyms">Gyms</TabsTrigger>
            <TabsTrigger value="trainers">Trainers</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="stores">Stores</TabsTrigger>
          </TabsList>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 gap-1 mt-2">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="spots">Workout Spots</TabsTrigger>
            <TabsTrigger value="influencers">Influencers</TabsTrigger>
          </TabsList>

          <TabsContent value="gyms" className="space-y-3 mt-4">
            {gyms.map((gym) => (
              <Card key={gym.id} className="hover-scale">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold">{gym.name}</h4>
                        {gym.verified && <Badge variant="secondary" className="text-xs">✓ Verified</Badge>}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        {gym.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{gym.rating}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {gym.priceRange}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {gym.amenities.map((amenity, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{amenity}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{gym.phone}</span>
                    </div>
                    <Button size="sm">Visit Website</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="trainers" className="space-y-3 mt-4">
            {trainers.map((trainer) => (
              <Card key={trainer.id} className="hover-scale">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold">{trainer.name}</h4>
                          {trainer.certified && <Badge variant="secondary" className="text-xs">Certified</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{trainer.specialty}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{trainer.rating}</span>
                          <span className="text-muted-foreground">• {trainer.experience}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{trainer.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{trainer.phone.slice(-8)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Price per session</p>
                      <p className="text-xl font-bold text-primary">₦{trainer.pricePerSession.toLocaleString()}</p>
                    </div>
                    <Button size="sm">Book Session</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-3 mt-4">
            {nutritionists.map((nutritionist) => (
              <Card key={nutritionist.id} className="hover-scale">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Utensils className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold">{nutritionist.name}</h4>
                          {nutritionist.verified && <Badge variant="secondary" className="text-xs">✓ Verified</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{nutritionist.specialty}</p>
                        <p className="text-xs text-muted-foreground mb-1">{nutritionist.qualification}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{nutritionist.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs">{nutritionist.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span className="text-xs">{nutritionist.phone.slice(-8)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Consultation</p>
                      <p className="text-xl font-bold text-primary">₦{nutritionist.consultationFee.toLocaleString()}</p>
                    </div>
                    <Button size="sm">Book Consultation</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="stores" className="space-y-3 mt-4">
            {stores.map((store) => (
              <Card key={store.id} className="hover-scale">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        <h4 className="font-bold">{store.name}</h4>
                      </div>
                      <Badge variant="outline" className="text-xs mb-2">{store.type}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        {store.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{store.rating}</span>
                        {store.delivery && <Badge variant="secondary" className="text-xs ml-2">Delivery Available</Badge>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {store.products.map((product, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{product}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{store.phone}</span>
                    </div>
                    <Button size="sm">Visit Store</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="events" className="space-y-3 mt-4">
            {events.map((event) => (
              <Card key={event.id} className="hover-scale">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-secondary" />
                        <h4 className="font-bold">{event.name}</h4>
                      </div>
                      <Badge variant="secondary" className="text-xs mb-2">{event.type}</Badge>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(event.date).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{event.price}</p>
                      <p className="text-xs text-muted-foreground">{event.attendees} attending</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <p className="text-sm text-muted-foreground">By {event.organizer}</p>
                    <Button size="sm">Register Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="bg-gradient-card text-white">
              <CardContent className="p-6 text-center">
                <h4 className="text-lg font-bold mb-2">Host Your Own Event!</h4>
                <p className="text-sm text-white/90 mb-4">
                  Create and promote fitness events in your community. Connect with other fitness enthusiasts!
                </p>
                <Button variant="secondary">Create Event</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spots" className="space-y-3 mt-4">
            {workoutSpots.map((spot) => (
              <Card key={spot.id} className="hover-scale">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <TreePine className="h-5 w-5 text-primary" />
                        <h4 className="font-bold">{spot.name}</h4>
                        {spot.free && <Badge variant="secondary" className="text-xs">Free</Badge>}
                      </div>
                      <Badge variant="outline" className="text-xs mb-2">{spot.type}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        {spot.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{spot.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {spot.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{feature}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Best: {spot.bestTime}</span>
                    </div>
                    <Button size="sm">Get Directions</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="influencers" className="space-y-3 mt-4">
            {influencers.map((influencer) => (
              <Card key={influencer.id} className="hover-scale">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold">{influencer.name}</h4>
                          {influencer.verified && (
                            <Badge variant="secondary" className="text-xs">✓ Verified</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{influencer.niche}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{influencer.platform}</Badge>
                          <span className="text-xs text-muted-foreground">{influencer.followers} followers</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Follow</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
