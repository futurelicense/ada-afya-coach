import { supabase } from "@/lib/supabase";
import { aiService } from "@/lib/aiService";
import { nutritionTargetsFor } from "@/lib/nutritionTargets";
import { progressPhotoService, ProgressPhoto } from "@/lib/progressPhotoService";
import { userDataService, UserProfile } from "@/lib/userDataService";
import {
  Equipment,
  JourneyFocus,
  Pose,
  addDays,
  goalForFocus,
  posesForFocus,
  sessionsInJourney,
  trainingDates,
  workoutRequestFor,
} from "@/lib/journey";

export interface JourneyRecord {
  id: string;
  focus: JourneyFocus;
  status: "active" | "completed";
  fitnessLevel: UserProfile["fitnessLevel"];
  equipment: Equipment;
  weightKg: number | null;
  heightCm: number | null;
  waistCm: number | null;
  startedOn: string;
  targetOn: string | null;
  updatedAt: string | null;
}

export interface JourneyCheckin {
  id: string;
  kind: "baseline" | "checkin";
  weightKg: number | null;
  waistCm: number | null;
  takenOn: string;
}

export interface JourneyDraft {
  focus: JourneyFocus;
  fitnessLevel: UserProfile["fitnessLevel"];
  equipment: Equipment;
  weightKg: number;
  heightCm: number;
  waistCm: number | null;
  targetOn: string;
  photos: Partial<Record<Pose, File>>;
}

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("Sign in to start a journey.");
  return id;
}

function journeyFromRow(row: Record<string, unknown>): JourneyRecord {
  return {
    id: row.id as string,
    focus: row.focus as JourneyFocus,
    status: row.status as JourneyRecord["status"],
    fitnessLevel: (row.fitness_level as JourneyRecord["fitnessLevel"]) ?? "intermediate",
    equipment: row.equipment as Equipment,
    weightKg: row.weight_kg == null ? null : Number(row.weight_kg),
    heightCm: row.height_cm == null ? null : Number(row.height_cm),
    waistCm: row.waist_cm == null ? null : Number(row.waist_cm),
    startedOn: row.started_on as string,
    targetOn: (row.target_on as string) ?? null,
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : null,
  };
}

function checkinFromRow(row: Record<string, unknown>): JourneyCheckin {
  return {
    id: row.id as string,
    kind: row.kind as JourneyCheckin["kind"],
    weightKg: row.weight_kg == null ? null : Number(row.weight_kg),
    waistCm: row.waist_cm == null ? null : Number(row.waist_cm),
    takenOn: row.taken_on as string,
  };
}

async function savePhotos(journeyId: string, checkinId: string, focus: JourneyFocus, photos: Partial<Record<Pose, File>>) {
  const required = posesForFocus(focus);
  const missing = required.filter((pose) => !photos[pose]);
  if (missing.length) throw new Error("Add a photo for every pose before saving.");

  for (const pose of required) {
    await progressPhotoService.upload(photos[pose]!, {
      note: pose,
      angle: pose,
      journeyId,
      checkinId,
    });
  }
}

async function rememberOnProfile(draft: Pick<JourneyDraft, "focus" | "fitnessLevel" | "weightKg" | "heightCm">) {
  const profile = await userDataService.getProfile();
  if (!profile) return;
  await userDataService.saveProfile({
    ...profile,
    weight: draft.weightKg,
    height: draft.heightCm,
    fitnessLevel: draft.fitnessLevel,
    goals: [goalForFocus(draft.focus)],
  });
}

