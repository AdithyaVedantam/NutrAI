"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/meals", label: "Meals", icon: "🍽️" },
  { href: "/analyzer", label: "AI Analyzer", icon: "✨" },
  { href: "/assistant", label: "Assistant", icon: "💬" },
  { href: "/diet-plan", label: "Diet Plan", icon: "📋" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, logout } = useAuth();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200 bg-white p-5 md:flex">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 text-xl font-bold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">🥗</span>
          NutrAI
        </Link>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                pathname === l.href ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="text-base">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle variant="sidebar" />
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="truncate text-sm font-semibold">{profile?.name}</p>
          <button onClick={logout} className="mt-1 text-xs font-medium text-slate-500 hover:text-red-600">
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-slate-200 bg-white px-1 py-1.5 md:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex flex-col items-center rounded-lg px-2 py-1 text-[10px] font-medium ${
              pathname === l.href ? "text-emerald-700" : "text-slate-500"
            }`}
          >
            <span className="text-lg">{l.icon}</span>
            {l.label.replace("AI ", "")}
          </Link>
        ))}
        <ThemeToggle variant="tab" />
      </nav>
    </>
  );
}
