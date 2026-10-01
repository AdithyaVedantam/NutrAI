"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { MealAnalysis, MealType } from "@/types";
import { guessMealType } from "@/lib/dates";

const examples = ["2 paneer parathas with curd and a banana", "Bowl of dal, 2 rotis and a cup of rice", "3 egg omelette with 2 slices of toast"];

export default function AnalyzerPage() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<MealAnalysis | null>(null);
  const [mealType, setMealType] = useState<MealType>(guessMealType());
  const [analyzing, setAnalyzing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    setAnalyzing(true);
    setError("");
    setResult(null);
    setAdded(false);
    try {
      const data = await api<{ analysis: MealAnalysis }>("/api/ai/analyze-meal", { method: "POST", body: { description } });
      setResult(data.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    }
    setAnalyzing(false);
  }

  async function addToToday() {
    if (!result) return;
    setAdding(true);
    setError("");
    try {
      await api("/api/meals", {
        method: "POST",
        body: {
          name: result.mealName, mealType, calories: result.calories,
          protein: result.protein, carbs: result.carbs, fat: result.fat, source: "ai",
        },
      });
      setAdded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add meal");
    }
    setAdding(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Meal Analyzer</h1>
        <p className="text-slate-500">Describe what you ate and AI will estimate the nutrition.</p>
      </div>

      <div className="card space-y-4">
        <textarea
          className="input min-h-[110px] resize-none" maxLength={500}
          placeholder="e.g. 2 paneer parathas with curd and a banana"
          value={description} onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button key={ex} onClick={() => setDescription(ex)} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-slate-200">
              {ex}
            </button>
          ))}
        </div>
        <button className="btn w-full" disabled={analyzing || description.trim().length < 2} onClick={analyze}>
          {analyzing ? "Analyzing..." : "✨ Analyze meal"}
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {analyzing && (
        <div className="card animate-pulse space-y-3">
          <div className="h-5 w-2/3 rounded bg-slate-100" />
          <div className="h-16 rounded bg-slate-100" />
        </div>
      )}

      {result && (
        <div className="card space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">AI estimate</p>
            <h2 className="text-xl font-bold">{result.mealName}</h2>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { label: "Calories", value: result.calories, unit: "kcal", color: "bg-emerald-50 text-emerald-700" },
              { label: "Protein", value: result.protein, unit: "g", color: "bg-rose-50 text-rose-700" },
              { label: "Carbs", value: result.carbs, unit: "g", color: "bg-amber-50 text-amber-700" },
              { label: "Fat", value: result.fat, unit: "g", color: "bg-sky-50 text-sky-700" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl p-3 ${s.color}`}>
                <p className="text-xl font-extrabold">{s.value}</p>
                <p className="text-[11px]">{s.unit} {s.label !== "Calories" ? s.label.toLowerCase() : ""}</p>
              </div>
            ))}
          </div>
          {result.assumptions.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold">Assumptions</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                {result.assumptions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}
          <p className="text-xs text-slate-400">AI values are estimates and can be wrong. Adjust the meal later if needed.</p>

          {added ? (
            <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
              ✅ Added to today&apos;s meals. <Link href="/dashboard" className="font-semibold underline">View dashboard</Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <select className="input w-auto" value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snack">Snack</option>
                <option value="dinner">Dinner</option>
              </select>
              <button className="btn flex-1" disabled={adding} onClick={addToToday}>
                {adding ? "Adding..." : "Add to Today's Meals"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
