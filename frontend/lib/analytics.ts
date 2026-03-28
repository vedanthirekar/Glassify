import { getSessions, Session } from "./storage";

export interface HourlyData {
  hour: string;
  attempts: number;
  allowed: number;
}

export interface DecisionBreakdown {
  allow: number;
  reflect: number;
  redirect: number;
}

export interface AnalyticsData {
  totalAttempts: number;
  allowedCount: number;
  reflectedCount: number;
  redirectedCount: number;
  currentStreak: number;
  hourlyData: HourlyData[];
  decisionBreakdown: DecisionBreakdown;
  topApps: { app: string; count: number }[];
  recentSessions: Session[];
}

export function computeAnalytics(): AnalyticsData {
  const sessions = getSessions();

  const totalAttempts = sessions.length;
  const allowedCount = sessions.filter((s) => s.decision === "allow").length;
  const reflectedCount = sessions.filter((s) => s.decision === "reflect").length;
  const redirectedCount = sessions.filter((s) => s.decision === "redirect").length;

  // Hourly distribution (0-23)
  const hourlyCounts: Record<number, { attempts: number; allowed: number }> = {};
  for (let h = 0; h < 24; h++) hourlyCounts[h] = { attempts: 0, allowed: 0 };

  sessions.forEach((s) => {
    const hour = new Date(s.timestamp).getHours();
    hourlyCounts[hour].attempts++;
    if (s.decision === "allow") hourlyCounts[hour].allowed++;
  });

  // Fix hour formatting
  const formattedHourly = Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, "0")}:00`,
    attempts: hourlyCounts[h].attempts,
    allowed: hourlyCounts[h].allowed,
  }));

  // Top apps
  const appCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    appCounts[s.app] = (appCounts[s.app] || 0) + 1;
  });
  const topApps = Object.entries(appCounts)
    .map(([app, count]) => ({ app, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Streak: consecutive days with 0 unintentional opens (reflect/redirect only)
  const today = new Date();
  let streak = 0;
  for (let d = 0; d < 30; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dateStr = date.toISOString().split("T")[0];
    const dayUnintentional = sessions.filter(
      (s) =>
        s.timestamp.startsWith(dateStr) &&
        (s.decision === "reflect" || s.decision === "redirect")
    ).length;
    if (d === 0 && dayUnintentional === 0 && totalAttempts === 0) break;
    if (dayUnintentional === 0 && d > 0) streak++;
    else if (dayUnintentional > 0) break;
  }

  return {
    totalAttempts,
    allowedCount,
    reflectedCount,
    redirectedCount,
    currentStreak: streak,
    hourlyData: formattedHourly,
    decisionBreakdown: { allow: allowedCount, reflect: reflectedCount, redirect: redirectedCount },
    topApps,
    recentSessions: sessions.slice(-10).reverse(),
  };
}
