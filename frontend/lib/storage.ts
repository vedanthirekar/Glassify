export interface Session {
  id: string;
  timestamp: string;
  app: string;
  mood_before: number;
  reason: string;           // final user reason (last user message in conversation)
  decision: "allow" | "reflect" | "redirect";
  time_granted: number | null;
  mood_after: number | null;
  completed: boolean;
  followed_up: boolean;     // whether multi-turn conversation happened
  urge_surfed: boolean;     // whether user did the 90s breathing pause
}

const STORAGE_KEY = "mindgate_sessions";

export function getSessions(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: Session): void {
  const sessions = getSessions();
  sessions.push(session);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function updateSession(id: string, updates: Partial<Session>): void {
  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx !== -1) {
    sessions[idx] = { ...sessions[idx], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }
}

export function clearSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}
