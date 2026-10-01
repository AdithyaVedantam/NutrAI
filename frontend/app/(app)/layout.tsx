"use client";
// Layout for all logged-in pages: redirects if not logged in / no profile, shows the sidebar.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/lib/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading, user, profile } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!profile) router.replace("/onboarding");
  }, [loading, user, profile, router]);

  if (loading || !user || !profile) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="mx-auto max-w-5xl p-4 pb-24 md:ml-64 md:max-w-none md:p-8 md:pb-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