export const journeyService = {
  async getActive(): Promise<JourneyRecord | null> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("journeys")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    if (error) throw error;
    return data ? journeyFromRow(data) : null;
  },

  async getLatestCompleted(): Promise<JourneyRecord | null> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("journeys")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? journeyFromRow(data) : null;
  },

  async countCompletedSessions(startedOn: string, endedOn: string): Promise<number> {
    const workouts = await userDataService.getWorkouts();
    return sessionsInJourney(workouts, startedOn, endedOn);
  },

  async listCheckins(journeyId: string): Promise<JourneyCheckin[]> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("journey_checkins")
      .select("*")
      .eq("journey_id", journeyId)
      .eq("user_id", userId)
      .order("taken_on", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => checkinFromRow(row));
  },

  async listPhotos(journeyId: string): Promise<ProgressPhoto[]> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("progress_photos")
      .select("id, storage_path, angle, notes, taken_at, checkin_id")
      .eq("user_id", userId)
      .eq("journey_id", journeyId)
      .order("taken_at", { ascending: true });
    if (error) throw error;

    const listed = await progressPhotoService.list();
    const urls = new Map(listed.map((photo) => [photo.id, photo.url]));
    return (data ?? []).map((row) => ({
      id: row.id as string,
      storagePath: row.storage_path as string,
      date: row.taken_at as string,
      note: (row.notes as string) || "",
      angle: (row.angle as string) ?? null,
      checkinId: (row.checkin_id as string) ?? null,
      url: urls.get(row.id as string) ?? "",
    }));
  },

  async start(draft: JourneyDraft): Promise<JourneyRecord> {
    const userId = await currentUserId();
    const active = await this.getActive();
    if (active) throw new Error("End the current journey before starting another.");

    const { data: journey, error } = await supabase
      .from("journeys")
      .insert({
        user_id: userId,
        focus: draft.focus,
        status: "active",
        fitness_level: draft.fitnessLevel,
        equipment: draft.equipment,
        weight_kg: draft.weightKg,
        height_cm: draft.heightCm,
        waist_cm: draft.waistCm,
        target_on: draft.targetOn,
      })
      .select("*")
      .single();
    if (error || !journey) throw error ?? new Error("Could not start the journey.");

    const { data: checkin, error: checkinError } = await supabase
      .from("journey_checkins")
      .insert({
        journey_id: journey.id,
        user_id: userId,
        kind: "baseline",
        weight_kg: draft.weightKg,
        waist_cm: draft.waistCm,
      })
      .select("id")
      .single();
    if (checkinError || !checkin) throw checkinError ?? new Error("Could not save the baseline.");

    await savePhotos(journey.id as string, checkin.id as string, draft.focus, draft.photos);
    await rememberOnProfile(draft);
    return journeyFromRow(journey);
  },

  async addCheckin(journey: JourneyRecord, draft: Pick<JourneyDraft, "weightKg" | "waistCm" | "photos">): Promise<void> {
    const userId = await currentUserId();
    const { data: checkin, error } = await supabase
      .from("journey_checkins")
      .insert({
        journey_id: journey.id,
        user_id: userId,
        kind: "checkin",
        weight_kg: draft.weightKg,
        waist_cm: draft.waistCm,
      })
      .select("id")
      .single();
    if (error || !checkin) throw error ?? new Error("Could not save this check-in.");

    await savePhotos(journey.id, checkin.id as string, journey.focus, draft.photos);
    await supabase
      .from("journeys")
      .update({
        weight_kg: draft.weightKg,
        waist_cm: draft.waistCm,
        updated_at: new Date().toISOString(),
      })
      .eq("id", journey.id)
      .eq("user_id", userId);
    await rememberOnProfile({
      focus: journey.focus,
      fitnessLevel: journey.fitnessLevel,
      weightKg: draft.weightKg,
      heightCm: journey.heightCm ?? 0,
    });
  },

  async buildWeek(journey: JourneyRecord, profile: UserProfile | null): Promise<{
    workoutName: string;
    workoutDates: string[];
    mealDates: string[];
    calories: number;
    alreadySaved: boolean;
  }> {
    const today = new Date().toISOString().slice(0, 10);
    const sessionDates = trainingDates(today);
    const mealDates = Array.from({ length: 7 }, (_, index) => addDays(today, index));
    const [workouts, meals] = await Promise.all([
      userDataService.getWorkouts(),
      userDataService.getMeals(),
    ]);
    const workoutTaken = new Set(workouts.map((row) => row.date.slice(0, 10)));
    const mealTaken = new Set(meals.map((row) => row.date.slice(0, 10)));
    const openWorkoutDates = sessionDates.filter((date) => !workoutTaken.has(date));
    const openMealDates = mealDates.filter((date) => !mealTaken.has(date));
    if (!openWorkoutDates.length && !openMealDates.length) {
      return { workoutName: "", workoutDates: [], mealDates: [], calories: 0, alreadySaved: true };
    }

    const request = workoutRequestFor(journey);
    const targets = nutritionTargetsFor({
      weight: journey.weightKg ?? profile?.weight ?? 0,
      height: journey.heightCm ?? profile?.height ?? 0,
      age: profile?.age ?? 0,
      gender: profile?.gender,
      fitnessLevel: journey.fitnessLevel,
      goals: [goalForFocus(journey.focus)],
    });

    let workoutName = "";
    if (openWorkoutDates.length) {
      const workout = await aiService.generateWorkoutPlan({
        targetMuscles: request.targetMuscles,
        equipment: request.equipment,
        durationMinutes: request.durationMinutes,
        journeyBrief: request.brief,
      });
      workoutName = workout.name ?? "Workout";
      for (const date of openWorkoutDates) {
        await userDataService.addWorkout({
          ...workout,
          date,
          completed: false,
          caloriesBurned: 0,
        });
      }
    }

    if (openMealDates.length) {
      const plan = await aiService.generateMealPlan({
        calorieTarget: targets.calories,
        journeyBrief: `${request.brief} Protein target about ${targets.protein} g.`,
      });
      const rows = plan.meals ?? [];
      if (!rows.length) throw new Error("No meals were returned.");
      for (const date of openMealDates) {
        for (const meal of rows) {
          await userDataService.addMeal({
            date,
            mealType: meal.mealType,
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fats: meal.fats,
            eaten: false,
          });
        }
      }
    }

    return {
      workoutName,
      workoutDates: openWorkoutDates,
      mealDates: openMealDates,
      calories: targets.calories,
      alreadySaved: false,
    };
  },

  async complete(journeyId: string): Promise<void> {
    const userId = await currentUserId();
    const { error } = await supabase
      .from("journeys")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", journeyId)
      .eq("user_id", userId)
      .eq("status", "active");
    if (error) throw error;
  },
};
