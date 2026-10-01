// Deterministic nutrition math. The LLM is NOT used here.
// BMR uses the Mifflin-St Jeor equation; maintenance = BMR x activity multiplier.

export const activityMultipliers: Record<string, number> = {
  sedentary: 1.2, // desk job, little exercise
  light: 1.375, // exercise 1-3 days/week
  moderate: 1.55, // exercise 3-5 days/week
  active: 1.725, // exercise 6-7 days/week
  very_active: 1.9, // hard exercise + physical job
};

export interface ProfileInput {
  age: number;
  sex: "male" | "female";
  heightCm: number;
  weightKg: number;
  activityLevel: string;
  goal: "lose" | "maintain" | "gain";
}

export function calculateTargets(p: ProfileInput) {
  // Mifflin-St Jeor: 10*kg + 6.25*cm - 5*age + (5 for men, -161 for women)
  const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === "male" ? 5 : -161);
  const maintenanceCalories = bmr * (activityMultipliers[p.activityLevel] ?? 1.2);

  // Goal adjustment: ~500 kcal deficit to lose, ~300 kcal surplus to gain.
  let targetCalories = maintenanceCalories;
  if (p.goal === "lose") targetCalories -= 500;
  if (p.goal === "gain") targetCalories += 300;
  targetCalories = Math.max(targetCalories, p.sex === "male" ? 1500 : 1200); // safety floor

  // Protein by body weight, fat = 25% of calories, carbs = the remaining calories.
  const proteinPerKg = p.goal === "lose" ? 2.0 : p.goal === "gain" ? 1.8 : 1.6;
  const proteinG = p.weightKg * proteinPerKg;
  const fatG = (targetCalories * 0.25) / 9;
  const carbsG = (targetCalories - proteinG * 4 - fatG * 9) / 4;

  return {
    bmr: Math.round(bmr),
    maintenanceCalories: Math.round(maintenanceCalories),
    targetCalories: Math.round(targetCalories),
    proteinG: Math.round(proteinG),
    carbsG: Math.max(0, Math.round(carbsG)),
    fatG: Math.round(fatG),
  };
}
