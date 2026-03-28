"use client";

import { useEffect, useState } from "react";

interface TimerOverlayProps {
  appName: string;
  minutes: number;
  onComplete: () => void;
}

const APP_COLORS: Record<string, string> = {
  Instagram: "from-pink-600 to-purple-700",
  TikTok: "from-gray-900 to-black",
  X: "from-gray-800 to-gray-900",
  YouTube: "from-red-700 to-red-900",
  Facebook: "from-blue-600 to-blue-800",
  Reddit: "from-orange-600 to-orange-800",
};

const APP_ICONS: Record<string, string> = {
  Instagram: "📸",
  TikTok: "🎵",
  X: "𝕏",
  YouTube: "▶️",
  Facebook: "👤",
  Reddit: "🤖",
};

export default function TimerOverlay({ appName, minutes, onComplete }: TimerOverlayProps) {
  const totalSeconds = minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, onComplete]);

  const pct = (secondsLeft / totalSeconds) * 100;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const gradient = APP_COLORS[appName] || "from-violet-700 to-indigo-800";

  // SVG circle progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Simulated app bar */}
      <div className={`w-full rounded-2xl bg-gradient-to-br ${gradient} p-5 text-center`}>
        <div className="text-5xl mb-2">{APP_ICONS[appName] || "📱"}</div>
        <div className="text-white font-semibold text-lg">{appName}</div>
        <div className="text-white/60 text-xs mt-1">Your intentional session is running</div>
      </div>

      {/* Circular timer */}
      <div className="relative">
        <svg width="140" height="140" className="-rotate-90">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={secondsLeft < 60 ? "#f87171" : "#34d399"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white text-2xl font-bold tabular-nums">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
          <span className="text-white/50 text-xs">remaining</span>
        </div>
      </div>

      <p className="text-white/60 text-sm text-center px-4">
        You set out to accomplish something. Stay focused — this time is yours.
      </p>

      <button
        onClick={onComplete}
        className="text-white/30 hover:text-white/50 text-xs transition"
      >
        Done early → close session
      </button>
    </div>
  );
}
