"use client";

import { useEffect, useState } from "react";
import { computeAnalytics, AnalyticsData } from "@/lib/analytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { clearSessions } from "@/lib/storage";

const PIE_COLORS = { allow: "#34d399", reflect: "#fbbf24", redirect: "#f87171" };

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    setData(computeAnalytics());
  }, []);

  const handleClear = () => {
    if (confirm("Clear all session history?")) {
      clearSessions();
      setData(computeAnalytics());
    }
  };

  if (!data) return null;

  const pieData = [
    { name: "Allowed", value: data.allowedCount, key: "allow" },
    { name: "Reflected", value: data.reflectedCount, key: "reflect" },
    { name: "Redirected", value: data.redirectedCount, key: "redirect" },
  ].filter((d) => d.value > 0);

  // Only show hours with activity, plus surrounding context
  const activeHourly = data.hourlyData.filter((h) => h.attempts > 0);

  return (
    <div className="space-y-6 text-white">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard value={data.totalAttempts} label="Total attempts" color="text-white" />
        <StatCard value={data.allowedCount} label="Allowed" color="text-emerald-400" />
        <StatCard
          value={data.reflectedCount + data.redirectedCount}
          label="Paused"
          color="text-amber-400"
        />
      </div>

      {/* Streak */}
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl px-5 py-4 flex items-center gap-4">
        <span className="text-4xl">🔥</span>
        <div>
          <div className="text-2xl font-bold">{data.currentStreak}</div>
          <div className="text-white/60 text-sm">mindful days streak</div>
        </div>
      </div>

      {/* Decision breakdown */}
      {pieData.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wide mb-3">
            Decision Breakdown
          </h3>
          <div className="bg-white/5 rounded-2xl p-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={PIE_COLORS[entry.key as keyof typeof PIE_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1e1b4b", border: "none", borderRadius: 8 }}
                  labelStyle={{ color: "white" }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Hourly attempts */}
      {activeHourly.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wide mb-3">
            Attempts by Hour
          </h3>
          <div className="bg-white/5 rounded-2xl p-4">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={activeHourly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="hour"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ background: "#1e1b4b", border: "none", borderRadius: 8 }}
                  labelStyle={{ color: "white" }}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar dataKey="attempts" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Attempts" />
                <Bar dataKey="allowed" fill="#34d399" radius={[4, 4, 0, 0]} name="Allowed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top apps */}
      {data.topApps.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wide mb-3">
            Most Attempted Apps
          </h3>
          <div className="space-y-2">
            {data.topApps.map((item) => (
              <div
                key={item.app}
                className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3"
              >
                <span className="text-white/80 text-sm">{item.app}</span>
                <span className="text-white/40 text-sm">{item.count} attempts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      {data.recentSessions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wide mb-3">
            Recent Sessions
          </h3>
          <div className="space-y-2">
            {data.recentSessions.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3"
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    s.decision === "allow"
                      ? "bg-emerald-400"
                      : s.decision === "reflect"
                      ? "bg-amber-400"
                      : "bg-rose-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 text-sm font-medium">{s.app}</span>
                    <span className="text-white/30 text-xs">
                      {new Date(s.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs truncate">{s.reason}</p>
                </div>
                <span className="text-xs capitalize text-white/30">{s.decision}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.totalAttempts === 0 && (
        <div className="text-center py-12 text-white/30">
          <div className="text-5xl mb-3">📊</div>
          <p className="text-sm">No sessions yet.</p>
          <p className="text-xs mt-1">Try opening an app on the home screen!</p>
        </div>
      )}

      {data.totalAttempts > 0 && (
        <button
          onClick={handleClear}
          className="w-full text-white/20 hover:text-white/40 text-xs py-2 transition"
        >
          Clear session history
        </button>
      )}
    </div>
  );
}

function StatCard({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="bg-white/5 rounded-2xl px-4 py-4 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-white/40 text-xs mt-1 leading-tight">{label}</div>
    </div>
  );
}
