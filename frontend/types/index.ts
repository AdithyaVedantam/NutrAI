export type MealType = "breakfast" | "lunch" | "snack" | "dinner";

export interface Profile {
  name: string;
  age: number;
  sex: "male" | "female";
  heightCm: number;
  weightKg: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose" | "maintain" | "gain";
  diet: "vegetarian" | "non_vegetarian" | "vegan" | "eggetarian";
  bmr: number;
  maintenanceCalories: number;
  targetCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface Meal {
  id: number;
  name: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: "manual" | "ai";
  eatenAt: string;
}

export type MealInput = Omit<Meal, "id" | "eatenAt"> & { eatenAt?: string };

export interface MealAnalysis {
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  assumptions: string[];
}

export interface DietPlanContent {
  meals: {
    mealType: string;
    foods: { name: string; portion: string; calories: number }[];
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  tips: string[];
}

export interface DietPlan {
  id: number;
  mealsCount: number;
  content: DietPlanContent;
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
