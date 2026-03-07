"use client";

import { create } from "zustand";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthStore {
  user: UserInfo | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  loading: true,

  fetchUser: async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      set({ user: data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      return err.error || "Login failed";
    }
    const user = await res.json();
    set({ user });
    return null;
  },

  signup: async (name, email, phone, password) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      return err.error || "Signup failed";
    }
    const user = await res.json();
    set({ user });
    return null;
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null });
  },
}));
