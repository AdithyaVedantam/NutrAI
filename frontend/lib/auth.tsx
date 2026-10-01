"use client";
// Keeps the logged-in user + profile in React context so every page can read it.
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, setToken } from "./api";
import { Profile } from "@/types";

interface AuthState {
  loading: boolean;
  user: { id: number; email: string } | null;
  profile: Profile | null;
  refresh: () => Promise<void>;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthState["user"]>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api<{ user: { id: number; email: string }; profile: Profile | null }>("/api/profile");
      setUser(data.user);
      setProfile(data.profile);
    } catch {
      setToken(null); // token invalid or expired
      setUser(null);
      setProfile(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (token: string) => {
    setToken(token);
    await refresh();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setProfile(null);
    router.push("/");
  };

  return <AuthContext.Provider value={{ loading, user, profile, refresh, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
