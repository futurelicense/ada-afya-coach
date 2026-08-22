// Supabase-backed user data service
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  name: string;
  email: string;
  age: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  weight: number;
  targetWeight: number;
  height: number;
  location: string;
  joinDate: string;
  plan?: 'free' | 'pro' | 'elite';
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

export interface Goal {
  id: string;
  title: string;
  type: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  completed: boolean;
}

const today = () => new Date().toISOString().split('T')[0];

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

// ── Row <-> interface mapping ──────────────────────────────
function profileFromRow(row: any): UserProfile {
  return {
    name: row.name ?? '',
    email: row.email ?? '',
    age: row.age ?? 0,
    fitnessLevel: row.fitness_level ?? 'intermediate',
    goals: row.goals ?? [],
    weight: row.weight ?? 0,
    targetWeight: row.target_weight ?? 0,
    height: row.height ?? 0,
    location: row.location ?? '',
    joinDate: row.join_date ?? today(),
    plan: row.plan ?? 'free',
  };
}

function workoutFromRow(row: any): WorkoutSession {
  return {
    id: row.id,
    date: row.date,
    name: row.name,
    duration: row.duration,
    difficulty: row.difficulty,
    calories: row.calories,
    caloriesBurned: row.calories_burned,
    completed: row.completed,
    exercises: row.exercises ?? [],
  };
}

function workoutToRow(workout: Partial<WorkoutSession>) {
  const row: Record<string, unknown> = {};
  if (workout.date !== undefined) row.date = workout.date;
  if (workout.name !== undefined) row.name = workout.name;
  if (workout.duration !== undefined) row.duration = workout.duration;
  if (workout.difficulty !== undefined) row.difficulty = workout.difficulty;
  if (workout.calories !== undefined) row.calories = workout.calories;
  if (workout.caloriesBurned !== undefined) row.calories_burned = workout.caloriesBurned;
  if (workout.completed !== undefined) row.completed = workout.completed;
  if (workout.exercises !== undefined) row.exercises = workout.exercises;
  return row;
}

function mealFromRow(row: any): MealLog {
  return {
    id: row.id,
    date: row.date,
    mealType: row.meal_type,
    name: row.name,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fats: row.fats,
    eaten: row.eaten,
  };
}

function mealToRow(meal: Partial<MealLog>) {
  const row: Record<string, unknown> = {};
  if (meal.date !== undefined) row.date = meal.date;
  if (meal.mealType !== undefined) row.meal_type = meal.mealType;
  if (meal.name !== undefined) row.name = meal.name;
  if (meal.calories !== undefined) row.calories = meal.calories;
  if (meal.protein !== undefined) row.protein = meal.protein;
  if (meal.carbs !== undefined) row.carbs = meal.carbs;
  if (meal.fats !== undefined) row.fats = meal.fats;
  if (meal.eaten !== undefined) row.eaten = meal.eaten;
  return row;
}

function statsFromRow(row: any): DailyStats {
  return {
    date: row.date,
    caloriesBurned: row.calories_burned ?? 0,
    workoutsCompleted: row.workouts_completed ?? 0,
    waterIntake: Number(row.water_intake ?? 0),
    caloriesConsumed: row.calories_consumed ?? 0,
  };
}

function goalFromRow(row: any): Goal {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    target: Number(row.target),
    current: Number(row.current),
    unit: row.unit,
    deadline: row.deadline,
    completed: row.completed,
  };
}

function goalToRow(goal: Partial<Goal>) {
  const row: Record<string, unknown> = {};
  if (goal.title !== undefined) row.title = goal.title;
  if (goal.type !== undefined) row.type = goal.type;
  if (goal.target !== undefined) row.target = goal.target;
  if (goal.current !== undefined) row.current = goal.current;
  if (goal.unit !== undefined) row.unit = goal.unit;
  if (goal.deadline !== undefined) row.deadline = goal.deadline || null;
  if (goal.completed !== undefined) row.completed = goal.completed;
  return row;
}

class UserDataService {
  // ── Profile ──────────────────────────────────────────────
  async getProfile(): Promise<UserProfile | null> {
    const userId = await currentUserId();
    if (!userId) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    return data ? profileFromRow(data) : null;
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    const userId = await currentUserId();
    if (!userId) return;
    await supabase.from('profiles').upsert({
      id: userId,
      name: profile.name,
      email: profile.email,
      age: profile.age,
      fitness_level: profile.fitnessLevel,
      goals: profile.goals,
      weight: profile.weight,
      target_weight: profile.targetWeight,
      height: profile.height,
      location: profile.location,
      join_date: profile.joinDate,
    }, { onConflict: 'id' });
  }

