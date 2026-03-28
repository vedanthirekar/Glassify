import { getSessions, Session } from "./storage";
import { classifyReason, ReasonCategory, CATEGORY_LABELS } from "./classifier";

export interface MoodDeltaPoint {
  index: number;
  app: string;
  before: number;
  after: number | null;
  delta: number | null;
  timestamp: string;
}

export interface TriggerMapCell {
  day: number;   // 0 = Sun, 6 = Sat
  hour: number;  // 0–23
  count: number;
}

export interface ReasonBreakdown {
  category: ReasonCategory;
  label: string;
  count: number;
  pct: number;
}

export interface AnalyticsData {
  // Counts
  totalAttempts: number;
  allowedCount: number;
  reflectedCount: number;
  redirectedCount: number;
  urgeSurfedCount: number;
  urgeSurfWins: number;      // urge surfed AND didn't open after

  // Mood Truth
  moodDeltaPoints: MoodDeltaPoint[];
  moodDropPct: number;       // % of completed sessions where mood_after < mood_before

  // Trigger map
  triggerMap: TriggerMapCell[];
  peakHour: number | null;
  peakDay: number | null;

  // Reason breakdown
  reasonBreakdown: ReasonBreakdown[];
  intentionalPct: number;

  // MindScore
  mindScore: number;
  mindScorePrevWeek: number | null;

  // Streak
  currentStreak: number;

  // For LLM insights
  bestDays: string[];

  // Recent
  recentSessions: Session[];
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfWeek(weeksAgo = 0): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay() - weeksAgo * 7);
  return d;
}

function computeMindScore(sessions: Session[]): number {
  if (sessions.length === 0) return 0;

  // 40 pts: intentional %
  const intentionalCount = sessions.filter(
    (s) => classifyReason(s.reason) === "intentional"
  ).length;
  const intentionalPct = sessions.length > 0 ? intentionalCount / sessions.length : 0;
  const intentionalScore = Math.round(intentionalPct * 40);

  // 30 pts: mood delta trend (positive = improving)
  const withMoodAfter = sessions.filter((s) => s.mood_after !== null);
  let moodScore = 15; // neutral baseline
  if (withMoodAfter.length > 0) {
    const avgDelta =
      withMoodAfter.reduce((sum, s) => sum + (s.mood_after! - s.mood_before), 0) /
      withMoodAfter.length;
    // -2 to +2 range → 0 to 30
    moodScore = Math.round(Math.max(0, Math.min(30, ((avgDelta + 2) / 4) * 30)));
  }

  // 30 pts: days with zero reactive opens this week
  const weekStart = startOfWeek();
  const daysInWeek = 7;
  let mindfulDays = 0;
  for (let d = 0; d < daysInWeek; d++) {
    const dayStart = new Date(weekStart);
    dayStart.setDate(weekStart.getDate() + d);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);
    const dayStr = dayStart.toISOString().split("T")[0];
    const reactive = sessions.filter(
      (s) =>
        s.timestamp.startsWith(dayStr) &&
        (s.decision === "reflect" || s.decision === "redirect")
    ).length;
    if (reactive === 0) mindfulDays++;
  }
  const streakScore = Math.round((mindfulDays / daysInWeek) * 30);

  return Math.min(100, intentionalScore + moodScore + streakScore);
}

