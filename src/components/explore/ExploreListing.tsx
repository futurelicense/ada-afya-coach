import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dumbbell, User, Utensils, ShoppingBag, Calendar, TreePine, 
  ExternalLink, Navigation, CheckCircle2, Users, TrendingUp, 
  MapPin, Phone, Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ExploreCard } from "./ExploreCard";
import { ExploreFilters, CategoryType } from "./ExploreFilters";
import { GymPaymentDialog } from "@/components/GymPaymentDialog";
import { TrainerBookingDialog } from "@/components/TrainerBookingDialog";

// Types
interface Gym {
  id: string;
  name: string;
  location: string;
  rating: number;
  priceRange: string;
  amenities: string[];
  verified: boolean;
  phone: string;
  image?: string;
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
  image?: string;
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
  image?: string;
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
  image?: string;
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
  image?: string;
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
  image?: string;
}

interface Influencer {
  id: string;
  name: string;
  followers: string;
  niche: string;
  verified: boolean;
  platform: string;
  image?: string;
}

// Sample data with images
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
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    name: 'Ibrahim Musa',
    specialty: 'Functional Training & CrossFit',
    experience: '10 years',
    rating: 5.0,
    pricePerSession: 6000,
    location: 'Ikoyi, Lagos',
    phone: '+234 806 789 0123',
    certified: true,
    image: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400&h=300&fit=crop',
  },
];

const nutritionists: Nutritionist[] = [
  {
    id: '1',
    name: 'Dr. Amaka Nwosu',
    specialty: 'Sports Nutrition & Weight Management',
    qualification: 'PhD in Nutritional Science',
    rating: 4.9,
    consultationFee: 8000,
    location: 'Ikeja, Lagos',
    phone: '+234 807 890 1234',
    verified: true,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    name: 'Fatima Bello',
    specialty: 'Clinical Nutrition & Diet Planning',
    qualification: 'MSc Dietetics, Registered Nutritionist',
    rating: 4.7,
    consultationFee: 6500,
    location: 'Abuja',
    phone: '+234 808 901 2345',
    verified: true,
    image: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c9349?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    name: 'Emeka Okonkwo',
    specialty: 'Bodybuilding Nutrition',
    qualification: 'BSc Nutrition, Certified Sports Nutritionist',
    rating: 4.8,
    consultationFee: 7000,
    location: 'Port Harcourt',
    phone: '+234 809 012 3456',
    verified: true,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=300&fit=crop',
  },
];

const stores: Store[] = [
  {
    id: '1',
    name: 'FitGear Nigeria',
    type: 'Equipment & Supplements',
    location: 'Lekki, Lagos',
    rating: 4.8,
    products: ['Dumbbells', 'Protein', 'Yoga Mats', 'Resistance Bands'],
    delivery: true,
    phone: '+234 810 123 4567',
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    name: 'HealthyChoice Supplements',
    type: 'Supplements & Nutrition',
    location: 'Victoria Island, Lagos',
    rating: 4.6,
    products: ['Whey Protein', 'Pre-Workout', 'Vitamins', 'BCAAs'],
    delivery: true,
    phone: '+234 811 234 5678',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    name: 'ActiveWear Lagos',
    type: 'Fitness Apparel',
    location: 'Ikeja, Lagos',
    rating: 4.7,
    products: ['Gym Wear', 'Running Shoes', 'Sports Bras', 'Compression'],
    delivery: true,
    phone: '+234 812 345 6789',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  },
];

const events: Event[] = [
  {
    id: '1',
    name: 'Lagos Fitness Marathon 2024',
    date: 'March 15, 2024',
    time: '6:00 AM',
    location: 'Lekki Phase 1, Lagos',
    type: 'Marathon',
    attendees: 500,
    price: '₦5,000',
    organizer: 'FitNaija Events',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    name: 'CrossFit Games Nigeria',
    date: 'April 20, 2024',
    time: '8:00 AM',
    location: 'Eko Atlantic, Lagos',
    type: 'Competition',
    attendees: 200,
    price: '₦10,000',
    organizer: 'CrossFit Nigeria',
    image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    name: 'Yoga in the Park',
    date: 'Every Saturday',
    time: '7:00 AM',
    location: 'Freedom Park, Lagos',
    type: 'Wellness',
    attendees: 50,
    price: 'Free',
    organizer: 'Zen Lagos',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
  },
];