  // ── Workouts ─────────────────────────────────────────────
  async getWorkouts(): Promise<WorkoutSession[]> {
    const userId = await currentUserId();
    if (!userId) return [];
    const { data } = await supabase.from('workout_sessions').select('*').eq('user_id', userId).order('date', { ascending: false });
    return (data ?? []).map(workoutFromRow);
  }

  async addWorkout(workout: Omit<WorkoutSession, 'id'> & { id?: string }): Promise<void> {
    const userId = await currentUserId();
    if (!userId) return;
    await supabase.from('workout_sessions').insert({ user_id: userId, ...workoutToRow(workout) });
  }

  async updateWorkout(id: string, updates: Partial<WorkoutSession>): Promise<void> {
    const userId = await currentUserId();
    if (!userId) return;
    await supabase.from('workout_sessions').update(workoutToRow(updates)).eq('id', id).eq('user_id', userId);
  }

  async deleteWorkout(id: string): Promise<void> {
    const userId = await currentUserId();
    if (!userId) return;
    await supabase.from('workout_sessions').delete().eq('id', id).eq('user_id', userId);
  }

  async getTodayWorkouts(): Promise<WorkoutSession[]> {
    const userId = await currentUserId();
    if (!userId) return [];
    const { data } = await supabase.from('workout_sessions').select('*').eq('user_id', userId).eq('date', today());
    return (data ?? []).map(workoutFromRow);
  }

  // ── Meals ────────────────────────────────────────────────
  async getMeals(): Promise<MealLog[]> {
    const userId = await currentUserId();
    if (!userId) return [];
    const { data } = await supabase.from('meal_logs').select('*').eq('user_id', userId).order('date', { ascending: false });
    return (data ?? []).map(mealFromRow);
  }

  async addMeal(meal: Omit<MealLog, 'id'> & { id?: string }): Promise<void> {
    const userId = await currentUserId();
    if (!userId) return;
    await supabase.from('meal_logs').insert({ user_id: userId, ...mealToRow(meal) });
  }

  async updateMeal(id: string, updates: Partial<MealLog>): Promise<void> {
    const userId = await currentUserId();
    if (!userId) return;
    await supabase.from('meal_logs').update(mealToRow(updates)).eq('id', id).eq('user_id', userId);
  }

  async deleteMeal(id: string): Promise<void> {
    const userId = await currentUserId();
    if (!userId) return;
    await supabase.from('meal_logs').delete().eq('id', id).eq('user_id', userId);
  }

  async getTodayMeals(): Promise<MealLog[]> {
    const userId = await currentUserId();
    if (!userId) return [];
    const { data } = await supabase.from('meal_logs').select('*').eq('user_id', userId).eq('date', today());
    return (data ?? []).map(mealFromRow);
  }

  // ── Stats ────────────────────────────────────────────────
  async getStats(): Promise<DailyStats[]> {
    const userId = await currentUserId();
    if (!userId) return [];
    const { data } = await supabase.from('daily_stats').select('*').eq('user_id', userId).order('date', { ascending: false });
    return (data ?? []).map(statsFromRow);
  }

  async getTodayStats(): Promise<DailyStats> {
    const userId = await currentUserId();
    const date = today();
    if (userId) {
      const { data } = await supabase.from('daily_stats').select('*').eq('user_id', userId).eq('date', date).maybeSingle();
      if (data) return statsFromRow(data);
    }

    const [workouts, meals] = await Promise.all([this.getTodayWorkouts(), this.getTodayMeals()]);
    return {
      date,
      caloriesBurned: workouts.reduce((sum, w) => sum + (w.completed ? w.caloriesBurned : 0), 0),
      workoutsCompleted: workouts.filter(w => w.completed).length,
      waterIntake: 0,
      caloriesConsumed: meals.reduce((sum, m) => sum + (m.eaten ? m.calories : 0), 0),
    };
  }

  async updateTodayStats(updates: Partial<DailyStats>): Promise<void> {
    const userId = await currentUserId();
    if (!userId) return;
    const current = await this.getTodayStats();
    const merged = { ...current, ...updates };
    await supabase.from('daily_stats').upsert({
      user_id: userId,
      date: today(),
      calories_burned: merged.caloriesBurned,
      workouts_completed: merged.workoutsCompleted,
      water_intake: merged.waterIntake,
      calories_consumed: merged.caloriesConsumed,
    }, { onConflict: 'user_id,date' });
  }

