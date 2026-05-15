// Gamification system for badges, streaks, and points
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

class GamificationService {
  private readonly STORAGE_KEY = 'fitnaija_gamification';
  
  private allBadges: Badge[] = [
    // Workout Badges
    { id: 'first_workout', name: 'First Steps', description: 'Complete your first workout', icon: '🎯', requirement: 1, category: 'workout', earned: false },
    { id: 'workout_warrior', name: 'Workout Warrior', description: 'Complete 10 workouts', icon: '💪', requirement: 10, category: 'workout', earned: false },
    { id: 'fitness_master', name: 'Fitness Master', description: 'Complete 50 workouts', icon: '🏆', requirement: 50, category: 'workout', earned: false },
    { id: 'burn_1000', name: 'Calorie Crusher', description: 'Burn 1000 calories in one day', icon: '🔥', requirement: 1000, category: 'workout', earned: false },
    
    // Nutrition Badges
    { id: 'first_meal', name: 'Nutrition Beginner', description: 'Log your first meal', icon: '🍽️', requirement: 1, category: 'nutrition', earned: false },
    { id: 'meal_planner', name: 'Meal Planner', description: 'Complete 7 days of meal logging', icon: '📋', requirement: 7, category: 'nutrition', earned: false },
    { id: 'healthy_eater', name: 'Healthy Eater', description: 'Hit your calorie goal 10 times', icon: '🥗', requirement: 10, category: 'nutrition', earned: false },
    
    // Streak Badges
    { id: 'streak_3', name: 'Getting Consistent', description: '3-day workout streak', icon: '🌟', requirement: 3, category: 'streak', earned: false },
    { id: 'streak_7', name: 'Week Warrior', description: '7-day workout streak', icon: '⭐', requirement: 7, category: 'streak', earned: false },
    { id: 'streak_30', name: 'Unstoppable', description: '30-day workout streak', icon: '🌠', requirement: 30, category: 'streak', earned: false },
    
    // Level Milestones
    { id: 'level_5', name: 'Rising Star', description: 'Reach Level 5', icon: '✨', requirement: 5, category: 'workout', earned: false },
    { id: 'level_10', name: 'Elite Athlete', description: 'Reach Level 10', icon: '👑', requirement: 10, category: 'workout', earned: false },
  ];

  getData(): UserGamification {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Merge with all badges to include new ones
      const existingBadgeIds = parsed.badges.map((b: Badge) => b.id);
      const newBadges = this.allBadges.filter(b => !existingBadgeIds.includes(b.id));
      parsed.badges = [...parsed.badges, ...newBadges];
      return parsed;
    }
    
    return {
      points: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      badges: [...this.allBadges],
      lastActiveDate: new Date().toISOString().split('T')[0],
    };
  }

  saveData(data: UserGamification): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  addPoints(points: number): UserGamification {
    const data = this.getData();
    data.points += points;
    
    // Level up every 1000 points
    const newLevel = Math.floor(data.points / 1000) + 1;
    if (newLevel > data.level) {
      data.level = newLevel;
      this.checkLevelBadges(data);
    }
    
    this.saveData(data);
    return data;
  }

  updateStreak(): UserGamification {
    const data = this.getData();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (data.lastActiveDate === today) {
      // Already updated today
      return data;
    } else if (data.lastActiveDate === yesterday) {
      // Continuing streak
      data.currentStreak += 1;
      data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
    } else {
      // Streak broken
      data.currentStreak = 1;
    }
    
    data.lastActiveDate = today;
    this.checkStreakBadges(data);
    this.saveData(data);
    return data;
  }

  checkWorkoutBadges(totalWorkouts: number): UserGamification {
    const data = this.getData();
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
    
    if (updated) {
      this.saveData(data);
    }
    return data;
  }

  checkCalorieBadge(caloriesBurned: number): UserGamification {
    const data = this.getData();
    
    data.badges = data.badges.map(badge => {
      if (badge.id === 'burn_1000' && !badge.earned && caloriesBurned >= badge.requirement) {
        badge.earned = true;
        badge.earnedDate = new Date();
      }
      return badge;
    });
    
    this.saveData(data);
    return data;
  }

  checkNutritionBadges(totalMeals: number): UserGamification {
    const data = this.getData();
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
    
    if (updated) {
      this.saveData(data);
    }
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

  getEarnedBadges(): Badge[] {
    return this.getData().badges.filter(b => b.earned);
  }

  getUnearnedBadges(): Badge[] {
    return this.getData().badges.filter(b => !b.earned);
  }
}

export const gamificationService = new GamificationService();