const workoutSpots: WorkoutSpot[] = [
  {
    id: '1',
    name: 'Bar Beach Fitness Zone',
    type: 'Beach Workout Area',
    location: 'Victoria Island, Lagos',
    rating: 4.7,
    features: ['Pull-up Bars', 'Sand Training', 'Running Track', 'Ocean View'],
    free: true,
    bestTime: 'Early Morning',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    name: 'Ikoyi Golf Course Track',
    type: 'Running Trail',
    location: 'Ikoyi, Lagos',
    rating: 4.8,
    features: ['Jogging Path', 'Cycling', 'Green Space', 'Security'],
    free: false,
    bestTime: 'Early Morning',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    name: 'Lekki Conservation Centre',
    type: 'Nature Trail',
    location: 'Lekki, Lagos',
    rating: 4.6,
    features: ['Canopy Walk', 'Hiking', 'Nature', 'Bird Watching'],
    free: false,
    bestTime: 'Morning',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop',
  },
];

const influencers: Influencer[] = [
  {
    id: '1',
    name: 'Fitness with Tola',
    followers: '850K',
    niche: 'Home Workouts & Weight Loss',
    verified: true,
    platform: 'Instagram',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    name: 'NaijaFit Coach',
    followers: '450K',
    niche: 'Nigerian Diet & Fitness',
    verified: true,
    platform: 'TikTok',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    name: 'Lagos Iron Man',
    followers: '650K',
    niche: 'Bodybuilding & Strength',
    verified: true,
    platform: 'YouTube',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop',
  },
  {
    id: '4',
    name: 'Wellness Queen Ada',
    followers: '320K',
    niche: 'Yoga & Mental Wellness',
    verified: true,
    platform: 'Instagram',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
  },
];

interface ExploreListingProps {
  searchQuery: string;
}

