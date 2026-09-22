export interface Gym {
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

export interface Trainer {
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

export interface Nutritionist {
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

export interface Store {
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

export interface FitnessEvent {
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

export interface WorkoutSpot {
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

export interface Influencer {
  id: string;
  name: string;
  followers: string;
  niche: string;
  verified: boolean;
  platform: string;
  image?: string;
}
