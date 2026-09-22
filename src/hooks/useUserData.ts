import { useState, useEffect, useCallback } from 'react';
import { userDataService, UserProfile, WorkoutSession, MealLog, DailyStats } from '@/lib/userDataService';
import { useAuth } from '@/contexts/AuthContext';

export const useUserData = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayWorkouts, setTodayWorkouts] = useState<WorkoutSession[]>([]);
  const [todayMeals, setTodayMeals] = useState<MealLog[]>([]);
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [p, workouts, meals, stats, weekly] = await Promise.all([
      userDataService.getProfile(),
      userDataService.getTodayWorkouts(),
      userDataService.getTodayMeals(),
      userDataService.getTodayStats(),
      userDataService.getWeeklyStats(),
    ]);
    setProfile(p);
    setTodayWorkouts(workouts);
    setTodayMeals(meals);
    setTodayStats(stats);
    setWeeklyStats(weekly);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, user?.id]);

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

  return {
    profile,
    todayWorkouts,
    todayMeals,
    todayStats,
    weeklyStats,
    loading,
    updateProfile,
    completeExercise,
    markMealEaten,
    updateWaterIntake,
    deleteWorkout,
    deleteMeal,
    refreshData: loadData,
  };
};
