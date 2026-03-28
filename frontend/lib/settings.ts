export interface AppLimit {
  app: string;
  limitMinutes: number; // daily limit in minutes
}

export interface UserPreferences {
  personalNote: string;       // "What am I trying to build?"
  triggers: string;           // "What pulls me in most?"
  appLimits: AppLimit[];
}

const PREFS_KEY = "mindgate_preferences";

const DEFAULT_PREFS: UserPreferences = {
  personalNote: "",
  triggers: "",
  appLimits: [],
};

export function getPreferences(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function getAppLimit(app: string): number | null {
  const prefs = getPreferences();
  const entry = prefs.appLimits.find((l) => l.app === app);
  return entry ? entry.limitMinutes : null;
}
