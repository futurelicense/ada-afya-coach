/** Points, level, and streak derived only from completed workouts. */

export const POINTS_PER_WORKOUT = 100;

export interface ActivityScore {
  points: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
}

function dayKey(date: string): string {
  return date.slice(0, 10);
}

function dayDiff(later: string, earlier: string): number {
  const a = new Date(`${later}T00:00:00Z`).getTime();
  const b = new Date(`${earlier}T00:00:00Z`).getTime();
  return Math.round((a - b) / 86_400_000);
}

export function streakFromDates(dates: string[], now = new Date()): { current: number; longest: number } {
  const unique = [...new Set(dates.map(dayKey))].filter(Boolean).sort();
  if (unique.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    const gap = dayDiff(unique[i], unique[i - 1]);
    if (gap === 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else if (gap > 1) {
      run = 1;
    }
  }

  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
  const newest = unique[unique.length - 1];
  if (newest !== today && newest !== yesterday) return { current: 0, longest };

  let current = 1;
  for (let i = unique.length - 1; i > 0; i--) {
    if (dayDiff(unique[i], unique[i - 1]) === 1) current += 1;
    else break;
  }
  return { current, longest: Math.max(longest, current) };
}

export function scoreFromWorkouts(workoutCount: number, dates: string[], now = new Date()): ActivityScore {
  const { current, longest } = streakFromDates(dates, now);
  const points = Math.max(0, workoutCount) * POINTS_PER_WORKOUT;
  return {
    points,
    level: Math.floor(points / 1000) + 1,
    currentStreak: current,
    longestStreak: longest,
  };
}

export interface RankableMember {
  rank: number;
  points: number;
  level: number;
  streak: number;
  longest_streak: number;
  total_workouts: number;
  total_calories: number;
}

const SEEDED_ACTIVITY = [
  "Iron Will badge",
  "HIIT Finisher",
  "14-day workout streak",
  "crushed Leg Day",
  "Burn 5,000 Calories challenge",
  "Jollof Rice + Grilled Chicken",
  "welcome to the movement",
  "Rank #1 on the leaderboard",
  "21-day streak",
  "Gym Circuit",
];

/** Seed script inserted these highlight lines without a matching workout. */
export function isSeededCommunityPost(description: string): boolean {
  return SEEDED_ACTIVITY.some((phrase) => description.includes(phrase));
}

/** Drop members with no completed workouts and rank the rest by that work. */
export function rankByCompletedWorkouts<T extends RankableMember>(rows: T[]): T[] {
  return rows
    .filter((row) => row.total_workouts > 0)
    .map((row) => {
      const points = row.total_workouts * POINTS_PER_WORKOUT;
      const cap = row.total_workouts;
      return {
        ...row,
        points,
        level: Math.floor(points / 1000) + 1,
        streak: Math.min(Math.max(row.streak, 0), cap),
        longest_streak: Math.min(Math.max(row.longest_streak, 0), cap),
      };
    })
    .sort((a, b) => b.points - a.points || b.total_calories - a.total_calories || a.rank - b.rank)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}
