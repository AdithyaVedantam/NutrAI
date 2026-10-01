"use client";
import { useEffect, useState } from "react";
import { Meal, MealAnalysis, MealInput, MealType } from "@/types";
import { guessMealType } from "@/lib/dates";
import { api } from "@/lib/api";

interface Food {
  food_name: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const round1 = (n: number) => String(Math.round(n * 10) / 10);

// Form for adding or editing a meal. You do NOT have to know the numbers:
// pick a common food (calculated by the app) or describe it (estimated by AI), and the fields fill in.
// Inputs are kept as strings and converted on submit.
export default function MealForm({ initial, onSubmit, onCancel }: {
  initial?: Meal;
  onSubmit: (meal: MealInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [mealType, setMealType] = useState<MealType>(initial?.mealType ?? guessMealType());
  const [calories, setCalories] = useState(initial ? String(initial.calories) : "");
  const [protein, setProtein] = useState(initial ? String(initial.protein) : "");
  const [carbs, setCarbs] = useState(initial ? String(initial.carbs) : "");
  const [fat, setFat] = useState(initial ? String(initial.fat) : "");
  const [source, setSource] = useState<Meal["source"]>(initial?.source ?? "manual");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Quick fill 1: common foods from the local dataset (plain maths, no AI)
  const [foods, setFoods] = useState<Food[]>([]);
  const [pickedFood, setPickedFood] = useState("");
  const [servings, setServings] = useState("1");

  // Quick fill 2: describe the meal and let AI estimate
  const [aiText, setAiText] = useState("");
  const [estimating, setEstimating] = useState(false);
  const [assumptions, setAssumptions] = useState<string[]>([]);

  useEffect(() => {
    api<{ foods: Food[] }>("/api/foods").then((d) => setFoods(d.foods)).catch(() => {});
  }, []);

  function fillFromFood(foodName: string, servingsText: string) {
    const food = foods.find((f) => f.food_name === foodName);
    const n = Number(servingsText);
    if (!food || !(n > 0)) return;
    setName(n === 1 ? food.food_name : `${n} × ${food.food_name}`);
    setCalories(String(Math.round(food.calories * n)));
    setProtein(round1(food.protein * n));
    setCarbs(round1(food.carbs * n));
    setFat(round1(food.fat * n));
    setSource("manual");
    setAssumptions([]);
  }

  async function estimateWithAI(addImmediately = false) {
    setEstimating(true);
    setError("");
    try {
      const { analysis } = await api<{ analysis: MealAnalysis }>("/api/ai/analyze-meal", { method: "POST", body: { description: aiText } });
      setName(analysis.mealName);
      setCalories(String(analysis.calories));
      setProtein(String(analysis.protein));
      setCarbs(String(analysis.carbs));
      setFat(String(analysis.fat));
      setSource("ai");
      setAssumptions(analysis.assumptions);
      // One-click mode: save straight to the day's log without waiting for a second click
      if (addImmediately) {
        await onSubmit({ name: analysis.mealName, mealType, source: "ai", calories: analysis.calories, protein: analysis.protein, carbs: analysis.carbs, fat: analysis.fat });
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI estimate failed");
    }
    setEstimating(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        name, mealType, source,
        calories: Number(calories) || 0, protein: Number(protein) || 0, carbs: Number(carbs) || 0, fat: Number(fat) || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save meal");
      setSaving(false);
    }
  }

  const number = (label: string, value: string, set: (v: string) => void) => (
    <div>
      <label className="label">{label}</label>
      <input className="input" type="number" min="0" step="any" required={label.startsWith("Calories")} value={value} onChange={(e) => set(e.target.value)} />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="font-semibold">{initial ? "Edit meal" : "Add a meal"}</h3>

      {!initial && (
        <div className="space-y-3 rounded-xl bg-emerald-50/60 p-4">
          <p className="text-sm font-semibold text-emerald-800">Don&apos;t know the numbers? Let NutrAI fill them in.</p>
          <div className="grid gap-2 sm:grid-cols-[1fr_90px]">
            <select
              className="input" value={pickedFood}
              onChange={(e) => { setPickedFood(e.target.value); fillFromFood(e.target.value, servings); }}
            >
              <option value="">Pick a common food...</option>
              {foods.map((f) => <option key={f.food_name} value={f.food_name}>{f.food_name} — {f.serving_size}</option>)}
            </select>
            <input
              className="input" type="number" min="0.25" step="0.25" value={servings} title="Number of servings"
              onChange={(e) => { setServings(e.target.value); fillFromFood(pickedFood, e.target.value); }}
            />
          </div>
          <p className="-mt-1 text-xs text-slate-500">Servings = how many of the listed portion you ate (1.5 = one and a half cups).</p>
          <div className="flex gap-2">
            <input
              className="input" maxLength={500} value={aiText} onChange={(e) => setAiText(e.target.value)}
              placeholder="...or describe it: 1 bowl dal, 2 rotis and a glass of milk"
            />
            <button type="button" className="btn-secondary shrink-0" disabled={estimating || aiText.trim().length < 2} onClick={() => estimateWithAI(false)}>
              {estimating ? "Estimating..." : "✨ Estimate"}
            </button>
            <button type="button" className="btn shrink-0" disabled={estimating || aiText.trim().length < 2} onClick={() => estimateWithAI(true)}>
              ⚡ Estimate &amp; add
            </button>
          </div>
        </div>
      )}

      {assumptions.length > 0 && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <b>AI assumed:</b> {assumptions.join(" · ")}. Edit any number below if it looks off.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Meal name</label>
          <input className="input" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Oats with banana" />
        </div>
        <div>
          <label className="label">Meal type</label>
          <select className="input" value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="snack">Snack</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {number("Calories (kcal)", calories, setCalories)}
        {number("Protein (g)", protein, setProtein)}
        {number("Carbs (g)", carbs, setCarbs)}
        {number("Fat (g)", fat, setFat)}
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button className="btn" disabled={saving}>{saving ? "Saving..." : initial ? "Save changes" : "Add meal"}</button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
