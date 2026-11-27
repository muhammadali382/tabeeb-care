"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface HealthProfile {
  age: number | null;
  gender: string | null;
  conditions: string[];
  allergies: string[];
  current_medications: string[];
  updated_at?: string | null;
}

interface UserContextType {
  user: User | null;
  profile: HealthProfile | null;
  isLoading: boolean;
  login: (user: User, profile?: HealthProfile) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (profile: Partial<HealthProfile>) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "tabibcare_user";
const PROFILE_STORAGE_KEY = "tabibcare_profile";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistProfileLocally = (nextProfile: HealthProfile | null) => {
    if (typeof window === "undefined") return;
    if (nextProfile) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
    } else {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  };

  const readCachedProfile = (): HealthProfile | null => {
    if (typeof window === "undefined") return null;
    try {
      const cached = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (cached) return JSON.parse(cached) as HealthProfile;
    } catch {
      // ignore malformed cache
    }
    return null;
  };

  const fetchProfile = useCallback(async (userId: number) => {
    try {
      const res = await fetch(`/api/profile?userId=${userId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          persistProfileLocally(data.profile);
        }
      } else {
        const cached = readCachedProfile();
        if (cached) {
          setProfile(cached);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile in context:", err);
      const cached = readCachedProfile();
      if (cached) {
        setProfile(cached);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initializeSession = async () => {
      try {
        if (typeof document !== "undefined") {
          document.documentElement.lang = "en";
          document.documentElement.dir = "ltr";
        }

        // Verify signed HttpOnly session cookie with server
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.user));
            if (data.profile) {
              setProfile(data.profile);
              persistProfileLocally(data.profile);
            } else {
              const cached = readCachedProfile();
              if (cached) setProfile(cached);
            }
          } else {
            setUser(null);
            setProfile(null);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            localStorage.removeItem(PROFILE_STORAGE_KEY);
          }
        } else if (res.status === 401) {
          setUser(null);
          setProfile(null);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          localStorage.removeItem(PROFILE_STORAGE_KEY);
        } else {
          const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (stored) {
            const parsedUser = JSON.parse(stored) as User;
            setUser(parsedUser);
            const cached = readCachedProfile();
            if (cached) setProfile(cached);
          }
        }
      } catch (err) {
        console.error("Failed to initialize user session:", err);
        if (!cancelled) {
          try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (stored) {
              setUser(JSON.parse(stored) as User);
              const cached = readCachedProfile();
              if (cached) setProfile(cached);
            }
          } catch {
            // ignore
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    initializeSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = (newUser: User, initialProfile?: HealthProfile) => {
    setUser(newUser);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
    }
    if (initialProfile) {
      setProfile(initialProfile);
      persistProfileLocally(initialProfile);
    } else {
      fetchProfile(newUser.id);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to call logout endpoint:", err);
    } finally {
      setUser(null);
      setProfile(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem(PROFILE_STORAGE_KEY);
      }
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const updateProfile = async (updatedFields: Partial<HealthProfile>): Promise<boolean> => {
    if (!user) return false;
    try {
      const merged = {
        userId: user.id,
        age: updatedFields.age !== undefined ? updatedFields.age : profile?.age ?? null,
        gender: updatedFields.gender !== undefined ? updatedFields.gender : profile?.gender ?? null,
        conditions: updatedFields.conditions ?? profile?.conditions ?? [],
        allergies: updatedFields.allergies ?? profile?.allergies ?? [],
        current_medications:
          updatedFields.current_medications ?? profile?.current_medications ?? [],
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(merged),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        persistProfileLocally(data.profile);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to update profile:", err);
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        isLoading,
        login,
        logout,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
