import { describe, expect, it } from "vitest";
import {
  addDays,
  baselineAndLatest,
  captureIsDue,
  formatMeasureDelta,
  measureDelta,
  nextCaptureDate,
  poseComparisons,
  posesForFocus,
  sessionsInJourney,
  trainingDates,
  workoutRequestFor,
} from "@/lib/journey";

describe("journey poses and check-in schedule", () => {
  it("asks for leg poses only on a leg-building journey", () => {
    expect(posesForFocus("reduce-belly-fat")).toEqual(["front", "side", "back"]);
    expect(posesForFocus("build-legs")).toEqual(["front", "side", "back", "legs_front", "legs_side"]);
  });

  it("schedules the next capture 14 days after the latest photo set", () => {
    expect(nextCaptureDate(["2026-09-01", "2026-09-15"])).toBe("2026-09-29");
    expect(addDays("2026-09-01", 14)).toBe("2026-09-15");
  });

  it("marks a capture due on the scheduled day and not before", () => {
    expect(captureIsDue(["2026-09-01"], "2026-09-14")).toBe(false);
    expect(captureIsDue(["2026-09-01"], "2026-09-15")).toBe(true);
    expect(captureIsDue([], "2026-09-15")).toBe(false);
  });

  it("plans three sessions and a focus-specific workout request", () => {
    expect(trainingDates("2026-09-30")).toEqual(["2026-09-30", "2026-10-02", "2026-10-04"]);
    expect(workoutRequestFor({
      focus: "reduce-belly-fat",
      equipment: "home",
      fitnessLevel: "beginner",
    })).toMatchObject({
      targetMuscles: ["full body"],
      equipment: "bodyweight only",
      durationMinutes: 35,
    });
    expect(workoutRequestFor({
      focus: "build-legs",
      equipment: "gym",
      fitnessLevel: "advanced",
    }).targetMuscles).toEqual(["quads", "hamstrings", "glutes", "calves"]);
  });

  it("compares the latest check-in with the baseline", () => {
    const points = [
      { id: "b", kind: "baseline" as const, takenOn: "2026-09-01", weightKg: 80, waistCm: 90 },
      { id: "c1", kind: "checkin" as const, takenOn: "2026-09-15", weightKg: 79, waistCm: null },
      { id: "c2", kind: "checkin" as const, takenOn: "2026-09-29", weightKg: 77.5, waistCm: 86 },
    ];
    const { baseline, latest } = baselineAndLatest(points);
    expect(baseline?.id).toBe("b");
    expect(latest?.id).toBe("c2");
    expect(measureDelta(baseline!.weightKg, latest!.weightKg)).toBe(-2.5);
    expect(formatMeasureDelta(-2.5, "kg")).toBe("-2.5 kg");
    expect(measureDelta(baseline!.waistCm, latest!.waistCm)).toBe(-4);
    expect(measureDelta(90, null)).toBeNull();
    expect(poseComparisons("reduce-belly-fat", "b", "c2", [
      { checkinId: "b", angle: "front", url: "base-front" },
      { checkinId: "c2", angle: "front", url: "now-front" },
      { checkinId: "c1", angle: "side", url: "mid-side" },
    ])).toEqual([
      { pose: "front", baselineUrl: "base-front", latestUrl: "now-front" },
      { pose: "side", baselineUrl: null, latestUrl: null },
      { pose: "back", baselineUrl: null, latestUrl: null },
    ]);
  });

  it("counts completed sessions inside the journey dates", () => {
    const rows = [
      { date: "2026-08-31", completed: true },
      { date: "2026-09-01", completed: true },
      { date: "2026-09-03", completed: false },
      { date: "2026-09-10", completed: true },
      { date: "2026-10-01", completed: true },
    ];
    expect(sessionsInJourney(rows, "2026-09-01", "2026-09-30")).toBe(2);
  });
});
