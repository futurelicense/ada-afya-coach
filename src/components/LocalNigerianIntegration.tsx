import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dumbbell, User, Utensils, ShoppingBag, Calendar, TreePine, ExternalLink, Navigation, CheckCircle2, Users, TrendingUp, MapPin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { EnhancedCard } from "@/components/EnhancedCard";
import { GymPaymentDialog } from "@/components/GymPaymentDialog";
import { TrainerBookingDialog } from "@/components/TrainerBookingDialog";

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
    location: 'Ikoyi, Lagos',
    phone: '+234 806 789 0123',
    certified: true,
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
  },
];

const stores: Store[] = [
  {
    id: '1',
    name: 'FitGear Nigeria',
    type: 'Equipment & Apparel',
    location: 'Lekki, Lagos',
    rating: 4.6,
    products: ['Dumbbells', 'Protein', 'Apparel', 'Yoga Mats'],
    delivery: true,
    phone: '+234 810 123 4567',
  },
  {
    id: '2',
    name: 'Naija Supplements',
    type: 'Supplements & Nutrition',
    location: 'Victoria Island, Lagos',
    rating: 4.7,
    products: ['Whey Protein', 'Creatine', 'Vitamins', 'Pre-Workout'],
    delivery: true,
    phone: '+234 811 234 5678',
  },
  {
    id: '3',
    name: 'Strong Body Store',
    type: 'Fitness Equipment',
    location: 'Ikeja, Lagos',
    rating: 4.5,
    products: ['Treadmills', 'Bikes', 'Weights', 'Benches'],
    delivery: false,
    phone: '+234 812 345 6789',
  },
];

const events: Event[] = [
  {
    id: '1',
    name: 'Lagos Fitness Expo 2025',
    date: '2025-03-15',
    time: '9:00 AM - 5:00 PM',
    location: 'Eko Hotel & Suites, Victoria Island',
    type: 'Exhibition',
    attendees: 500,
    price: 'Free Entry',
    organizer: 'Nigerian Fitness Association',
  },
  {
    id: '2',
    name: 'Charity Marathon Run',
    date: '2025-04-20',
    time: '6:00 AM',
    location: 'Lekki-Ikoyi Link Bridge',
    type: 'Marathon',
    attendees: 1000,
    price: '₦5,000',
    organizer: 'Run For Health NGO',
  },
  {
    id: '3',
    name: 'Yoga & Wellness Festival',
    date: '2025-05-10',
    time: '8:00 AM - 4:00 PM',
    location: 'Freedom Park, Lagos Island',
    type: 'Workshop',
    attendees: 200,
    price: '₦8,000',
    organizer: 'Wellness Hub Nigeria',
  },
];

const workoutSpots: WorkoutSpot[] = [
  {
    id: '1',
    name: 'Bar Beach Fitness Area',
    type: 'Outdoor Gym',
    location: 'Victoria Island, Lagos',
    rating: 4.5,
    features: ['Pull-up Bars', 'Monkey Bars', 'Sit-up Benches', 'Running Track'],
    free: true,
    bestTime: 'Early Morning (6-8 AM)',
  },
  {
    id: '2',
    name: 'Lekki Phase 1 Park',
    type: 'Running & Calisthenics',
    location: 'Lekki Phase 1, Lagos',
    rating: 4.7,
    features: ['Jogging Path', 'Open Space', 'Pull-up Bars', 'Scenic Views'],
    free: true,
    bestTime: 'Evening (5-7 PM)',
  },
  {
    id: '3',
    name: 'Muri Okunola Park',
    type: 'Multi-purpose Fitness',
    location: 'Victoria Island, Lagos',
    rating: 4.8,
    features: ['Football Field', 'Basketball Court', 'Running Track', 'Gym Equipment'],
    free: false,
    bestTime: 'All Day',
  },
];

const influencers: Influencer[] = [
  {
    id: '1',
    name: 'FitNaija_Coach',
    followers: '250K',
    niche: 'Bodybuilding & Strength',
    verified: true,
    platform: 'Instagram',
  },
  {
    id: '2',
    name: 'Chioma Fitness',
    followers: '180K',
    niche: 'Weight Loss & HIIT',
    verified: true,
    platform: 'Instagram',
  },
  {
    id: '3',
    name: 'Lagos Gym Life',
    followers: '320K',
    niche: 'Gym Lifestyle & Motivation',
    verified: true,
    platform: 'YouTube',
  },
];

