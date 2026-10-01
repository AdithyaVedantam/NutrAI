"use client";
import { useEffect, useState } from "react";

// Adds/removes the "dark" class on <html> and remembers the choice in localStorage.
// (The tiny script in app/layout.tsx applies the saved choice before the page paints.)
export default function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "sidebar" | "tab" }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  const icon = dark ? "☀️" : "🌙";
  const label = dark ? "Light mode" : "Dark mode";

  if (variant === "tab")
    return (
      <button onClick={toggle} aria-label={label} className="flex flex-col items-center rounded-lg px-2 py-1 text-[10px] font-medium text-slate-500">
        <span className="text-lg">{icon}</span>Theme
      </button>
    );
  if (variant === "sidebar")
    return (
      <button onClick={toggle} className="mb-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
        <span className="text-base">{icon}</span>
        {label}
      </button>
    );
  return (
    <button onClick={toggle} aria-label={label} title={label} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-base hover:bg-slate-50">
      {icon}
    </button>
  );
}
