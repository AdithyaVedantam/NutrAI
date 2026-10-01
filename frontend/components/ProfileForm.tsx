"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { Profile } from "@/types";

// Used by both the onboarding page and the profile page.
// The server calculates calorie/macro targets when this is saved.
export default function ProfileForm({ initial, submitLabel, onSaved }: {
  initial: Profile | null;
  submitLabel: string;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [age, setAge] = useState(initial ? String(initial.age) : "");
  const [sex, setSex] = useState(initial?.sex ?? "male");
  const [heightCm, setHeightCm] = useState(initial ? String(initial.heightCm) : "");
  const [weightKg, setWeightKg] = useState(initial ? String(initial.weightKg) : "");
  const [activityLevel, setActivityLevel] = useState(initial?.activityLevel ?? "light");
  const [goal, setGoal] = useState(initial?.goal ?? "maintain");
  const [diet, setDiet] = useState(initial?.diet ?? "non_vegetarian");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api("/api/profile", {
        method: "PUT",
        body: { name, age: Number(age), sex, heightCm: Number(heightCm), weightKg: Number(weightKg), activityLevel, goal, diet },
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Name</label>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Age</label>
          <input className="input" type="number" required min={13} max={100} value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div>
          <label className="label">Sex</label>
          <select className="input" value={sex} onChange={(e) => setSex(e.target.value as Profile["sex"])}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="label">Height (cm)</label>
          <input className="input" type="number" required min={100} max={250} step="any" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
        </div>
        <div>
          <label className="label">Weight (kg)</label>
          <input className="input" type="number" required min={30} max={300} step="any" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Activity level</label>
          <select className="input" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as Profile["activityLevel"])}>
            <option value="sedentary">Sedentary - little or no exercise</option>
            <option value="light">Light - exercise 1-3 days/week</option>
            <option value="moderate">Moderate - exercise 3-5 days/week</option>
            <option value="active">Active - exercise 6-7 days/week</option>
            <option value="very_active">Very active - hard exercise or physical job</option>
          </select>
        </div>
        <div>
          <label className="label">Goal</label>
          <select className="input" value={goal} onChange={(e) => setGoal(e.target.value as Profile["goal"])}>
            <option value="lose">Lose weight</option>
            <option value="maintain">Maintain weight</option>
            <option value="gain">Gain weight</option>
          </select>
        </div>
        <div>
          <label className="label">Diet</label>
          <select className="input" value={diet} onChange={(e) => setDiet(e.target.value as Profile["diet"])}>
            <option value="non_vegetarian">Non-vegetarian</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="eggetarian">Eggetarian</option>
            <option value="vegan">Vegan</option>
          </select>
        </div>
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <button className="btn w-full" disabled={saving}>{saving ? "Saving..." : submitLabel}</button>
    </form>
  );
}
