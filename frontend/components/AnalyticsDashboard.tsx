"use client";

import { useEffect, useState } from "react";
import { computeAnalytics, AnalyticsData } from "@/lib/analytics";
import { CATEGORY_COLORS, CATEGORY_LABELS, ReasonCategory } from "@/lib/classifier";
import { getInsights } from "@/lib/api";
import { clearSessions } from "@/lib/storage";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loadingNarrative, setLoadingNarrative] = useState(false);

  useEffect(() => {
    setData(computeAnalytics());
  }, []);

  if (!data) return null;

  const handleGetInsight = async () => {
    if (!data) return;
    setLoadingNarrative(true);
    try {
      const reactive = data.reflectedCount + data.redirectedCount;
      const peakHour = data.peakHour !== null ? `${String(data.peakHour).padStart(2, "0")}:00` : "unknown";
      const res = await getInsights({
        total: data.totalAttempts,
        intentional: data.allowedCount,
        reactive,
        mood_drops: Math.round((data.moodDropPct / 100) * data.moodDeltaPoints.filter(p => p.after !== null).length),
        peak_hour: peakHour,
        best_days: data.bestDays,
        urge_surf_wins: data.urgeSurfWins,
        mind_score: data.mindScore,
      });
      setNarrative(res.narrative);
    } catch {
      setNarrative("Couldn't load insight right now — make sure the backend is running.");
    } finally {
      setLoadingNarrative(false);
    }
  };

  const handleClear = () => {
    if (confirm("Clear all session history?")) {
      clearSessions();
      setData(computeAnalytics());
      setNarrative(null);
    }
  };

  if (data.totalAttempts === 0) {
    return (
      <div className="text-center py-16 text-white/30">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-sm font-medium text-white/50">No sessions yet</p>
        <p className="text-xs mt-2">Try opening an app on the home screen to get started</p>
      </div>
    );
  }

  // MindScore delta
  const scoreDelta =
    data.mindScorePrevWeek !== null ? data.mindScore - data.mindScorePrevWeek : null;

  // Mood truth data — only sessions with mood_after
  const moodTruthData = data.moodDeltaPoints
    .filter((p) => p.after !== null)
    .slice(-20);

  // Trigger map: find max for color scaling
  const maxTrigger = Math.max(...data.triggerMap.map((c) => c.count), 1);

  // Reason chart data
  const reasonChartData = data.reasonBreakdown.filter((r) => r.count > 0);

  return (
    <div className="space-y-6 text-white">

      {/* MindScore — hero stat */}
      <div className="bg-gradient-to-br from-violet-900/60 to-indigo-900/60 border border-violet-500/20 rounded-2xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">MindScore</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-white">{data.mindScore}</span>
              <span className="text-white/40 text-lg mb-1">/100</span>
            </div>
            {scoreDelta !== null && (
              <p className={`text-sm mt-1 font-medium ${scoreDelta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {scoreDelta >= 0 ? "+" : ""}{scoreDelta} from last week
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl">🔥</div>
            <p className="text-white/50 text-xs mt-1">{data.currentStreak} day streak</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white/5 rounded-xl p-2">
            <div className="text-emerald-400 font-semibold text-lg">{data.intentionalPct}%</div>
            <div className="text-white/40">intentional</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2">
            <div className="text-violet-300 font-semibold text-lg">{data.urgeSurfWins}</div>
            <div className="text-white/40">urge wins</div>
          </div>
          <div className="bg-white/5 rounded-xl p-2">
            <div className="text-amber-400 font-semibold text-lg">{data.totalAttempts}</div>
            <div className="text-white/40">attempts</div>
          </div>
        </div>
      </div>

      {/* Mood Truth */}
      {moodTruthData.length > 0 && (
        <div>
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">The Mood Truth</h3>
            <span className="text-xs text-white/40">Did scrolling help?</span>
          </div>
          {data.moodDropPct > 0 && (
            <p className="text-rose-400 text-xs mb-3 font-medium">
              Your mood dropped after {data.moodDropPct}% of scroll sessions
            </p>
          )}
          <div className="bg-white/5 rounded-2xl p-4">
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={moodTruthData}>
                <XAxis dataKey="index" hide />
                <YAxis domain={[1, 5]} hide />
                <Tooltip
                  contentStyle={{ background: "#1e1b4b", border: "none", borderRadius: 8, fontSize: 12 }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any, name: any) => [val, name === "before" ? "Mood before" : "Mood after"]}
                />
                <Line
                  type="monotone"
                  dataKey="before"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  name="before"
                />
                <Line
                  type="monotone"
                  dataKey="after"
                  stroke="#f87171"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 2"
                  name="after"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center mt-2 text-xs text-white/50">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-violet-400 inline-block" /> Before</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-rose-400 inline-block border-dashed" /> After</span>
            </div>
          </div>
        </div>
      )}

      {/* Trigger Map */}
      <div>
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-sm font-semibold text-white">Your Trigger Map</h3>
          <span className="text-xs text-white/40">When does your phone pull you in?</span>
        </div>
        {data.peakHour !== null && (
          <p className="text-amber-400 text-xs mb-3 font-medium">
            Highest-risk hour: {String(data.peakHour).padStart(2, "0")}:00
            {data.peakDay !== null && ` · Most on ${DAY_LABELS[data.peakDay]}`}
          </p>
        )}
        <div className="bg-white/5 rounded-2xl p-4 overflow-x-auto">
          <div className="grid gap-0.5" style={{ gridTemplateColumns: "28px repeat(24, 1fr)", minWidth: 300 }}>
            {/* Hour headers */}
            <div />
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="text-[8px] text-white/25 text-center">
                {h % 6 === 0 ? `${h}h` : ""}
              </div>
            ))}

            {/* Day rows */}
            {DAY_LABELS.map((day, d) => (
              <>
                <div key={`label-${d}`} className="text-[8px] text-white/40 flex items-center">
                  {day}
                </div>
                {Array.from({ length: 24 }, (_, h) => {
                  const cell = data.triggerMap.find((c) => c.day === d && c.hour === h);
                  const count = cell?.count || 0;
                  const intensity = count / maxTrigger;
                  return (
                    <div
                      key={`${d}-${h}`}
                      className="aspect-square rounded-sm"
                      style={{
                        backgroundColor: count === 0
                          ? "rgba(255,255,255,0.04)"
                          : `rgba(139,92,246,${0.2 + intensity * 0.8})`,
                      }}
                      title={`${day} ${h}:00 — ${count} attempt${count !== 1 ? "s" : ""}`}
                    />
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* What's Behind Your Opens */}
      {reasonChartData.length > 0 && (
        <div>
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">What&apos;s Behind Your Opens</h3>
            <span className="text-xs text-white/40">Classified locally</span>
          </div>
          <p className="text-white/50 text-xs mb-3">
            {data.intentionalPct}% intentional · {100 - data.intentionalPct}% reactive
          </p>
          <div className="bg-white/5 rounded-2xl p-4">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={reasonChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="label"
                >
                  {reasonChartData.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={CATEGORY_COLORS[entry.category as ReasonCategory]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1e1b4b", border: "none", borderRadius: 8, fontSize: 12 }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(val: any, name: any) => [`${val} sessions`, name]}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Urge Surfing Win Rate */}
      {data.urgeSurfedCount > 0 && (
        <div className="bg-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">🌊 Urge Surfing</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg width="64" height="64" className="-rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - data.urgeSurfWins / data.urgeSurfedCount)}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {Math.round((data.urgeSurfWins / data.urgeSurfedCount) * 100)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-white text-sm">
                <span className="font-semibold text-violet-300">{data.urgeSurfWins}</span> of {data.urgeSurfedCount} pauses
                {data.urgeSurfWins > 0 && " didn't need the app after."}
              </p>
              <p className="text-white/40 text-xs mt-1">
                That&apos;s your conscious mind winning {data.urgeSurfWins} time{data.urgeSurfWins !== 1 ? "s" : ""}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LLM Weekly Narrative */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">This Week&apos;s Insight</h3>
        {narrative ? (
          <div className="bg-violet-900/30 border border-violet-500/20 rounded-2xl px-4 py-4">
            <p className="text-white/80 text-sm leading-relaxed">{narrative}</p>
          </div>
        ) : (
          <button
            onClick={handleGetInsight}
            disabled={loadingNarrative}
            className="w-full bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-200 font-medium py-3 rounded-xl transition text-sm disabled:opacity-50"
          >
            {loadingNarrative ? "Generating insight..." : "✨ Get my weekly insight"}
          </button>
        )}
      </div>

      <button
        onClick={handleClear}
        className="w-full text-white/20 hover:text-white/40 text-xs py-2 transition"
      >
        Clear session history
      </button>
    </div>
  );
}
