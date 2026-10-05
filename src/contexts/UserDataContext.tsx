import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { userDataService, UserProfile, WorkoutSession, MealLog, DailyStats } from '@/lib/userDataService';
import { useAuth } from '@/contexts/AuthContext';

interface UserDataValue {
  profile: UserProfile | null;
  todayWorkouts: WorkoutSession[];
  todayMeals: MealLog[];
  todayStats: DailyStats | null;
  weeklyStats: DailyStats[];
  loading: boolean;
  profileError: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeExercise: (workoutId: string, exerciseName: string) => Promise<void>;
  markMealEaten: (mealId: string) => Promise<void>;
  updateWaterIntake: (amount: number) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const UserDataContext = createContext<UserDataValue | null>(null);

// One shared copy of the member's data for the whole app, so each screen
// doesn't fetch the same profile, workouts, meals and stats on its own.
export function UserDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayWorkouts, setTodayWorkouts] = useState<WorkoutSession[]>([]);
  const [todayMeals, setTodayMeals] = useState<MealLog[]>([]);
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [profileResult, workouts, meals, stats, weekly] = await Promise.all([
      userDataService.getProfileResult(),
      userDataService.getTodayWorkouts(),
      userDataService.getTodayMeals(),
      userDataService.getTodayStats(),
      userDataService.getWeeklyStats(),
    ]);
    if (profileResult.ok) {
      setProfile(profileResult.profile);
      setProfileError(null);
    } else {
      setProfileError(profileResult.error);
    }
    setTodayWorkouts(workouts);
    setTodayMeals(meals);
    setTodayStats(stats);
    setWeeklyStats(weekly);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const userId = user?.id ?? null;
    if (!userId) {
      setProfile(null);
      setTodayWorkouts([]);
      setTodayMeals([]);
      setTodayStats(null);
      setWeeklyStats([]);
      setLoadedUserId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    loadData()
      .catch((error) => {
        console.error('Failed to load member data', error);
      })
      .finally(() => {
        if (!cancelled) {
          setLoadedUserId(userId);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [loadData, user?.id]);

  // Until data has loaded for the signed-in user, report loading. Otherwise the
  // first render after sign-in sees "no profile" and redirects to onboarding.
  const isLoading = loading || (!!user && loadedUserId !== user.id);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const current = profile ?? await userDataService.getProfile();
    if (current) {
      const updated = { ...current, ...updates };
      await userDataService.saveProfile(updated);
      setProfile(updated);
    }
  };

  const completeExercise = async (workoutId: string, exerciseName: string) => {
    const workout = todayWorkouts.find(w => w.id === workoutId);
    if (!workout) return;

    const updatedExercises = workout.exercises.map(ex =>
      ex.name === exerciseName ? { ...ex, completed: !ex.completed } : ex
    );

    const allCompleted = updatedExercises.every(ex => ex.completed);

    await userDataService.updateWorkout(workoutId, {
      exercises: updatedExercises,
      completed: allCompleted,
      caloriesBurned: allCompleted ? workout.calories : updatedExercises.filter(e => e.completed).length * 50,
    });

    await loadData();
  };

  const markMealEaten = async (mealId: string) => {
    const meal = todayMeals.find(m => m.id === mealId);
    if (!meal) return;
    await userDataService.updateMeal(mealId, { eaten: !meal.eaten });
    await loadData();
  };

  const updateWaterIntake = async (amount: number) => {
    const current = todayStats?.waterIntake || 0;
    await userDataService.updateTodayStats({ waterIntake: current + amount });
    await loadData();
  };

  const deleteWorkout = async (id: string) => {
    await userDataService.deleteWorkout(id);
    await loadData();
  };

  const deleteMeal = async (id: string) => {
    await userDataService.deleteMeal(id);
    await loadData();
  };

  const value: UserDataValue = {
    profile,
    todayWorkouts,
    todayMeals,
    todayStats,
    weeklyStats,
    loading: isLoading,
    profileError,
    updateProfile,
    completeExercise,
    markMealEaten,
    updateWaterIntake,
    deleteWorkout,
    deleteMeal,
    refreshData: loadData,
  };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData(): UserDataValue {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be used inside <UserDataProvider>');
  return ctx;
}
