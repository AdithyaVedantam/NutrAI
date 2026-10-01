"use client";
import { useState } from "react";
import ProfileForm from "@/components/ProfileForm";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  const { profile, user, refresh } = useAuth();
  const [saved, setSaved] = useState(false);
  if (!profile) return null;

  const stats = [
    { label: "BMR", value: `${profile.bmr} kcal`, hint: "Calories burned at rest" },
    { label: "Maintenance", value: `${profile.maintenanceCalories} kcal`, hint: "BMR x activity" },
    { label: "Daily target", value: `${profile.targetCalories} kcal`, hint: "Adjusted for your goal" },
    { label: "Protein", value: `${profile.proteinG} g`, hint: "" },
    { label: "Carbs", value: `${profile.carbsG} g`, hint: "" },
    { label: "Fat", value: `${profile.fatG} g`, hint: "" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-slate-500">{user?.email}</p>
      </div>

      <div className="card">
        <h2 className="mb-4 font-semibold">Your estimated targets</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-lg font-bold">{s.value}</p>
              {s.hint && <p className="text-[11px] text-slate-400">{s.hint}</p>}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400">
          These are estimates from the Mifflin-St Jeor equation and a simple activity multiplier. They are not medical advice.
        </p>
      </div>

      {saved && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">✅ Profile saved and targets recalculated.</p>}
      <ProfileForm
        initial={profile}
        submitLabel="Save & recalculate"
        onSaved={async () => {
          await refresh();
          setSaved(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
