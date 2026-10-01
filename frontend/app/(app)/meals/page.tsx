"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Meal, MealInput } from "@/types";
import { addDays, endOfDay, isSameDay, startOfDay, sumMeals } from "@/lib/dates";
import MealCard from "@/components/MealCard";
import MealForm from "@/components/MealForm";

export default function MealsPage() {
  const [date, setDate] = useState(new Date());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Meal | null>(null);

  const loadMeals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const from = startOfDay(date).toISOString();
      const to = endOfDay(date).toISOString();
      const data = await api<{ meals: Meal[] }>(`/api/meals?from=${from}&to=${to}`);
      setMeals(data.meals);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load meals");
    }
    setLoading(false);
  }, [date]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  // When adding on a past/future day, save the meal at noon of that day so it lands on the right date.
  const eatenAtForSelectedDay = () => {
    if (isSameDay(date, new Date())) return undefined; // server uses "now"
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12).toISOString();
  };

  async function addMeal(meal: MealInput) {
    await api("/api/meals", { method: "POST", body: { ...meal, eatenAt: eatenAtForSelectedDay() } });
    setShowForm(false);
    await loadMeals();
  }

  async function saveEdit(meal: MealInput) {
    if (!editing) return;
    await api(`/api/meals/${editing.id}`, { method: "PUT", body: meal });
    setEditing(null);
    await loadMeals();
  }

  async function deleteMeal(id: number) {
    if (!confirm("Delete this meal?")) return;
    try {
      await api(`/api/meals/${id}`, { method: "DELETE" });
      await loadMeals();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete meal");
    }
  }

  const totals = sumMeals(meals);
  const isToday = isSameDay(date, new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Meals</h1>
        <button className="btn" onClick={() => { setShowForm(true); setEditing(null); }}>+ Add meal</button>
      </div>

      <div className="card flex items-center justify-between">
        <button className="btn-secondary" onClick={() => setDate(addDays(date, -1))}>←</button>
        <div className="text-center">
          <p className="font-semibold">{isToday ? "Today" : date.toLocaleDateString(undefined, { weekday: "long" })}</p>
          <p className="text-sm text-slate-500">{date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
        <button className="btn-secondary" disabled={isToday} onClick={() => setDate(addDays(date, 1))}>→</button>
      </div>

      {showForm && <MealForm onSubmit={addMeal} onCancel={() => setShowForm(false)} />}
      {editing && <MealForm initial={editing} onSubmit={saveEdit} onCancel={() => setEditing(null)} />}
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Logged meals</h2>
          <p className="text-sm text-slate-500">
            <b className="text-slate-800">{Math.round(totals.calories)}</b> kcal · P {Math.round(totals.protein)}g · C {Math.round(totals.carbs)}g · F {Math.round(totals.fat)}g
          </p>
        </div>
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-400">Loading...</p>
        ) : meals.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-3xl">🍽️</p>
            <p className="mt-2 font-medium">No meals on this day</p>
            <p className="text-sm text-slate-500">Click &quot;Add meal&quot; to log one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {meals.map((m) => (
              <MealCard key={m.id} meal={m} onEdit={() => { setEditing(m); setShowForm(false); }} onDelete={() => deleteMeal(m.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
