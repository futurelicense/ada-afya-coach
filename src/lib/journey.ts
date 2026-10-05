export type JourneyFocus = "reduce-belly-fat" | "build-legs";
export type JourneyStatus = "active" | "completed";
export type Equipment = "home" | "gym" | "both";
export type Pose = "front" | "side" | "back" | "legs_front" | "legs_side";

export const JOURNEY_FOCUSES: Array<{
  id: JourneyFocus;
  title: string;
  summary: string;
}> = [
  {
    id: "reduce-belly-fat",
    title: "Reduce belly fat",
    summary: "A calorie deficit and full-body training. Progress shows up at the waist, not from crunches alone.",
  },
  {
    id: "build-legs",
    title: "Build legs",
    summary: "Higher protein and squat, hinge, and lunge work. Photos include the legs from the front and the side.",
  },
];

export const POSE_LABELS: Record<Pose, string> = {
  front: "Front",
  side: "Side",
  back: "Back",
  legs_front: "Legs, front",
  legs_side: "Legs, side",
};

const BASE_POSES: Pose[] = ["front", "side", "back"];
const LEG_POSES: Pose[] = ["legs_front", "legs_side"];

export function posesForFocus(focus: JourneyFocus): Pose[] {
  return focus === "build-legs" ? [...BASE_POSES, ...LEG_POSES] : BASE_POSES;
}

export function goalForFocus(focus: JourneyFocus): string {
  return focus === "build-legs" ? "build-muscle" : "lose-weight";
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Next pose set is 14 days after the latest capture. */
export function nextCaptureDate(dates: string[]): string | null {
  const latest = dates.map((date) => date.slice(0, 10)).sort().at(-1);
  return latest ? addDays(latest, 14) : null;
}

export function captureIsDue(dates: string[], today = new Date().toISOString().slice(0, 10)): boolean {
  const next = nextCaptureDate(dates);
  return Boolean(next && today >= next);
}

export interface JourneyWorkoutRequest {
  targetMuscles: string[];
  equipment: string;
  durationMinutes: number;
  brief: string;
}

const EQUIPMENT_LABEL: Record<Equipment, string> = {
  home: "bodyweight only",
  gym: "dumbbells, machines, and a rack",
  both: "bodyweight plus a gym",
};

/** Three sessions in the coming week, two days apart, starting on `start`. */
export function trainingDates(start: string, sessions = 3): string[] {
  return Array.from({ length: sessions }, (_, index) => addDays(start, index * 2));
}

export interface CapturePoint {
  id: string;
  kind: "baseline" | "checkin";
  takenOn: string;
  weightKg: number | null;
  waistCm: number | null;
}

export interface PoseShot {
  checkinId?: string | null;
  angle: string | null;
  url: string;
}

export interface PoseComparison {
  pose: Pose;
  baselineUrl: string | null;
  latestUrl: string | null;
}

export function baselineAndLatest<T extends CapturePoint>(checkins: T[]): { baseline: T | null; latest: T | null } {
  const ordered = [...checkins].sort((a, b) => a.takenOn.localeCompare(b.takenOn) || a.id.localeCompare(b.id));
  const baseline = ordered.find((row) => row.kind === "baseline") ?? ordered[0] ?? null;
  const latest = ordered.filter((row) => baseline && row.id !== baseline.id).at(-1) ?? null;
  return { baseline, latest };
}

export function poseComparisons(
  focus: JourneyFocus,
  baselineId: string | null,
  latestId: string | null,
  photos: PoseShot[],
): PoseComparison[] {
  const shot = (checkinId: string | null, pose: Pose) =>
    checkinId ? photos.find((photo) => photo.checkinId === checkinId && photo.angle === pose)?.url ?? null : null;
  return posesForFocus(focus).map((pose) => ({
    pose,
    baselineUrl: shot(baselineId, pose),
    latestUrl: shot(latestId, pose),
  }));
}

export function measureDelta(start: number | null, latest: number | null): number | null {
  if (start == null || latest == null || !Number.isFinite(start) || !Number.isFinite(latest)) return null;
  return Math.round((latest - start) * 10) / 10;
}

export function formatMeasureDelta(delta: number | null, unit: string): string {
  if (delta == null) return "—";
  if (delta === 0) return `0 ${unit}`;
  return `${delta > 0 ? "+" : ""}${delta} ${unit}`;
}

export function sessionsInJourney(
  workouts: Array<{ date: string; completed: boolean }>,
  startedOn: string,
  endedOn: string,
): number {
  const start = startedOn.slice(0, 10);
  const end = endedOn.slice(0, 10);
  return workouts.filter((row) => row.completed && row.date.slice(0, 10) >= start && row.date.slice(0, 10) <= end).length;
}

export function workoutRequestFor(input: {
  focus: JourneyFocus;
  equipment: Equipment;
  fitnessLevel: "beginner" | "intermediate" | "advanced";
}): JourneyWorkoutRequest {
  const durationMinutes = input.fitnessLevel === "beginner" ? 35 : input.fitnessLevel === "advanced" ? 55 : 45;
  if (input.focus === "build-legs") {
    return {
      targetMuscles: ["quads", "hamstrings", "glutes", "calves"],
      equipment: EQUIPMENT_LABEL[input.equipment],
      durationMinutes,
      brief: "Build legs with squat, hinge, and lunge patterns. Keep protein high and calories at maintenance or a small surplus.",
    };
  }
  return {
    targetMuscles: ["full body"],
    equipment: EQUIPMENT_LABEL[input.equipment],
    durationMinutes,
    brief: "Reduce belly fat with a calorie deficit, higher protein, and full-body training. Do not treat ab isolation as the main work.",
  };
}
