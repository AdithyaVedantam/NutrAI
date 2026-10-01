"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Meal } from "@/types";
import { addDays, endOfDay, isSameDay, startOfDay, sumMeals } from "@/lib/dates";
import Ring from "@/components/Ring";
import ProgressBar from "@/components/ProgressBar";
import MealCard from "@/components/MealCard";

export default function DashboardPage() {
  const { profile } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]); // last 7 days
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const today = new Date();
    const from = startOfDay(addDays(today, -6)).toISOString();
    const to = endOfDay(today).toISOString();
    api<{ meals: Meal[] }>(`/api/meals?from=${from}&to=${to}`)
      .then((d) => setMeals(d.meals))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (!profile) return null;

  const today = new Date();
  const todaysMeals = meals.filter((m) => isSameDay(new Date(m.eatenAt), today));
  const totals = sumMeals(todaysMeals);
  const remaining = profile.targetCalories - totals.calories;

  // Last 7 days of calories for the small chart
  const history = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(today, i - 6);
    const calories = sumMeals(meals.filter((m) => isSameDay(new Date(m.eatenAt), day))).calories;
    return { label: day.toLocaleDateString(undefined, { weekday: "short" }), calories, isToday: i === 6 };
  });
  const chartMax = Math.max(profile.targetCalories, ...history.map((h) => h.calories));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Hi {profile.name.split(" ")[0]} 👋</h1>
          <p className="text-slate-500">{today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <Link href="/meals" className="btn">+ Log a meal</Link>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calories ring */}
        <div className="card flex flex-col items-center">
          <h2 className="mb-4 self-start font-semibold">Calories today</h2>
          <Ring value={totals.calories} max={profile.targetCalories}>
            <span className="text-3xl font-extrabold">{Math.round(totals.calories)}</span>
            <span className="text-xs text-slate-500">of {profile.targetCalories} kcal</span>
          </Ring>
          <div className="mt-5 grid w-full grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-lg font-bold">{profile.targetCalories}</p>
              <p className="text-xs text-slate-500">Target</p>
            </div>
            <div className={`rounded-xl p-3 ${remaining < 0 ? "bg-red-50" : "bg-emerald-50"}`}>
              <p className={`text-lg font-bold ${remaining < 0 ? "text-red-600" : "text-emerald-700"}`}>{Math.abs(Math.round(remaining))}</p>
              <p className="text-xs text-slate-500">{remaining < 0 ? "Over" : "Remaining"}</p>
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="card lg:col-span-2">
          <h2 className="mb-5 font-semibold">Macros</h2>
          <div className="space-y-5">
            <ProgressBar label="Protein" value={totals.protein} max={profile.proteinG} color="bg-rose-500" />
            <ProgressBar label="Carbs" value={totals.carbs} max={profile.carbsG} color="bg-amber-500" />
            <ProgressBar label="Fat" value={totals.fat} max={profile.fatG} color="bg-sky-500" />
          </div>
          <p className="mt-6 text-xs text-slate-400">
            Targets are estimates from the Mifflin-St Jeor formula. They are not medical advice.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's meals */}
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Today&apos;s meals</h2>
            <Link href="/meals" className="text-sm font-medium text-emerald-600">View all</Link>
          </div>
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-400">Loading meals...</p>
          ) : todaysMeals.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-3xl">🍽️</p>
              <p className="mt-2 font-medium">Nothing logged yet</p>
              <p className="mb-4 text-sm text-slate-500">Add a meal manually or describe it to the AI analyzer.</p>
              <div className="flex justify-center gap-2">
                <Link href="/meals" className="btn-secondary">Add manually</Link>
                <Link href="/analyzer" className="btn">Try AI analyzer</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">{todaysMeals.map((m) => <MealCard key={m.id} meal={m} />)}</div>
          )}
        </div>

        {/* 7-day history */}
        <div className="card">
          <h2 className="mb-4 font-semibold">Last 7 days</h2>
          <div className="flex h-40 items-end gap-2">
            {history.map((h) => (
              <div key={h.label + h.calories} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-32 w-full items-end rounded-md bg-slate-50">
                  <div
                    className={`w-full rounded-md ${h.isToday ? "bg-emerald-500" : "bg-emerald-200"}`}
                    style={{ height: `${chartMax ? (h.calories / chartMax) * 100 : 0}%` }}
                    title={`${Math.round(h.calories)} kcal`}
                  />
                </div>
                <span className="text-[10px] text-slate-500">{h.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
