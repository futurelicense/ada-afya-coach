import { describe, expect, it } from "vitest";
import { isSeededCommunityPost, rankByCompletedWorkouts, scoreFromWorkouts, streakFromDates } from "@/lib/activityScore";

const now = new Date("2026-09-28T12:00:00Z");

describe("activity score", () => {
  it("returns a zero streak and level 1 when there are no workouts", () => {
    expect(scoreFromWorkouts(0, [], now)).toEqual({
      points: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
    });
  });

  it("counts a current streak only when the latest workout is today or yesterday", () => {
    expect(streakFromDates(["2026-09-26", "2026-09-27", "2026-09-28"], now)).toEqual({
      current: 3,
      longest: 3,
    });
    expect(streakFromDates(["2026-09-01", "2026-09-02"], now).current).toBe(0);
  });

  it("does not rank seeded points when the member has no completed workouts", () => {
    const ranked = rankByCompletedWorkouts([
      {
        rank: 1,
        name: "WeFit Admin",
        points: 99999,
        level: 99,
        streak: 99,
        longest_streak: 99,
        total_workouts: 0,
        total_calories: 0,
      },
      {
        rank: 2,
        name: "Ada",
        points: 50,
        level: 1,
        streak: 9,
        longest_streak: 9,
        total_workouts: 2,
        total_calories: 400,
      },
    ]);

    expect(ranked).toHaveLength(1);
    expect(isSeededCommunityPost("hit a 14-day workout streak 🔥")).toBe(true);
    expect(isSeededCommunityPost("logged Egusi soup")).toBe(false);

    expect(ranked[0]).toMatchObject({
      name: "Ada",
      rank: 1,
      points: 200,
      level: 1,
      streak: 2,
      longest_streak: 2,
      total_workouts: 2,
    });
  });
});
