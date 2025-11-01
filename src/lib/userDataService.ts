// Local storage service for user data
export interface UserProfile {
  name: string;
  age: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  weight: number;
  targetWeight: number;
  height: number;
}

export interface WorkoutSession {
  id: string;
  date: string;
  name: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  calories: number;
  caloriesBurned: number;
  completed: boolean;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    muscles: string;
    completed: boolean;
  }>;
}

export interface MealLog {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  eaten: boolean;
}

export interface DailyStats {
  date: string;
  caloriesBurned: number;
  workoutsCompleted: number;
  waterIntake: number;
  caloriesConsumed: number;
}

class UserDataService {
  private readonly PROFILE_KEY = 'fitnaija_profile';
  private readonly WORKOUTS_KEY = 'fitnaija_workouts';
  private readonly MEALS_KEY = 'fitnaija_meals';
  private readonly STATS_KEY = 'fitnaija_stats';

  // Profile Management
  getProfile(): UserProfile | null {
    const data = localStorage.getItem(this.PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  }

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
  }

  // Workout Management
  getWorkouts(): WorkoutSession[] {
    const data = localStorage.getItem(this.WORKOUTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  addWorkout(workout: WorkoutSession): void {
    const workouts = this.getWorkouts();
    workouts.push(workout);
    localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
  }

  updateWorkout(id: string, updates: Partial<WorkoutSession>): void {
    const workouts = this.getWorkouts();
    const index = workouts.findIndex(w => w.id === id);
    if (index !== -1) {
      workouts[index] = { ...workouts[index], ...updates };
      localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
    }
  }

  getTodayWorkouts(): WorkoutSession[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getWorkouts().filter(w => w.date === today);
  }

  // Meal Management
  getMeals(): MealLog[] {
    const data = localStorage.getItem(this.MEALS_KEY);
    return data ? JSON.parse(data) : [];
  }

  addMeal(meal: MealLog): void {
    const meals = this.getMeals();
    meals.push(meal);
    localStorage.setItem(this.MEALS_KEY, JSON.stringify(meals));
  }

  updateMeal(id: string, updates: Partial<MealLog>): void {
    const meals = this.getMeals();
    const index = meals.findIndex(m => m.id === id);
    if (index !== -1) {
      meals[index] = { ...meals[index], ...updates };
      localStorage.setItem(this.MEALS_KEY, JSON.stringify(meals));
    }
  }

  getTodayMeals(): MealLog[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getMeals().filter(m => m.date === today);
  }

  // Stats Management
  getStats(): DailyStats[] {
    const data = localStorage.getItem(this.STATS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getTodayStats(): DailyStats {
    const today = new Date().toISOString().split('T')[0];
    const stats = this.getStats();
    const todayStats = stats.find(s => s.date === today);
    
    if (todayStats) return todayStats;

    // Calculate from today's data
    const workouts = this.getTodayWorkouts();
    const meals = this.getTodayMeals();
    
    return {
      date: today,
      caloriesBurned: workouts.reduce((sum, w) => sum + (w.completed ? w.caloriesBurned : 0), 0),
      workoutsCompleted: workouts.filter(w => w.completed).length,
      waterIntake: 0,
      caloriesConsumed: meals.reduce((sum, m) => sum + (m.eaten ? m.calories : 0), 0),
    };
  }

  updateTodayStats(updates: Partial<DailyStats>): void {
    const today = new Date().toISOString().split('T')[0];
    const stats = this.getStats();
    const index = stats.findIndex(s => s.date === today);
    
    if (index !== -1) {
      stats[index] = { ...stats[index], ...updates };
    } else {
      stats.push({ ...this.getTodayStats(), ...updates });
    }
    
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
  }

  getWeeklyStats(): DailyStats[] {
    const stats = this.getStats();
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return stats.filter(s => {
      const statDate = new Date(s.date);
      return statDate >= weekAgo && statDate <= today;
    });
  }
}

export const userDataService = new UserDataService();
