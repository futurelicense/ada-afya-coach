import type { UserProfile } from "@/lib/userDataService";

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const ACTIVITY: Record<UserProfile["fitnessLevel"], number> = {
  beginner: 1.35,
  intermediate: 1.5,
  advanced: 1.7,
};

/** Daily targets from the member's saved body stats and goal. */
export function nutritionTargetsFor(profile: Pick<UserProfile, "weight" | "height" | "age" | "gender" | "fitnessLevel" | "goals"> | null | undefined): MacroTargets {
  const weight = profile?.weight && profile.weight > 0 ? profile.weight : 70;
  const height = profile?.height && profile.height > 0 ? profile.height : 170;
  const age = profile?.age && profile.age > 0 ? profile.age : 28;
  const sexOffset = profile?.gender === "male" ? 5 : profile?.gender === "female" ? -161 : -78;
  const bmr = 10 * weight + 6.25 * height - 5 * age + sexOffset;
  const activity = ACTIVITY[profile?.fitnessLevel ?? "intermediate"] ?? 1.5;
  const goal = profile?.goals?.[0] ?? "";
  const adjustment = goal === "lose-weight" ? -400 : goal === "build-muscle" ? 250 : 0;
  const calories = Math.round(Math.min(4000, Math.max(1400, bmr * activity + adjustment)));

  const proteinPerKg = goal === "build-muscle" ? 1.8 : goal === "lose-weight" ? 1.6 : 1.4;
  const protein = Math.round(weight * proteinPerKg);
  const fats = Math.round(weight * 0.8);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fats * 9) / 4));

  return { calories, protein, carbs, fats };
}
