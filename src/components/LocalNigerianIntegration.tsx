import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Dumbbell, User, Star, Phone, Clock, Award } from "lucide-react";

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gyms">Local Gyms</TabsTrigger>
            <TabsTrigger value="trainers">Trainers</TabsTrigger>
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

            <Card className="bg-gradient-card text-white">
              <CardContent className="p-6 text-center">
                <h4 className="text-lg font-bold mb-2">Join the Community!</h4>
                <p className="text-sm text-white/90 mb-4">
                  Connect with top Nigerian fitness influencers and get daily motivation, workout tips, and nutrition advice.
                </p>
                <Button variant="secondary">Explore More Influencers</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
