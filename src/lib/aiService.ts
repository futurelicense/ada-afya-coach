// Mock AI service for generating workouts and meals
import { userDataService } from './userDataService';

const nigerianFoods = [
  { name: "Moi Moi & Pap", calories: 380, protein: 18, carbs: 52, fats: 8, type: 'breakfast' },
  { name: "Akara & Bread", calories: 320, protein: 12, carbs: 45, fats: 10, type: 'breakfast' },
  { name: "Plantain & Eggs", calories: 290, protein: 15, carbs: 35, fats: 12, type: 'breakfast' },
  { name: "Jollof Rice & Grilled Chicken", calories: 520, protein: 35, carbs: 68, fats: 12, type: 'lunch' },
  { name: "Fried Rice & Fish", calories: 480, protein: 30, carbs: 62, fats: 14, type: 'lunch' },
  { name: "Beans & Plantain", calories: 420, protein: 18, carbs: 72, fats: 8, type: 'lunch' },
  { name: "Efo Riro with Ponmo", calories: 450, protein: 28, carbs: 42, fats: 15, type: 'dinner' },
  { name: "Egusi Soup & Fufu", calories: 510, protein: 25, carbs: 65, fats: 18, type: 'dinner' },
  { name: "Okra Soup & Eba", calories: 390, protein: 20, carbs: 58, fats: 10, type: 'dinner' },
];

const exercises = [
  { name: "Push-ups", sets: 3, reps: 12, muscles: "Chest, Triceps", calories: 45 },
  { name: "Squats", sets: 4, reps: 15, muscles: "Legs, Glutes", calories: 60 },
  { name: "Plank", sets: 3, reps: 45, muscles: "Core", calories: 35 },
  { name: "Lunges", sets: 3, reps: 12, muscles: "Legs", calories: 50 },
  { name: "Burpees", sets: 3, reps: 10, muscles: "Full Body", calories: 80 },
  { name: "Mountain Climbers", sets: 3, reps: 20, muscles: "Core, Cardio", calories: 55 },
  { name: "Jumping Jacks", sets: 3, reps: 30, muscles: "Cardio", calories: 45 },
  { name: "Dips", sets: 3, reps: 10, muscles: "Triceps, Chest", calories: 40 },
  { name: "Bicycle Crunches", sets: 3, reps: 20, muscles: "Abs", calories: 35 },
  { name: "High Knees", sets: 3, reps: 30, muscles: "Cardio, Legs", calories: 50 },
];

const coachTips = [
  "Great job staying consistent! Your body is adapting well. Consider increasing intensity gradually.",
  "Remember to stay hydrated! Aim for at least 2-3 liters of water daily for optimal performance.",
  "Focus on your form over speed. Quality reps build strength and prevent injuries.",
  "Your nutrition is on point! Keep balancing your proteins and carbs for sustained energy.",
  "Rest is just as important as training. Ensure you're getting 7-8 hours of sleep.",
  "Progressive overload is key! Try adding 1-2 more reps or slightly increasing intensity.",
  "Don't skip your warm-up! 5-10 minutes can significantly reduce injury risk.",
  "Consistency beats intensity. Regular moderate workouts outperform sporadic intense ones.",
];

class AIService {
  generateWorkoutPlan(level: string = 'intermediate'): any {
    const numExercises = level === 'beginner' ? 4 : level === 'intermediate' ? 6 : 8;
    const selectedExercises = this.shuffleArray([...exercises]).slice(0, numExercises);
    
    const totalCalories = selectedExercises.reduce((sum, ex) => sum + (ex.calories * ex.sets), 0);
    const duration = numExercises * 5; // Approximate 5 min per exercise
    
    return {
      id: Date.now().toString(),
      name: this.generateWorkoutName(level),
      duration,
      difficulty: level,
      calories: totalCalories,
      exercises: selectedExercises.map(ex => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        muscles: ex.muscles,
        completed: false,
      })),
      date: new Date().toISOString().split('T')[0],
      completed: false,
      caloriesBurned: 0,
    };
  }

  generateMealPlan(calorieTarget: number = 1800): any[] {
    const breakfast = this.shuffleArray(nigerianFoods.filter(f => f.type === 'breakfast'))[0];
    const lunch = this.shuffleArray(nigerianFoods.filter(f => f.type === 'lunch'))[0];
    const dinner = this.shuffleArray(nigerianFoods.filter(f => f.type === 'dinner'))[0];
    
    return [
      {
        id: `meal-${Date.now()}-1`,
        date: new Date().toISOString().split('T')[0],
        mealType: 'breakfast',
        name: breakfast.name,
        calories: breakfast.calories,
        protein: breakfast.protein,
        carbs: breakfast.carbs,
        fats: breakfast.fats,
        eaten: false,
      },
      {
        id: `meal-${Date.now()}-2`,
        date: new Date().toISOString().split('T')[0],
        mealType: 'lunch',
        name: lunch.name,
        calories: lunch.calories,
        protein: lunch.protein,
        carbs: lunch.carbs,
        fats: lunch.fats,
        eaten: false,
      },
      {
        id: `meal-${Date.now()}-3`,
        date: new Date().toISOString().split('T')[0],
        mealType: 'dinner',
        name: dinner.name,
        calories: dinner.calories,
        protein: dinner.protein,
        carbs: dinner.carbs,
        fats: dinner.fats,
        eaten: false,
      },
    ];
  }

  getCoachTip(): string {
    const profile = userDataService.getProfile();
    const stats = userDataService.getTodayStats();
    const weeklyStats = userDataService.getWeeklyStats();
    
    // Personalized tips based on user data
    if (weeklyStats.length >= 7) {
      return "Amazing 7-day streak! You're building strong habits. Keep it up! 🔥";
    }
    
    if (stats.waterIntake < 2) {
      return "Don't forget to hydrate! Try to drink at least 2-3 liters of water today. 💧";
    }
    
    if (stats.workoutsCompleted === 0 && new Date().getHours() > 16) {
      return "It's not too late! Even a 15-minute workout can make a difference today. 💪";
    }
    
    // Random tip
    return this.shuffleArray(coachTips)[0];
  }

  private generateWorkoutName(level: string): string {
    const prefixes = ["Power", "Dynamic", "Essential", "Complete", "Total", "Ultimate"];
    const types = ["Strength", "Cardio", "HIIT", "Endurance", "Flexibility", "Full Body"];
    
    const prefix = this.shuffleArray(prefixes)[0];
    const type = this.shuffleArray(types)[0];
    
    return `${prefix} ${type}`;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}

export const aiService = new AIService();
