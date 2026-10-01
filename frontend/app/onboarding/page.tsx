"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import { useAuth } from "@/lib/auth";

export default function OnboardingPage() {
  const router = useRouter();
  const { loading, user, refresh } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return <div className="p-10 text-center text-slate-500">Loading...</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-4 py-10">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold">Let&apos;s set up your targets</h1>
        <p className="mb-6 mt-1 text-slate-500">Tell us a bit about you and we&apos;ll estimate your daily calories and macros.</p>
        <ProfileForm
          initial={null}
          submitLabel="Calculate my targets"
          onSaved={async () => {
            await refresh();
            router.push("/dashboard");
          }}
        />
      </div>
    </main>
  );
}
