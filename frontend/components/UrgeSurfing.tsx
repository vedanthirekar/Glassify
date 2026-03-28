"use client";

import { useEffect, useState, useCallback } from "react";

interface UrgeSurfingProps {
  onComplete: (didSurface: boolean) => void; // true = urge passed, false = still wants to open
}

type Phase = "inhale" | "hold" | "exhale";

const CYCLE: { phase: Phase; duration: number; label: string }[] = [
  { phase: "inhale", duration: 4, label: "Inhale..." },
  { phase: "hold", duration: 4, label: "Hold..." },
  { phase: "exhale", duration: 4, label: "Let it go..." },
];

const TOTAL_SECONDS = 90;

export default function UrgeSurfing({ onComplete }: UrgeSurfingProps) {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [cycleSecond, setCycleSecond] = useState(0); // 0–11 within a 12s cycle
  const [done, setDone] = useState(false);
  const [afterMood, setAfterMood] = useState<number | null>(null);

  const CYCLE_DURATION = CYCLE.reduce((s, c) => s + c.duration, 0); // 12s

  useEffect(() => {
    if (done) return;
    if (secondsLeft <= 0) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => {
      setSecondsLeft((s) => s - 1);
      setCycleSecond((s) => (s + 1) % CYCLE_DURATION);
    }, 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, done, CYCLE_DURATION]);

  // Determine current breath phase
  let elapsed = 0;
  let currentPhase = CYCLE[0];
  for (const c of CYCLE) {
    if (cycleSecond < elapsed + c.duration) {
      currentPhase = c;
      break;
    }
    elapsed += c.duration;
  }

  // Circle animation: scale based on phase
  const circleScale =
    currentPhase.phase === "inhale"
      ? 1 + ((cycleSecond - elapsed) / currentPhase.duration) * 0.4
      : currentPhase.phase === "hold"
      ? 1.4
      : 1.4 - ((cycleSecond - elapsed) / currentPhase.duration) * 0.4;

  const progress = ((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100;

  const MOODS = [
    { value: 1, emoji: "😔" },
    { value: 2, emoji: "😟" },
    { value: 3, emoji: "😐" },
    { value: 4, emoji: "🙂" },
    { value: 5, emoji: "😊" },
  ];

  if (done) {
    return (
      <div className="flex flex-col items-center gap-5 py-4 text-center">
        <div className="text-5xl">🌊</div>
        <div>
          <h3 className="text-white text-lg font-semibold">90 seconds done</h3>
          <p className="text-white/60 text-sm mt-1">How are you feeling now?</p>
        </div>
        <div className="flex gap-3">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setAfterMood(m.value)}
              className={`text-3xl p-2 rounded-2xl transition-all ${
                afterMood === m.value ? "bg-white/30 scale-110" : "hover:bg-white/10"
              }`}
            >
              {m.emoji}
            </button>
          ))}
        </div>
        {afterMood !== null && (
          <div className="w-full space-y-2 animate-in fade-in duration-300">
            {afterMood >= 3 ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-300 text-sm">
                The urge passed. That&apos;s your conscious mind at work. 🌱
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-amber-300 text-sm">
                Still feeling the pull — that&apos;s okay too. You can still choose.
              </div>
            )}
            <button
              onClick={() => onComplete(afterMood >= 3)}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2.5 rounded-xl transition text-sm"
            >
              {afterMood >= 3 ? "Close — I&apos;m good 🙌" : "Open the app anyway"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <div>
        <h3 className="text-white text-lg font-semibold">Urge Surfing</h3>
        <p className="text-white/50 text-xs mt-1">
          Most urges pass in 90 seconds. Breathe with it.
        </p>
      </div>

      {/* Breathing circle */}
      <div className="relative flex items-center justify-center">
        {/* Progress ring */}
        <svg width="160" height="160" className="-rotate-90 absolute">
          <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          <circle
            cx="80"
            cy="80"
            r="72"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 72}`}
            strokeDashoffset={`${2 * Math.PI * 72 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>

        {/* Breathing circle */}
        <div
          className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600/60 to-indigo-600/60 border border-violet-400/30 transition-transform duration-1000 ease-in-out flex items-center justify-center"
          style={{ transform: `scale(${circleScale})` }}
        >
          <span className="text-3xl">🌱</span>
        </div>
      </div>

      {/* Phase label */}
      <div className="space-y-1">
        <p className="text-white text-lg font-light tracking-wide">{currentPhase.label}</p>
        <p className="text-white/40 text-sm">{secondsLeft}s remaining</p>
      </div>

      {/* Skip */}
      <button
        onClick={() => setDone(true)}
        className="text-white/20 hover:text-white/40 text-xs transition"
      >
        Skip to check-in
      </button>
    </div>
  );
}
