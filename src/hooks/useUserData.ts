import { useState, useEffect } from 'react';
import { userDataService, UserProfile, WorkoutSession, MealLog, DailyStats } from '@/lib/userDataService';

export const useUserData = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayWorkouts, setTodayWorkouts] = useState<WorkoutSession[]>([]);
  const [todayMeals, setTodayMeals] = useState<MealLog[]>([]);
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([]);

  const loadData = () => {
    setProfile(userDataService.getProfile());
    setTodayWorkouts(userDataService.getTodayWorkouts());
    setTodayMeals(userDataService.getTodayMeals());
    setTodayStats(userDataService.getTodayStats());
    setWeeklyStats(userDataService.getWeeklyStats());
  };

  useEffect(() => {
    loadData();
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    const current = userDataService.getProfile();
    if (current) {
      const updated = { ...current, ...updates };
      userDataService.saveProfile(updated);
      setProfile(updated);
    }
  };

  const completeExercise = (workoutId: string, exerciseName: string) => {
    const workout = todayWorkouts.find(w => w.id === workoutId);
    if (!workout) return;

    const updatedExercises = workout.exercises.map(ex =>
      ex.name === exerciseName ? { ...ex, completed: !ex.completed } : ex
    );

    const allCompleted = updatedExercises.every(ex => ex.completed);
    
    userDataService.updateWorkout(workoutId, {
      exercises: updatedExercises,
      completed: allCompleted,
      caloriesBurned: allCompleted ? workout.calories : updatedExercises.filter(e => e.completed).length * 50,
    });

    loadData();
  };

  const markMealEaten = (mealId: string) => {
    const meal = todayMeals.find(m => m.id === mealId);
    if (!meal) return;
    userDataService.updateMeal(mealId, { eaten: !meal.eaten });
    loadData();
  };

  const updateWaterIntake = (amount: number) => {
    const current = todayStats?.waterIntake || 0;
    userDataService.updateTodayStats({ waterIntake: current + amount });
    loadData();
  };

  const deleteWorkout = (id: string) => {
    userDataService.deleteWorkout(id);
    loadData();
  };

  const deleteMeal = (id: string) => {
    userDataService.deleteMeal(id);
    loadData();
  };

  return {
    profile,
    todayWorkouts,
    todayMeals,
    todayStats,
    weeklyStats,
    updateProfile,
    completeExercise,
    markMealEaten,
    updateWaterIntake,
    deleteWorkout,
    deleteMeal,
    refreshData: loadData,
  };
};
