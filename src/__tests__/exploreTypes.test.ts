// Type-level tests: verify exported types from @/types/explore are structurally sound.
// These tests instantiate objects conforming to the types and assert runtime shape.

import type { Gym, Trainer, Nutritionist, Store, FitnessEvent, WorkoutSpot, Influencer } from "@/types/explore";

describe("explore types – structural validation", () => {
  it("Gym type accepts a minimal valid object", () => {
    const gym: Gym = {
      id: "1",
      name: "TestGym",
      location: "Lagos",
      rating: 4.5,
      priceRange: "₦10,000/month",
      amenities: ["Cardio"],
      verified: true,
      phone: "+234 800 000 0000",
    };
    expect(gym.id).toBe("1");
    expect(gym.amenities).toContain("Cardio");
    expect(gym.image).toBeUndefined();
  });

  it("Trainer type has optional image", () => {
    const trainer: Trainer = {
      id: "2",
      name: "Test Trainer",
      specialty: "HIIT",
      experience: "5 years",
      rating: 4.8,
      pricePerSession: 5000,
      location: "Abuja",
      phone: "+234 800 000 0001",
      certified: true,
      image: "https://example.com/photo.jpg",
    };
    expect(trainer.certified).toBe(true);
    expect(trainer.image).toBeDefined();
  });

  it("FitnessEvent type has attendee count", () => {
    const event: FitnessEvent = {
      id: "3",
      name: "Lagos Run",
      date: "2025-04-01",
      time: "6:00 AM",
      location: "Victoria Island",
      type: "Marathon",
      attendees: 500,
      price: "₦5,000",
      organizer: "FitNaija",
    };
    expect(event.attendees).toBe(500);
  });

  it("WorkoutSpot free flag is boolean", () => {
    const spot: WorkoutSpot = {
      id: "4",
      name: "Bar Beach",
      type: "Outdoor",
      location: "VI, Lagos",
      rating: 4.7,
      features: ["Pull-up Bars"],
      free: true,
      bestTime: "Morning",
    };
    expect(spot.free).toBe(true);
  });

  it("Influencer has platform and followers", () => {
    const influencer: Influencer = {
      id: "5",
      name: "FitNaija Coach",
      followers: "250K",
      niche: "Bodybuilding",
      verified: true,
      platform: "Instagram",
    };
    expect(influencer.platform).toBe("Instagram");
  });

  it("Nutritionist and Store have optional image", () => {
    const nutritionist: Nutritionist = {
      id: "6",
      name: "Dr. Test",
      specialty: "Sports Nutrition",
      qualification: "PhD",
      rating: 4.9,
      consultationFee: 8000,
      location: "Lagos",
      phone: "+234 800 000 0002",
      verified: true,
    };
    expect(nutritionist.image).toBeUndefined();

    const store: Store = {
      id: "7",
      name: "FitStore",
      type: "Supplements",
      location: "Lekki",
      rating: 4.6,
      products: ["Whey Protein"],
      delivery: false,
      phone: "+234 800 000 0003",
    };
    expect(store.delivery).toBe(false);
  });
});
