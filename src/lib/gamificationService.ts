// Supabase-backed gamification system for badges, streaks, and points
import { supabase } from '@/lib/supabase';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  category: 'workout' | 'nutrition' | 'streak' | 'social';
  earned: boolean;
  earnedDate?: Date;
}

export interface UserGamification {
  points: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  lastActiveDate: string;
}

interface EarnedBadgeEntry {
  id: string;
  earnedAt: string;
}

const BADGE_CATALOG: Omit<Badge, 'earned' | 'earnedDate'>[] = [
  // Workout Badges
  { id: 'first_workout', name: 'First Steps', description: 'Complete your first workout', icon: '🎯', requirement: 1, category: 'workout' },
  { id: 'workout_warrior', name: 'Workout Warrior', description: 'Complete 10 workouts', icon: '💪', requirement: 10, category: 'workout' },
  { id: 'fitness_master', name: 'Fitness Master', description: 'Complete 50 workouts', icon: '🏆', requirement: 50, category: 'workout' },
  { id: 'burn_1000', name: 'Calorie Crusher', description: 'Burn 1000 calories in one day', icon: '🔥', requirement: 1000, category: 'workout' },

  // Nutrition Badges
  { id: 'first_meal', name: 'Nutrition Beginner', description: 'Log your first meal', icon: '🍽️', requirement: 1, category: 'nutrition' },
  { id: 'meal_planner', name: 'Meal Planner', description: 'Complete 7 days of meal logging', icon: '📋', requirement: 7, category: 'nutrition' },
  { id: 'healthy_eater', name: 'Healthy Eater', description: 'Hit your calorie goal 10 times', icon: '🥗', requirement: 10, category: 'nutrition' },

  // Streak Badges
  { id: 'streak_3', name: 'Getting Consistent', description: '3-day workout streak', icon: '🌟', requirement: 3, category: 'streak' },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day workout streak', icon: '⭐', requirement: 7, category: 'streak' },
  { id: 'streak_30', name: 'Unstoppable', description: '30-day workout streak', icon: '🌠', requirement: 30, category: 'streak' },

  // Level Milestones
  { id: 'level_5', name: 'Rising Star', description: 'Reach Level 5', icon: '✨', requirement: 5, category: 'workout' },
  { id: 'level_10', name: 'Elite Athlete', description: 'Reach Level 10', icon: '👑', requirement: 10, category: 'workout' },
];

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

function buildBadges(earned: EarnedBadgeEntry[]): Badge[] {
  const earnedMap = new Map(earned.map(e => [e.id, e.earnedAt]));
  return BADGE_CATALOG.map(b => {
    const earnedAt = earnedMap.get(b.id);
    return earnedAt
      ? { ...b, earned: true, earnedDate: new Date(earnedAt) }
      : { ...b, earned: false };
  });
}

function rowToData(row: any): UserGamification {
  const earned: EarnedBadgeEntry[] = row?.earned_badges ?? [];
  return {
    points: row?.points ?? 0,
    level: row?.level ?? 1,
    currentStreak: row?.current_streak ?? 0,
    longestStreak: row?.longest_streak ?? 0,
    badges: buildBadges(earned),
    lastActiveDate: row?.last_active ?? new Date().toISOString().split('T')[0],
  };
}

function emptyData(): UserGamification {
  return {
    points: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    badges: buildBadges([]),
    lastActiveDate: new Date().toISOString().split('T')[0],
  };
}

class GamificationService {
  async getData(): Promise<UserGamification> {
    const userId = await currentUserId();
    if (!userId) return emptyData();
    const { data } = await supabase.from('gamification').select('*').eq('user_id', userId).maybeSingle();
    return data ? rowToData(data) : emptyData();
  }

  private async save(userId: string, data: UserGamification): Promise<void> {
    const earned: EarnedBadgeEntry[] = data.badges
      .filter(b => b.earned)
      .map(b => ({ id: b.id, earnedAt: (b.earnedDate ?? new Date()).toISOString() }));

    await supabase.from('gamification').upsert({
      user_id: userId,
      points: data.points,
      level: data.level,
      current_streak: data.currentStreak,
      longest_streak: data.longestStreak,
      last_active: data.lastActiveDate,
      earned_badges: earned,
    }, { onConflict: 'user_id' });
  }

  async addPoints(points: number): Promise<UserGamification> {
    const userId = await currentUserId();
    const data = await this.getData();
    data.points += points;

    const newLevel = Math.floor(data.points / 1000) + 1;
    if (newLevel > data.level) {
      data.level = newLevel;
      this.checkLevelBadges(data);
    }

    if (userId) await this.save(userId, data);
    return data;
  }

  async updateStreak(): Promise<UserGamification> {
    const userId = await currentUserId();
    const data = await this.getData();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (data.lastActiveDate === today) {
      return data;
    } else if (data.lastActiveDate === yesterday) {
      data.currentStreak += 1;
      data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
    } else {
      data.currentStreak = 1;
    }

    data.lastActiveDate = today;
    this.checkStreakBadges(data);
    if (userId) await this.save(userId, data);
    return data;
  }

  async checkWorkoutBadges(totalWorkouts: number): Promise<UserGamification> {
    const userId = await currentUserId();
    const data = await this.getData();
    let updated = false;

    data.badges = data.badges.map(badge => {
      if (badge.category === 'workout' && !badge.earned && ['first_workout', 'workout_warrior', 'fitness_master'].includes(badge.id)) {
        if (totalWorkouts >= badge.requirement) {
          badge.earned = true;
          badge.earnedDate = new Date();
          updated = true;
        }
      }
      return badge;
    });

    if (updated && userId) await this.save(userId, data);
    return data;
  }

  async checkCalorieBadge(caloriesBurned: number): Promise<UserGamification> {
    const userId = await currentUserId();
    const data = await this.getData();
    let updated = false;

    data.badges = data.badges.map(badge => {
      if (badge.id === 'burn_1000' && !badge.earned && caloriesBurned >= badge.requirement) {
        badge.earned = true;
        badge.earnedDate = new Date();
        updated = true;
      }
      return badge;
    });

    if (updated && userId) await this.save(userId, data);
    return data;
  }

  async checkNutritionBadges(totalMeals: number): Promise<UserGamification> {
    const userId = await currentUserId();
    const data = await this.getData();
    let updated = false;

    data.badges = data.badges.map(badge => {
      if (badge.category === 'nutrition' && !badge.earned) {
        if (badge.id === 'first_meal' && totalMeals >= 1) {
          badge.earned = true;
          badge.earnedDate = new Date();
          updated = true;
        }
      }
      return badge;
    });

    if (updated && userId) await this.save(userId, data);
    return data;
  }

  private checkStreakBadges(data: UserGamification): void {
    data.badges = data.badges.map(badge => {
      if (badge.category === 'streak' && !badge.earned) {
        if (data.currentStreak >= badge.requirement) {
          badge.earned = true;
          badge.earnedDate = new Date();
        }
      }
      return badge;
    });
  }

  private checkLevelBadges(data: UserGamification): void {
    data.badges = data.badges.map(badge => {
      if (['level_5', 'level_10'].includes(badge.id) && !badge.earned) {
        if (data.level >= badge.requirement) {
          badge.earned = true;
          badge.earnedDate = new Date();
        }
      }
      return badge;
    });
  }

  getEarnedBadges(data: UserGamification): Badge[] {
    return data.badges.filter(b => b.earned);
  }

  getUnearnedBadges(data: UserGamification): Badge[] {
    return data.badges.filter(b => !b.earned);
  }
}

export const gamificationService = new GamificationService();
