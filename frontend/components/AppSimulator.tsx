"use client";

import { useEffect, useState } from "react";

interface AppSimulatorProps {
  appName: string;
  minutes?: number; // undefined = direct open, no timer
  onComplete: () => void;
}

const APP_GRADIENTS: Record<string, string> = {
  Instagram: "from-yellow-400 via-pink-500 to-purple-600",
  TikTok: "from-gray-900 via-black to-gray-900",
  X: "from-gray-700 to-gray-900",
  YouTube: "from-red-600 to-red-900",
  Facebook: "from-blue-500 to-blue-800",
  Reddit: "from-orange-500 to-orange-700",
  Messages: "from-green-500 to-green-700",
  Music: "from-rose-500 to-pink-800",
  Camera: "from-gray-700 to-gray-900",
  Maps: "from-blue-400 to-teal-600",
  Calendar: "from-red-500 to-red-700",
};

const APP_ICONS: Record<string, string> = {
  Instagram: "📸",
  TikTok: "🎵",
  X: "𝕏",
  YouTube: "▶️",
  Facebook: "👤",
  Reddit: "🤖",
  Messages: "💬",
  Music: "🎧",
  Camera: "📷",
  Maps: "🗺️",
  Calendar: "📅",
};

export default function AppSimulator({ appName, minutes, onComplete }: AppSimulatorProps) {
  const totalSeconds = minutes !== undefined ? minutes * 60 : null;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      onComplete();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s !== null ? s - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, onComplete]);

  const hasTimer = secondsLeft !== null;
  const isNearEnd = hasTimer && secondsLeft < 60;
  const mins = hasTimer && secondsLeft !== null ? Math.floor(secondsLeft / 60) : 0;
  const secs = hasTimer && secondsLeft !== null ? secondsLeft % 60 : 0;
  const timeStr = hasTimer
    ? `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : null;

  const gradient = APP_GRADIENTS[appName] || "from-violet-600 to-indigo-800";
  const icon = APP_ICONS[appName] || "📱";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Same phone shell dimensions so it lines up with the mockup */}
      <div
        className="relative overflow-hidden rounded-[44px] border-4 border-gray-700"
        style={{ width: 320, height: 680 }}
      >
        {/* Dynamic Island — shows timer if timed session, else plain pill */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
          <div
            className={`flex items-center gap-2 px-4 h-8 bg-black rounded-full transition-all duration-500 ${
              isNearEnd ? "ring-1 ring-red-500/60" : hasTimer ? "ring-1 ring-green-500/30" : ""
            }`}
            style={{ minWidth: hasTimer ? 96 : 80 }}
          >
            {hasTimer ? (
              <>
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    isNearEnd ? "bg-red-400 animate-pulse" : "bg-green-400"
                  }`}
                />
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    isNearEnd ? "text-red-300" : "text-white"
                  }`}
                >
                  {timeStr}
                </span>
              </>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-white/40 mx-auto" />
            )}
          </div>
        </div>

        {/* Full-screen app gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)"
          }}
        />

        {/* App icon + name centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="text-8xl drop-shadow-lg">{icon}</div>
          <div className="text-white text-2xl font-semibold tracking-tight">{appName}</div>
          {hasTimer && (
            <div className="text-white/50 text-sm">Your intentional session is running</div>
          )}
        </div>

        {/* Bottom action */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <button
            onClick={onComplete}
            className="text-white/50 hover:text-white/80 text-sm transition px-6 py-2.5 rounded-full bg-black/30 backdrop-blur border border-white/10"
          >
            {hasTimer ? "Done early" : "← Back"}
          </button>
        </div>
      </div>
    </div>
  );
}
