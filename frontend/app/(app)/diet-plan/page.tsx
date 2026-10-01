"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DietPlan } from "@/types";

const dietLabels: Record<string, string> = { vegetarian: "Vegetarian", non_vegetarian: "Non-vegetarian", vegan: "Vegan", eggetarian: "Eggetarian" };
const goalLabels: Record<string, string> = { lose: "Lose weight", maintain: "Maintain weight", gain: "Gain weight" };

export default function DietPlanPage() {
  const { profile } = useAuth();
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [selected, setSelected] = useState(0); // index into plans (0 = newest)
  const [mealsCount, setMealsCount] = useState(4);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ plans: DietPlan[] }>("/api/diet-plans")
      .then((d) => setPlans(d.plans))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function generate() {
    setGenerating(true);
    setError("");
    try {
      const data = await api<{ plan: DietPlan }>("/api/diet-plans/generate", { method: "POST", body: { mealsCount } });
      setPlans([data.plan, ...plans]);
      setSelected(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate plan");
    }
    setGenerating(false);
  }

  if (!profile) return null;
  const plan = plans[selected];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Diet Plan</h1>
        <p className="text-slate-500">A simple one-day plan based on your goal, diet and targets.</p>
      </div>

      <div className="card flex flex-wrap items-end gap-4">
        <div className="flex-1 text-sm text-slate-600">
          <p><b>Goal:</b> {goalLabels[profile.goal]} · <b>Diet:</b> {dietLabels[profile.diet]}</p>
          <p><b>Target:</b> ~{profile.targetCalories} kcal · {profile.proteinG}g protein</p>
        </div>
        <div>
          <label className="label">Meals per day</label>
          <select className="input w-auto" value={mealsCount} onChange={(e) => setMealsCount(Number(e.target.value))}>
            {[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} meals</option>)}
          </select>
        </div>
        <button className="btn" disabled={generating} onClick={generate}>{generating ? "Generating..." : "✨ Generate plan"}</button>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {generating && (
        <div className="grid animate-pulse gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="card h-40 bg-slate-100" />)}
        </div>
      )}

      {!generating && !loading && !plan && (
        <div className="card py-12 text-center">
          <p className="text-4xl">📋</p>
          <p className="mt-2 font-medium">No plan yet</p>
          <p className="text-sm text-slate-500">Choose how many meals you want and click Generate.</p>
        </div>
      )}

      {!generating && plan && (
        <>
          {plans.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {plans.map((p, i) => (
                <button key={p.id} onClick={() => setSelected(i)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${i === selected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                  {new Date(p.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {p.mealsCount} meals
                </button>
              ))}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {plan.content.meals.map((meal, i) => (
              <div key={i} className="card">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-bold">{meal.mealType}</h3>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{Math.round(meal.calories)} kcal</span>
                </div>
                <ul className="space-y-1.5 text-sm">
                  {meal.foods.map((f, j) => (
                    <li key={j} className="flex justify-between gap-3">
                      <span>{f.name} <span className="text-slate-400">· {f.portion}</span></span>
                      <span className="text-slate-500">{Math.round(f.calories)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  P {Math.round(meal.protein)}g · C {Math.round(meal.carbs)}g · F {Math.round(meal.fat)}g
                </p>
              </div>
            ))}
          </div>
          {plan.content.tips.length > 0 && (
            <div className="card">
              <h3 className="mb-2 font-semibold">Tips</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">{plan.content.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          )}
          <p className="text-xs text-slate-400">AI-generated plan with approximate values. Not medical advice.</p>
        </>
      )}
    </div>
  );
}