  async getWeeklyStats(): Promise<DailyStats[]> {
    const userId = await currentUserId();
    if (!userId) return [];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data } = await supabase.from('daily_stats').select('*').eq('user_id', userId).gte('date', weekAgo).lte('date', today());
    return (data ?? []).map(statsFromRow);
  }

  // ── Streak ───────────────────────────────────────────────
  async getCurrentStreak(): Promise<number> {
    const userId = await currentUserId();
    if (!userId) return 0;
    const { data } = await supabase.from('workout_sessions').select('date').eq('user_id', userId).eq('completed', true);
    const uniqueDates = [...new Set((data ?? []).map(r => r.date as string))].sort().reverse();
    if (uniqueDates.length === 0) return 0;

    const todayStr = today();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = new Date(uniqueDates[i]);
      const next = new Date(uniqueDates[i + 1]);
      const diff = (current.getTime() - next.getTime()) / 86400000;
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  // ── Aggregate stats ──────────────────────────────────────
  async getTotalStats() {
    const userId = await currentUserId();
    if (!userId) {
      return { totalWorkouts: 0, totalCaloriesBurned: 0, totalMealsLogged: 0, goalsAchieved: 0, currentStreak: 0 };
    }

    const [{ data: workouts }, { data: meals }, { data: goals }, currentStreak] = await Promise.all([
      supabase.from('workout_sessions').select('calories_burned').eq('user_id', userId).eq('completed', true),
      supabase.from('meal_logs').select('id').eq('user_id', userId).eq('eaten', true),
      supabase.from('goals').select('id').eq('user_id', userId).eq('completed', true),
      this.getCurrentStreak(),
    ]);

    return {
      totalWorkouts: workouts?.length ?? 0,
      totalCaloriesBurned: (workouts ?? []).reduce((sum, w: any) => sum + (w.calories_burned ?? 0), 0),
      totalMealsLogged: meals?.length ?? 0,
      goalsAchieved: goals?.length ?? 0,
      currentStreak,
    };
  }

  // ── Goals ────────────────────────────────────────────────
  async getGoals(): Promise<Goal[]> {
    const userId = await currentUserId();
    if (!userId) return [];
    const { data } = await supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return (data ?? []).map(goalFromRow);
  }

  async addGoal(goal: Omit<Goal, 'id'> & { id?: string }): Promise<void> {
    const userId = await currentUserId();
    if (!userId) return;
    await supabase.from('goals').insert({ user_id: userId, ...goalToRow(goal) });
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
    const userId = await currentUserId();
    if (!userId) return;
    await supabase.from('goals').update(goalToRow(updates)).eq('id', id).eq('user_id', userId);
  }

  async deleteGoal(id: string): Promise<void> {
    const userId = await currentUserId();
    if (!userId) return;
    await supabase.from('goals').delete().eq('id', id).eq('user_id', userId);
  }

  // ── Weekly activity data for charts ──────────────────────
  async getWeeklyChartData() {
    const userId = await currentUserId();
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay(); // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(todayDate);
    monday.setDate(todayDate.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const mondayStr = monday.toISOString().split('T')[0];
    const sundayStr = sunday.toISOString().split('T')[0];

    if (!userId) {
      return days.map((day, i) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        return { day, date: date.toISOString().split('T')[0], workouts: 0, calories: 0, water: 0, caloriesConsumed: 0 };
      });
    }

    const [{ data: workouts }, { data: meals }, { data: stats }] = await Promise.all([
      supabase.from('workout_sessions').select('date, calories_burned, completed').eq('user_id', userId).eq('completed', true).gte('date', mondayStr).lte('date', sundayStr),
      supabase.from('meal_logs').select('date, calories, eaten').eq('user_id', userId).eq('eaten', true).gte('date', mondayStr).lte('date', sundayStr),
      supabase.from('daily_stats').select('date, water_intake').eq('user_id', userId).gte('date', mondayStr).lte('date', sundayStr),
    ]);

    return days.map((day, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const dayWorkouts = (workouts ?? []).filter((w: any) => w.date === dateStr);
      const dayMeals = (meals ?? []).filter((m: any) => m.date === dateStr);
      const dayStat = (stats ?? []).find((s: any) => s.date === dateStr);

      return {
        day,
        date: dateStr,
        workouts: dayWorkouts.length,
        calories: dayWorkouts.reduce((sum: number, w: any) => sum + (w.calories_burned ?? 0), 0),
        water: Number(dayStat?.water_intake ?? 0),
        caloriesConsumed: dayMeals.reduce((sum: number, m: any) => sum + (m.calories ?? 0), 0),
      };
    });
  }
}

export const userDataService = new UserDataService();
