import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const features = [
  { icon: "🎯", title: "Personal targets", text: "Calories and macros calculated from your body, activity and goal." },
  { icon: "✨", title: "Describe your meal", text: "Type what you ate in plain words and AI estimates the nutrition." },
  { icon: "💬", title: "Nutrition assistant", text: "Ask what to eat next, based on what you have left today." },
  { icon: "📋", title: "Diet plans", text: "Generate a simple one-day plan that fits your diet and targets." },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between p-5">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">🥗</span> NutrAI
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900">Log in</Link>
          <Link href="/signup" className="btn">Get started</Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 pb-16 pt-14 text-center">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">AI-powered nutrition tracking</span>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Eat smarter, <span className="text-emerald-600">effortlessly.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Set your goal, log meals in plain language, and let NutrAI show exactly where you stand with calories and macros.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signup" className="btn px-6 py-3 text-base">Create free account</Link>
          <Link href="/login" className="btn-secondary px-6 py-3 text-base">Log in</Link>
        </div>
        <p className="mt-4 text-xs text-slate-400">Nutrition values are estimates, not medical advice.</p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="card">
            <div className="mb-3 text-2xl">{f.icon}</div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{f.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