export const ExploreListing = ({ searchQuery }: ExploreListingProps) => {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  
  // Dialog states
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedNutritionist, setSelectedNutritionist] = useState<Nutritionist | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  const [gymPaymentDialog, setGymPaymentDialog] = useState(false);
  const [trainerDialog, setTrainerDialog] = useState(false);
  const [nutritionistDialog, setNutritionistDialog] = useState(false);
  const [storeDialog, setStoreDialog] = useState(false);
  const [eventDialog, setEventDialog] = useState(false);
  
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventEmail, setEventEmail] = useState("");
  const [eventPhone, setEventPhone] = useState("");

  // Filter data based on search and category
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    const filterByQuery = <T extends { name: string; location?: string }>(items: T[]) => 
      items.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.location?.toLowerCase().includes(query)
      );

    return {
      gyms: filterByQuery(gyms),
      trainers: filterByQuery(trainers),
      nutritionists: filterByQuery(nutritionists),
      stores: filterByQuery(stores),
      events: filterByQuery(events),
      spots: filterByQuery(workoutSpots),
      influencers: filterByQuery(influencers),
    };
  }, [searchQuery]);

  // Handlers
  const handleGymVisit = (gym: Gym) => {
    setSelectedGym(gym);
    setGymPaymentDialog(true);
  };

  const handleTrainerBook = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setTrainerDialog(true);
  };

  const handleNutritionistBook = (nutritionist: Nutritionist) => {
    setSelectedNutritionist(nutritionist);
    setNutritionistDialog(true);
  };

  const handleStoreVisit = (store: Store) => {
    setSelectedStore(store);
    setStoreDialog(true);
  };

  const handleEventRegister = (event: Event) => {
    setSelectedEvent(event);
    setEventDialog(true);
  };

  const handleSpotDirections = (spot: WorkoutSpot) => {
    toast({
      title: "Opening Directions",
      description: `Getting directions to ${spot.name}...`,
    });
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.location)}`, '_blank');
  };

  const handleInfluencerFollow = (influencer: Influencer) => {
    toast({
      title: "Opening Profile",
      description: `Redirecting to ${influencer.name}'s ${influencer.platform} profile...`,
    });
  };

  const handleBookingSubmit = () => {
    toast({
      title: "Booking Confirmed!",
      description: "You will receive a confirmation email shortly.",
    });
    setTrainerDialog(false);
    setNutritionistDialog(false);
    setBookingDate("");
    setBookingTime("");
    setBookingNotes("");
  };

  const handleEventRegistration = () => {
    toast({
      title: "Registration Successful!",
      description: "You're all set for the event. Check your email for details.",
    });
    setEventDialog(false);
    setEventName("");
    setEventEmail("");
    setEventPhone("");
  };

  // Render section helper
  const renderSection = (
    title: string,
    items: any[],
    renderCard: (item: any, index: number) => React.ReactNode,
    categoryId: CategoryType
  ) => {
    if (activeCategory !== "all" && activeCategory !== categoryId) return null;
    if (items.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Badge variant="outline">{items.length} results</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {items.map(renderCard)}
        </div>
      </div>
    );
  };

  const hasResults = Object.values(filteredData).some(arr => arr.length > 0);

  return (
    <div className="space-y-8">
      <ExploreFilters 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        searchQuery={searchQuery}
      />

      {!hasResults ? (
        <div className="text-center py-16 space-y-4">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold">No results found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Gyms */}
          {renderSection("Featured Gyms", filteredData.gyms, (gym, index) => (
            <ExploreCard
              key={gym.id}
              title={gym.name}
              subtitle={gym.priceRange}
              rating={gym.rating}
              location={gym.location}
              phone={gym.phone}
              verified={gym.verified}
              badges={gym.amenities.slice(0, 3)}
              image={gym.image}
              category="Gym"
              categoryIcon={<Dumbbell className="h-3 w-3" />}
              onAction={() => handleGymVisit(gym)}
              actionLabel="View & Join"
              featured={index === 0}
            />
          ), "gyms")}

          {/* Trainers */}
          {renderSection("Professional Trainers", filteredData.trainers, (trainer) => (
            <ExploreCard
              key={trainer.id}
              title={trainer.name}
              subtitle={trainer.specialty}
              rating={trainer.rating}
              location={trainer.location}
              phone={trainer.phone}
              verified={trainer.certified}
              badges={[trainer.experience, `₦${trainer.pricePerSession}/session`]}
              image={trainer.image}
              category="Trainer"
              categoryIcon={<User className="h-3 w-3" />}
              onAction={() => handleTrainerBook(trainer)}
              actionLabel="Book Session"
              actionIcon={<Calendar className="h-4 w-4" />}
            />
          ), "trainers")}

          {/* Nutritionists */}
          {renderSection("Expert Nutritionists", filteredData.nutritionists, (nutritionist) => (
            <ExploreCard
              key={nutritionist.id}
              title={nutritionist.name}
              subtitle={nutritionist.specialty}
              rating={nutritionist.rating}
              location={nutritionist.location}
              phone={nutritionist.phone}
              verified={nutritionist.verified}
              badges={[nutritionist.qualification, `₦${nutritionist.consultationFee}`]}
              image={nutritionist.image}
              category="Nutritionist"
              categoryIcon={<Utensils className="h-3 w-3" />}
              onAction={() => handleNutritionistBook(nutritionist)}
              actionLabel="Book Consultation"
              actionIcon={<Calendar className="h-4 w-4" />}
            />
          ), "nutritionists")}

          {/* Stores */}
          {renderSection("Fitness Stores", filteredData.stores, (store) => (
            <ExploreCard
              key={store.id}
              title={store.name}
              subtitle={store.type}
              rating={store.rating}
              location={store.location}
              phone={store.phone}
              badges={[...store.products.slice(0, 2), store.delivery ? 'Delivery' : 'Pickup Only']}
              image={store.image}
              category="Store"
              categoryIcon={<ShoppingBag className="h-3 w-3" />}
              onAction={() => handleStoreVisit(store)}
              actionLabel="Visit Store"
              actionIcon={<ExternalLink className="h-4 w-4" />}
            />
          ), "stores")}

          {/* Events */}
          {renderSection("Upcoming Events", filteredData.events, (event) => (
            <ExploreCard
              key={event.id}
              title={event.name}
              subtitle={`${event.date} at ${event.time}`}
              location={event.location}
              badges={[event.type, event.price, `${event.attendees} attending`]}
              image={event.image}
              category="Event"
              categoryIcon={<Calendar className="h-3 w-3" />}
              onAction={() => handleEventRegister(event)}
              actionLabel="Register Now"
              actionIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              <p className="text-xs text-muted-foreground">by {event.organizer}</p>
            </ExploreCard>
          ), "events")}

          {/* Workout Spots */}
          {renderSection("Outdoor Workout Spots", filteredData.spots, (spot) => (
            <ExploreCard
              key={spot.id}
              title={spot.name}
              subtitle={spot.type}
              rating={spot.rating}
              location={spot.location}
              badges={[...spot.features.slice(0, 2), spot.free ? 'Free' : 'Paid']}
              image={spot.image}
              category="Outdoor"
              categoryIcon={<TreePine className="h-3 w-3" />}
              onAction={() => handleSpotDirections(spot)}
              actionLabel="Get Directions"
              actionIcon={<Navigation className="h-4 w-4" />}
            >
              <p className="text-xs text-muted-foreground">Best time: {spot.bestTime}</p>
            </ExploreCard>
          ), "spots")}

          {/* Influencers */}
          {renderSection("Fitness Influencers", filteredData.influencers, (influencer) => (
            <ExploreCard
              key={influencer.id}
              title={influencer.name}
              subtitle={influencer.niche}
              verified={influencer.verified}
              badges={[influencer.platform, `${influencer.followers} followers`]}
              image={influencer.image}
              category="Influencer"
              categoryIcon={<TrendingUp className="h-3 w-3" />}
              onAction={() => handleInfluencerFollow(influencer)}
              actionLabel="Follow"
              actionIcon={<Users className="h-4 w-4" />}
            />
          ), "influencers")}
        </div>
      )}

      {/* Dialogs */}
      <GymPaymentDialog 
        gym={selectedGym} 
        open={gymPaymentDialog} 
        onClose={() => setGymPaymentDialog(false)} 
      />

      <TrainerBookingDialog
        trainer={selectedTrainer}
        open={trainerDialog}
        onClose={() => setTrainerDialog(false)}
        gyms={gyms}
      />

      <Dialog open={nutritionistDialog} onOpenChange={setNutritionistDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Consultation with {selectedNutritionist?.name}</DialogTitle>
            <DialogDescription>Schedule your nutrition consultation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="date">Preferred Date</Label>
              <Input
                id="date"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time">Preferred Time</Label>
              <Input
                id="time"
                type="time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="notes">Health Goals & Concerns</Label>
              <Textarea
                id="notes"
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Describe your nutrition goals..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleBookingSubmit}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={storeDialog} onOpenChange={setStoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedStore?.name}</DialogTitle>
            <DialogDescription>Visit this store</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{selectedStore?.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{selectedStore?.phone}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedStore?.products.map((product, index) => (
                <Badge key={index} variant="secondary">{product}</Badge>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              toast({ title: "Opening Store", description: "Redirecting to store website..." });
              setStoreDialog(false);
            }}>
              Visit Store
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={eventDialog} onOpenChange={setEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register for {selectedEvent?.name}</DialogTitle>
            <DialogDescription>Complete your event registration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={eventEmail}
                onChange={(e) => setEventEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={eventPhone}
                onChange={(e) => setEventPhone(e.target.value)}
                placeholder="+234"
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold">Event Price: {selectedEvent?.price}</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEventRegistration}>Complete Registration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