export function computeAnalytics(): AnalyticsData {
  const allSessions = getSessions();
  const thisWeekStart = startOfWeek();
  const lastWeekStart = startOfWeek(1);

  const thisWeek = allSessions.filter((s) => new Date(s.timestamp) >= thisWeekStart);
  const lastWeek = allSessions.filter(
    (s) =>
      new Date(s.timestamp) >= lastWeekStart && new Date(s.timestamp) < thisWeekStart
  );

  // Use all sessions for most things, this week for score
  const sessions = allSessions;

  const totalAttempts = sessions.length;
  const allowedCount = sessions.filter((s) => s.decision === "allow").length;
  const reflectedCount = sessions.filter((s) => s.decision === "reflect").length;
  const redirectedCount = sessions.filter((s) => s.decision === "redirect").length;
  const urgeSurfedCount = sessions.filter((s) => s.urge_surfed).length;

  // Urge surf wins: urge surfed AND session was not completed (user chose not to open)
  const urgeSurfWins = sessions.filter(
    (s) => s.urge_surfed && !s.completed
  ).length;

  // Mood delta points (all sessions with mood_before)
  const moodDeltaPoints: MoodDeltaPoint[] = sessions.map((s, i) => ({
    index: i + 1,
    app: s.app,
    before: s.mood_before,
    after: s.mood_after,
    delta: s.mood_after !== null ? s.mood_after - s.mood_before : null,
    timestamp: s.timestamp,
  }));

  const completedWithMood = sessions.filter((s) => s.mood_after !== null);
  const moodDrops = completedWithMood.filter((s) => s.mood_after! < s.mood_before).length;
  const moodDropPct =
    completedWithMood.length > 0
      ? Math.round((moodDrops / completedWithMood.length) * 100)
      : 0;

  // Trigger map: day × hour
  const mapCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    const d = new Date(s.timestamp);
    const key = `${d.getDay()}-${d.getHours()}`;
    mapCounts[key] = (mapCounts[key] || 0) + 1;
  });
  const triggerMap: TriggerMapCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      triggerMap.push({ day, hour, count: mapCounts[`${day}-${hour}`] || 0 });
    }
  }

  // Peak hour/day
  let peakHour: number | null = null;
  let peakDay: number | null = null;
  const hourTotals = Array(24).fill(0);
  const dayTotals = Array(7).fill(0);
  sessions.forEach((s) => {
    const d = new Date(s.timestamp);
    hourTotals[d.getHours()]++;
    dayTotals[d.getDay()]++;
  });
  if (sessions.length > 0) {
    peakHour = hourTotals.indexOf(Math.max(...hourTotals));
    peakDay = dayTotals.indexOf(Math.max(...dayTotals));
  }

  // Reason breakdown
  const categoryCounts: Record<ReasonCategory, number> = {
    intentional: 0, boredom: 0, avoidance: 0, emotional: 0, habit: 0,
  };
  sessions.forEach((s) => {
    if (s.reason) categoryCounts[classifyReason(s.reason)]++;
  });
  const reasonBreakdown: ReasonBreakdown[] = (
    Object.entries(categoryCounts) as [ReasonCategory, number][]
  ).map(([category, count]) => ({
    category,
    label: CATEGORY_LABELS[category],
    count,
    pct: sessions.length > 0 ? Math.round((count / sessions.length) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  const intentionalPct =
    sessions.length > 0
      ? Math.round((categoryCounts.intentional / sessions.length) * 100)
      : 0;

  // MindScore
  const mindScore = computeMindScore(thisWeek);
  const mindScorePrevWeek = lastWeek.length > 0 ? computeMindScore(lastWeek) : null;

  // Streak
  const today = new Date();
  let currentStreak = 0;
  for (let d = 0; d < 30; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dateStr = date.toISOString().split("T")[0];
    const reactive = sessions.filter(
      (s) =>
        s.timestamp.startsWith(dateStr) &&
        (s.decision === "reflect" || s.decision === "redirect")
    ).length;
    if (reactive === 0 && d > 0) currentStreak++;
    else if (reactive > 0) break;
  }

  // Best days this week (zero reactive opens)
  const bestDays: string[] = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(thisWeekStart);
    date.setDate(thisWeekStart.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];
    if (date > today) break;
    const reactive = allSessions.filter(
      (s) =>
        s.timestamp.startsWith(dateStr) &&
        (s.decision === "reflect" || s.decision === "redirect")
    ).length;
    if (reactive === 0) bestDays.push(DAY_NAMES[date.getDay()]);
  }

  return {
    totalAttempts,
    allowedCount,
    reflectedCount,
    redirectedCount,
    urgeSurfedCount,
    urgeSurfWins,
    moodDeltaPoints,
    moodDropPct,
    triggerMap,
    peakHour,
    peakDay,
    reasonBreakdown,
    intentionalPct,
    mindScore,
    mindScorePrevWeek,
    currentStreak,
    bestDays,
    recentSessions: allSessions.slice(-10).reverse(),
  };
}
