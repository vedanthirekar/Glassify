"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { getSessions } from "@/lib/storage";

interface SessionContextValue {
  activeApp: string | null;
  openApp: (app: string) => void;
  closeApp: () => void;
  getTodayCount: (app?: string) => number;
  getLastHourCount: (app?: string) => number;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [activeApp, setActiveApp] = useState<string | null>(null);

  const openApp = useCallback((app: string) => {
    setActiveApp(app);
  }, []);

  const closeApp = useCallback(() => {
    setActiveApp(null);
  }, []);

  const getTodayCount = useCallback((app?: string) => {
    const sessions = getSessions();
    const todayStr = new Date().toISOString().split("T")[0];
    return sessions.filter(
      (s) => s.timestamp.startsWith(todayStr) && (!app || s.app === app)
    ).length;
  }, []);

  const getLastHourCount = useCallback((app?: string) => {
    const sessions = getSessions();
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return sessions.filter(
      (s) =>
        new Date(s.timestamp).getTime() > oneHourAgo && (!app || s.app === app)
    ).length;
  }, []);

  return (
    <SessionContext.Provider
      value={{ activeApp, openApp, closeApp, getTodayCount, getLastHourCount }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
