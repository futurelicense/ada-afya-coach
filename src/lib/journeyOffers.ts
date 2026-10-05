import { supabase } from "@/lib/supabase";
import type { JourneyFocus } from "@/lib/journey";

export interface RoutineMove {
  id?: string;
  name: string;
  sets: number;
  reps: number;
  cue: string;
  audioPath: string | null;
  clipPath: string | null;
}

export interface RoutineOffer {
  id: string;
  trainerId: string;
  trainerName: string;
  focus: JourneyFocus;
  title: string;
  summary: string;
  priceNaira: number;
  moves: RoutineMove[];
}

export interface MealPlanOffer {
  id: string;
  vendorId: string;
  vendorName: string;
  focus: JourneyFocus;
  title: string;
  summary: string;
  priceNaira: number;
  meals: Array<{ name: string; mealType: string; calories: number }>;
}

export interface JourneyRequestRow {
  id: string;
  kind: "routine" | "meal_plan";
  routineId: string | null;
  mealPlanId: string | null;
  status: "requested" | "accepted";
}

export function mediaObjectPath(userId: string, file: File): string {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  return `${userId}/${crypto.randomUUID()}.${ext}`;
}

export function publicMediaUrl(path: string | null): string | null {
  if (!path) return null;
  const base = import.meta.env.VITE_SUPABASE_URL as string;
  return `${base}/storage/v1/object/public/routine-media/${path}`;
}

export function mealsFromUnknown(value: unknown): MealPlanOffer["meals"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const meal = row as Record<string, unknown>;
    const name = String(meal.name ?? "").trim();
    if (!name) return [];
    return [{
      name,
      mealType: String(meal.meal_type ?? meal.mealType ?? "meal"),
      calories: Number(meal.calories ?? 0) || 0,
    }];
  });
}

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("Sign in to continue.");
  return id;
}

export const journeyOffers = {
  async listRoutines(focus: JourneyFocus): Promise<RoutineOffer[]> {
    const { data, error } = await supabase
      .from("trainer_routines")
      .select("id, trainer_id, focus, title, summary, price_naira, public_trainers(name), trainer_routine_moves(id, sort, name, sets, reps, cue, audio_path, clip_path)")
      .eq("focus", focus)
      .eq("published", true);
    if (error) throw error;
    return (data ?? []).map((row) => {
      const trainer = row.public_trainers as { name?: string } | { name?: string }[] | null;
      const trainerName = Array.isArray(trainer) ? trainer[0]?.name : trainer?.name;
      const moves = ((row.trainer_routine_moves ?? []) as Array<Record<string, unknown>>)
        .sort((a, b) => Number(a.sort) - Number(b.sort))
        .map((move) => ({
          id: move.id as string,
          name: String(move.name),
          sets: Number(move.sets),
          reps: Number(move.reps),
          cue: String(move.cue ?? ""),
          audioPath: (move.audio_path as string) ?? null,
          clipPath: (move.clip_path as string) ?? null,
        }));
      return {
        id: row.id as string,
        trainerId: row.trainer_id as string,
        trainerName: trainerName || "Trainer",
        focus: row.focus as JourneyFocus,
        title: row.title as string,
        summary: (row.summary as string) ?? "",
        priceNaira: Number(row.price_naira),
        moves,
      };
    });
  },

  async listMealPlans(focus: JourneyFocus): Promise<MealPlanOffer[]> {
    const { data, error } = await supabase
      .from("vendor_meal_plans")
      .select("id, vendor_id, focus, title, summary, price_naira, meals, vendors(name)")
      .eq("focus", focus)
      .eq("published", true);
    if (error) throw error;
    return (data ?? []).map((row) => {
      const vendor = row.vendors as { name?: string } | { name?: string }[] | null;
      const vendorName = Array.isArray(vendor) ? vendor[0]?.name : vendor?.name;
      return {
        id: row.id as string,
        vendorId: row.vendor_id as string,
        vendorName: vendorName || "Vendor",
        focus: row.focus as JourneyFocus,
        title: row.title as string,
        summary: (row.summary as string) ?? "",
        priceNaira: Number(row.price_naira),
        meals: mealsFromUnknown(row.meals),
      };
    });
  },

  async listRequests(journeyId: string): Promise<JourneyRequestRow[]> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("journey_requests")
      .select("id, kind, routine_id, meal_plan_id, status")
      .eq("journey_id", journeyId)
      .eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      kind: row.kind as JourneyRequestRow["kind"],
      routineId: (row.routine_id as string) ?? null,
      mealPlanId: (row.meal_plan_id as string) ?? null,
      status: row.status as JourneyRequestRow["status"],
    }));
  },

  async requestRoutine(journeyId: string, routineId: string): Promise<void> {
    const userId = await currentUserId();
    const { error } = await supabase.from("journey_requests").insert({
      journey_id: journeyId,
      user_id: userId,
      kind: "routine",
      routine_id: routineId,
      status: "requested",
    });
    if (error) throw error;
  },

  async requestMealPlan(journeyId: string, mealPlanId: string): Promise<void> {
    const userId = await currentUserId();
    const { error } = await supabase.from("journey_requests").insert({
      journey_id: journeyId,
      user_id: userId,
      kind: "meal_plan",
      meal_plan_id: mealPlanId,
      status: "requested",
    });
    if (error) throw error;
  },
};