export const LocalNigerianIntegration = () => {
  const { toast } = useToast();
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

  return (
    <div className="space-y-12">
      {/* Gyms Carousel */}
      <CategoryCarousel
        title="Featured Gyms"
        description="Top-rated fitness centers across Nigeria"
        icon={<Dumbbell className="h-6 w-6" />}
      >
        {gyms.map((gym) => (
          <EnhancedCard
            key={gym.id}
            title={gym.name}
            subtitle={gym.priceRange}
            rating={gym.rating}
            location={gym.location}
            phone={gym.phone}
            verified={gym.verified}
            badges={gym.amenities.slice(0, 3)}
            onAction={() => handleGymVisit(gym)}
            actionLabel="Visit Website"
            actionIcon={<ExternalLink className="h-4 w-4" />}
          />
        ))}
      </CategoryCarousel>

      {/* Trainers Carousel */}
      <CategoryCarousel
        title="Professional Trainers"
        description="Certified fitness experts ready to help you"
        icon={<User className="h-6 w-6" />}
      >
        {trainers.map((trainer) => (
          <EnhancedCard
            key={trainer.id}
            title={trainer.name}
            subtitle={trainer.specialty}
            rating={trainer.rating}
            location={trainer.location}
            phone={trainer.phone}
            verified={trainer.certified}
            badges={[trainer.experience, `₦${trainer.pricePerSession}/session`]}
            onAction={() => handleTrainerBook(trainer)}
            actionLabel="Book Session"
            actionIcon={<Calendar className="h-4 w-4" />}
          />
        ))}
      </CategoryCarousel>

      {/* Nutritionists Carousel */}
      <CategoryCarousel
        title="Expert Nutritionists"
        description="Professional diet and nutrition consultants"
        icon={<Utensils className="h-6 w-6" />}
      >
        {nutritionists.map((nutritionist) => (
          <EnhancedCard
            key={nutritionist.id}
            title={nutritionist.name}
            subtitle={nutritionist.specialty}
            rating={nutritionist.rating}
            location={nutritionist.location}
            phone={nutritionist.phone}
            verified={nutritionist.verified}
            badges={[nutritionist.qualification, `₦${nutritionist.consultationFee}`]}
            onAction={() => handleNutritionistBook(nutritionist)}
            actionLabel="Book Consultation"
            actionIcon={<Calendar className="h-4 w-4" />}
          />
        ))}
      </CategoryCarousel>

      {/* Stores Carousel */}
      <CategoryCarousel
        title="Fitness Stores"
        description="Shop equipment, supplements, and apparel"
        icon={<ShoppingBag className="h-6 w-6" />}
      >
        {stores.map((store) => (
          <EnhancedCard
            key={store.id}
            title={store.name}
            subtitle={store.type}
            rating={store.rating}
            location={store.location}
            phone={store.phone}
            badges={[...store.products.slice(0, 2), store.delivery ? 'Delivery' : 'Pickup']}
            onAction={() => handleStoreVisit(store)}
            actionLabel="Visit Store"
            actionIcon={<ExternalLink className="h-4 w-4" />}
          />
        ))}
      </CategoryCarousel>

      {/* Events Carousel */}
      <CategoryCarousel
        title="Upcoming Events"
        description="Join fitness events and challenges"
        icon={<Calendar className="h-6 w-6" />}
      >
        {events.map((event) => (
          <EnhancedCard
            key={event.id}
            title={event.name}
            subtitle={`${event.date} at ${event.time}`}
            location={event.location}
            badges={[event.type, event.price, `${event.attendees} attendees`]}
            onAction={() => handleEventRegister(event)}
            actionLabel="Register Now"
            actionIcon={<CheckCircle2 className="h-4 w-4" />}
          >
            <div className="text-sm text-muted-foreground">
              Organized by {event.organizer}
            </div>
          </EnhancedCard>
        ))}
      </CategoryCarousel>

      {/* Workout Spots Carousel */}
      <CategoryCarousel
        title="Outdoor Workout Spots"
        description="Free and public fitness areas"
        icon={<TreePine className="h-6 w-6" />}
      >
        {workoutSpots.map((spot) => (
          <EnhancedCard
            key={spot.id}
            title={spot.name}
            subtitle={spot.type}
            rating={spot.rating}
            location={spot.location}
            badges={[...spot.features.slice(0, 2), spot.free ? 'Free' : 'Paid']}
            onAction={() => handleSpotDirections(spot)}
            actionLabel="Get Directions"
            actionIcon={<Navigation className="h-4 w-4" />}
          >
            <div className="text-sm text-muted-foreground">
              Best time: {spot.bestTime}
            </div>
          </EnhancedCard>
        ))}
      </CategoryCarousel>

      {/* Influencers Carousel */}
      <CategoryCarousel
        title="Fitness Influencers"
        description="Follow top Nigerian fitness creators"
        icon={<TrendingUp className="h-6 w-6" />}
      >
        {influencers.map((influencer) => (
          <EnhancedCard
            key={influencer.id}
            title={influencer.name}
            subtitle={influencer.niche}
            verified={influencer.verified}
            badges={[influencer.platform, influencer.followers]}
            onAction={() => handleInfluencerFollow(influencer)}
            actionLabel="Follow"
            actionIcon={<Users className="h-4 w-4" />}
          />
        ))}
      </CategoryCarousel>

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
