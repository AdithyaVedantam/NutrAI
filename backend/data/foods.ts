// Small local food dataset (values per serving, approximate).
// Used as reference values in the AI meal-analysis prompt, and served at GET /api/foods.
export interface Food {
  food_name: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export const foods: Food[] = [
  { food_name: "Cooked white rice", serving_size: "1 cup (150g)", calories: 200, protein: 4, carbs: 44, fat: 0.4, fiber: 0.6 },
  { food_name: "Roti (chapati)", serving_size: "1 medium (40g)", calories: 120, protein: 3.5, carbs: 20, fat: 3, fiber: 3 },
  { food_name: "Paneer", serving_size: "100g", calories: 265, protein: 18, carbs: 3.5, fat: 20, fiber: 0 },
  { food_name: "Whole milk", serving_size: "1 glass (250ml)", calories: 150, protein: 8, carbs: 12, fat: 8, fiber: 0 },
  { food_name: "Egg, boiled", serving_size: "1 large", calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0 },
  { food_name: "Banana", serving_size: "1 medium", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3 },
  { food_name: "Rolled oats (dry)", serving_size: "40g", calories: 150, protein: 5, carbs: 27, fat: 2.5, fiber: 4 },
  { food_name: "Dal (cooked lentils)", serving_size: "1 cup (200g)", calories: 230, protein: 18, carbs: 40, fat: 1, fiber: 15 },
  { food_name: "Chicken breast, cooked", serving_size: "100g", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { food_name: "Tofu, firm", serving_size: "100g", calories: 144, protein: 17, carbs: 3, fat: 9, fiber: 2 },
  { food_name: "Curd (plain yogurt)", serving_size: "100g", calories: 60, protein: 3.5, carbs: 5, fat: 3.3, fiber: 0 },
  { food_name: "Bread, whole wheat", serving_size: "1 slice", calories: 80, protein: 4, carbs: 14, fat: 1, fiber: 2 },
  { food_name: "Idli", serving_size: "2 pieces (120g)", calories: 130, protein: 4, carbs: 26, fat: 0.4, fiber: 1 },
  { food_name: "Plain dosa", serving_size: "1 medium", calories: 135, protein: 3, carbs: 22, fat: 3.5, fiber: 1 },
  { food_name: "Poha", serving_size: "1 cup (150g)", calories: 250, protein: 4.5, carbs: 46, fat: 6, fiber: 2 },
  { food_name: "Upma", serving_size: "1 cup (200g)", calories: 230, protein: 5, carbs: 34, fat: 8, fiber: 3 },
  { food_name: "Aloo paratha", serving_size: "1 medium", calories: 290, protein: 6, carbs: 40, fat: 12, fiber: 3 },
  { food_name: "Rajma (cooked)", serving_size: "1 cup (200g)", calories: 250, protein: 14, carbs: 38, fat: 4, fiber: 11 },
  { food_name: "Chole (chickpea curry)", serving_size: "1 cup (200g)", calories: 270, protein: 14, carbs: 40, fat: 7, fiber: 12 },
  { food_name: "Sambar", serving_size: "1 cup (200ml)", calories: 130, protein: 6, carbs: 20, fat: 3, fiber: 4 },
  { food_name: "Mixed veg sabzi", serving_size: "1 cup (150g)", calories: 120, protein: 3, carbs: 14, fat: 6, fiber: 4 },
  { food_name: "Chicken curry", serving_size: "1 cup (200g)", calories: 300, protein: 25, carbs: 8, fat: 18, fiber: 1 },
  { food_name: "Omelette (2 eggs)", serving_size: "1 omelette", calories: 190, protein: 13, carbs: 1, fat: 14, fiber: 0 },
  { food_name: "Apple", serving_size: "1 medium", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4 },
  { food_name: "Almonds", serving_size: "10 nuts (12g)", calories: 70, protein: 2.5, carbs: 2.5, fat: 6, fiber: 1.5 },
  { food_name: "Peanut butter", serving_size: "1 tbsp (16g)", calories: 95, protein: 4, carbs: 3, fat: 8, fiber: 1 },
  { food_name: "Soya chunks (dry)", serving_size: "30g", calories: 104, protein: 15, carbs: 10, fat: 0.3, fiber: 4 },
  { food_name: "Whey protein", serving_size: "1 scoop (30g)", calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0 },
];
