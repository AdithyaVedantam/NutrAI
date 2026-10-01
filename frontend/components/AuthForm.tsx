"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";

// One form for both /login and /signup.
export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { token } = await api<{ token: string }>(`/api/auth/${mode}`, { method: "POST", body: { email, password } });
      await login(token);
      router.push(mode === "signup" ? "/onboarding" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-4">
      <div className="fixed right-4 top-4"><ThemeToggle /></div>
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">🥗</span> NutrAI
        </Link>
        <form onSubmit={handleSubmit} className="card space-y-4 p-7">
          <h1 className="text-xl font-bold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            {mode === "signup" && <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>}
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <button className="btn w-full" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
          </button>
          <p className="text-center text-sm text-slate-500">
            {mode === "login" ? "New here? " : "Already have an account? "}
            <Link href={mode === "login" ? "/signup" : "/login"} className="font-semibold text-emerald-600">
              {mode === "login" ? "Sign up" : "Log in"}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
